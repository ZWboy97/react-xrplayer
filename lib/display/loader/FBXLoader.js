"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var THREE = _interopRequireWildcard(require("three"));

var _threeFbxloaderOffical = _interopRequireDefault(require("three-fbxloader-offical"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var MyFBXLoader = function MyFBXLoader(scene) {
  var _this = this;

  _classCallCheck(this, MyFBXLoader);

  _defineProperty(this, "loadObj", function (data) {
    var loader = new _threeFbxloaderOffical.default(); //创建一个FBX加载器

    loader.load(data.objUrl, function (obj) {
      _this.obj = obj;

      _this.display();

      console.log('load fbxobj success:', _this.obj);

      _this.obj.translateY(-80);

      _this.startAnimation();
    }, function (data) {
      console.log('load fbx obj', data.loaded);
    }, function (e) {
      console.log('load fbxobj error:', e);
    });
  });

  _defineProperty(this, "display", function () {
    _this.scene.add(_this.obj);

    var ambient = new THREE.AmbientLight(0xffffff);

    _this.scene.add(ambient);
  });

  _defineProperty(this, "remove", function () {
    _this.scene.remove(_this.obj);

    _this.mixer = null;
    _this.animationAction = null;
  });

  _defineProperty(this, "startAnimation", function () {
    _this.mixer = new THREE.AnimationMixer(_this.obj);
    _this.animationAction = _this.mixer.clipAction(_this.obj.animations[0]);

    _this.animationAction.play();
  });

  _defineProperty(this, "stopAnimation", function () {
    _this.animationAction && _this.animationAction.stop();
  });

  _defineProperty(this, "update", function () {
    if (_this.mixer) {
      var delta = _this.clock.getDelta(); //方法获得两帧的时间间隔


      _this.mixer.update(delta);
    }
  });

  this.scene = scene;
  this.mixer = null; //混合器

  this.obj = null;
  this.animationAction = null;
  this.clock = new THREE.Clock();
};

var _default = MyFBXLoader;
exports.default = _default;