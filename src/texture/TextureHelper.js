/**
 * 负责加载纹理资源
 * 支持：全景图片，全景视频（flv，hls，mp4格式）
 */
import Hls from 'hls.js';
import * as THREE from 'three';
import flvjs from 'flv.js/dist/flv.min.js';

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
    }

    initVideoNode = () => {
        this.containerNode.width = 0;
        this.containerNode.height = 0;
        this.containerNode.loop = true;
        this.containerNode.muted = true;
        this.containerNode.crossOrigin = "anonymous"
        this.containerNode.setAttribute('webkit-playsinline', 'webkit-playsinline');
    }

    getTextureFromVideo = (video) => {
        let texture = new THREE.VideoTexture(video);
        texture.minFilter = THREE.LinearFilter;
        texture.format = THREE.RGBFormat;
        return texture;
    }

    loadFlvVideo = (resUrl) => {
        this.initVideoNode();
        if (flvjs.isSupported()) {
            let flvPlayer = flvjs.createPlayer({ type: 'flv', url: resUrl });
            this.videoLoader = flvPlayer;
            flvPlayer.attachMediaElement(this.containerNode);
            flvPlayer.load();
            flvPlayer.play();
        } else {
            console.error('Your browser does not support flvjs')
            this.onLoadErrorHandler('设备不支持FLV');
        }
        return this.getTextureFromVideo(this.containerNode);
    }

    loadHlsVideo = (resUrl) => {
        this.initVideoNode();
        if (Hls.isSupported()) {
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
            this.onLoadErrorHandler('设备不支持HLS');
        }
        return this.getTextureFromVideo(this.containerNode);
    }

    loadMp4Video = (resUrl) => {
        this.initVideoNode();
        this.containerNode.src = resUrl;
        this.containerNode.load();
        this.containerNode.play();
        return this.getTextureFromVideo(this.containerNode);
    }

    loadImage = (resUrl) => {
        var texture = new THREE.TextureLoader().load(resUrl);
        return texture;
    }

    unloadFlvVideo = () => {
        if (this.videoLoader) {
            this.videoLoader.unload();
            this.videoLoader.detachMediaElement();
        }
    }

    unloadHlsVideo = () => {
        if (this.videoLoader) {
            this.videoLoader.destory();
        }
    }
}

export default TextureHelper;