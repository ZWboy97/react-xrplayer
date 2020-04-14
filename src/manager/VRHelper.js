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
    constructor(renderer, width, height) {
        this.renderer = renderer;
        this.effect = new StereoEffect(renderer);
        this.effect.setSize(width,height);
        this.vrStatus = false;
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
    }

    disable = () => {
        this.vrStatus = false;
    }
}

export default VRHelper;
