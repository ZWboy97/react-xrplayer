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

class XRPlayerManager {

    constructor(mount, initProps) {
        this.mount = mount;         // Threejs渲染挂载节点
        this.props = initProps;     // 初始化参数
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.sceneContainer = null; // 全景背景挂载节点

        this.innerView = true;      // 是否是内视角，之后想做多场景切换
        this.innerViewControls = null;
        this.spriteShapeHelper = null;
        this.centerModelHelper = null;
        this.viewConvertHelper = null;
        this.spriteData = null;
        this.init();
    }

    init = () => {
        this.initCamera();
        this.initScene();
        this.initRenderer();
        this.animate();
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
        let geometry = new THREE.SphereGeometry(500, 60, 40); // 球体
        geometry.scale(-1, 1, 1);
        const textureHelper = new TextureHelper(this.sceneContainer);
        let texture = textureHelper.loadTexture(textureResource);
        let material = new THREE.MeshBasicMaterial({ map: texture });
        let mesh = new THREE.Mesh(geometry, material);
        this.scene = new THREE.Scene();
        this.scene.add(mesh);
        if (isAxesHelperDisplay) {
            let axisHelper = new THREE.AxesHelper(1000)//每个轴的长度
            this.scene.add(axisHelper);
        }
    }

    initRenderer = () => {
        const renderer = this.renderer;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(this.mount.clientWidth, this.mount.clientHeight);
        renderer.sortObjects = false;
        renderer.autoClear = false;
        this.mount.appendChild(renderer.domElement);
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        if (this.innerView) {
            this.innerViewControls && this.innerViewControls.update();
        } else {
            //this.controls.update();
        }
        if (this.centerModelHelper) {
            this.centerModelHelper.update();
        }
        TWEEN.update(); // 不要轻易去掉，渐变动画依赖该库
        this.renderer.render(this.scene, this.camera);
    }

    /****************************热点标签相关控制接口************************* */
    setHotSpots = (hot_spot_list, event_list) => {
        this.spriteData = new Map(event_list);
        this.spriteShapeHelper = new SpriteShapeHelper(this.scene, this.camera, this.renderer);
        this.spriteShapeHelper.setPointList(hot_spot_list);
        this.spriteShapeHelper.objectClickHandler = (intersects) => {
            const key = intersects[0].object.name;
            if (this.spriteData.has(key)) {
                this.setState({
                    showingEffect: true,
                    effectData: this.spriteData.get(key)
                });
            }
            console.log(intersects[0].object.name);
        }
    }

    /*****************************模型控制相关接口**************************** */
    setModels = (model_list) => {
        this.centerModelHelper = new CenterModelHelper(this.scene);
        this.centerModelHelper.loadModelList(model_list);
    }


    /**************************相机移动与控制相关接口************************* */

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

    connectCameraControl = () => {
        this.innerViewControls.connect();
    }

    disConnectCameraControl = () => {
        this.innerViewControls.disConnect();
    }


    /*******************************其他接口********************************** */
    onWindowResize = (mountWidth, mountHeight) => {
        this.camera.aspect = mountWidth / mountHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(mountWidth, mountHeight);
    }

    destroy = () => {
        this.mount.removeChild(this.renderer.domElement)
    }
}

export default XRPlayerManager;