/**
 * 在球体中的全景视角控制
 * Three.js自带的Controls控制效果不理想，所以自己实现控制器
 */
import * as THREE from 'three';
import DeviceOrientationControls from './DeviceOrientationControls';

class InnerViewControls {

    constructor(camera) {
        this.camera = camera;
        this.isConnected = true;
        this.isUserInteracting = false;     // 标记用户是否正在交互中
        this.isPointerInteracting = false;  // 鼠标完全控制模式
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

        // 视野自动旋转
        this.enableAutoRotate = false;          // 是否自动旋转
        this.autoRotateSpeed = 1.0;             // 自动旋转速度,对外
        this.autoRotateAngle =                  // 内部速度
            this.getRotateAngle();
        this.autoRotateDirection = 'left';      // 自动旋转方向，left、right、up、down

        // 视野范围
        this.fovTopEdge = 90;
        this.fovDownEdge = -90;

        //键盘交互控件
        this.onKeyLeft = false;
        this.onKeyRight = false;
        this.onKeyUp = false;
        this.onKeyDown = false;
        this.onKeyShift = false;

        this.initControlsListener();

        //重力交互控件
        this.orientationControls = new DeviceOrientationControls(this.camera);
        this.orientationEnable = false;
    }

    /******************************对外接口************************* */

    // 相机控制器开关
    connect = () => {
        this.isConnected = true;
        this.initSphericalData();
    };
    disConnect = () => {
        this.isConnected = false;
    };

    // 方向传感器开关
    getEnableOrientationControls = () => {
        return this.orientationEnable;
    }
    enableOrientationControls = () => {
        if (this.orientationEnable === false) {
            this.orientationControls.connect(THREE.MathUtils.degToRad(this.lon - 90));
            this.orientationEnable = true;
        }
    }
    disableOrientationControls = () => {
        if (this.orientationEnable === true) {
            this.orientationControls.disConnect();
            this.orientationEnable = false;
            this.initSphericalData();
        }
    }

    // 自动旋转接口
    getEnableAutoRotate = () => {
        return this.enableAutoRotate;
    }
    setEnableAutoRotate = (enable) => {
        this.enableAutoRotate = enable;
    }
    setAutoRotateSpeed = (speed) => {
        this.autoRotateSpeed = speed;
        this.getRotateAngle();
    }
    setAutoRotateDirection = (direction) => {
        this.autoRotateDirection = direction;
    }

    // FOV范围接口
    setFovVerticalScope = (bottom, top) => {
        this.fovTopEdge = top;
        this.fovDownEdge = bottom;
    }
    getFovVerticalScope = () => {
        return {
            top: this.fovTopEdge,
            bottom: this.fovDownEdge
        }
    }

    // 相机当前位置接口
    getCameraPosition = () => {
        return this.camera.position;
    }
    setCameraPosition = (x, y, z) => {
        this.camera.position.set(x, y, z);
        this.initSphericalData();
    }

    // 相机FOV接口
    getCameraFov = () => {
        return this.camera.fov;
    }
    setCameraFov = (fov) => {
        this.camera.fov = fov;
        this.camera.updateProjectionMatrix();
    }

    /*******************************内部方法实现******************************** */

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
        const container = document.getElementById('xr-container')
        if (this.browser.indexOf('mobile') > 0) {
            container.addEventListener('touchstart', this.onTouchstart, false);
            container.addEventListener('touchmove', this.onTouchmove, false);
            container.addEventListener('touchend', this.onTouchend, false);
            container.addEventListener('wheel', this.onDocumentMouseWheel, false);
        } else {
            container.addEventListener('mousedown', this.onDocumentMouseDown, false);
            document.addEventListener('mousemove', this.onDocumentMouseMove, false);
            container.addEventListener('mouseup', this.onDocumentMouseUp, false);
            container.addEventListener('wheel', this.onDocumentMouseWheel, false);
            //添加键盘监听
            document.addEventListener('keydown', this.onDocumentKeyDown, false);
            document.addEventListener('keyup', this.onDocumentKeyUp, false);
        }
    };

    update = () => {
        if (!this.isConnected) {
            this.camera.lookAt(this.camera.target);
            return;
        }
        this.updateCamera();
    };

    updateCamera = () => {
        if (this.orientationEnable === true) {
            this.camera.lookAt(this.camera.target); // 需要在updateposition之前，否则传感器效果异常
            this.orientationControls.update(this.distance);
            return;
        }
        if (this.isUserInteracting) {
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
            this.updateCameraPosition();
        } else if (this.enableAutoRotate) {
            this.autoRotate();
        }
        this.camera.lookAt(this.camera.target);
    };

    updateCameraPosition = () => {
        this.lat = Math.max(this.fovDownEdge, Math.min(this.fovTopEdge, this.lat));
        this.phi = THREE.Math.degToRad(90 - this.lat);
        this.theta = THREE.Math.degToRad(this.lon);
        // 球坐标系与直角坐标系的转换
        this.camera.position.x = this.distance * Math.sin(this.phi) * Math.cos(this.theta);
        this.camera.position.y = this.distance * Math.cos(this.phi);
        this.camera.position.z = this.distance * Math.sin(this.phi) * Math.sin(this.theta);
    }

    autoRotate = () => {
        this.updateCameraPosition(); // 旋转更新，等下次渲染
        switch (this.autoRotateDirection) {
            case 'left':
                this.theta += this.autoRotateAngle;
                this.lon = THREE.Math.radToDeg(this.theta);
                break;
            case 'right':
                this.theta -= this.autoRotateAngle;
                this.lon = THREE.Math.radToDeg(this.theta);
                break;
            case 'up':
                this.phi += this.autoRotateAngle;
                this.lat = 90 - THREE.Math.radToDeg(this.phi);
                break;
            case 'down':
                this.phi -= this.autoRotateAngle;
                this.lat = 90 - THREE.Math.radToDeg(this.phi);
                break;
            default: break;
        }
    }

    getRotateAngle = () => {
        this.autoRotateAngle = 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
        return this.autoRotateAngle;
    }

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
            if (this.isPointerInteracting) {
                this.lon = event.movementX * 0.1 + this.lon;
                this.lat = event.movementY * 0.1 + this.lat;
            } else {
                // 在鼠标Down位置叠加偏移量
                this.lon = (this.onPointerDownPointerX - event.clientX) * 0.1 + this.onPointerDownLon;
                this.lat = (this.onPointerDownPointerY - event.clientY) * 0.1 + this.onPointerDownLat;
            }
            // 用于立体场景音效
            // mouseActionLocal([lon, lat]);
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
        //this.distance += event.deltaY * 0.5;
        let fov = this.camera.fov;
        fov += event.deltaY * 0.03; // 0.03 is a suitable value
        if (fov >= 160) {
            fov = 160;
        } else if (fov <= 10) {
            fov = 10
        }
        this.camera.fov = fov;
        this.camera.updateProjectionMatrix();
        return;
    }

    onDocumentKeyDown = (event) => {
        event.preventDefault();
        var keyCode = event.keyCode || event.which || event.charCode;
        this.setInteractingIfKeys(keyCode, true);
        switch (keyCode) {
            case 65: /*a*/
            case 37: /*left*/ this.onKeyLeft = true; this.onKeyRight = false;
                break;
            case 68: /*d*/
            case 39: /*right*/ this.onKeyRight = true; this.onKeyLeft = false;
                break;
            case 87: /*w*/
            case 38: /*up*/ this.onKeyUp = true; this.onKeyDown = false;
                break;
            case 83: /*s*/
            case 40: /*down*/ this.onKeyDown = true; this.onKeyUp = false;
                break;
            case 16: /*Shift*/ this.onKeyShift = true;
                break;
            case 81: /*q*/
                if (!!document.pointerLockElement) {
                    document.exitPointerLock();
                    this.isUserInteracting = false;
                    this.isPointerInteracting = false;
                }
                else {
                    document.body.requestPointerLock();
                    this.isUserInteracting = true;
                    this.isPointerInteracting = true;
                }
                break;
            case 82: /*r*/
                console.log('alphaOffset = ' + THREE.MathUtils.radToDeg(this.orientationControls.alphaOffset));
                console.log('lon = ' + this.lon);
                console.log('dO.alpha = ' + this.orientationControls.deviceOrientation.alpha);
                break;
            default: break;
        }
    }

    setInteractingIfKeys = (keyCode, interacting) => {
        if (this.isPointerInteracting) {
            return
        }
        switch (keyCode) {
            case 65: /*a*/
            case 37: /*left*/
            case 68: /*d*/
            case 39: /*right*/
            case 87: /*w*/
            case 38: /*up*/
            case 83: /*s*/
            case 40: /*down*/
            case 16: /*Shift*/
                this.isUserInteracting = interacting;
                break;
            default: break;
        }
    }

    onDocumentKeyUp = (event) => {
        var keyCode = event.keyCode || event.which || event.charCode;
        this.setInteractingIfKeys(keyCode, false)
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
}

export default InnerViewControls;