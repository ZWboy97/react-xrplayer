/**
 * XR对外的交互通过Manager来提供
 */
import * as THREE from 'three';
import InnerViewControls from '../controls/InnerViewControls';
import SpriteShapeHelper from '../display/SpriteShapeHelper';
import CenterModelHelper from '../display/CenterModelHelper';
import TWEEN from '@tweenjs/tween.js';
import ViewConvertHelper from '../action/ViewConvertHelper';
import TextureHelper from '../texture/TextureHelper';
import SpriteParticleHelper from '../display/SpriteParticleHelper';
import VRHelper from "./VRHelper";
import TextHelper from "./content_Insert_Helper/TextHelper";

import HotSpotHelper from '../display/HotSpotHelper';
import {CameraTween, CameraTweenGroup} from "../controls/CameraTween";

class XRPlayerManager {

    constructor(mount, initProps) {
        this.mount = mount;         // Threejs渲染挂载节点
        this.props = initProps;     // 初始化参数
        this.scene = null;
        this.sceneMesh = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.sceneContainer = null; // 全景背景挂载节点
        this.sceneTextureHelper = null; //全景场景纹理加载控制器

        this.handler = null;

        this.innerViewControls = null;
        this.spriteShapeHelper = null;
        this.spriteParticleHelper = null; // 粒子展示
        this.centerModelHelper = null;
        this.viewConvertHelper = null;
        this.spriteEventList = null;

        this.hotSpotHelper = null;

        this.vrHelper = null;

        this.audio = document.createElement("audio");
        this.audio.preload = "metadata";
        document.body.appendChild(this.audio);

        this.cameraTweenStatus = {
            num: 0,
            paused: false
        };

        this.init();
    }

    init = () => {
        this.initCamera();
        this.initScene();
        this.initRenderer();
        this.initVR();
        this.animate(0);
    }

    initCamera = () => {
        const {
            camera_fov, camera_far, camera_near,
            camera_position: position, camera_target: target
        } = this.props;
        const camera = new THREE.PerspectiveCamera(
            camera_fov, this.mount.clientWidth / this.mount.clientHeight,
            camera_near, camera_far);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer = renderer;
        camera.position.set(position.x, position.y, position.z);
        camera.target = new THREE.Vector3(target.x, target.y, target.z);
        this.camera = camera;
        this.innerViewControls = new InnerViewControls(this.camera);
    }

    initScene = () => {
        const {
            scene_texture_resource: textureResource,
            axes_helper_display: isAxesHelperDisplay
        } = this.props;
        this.sceneContainer = document.getElementById('video')
        let geometry = new THREE.SphereGeometry(500, 80, 40); // 球体
        geometry.scale(-1, 1, 1);
        this.sceneTextureHelper = new TextureHelper(this.sceneContainer);
        let texture = this.sceneTextureHelper.loadTexture(textureResource);
        let material = new THREE.MeshBasicMaterial({ map: texture });
        this.sceneMesh = new THREE.Mesh(geometry, material);
        this.scene = new THREE.Scene();
        this.scene.add(this.sceneMesh);
        if (isAxesHelperDisplay) {
            let axisHelper = new THREE.AxesHelper(1000)//每个轴的长度
            this.scene.add(axisHelper);
        }
        this.scene.add(this.camera);
    }

    initRenderer = () => {
        const renderer = this.renderer;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(this.mount.clientWidth, this.mount.clientHeight);
        renderer.sortObjects = false;
        renderer.autoClear = false;
        this.mount.appendChild(renderer.domElement);
    }

    initVR = () => {
        this.vrHelper = new VRHelper(this.renderer, this.camera);
        this.vrHelper.setObjectInteractionHandler((pickedObject) => {
            console.log('tag', 'params');
            if (!!pickedObject) {
                const key = pickedObject.name;
                if (this.spriteEventList.has(key)) {
                    const data = this.spriteEventList.get(key);
                    this.handler('hot_spot_click', { data });
                }
            }
        })
    }

    animate = (time) => {
        requestAnimationFrame(this.animate);
        if (this.cameraTweenStatus.num === 0)
            this.innerViewControls && this.innerViewControls.update();
        if (this.centerModelHelper) {
            this.centerModelHelper.update();
        }
        if (this.spriteParticleHelper) {
            this.spriteParticleHelper.update();
        }
        if (this.cameraTweenStatus.paused === false)
            TWEEN.update(); // 不要轻易去掉，渐变动画依赖该库
        if (this.vrHelper.vrStatus) {
            time *= 0.001;
            if (this.spriteShapeHelper) {
                let objects = this.spriteShapeHelper.getPointObjects();
                this.vrHelper.updateInteractionObjects(objects, time);
            }
            this.vrHelper.render(this.scene, this.camera);
        } else {
            this.renderer.render(this.scene, this.camera);
        }
        if (this.hotSpotHelper) {
            this.hotSpotHelper.markIconInViews();
            this.hotSpotHelper.update();
        }

    }

    /****************************全景场景相关控制接口************************* */
    setSenceResource = (res) => {
        this.sceneTextureHelper && this.sceneTextureHelper.unloadResource();
        this.sceneTextureHelper = new TextureHelper(this.sceneContainer);
        let texture = this.sceneTextureHelper.loadTexture(res);
        let material = new THREE.MeshBasicMaterial({ map: texture });
        this.sceneMesh.material = material;
    }

    // 背景全景视频播放控制
    startDisplaySenceResource = () => {
        if (this.sceneTextureHelper) {
            this.sceneTextureHelper.startDisplay();
        }
    }
    pauseDisplaySenceResource = () => {
        if (this.sceneTextureHelper) {
            this.sceneTextureHelper.pauseDisplay();
        }
    }

    // 自动旋转相关接口
    getEnableAutoRotate = () => {
        return this.innerViewControls.getEnableAutoRotate();
    }

    setEnableAutoRotate = (enable) => {
        this.innerViewControls.setEnableAutoRotate(enable)
    }

    setAutoRotateSpeed = (speed) => {
        this.innerViewControls.setAutoRotateSpeed(speed);
    }

    setAutoRotateDirection = (direction) => {
        this.innerViewControls.setAutoRotateDirection(direction);
    }

    /****************************热点标签相关控制接口************************* */
    resetHotSpotsData = () => {
        if (!this.spriteShapeHelper) {
            this.spriteEventList = new Map();
            this.spriteShapeHelper = new SpriteShapeHelper(this.scene,
                this.camera, this.renderer);
        } else {
            this.spriteEventList.clear();
        }
    }

    setHotSpots = (hot_spot_list, event_list) => {
        this.resetHotSpotsData();
        this.spriteEventList = new Map(event_list);
        this.spriteShapeHelper.setHotSpotList(hot_spot_list);
        this.spriteShapeHelper.objectClickHandler = (intersects) => {
            const key = intersects[0].object.name;
            if (this.spriteEventList.has(key)) {
                const data = this.spriteEventList.get(key);
                this.handler('hot_spot_click', { data })
            }
            console.log(intersects[0].object.name);
        }
    }

    addHotSpot = (hot_spot, event) => {
        this.spriteShapeHelper.addHotSpot(hot_spot);
        if (event != null && !this.spriteEventList.has(event.key)) {
            this.spriteEventList.set(event.key, event.value);
        }
    }

    removeHotSpot = (hot_spot_key) => {
        this.spriteShapeHelper.removeHotSpot(hot_spot_key);
    }

    /*****************************模型控制相关接口**************************** */

    resetModels = () => {
        if (!this.centerModelHelper) {
            this.centerModelHelper = new CenterModelHelper(this.scene);
        }
    }

    setModels = (model_list) => {
        this.resetModels();
        this.centerModelHelper.loadModelList(model_list);
    }

    addModel = (model_key, model) => {
        this.centerModelHelper.loadModel(model_key, model);
    }

    removeModel = (model_key) => {
        this.centerModelHelper.removeModel(model_key);
    }

    removeAllModel = () => {
        this.centerModelHelper.removeAllModel();
    }


    /**************************相机移动相关接口************************* */

    toNormalView = (durtime = 8000, delay = 0) => {
        if (!this.viewConvertHelper) {
            this.viewConvertHelper = new ViewConvertHelper(this.camera, this.innerViewControls);
        }
        this.innerViewControls.disConnect();
        this.viewConvertHelper.toNormalView(durtime, delay);
    }
    toPlanetView = (durtime = 8000, delay = 0) => {
        if (!this.viewConvertHelper) {
            this.viewConvertHelper = new ViewConvertHelper(this.camera, this.innerViewControls);
        }
        this.innerViewControls.disConnect();
        this.viewConvertHelper.toPlanetView(durtime, delay);
    }

    /**************************相机控制相关接口************************* */
        // 相机控制器开关
    connectCameraControl = () => {
        this.innerViewControls.connect();
    }
    disConnectCameraControl = () => {
        this.innerViewControls.disConnect();
    }

    // 方向传感器控制开关
    getEnableOrientationControls = () => {
        return this.innerViewControls.getEnableOrientationControls();
    }
    enableOrientationControls = () => {
        this.innerViewControls.enableOrientationControls();
    }
    disableOrientationControls = () => {
        this.innerViewControls.disableOrientationControls();
    }

    // 相机位置接口
    getCameraPosition = () => {
        return this.innerViewControls.getCameraPosition();
    }
    setCameraPosition = (x, y, z) => {
        this.innerViewControls.setCameraPosition(x, y, z);
    }

    // 相机当前fov接口
    setCameraFov = (fov) => {
        this.innerViewControls.setCameraFov(fov);
    }
    getCameraFov = () => {
        return this.innerViewControls.getCameraFov();
    }

    // FOV上下范围设置接口
    setFovVerticalScope = (bottom, top) => {
        this.innerViewControls.setFovVerticalScope(bottom, top);
    }
    getFovVerticalScope = () => {
        return this.innerViewControls.getFovVerticalScope();
    }

    /*******************************粒子特效接口********************************** */
    setParticleEffectRes = (res) => {
        if (!this.spriteParticleHelper) {
            this.spriteParticleHelper = new SpriteParticleHelper(this.scene);
        }
        this.spriteParticleHelper.setResource(res);
    }
    getEnableParticleDisplay = () => {
        return this.spriteParticleHelper.getEnableDisplay();
    }
    enableParticleDisplay = (enable) => {
        if (enable) {
            this.spriteParticleHelper.enableDisplay();
        } else {
            this.spriteParticleHelper.disableDisplay();
        }
    }

    /*******************************VR接口********************************** */
    changeVRStatus = () => {
        if (this.vrHelper.vrStatus) {
            this.vrHelper.disable();
            this.renderer.setViewport(0, 0, this.mount.clientWidth, this.mount.clientHeight);
        }
        else {
            this.vrHelper.enable();
        }
    }

    /*******************************文本框接口********************************** */
    createTextBox = (params) => {
        var TextBox = new TextHelper(params);
        TextBox.addTo(this.scene);
        return TextBox;
    }

    showTextBox = (TextBox) => {
        if (!!!TextBox) return;
        TextBox.show();
    }

    hideTextBox = (TextBox) => {
        if (!!!TextBox) return;
        TextBox.hide();
    }

    changeTextBox = (TextBox, params) => {
        if (!!!TextBox) return;
        TextBox.removeFrom(this.scene);
        TextBox.setMessage(params);
        TextBox.addTo(this.scene);
    }

    //使用remove后记得将TextBox设为null，防止内存泄漏
    removeTextBox = (TextBox) => {
        if (TextBox === undefined) return;
        TextBox.removeFrom(this.scene);
    }



    addIcon = (img, position, name, title, width, height) => {
        if (!this.hotSpotHelper) {
            this.hotSpotHelper = new HotSpotHelper(this.scene, this.mount, this.camera);
        }
        const { x, y, z } = position;
        this.hotSpotHelper.markIcon(img, new THREE.Vector3(x, y, z), name, title, width, height);
    }

    removeIcon = (name) => {
        this.hotSpotHelper.removeIcon(name);
    }

    addIcons = (iconList) => {
        this.hotSpotHelper.addIcons(iconList);
    }

    removeAllIcons = () => {
        this.hotSpotHelper.removeAllIcons();
    }

    /********************************音频接口************************************/

    setAudioSrc = (src) => {
        this.audio.setAttribute("src",src);
    }

    getAudioSrc = () => {
        return this.audio.currentSrc;
    }

    setAudioVolume = (volume) => {              // 0 到 1
        this.audio.volume = volume;
    }

    getAudioVolume = () => {
        return this.audio.volume;
    }

    setAudioMuted = (muted) => {                // true 或 false
        this.audio.muted = muted;
    }

    getAudioMuted = () => {
        return this.audio.muted;
    }

    getAudioPaused = () => {
        return this.audio.paused;
    }

    pauseAudio = () => {
        this.audio.pause();
    }

    playAudio = () => {
        this.audio.play();
    }

    replayAudio = () => {
        this.audio.currentTime = 0;
    }

    endAudio = () => {
        this.audio.currentTime = this.audio.duration;
    }

    /****************************相机动画接口***********************************/
    /*
    设置动画流程（示例见app.js）：
        1.  通过setCameraAnimation获取动画各部分的cameraTween
        2.  通过setCameraAnimationGroup连接各动画
    为防止不必要的bug，请遵循以下播放注意事项：（可以在以后设计UI时通过隐藏button或使button失效防止这一类问题产生）
        1.  startCameraAnimationGroup后才可调用stop，pause，play等功能
        2.  stop或自动结束之后再调用start重播
    params的格式:
    {
        pos0, pos1, duration,           必需
        easing, callback                非必需（easing是速度变化的方式，详见https://www.createjs.com/docs/tweenjs/classes/Ease.html）
    }
    pos0、pos1的格式
    {
        lat, lon,                       必需
        fov                             非必需
    }或
    {
        x, y, z,                        必需
        fov                             非必需
    }
    */
    setCameraAnimation = (params) => {                      //因为存在入场动画，导致设置相机动画时distance是450，这里直接改为100
        var cameraTween = new CameraTween(params, this.camera, 100, this.innerViewControls.fovDownEdge, this.innerViewControls.fovTopEdge, this.innerViewControls.initSphericalData, this.cameraTweenStatus);
        return cameraTween;
    }

    setCameraAnimationGroup = (cameraTweens, loop) => {
        if (!!!loop) {
            loop = false;
        }
        var cameraTweenGroup = new CameraTweenGroup(cameraTweens, loop, this.camera, 100, this.innerViewControls.fovDownEdge, this.innerViewControls.fovTopEdge, this.innerViewControls.initSphericalData, this.cameraTweenStatus);
        return cameraTweenGroup;
    }

    startCameraAnimationGroup = (cameraAnimationGroup, time) => {
        if(!!!time) cameraAnimationGroup.start();
        else cameraAnimationGroup.start(time);
    }

    stopCameraAnimationGroup = (cameraAnimationGroup) => {
        cameraAnimationGroup.stop();
    }

    pauseCameraAnimationGroup = (cameraAnimationGroup) => {
        cameraAnimationGroup.pause();
    }

    playCameraAnimationGroup = (cameraAnimationGroup) => {
        cameraAnimationGroup.play();
    }

    /*******************************其他接口********************************** */
    onWindowResize = (mountWidth, mountHeight) => {
        this.camera.aspect = mountWidth / mountHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(mountWidth, mountHeight);
    }

    destroy = () => {
        this.mount.removeChild(this.renderer.domElement)
        this.sceneTextureHelper && this.sceneTextureHelper.unloadResource();
    }
}

export default XRPlayerManager;