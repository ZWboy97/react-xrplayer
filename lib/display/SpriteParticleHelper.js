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

/**
 * 例子特效展示
 */
var SpriteParticleHelper =
/**
 * scene:   当前场景
 * url:     贴图文件地址
 * num:     粒子个数
 * range:   粒子所处范围，范围为立方体，range为立方体边长，立方体中心为(0,0,0)
 * color:   粒子颜色
 * sizeAttenuation: 是否随摄像机远近调整大小，true随远近缩放
 */
function SpriteParticleHelper(scene) {
  var _this = this;

  _classCallCheck(this, SpriteParticleHelper);

  _defineProperty(this, "setResource", function (res) {
    var _res$url = res.url,
        url = _res$url === void 0 ? "" : _res$url,
        _res$num = res.num,
        num = _res$num === void 0 ? 5000 : _res$num,
        _res$range = res.range,
        range = _res$range === void 0 ? 500 : _res$range,
        _res$color = res.color,
        color = _res$color === void 0 ? 0xffffff : _res$color,
        _res$sizeAttenuation = res.sizeAttenuation,
        sizeAttenuation = _res$sizeAttenuation === void 0 ? true : _res$sizeAttenuation;
    _this.url = url;
    _this.num = num;
    _this.range = range;
    _this.color = color;
    _this.sizeAttenuation = sizeAttenuation;

    _this.initGroup();
  });

  _defineProperty(this, "initGroup", function () {
    if (_this.group) {
      _this.scene.remove(_this.group);
    }

    _this.group = new THREE.Group();
    var textureLoader = new THREE.TextureLoader();
    var spriteMap = textureLoader.load(_this.url);
    var spriteMaterial = new THREE.SpriteMaterial({
      map: spriteMap,
      color: _this.color,
      sizeAttenuation: _this.sizeAttenuation,
      blending: THREE.AdditiveBlending,
      depthTest: false
    });

    for (var i = 0; i < _this.num; i++) {
      var sprite = new THREE.Sprite(spriteMaterial);
      sprite.x = Math.random() * _this.range - _this.range / 2;
      sprite.y = Math.random() * _this.range - _this.range / 2;
      sprite.z = Math.random() * _this.range - _this.range / 2;
      sprite.position.set(sprite.x, sprite.y, sprite.z);
      sprite.velocityY = 0.1 + Math.random() / 5;
      sprite.velocityX = (Math.random() - 0.5) / 3;
      sprite.velocityZ = (Math.random() - 0.5) / 3;

      _this.group.add(sprite);
    }
  });

  _defineProperty(this, "getEnableDisplay", function () {
    return _this.isEnableDisplay;
  });

  _defineProperty(this, "enableDisplay", function () {
    if (_this.group) {
      _this.scene.add(_this.group);

      _this.isEnableDisplay = true;
    }
  });

  _defineProperty(this, "disableDisplay", function () {
    if (_this.group) {
      _this.scene.remove(_this.group);

      _this.isEnableDisplay = false;
    }
  });

  _defineProperty(this, "update", function () {
    var range = _this.range;

    _this.group.children.forEach(function (u) {
      u.y = u.y - u.velocityY;
      u.x = u.x - u.velocityX;
      u.z = u.z - u.velocityZ;
      if (u.y <= -range / 2) u.y = range;
      if (u.x <= -range / 2 || u.x >= range / 2) u.velocityX = u.velocityX * -1;
      if (u.z <= -range / 2 || u.z >= range / 2) u.velocityZ = u.velocityZ * -1;
      u.position.set(u.x, u.y, u.z);
    });
  });

  this.scene = scene;
  this.url = null;
  this.num = 5000;
  this.range = 500;
  this.color = 0xffffff;
  this.sizeAtEtenuation = true;
  this.isEnableDisplay = false;
  this.group = null;
};

var _default = SpriteParticleHelper;
exports.default = _default;