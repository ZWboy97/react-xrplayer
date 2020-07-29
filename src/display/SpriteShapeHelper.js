/**
 * 向3D场景中添加可以交互的热点标签或者按钮
 */
import * as THREE from 'three';
import { Radius } from '../const/PanoConst';
import TWEEN from '@tweenjs/tween.js';

class SpriteShapeHelper {

    constructor(scene, camera, renderer, container) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.container = container;
        this.hotSpotMap = null;     // 热点标签数据
        this.hotSpotMeshMap = null; // 热点标签Mesh Map，便于动态缩减
        this.pointGroup = null;     // 场景中的热点组合

        this.objectClickHandler = null;
        this.tagClickHandler = null;
        this.isTipVisible = true;
        this.hotSpotClickable = true;
    }

    setIsTipVisible = (enable) => {
        this.isTipVisible = enable;
        let display = "none";
        if (enable) {
            display = "block";
        } else {
            display = "none";
        }
        for (var i = 0; i < this.pointGroup.children.length; i++) {
            var name = this.pointGroup.children[i].name;
            var tip = document.getElementById(name);
            if (enable) {
                tip.style.display = display;
            } else {
                tip.style.display = display;
            }
        }
    }

    resetHotSpotGroup = () => {
        if (!this.pointGroup) {
            this.pointGroup = new THREE.Group();
            this.scene.add(this.pointGroup);
            this.hotSpotMeshMap = new Map();
            this.bindEvent();
        }
    }

    getPointObjects = () => {
        if (this.pointGroup && this.pointGroup.children) {
            return this.pointGroup.children;
        } else {
            return [];
        }
    }

    setHotSpotList = (hot_spot_list) => {
        this.resetHotSpotGroup();
        this.hotSpotMap = new Map(hot_spot_list);
        this.hotSpotMap.forEach((value, key) => {
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
        var tip = document.getElementById(hot_spot_key);
        if (tip) {
            this.container.removeChild(tip);
        }
    }

    contertSph2Rect = (lat, lon) => {
        let r = Radius;
        const phi = THREE.Math.degToRad(90 - lat);
        const theta = THREE.Math.degToRad(lon);
        return [
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        ];
    }

    createPoint(key, value) {
        let { lat, lon, res_url, opacity = 1, scale = 16,
            animate = false, title = null, img_url = null,
            img_height = 100, img_width = 100, title_width } = value;
        let position = this.contertSph2Rect(lat, lon);
        let meshGroup = new THREE.Group();
        meshGroup.name = key;
        meshGroup.position.set(...position);
        let mesh = this.createSpriteShape(res_url, opacity, scale);
        mesh.name = key;
        mesh.position.set(...position);
        mesh.meshType = 'markIcon';
        this.hotSpotMeshMap.set(key, mesh);
        this.pointGroup.add(mesh);
        if (animate) {
            this.animatePoint(mesh);
        }
        if (img_url || title) {
            var div = document.createElement("div");
            div.id = key;
            div.addEventListener('click', () => {
                if (!this.hotSpotClickable) return;
                this.tagClickHandler && this.tagClickHandler(key);
            }, false)
            div.style = "padding:10px 10px;cursor:pointer;background-size: 100% 100%;background-image:url('https://live360.oss-cn-beijing.aliyuncs.com/xr/fuzhou/fz_di.png');color:#fff;display:none;position:absolute;border-radius:6px; -webkit-user-select:none; -moz-user-select:none; -ms-user-select:none; user-select:none;font-size:0.85rem;";
            if (title_width) div.style.width = title_width + 'px';
        }
        if (img_url) {
            let img = document.createElement("img");
            img.src = img_url;
            img.alt = "image";
            img.height = img_height;
            img.width = img_width;
            img.align = "left";
            div.appendChild(img);
            this.container.appendChild(div);
        }
        if (title) {
            let text = document.createElement("div");
            text.innerText = title;
            text.style = "text-align:center;margin-bottom:45px"
            div.appendChild(text);
        }
        if (img_url || title) this.container.appendChild(div);
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

    markTitleInViews = () => {
        var camera = this.camera;
        for (var i = 0; i < this.pointGroup.children.length; i++) {
            var name = this.pointGroup.children[i].name;
            var tip = document.getElementById(name);
            if (tip) {
                var wpVector = new THREE.Vector3();
                var pos = this.pointGroup.children[i].getWorldPosition(wpVector)
                    .applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
                if (this.isTipVisible && (pos.x >= -1 && pos.x <= 0.5) && (pos.y >= -1 && pos.y <= 1) && (pos.z >= -1 && pos.z <= 1)) {
                    var hotSpot = this.hotSpotMap.get(name);
                    let position = "top";
                    if (hotSpot != null && hotSpot.hasOwnProperty("position")) {
                        position = hotSpot.position;
                    }
                    var screenPos = this.objectPosToScreenPos(this.pointGroup.children[i], this.container, this.camera);
                    if (position === 'top') {
                        tip.style.display = "block";
                        tip.style.left = screenPos.x - tip.clientWidth / 2 + "px";
                        tip.style.top = screenPos.y - tip.clientHeight - 30 + "px";
                    } else if (position === 'bottom') {
                        tip.style.display = "block";
                        tip.style.left = screenPos.x - tip.clientWidth / 2 + "px";
                        tip.style.top = screenPos.y + 30 + "px";
                    } else if (position === 'left') {
                        tip.style.display = "block";
                        tip.style.left = screenPos.x - tip.clientWidth - 30 + "px";
                        tip.style.top = screenPos.y - tip.clientHeight / 2 + 30 + "px";
                    } else if (position === 'right') {
                        tip.style.display = "block";
                        tip.style.left = screenPos.x + 30 + "px";
                        tip.style.top = screenPos.y - tip.clientHeight / 2 + 30 + "px";
                    } else if (position === 'middle') {
                        tip.style.display = "block";
                        tip.style.left = screenPos.x - tip.clientWidth / 2 + 30 + "px";
                        tip.style.top = screenPos.y - tip.clientHeight / 2 + 30 + "px";
                    }
                    else {
                        tip.style.display = "none";
                    }

                } else {
                    tip.style.display = "none";
                }
            }
            this.pointGroup.children[i].lookAt(this.camera.position);
        }
    }

    objectPosToScreenPos = (object, container, camera) => {
        var vector = new THREE.Vector3();
        vector.setFromMatrixPosition(object.matrixWorld).project(camera);
        var x2hat = vector.x,
            y2hat = vector.y;
        var W = container.clientWidth;
        var H = container.clientHeight;
        var pos = new THREE.Vector2();
        pos.x = (W / 2) * (x2hat + 1);
        pos.y = (H / 2) * (1 - y2hat);
        return pos;
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
        if (this.pointGroup) {
            this.markTitleInViews();
        }
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

    setHotSpotClickable = (enable) => {
        this.hotSpotClickable = enable;
    }

    bindEvent = () => {
        document.addEventListener('click', (event) => {
            event.preventDefault();
            console.log('检测热点点击');
            var intersects = this.getIntersects(event);
            //如果只需要将第一个触发事件，那就取数组的第一个模型
            if (intersects.length > 0) {
                if (this.objectClickHandler) {
                    console.log('intersects', intersects);
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