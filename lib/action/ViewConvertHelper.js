"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _CameraMoveAction = _interopRequireDefault(require("./CameraMoveAction"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ViewConvertHelper = function ViewConvertHelper(camera, controls) {
  var _this = this;

  _classCallCheck(this, ViewConvertHelper);

  _defineProperty(this, "toNormalView", function () {
    var durtime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 8000;
    var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    if (_this.state && _this.state === 'normal') return;
    _this.cameraMoveAction = new _CameraMoveAction.default(_this.camera, {
      x: 0,
      y: 0,
      z: 100,
      fov: 80
    }, durtime, delay);

    _this.cameraMoveAction.onStartHandler = function () {
      _this.controls && _this.controls.disConnect();
    };

    _this.cameraMoveAction.onCompleteHandler = function () {
      _this.controls && _this.controls.connect();
      _this.state = 'planet';
    };

    _this.cameraMoveAction.start();
  });

  _defineProperty(this, "toPlanetView", function () {
    var durtime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 8000;
    var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    if (_this.state && _this.state === 'planet') return;
    _this.cameraMoveAction = new _CameraMoveAction.default(_this.camera, {
      x: 0,
      y: 450,
      z: 0,
      fov: 150
    }, durtime, delay);

    _this.cameraMoveAction.onStartHandler = function () {
      _this.controls && _this.controls.disConnect();
    };

    _this.cameraMoveAction.onCompleteHandler = function () {
      _this.controls && _this.controls.connect();
      _this.state = 'planet';
    };

    _this.cameraMoveAction.start();
  });

  this.camera = camera;
  this.state = null;
  this.controls = controls;
  this.cameraMoveAction = null;
  this.onCompleteHandler = null;
  this.onStartHandler = null;
};

var _default = ViewConvertHelper;
exports.default = _default;