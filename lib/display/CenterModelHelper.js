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

  _defineProperty(this, "loadModel", function (model_key, model) {
    var loader = _this.getLoader(model);

    _this.modelLoaderMap.set(model_key, loader);

    loader.loadObj(model);
  });

  _defineProperty(this, "loadModelList", function (model_list) {
    model_list && model_list.forEach(function (data) {
      _this.loadModel(data[0], data[1]);
    });
  });

  _defineProperty(this, "removeModel", function (model_key) {
    var modelLoader = _this.modelLoaderMap.get(model_key);

    modelLoader.remove();

    _this.modelLoaderMap.delete(model_key);
  });

  _defineProperty(this, "removeAllModel", function () {
    var loaderArray = Array.from(_this.modelLoaderMap.values());
    loaderArray.forEach(function (loader) {
      loader.remove();
    });

    _this.modelLoaderMap.clear();
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
    _this.modelLoaderMap.forEach(function (data) {
      var loader = data;
      loader.update();
    });
  });

  this.scene = scene;
  this.modelLoaderMap = new Map();
};

var _default = CenterModelHelper;
exports.default = _default;