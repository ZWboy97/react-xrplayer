import EmbeddedBox from "./EmbeddedBox";
import * as THREE from "three";

class EmbeddedVideoBox extends EmbeddedBox{
    constructor(id) {
        super(id, 'video');
        this.url = '';
        this.width = 30;
        this.height = 30;
        this.autoplay = false;
        this.poster = 'url';

        this.update();
    }

    setVideo = (url, width, height) => {
        this.url = url;
        this.width = width;
        this.height = height;

        this.update();
    }

    setVideoSize = (width, height) => {
        this.width = width;
        this.height = height;

        this.update();
    }

    setEnableDisplay = (enable) => {
        this.autoplay = enable;
        this.play();
    }

    play = () => {
        this.videoElement && this.videoElement.play();
    }

    pause = () => {
        this.videoElement && this.videoElement.pause();
    }

    //内部控制
    newPlaneMaterial = () => {
        this.videoElement && this.kill();
        this.videoElement = document.createElement("video");
        this.videoElement.src = this.url;
        if (this.autoplay === true)
            this.videoElement.autoplay = 'autoplay';
        let texture = new THREE.VideoTexture(this.videoElement);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBFormat;
        let planeMaterial = new THREE.MeshBasicMaterial({map: texture});
        planeMaterial.depthTest = this.depthTest;
        planeMaterial.needsUpdate = true;
        planeMaterial.map.needsUpdate = true;
        planeMaterial.transparent = true;
        planeMaterial.opacity = 1;

        return planeMaterial;
    }

    update = () => {
        this.createPlane();
        this.manager && this.manager.updateDisplay(this);
    }

    kill = () => {
        this.videoElement.src = '';
    }
}

export default EmbeddedVideoBox;