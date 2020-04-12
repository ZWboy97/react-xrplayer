"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var THREE = _interopRequireWildcard(require("three"));

var _InnerViewControls = _interopRequireDefault(require("../controls/InnerViewControls"));

var _SpriteShapeHelper = _interopRequireDefault(require("../display/SpriteShapeHelper"));

var _CenterModelHelper = _interopRequireDefault(require("../display/CenterModelHelper"));

var _tween = _interopRequireDefault(require("@tweenjs/tween.js"));

var _ViewConvertHelper = _interopRequireDefault(require("../action/ViewConvertHelper"));

var _TextureHelper = _interopRequireDefault(require("../texture/TextureHelper"));

var _SpriteParticleHelper = _interopRequireDefault(require("../display/SpriteParticleHelper"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var XRPlayerManager = function XRPlayerManager(mount, initProps) {
  var _this = this;

  _classCallCheck(this, XRPlayerManager);

  _defineProperty(this, "init", function () {
    _this.initCamera();

    _this.initScene();

    _this.initRenderer();

    _this.animate();

    console.log('domElement', _this.renderer.domElement.getBoundingClientRect().y);
  });

  _defineProperty(this, "initCamera", function () {
    var _this$props = _this.props,
        camera_fov = _this$props.camera_fov,
        camera_far = _this$props.camera_far,
        camera_near = _this$props.camera_near,
        position = _this$props.camera_position,
        target = _this$props.camera_target;
    var camera = new THREE.PerspectiveCamera(camera_fov, _this.mount.clientWidth / _this.mount.clientHeight, camera_near, camera_far);
    var renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    _this.renderer = renderer;
    camera.position.set(position.x, position.y, position.z);
    camera.target = new THREE.Vector3(target.x, target.y, target.z);
    _this.camera = camera;
    _this.innerViewControls = new _InnerViewControls.default(_this.camera);
  });

  _defineProperty(this, "initScene", function () {
    var _this$props2 = _this.props,
        textureResource = _this$props2.scene_texture_resource,
        isAxesHelperDisplay = _this$props2.axes_helper_display;
    _this.sceneContainer = document.getElementById('video');
    var geometry = new THREE.SphereGeometry(500, 80, 40); // 球体

    geometry.scale(-1, 1, 1);
    _this.sceneTextureHelper = new _TextureHelper.default(_this.sceneContainer);

    var texture = _this.sceneTextureHelper.loadTexture(textureResource);

    var material = new THREE.MeshBasicMaterial({
      map: texture
    });
    _this.sceneMesh = new THREE.Mesh(geometry, material);
    _this.scene = new THREE.Scene();

    _this.scene.add(_this.sceneMesh);

    if (isAxesHelperDisplay) {
      var axisHelper = new THREE.AxesHelper(1000); //每个轴的长度

      _this.scene.add(axisHelper);
    }
  });

  _defineProperty(this, "initRenderer", function () {
    var renderer = _this.renderer;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(_this.mount.clientWidth, _this.mount.clientHeight);
    renderer.sortObjects = false;
    renderer.autoClear = false;

    _this.mount.appendChild(renderer.domElement);
  });

  _defineProperty(this, "animate", function () {
    requestAnimationFrame(_this.animate);

    if (_this.innerView) {
      _this.innerViewControls && _this.innerViewControls.update();
    } else {//this.controls.update();
    }

    if (_this.centerModelHelper) {
      _this.centerModelHelper.update();
    }

    if (_this.spriteParticleHelper) {
      _this.spriteParticleHelper.update();
    }

    _tween.default.update(); // 不要轻易去掉，渐变动画依赖该库


    _this.renderer.render(_this.scene, _this.camera);
  });

  _defineProperty(this, "setSenceResource", function (res) {
    _this.sceneTextureHelper && _this.sceneTextureHelper.unloadResource();
    _this.sceneTextureHelper = new _TextureHelper.default(_this.sceneContainer);

    var texture = _this.sceneTextureHelper.loadTexture(res);

    var material = new THREE.MeshBasicMaterial({
      map: texture
    });
    _this.sceneMesh.material = material;
  });

  _defineProperty(this, "startDisplaySenceResource", function () {
    if (_this.sceneTextureHelper) {
      _this.sceneTextureHelper.startDisplay();
    }
  });

  _defineProperty(this, "pauseDisplaySenceResource", function () {
    if (_this.sceneTextureHelper) {
      _this.sceneTextureHelper.pauseDisplay();
    }
  });

  _defineProperty(this, "getEnableAutoRotate", function () {
    return _this.innerViewControls.getEnableAutoRotate();
  });

  _defineProperty(this, "setEnableAutoRotate", function (enable) {
    _this.innerViewControls.setEnableAutoRotate(enable);
  });

  _defineProperty(this, "setAutoRotateSpeed", function (speed) {
    _this.innerViewControls.setAutoRotateSpeed(speed);
  });

  _defineProperty(this, "setAutoRotateDirection", function (direction) {
    _this.innerViewControls.setAutoRotateDirection(direction);
  });

  _defineProperty(this, "resetHotSpotsData", function () {
    if (!_this.spriteShapeHelper) {
      _this.spriteEventList = new Map();
      _this.spriteShapeHelper = new _SpriteShapeHelper.default(_this.scene, _this.camera, _this.renderer);
    } else {
      _this.spriteEventList.clear();
    }
  });

  _defineProperty(this, "setHotSpots", function (hot_spot_list, event_list) {
    _this.resetHotSpotsData();

    _this.spriteEventList = new Map(event_list);

    _this.spriteShapeHelper.setHotSpotList(hot_spot_list);

    _this.spriteShapeHelper.objectClickHandler = function (intersects) {
      var key = intersects[0].object.name;

      if (_this.spriteEventList.has(key)) {
        var data = _this.spriteEventList.get(key);

        _this.handler('hot_spot_click', {
          data: data
        });
      }

      console.log(intersects[0].object.name);
    };
  });

  _defineProperty(this, "addHotSpot", function (hot_spot, event) {
    _this.spriteShapeHelper.addHotSpot(hot_spot);

    if (event != null && !_this.spriteEventList.has(event.key)) {
      _this.spriteEventList.set(event.key, event.value);
    }
  });

  _defineProperty(this, "removeHotSpot", function (hot_spot_key) {
    _this.spriteShapeHelper.removeHotSpot(hot_spot_key);
  });

  _defineProperty(this, "resetModels", function () {
    if (!_this.centerModelHelper) {
      _this.centerModelHelper = new _CenterModelHelper.default(_this.scene);
    }
  });

  _defineProperty(this, "setModels", function (model_list) {
    _this.resetModels();

    _this.centerModelHelper.loadModelList(model_list);
  });

  _defineProperty(this, "addModel", function (model_key, model) {
    _this.centerModelHelper.loadModel(model_key, model);
  });

  _defineProperty(this, "removeModel", function (model_key) {
    _this.centerModelHelper.removeModel(model_key);
  });

  _defineProperty(this, "removeAllModel", function () {
    _this.centerModelHelper.removeAllModel();
  });

  _defineProperty(this, "toNormalView", function () {
    var durtime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 8000;
    var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    if (!_this.viewConvertHelper) {
      _this.viewConvertHelper = new _ViewConvertHelper.default(_this.camera, _this.innerViewControls);
    }

    _this.innerViewControls.disConnect();

    _this.viewConvertHelper.toNormalView(durtime, delay);
  });

  _defineProperty(this, "toPlanetView", function () {
    var durtime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 8000;
    var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    if (!_this.viewConvertHelper) {
      _this.viewConvertHelper = new _ViewConvertHelper.default(_this.camera, _this.innerViewControls);
    }

    _this.innerViewControls.disConnect();

    _this.viewConvertHelper.toPlanetView(durtime, delay);
  });

  _defineProperty(this, "connectCameraControl", function () {
    _this.innerViewControls.connect();
  });

  _defineProperty(this, "disConnectCameraControl", function () {
    _this.innerViewControls.disConnect();
  });

  _defineProperty(this, "getEnableOrientationControls", function () {
    return _this.innerViewControls.getEnableOrientationControls();
  });

  _defineProperty(this, "enableOrientationControls", function () {
    _this.innerViewControls.enableOrientationControls();
  });

  _defineProperty(this, "disableOrientationControls", function () {
    _this.innerViewControls.disableOrientationControls();
  });

  _defineProperty(this, "getCameraPosition", function () {
    return _this.innerViewControls.getCameraPosition();
  });

  _defineProperty(this, "setCameraPosition", function (x, y, z) {
    _this.innerViewControls.setCameraPosition(x, y, z);
  });

  _defineProperty(this, "setCameraFov", function (fov) {
    _this.innerViewControls.setCameraFov(fov);
  });

  _defineProperty(this, "getCameraFov", function () {
    return _this.innerViewControls.getCameraFov();
  });

  _defineProperty(this, "setFovVerticalScope", function (bottom, top) {
    _this.innerViewControls.setFovVerticalScope(bottom, top);
  });

  _defineProperty(this, "getFovVerticalScope", function () {
    return _this.innerViewControls.getFovVerticalScope();
  });

  _defineProperty(this, "setParticleEffectRes", function (res) {
    if (!_this.spriteParticleHelper) {
      _this.spriteParticleHelper = new _SpriteParticleHelper.default(_this.scene);
    }

    _this.spriteParticleHelper.setResource(res);
  });

  _defineProperty(this, "getEnableParticleDisplay", function () {
    return _this.spriteParticleHelper.getEnableDisplay();
  });

  _defineProperty(this, "enableParticleDisplay", function (enable) {
    if (enable) {
      _this.spriteParticleHelper.enableDisplay();
    } else {
      _this.spriteParticleHelper.disableDisplay();
    }
  });

  _defineProperty(this, "onWindowResize", function (mountWidth, mountHeight) {
    _this.camera.aspect = mountWidth / mountHeight;

    _this.camera.updateProjectionMatrix();

    _this.renderer.setSize(mountWidth, mountHeight);
  });

  _defineProperty(this, "destroy", function () {
    _this.mount.removeChild(_this.renderer.domElement);
  });

  this.mount = mount; // Threejs渲染挂载节点

  this.props = initProps; // 初始化参数

  this.scene = null;
  this.sceneMesh = null;
  this.camera = null;
  this.renderer = null;
  this.controls = null;
  this.sceneContainer = null; // 全景背景挂载节点

  this.sceneTextureHelper = null; //全景场景纹理加载控制器

  this.handler = null;
  this.innerView = true; // 是否是内视角，之后想做多场景切换

  this.innerViewControls = null;
  this.spriteShapeHelper = null;
  this.spriteParticleHelper = null; // 粒子展示

  this.centerModelHelper = null;
  this.viewConvertHelper = null;
  this.spriteEventList = null;
  this.init();
};

var _default = XRPlayerManager;
exports.default = _default;