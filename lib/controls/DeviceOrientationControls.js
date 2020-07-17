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

var DeviceOrientationControls = function DeviceOrientationControls(camera) {
  var _this = this;

  _classCallCheck(this, DeviceOrientationControls);

  _defineProperty(this, "onDeviceOrientationChangeEvent", function (event) {
    _this.deviceOrientation = event;
  });

  _defineProperty(this, "onScreenOrientationChangeEvent", function () {
    _this.screenOrientation = window.orientation || 0;
  });

  _defineProperty(this, "connect", function (alpha0) {
    window.addEventListener('orientationchange', _this.onScreenOrientationChangeEvent, false);
    window.addEventListener('deviceorientation', _this.onDeviceOrientationChangeEvent, false);

    _this.onScreenOrientationChangeEvent(); // run once on load


    _this.enabled = true;
  });

  _defineProperty(this, "disConnect", function () {
    _this.enabled = false;
    window.removeEventListener('orientationchange', _this.onScreenOrientationChangeEvent, false);
    window.removeEventListener('deviceorientation', _this.onDeviceOrientationChangeEvent, false);
  });

  _defineProperty(this, "update", function (distance) {
    if (_this.enabled === false) return; // get data from device

    var alpha = _this.deviceOrientation.alpha ? THREE.Math.degToRad(_this.deviceOrientation.alpha) : 0; // Z

    alpha -= _this.alphaOffset;
    var beta = _this.deviceOrientation.beta ? THREE.Math.degToRad(_this.deviceOrientation.beta) : 0; // X

    var gamma = _this.deviceOrientation.gamma ? THREE.Math.degToRad(_this.deviceOrientation.gamma) : 0; // Y

    var orient = _this.screenOrientation ? THREE.Math.degToRad(_this.screenOrientation) : 0; // Orient

    var zee = new THREE.Vector3(0, 0, 1);
    var q0 = new THREE.Quaternion(); // Quaternions are used in three.js to represent rotations.

    var q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis

    var euler = new THREE.Euler(); // 欧拉对象，描述xyz轴上的一个旋转序列

    euler.set(beta, alpha, -gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us

    _this.camera.quaternion.setFromEuler(euler); // 设置旋转角度


    _this.camera.quaternion.multiply(q1); // 执行方位角的转换 


    _this.camera.quaternion.multiply(q0.setFromAxisAngle(zee, -orient)); // 横竖屏切换旋转
    // TODO distance同步视野大小,暂时先这么解决，澄亮正改用通过fov参数控制视野方案


    var cameraDirtection = new THREE.Vector3(0, 0, 0);

    _this.camera.getWorldDirection(cameraDirtection);

    cameraDirtection.multiplyScalar(-distance);

    _this.camera.position.copy(cameraDirtection);

    _this.camera.quaternion.copy(_this.camera.quaternion);
  });

  this.camera = camera;
  this.enabled = false;
  this.deviceOrientation = {
    alpha: 0,
    beta: 90,
    gamma: 0
  };
  this.screenOrientation = 0;
  this.alphaOffset = 0;
};

var _default = DeviceOrientationControls;
exports.default = _default;