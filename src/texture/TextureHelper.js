/**
 * 负责加载纹理资源
 * 支持：全景图片，全景视频（flv，hls，mp4格式）
 */
import Hls from 'hls.js';
import * as THREE from 'three';
import flvjs from 'flv.js/dist/flv.min.js';
import { OS } from '../utils/osuitls';
import EventBus from '../event/EventBus';
import Events from '../event/Events'
import { MediaPlayer } from 'dashjs';
import TiledStreaming from './tiled/TiledStreaming';
/**
 * @class
 * @name TextureHelper
 * @description  负责加载全景背景的纹理数据，由XRManager创建,无法独立创建。支持img,mp4,hls,dash,flv,dash-tile等多种媒体形式，并提供对各类媒体播放的控制接口
 * @param {Element} video h5 video 实例 
 * @return {TextureHelper} 背景纹理管理
 */

class TextureHelper {

    /**
     * @param {video或者图片的载体} containerNode 
     * @param {加载资源的属性集合} resProps 
     */
    constructor(containerNode) {
        this.containerNode = containerNode;
        this.onLoadSuccessHandler = null;
        this.onLoadErrorHandler = null;
        this.videoLoader = null;
        this.resType = 'image'
        this.resUrl = '';
        this.tiledStreaming = null;
    }

    initVideoNode = () => {
        this.containerNode.width = 0;
        this.containerNode.height = 0;
        this.containerNode.loop = true;
        this.containerNode.crossOrigin = "anonymous";
        this.containerNode.autoplay = true;
        this.containerNode.allowsInlineMediaPlayback = true;
        this.containerNode.setAttribute('webkit-playsinline', 'webkit-playsinline');
        this.containerNode.setAttribute('webkit-playsinline', true);
        this.containerNode.setAttribute('playsinline', true)
        this.containerNode.setAttribute('preload', 'auto')
        this.containerNode.setAttribute('x-webkit-airplay', 'allow')
        this.containerNode.setAttribute('x5-playsinline', true)
        this.containerNode.setAttribute('x5-video-player-type', 'h5')
        this.containerNode.setAttribute('x5-video-player-fullscreen', true)
        this.containerNode.setAttribute('x5-video-orientation', 'portrait')
        this.containerNode.setAttribute('style', 'object-fit: fill')
        this.containerNode.setAttribute('loop', "loop")
        this.containerNode.addEventListener('canplay', this.onVideoStarted, true);
    }


    onVideoStarted = () => {
        EventBus.trigger(Events.EVENT_SENCE_RES_READY, { resUrl: this.resUrl });
    }

    getTextureFromVideo = (video) => {
        let texture = new THREE.VideoTexture(video);
        texture.minFilter = THREE.LinearFilter;
        texture.format = THREE.RGBFormat;
        return texture;
    }

    loadFlvVideo = (resUrl) => {
        this.resUrl = resUrl;
        this.initVideoNode();
        if (flvjs.isSupported()) {
            let flvPlayer = flvjs.createPlayer({
                type: 'flv', url: resUrl, isLive: true,
            });
            this.videoLoader = flvPlayer;
            flvPlayer.attachMediaElement(this.containerNode);
            flvPlayer.load();
            flvPlayer.play();
        } else {
            console.error('Your browser does not support flvjs')
            this.onLoadErrorHandler && this.onLoadErrorHandler('设备不支持FLV');
        }
        return this.getTextureFromVideo(this.containerNode);
    }

    loadHlsVideo = (resUrl) => {
        this.resUrl = resUrl;
        this.initVideoNode();
        if (OS.isAndroid() && OS.isWeixin()) {
            var source = this.createTag("source", {
                src: resUrl,
                type: 'application/x-mpegURL'
            }, null);
            this.containerNode.appendChild(source);
        } else if (Hls.isSupported()) {
            var hls = new Hls();
            this.videoLoader = hls;
            hls.loadSource(resUrl);
            hls.attachMedia(this.containerNode);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                this.containerNode.play();
                this.onLoadSuccessHandler();
            });
        } else {
            console.log('设备不支持HLS')
            source = this.createTag("source", {
                src: resUrl,
                type: 'application/x-mpegURL'
            }, null);
            this.containerNode.appendChild(source);
        }
        return this.getTextureFromVideo(this.containerNode);
    }

    createTag = (tag, attr, objs) => {
        var oMeta = document.createElement(tag);
        if (attr && typeof attr === "object") {
            for (var k in attr) {
                oMeta.setAttribute(k, attr[k]);
            }
        }
        if (objs && typeof objs === "object") {
            for (var i in objs) {
                oMeta[i] = objs[i];
            }
        }
        return oMeta;
    }

    loadMp4Video = (resUrl) => {
        this.resUrl = resUrl;
        this.initVideoNode();
        this.containerNode.src = resUrl;
        this.containerNode.load();
        this.containerNode.play();
        return this.getTextureFromVideo(this.containerNode);
    }

    loadImage = (resUrl) => {
        this.resUrl = resUrl;
        var texture = new THREE.TextureLoader().load(resUrl);
        EventBus.trigger(Events.EVENT_SENCE_RES_READY, { resUrl: this.resUrl });
        return texture;
    }

    loadDash = (resUrl) => {
        this.resUrl = resUrl;
        this.initVideoNode();
        this.baseDashPlayer = MediaPlayer().create();
        this.baseDashPlayer.initialize(this.containerNode, resUrl, true);
        this.containerNode.load();
        this.containerNode.play();
        return this.getTextureFromVideo(this.containerNode);
    }

    loadTiledDash = (resUrls) => {
        this.resUrl = resUrls;
        this.initVideoNode();
        this.tiledStreaming = new TiledStreaming(this.containerNode);
        return this.tiledStreaming.loadTiledDash(resUrls);
    }

    loadTexture = (resource) => {
        const { type, res_url } = resource[0];
        this.resType = type;
        this.resUrl = res_url;
        switch (type) {
            case 'hls':
                return this.loadHlsVideo(res_url);
            case 'flv':
                return this.loadFlvVideo(res_url);
            case 'mp4':
                return this.loadMp4Video(res_url);
            case 'image':
                return this.loadImage(res_url);
            case 'dash':
                return this.loadDash(res_url);
            case 'tiled-dash':
                return this.loadTiledDash(res_url);
            default:
                return null;
        }
    }
    /**
     * @function
     * @name TextureHelper#startDisplay
     * @description 开始播放全景背景资源
     */
    startDisplay = () => {
        switch (this.resType) {
            case 'hls':
            case 'mp4':
                this.containerNode && this.containerNode.play();
                break;
            case 'flv':
                this.videoLoader && this.videoLoader.play();
                break;
            case 'dash':
                this.baseDashPlayer && this.baseDashPlayer.play();
                break;
            case 'tiled-dash':
                this.tiledStreaming && this.tiledStreaming.play();
                break;
            default:
                break;
        }
    }
    /**
     * @function
     * @name TextureHelper#pauseDisplay
     * @description 暂停播放全景背景资源
     */
    pauseDisplay = () => {
        switch (this.resType) {
            case 'hls':
            case 'mp4':
                this.containerNode && this.containerNode.pause();
                break;
            case 'flv':
                this.videoLoader && this.videoLoader.pause();
                break;
            case 'dash':
                this.baseDashPlayer && this.baseDashPlayer.pause();
                break;
            case 'tiled-dash':
                this.tiledStreaming && this.tiledStreaming.pause();
                break;
            default:
                break;
        }
    }

    unloadFlvVideo = () => {
        if (this.videoLoader) {
            this.videoLoader.unload();
            this.videoLoader.detachMediaElement();
        }
    }

    unloadHlsVideo = () => {
        if (this.videoLoader) {
            this.videoLoader.stopLoad();
            this.videoLoader.detachMedia();
            this.videoLoader.destroy();
        }
    }

    unloadTiledStream = () => {
        if (this.tiledStreaming) {
            this.tiledStreaming.reset();
            this.tiledStreaming = null;
        }
    }
    /**
     * @function
     * @name TextureHelper#unloadResource
     * @description 卸载全景背景播放资源
     */
    unloadResource = () => {
        switch (this.resType) {
            case 'hls':
                this.unloadHlsVideo();
                break;
            case 'flv':
                this.unloadFlvVideo();
                break;
            case 'mp4':
            case 'image':
                // TODO 是否需要释放资源？？
                break;
            case 'tiled-dash':
                this.unloadTiledStream();
                break;
            default:
                return null;
        }
        this.containerNode.removeEventListener('canplay', this.onVideoStarted);
    }

    update = () => {
        if (this.tiledStreaming) {
            this.tiledStreaming.update();
        }
    }

    /**
     * @function
     * @name TextureHelper#getTextureMediaSource
     * @return {object} 返回全景媒体源，video组件、img组件，dash-tile组件
     */
    getTextureMediaSource = () => {
        switch (this.resType) {
            case 'hls':
            case 'flv':
            case 'mp4':
            case 'dash':
                return this.containerNode;
            case 'tiled-dash':
                return this.tiledStreaming;
            default:
                return null;
        }
    }
}

export default TextureHelper;