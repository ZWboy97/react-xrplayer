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

var ObjLoader = function ObjLoader(scene) {
  var _this = this;

  _classCallCheck(this, ObjLoader);

  _defineProperty(this, "loadObj", function (data) {
    _this.data = data;
    var loader = new THREE.ObjectLoader();
    loader.load(data.objUrl, function (obj) {
      _this.obj = obj;
      var texture = new THREE.TextureLoader().load(data.texture);
      obj.material = new THREE.MeshBasicMaterial({
        map: texture
      });

      _this.scene.add(obj);

      obj.scale.set(data.scale, data.scale, data.scale); //网格模型缩放

      obj.geometry.center(); //几何体居中
    }, function (data) {
      console.log('loading json obj', data.loaded);
    }, function (e) {
      console.log('err', e);
    });
  });

  _defineProperty(this, "display", function () {
    _this.scene.add(_this.obj);
  });

  _defineProperty(this, "remove", function () {
    _this.scene.remove(_this.obj);

    _this.mixer = null;
    _this.animationAction = null;
  });

  _defineProperty(this, "update", function () {});

  this.scene = scene;
  this.obj = null;
  this.data = null;
};

var _default = ObjLoader;
exports.default = _default;