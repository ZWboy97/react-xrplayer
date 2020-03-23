"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _FBXLoader = _interopRequireDefault(require("./loader/FBXLoader"));

var _ObjLoader = _interopRequireDefault(require("./loader/ObjLoader"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var CenterModelHelper = function CenterModelHelper(scene) {
  var _this = this;

  _classCallCheck(this, CenterModelHelper);

  _defineProperty(this, "loadObj", function (data) {
    _this.data = data;
    _this.loader = _this.getLoader(data);

    _this.loader.loadObj(data);
  });

  _defineProperty(this, "display", function () {
    if (!_this.loader) return;

    _this.loader.display();
  });

  _defineProperty(this, "remove", function () {
    if (!_this.loader) return;

    _this.loader.remove();
  });

  _defineProperty(this, "startAnimation", function () {
    if (!_this.loader) return;

    if (_this.data.modeFormat === 'fbx') {
      _this.loader.startAnimation();
    }
  });

  _defineProperty(this, "stopAnimation", function () {
    if (!_this.loader) return;

    if (_this.data.modeFormat === 'fbx') {
      _this.loader.stopAnimation();
    }
  });

  _defineProperty(this, "getLoader", function (data) {
    switch (data.modeFormat) {
      case 'fbx':
        return new _FBXLoader.default(_this.scene);

      case 'obj':
        return new _ObjLoader.default(_this.scene);

      default:
        return null;
    }
  });

  _defineProperty(this, "update", function () {
    if (!_this.loader) return;

    if (_this.data.modeFormat === 'fbx') {
      _this.loader.update();
    }
  });

  this.scene = scene;
  this.loader = null;
  this.data = null;
};

var _default = CenterModelHelper;
exports.default = _default;