/**
 * 负责加载纹理资源
 * 支持：全景图片，全景视频（flv，hls，mp4格式）
 */
import * as HLS from 'hls.js';
import * as THREE from 'three';

class TextureHelper {

    /**
     * @param {video或者图片的载体} containerNode 
     * @param {加载资源的属性集合} resProps 
     */
    constructor(containerNode) {
        this.containerNode = containerNode;
        this.onLoadSuccessHandler = null;
        this.onLoadErrorHandler = null;
    }

    initVideoNode = () => {
        this.containerNode.width = 0;
        this.containerNode.height = 0;
        this.containerNode.loop = true;
        this.containerNode.muted = true;
        this.containerNode.setAttribute('webkit-playsinline', 'webkit-playsinline');
    }

    loaderHLS = (resUrl) => {
        this.initVideoNode();
        if (HLS.isSupported()) {
            var hls = new HLS();
            hls.loadSource(resUrl);
            hls.attachMedia(this.containerNode);
            hls.on(HLS.Events.MANIFEST_PARSED, () => {
                this.containerNode.play();
                this.onLoadSuccessHandler();
            });
        } else {
            console.log('设备不支持HLS')
            this.onLoadErrorHandler('设备不支持HLS');
        }
        let texture = new THREE.VideoTexture(this.containerNode);
        // 添加视频作为纹理，并纹理作为材质
        texture.minFilter = THREE.LinearFilter;
        texture.format = THREE.RGBFormat;
        return texture;
    }
}

export default TextureHelper;