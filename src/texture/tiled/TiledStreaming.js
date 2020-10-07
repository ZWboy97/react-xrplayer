import { MediaPlayer } from 'dashjs';
import * as THREE from 'three';

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
        this.canvas = null;
        this.createEnhanceLay();
    }

    createEnhanceLay = () => {
        let xrContainer = document.getElementById("xr-container");
        for (let i = 0; i < 4; i++) {
            let video = document.createElement('video');
            video.style.background = 'black';
            xrContainer.appendChild(video);
            this.enhanceVideos.push(video);
            this.initVideoNode(video, 320, 180);
        }
    }

    loadTiledDash = (resUrl) => {
        this.resUrl = resUrl;
        this.baseDash = MediaPlayer().create();
        this.baseDash.initialize(this.baseVideo, resUrl, true);
        this.baseVideo.load();
        this.baseVideo.play();
        for (let i = 0; i < this.enhanceVideos.length; i++) {
            let videoNode = this.enhanceVideos[i];
            let dash = MediaPlayer().create();
            dash.initialize(videoNode, resUrl, true);
            videoNode.load();
            videoNode.play();
            this.enhanceDash.push(dash);
        }
        this.initCanvas();
        return this.getTextureFromVideo(this.baseVideo);
    }

    getTextureFromVideo = (video) => {
        let texture = new THREE.VideoTexture(video);
        texture.minFilter = THREE.LinearFilter;
        texture.format = THREE.RGBFormat;
        return texture;
    }

    initVideoNode = (videoInstance, width, height) => {
        videoInstance.width = width;
        videoInstance.height = height;
        videoInstance.loop = true;
        videoInstance.crossOrigin = "anonymous";
        videoInstance.autoplay = true;
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
        //videoInstance.addEventListener('canplay', this.onVideoStarted, false);
    }

    initCanvas = () => {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 2560;
        this.canvas.height = 1440;
        this.canvas.style.width = '1280px';
        this.canvas.style.height = '720px';
        let xrContainer = document.getElementById("xr-container");
        xrContainer.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");
        this.ctx.scale(2, 2);
        this.ctx.imageSmoothingQuality = "high";
    }

    updateCanvas = () => {
        if (!this.ctx) {
            return;
        }
        this.ctx.drawImage(this.baseVideo, 0, 0, 1280, 720);
        this.ctx.drawImage(this.enhanceVideos[0], 0, 0, 320, 180);
        this.ctx.drawImage(this.enhanceVideos[1], 320, 0, 320, 180);
        this.ctx.drawImage(this.enhanceVideos[2], 640, 0, 320, 180);
        this.ctx.drawImage(this.enhanceVideos[3], 960, 0, 320, 180);
    }

    update = () => {
        this.updateCanvas();
    }

    play = () => {
    }

    pause = () => {

    }

    reset = () => {

    }
}

export default TiledStreaming;