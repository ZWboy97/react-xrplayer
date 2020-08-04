import * as THREE from 'three';
import TextBox from './TextBox';

class TextBoxHelper {
    constructor(camera, renderer, sceneMesh, cameraControl) {
        this.camera = camera;
        this.renderer = renderer;
        this.cameraControl = cameraControl;
        this.textBoxes = new Map();
        this.boxId = 0;

        //拖拽标签控件
        this.dragBoxes = new Set();
        this.isUserInteracting = false;
        this.sceneMesh = sceneMesh;
        this.chosenPlane = null;

        this.initControlsListener();
    }

    createTextBox = (params, scene) => {
        let textBox = new TextBox(params);
        textBox.addTo(scene);
        this.boxId++;
        this.textBoxes.set(this.boxId, textBox);
        if (params.hasOwnProperty("draggable") && params.draggable === true) {
            this.dragBoxes.add(textBox.planeMesh);
        }
        return this.boxId;
    }

    showTextBox = (boxId) => {
        let textBox = this.textBoxes.get(boxId);
        if (!!!textBox) return;
        textBox.show();
    }

    hideTextBox = (boxId) => {
        let textBox = this.textBoxes.get(boxId);
        if (!!!textBox) return;
        textBox.hide();
    }

    changeTextBox = (boxId, params, scene) => {
        let textBox = this.textBoxes.get(boxId);
        if (!!!textBox) return;
        const draggable = textBox.draggable;
        textBox.removeFrom(scene);
        this.dragBoxes.delete(textBox.planeMesh);
        textBox.setMessage(params);
        textBox.addTo(scene);
        if (textBox.draggable) {
            this.dragBoxes.add(textBox.planeMesh);
        }
        if (params.hasOwnProperty("draggable")) {
            if (draggable === false && params.draggable === true) {
                this.dragBoxes.add(textBox.planeMesh);
            }
            else if (draggable === true && params.draggable === false) {
                this.dragBoxes.delete(textBox.planeMesh);
            }
        }
    }

    removeTextBox = (boxId, scene) => {
        let textBox = this.textBoxes.get(boxId);
        if (!!!textBox) return;
        textBox.removeFrom(scene);
        this.textBoxes.delete(textBox);
        textBox.kill();
        textBox = null;
    }

    playVideo = (boxId) => {
        let textBox = this.textBoxes.get(boxId);
        textBox.videoElement && textBox.videoElement.play();
    }

    pauseVideo = (boxId) => {
        let textBox = this.textBoxes.get(boxId);
        textBox.videoElement && textBox.videoElement.pause();
    }

    setVideoVolume = (boxId, volume) => {
        let textBox = this.textBoxes.get(boxId);
        textBox.videoElement && (textBox.videoElement.volume = volume);
    }

    update = () => {
        const x = this.camera.position.x, z = this.camera.position.z;
        this.textBoxes.forEach(textBox => {
            textBox.planeMesh.lookAt(x, textBox.planeMesh.position.y, z);
        })
    }

    initControlsListener = () => {
        const browser = window.navigator.userAgent.toLowerCase();
        const container = document.getElementById('xr-container')
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

    getIntersects = (clientX, clientY, array) => {
        let raycaster = new THREE.Raycaster();
        let mouse = new THREE.Vector2();
        const { x: domX, y: domY } = this.renderer.domElement.getBoundingClientRect();
        mouse.x = ((clientX - domX) / this.renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = - ((clientY - domY) / this.renderer.domElement.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, this.camera);
        return raycaster.intersectObjects(array);
    }

    onDocumentMouseDown = (event) => {
        event.preventDefault();
        let array = Array.from(this.dragBoxes);
        let intersects = this.getIntersects(event.clientX, event.clientY, array);
        if (intersects.length > 0) {
            this.chosenPlane = intersects[0].object;
            this.isUserInteracting = true;
            this.deltaPosition = intersects[0].point.clone().multiplyScalar(-1).add(this.chosenPlane.position.clone());
            this.cameraControl.disConnect();
        }
    }

    onDocumentMouseMove = (event) => {
        if (this.isUserInteracting === true) {
            let intersects = this.getIntersects(event.clientX, event.clientY, [this.sceneMesh]);
            if (intersects.length > 0) {
                let newPosition = intersects[0].point.clone().add(this.deltaPosition);
                this.chosenPlane.position.set(newPosition.x, newPosition.y, newPosition.z);
            }
        }
    }

    onDocumentMouseUp = (event) => {
        if (this.isUserInteracting === true) {
            this.isUserInteracting = false;
            this.cameraControl.connect();
        }
    }

    onTouchstart = (event) => {
        if (event.targetTouches.length === 1) {
            let array = Array.from(this.dragBoxes);
            let touch = event.targetTouches[0];
            var intersects = this.getIntersects(touch.pageX, touch.pageY, array);
        }
        if (intersects.length > 0) {
            this.isUserInteracting = true;
            this.chosenPlane = intersects[0].object;
            this.isUserInteracting = true;
            this.deltaPosition = intersects[0].point.clone().multiplyScalar(-1).add(this.chosenPlane.position.clone());
            this.cameraControl.disConnect();
        }
    }

    onTouchmove = (event) => {
        if (this.isUserInteracting === true) {
            let touch = event.targetTouches[0];
            let intersects = this.getIntersects(touch.pageX, touch.pageY, [this.sceneMesh]);
            if (intersects.length > 0) {
                let newPosition = intersects[0].point.clone().add(this.deltaPosition);
                this.chosenPlane.position.set(newPosition.x, newPosition.y, newPosition.z);
            }
        }
    }

    onTouchend = (event) => {
        if (this.isUserInteracting === true) {
            this.isUserInteracting = false;
            this.cameraControl.connect();
        }
    }
}

export default TextBoxHelper;