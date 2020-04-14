import * as THREE from 'three';

var StereoEffect = function ( renderer ) {

    var _stereo = new THREE.StereoCamera();
    _stereo.aspect = 0.5;
    var size = new THREE.Vector2();

    this.setEyeSeparation = function ( eyeSep ) {

        _stereo.eyeSep = eyeSep;

    };

    this.setSize = function ( width, height ) {

        renderer.setSize( width, height );

    };

    this.render = function ( scene, camera ) {

        scene.updateMatrixWorld();

        if ( camera.parent === null ) camera.updateMatrixWorld();

        _stereo.update( camera );

        renderer.getSize( size );

        if ( renderer.autoClear ) renderer.clear();
        renderer.setScissorTest( true );

        renderer.setScissor( 0, 0, size.width / 2, size.height );
        renderer.setViewport( 0, 0, size.width / 2, size.height );
        renderer.render( scene, _stereo.cameraL );

        renderer.setScissor( size.width / 2, 0, size.width / 2, size.height );
        renderer.setViewport( size.width / 2, 0, size.width / 2, size.height );
        renderer.render( scene, _stereo.cameraR );

        renderer.setScissorTest( false );

    };

};

class VRHelper {
    constructor(renderer, camera, width, height) {
        this.renderer = renderer;
        this.effect = new StereoEffect(renderer);
        this.effect.setSize(width,height);
        this.vrStatus = false;

        function makeDataTexture(data, width, height) {
            const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
            texture.minFilter = THREE.NearestFilter;
            texture.magFilter = THREE.NearestFilter;
            texture.needsUpdate = true;
            return texture;
        }
        this.raycaster = new THREE.Raycaster();
        this.pickedObject = null;

        const cursorColors = new Uint8Array([
            64, 64, 64, 64,       // dark gray
            255, 255, 255, 255,   // white
        ]);
        this.cursorTexture = makeDataTexture(cursorColors, 2, 1);

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
        camera.add(cursor);
        cursor.position.z = -500;
        const scale = 25;
        cursor.scale.set(scale, scale, scale);
        this.cursor = cursor;

        const coneGeometry = new THREE.ConeGeometry(0.8, 1.2, 3, 1);
        const coneMaterial = new THREE.MeshBasicMaterial({
            color: 'white',
            transparent: true,
            depthTest: false,
            wireframe: true
        });
        const cone = new THREE.Mesh(coneGeometry,coneMaterial);
        this.cone = cone;
        cone.position.z = -500;
        cone.scale.set(scale,scale,scale);
        cone.rotation.x = Math.PI / 2;
        camera.add(cone);

        cursor.visible = false;
        cone.visible = false;

        this.selectTimer = 0;
        this.selectDuration = 2;
        this.lastTime = 0;
    }

    pick(normalizedPosition, scene, camera, time, objects) {
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
        else {
            this.renderer.render(scene, camera);
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
