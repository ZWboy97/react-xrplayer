"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _tween = _interopRequireDefault(require("@tweenjs/tween.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var CameraMoveAction = function CameraMoveAction(camera, _endState) {
  var _this = this;

  var _duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5000;

  var _delay = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1000;

  _classCallCheck(this, CameraMoveAction);

  _defineProperty(this, "init", function (endState) {
    var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5000;
    var delay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1000;
    var coords = {
      // Start 
      x: _this.camera.position.x,
      y: _this.camera.position.y,
      z: _this.camera.position.z,
      fov: _this.camera.fov
    };
    _this.tween = new _tween.default.Tween(coords).to({
      x: endState.x,
      y: endState.y,
      z: endState.z,
      fov: endState.fov
    }, duration).delay(delay).easing(_tween.default.Easing.Quadratic.Out).onUpdate(function () {
      _this.camera.position.x = coords.x;
      _this.camera.position.y = coords.y;
      _this.camera.position.z = coords.z;
      _this.camera.fov = coords.fov;

      _this.camera.updateProjectionMatrix();
    }).onStart(function () {
      _this.onStartHandler && _this.onStartHandler();
    }).onComplete(function () {
      _this.onCompleteHandler && _this.onCompleteHandler();
    });
  });

  _defineProperty(this, "start", function () {
    if (_this.tween) {
      _this.tween.start();
    }
  });

  _defineProperty(this, "update", function () {
    _tween.default.update();
  });

  this.camera = camera;
  this.tween = null;
  this.onCompleteHandler = null;
  this.onStartHandler = null;
  this.init(_endState, _duration, _delay);
};

var _default = CameraMoveAction;
exports.default = _default;