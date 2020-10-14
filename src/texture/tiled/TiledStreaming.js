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
        this.selected = [];
        this.isReady = [];
        this.resUrls = [];
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
        for (let i = 0; i < ids.length; i++) {
            let button = document.getElementById(ids[i]);
            button.onclick = () => {
                this.buttonClick(i);
            }
            this.buttons.push(button);
        }
    }

    buttonClick = (id) => {
        this.selected[id] = !this.selected[id];
        if (this.selected[id]) {
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
        } else {
            let videoNode = this.enhanceVideos[id];
            videoNode.pause();
            let dash = this.enhanceDash[id];
            dash.reset();
            this.enhanceDash[id] = null;
            this.videoMediaAsyns[id] = null;
            this.isReady[id] = false;
        }
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
}

export default TiledStreaming;