import * as THREE from "three";

class EmbeddedBox {
    constructor(id, type) {
        this.id = id;
        this.type = type;
        this.callback = null;
        this.lat = 0;
        this.lon = 0;
        this.dragable = false;

        //控制信息
        this.planeMesh = null;
        this.canvas = null;
        this.width = 0;
        this.height = 0;
        this.manager = null;
        this.meshReady = false;
        this.isUserInteracting = false;

        this.initControlsListener();
    }

    //外部接口
    setPosition = (lat, lon) => {
        this.lat = lat;
        this.lon = lon;

        if (this.planeMesh) {
            let pos = this.Sph2Cart(this.lat, this.lon);
            this.planeMesh.position.set(pos.x, pos.y, pos.z);
            this.planeMesh.lookAt(0, 0, 0);
        }
    }

    getPosition = () => {
        return {lat: this.lat, lon: this.lon};
    }

    setDraggable = (enable) => {
        this.dragable = enable;
    }

    getDraggable = () => {
        return this.dragable;
    }

    onClick = (callback) => {
        this.callback = callback;
    }

    //内部控制函数
    updateDisplay = () => {
        this.manager && this.manager.updateDisplay(this);
    }

    createPlane = () => {
        let planeMaterial = this.newPlaneMaterial();
        let planeGeometry = new THREE.PlaneGeometry(this.width, this.height);
        let visible = this.planeMesh === null ? true : this.planeMesh.visible;
        this.planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        this.planeMesh.visible = visible;

        let pos = this.Sph2Cart(this.lat, this.lon);
        this.planeMesh.position.set(pos.x, pos.y, pos.z);
        this.planeMesh.lookAt(0, 0, 0);
        this.planeMesh.name = this.id;
        this.meshReady = true;
    }

    newPlaneMaterial = () => {
        let texture = new THREE.Texture(this.canvas);
        texture.needsUpdate = true;
        let planeMaterial = new THREE.MeshBasicMaterial({map: texture});
        planeMaterial.depthTest = false;
        planeMaterial.needsUpdate = true;
        planeMaterial.map.needsUpdate = true;
        planeMaterial.transparent = true;
        planeMaterial.opacity = 1;

        return planeMaterial;
    }

    Sph2Cart = (lat, lon) => {
        let phi = THREE.Math.degToRad(90 - lat);
        let theta = THREE.Math.degToRad(lon);
        return new THREE.Vector3(
            500 * Math.sin(phi) * Math.cos(theta),
            500 * Math.cos(phi),
            500 * Math.sin(phi) * Math.sin(theta)
        );
    };

    kill = () => {

    }

    //拖拽控制函数

    initControlsListener = () => {
        const browser = window.navigator.userAgent.toLowerCase();
        const container = document.getElementById('xr-container');
        //这个container的获取需不需要更好的手段，或者直接用window
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

    getIntersects = (clientX, clientY, mesh) => {
        if (this.dragable === false || this.manager === null)
            return null;
        let raycaster = new THREE.Raycaster();
        let mouse = new THREE.Vector2();
        let xrManager = this.manager.XRManager;
        const { x: domX, y: domY } = xrManager.renderer.domElement.getBoundingClientRect();
        mouse.x = ((clientX - domX) / xrManager.renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = - ((clientY - domY) / xrManager.renderer.domElement.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, xrManager.camera);
        return raycaster.intersectObject(mesh);
    }

    onDocumentMouseDown = (event) => {
        event.preventDefault();
        if (this.dragable === false || this.manager === null)
            return;
        let intersects = this.getIntersects(event.clientX, event.clientY, this.planeMesh);
        if (intersects.length > 0) {
            this.isUserInteracting = true;
            this.deltaPosition = intersects[0].point.clone().multiplyScalar(-1).add(this.planeMesh.position.clone());
            this.manager.XRManager.disConnectCameraControl();
        }
    }

    onDocumentMouseMove = (event) => {
        if (this.dragable === false || this.manager === null)
            return;
        if (this.isUserInteracting === true) {
            let intersects = this.getIntersects(event.clientX, event.clientY, this.manager.XRManager.sceneMesh);
            if (intersects.length > 0) {
                let newPosition = intersects[0].point.clone().add(this.deltaPosition);
                this.planeMesh.position.set(newPosition.x, newPosition.y, newPosition.z);
            }
        }
    }

    onDocumentMouseUp = (event) => {
        if (this.callback !== null) {
            let intersects = this.getIntersects(event.clientX, event.clientY, this.planeMesh);
            if (intersects.length > 0) {
                this.callback();
            }
        }
        if (this.dragable === false || this.manager === null)
            return;
        if (this.isUserInteracting === true) {
            this.isUserInteracting = false;
            this.manager.XRManager.connectCameraControl();
        }
    }

    onTouchstart = (event) => {
        if (this.dragable === false || this.manager === null)
            return;
        if (event.targetTouches.length === 1) {
            let touch = event.targetTouches[0];
            var intersects = this.getIntersects(touch.pageX, touch.pageY, this.planeMesh);
        }
        if (intersects.length > 0) {
            this.isUserInteracting = true;
            this.planeMesh = intersects[0].object;
            this.deltaPosition = intersects[0].point.clone().multiplyScalar(-1).add(this.planeMesh.position.clone());
            this.manager.XRManager.disConnectCameraControl();
        }
    }

    onTouchmove = (event) => {
        if (this.dragable === false || this.manager === null)
            return;
        if (this.isUserInteracting === true) {
            let touch = event.targetTouches[0];
            let intersects = this.getIntersects(touch.pageX, touch.pageY, this.manager.XRManager.sceneMesh);
            if (intersects.length > 0) {
                let newPosition = intersects[0].point.clone().add(this.deltaPosition);
                this.planeMesh.position.set(newPosition.x, newPosition.y, newPosition.z);
            }
        }
    }

    onTouchend = (event) => {
        if (this.dragable === false || this.manager === null)
            return;
        if (this.isUserInteracting === true) {
            this.isUserInteracting = false;
            this.manager.XRManager.connectCameraControl();
        }
    }

}
export default EmbeddedBox;