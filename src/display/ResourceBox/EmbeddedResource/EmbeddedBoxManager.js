import * as THREE from 'three';
import EmbeddedTextBox from "./EmbeddedTextBox";
import EmbeddedImageBox from "./EmbeddedImageBox";

class EmbeddedBoxManager {
    constructor(XRPlayerManager) {
        this.XRManager = XRPlayerManager;

        this.embeddedBoxes = new Map();
        this.boxesNeedAddToScene = new Set();

        this.dragMeshes = new Set();
        this.isUserInteracting = false;
        this.chosenPlane = null;
        this.boxesNeedDrag = new Set();

        this.isDragging = false;

        this.initControlsListener();
    }

    //外部接口
    addEmbeddedBox = (embeddedBox) => {
        this.embeddedBoxes.set(embeddedBox.id, embeddedBox);
        embeddedBox.manager = this;
        this.boxesNeedAddToScene.add(embeddedBox);

        if (embeddedBox.draggable) {
            this.dragMeshes.add(embeddedBox.planeMesh);
        }
    }

    removeEmbeddedBox = (id) => {
        let embeddedBox = this.getEmbeddedBox(id);
        if (!!!embeddedBox) return false;
        this.embeddedBoxes.delete(embeddedBox.id);
        this.XRManager.scene.remove(embeddedBox.planeMesh);
        if (embeddedBox.draggable) {
            this.dragMeshes.delete(embeddedBox.planeMesh);
        }
        if (embeddedBox.showTypeChangable) {
            let container = this.XRManager.mount;
            let canvas = document.getElementById(embeddedBox.canvas.id);
            container.removeChild(canvas);
        }
        embeddedBox.kill();
        return true;
    }

    getEmbeddedBox = (id) => {
        return this.embeddedBoxes.get(id);
    }

    addEmbeddedBoxList = (embeddedBoxList) => {
        for (let embeddedBox of embeddedBoxList) {
            this.addEmbeddedBox(embeddedBox);
        }
    }

    clearAllEmbeddedBox = () => {
        for (let id of this.embeddedBoxes.keys()) {
            this.removeEmbeddedBox(id);
        }
    }

    //内部控制
    updateDisplay = (embeddedBox) => {
        this.boxesNeedAddToScene.add(embeddedBox);
        embeddedBox.draggable && this.boxesNeedDrag.add(embeddedBox);
    }

    update = () => {
        let deletBox = [];

        for (let embeddedBox of this.boxesNeedAddToScene) {
            if (embeddedBox.meshReady) {
                let mesh = this.XRManager.scene.children.find(box => box.name === embeddedBox.id);
                this.XRManager.scene.remove(mesh);
                this.XRManager.scene.add(embeddedBox.planeMesh);

                if (embeddedBox.showTypeChangable) {
                    let oldCanvas = document.getElementById(embeddedBox.canvas.id);
                    oldCanvas && this.XRManager.mount.removeChild(oldCanvas);
                    this.XRManager.mount.appendChild(embeddedBox.canvas);
                }

                deletBox.push(embeddedBox);
            }
        }
        for (let box of deletBox) {
            this.boxesNeedAddToScene.delete(box);
        }

        deletBox = [];
        this.boxesNeedDrag.forEach(embeddedBox => {
            if (embeddedBox.meshReady) {
                let deletMesh = null;
                this.dragMeshes.forEach(mesh => {
                    if (mesh.name === embeddedBox.id) {
                        deletMesh = mesh;
                    }
                });
                this.dragMeshes.delete(deletMesh);
                this.dragMeshes.add(embeddedBox.planeMesh);
                deletBox.push(embeddedBox);
            }
        });
        for (let box of deletBox) {
            this.boxesNeedDrag.delete(box);
        }

        this.embeddedBoxes.forEach(textBox => {
            if (textBox.meshReady)
                this.update2DPosition(textBox);
        });
    }

    //拖拽控件

    initControlsListener = () => {
        const browser = window.navigator.userAgent.toLowerCase();
        const container = document.getElementById('xr-container');
        if (browser.indexOf('mobile') > 0) {
            container.addEventListener('touchstart', this.onTouchstart, false);
            container.addEventListener('touchmove', this.onTouchmove, false);
            container.addEventListener('touchend', this.onTouchend, false);
        } else {
            container.addEventListener('mousedown', this.onDocumentMouseDown, false);
            container.addEventListener('mousemove', this.onDocumentMouseMove, false);
            container.addEventListener('mouseup', this.onDocumentMouseUp, false);
        }
    };

    getIntersects = (clientX, clientY, meshes) => {
        let raycaster = new THREE.Raycaster();
        let mouse = new THREE.Vector2();
        let xrManager = this.XRManager;
        const { x: domX, y: domY } = xrManager.renderer.domElement.getBoundingClientRect();
        mouse.x = ((clientX - domX) / xrManager.renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = - ((clientY - domY) / xrManager.renderer.domElement.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, xrManager.camera);
        return raycaster.intersectObjects(meshes);
    }

    update2DPosition = (box) => {
        if (!box.showTypeChangable) return;
        let tip = box.canvas;
        let container = this.XRManager.mount;
        let camera = this.XRManager.camera;
        let ans = tip.style;
        if (tip) {
            let wpPosition = new THREE.Vector3();
            let pos = box.planeMesh.getWorldPosition(wpPosition).applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
            if ((pos.x >= -1 && pos.x <= (1 - tip.width/container.clientWidth)) && (pos.y >= -(1 - tip.height/container.clientHeight) && pos.y <= 1) && (pos.z >= -1 && pos.z <= 1)) {
                if (box.visible === true && box.showType === '2d') {
                    ans.display = "block";
                }
                else {
                    ans.display = "none";
                }

                let screenPos = this.objectPosToScreenPos(box.planeMesh, container, camera);
                ans.left = screenPos.x - tip.clientWidth / 2 + "px";
                ans.top = screenPos.y - tip.clientHeight + 0.5 * tip.height + "px";
            }
            else {
                ans.display = "none";
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

    onDocumentMouseDown = (event) => {
        event.preventDefault();
        let array = Array.from(this.dragMeshes);
        let intersects = this.getIntersects(event.clientX, event.clientY, array);
        if (intersects.length > 0) {
            this.chosenPlane = intersects[0].object;
            this.isUserInteracting = true;
            this.deltaPosition = intersects[0].point.clone().multiplyScalar(-1).add(this.chosenPlane.position.clone());
            this.XRManager.disConnectCameraControl();
        }
    }

    onDocumentMouseMove = (event) => {
        let intersects = this.getIntersects(event.clientX, event.clientY, [...this.dragMeshes]);
        if (intersects.length > 0) {
            this.XRManager.mount.style.cursor = 'pointer';
        }
        else {
            this.XRManager.mount.style.cursor = 'default';
        }
        if (this.isUserInteracting === true) {
            let intersects = this.getIntersects(event.clientX, event.clientY, [this.XRManager.sceneMesh]);
            this.isDragging = true;
            if (intersects.length > 0) {
                let newPosition = intersects[0].point.clone().add(this.deltaPosition);
                this.chosenPlane.position.set(newPosition.x, newPosition.y, newPosition.z);
            }
            this.chosenPlane.lookAt(0, 0, 0);
        }
    }

    onDocumentMouseUp = (event) => {
        if(!this.isDragging) {  //只有当不被拖拽时才能触发点击回调，防止误触
            let array = [];
            this.embeddedBoxes.forEach(value => {
                if (value.callback !== null)
                    array.push(value.planeMesh);
            });
            let intersects = this.getIntersects(event.clientX, event.clientY, array);
            if (intersects.length > 0) {
                let box = this.getEmbeddedBox(intersects[0].object.name);
                box.callback();
            }
        }
        if (this.isUserInteracting === true) {
            this.isUserInteracting = false;
            this.chosenPlane = null;
            this.XRManager.connectCameraControl();
            this.isDragging = false;
        }
    }

    onTouchstart = (event) => {
        if (event.targetTouches.length === 1) {
            let array = Array.from(this.dragMeshes);
            let touch = event.targetTouches[0];
            this.lastTouchX = touch.pageX;
            this.lastTouchY = touch.pageY;
            var intersects = this.getIntersects(touch.pageX, touch.pageY, array);
            if (intersects.length > 0) {
                this.isUserInteracting = true;
                this.chosenPlane = intersects[0].object;
                this.isUserInteracting = true;
                this.deltaPosition = intersects[0].point.clone().multiplyScalar(-1).add(this.chosenPlane.position.clone());
                this.XRManager.disConnectCameraControl();
            }
        }

    }

    onTouchmove = (event) => {
        if (this.isUserInteracting === true) {
            let touch = event.targetTouches[0];
            this.lastTouchX = touch.pageX;
            this.lastTouchY = touch.pageY;
            let intersects = this.getIntersects(touch.pageX, touch.pageY, [this.XRManager.sceneMesh]);
            if (intersects.length > 0) {
                let newPosition = intersects[0].point.clone().add(this.deltaPosition);
                this.chosenPlane.position.set(newPosition.x, newPosition.y, newPosition.z);
            }
            this.chosenPlane.lookAt(0, 0, 0);
        }
    }

    onTouchend = (event) => {
        if (!this.isDragging) {  //只有当不被拖拽时才能触发点击回调，防止误触
            let array = [];
            this.embeddedBoxes.forEach(value => {
                if (value.callback !== null)
                    array.push(value.planeMesh);
            });
            let intersects = this.getIntersects(this.lastTouchX, this.lastTouchY, array);
            if (intersects.length > 0) {
                let box = this.getEmbeddedBox(intersects[0].object.name);
                box.callback();
            }
        }
        if (this.isUserInteracting === true) {
            this.isUserInteracting = false;
            this.chosenPlane = null;
            this.XRManager.connectCameraControl();
            this.isDragging = false;
        }
    }
}
export default EmbeddedBoxManager;