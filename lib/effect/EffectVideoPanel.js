"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

require("../style/EffectVideoPanel.less");

var _hls = _interopRequireDefault(require("hls.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { return function () { var Super = _getPrototypeOf(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var EffectVideoPanel = /*#__PURE__*/function (_Component) {
  _inherits(EffectVideoPanel, _Component);

  var _super = _createSuper(EffectVideoPanel);

  function EffectVideoPanel(props) {
    var _this;

    _classCallCheck(this, EffectVideoPanel);

    _this = _super.call(this, props);

    _defineProperty(_assertThisInitialized(_this), "loadMp4Video", function () {
      _this.video.src = _this.props.videoUrl;

      _this.video.play();
    });

    _defineProperty(_assertThisInitialized(_this), "loadHlsVideo", function () {
      if (_hls.default.isSupported()) {
        console.log('hls', 'support');

        _this.hls.attachMedia(_this.video);

        _this.hls.loadSource(_this.props.videoUrl);

        _this.hls.on(_hls.default.Events.MANIFEST_PARSED, function () {
          _this.video.play();

          console.log('videoplay');
        });
      } else {
        console.log('设备不支持');
        alert("设备不支持");
      }
    });

    _defineProperty(_assertThisInitialized(_this), "onCloseClickListener", function (e) {
      e.preventDefault();

      if (_this.props.onCloseClickHandler) {
        _this.props.onCloseClickHandler();
      }
    });

    _this.hls = null;
    _this.video = null;
    return _this;
  }

  _createClass(EffectVideoPanel, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.hls = new _hls.default();
      this.video = this.videoNode;
      this.video.loop = true;
      this.video.muted = true;
      console.log('videoUrl', this.props.videoUrl);
      this.video.setAttribute('webkit-playsinline', 'webkit-playsinline');
      var videoUrl = this.props.videoUrl;

      if (videoUrl.endsWith('.mp4')) {
        this.loadMp4Video();
      } else if (videoUrl.endsWith('.m3u8')) {
        this.loadHlsVideo();
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.hls.destroy();
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      return /*#__PURE__*/_react.default.createElement("div", {
        className: "overlay"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "container "
      }, /*#__PURE__*/_react.default.createElement("video", {
        className: "video",
        controls: true,
        ref: function ref(mount) {
          _this2.videoNode = mount;
        }
      })), /*#__PURE__*/_react.default.createElement("div", {
        className: "close",
        onClick: this.onCloseClickListener
      }));
    }
  }]);

  return EffectVideoPanel;
}(_react.Component);

EffectVideoPanel.propTypes = {
  onCloseClickHandler: _propTypes.default.func.isRequired,
  videoUrl: _propTypes.default.string.isRequired
};
var _default = EffectVideoPanel;
exports.default = _default;