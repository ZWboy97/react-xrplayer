import * as THREE from 'three';

class EmbeddedBoxManager {
    constructor(XRPlayerManager) {
        this.XRManager = XRPlayerManager;

        this.embeddedBoxes = new Map();
        this.boxesNeedAddToScene = new Set();

        this.dragMeshes = new Set();
        this.isUserInteracting = false;
        this.chosenPlane = null;
        this.boxesNeedDrag = new Set();


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

    removeEmbeddedBox = (embeddedBox) => {
        this.embeddedBoxes.delete(embeddedBox.id);

        this.XRManager.scene.remove(embeddedBox.planeMesh);

        if (embeddedBox.draggable) {
            this.dragMeshes.delete(embeddedBox.planeMesh);
        }
    }

    getEmbeddedBox = (id) => {
        return this.embeddedBoxes.get(id);
    }

    addEmbeddedBoxList = (embeddedBoxList) => {
        for (let embeddedBox in embeddedBoxList) {
            this.addEmbeddedBox(embeddedBox);
        }
    }

    clearAllEmbeddedBox = () => {
        this.embeddedBoxes.clear();
    }

    //内部控制
    updateDisplay = (embeddedBox) => {
        this.boxesNeedAddToScene.add(embeddedBox);
        this.boxesNeedDrag.add(embeddedBox);
    }

    update = () => {
        let deletBox = [];
        this.boxesNeedAddToScene.forEach(embeddedBox => {
            if (embeddedBox.meshReady) {
                let mesh = this.XRManager.scene.children.find(box => box.name === embeddedBox.id);
                this.XRManager.scene.remove(mesh);
                this.XRManager.scene.add(embeddedBox.planeMesh);
                deletBox.push(embeddedBox);
            }
        });
        for (let box in deletBox) {
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
        for (let box in deletBox) {
            this.boxesNeedDrag.delete(box);
        }
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
        if (this.isUserInteracting === true) {
            let intersects = this.getIntersects(event.clientX, event.clientY, [this.XRManager.sceneMesh]);
            if (intersects.length > 0) {
                let newPosition = intersects[0].point.clone().add(this.deltaPosition);
                this.chosenPlane.position.set(newPosition.x, newPosition.y, newPosition.z);
            }
            this.chosenPlane.lookAt(0, 0, 0);
        }
    }

    onDocumentMouseUp = (event) => {
        if (this.isUserInteracting === true) {
            this.isUserInteracting = false;
            this.chosenPlane = null;
            this.XRManager.connectCameraControl();
        }
        else {  //只有当不被拖拽时才能触发点击回调，防止误触
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
    }

    onTouchstart = (event) => {
        if (event.targetTouches.length === 1) {
            let array = Array.from(this.dragMeshes);
            let touch = event.targetTouches[0];
            var intersects = this.getIntersects(touch.pageX, touch.pageY, array);
        }
        if (intersects.length > 0) {
            this.isUserInteracting = true;
            this.chosenPlane = intersects[0].object;
            this.isUserInteracting = true;
            this.deltaPosition = intersects[0].point.clone().multiplyScalar(-1).add(this.chosenPlane.position.clone());
            this.XRManager.disConnectCameraControl();
        }
    }

    onTouchmove = (event) => {
        if (this.isUserInteracting === true) {
            let touch = event.targetTouches[0];
            let intersects = this.getIntersects(touch.pageX, touch.pageY, [this.XRManager.sceneMesh]);
            if (intersects.length > 0) {
                let newPosition = intersects[0].point.clone().add(this.deltaPosition);
                this.chosenPlane.position.set(newPosition.x, newPosition.y, newPosition.z);
            }
            this.chosenPlane.lookAt(0, 0, 0);
        }
    }

    onTouchend = (event) => {
        let touch = event.targetTouches[0];
        if (this.isUserInteracting === true) {
            this.isUserInteracting = false;
            this.chosenPlane = null;
            this.XRManager.connectCameraControl();
        }
        else {  //只有当不被拖拽时才能触发点击回调，防止误触
            let array = [];
            for (let box in this.embeddedBoxes) {
                if (box.callback !== null)
                    array.push(box.planeMesh);
            }
            let intersects = this.getIntersects(touch.pageX, touch.pageY, array);
            if (intersects.length > 0) {
                let box = this.getEmbeddedBox(intersects[0].object.name);
                box.callback();
            }
        }
    }
}
export default EmbeddedBoxManager;