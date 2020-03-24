/**
 * 在球体中的全景视角控制
 * Three.js自带的Controls控制效果不理想，所以自己实现控制器
 */
import * as THREE from 'three';
import DeviceOrientationControls from './DeviceOrientationControls';
import * as dat from 'dat.gui';


class InnerViewControls {

    constructor(camera) {
        this.camera = camera;
        this.isConnected = false;
        this.isUserInteracting = false;     // 标记用户是否正在交互中
        this.onMouseDownMouseX = 0;         // 鼠标点击的初始坐标x
        this.onMouseDownMouseY = 0;         // 鼠标点击的初始坐标y
        this.lon = 0;                       // 经度
        this.onMouseDownLon = 0;
        this.lat = 0;                       // 纬度
        this.onMouseDownLat = 0;
        this.phi = 0;
        this.theta = 0;
        this.distance = 10;
        this.onPointerDownPointerX = 0;
        this.onPointerDownPointerY = 0;
        this.onPointerDownLon = 0;
        this.onPointerDownLat = 0;

        //键盘交互控件
        this.onKeyLeft = false;
        this.onKeyRight = false;
        this.onKeyUp = false;
        this.onKeyDown = false;
        this.onKeyShift = false;

        this.initControlsListener();

        //重力交互控件
        this.newCamera = new THREE.PerspectiveCamera();
        this.orientationControls = new DeviceOrientationControls(this.newCamera);
        this.orientationEnable = false;
        if (this.orientationEnable === true) {
            this.turnOnOrientationControls();
        }

        //GUI
        var gui = new dat.GUI();
        this.control = new function () {
            this.orientationControl = 0;
        };
        gui.add(this.control, 'orientationControl',0,1).step(1);
    }

    /**
     * 相机与控制器连接，数据生效
     */
    connect = () => {
        this.isConnected = true;
        this.initSphericalData();
    };

    disConnect = () => {
        this.isConnected = false;
    };

    // 将初始化的直角坐标转化为控制所需要的球体坐标数据
    initSphericalData = () => {
        const spherical = new THREE.Spherical();
        const position = this.camera.position;
        spherical.setFromCartesianCoords(position.x, position.y, position.z);
        this.phi = spherical.phi;
        this.theta = spherical.theta;
        this.distance = spherical.radius;
        this.lon = 90 - THREE.Math.radToDeg(this.theta);
        this.lat = 90 - THREE.Math.radToDeg(this.phi);
    };

    initControlsListener = () => {
        this.browser = window.navigator.userAgent.toLowerCase();
        if (this.browser.indexOf('mobile') > 0) {
            document.addEventListener('touchstart', this.onTouchstart, false);
            document.addEventListener('touchmove', this.onTouchmove, false);
            document.addEventListener('touchend', this.onTouchend, false);
            document.addEventListener('wheel', this.onDocumentMouseWheel, false);
        } else {
            document.addEventListener('mousedown', this.onDocumentMouseDown, false);
            document.addEventListener('mousemove', this.onDocumentMouseMove, false);
            document.addEventListener('mouseup', this.onDocumentMouseUp, false);
            document.addEventListener('wheel', this.onDocumentMouseWheel, false);
            //添加键盘监听
            document.addEventListener('keydown', this.onDocumentKeyDown, false);
            document.addEventListener('keyup', this.onDocumentKeyUp, false);
        }
    };

    update = () => {
        //键盘监听执行
        this.updateGUI();
        if (this.isConnected && this.orientationEnable === true) {
            this.updateCameraPositionOrientation();
            return;
        }
        var dLon = 2;
        var dLat = 2;
        if (this.onKeyShift) {
            dLon = 10;
            dLat = 10;
        }
        if (this.onKeyLeft) {
            this.lon -= dLon;
        }
        if (this.onKeyRight) {
            this.lon += dLon;
        }
        if (this.onKeyUp) {
            this.lat -= dLat;
        }
        if (this.onKeyDown) {
            this.lat += dLat;
        }
        if (this.isConnected) {
            this.updateCameraPosition();
        }
        this.camera.lookAt(this.camera.target);
    };

    updateGUI = () => {
        if (this.orientationEnable === false && this.control.orientationControl >= 1) {
            this.turnOnOrientationControls();
        }
        if (this.orientationEnable === true && this.control.orientationControl < 1) {
            this.turnOffOrientationControls();
        }
    };

    updateCameraPosition = () => {
        this.lat = Math.max(- 85, Math.min(85, this.lat));
        this.phi = THREE.Math.degToRad(90 - this.lat);
        this.theta = THREE.Math.degToRad(this.lon);
        // 球坐标系与直角坐标系的转换
        this.camera.position.x = this.distance * Math.sin(this.phi) * Math.cos(this.theta);
        this.camera.position.y = this.distance * Math.cos(this.phi);
        this.camera.position.z = this.distance * Math.sin(this.phi) * Math.sin(this.theta);
    };

    updateCameraPositionOrientation = () => {
        this.orientationControls.update();
        var cameraDirtection = new THREE.Vector3(0,0,0);
        this.newCamera.getWorldDirection(cameraDirtection);
        cameraDirtection.multiplyScalar(-this.distance);
        this.camera.position.copy(cameraDirtection);
        this.camera.quaternion.copy(this.newCamera.quaternion);
    };

    onDocumentMouseDown = (event) => {
        if (!!document.pointerLockElement) {
            return;
        }
        event.preventDefault();
        console.log('鼠标点击Down')
        this.isUserInteracting = true;
        // 记录鼠标点击屏幕坐标
        this.onPointerDownPointerX = event.clientX;
        this.onPointerDownPointerY = event.clientY;
        // 记录点击时候经纬度
        this.onPointerDownLon = this.lon; // 经度
        this.onPointerDownLat = this.lat; // 纬度
    }

    onDocumentMouseMove = (event) => {
        if (this.isUserInteracting === true) {
            // 在鼠标Down位置叠加偏移量
            this.lon = (this.onPointerDownPointerX - event.clientX) * 0.1 + this.onPointerDownLon;
            this.lat = (this.onPointerDownPointerY - event.clientY) * 0.1 + this.onPointerDownLat;
            // 用于立体场景音效
            // mouseActionLocal([lon, lat]);
        }
        if (!!document.pointerLockElement) {
            this.lon = event.movementX * 0.1 + this.lon;
            this.lat = event.movementY * 0.1 + this.lat;
        }
    }

    onDocumentMouseUp = (event) => {
        this.isUserInteracting = false;
    }

    onTouchstart = (event) => {
        if (event.targetTouches.length === 1) {
            console.log('touch', 'start');
            this.isUserInteracting = true;
            // 记录滑动开始的坐标
            var touch = event.targetTouches[0];
            this.onPointerDownPointerX = touch.pageX; // 把元素放在手指所在的位置
            this.onPointerDownPointerY = touch.pageY;
            // 记录滑动开始时候的经纬度
            this.onPointerDownLon = this.lon; // 经度
            this.onPointerDownLat = this.lat; // 纬度
        }
    }

    onTouchmove = (event) => {
        if (this.isUserInteracting === true) {
            var touch = event.targetTouches[0];
            console.log('touching', touch.pageX);
            this.lon = (parseFloat(this.onPointerDownPointerX) - touch.pageX) * 0.1 + this.onPointerDownLon;
            this.lat = (parseFloat(this.onPointerDownPointerY - touch.pageY)) * 0.1 + this.onPointerDownLat;
            // 用于立体场景音效
            // mouseActionLocal([lon, lat]);
        }
    }

    onTouchend = (event) => {
        this.isUserInteracting = false;
    }

    onDocumentMouseWheel = (event) => {
        this.distance += event.deltaY * 0.5;
        if (this.distance <= 0) {
            this.distance = 0;
        } else if (this.distance > 0 && this.distance < 1000) {
            if (!this.innerView) {
                console.log('进来', this.camera.position.y)
                this.innerView = true;
            }
        }
        else if (this.distance >= 1000 && this.distance <= 1500) {
            if (this.innerView) {
                console.log('出来')
                this.innerView = false;
            }
        }
        else if (this.distance >= 1500) {
            //this.distance = 1500;
        }
        console.log('distance', this.distance);

    }

    onDocumentKeyDown = (event) => {
        event.preventDefault();
        var keyCode = event.keyCode || event.which || event.charCode;
        switch (keyCode) {

            case 65: /*a*/
            case 37: /*left*/ this.onKeyLeft = true; this.onKeyRight = false; break;

            case 68: /*d*/
            case 39: /*right*/ this.onKeyRight = true; this.onKeyLeft = false; break;

            case 87: /*w*/
            case 38: /*up*/ this.onKeyUp = true; this.onKeyDown = false; break;

            case 83: /*s*/
            case 40: /*down*/ this.onKeyDown = true; this.onKeyUp = false; break;

            case 16: /*Shift*/ this.onKeyShift = true; break;

            case 81: /*q*/
                if (!!document.pointerLockElement) {
                    document.exitPointerLock();
                }
                else {
                    document.body.requestPointerLock();
                    this.isUserInteracting = false;
                }
                break;

            case 82: /*r*/
                console.log('alphaOffset = '+THREE.MathUtils.radToDeg(this.orientationControls.alphaOffset));
                console.log('lon = '+this.lon);
                console.log('dO.alpha = '+this.orientationControls.deviceOrientation.alpha);
                break;

            default: break;

        }
    }

    onDocumentKeyUp = (event) => {
        var keyCode = event.keyCode || event.which || event.charCode;
        switch (keyCode) {

            case 65: /*a*/
            case 37: /*left*/ this.onKeyLeft = false; break;

            case 68: /*d*/
            case 39: /*right*/ this.onKeyRight = false; break;

            case 87: /*w*/
            case 38: /*up*/ this.onKeyUp = false; break;

            case 83: /*s*/
            case 40: /*down*/ this.onKeyDown = false; break;

            case 16: /*L_Shift*/ this.onKeyShift = false; break;

            default: break;

        }
    };

    turnOnOrientationControls = () => {
        this.orientationControls.connect(THREE.MathUtils.degToRad(this.lon - 90));
        this.orientationEnable = true;
    };

    turnOffOrientationControls = () => {
        this.orientationControls.disConnect();
        var pos = this.camera.position;
        this.lat = pos.angleTo(new THREE.Vector3(pos.x,0,pos.z));
        this.lat  = THREE.MathUtils.radToDeg(this.lat);
        if (pos.y < 0) {
            this.lat = -this.lat;
        }
        pos.y = 0;
        this.lon = pos.angleTo(new THREE.Vector3(1,0,0));
        this.lon = THREE.MathUtils.radToDeg(this.lon);
        if (pos.z < 0) {
            this.lon = -this.lon;
        }
        this.orientationEnable = false;
    };

}

export default InnerViewControls;