"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var THREE = _interopRequireWildcard(require("three"));

var _reactRedux = require("react-redux");

var _basic = require("./redux/basic.redux");

var _InnerViewControls = _interopRequireDefault(require("./controls/InnerViewControls"));

var _SpriteShapeHelper = _interopRequireDefault(require("./display/SpriteShapeHelper"));

var _EffectContainer = _interopRequireDefault(require("./effect/EffectContainer"));

require("./App.css");

var _CenterModelHelper = _interopRequireDefault(require("./display/CenterModelHelper"));

var _tween = _interopRequireDefault(require("@tweenjs/tween.js"));

var _ViewConvertHelper = _interopRequireDefault(require("./action/ViewConvertHelper"));

var _fullscreen = _interopRequireDefault(require("./utils/fullscreen"));

var _TextureHelper = _interopRequireDefault(require("./texture/TextureHelper"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _createSuper(Derived) { return function () { var Super = _getPrototypeOf(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Player = /*#__PURE__*/function (_Component) {
  _inherits(Player, _Component);

  var _super = _createSuper(Player);

  function Player(props) {
    var _this;

    _classCallCheck(this, Player);

    _this = _super.call(this, props);

    _defineProperty(_assertThisInitialized(_this), "state", {
      showingEffect: false,
      effectData: null,
      isFullScreen: false
    });

    _defineProperty(_assertThisInitialized(_this), "initScene", function () {
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(150, _this.mount.clientWidth / _this.mount.clientHeight, 0.001, 10000);
      var renderer = new THREE.WebGLRenderer({
        antialias: true
      });
      _this.renderer = renderer;
      camera.position.set(0, 450, 0);
      camera.target = new THREE.Vector3(0, 0, 0);
      _this.scene = scene;
      _this.camera = camera;
    });

    _defineProperty(_assertThisInitialized(_this), "initMesh", function () {
      var geometry = new THREE.SphereGeometry(500, 60, 40); // 球体

      geometry.scale(-1, 1, 1);
      var video = _this.videoNode;
      _this.video = video;
      var textureHelper = new _TextureHelper.default(video);
      var hlsUrl = "http://cache.utovr.com/s1e3tzoku70yk8mpa3/L3_5dxsrk4kh56gc4l1_v2.m3u8";
      var texture = textureHelper.loadHlsVideo(hlsUrl);
      var material = new THREE.MeshBasicMaterial({
        map: texture
      }); // 创建网格 = 几何体 + 材质

      var mesh = new THREE.Mesh(geometry, material); // 创建场景，并添加mesh

      _this.scene = new THREE.Scene();

      _this.scene.add(mesh);

      var axisHelper = new THREE.AxesHelper(1000); //每个轴的长度

      _this.scene.add(axisHelper);
    });

    _defineProperty(_assertThisInitialized(_this), "initEvent", function () {
      window.addEventListener('resize', _this.onWindowResize, false);
    });

    _defineProperty(_assertThisInitialized(_this), "initspriteData", function () {
      _this.spriteData = new Map();

      _this.spriteData.set('infocard', {
        id: 'infocard',
        type: 'infocard',
        iframeUrl: "https://gs.ctrip.com/html5/you/place/14.html"
      });

      _this.spriteData.set('image', {
        id: 'image',
        type: 'image',
        imageUrl: "https://pic-cloud-bupt.oss-cn-beijing.aliyuncs.com/5c882ee6443a5.jpg",
        jumpUrl: 'http://www.youmuvideo.com'
      });

      _this.spriteData.set('video', {
        id: 'video',
        type: 'video',
        videoUrl: 'https://video-cloud-bupt.oss-cn-beijing.aliyuncs.com/hangzhou.mp4'
      });

      _this.spriteData.set('control', {
        id: 'control',
        type: 'control'
      });
    });

    _defineProperty(_assertThisInitialized(_this), "initDisplay", function () {
      _this.initspriteData();

      _this.spriteShapeHelper = new _SpriteShapeHelper.default(_this.scene, _this.camera);

      _this.spriteShapeHelper.initPoints();

      _this.spriteShapeHelper.objectClickHandler = function (intersects) {
        var key = intersects[0].object.name;

        if (_this.spriteData.has(key)) {
          _this.setState({
            showingEffect: true,
            effectData: _this.spriteData.get(key)
          });
        }

        console.log(intersects[0].object.name);
      };

      _this.centerModelHelper = new _CenterModelHelper.default(_this.scene); // this.centerModelHelper.loadObj({
      //   objUrl: "model.json",
      //   texture: "texture1.png",
      //   modeFormat: "obj",
      //   scale: 1
      // });

      _this.centerModelHelper.loadObj({
        objUrl: "SambaDancing.fbx",
        texture: "texture1.png",
        modeFormat: "fbx",
        scale: 1
      });
    });

    _defineProperty(_assertThisInitialized(_this), "initAction", function () {
      _this.viewConvertHelper = new _ViewConvertHelper.default(_this.camera, _this.innerViewControls);

      _this.viewConvertHelper.toNormalView(8000, 2000);
    });

    _defineProperty(_assertThisInitialized(_this), "onWindowResize", function () {
      _this.camera.aspect = window.innerWidth / window.innerHeight;

      _this.camera.updateProjectionMatrix();

      _this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    _defineProperty(_assertThisInitialized(_this), "initRenderer", function () {
      var renderer = _this.renderer;
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.sortObjects = false;
      renderer.autoClear = false;

      _this.mount.appendChild(renderer.domElement);
    });

    _defineProperty(_assertThisInitialized(_this), "animate", function () {
      requestAnimationFrame(_this.animate);

      if (_this.innerView) {
        _this.innerViewControls && _this.innerViewControls.update();
      } else {
        _this.controls.update();
      }

      if (_this.centerModelHelper) {
        _this.centerModelHelper.update();
      }

      _tween.default.update(); // 不要轻易去掉，渐变动画依赖该库


      _this.renderer.render(_this.scene, _this.camera);
    });

    _defineProperty(_assertThisInitialized(_this), "initControls", function () {
      _this.innerViewControls = new _InnerViewControls.default(_this.camera);

      _this.innerViewControls.connect();
    });

    _this.mount = null;
    _this.scene = null;
    _this.camera = null;
    _this.renderer = null;
    _this.controls = null;
    _this.videoNode = null;
    _this.innerView = true; // 是否是内视角

    _this.innerViewControls = null;
    _this.spriteShapeHelper = null;
    _this.centerModelHelper = null;
    _this.viewConvertHelper = null;
    _this.spriteData = null;
    return _this;
  }

  _createClass(Player, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.initScene();
      this.initMesh();
      this.initEvent();
      this.initControls();
      this.animate();
      this.initDisplay();
      this.initRenderer();
      this.initAction(); //TODO test redux 

      this.props.fetchLiveConfigure();
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.mount.removeChild(this.renderer.domElement);
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      // TODO test redux state
      console.log('redux.data.live_configure', this.props.live_configure);
      return _react.default.createElement(_fullscreen.default, {
        enabled: this.state.isFullScreen,
        onChange: function onChange(isFull) {
          return _this2.setState({
            isFullScreen: isFull
          });
        }
      }, _react.default.createElement("div", {
        style: {
          width: '100vw',
          height: '100vh',
          background: '#888',
          overflow: "hidden"
        }
      }, _react.default.createElement("div", {
        id: "canvas",
        style: {
          width: '100%',
          height: '100%',
          background: '#888'
        },
        ref: function ref(mount) {
          _this2.mount = mount;
        }
      }), this.state.showingEffect ? _react.default.createElement(_EffectContainer.default, {
        data: this.state.effectData,
        onCloseClickHandler: function onCloseClickHandler() {
          _this2.setState({
            effectData: null
          });
        }
      }) : "", _react.default.createElement("video", {
        id: "video",
        style: {
          display: "none"
        },
        ref: function ref(mount) {
          _this2.videoNode = mount;
        }
      }), _react.default.createElement("div", {
        id: "display",
        style: {
          display: "none"
        }
      })));
    }
  }]);

  return Player;
}(_react.Component);

var _default = (0, _reactRedux.connect)(function (state) {
  return state.basic;
}, {
  fetchLiveConfigure: _basic.fetchLiveConfigure
})(Player);

exports.default = _default;