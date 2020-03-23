"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var THREE = _interopRequireWildcard(require("three"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var InnerViewControls = function InnerViewControls(camera) {
  var _this = this;

  _classCallCheck(this, InnerViewControls);

  _defineProperty(this, "connect", function () {
    _this.isConnected = true;

    _this.initSphericalData();
  });

  _defineProperty(this, "disConnect", function () {
    _this.isConnected = false;
  });

  _defineProperty(this, "initSphericalData", function () {
    var spherical = new THREE.Spherical();
    var position = _this.camera.position;
    spherical.setFromCartesianCoords(position.x, position.y, position.z);
    _this.phi = spherical.phi;
    _this.theta = spherical.theta;
    _this.distance = spherical.radius;
    _this.lon = 90 - THREE.Math.radToDeg(_this.theta);
    _this.lat = 90 - THREE.Math.radToDeg(_this.phi);
  });

  _defineProperty(this, "initControlsListener", function () {
    _this.browser = window.navigator.userAgent.toLowerCase();

    if (_this.browser.indexOf('mobile') > 0) {
      document.addEventListener('touchstart', _this.onTouchstart, false);
      document.addEventListener('touchmove', _this.onTouchmove, false);
      document.addEventListener('touchend', _this.onTouchend, false);
      document.addEventListener('wheel', _this.onDocumentMouseWheel, false);
    } else {
      document.addEventListener('mousedown', _this.onDocumentMouseDown, false);
      document.addEventListener('mousemove', _this.onDocumentMouseMove, false);
      document.addEventListener('mouseup', _this.onDocumentMouseUp, false);
      document.addEventListener('wheel', _this.onDocumentMouseWheel, false); //添加键盘监听

      document.addEventListener('keydown', _this.onDocumentKeyDown, false);
      document.addEventListener('keyup', _this.onDocumentKeyUp, false);
    }
  });

  _defineProperty(this, "update", function () {
    //键盘监听执行
    var dLon = 2;
    var dLat = 2;

    if (_this.onKeyShift) {
      dLon = 10;
      dLat = 10;
    }

    if (_this.onKeyLeft) {
      _this.lon -= dLon;
    }

    if (_this.onKeyRight) {
      _this.lon += dLon;
    }

    if (_this.onKeyUp) {
      _this.lat -= dLat;
    }

    if (_this.onKeyDown) {
      _this.lat += dLat;
    }

    if (_this.isConnected) {
      _this.updateCameraPosition();
    }

    _this.camera.lookAt(_this.camera.target);
  });

  _defineProperty(this, "updateCameraPosition", function () {
    _this.lat = Math.max(-85, Math.min(85, _this.lat));
    _this.phi = THREE.Math.degToRad(90 - _this.lat);
    _this.theta = THREE.Math.degToRad(_this.lon); // 球坐标系与直角坐标系的转换

    _this.camera.position.x = _this.distance * Math.sin(_this.phi) * Math.cos(_this.theta);
    _this.camera.position.y = _this.distance * Math.cos(_this.phi);
    _this.camera.position.z = _this.distance * Math.sin(_this.phi) * Math.sin(_this.theta);
  });

  _defineProperty(this, "onDocumentMouseDown", function (event) {
    if (!!document.pointerLockElement) {
      return;
    }

    event.preventDefault();
    console.log('鼠标点击Down');
    _this.isUserInteracting = true; // 记录鼠标点击屏幕坐标

    _this.onPointerDownPointerX = event.clientX;
    _this.onPointerDownPointerY = event.clientY; // 记录点击时候经纬度

    _this.onPointerDownLon = _this.lon; // 经度

    _this.onPointerDownLat = _this.lat; // 纬度
  });

  _defineProperty(this, "onDocumentMouseMove", function (event) {
    if (_this.isUserInteracting === true) {
      // 在鼠标Down位置叠加偏移量
      _this.lon = (_this.onPointerDownPointerX - event.clientX) * 0.1 + _this.onPointerDownLon;
      _this.lat = (_this.onPointerDownPointerY - event.clientY) * 0.1 + _this.onPointerDownLat; // 用于立体场景音效
      // mouseActionLocal([lon, lat]); 
    }

    if (!!document.pointerLockElement) {
      _this.lon = event.movementX * 0.1 + _this.lon;
      _this.lat = event.movementY * 0.1 + _this.lat;
    }
  });

  _defineProperty(this, "onDocumentMouseUp", function (event) {
    _this.isUserInteracting = false;
  });

  _defineProperty(this, "onTouchstart", function (event) {
    if (event.targetTouches.length === 1) {
      console.log('touch', 'start');
      _this.isUserInteracting = true; // 记录滑动开始的坐标

      var touch = event.targetTouches[0];
      _this.onPointerDownPointerX = touch.pageX; // 把元素放在手指所在的位置

      _this.onPointerDownPointerY = touch.pageY; // 记录滑动开始时候的经纬度

      _this.onPointerDownLon = _this.lon; // 经度

      _this.onPointerDownLat = _this.lat; // 纬度
    }
  });

  _defineProperty(this, "onTouchmove", function (event) {
    if (_this.isUserInteracting === true) {
      var touch = event.targetTouches[0];
      console.log('touching', touch.pageX);
      _this.lon = (parseFloat(_this.onPointerDownPointerX) - touch.pageX) * 0.1 + _this.onPointerDownLon;
      _this.lat = parseFloat(_this.onPointerDownPointerY - touch.pageY) * 0.1 + _this.onPointerDownLat; // 用于立体场景音效
      // mouseActionLocal([lon, lat]); 
    }
  });

  _defineProperty(this, "onTouchend", function (event) {
    _this.isUserInteracting = false;
  });

  _defineProperty(this, "onDocumentMouseWheel", function (event) {
    _this.distance += event.deltaY * 0.5;

    if (_this.distance <= 0) {
      _this.distance = 0;
    } else if (_this.distance > 0 && _this.distance < 1000) {
      if (!_this.innerView) {
        console.log('进来', _this.camera.position.y);
        _this.innerView = true;
      }
    } else if (_this.distance >= 1000 && _this.distance <= 1500) {
      if (_this.innerView) {
        console.log('出来');
        _this.innerView = false;
      }
    } else if (_this.distance >= 1500) {//this.distance = 1500;
    }

    console.log('distance', _this.distance);
  });

  _defineProperty(this, "onDocumentKeyDown", function (event) {
    event.preventDefault();
    var keyCode = event.keyCode || event.which || event.charCode;

    switch (keyCode) {
      case 65:
      /*a*/

      case 37:
        /*left*/
        _this.onKeyLeft = true;
        _this.onKeyRight = false;
        break;

      case 68:
      /*d*/

      case 39:
        /*right*/
        _this.onKeyRight = true;
        _this.onKeyLeft = false;
        break;

      case 87:
      /*w*/

      case 38:
        /*up*/
        _this.onKeyUp = true;
        _this.onKeyDown = false;
        break;

      case 83:
      /*s*/

      case 40:
        /*down*/
        _this.onKeyDown = true;
        _this.onKeyUp = false;
        break;

      case 16:
        /*Shift*/
        _this.onKeyShift = true;
        break;

      case 81:
        /*q*/
        if (!!document.pointerLockElement) {
          document.exitPointerLock();
        } else {
          document.body.requestPointerLock();
          _this.isUserInteracting = false;
        }

        break;

      default:
        break;
    }
  });

  _defineProperty(this, "onDocumentKeyUp", function (event) {
    var keyCode = event.keyCode || event.which || event.charCode;

    switch (keyCode) {
      case 65:
      /*a*/

      case 37:
        /*left*/
        _this.onKeyLeft = false;
        break;

      case 68:
      /*d*/

      case 39:
        /*right*/
        _this.onKeyRight = false;
        break;

      case 87:
      /*w*/

      case 38:
        /*up*/
        _this.onKeyUp = false;
        break;

      case 83:
      /*s*/

      case 40:
        /*down*/
        _this.onKeyDown = false;
        break;

      case 16:
        /*L_Shift*/
        _this.onKeyShift = false;
        break;

      default:
        break;
    }
  });

  this.camera = camera;
  this.isConnected = false;
  this.isUserInteracting = false; // 标记用户是否正在交互中

  this.onMouseDownMouseX = 0; // 鼠标点击的初始坐标x

  this.onMouseDownMouseY = 0; // 鼠标点击的初始坐标y

  this.lon = 0; // 经度

  this.onMouseDownLon = 0;
  this.lat = 0; // 纬度

  this.onMouseDownLat = 0;
  this.phi = 0;
  this.theta = 0;
  this.distance = 10;
  this.onPointerDownPointerX = 0;
  this.onPointerDownPointerY = 0;
  this.onPointerDownLon = 0;
  this.onPointerDownLat = 0; //键盘交互控件

  this.onKeyLeft = false;
  this.onKeyRight = false;
  this.onKeyUp = false;
  this.onKeyDown = false;
  this.onKeyShift = false;
  this.initControlsListener();
}
/**
 * 相机与控制器连接，数据生效
 */
;

var _default = InnerViewControls;
exports.default = _default;