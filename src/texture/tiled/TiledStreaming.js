import { MediaPlayer } from 'dashjs';
import * as THREE from 'three';
import TIMINGSRC from 'TIMINGSRC';
import MCorp from 'MCorp';

/**
 * @class
 * @description 基于Dash-SRD实现全景视频的分块传输，实验特性
 */
class TiledStreaming {

    constructor(baseVideo) {
        this.baseVideo = baseVideo;
        this.baseDash = null;
        this.enhanceVideos = [];
        this.enhanceDash = [];
        this.videoMediaAsyns = [];
        this.canvas = null;
        this.timingAsynSrc = null;
        this.buttons = [];
        this.selected = []; // 某个块是否被选中，后期需要升级为被选中哪个版本的块
        this.isReady = [];  // 该块的视频是否加载成功
        this.resUrls = [];

        this.x = 0;
        this.y = 0;

        this.loadedTileId = -1; // TODO 临时的，记录上次已经加载的tile

        this.detectCounter = 0;

        this.createEnhanceLay();
        this.initSelectedButton();
    }

    initSelectedButton = () => {
        let ids = [
            'tile0-0', 'tile1-0', 'tile2-0', 'tile3-0',
            'tile0-1', 'tile1-1', 'tile2-1', 'tile3-1',
            'tile0-2', 'tile1-2', 'tile2-2', 'tile3-2'
        ]
        this.selected = [
            false, false, false, false,
            false, false, false, false,
            false, false, false, false
        ]
        this.isReady = [
            false, false, false, false,
            false, false, false, false,
            false, false, false, false
        ]
        this.tileCenter = [
            [0.167, 0.125], [0.167, 0.375], [0.167, 0.625], [0.167, 0.875],
            [0.5, 0.125], [0.5, 0.375], [0.5, 0.625], [0.5, 0.875],
            [0.833, 0.125], [0.833, 0.375], [0.833, 0.625], [0.833, 0.875]
        ]
        for (let i = 0; i < ids.length; i++) {
            let button = document.getElementById(ids[i]);
            button.onclick = () => {
                if (this.selected[i]) {
                    this.unloadTile(i);
                } else {
                    this.loadTile(i, 1);
                }
            }
            this.buttons.push(button);
        }
    }

    /**
     * @function
     * @name TiledStreaming#loadTile
     * @param {number} id , tile分开的编号  
     * @param {number} level, 加载分块的质量级别 
     */
    loadTile = (id, level) => {
        console.log('load', id);
        let video = document.createElement('video');
        video.style.background = 'black';
        video.currentTime = this.baseVideo.currentTime;
        video.oncanplay = () => {
            this.isReady[id] = true;
        }
        this.initVideoNode(video, 320, 180);
        this.enhanceVideos[id] = video;
        let dash = MediaPlayer().create();
        dash.initialize(video, this.resUrls[id + 1], true);
        video.load();
        video.play();
        this.enhanceDash[id] = dash;
        let asyn = new MCorp.mediaSync(this.enhanceVideos[id], this.timingAsynSrc);
        this.videoMediaAsyns[id] = asyn;
        this.selected[id] = true;
    }

    /**
     * @function
     * @name TiledStreaming#unloadTile
     * @param {number} id, 写在分块的编号 
     */
    unloadTile = (id) => {
        let videoNode = this.enhanceVideos[id];
        videoNode.pause();
        let dash = this.enhanceDash[id];
        dash.reset();
        this.enhanceDash[id] = null;
        this.videoMediaAsyns[id] = null;
        this.isReady[id] = false;
        this.selected[id] = false;
    }

    createEnhanceLay = () => {
        for (let i = 0; i < 12; i++) {
            this.enhanceVideos.push(null);
            this.enhanceDash.push(null);
            this.videoMediaAsyns.push(null);
        }
    }

    loadTiledDash = (resUrls) => {
        this.resUrls = resUrls;
        this.baseDash = MediaPlayer().create();
        this.baseDash.initialize(this.baseVideo, resUrls[0], true);
        this.baseVideo.load();
        this.baseVideo.play();
        this.timingAsynSrc = new TIMINGSRC.TimingObject({
            position: this.baseVideo.currentTime,
        });
        this.initCanvas();
        return this.getTextureFromVideo();
    }

    getTextureFromVideo = () => {
        this.texture = new THREE.CanvasTexture(this.canvas);
        this.texture.needsUpdate = true;
        return this.texture;
    }

    initVideoNode = (videoInstance, width, height) => {
        videoInstance.width = width;
        videoInstance.height = height;
        videoInstance.loop = true;
        videoInstance.crossOrigin = "anonymous";
        videoInstance.autoplay = true;
        videoInstance.muted = true;
        videoInstance.allowsInlineMediaPlayback = true;
        videoInstance.setAttribute('webkit-playsinline', 'webkit-playsinline');
        videoInstance.setAttribute('webkit-playsinline', true);
        videoInstance.setAttribute('playsinline', true)
        videoInstance.setAttribute('preload', 'auto')
        videoInstance.setAttribute('x-webkit-airplay', 'allow')
        videoInstance.setAttribute('x5-playsinline', true)
        videoInstance.setAttribute('x5-video-player-type', 'h5')
        videoInstance.setAttribute('x5-video-player-fullscreen', true)
        videoInstance.setAttribute('x5-video-orientation', 'portrait')
        videoInstance.setAttribute('style', 'object-fit: fill')
        videoInstance.setAttribute('loop', "loop")
        videoInstance.addEventListener('canplay', this.onVideoStarted, false);
    }

    onVideoStarted = () => {
        if (this.timingAsynSrc) {
            this.timingAsynSrc.update({
                position: this.baseVideo.currentTime,
                velocity: 1.0
            });
        }
    }

    initCanvas = () => {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 2048;
        this.canvas.height = 1024;
        this.canvas.style.width = '1024px';
        this.canvas.style.height = '512px';
        // TODO 测试使用
        let xrContainer = document.getElementById("operation");
        xrContainer.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");
        this.ctx.scale(2, 2);
        this.ctx.imageSmoothingQuality = "high";
    }

    updateCanvas = () => {
        if (!this.ctx) {
            return;
        }
        this.ctx.strokeStyle = "rgb(102, 255, 102)";
        this.ctx.drawImage(this.baseVideo, 0, 0, 1024, 512);
        if (this.selected[0] && this.isReady[0]) {
            this.ctx.drawImage(this.enhanceVideos[0], 0, 0, 256, 170);
            this.ctx.strokeRect(0, 0, 256, 170);
        }
        if (this.selected[1] && this.isReady[1]) {
            this.ctx.drawImage(this.enhanceVideos[1], 256, 0, 256, 170);
            this.ctx.strokeRect(256, 0, 256, 170);
        }
        if (this.selected[2] && this.isReady[2]) {
            this.ctx.drawImage(this.enhanceVideos[2], 512, 0, 256, 170);
            this.ctx.strokeRect(512, 0, 256, 170);
        }
        if (this.selected[3] && this.isReady[3]) {
            this.ctx.drawImage(this.enhanceVideos[3], 768, 0, 256, 170);
            this.ctx.strokeRect(768, 0, 256, 170);
        }
        if (this.selected[4] && this.isReady[4]) {
            this.ctx.drawImage(this.enhanceVideos[4], 0, 170, 256, 170);
            this.ctx.strokeRect(0, 170, 256, 170);
        }
        if (this.selected[5] && this.isReady[5]) {
            this.ctx.drawImage(this.enhanceVideos[5], 256, 170, 256, 170);
            this.ctx.strokeRect(256, 170, 256, 170);
        }
        if (this.selected[6] && this.isReady[6]) {
            this.ctx.drawImage(this.enhanceVideos[6], 512, 170, 256, 170);
            this.ctx.strokeRect(512, 170, 256, 170);
        }
        if (this.selected[7] && this.isReady[7]) {
            this.ctx.drawImage(this.enhanceVideos[7], 768, 170, 256, 170);
            this.ctx.strokeRect(768, 170, 256, 170);
        }
        if (this.selected[8] && this.isReady[8]) {
            this.ctx.drawImage(this.enhanceVideos[8], 0, 340, 256, 170);
            this.ctx.strokeRect(0, 340, 256, 170);
        }
        if (this.selected[9] && this.isReady[9]) {
            this.ctx.drawImage(this.enhanceVideos[9], 256, 340, 256, 170);
            this.ctx.strokeRect(256, 340, 256, 170);
        }
        if (this.selected[10] && this.isReady[10]) {
            this.ctx.drawImage(this.enhanceVideos[10], 512, 340, 256, 170);
            this.ctx.strokeRect(512, 340, 256, 170);
        }
        if (this.selected[11] && this.isReady[11]) {
            this.ctx.drawImage(this.enhanceVideos[11], 768, 340, 256, 170);
            this.ctx.strokeRect(768, 340, 256, 170);
        }
    }

    update = () => {
        this.updateCanvas();
        if (this.texture) {
            this.texture.needsUpdate = true;
        }
    }

    play = () => {
    }

    pause = () => {

    }

    reset = () => {

    }

    /**
     * @function
     * @name TiledStreaming#
     * @description
     */
    onCameraPositionUpdate = (lat, lon) => {
        this.updateCameraPosXY(lat, lon);
        console.log('x,y', this.x, this.y);
        let id = this.getTileId(lat, lon);
        if (this.detectCounter < 2) {
            this.detectCounter++;
            return;
        } else {
            this.detectCounter = 0;
        }
        for (let i = 0; i < this.tileCenter.length; i++) {
            let disSqure = this.getCenterDistanceSqure(i);
            if (disSqure <= 0.1) {
                if (this.selected[i] !== true) {
                    this.loadTile(i, 1);
                }
            } else {
                if (this.selected[i] === true) {
                    this.unloadTile(i);
                }
            }
        }
        // if (this.loadedTileId === id) {
        //     return;
        // }
        // if (this.loadedTileId !== -1) {
        //     this.unloadTile(this.loadedTileId)
        // }
        // TODO 优化这里的分块选择逻辑，目前只是简单的通过视点中心位置来选择
        // 与视点中心的距离
        // 预测可能性，预测未来窗口时长，预测准确度
        // 黑块率：各个块的质量要均衡
        // 与以选择块的质量差
        // this.loadTile(id, 1);
        // this.loadedTileId = id;
    }
    updateCameraPosXY = (lat, lon) => {
        this.x = (180 - lat) / 180;
        this.y = (lon + 180) / 360;
    }
    getCenterDistanceSqure = (id) => {
        let tileX = this.tileCenter[id][0];
        let tileY = this.tileCenter[id][1];
        return Math.pow(this.x - tileX, 2) + Math.pow(this.y - tileY, 2);
    }
    getTileId = (lat, lon) => {
        let x = this.getTileX(lat);
        let y = this.getTileY(lon);
        console.log('x', x, 'y', y);
        return x * 4 + y;
    }
    getTileX = (lat) => {
        if (lat >= 120) {
            return 0;
        } else if (lat <= 60) {
            return 2;
        } else {
            return 1;
        }
    }

    getTileY = (lon) => {
        if (lon <= -90) {
            return 0;
        } else if (lon > -90 && lon <= 0) {
            return 1;
        } else if (lon > 0 && lon <= 90) {
            return 2;
        } else if (lon > 90 && lon <= 180) {
            return 3;
        }
    }



}

export default TiledStreaming;