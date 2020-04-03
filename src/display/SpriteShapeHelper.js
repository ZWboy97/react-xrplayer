/**
 * 向3D场景中添加可以交互的热点标签或者按钮
 */
import * as THREE from 'three';
import { Radius } from '../const/PanoConst';
import TWEEN from '@tweenjs/tween.js';

class SpriteShapeHelper {

    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.hotSpotMeshMap = null; // 热点标签Mesh Map，便于动态缩减
        this.pointGroup = null;     // 场景中的热点组合

        this.objectClickHandler = null;
    }

    resetHotSpotGroup = () => {
        if (!this.pointGroup) {
            this.pointGroup = new THREE.Group();
            this.scene.add(this.pointGroup);
            this.hotSpotMeshMap = new Map();
            this.bindEvent();
        }
    }

    setHotSpotList = (hot_spot_list) => {
        this.resetHotSpotGroup();
        const hotSpotMap = new Map(hot_spot_list);
        hotSpotMap.forEach((value, key) => {
            this.createPoint(key, value)
        });
    }

    addHotSpot = (hot_spot) => {
        if (!this.pointGroup) {
            this.resetHotSpotGroup();
        }
        this.createPoint(hot_spot.key, hot_spot.value)
    }

    removeHotSpot = (hot_spot_key) => {
        const mesh = this.hotSpotMeshMap.get(hot_spot_key);
        if (mesh) {
            this.pointGroup.remove(mesh);
        }
    }

    contertSph2Rect = (phi, theta) => {
        let r = Radius;
        return [
            r * Math.sin(THREE.Math.degToRad(phi)) * Math.cos(THREE.Math.degToRad(theta)),
            r * Math.sin(THREE.Math.degToRad(phi)) * Math.sin(THREE.Math.degToRad(theta)),
            r * Math.cos(THREE.Math.degToRad(phi))
        ];
    }

    createPoint(key, value) {
        const { phi, theta, res_url, opacity = 1, scale = 16, animate = false } = value
        let position = this.contertSph2Rect(phi, theta);
        let meshGroup = new THREE.Group();
        meshGroup.name = key;
        meshGroup.position.set(...position);
        let mesh = this.createSpriteShape(res_url, opacity, scale);
        mesh.name = key;
        mesh.position.set(...position);
        this.hotSpotMeshMap.set(key, mesh);
        this.pointGroup.add(mesh);
        if (animate) {
            this.animatePoint(mesh);
        }
    }

    createSpriteShape = (url, opacity = 1, scale = 16) => {
        let texture = new THREE.TextureLoader().load(url);
        texture.needsUpdate = true; //注意这句不能少
        let material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: opacity,
            depthTest: false
        });
        let mesh = new THREE.Sprite(material);
        mesh.scale.set(scale * 2, scale * 2, 1);
        return mesh;
    }

    getBackgroundTexture = (color, opacity, scale) => {
        let canvas = document.createElement("canvas");
        canvas.click((e) => {
            console.log('canvas', '点击了热点');
        })
        const container = document.getElementById('display')
        container.appendChild(canvas);
        canvas.width = 128;
        canvas.height = 128;
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = color;
        ctx.arc(64, 64, 64, 0, 2 * Math.PI);
        ctx.fill();
        let texture = new THREE.Texture(canvas);
        texture.needsUpdate = true; //注意这句不能少
        let material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: opacity,
            depthTest: false
        });
        let mesh = new THREE.Sprite(material);
        mesh.scale.set(scale * 2, scale * 2, 1);
        return mesh;
    }

    animatePoint = (mesh) => {
        let t = 300;
        let scale = mesh.scale;
        let tweenA = new TWEEN.Tween(scale)
            .to({ x: scale.x * 0.8, y: scale.y * 0.8 }, 500)
            .delay(100)
        let tweenB = new TWEEN.Tween(scale)
            .to({ x: scale.x * 1.2, y: scale.y * 1.2 }, 500)
            .delay(100)
        tweenA.chain(tweenB);
        tweenB.chain(tweenA);
        tweenA.start(t = t + 100);
    }

    animatePoints = (meshGroup) => {
        meshGroup.children.forEach(item => {
            this.animatePoint(item);
        })
    }

    update = () => {
        TWEEN.update();
    }

    getIntersects = (event) => {
        let raycaster = new THREE.Raycaster();
        let mouse = new THREE.Vector2(); // 鼠标的二维设备坐标
        //将屏幕点击的屏幕坐标转化为三维画面平面的坐标，值的范围为-1到1.
        const { x: domX, y: domY } = this.renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - domX) / this.renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = - ((event.clientY - domY) / this.renderer.domElement.clientHeight) * 2 + 1;
        //从相机发射一条射线，经过鼠标点击位置
        // mouse为鼠标的二维设备坐标，camera为射线起点处的相机
        raycaster.setFromCamera(mouse, this.camera);
        // 射线与模型的交点，这里交点会是多个，因为射线是穿过模型的，
        //与模型的所有mesh都会有交点，但我们选取第一个，也就是intersects[0]。
        const meshArray = Array.from(this.hotSpotMeshMap.values());
        return raycaster.intersectObjects(meshArray);
    }

    bindEvent = () => {
        document.addEventListener('click', (event) => {
            event.preventDefault();
            console.log('检测热点点击');
            var intersects = this.getIntersects(event);
            //如果只需要将第一个触发事件，那就取数组的第一个模型
            if (intersects.length > 0) {
                if (this.objectClickHandler) {
                    this.objectClickHandler(intersects);
                }
            }
        }, true);
        document.addEventListener('mousemove', (event) => {
            event.preventDefault();
            var intersects = this.getIntersects(event);
            //如果只需要将第一个触发事件，那就取数组的第一个模型
            if (intersects.length > 0) {
                document.getElementById('canvas').style.cursor = 'pointer';
            }
            else {
                document.getElementById('canvas').style.cursor = 'default';
            }
        }, true);
    }
}

export default SpriteShapeHelper;