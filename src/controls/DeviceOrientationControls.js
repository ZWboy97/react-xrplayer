import * as THREE from 'three';

class DeviceOrientationControls {

    constructor(camera) {
        this.camera = camera;
        this.enabled = false;
        this.deviceOrientation = {
            alpha: 0,
            beta: 90,
            gamma: 0
        };
        this.screenOrientation = 0;
        this.alphaOffset = 0;
    }

    onDeviceOrientationChangeEvent = (event) => {
        this.deviceOrientation = event;
    };

    onScreenOrientationChangeEvent = () => {
        this.screenOrientation = window.orientation || 0;
    };

    connect = (alpha0) => {
        window.addEventListener('orientationchange', this.onScreenOrientationChangeEvent, false);
        window.addEventListener('deviceorientation', this.onDeviceOrientationChangeEvent, false);
        this.onScreenOrientationChangeEvent(); // run once on load
        this.enabled = true;
    };

    disConnect = () => {
        this.enabled = false;
        window.removeEventListener('orientationchange', this.onScreenOrientationChangeEvent, false);
        window.removeEventListener('deviceorientation', this.onDeviceOrientationChangeEvent, false);
    };

    update = (distance) => {
        if (this.enabled === false) return;
        // get data from device
        var alpha = this.deviceOrientation.alpha ?
            THREE.Math.degToRad(this.deviceOrientation.alpha) : 0; // Z
        alpha -= this.alphaOffset;
        var beta = this.deviceOrientation.beta ?
            THREE.Math.degToRad(this.deviceOrientation.beta) : 0; // X
        var gamma = this.deviceOrientation.gamma ?
            THREE.Math.degToRad(this.deviceOrientation.gamma) : 0; // Y
        var orient = this.screenOrientation ?
            THREE.Math.degToRad(this.screenOrientation) : 0; // Orient

        var zee = new THREE.Vector3(0, 0, 1);
        var q0 = new THREE.Quaternion(); // Quaternions are used in three.js to represent rotations.
        var q1 = new THREE.Quaternion(- Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis
        var euler = new THREE.Euler(); // 欧拉对象，描述xyz轴上的一个旋转序列
        euler.set(beta, alpha, - gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us
        this.camera.quaternion.setFromEuler(euler);    // 设置旋转角度
        this.camera.quaternion.multiply(q1); // 执行方位角的转换 
        this.camera.quaternion.multiply(q0.setFromAxisAngle(zee, - orient));    // 横竖屏切换旋转

        // TODO distance同步视野大小,暂时先这么解决，澄亮正改用通过fov参数控制视野方案
        var cameraDirtection = new THREE.Vector3(0, 0, 0);
        this.camera.getWorldDirection(cameraDirtection);
        cameraDirtection.multiplyScalar(-distance);
        this.camera.position.copy(cameraDirtection);
        this.camera.quaternion.copy(this.camera.quaternion);
    };

}

export default DeviceOrientationControls;