import * as THREE from 'three';
 
class DeviceOrientationControls{

        constructor(object) {
                this.object = object;
                this.object.rotation.reorder( "YXZ" );
                this.enabled = true;
                this.deviceOrientation = {
                        alpha : 0,
                        beta : 90,
                        gamma : 0
                };
                this.screenOrientation = 0;
                this.alphaOffset = 0;
                window.addEventListener( 'orientationchange', this.onScreenOrientationChangeEvent, false );
                window.addEventListener( 'deviceorientation', this.onDeviceOrientationChangeEvent, false );
        }

        onDeviceOrientationChangeEvent = ( event ) => {
                this.deviceOrientation = event;
        };
 
        onScreenOrientationChangeEvent = () => {
                this.screenOrientation = window.orientation || 0;
        };

        // The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''
 
        connect = (alpha0) => {
                this.onScreenOrientationChangeEvent(); // run once on load
                this.alphaOffset = THREE.MathUtils.degToRad(this.deviceOrientation.alpha) + alpha0;
                this.enabled = true;
        };
 
        disConnect = () => {
                this.enabled = false;
        };
 
        update = () => {
                if ( this.enabled === false ) return;
                var alpha  = this.deviceOrientation.alpha ? THREE.Math.degToRad( this.deviceOrientation.alpha ) : 0; // Z
                alpha -= this.alphaOffset;
                var beta   = this.deviceOrientation.beta  ? THREE.Math.degToRad( this.deviceOrientation.beta  ) : 0; // X'
                var gamma  = this.deviceOrientation.gamma ? THREE.Math.degToRad( this.deviceOrientation.gamma ) : 0; // Y''
                var orient = this.screenOrientation       ? THREE.Math.degToRad( this.screenOrientation       ) : 0; // O
                var zee = new THREE.Vector3( 0, 0, 1 );
                var euler = new THREE.Euler();
                var q0 = new THREE.Quaternion();
                var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis
                euler.set( beta, alpha, - gamma, 'YXZ' );                       // 'ZXY' for the device, but 'YXZ' for us
                this.object.quaternion.setFromEuler( euler );                               // orient the device
                this.object.quaternion.multiply( q1 );                                      // camera looks out the back of the device, not the top
                this.object.quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) );    // adjust for screen orientation
        };
 
}

export default DeviceOrientationControls;