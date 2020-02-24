/**
 * 向3D场景中添加可以交互的热点标签或者按钮
 */
import * as THREE from 'three';
import { Radius } from '../const/PanoConst';
import TWEEN from '@tweenjs/tween.js';

class SpriteShapeHelper {

    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.pointList = [];
        this.pointGroup = null;

        this.objectClickHandler = null;
    }

    setPointList = (list) => {
        this.pointList = list;
        this.initPoints();
    }

    initPoints = () => {
        this.pointList = [
            {
                phi: -90,
                theta: -10,
                name: 'infocard',
            },
            {
                phi: 32,
                theta: 14,
                name: 'image',
            },
            {
                phi: -153,
                theta: -44,
                name: 'paopazhaoqin',
            },
            {
                phi: 67,
                theta: 19,
                name: 'ranbaotadeng',
            },
            {
                phi: 58,
                theta: -9,
                name: 'touguasongzi',
            },
        ];

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
        let position = this.contertSph2Rect(point.phi, point.theta);
        let meshGroup = new THREE.Group();
        meshGroup.name = point.name;
        meshGroup.position.set(...position);

        let mesh = this.createSpriteShape('#ffffff', 0.8, 10);
        meshGroup.add(mesh);
        mesh = this.createSpriteShape('#2d2d2d', 0.6, 12);
        meshGroup.add(mesh);
        mesh = this.createSpriteShape('#2d2d2d', 0.2, 24);
        meshGroup.add(mesh);
        this.pointArr.push(mesh);
        mesh.name = point.name;
        this.pointGroup.add(meshGroup);
        this.animatePoints(meshGroup);
    }

    createSpriteShape = (color, opacity, scale) => {
        let canvas = document.createElement("canvas");
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
        console.log('animata log');
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
            let mouse = new THREE.Vector2();
            //通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
            // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
            raycaster.setFromCamera(mouse, this.camera);
            // 获取raycaster直线和所有模型相交的数组集合
            var intersects = raycaster.intersectObjects(this.pointArr);
            //如果只需要将第一个触发事件，那就取数组的第一个模型
            if (intersects.length > 0) {
                //this.showModal(intersects[0].object.name)
                if (this.objectClickHandler) {
                    this.objectClickHandler(intersects);
                }
            }
        }, true);
    }
}

export default SpriteShapeHelper;