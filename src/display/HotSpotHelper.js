import * as THREE from 'three';

class HotSpotHelper {

    constructor(sence, container, camera) {
        this.camera = camera;
        this.sence = sence;
        this.container = container;
        this.markIconGroup = new THREE.Group();
        this.markIconGroup.name = "markIconGroup";
        this.sence.add(this.markIconGroup);
    }

    addIcons = (iconList) => {
        for (var i = 0; i < iconList.length; i++) {
            const { img, position, name, title, width, height } = iconList;
            this.markIcon(img, position, name, title, width, height);
        }
    }

    removeAllIcons = () => {
        for (var i = 0; i < this.markIconGroup.children.length; i++) {
            var tip = document.getElementById(this.markIconGroup.children[i].name);
            if (tip) {
                this.container.removeChild(tip);
            }
            this.markIconGroup.remove(this.markIconGroup.children[i]);
        }
    }


    markIcon = (img, position, name, title, width, height) => {
        var w = width || 0.08;
        var h = height || 0.08;
        var textureLoader = new THREE.TextureLoader();
        var material = new THREE.MeshBasicMaterial({ map: textureLoader.load(img), side: THREE.DoubleSide, transparent: true });
        var geometry = new THREE.PlaneGeometry(w, h);
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position.x, position.y, position.z);
        mesh.name = name;
        mesh.meshType = 'markIcon';
        this.markIconGroup.add(mesh);

        var div = document.createElement("div");
        div.id = name;
        div.style = "padding:4px 4px;background:rgba(0,0,0,.5);color:#fff;display:none;position:absolute;border-radius:6px; -webkit-user-select:none; -moz-user-select:none; -ms-user-select:none; user-select:none;font-size:0.75rem;";
        div.innerHTML = title;
        this.container.appendChild(div);
    }

    removeIcon = (name) => {
        for (var i = 0; i < this.markIconGroup.children.length; i++) {
            if (this.markIconGroup.children[i].name === name) {
                this.markIconGroup.remove(this.markIconGroup.children[i]);
                var tip = document.getElementById(name);
                if (tip) {
                    this.container.removeChild(tip);
                }
                break;
            }
        }
    }

    markIconInViews = () => {
        var camera = this.camera;
        for (var i = 0; i < this.markIconGroup.children.length; i++) {
            var wpVector = new THREE.Vector3();
            var pos = this.markIconGroup.children[i]
                .getWorldPosition(wpVector).applyMatrix4(camera.matrixWorldInverse)
                .applyMatrix4(camera.projectionMatrix);
            var name = this.markIconGroup.children[i].name;
            if ((pos.x >= -1 && pos.x <= 1) && (pos.y >= -1 && pos.y <= 1) && (pos.z >= -1 && pos.z <= 1)) {
                var screenPos = this.objectPosToScreenPos(this.markIconGroup.children[i], this.container, this.camera);
                var tip = document.getElementById(name);
                if (tip) {
                    tip.style.display = "block";
                    tip.style.left = screenPos.x - tip.clientWidth / 2 + "px";
                    tip.style.top = screenPos.y - tip.clientHeight * 2 + "px";
                }

            } else {
                tip = document.getElementById(name);
                if (tip) {
                    tip.style.display = "none";
                }
            }
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

    update = () => {
        if (this.markIconGroup) {
            this.markIconInViews();
            for (var i = 0; i < this.markIconGroup.children.length; i++) {
                this.markIconGroup.children[i].lookAt(this.camera.position);
            }
        }
    }



    // bindRaycaster = function (event, callback) {

    //     var vector = AVR.screenPosTo3DCoordinate(event, this.vr.container, this.vr.camera);

    //     //在视点坐标系中形成射线,射线的起点向量是照相机， 射线的方向向量是照相机到点击的点，这个向量应该归一标准化。
    //     var raycaster = new THREE.Raycaster(this.vr.camera.position, vector.sub(this.vr.camera.position).normalize());

    //     //射线和模型求交，选中一系列直线
    //     var intersects = raycaster.intersectObjects(this.vr.scene.children, true);
    //     if (intersects.length) {
    //         callback.success(intersects);
    //     } else {
    //         callback.empty();
    //     }
    // }

}

export default HotSpotHelper;

