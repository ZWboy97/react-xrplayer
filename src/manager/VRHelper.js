import * as THREE from 'three';

class StereoEffect {

    constructor(renderer) {
        this.renderer = renderer;
        this.stereoCamera = new THREE.StereoCamera();
        this.stereoCamera.aspect = 0.5;
        this.size = new THREE.Vector2();

    }

    setEyeSeparation = (eyeSep) => {
        this.stereoCamera.eyeSep = eyeSep;
    };
    setSize = (width, height) => {
        this.renderer.setSize(width, height);
    };
    render = (scene, camera) => {
        scene.updateMatrixWorld();
        let size = this.size;
        if (camera.parent === null)
            camera.updateMatrixWorld();
        this.stereoCamera.update(camera);
        this.renderer.getSize(this.size);
        if (this.renderer.autoClear)
            this.renderer.clear();
        this.renderer.setScissorTest(true);
        this.renderer.setScissor(0, 0, size.width / 2, size.height);
        this.renderer.setViewport(0, 0, size.width / 2, size.height);
        this.renderer.render(scene, this.stereoCamera.cameraL);
        this.renderer.setScissor(size.width / 2, 0, size.width / 2, size.height);
        this.renderer.setViewport(size.width / 2, 0, size.width / 2, size.height);
        this.renderer.render(scene, this.stereoCamera.cameraR);
        this.renderer.setScissorTest(false);
    };
}

class VRHelper {

    constructor(renderer, camera, width, height) {
        this.renderer = renderer;
        this.camera = camera;
        this.effect = new StereoEffect(renderer);
        this.effect.setSize(width, height);
        this.vrStatus = false;
        this.cursor = null;
        this.cone = null;

        this.raycaster = new THREE.Raycaster();
        this.pickedObject = null;

        this.initCursor();
        this.initCone();

        this.selectTimer = 0;
        this.selectDuration = 2;
        this.lastTime = 0;
    }


    initCursor = () => {
        const cursorColors = new Uint8Array([
            64, 64, 64, 64,       // dark gray
            255, 255, 255, 255,   // white
        ]);
        this.cursorTexture = this.makeDataTexture(cursorColors, 2, 1);
        const cursorGeometry = new THREE.TorusBufferGeometry(
            1, 0.1, 4, 64);
        const cursorMaterial = new THREE.MeshBasicMaterial({
            color: 'white',
            map: this.cursorTexture,
            transparent: true,
            depthTest: false,
            blending: THREE.CustomBlending,
            blendSrc: THREE.OneMinusDstColorFactor,
            blendDst: THREE.OneMinusSrcColorFactor,
        });
        const cursor = new THREE.Mesh(cursorGeometry, cursorMaterial);
        this.camera.add(cursor);
        cursor.position.z = -500;
        const scale = 25;
        cursor.scale.set(scale, scale, scale);
        this.cursor = cursor;
        cursor.visible = false;
    }

    makeDataTexture = (data, width, height) => {
        const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        return texture;
    }

    initCone = () => {
        const coneGeometry = new THREE.ConeGeometry(0.8, 1.2, 3, 1);
        const coneMaterial = new THREE.MeshBasicMaterial({
            color: 'white',
            transparent: true,
            depthTest: false,
            wireframe: true
        });
        const cone = new THREE.Mesh(coneGeometry, coneMaterial);
        this.cone = cone;
        cone.position.z = -500;
        const scale = 25;
        cone.scale.set(scale, scale, scale);
        cone.rotation.x = Math.PI / 2;
        this.camera.add(cone);
        cone.visible = false;
    }

    pick = (normalizedPosition, scene, camera, time, objects) => {
        if (!!!objects || this.vrStatus === false) {
            this.pickedObject = undefined;
            return undefined;
        }
        const elapsedTime = time - this.lastTime;
        this.lastTime = time;
        const lastPickedObject = this.pickedObject;
        // restore the color if there is a picked object
        if (this.pickedObject) {
            this.pickedObject = undefined;
        }

        // cast a ray through the frustum
        this.raycaster.setFromCamera(normalizedPosition, camera);
        // get the list of objects the ray intersected
        const intersectedObjects = this.raycaster.intersectObjects(objects);
        if (intersectedObjects.length) {
            // pick the first object. It's the closest one
            this.pickedObject = intersectedObjects[0].object;
        }

        // show or hide cursor
        this.cursor.visible = !!this.pickedObject;

        let selected = false;

        // if we're looking at the same object as before
        // increment time select timer
        if (this.pickedObject && lastPickedObject === this.pickedObject) {
            this.selectTimer += elapsedTime;
            if (this.selectTimer >= this.selectDuration) {
                this.selectTimer = 0;
                selected = true;
            }
        } else {
            this.selectTimer = 0;
        }

        // set cursor material to show the timer state
        const fromStart = 0;
        const fromEnd = this.selectDuration;
        const toStart = -0.5;
        const toEnd = 0.5;
        this.cursorTexture.offset.x = THREE.MathUtils.mapLinear(
            this.selectTimer,
            fromStart, fromEnd,
            toStart, toEnd);

        return selected ? this.pickedObject : undefined;
    }

    render = (scene, camera) => {
        if (this.vrStatus) {
            this.effect.render(scene, camera);
        }
    }

    enable = () => {
        this.vrStatus = true;
        this.cursor.visible = true;
        this.cone.visible = true;
    }

    disable = () => {
        this.vrStatus = false;
        this.cursor.visible = false;
        this.cone.visible = false;
    }
}

export default VRHelper;
