import * as THREE from 'three';
import InnerViewControls from '../controls/InnerViewControls';
import SpriteShapeHelper from '../display/SpriteShapeHelper';
import CenterModelHelper from '../display/CenterModelHelper';
import TWEEN from '@tweenjs/tween.js';
import ViewConvertHelper from '../action/ViewConvertHelper';
import TextureHelper from '../texture/TextureHelper';
import SpriteParticleHelper from '../display/SpriteParticleHelper';
import VRHelper from "./VRHelper";
import CameraMoveAction from "../action/CameraMoveAction";

import HotSpotHelper from '../display/HotSpotHelper';
import { CameraTween, CameraTweenGroup } from "../controls/CameraTween";
import EmbeddedBoxManager from "../display/ResourceBox/EmbeddedResource/EmbeddedBoxManager";
import EmbeddedTextBox from "../display/ResourceBox/EmbeddedResource/EmbeddedTextBox";
import EmbeddedImageBox from "../display/ResourceBox/EmbeddedResource/EmbeddedImageBox";
import EmbeddedVideoBox from "../display/ResourceBox/EmbeddedResource/EmbeddedVideoBox";

/**
 * @class
 * @name XRPlayerManager
 * @description  XR对外的交互通过Manager来提供
 * @param {Element} mount Three.js 渲染过载节点
 * @param {Object} initProps 初始化参数
 * @param {Function} handler 统一的事件处理
 * @return {XRPlayerManger} 管理器实例
 * @example
 * // 将在播放器创建完成之后，回调onCreated方法，参数为xrManager实例
 * // 之后便可以在应用中通过xrManager来操作播放器
 * <XRPlayer>
 *      onCreated={(xrManager)=>{this.manager = xrManager}}
 * </XRPlayer>
 */

class XRPlayerManager {

    constructor(mount, initProps, handler) {
        this.mount = mount;         // Threejs渲染挂载节点
        this.props = initProps;     // 初始化参数
        this.handler = handler;

        this.scene = null;
        this.sceneMesh = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.sceneContainer = null; // 全景背景挂载节点
        this.sceneTextureHelper = null; //全景场景纹理加载控制器


        this.innerViewControls = null;
        this.spriteShapeHelper = null;
        this.spriteParticleHelper = null; // 粒子展示
        this.centerModelHelper = null;
        this.viewConvertHelper = null;
        this.spriteEventList = null;

        this.hotSpotHelper = null;

        this.vrHelper = null;

        // audio related
        this.audio = document.createElement("audio");
        this.audio.preload = "metadata";
        document.body.appendChild(this.audio);

        // camera animation related
        this.cameraTweenStatus = {
            num: 0,
            paused: false
        };
        this.cameraTweenGroup = null;

        this.onCameraAnimationEnded = null;

        this.textHelper = null;
        this.textBoxes = new Set();

        this.init();
    }

    init = () => {
        this.initCamera();
        this.initScene();
        this.initRenderer();
        this.initVR();
        this.initTextHelper();
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
            axes_helper_display: isAxesHelperDisplay,
        } = this.props;
        const { panoramic_type = '360', radius = 500, height = 1000 } = textureResource;
        this.sceneContainer = document.getElementById('video');
        let geometry;
        if (panoramic_type === '180') {
            geometry = new THREE.CylinderGeometry(radius, radius, height, 40, 40, true); // 球体
        } else {
            geometry = new THREE.SphereBufferGeometry(radius, 80, 40); // 球体
        }
        geometry.scale(-1, 1, 1);
        this.sceneTextureHelper = new TextureHelper(this.sceneContainer);
        this.sceneTextureHelper.onCanPlayHandler = (resUrl) => this.handler('sence_res_ready', { resUrl: resUrl });
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
            if (!!pickedObject) {
                const key = pickedObject.name;
                this.emitEvent(key, () => {
                    this.closeEffectContainer();
                });
            }
        })
    }

    initTextHelper = () => {
        // this.textHelper = new ResourceBoxHelper(this.innerViewControls.camera, this.renderer, this.sceneMesh, this.innerViewControls, this.mount);
        this.embeddedBoxManager = new EmbeddedBoxManager(this);
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
            this.hotSpotHelper.update();
        }
        if (this.spriteShapeHelper) {
            this.spriteShapeHelper.update();
        }
        this.textHelper && this.textHelper.update();
        this.embeddedBoxManager && this.embeddedBoxManager.update();
    }

    /*****************************全局接口************************************ */
    /**
     * @function
     * @name XRPlayerManager#setGlobalMuted
     * @description 设置全局静音，会生成global_muted事件
     * @param {boolean} muted 是否静音
     */
    setGlobalMuted = (muted) => {
        this.handler('global_muted', { muted: muted });
    }
    /**
     * @function
     * @name XRPlayerManager#setGlobalVolume
     * @description 设置全局音量大小，会生成global_volume事件
     * @param {int} volume 音量大小
     */
    setGlobalVolume = (volume) => {
        this.handler('global_volume', { volume: volume });
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
                this.camera, this.renderer, this.mount);
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
            this.emitEvent(key, () => {
                this.closeEffectContainer();
            })
        }
        this.spriteShapeHelper.tagClickHandler = (key) => {
            this.emitEvent(key, () => {
                this.closeEffectContainer();
            })
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

    setIsTipVisible = (enable) => {
        this.spriteShapeHelper.setIsTipVisible(enable);
    }

    setHotSpotClickable = (enable) => {
        this.spriteShapeHelper.setHotSpotClickable(enable);
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

    moveCameraTo = (descPos, onStart, onEnd, duration = 5000) => {
        var cameraMoveAction = new CameraMoveAction(this.camera, descPos, duration, 0);
        cameraMoveAction.onStartHandler = () => {
            this.innerViewControls && this.innerViewControls.disConnect();
            onStart && onStart();
        }
        cameraMoveAction.onCompleteHandler = () => {
            this.innerViewControls && this.innerViewControls.connect();
            onEnd && onEnd();
        }
        cameraMoveAction.start();
    }

    /**************************相机控制相关接口************************* */
    // 相机控制器开关
    /**
    * @function
    * @name XRPlayerManager#connectCameraControl
    * @description 连接相机视角控制器，视角可以通过鼠标等方式调整
    */
    connectCameraControl = () => {
        this.innerViewControls.connect();
    }
    /**
    * @function
    * @name XRPlayerManager#disConnectCameraControl
    * @description 关闭连接器，无法通过鼠标方式调整视野
    */
    disConnectCameraControl = () => {
        this.innerViewControls.disConnect();
    }
    /**
     * @function
     * @name XRPlayerManager#enableKeyControl
     * @description 视口开启键盘控制相机视角
     * @param {boolean} enable
     */
    enableKeyControl = (enable) => {
        this.innerViewControls.enableKeyControl(enable);
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
    getCameraLatLon = () => {
        const position = this.getCameraPosition();
        const spherical = new THREE.Spherical();
        spherical.setFromCartesianCoords(position.x, position.y, position.z);
        var phi = spherical.phi;
        var theta = spherical.theta;
        var lon = THREE.Math.radToDeg(theta);
        var lat = THREE.Math.radToDeg(phi);
        return {
            lat: lat,
            lon: lon
        }
    }

    // 相机当前fov接口
    setCameraFov = (fov) => {
        this.innerViewControls.setCameraFov(fov);
    }
    getCameraFov = () => {
        return this.innerViewControls.getCameraFov();
    }

    enableChangeFov = (enable) => {
        this.innerViewControls.enableChangeFov(enable);
    }

    // FOV上下范围设置接口
    setFovVerticalScope = (bottom, top) => {
        this.innerViewControls.setFovVerticalScope(bottom, top);
    }
    getFovVerticalScope = () => {
        return this.innerViewControls.getFovVerticalScope();
    }

    // FOV左右范围设置接口
    setFovHorizontalScope = (left, right) => {
        this.innerViewControls.setFovHorizontalScope(left, right);
    }
    getFovHorizontalScope = () => {
        return this.innerViewControls.getFovHorizontalScope();
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

    /*******************************嵌入式文本框接口***************************** */
    getEmbeddedBoxManager = () => {
        return this.embeddedBoxManager;
    }

    simpleCreateTextBox = (boxId) => { //在相机聚焦位置创建一个初始文本框
        let textBox = new EmbeddedTextBox(boxId);
        textBox.setText('简易文本框');
        let position = this.getCameraPosition().clone().normalize().multiplyScalar(-500);
        const spherical = new THREE.Spherical();
        spherical.setFromCartesianCoords(position.x, position.y, position.z);
        let phi = spherical.phi;
        let theta = spherical.theta;
        let lon = 90 - THREE.Math.radToDeg(theta);
        let lat = 90 - THREE.Math.radToDeg(phi);
        textBox.setPosition(lat, lon);
        return textBox;
    }

    simpleCreateImageBox = (boxId) => { //在相机聚焦位置创建一个初始图片框
        let textBox = new EmbeddedImageBox(boxId);
        let position = this.getCameraPosition().clone().normalize().multiplyScalar(-500);
        const spherical = new THREE.Spherical();
        spherical.setFromCartesianCoords(position.x, position.y, position.z);
        let phi = spherical.phi;
        let theta = spherical.theta;
        let lon = 90 - THREE.Math.radToDeg(theta);
        let lat = 90 - THREE.Math.radToDeg(phi);
        textBox.setPosition(lat, lon);
        return textBox;
    }

    simpleCreateVideoBox = (boxId) => { //在相机聚焦位置创建一个初始视频框
        let textBox = new EmbeddedVideoBox(boxId);
        let position = this.getCameraPosition().clone().normalize().multiplyScalar(-500);
        const spherical = new THREE.Spherical();
        spherical.setFromCartesianCoords(position.x, position.y, position.z);
        let phi = spherical.phi;
        let theta = spherical.theta;
        let lon = 90 - THREE.Math.radToDeg(theta);
        let lat = 90 - THREE.Math.radToDeg(phi);
        textBox.setPosition(lat, lon);
        return textBox;
    }

    //快捷设置嵌入文本框的点击事件，如展示图片、视频、网页
    simpleSetEmbeddedBoxEvent = (boxId, data) => {
        let textBox = this.getEmbeddedBoxManager().getEmbeddedBox(boxId);
        if (!!!textBox) return;
        textBox.onClick(() => {
            this.handler(data.type, { data }, () => {
                this.closeEffectContainer();
            });
        });
    }

    /*******************************文本框接口********************************** */
    setTextBoxText = (boxId, message) => {    //改变文本框的内容
        var params = {};
        params.message = message;
        this.textHelper.changeTextBox(boxId, params, this.scene);
    }

    setTextBoxSize = (boxId, width, height) => {    //改变文本框的宽高
        var params = {};
        params.borderWidth = width;
        params.borderHeight = height;
        this.textHelper.changeTextBox(boxId, params, this.scene);
    }

    createTextBox = (boxId, params) => {
        params.cameraPosition = this.getCameraPosition();
        return this.textHelper.createTextBox(boxId, params, this.scene);
    }

    showTextBox = (boxId) => {
        this.textHelper.showTextBox(boxId);
    }

    hideTextBox = (boxId) => {
        this.textHelper.hideTextBox(boxId);
    }

    changeTextBox = (boxId, params) => {
        this.textHelper.changeTextBox(boxId, params, this.scene);
    }

    //使用remove后记得将TextBox设为null，防止内存泄漏
    removeTextBox = (boxId) => {
        this.textHelper.removeTextBox(boxId, this.scene);
    }

    textBoxPlayVideo = (boxId) => {
        this.textHelper.playVideo(boxId);
    }

    textBoxPauseVideo = (boxId) => {
        this.textHelper.pauseVideo(boxId);
    }

    setTextBoxVideoVolume = (boxId, volume) => {
        this.textHelper.setVideoVolume(boxId, volume);
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

    initAudio = () => {
        if (!this.audio) {
            this.audio = document.createElement("audio");
            this.audio.preload = "metadata";
            document.body.appendChild(this.audio);
            this.audio.onended = () => {
                console.log('audio', "播放结束");
            }
        }
    }

    setAudioSrc = (src) => {
        this.audio.setAttribute("src", src);
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

    playAudioRes = (src) => {
        this.setAudioSrc(src);
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
        1.  通过createCameraAnimation获取动画各部分的cameraTween
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
    createCameraTweenGroup = (animationList, loop) => {
        if (!!!loop) {
            loop = false;
        }
        let cameraTweens = [];
        animationList.forEach((item, index) => {
            var animation = this.createCameraAnimation(item);
            cameraTweens.push(animation);
        });
        var cameraTweenGroup = new CameraTweenGroup(cameraTweens,
            100, this.innerViewControls);
        cameraTweenGroup.onCameraAnimationEnded = (key) => {
            this.onCameraAnimationEnded &&
                this.onCameraAnimationEnded(key);

        }
        cameraTweenGroup.onCameraAnimationStart = (key) => {
            this.onCameraAnimationStart &&
                this.onCameraAnimationStart(key);
        }
        cameraTweenGroup.onCameraAnimationStop = (key) => {
            this.onCameraAnimationStop &&
                this.onCameraAnimationStop(key);
        }
        this.cameraTweenGroup = cameraTweenGroup;
        return cameraTweenGroup;
    }

    createCameraAnimation = (params) => {  //因为存在入场动画，导致设置相机动画时distance是450，这里直接改为100
        var cameraTween = new CameraTween(params, this.camera, 100,
            this.innerViewControls, this.cameraTweenStatus);
        cameraTween.key = params.key;
        return cameraTween;
    }

    setCameraTweenGroup = (cameraTweenGroup) => {
        this.cameraTweenGroup = cameraTweenGroup;
    }

    getCameraTweenGroup = () => {
        return this.cameraTweenGroup;
    }

    startCameraTweenGroup = (time) => {
        if (!this.cameraTweenGroup) {
            return;
        }
        if (!!!time) {
            this.cameraTweenGroup.start();
        }
        else {
            this.cameraTweenGroup.start(time);
        }
    }

    stopCameraTweenGroup = () => {
        this.cameraTweenGroup && this.cameraTweenGroup.stop();
    }

    pauseCameraTweenGroup = () => {
        this.cameraTweenGroup && this.cameraTweenGroup.pause();
    }

    playCameraTweenGroup = () => {
        this.cameraTweenGroup && this.cameraTweenGroup.play();
    }

    nextCameraTween = () => {
        this.cameraTweenGroup && this.cameraTweenGroup.next();
    }

    enableCameraTweenGroupAutoNext = (enable) => {
        this.cameraTweenGroup.enableAutoNext(enable);
    }

    enableCameraTweenGroupLoop = (enable) => {
        this.cameraTweenGroup.enableLoop(enable);
    }

    emitEvent = (eventKey, callback = () => { }) => {
        if (this.spriteEventList && this.spriteEventList.has(eventKey)) {
            const data = this.spriteEventList.get(eventKey);
            this.handler(data.type, { data }, () => {
                callback();
            })
        } else {
            callback();
        }
    }

    closeEffectContainer = () => {
        this.handler('close_effect_container');
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

    spherical2Cartesian = (lat, lon, distance) => {
        let pos = { x: 0, y: 0, z: 0 };
        const phi = THREE.Math.degToRad(90 - lat);
        const theta = THREE.Math.degToRad(lon);
        pos.x = distance * Math.sin(phi) * Math.cos(theta);
        pos.y = distance * Math.cos(phi);
        pos.z = distance * Math.sin(phi) * Math.sin(theta);
        return pos;
    }
}

export default XRPlayerManager;