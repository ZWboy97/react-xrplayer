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
        this.pointList = [];
        this.pointGroup = null;

        this.objectClickHandler = null;
    }

    setPointList = (list) => {
        this.pointList = list;
        this.initPoints();
    }

    initPoints = () => {
        this.pointGroup = new THREE.Group();
        this.pointArr = [];
        this.pointList.forEach((point) => {
            this.createPoint(point)
        });
        this.scene.add(this.pointGroup);
        this.bindEvent();
    }

    contertSph2Rect = (phi, theta) => {
        let r = Radius;
        return [
            r * Math.sin(THREE.Math.degToRad(phi)) * Math.cos(THREE.Math.degToRad(theta)),
            r * Math.sin(THREE.Math.degToRad(phi)) * Math.sin(THREE.Math.degToRad(theta)),
            r * Math.cos(THREE.Math.degToRad(phi))
        ];
    }

    createPoint(point) {
        let position = this.contertSph2Rect(point[1].phi, point[1].theta);
        let meshGroup = new THREE.Group();
        meshGroup.name = point[0];
        meshGroup.position.set(...position);

        let mesh = this.createSpriteShape("hotspot_video.png", 1, 16);
        meshGroup.add(mesh);
        mesh = this.getBackgroundTexture('#2d2d2d', 0.2, 20);
        meshGroup.add(mesh);
        this.pointArr.push(mesh);
        mesh.name = point[0];
        this.pointGroup.add(meshGroup);
        this.animatePoints(meshGroup);
    }

    createSpriteShape = (url, opacity, scale) => {
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

    animatePoints = (meshGroup) => {
        let t = 300;
        meshGroup.children.forEach(item => {
            let scale = item.scale;
            let tweenA = new TWEEN.Tween(scale)
                .to({ x: scale.x * 0.8, y: scale.y * 0.8 }, 500)
                .delay(100)
            let tweenB = new TWEEN.Tween(scale)
                .to({ x: scale.x * 1.2, y: scale.y * 1.2 }, 500)
                .delay(100)
            tweenA.chain(tweenB);
            tweenB.chain(tweenA);
            tweenA.start(t = t + 100);
        })
    }

    update = () => {
        TWEEN.update();
    }

    bindEvent = () => {
        let raycaster = new THREE.Raycaster();
        document.addEventListener('click', (event) => {
            event.preventDefault();
            let mouse = new THREE.Vector2(); // 鼠标的二维设备坐标
            //将屏幕点击的屏幕坐标转化为三维画面平面的坐标，值的范围为-1到1.
            mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
            mouse.y = - (event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;
            //从相机发射一条射线，经过鼠标点击位置
            // mouse为鼠标的二维设备坐标，camera为射线起点处的相机
            raycaster.setFromCamera(mouse, this.camera);
            // 射线与模型的交点，这里交点会是多个，因为射线是穿过模型的，
            //与模型的所有mesh都会有交点，但我们选取第一个，也就是intersects[0]。
            var intersects = raycaster.intersectObjects(this.pointArr);
            //如果只需要将第一个触发事件，那就取数组的第一个模型
            if (intersects.length > 0) {
                if (this.objectClickHandler) {
                    this.objectClickHandler(intersects);
                }
            }
        }, true);
    }
}

export default SpriteShapeHelper;