"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hls = _interopRequireDefault(require("hls.js"));

var THREE = _interopRequireWildcard(require("three"));

var _flvMin = _interopRequireDefault(require("flv.js/dist/flv.min.js"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var TextureHelper =
/**
 * @param {video或者图片的载体} containerNode 
 * @param {加载资源的属性集合} resProps 
 */
function TextureHelper(containerNode) {
  var _this = this;

  _classCallCheck(this, TextureHelper);

  _defineProperty(this, "initVideoNode", function () {
    _this.containerNode.width = 0;
    _this.containerNode.height = 0;
    _this.containerNode.loop = true;
    _this.containerNode.muted = true;
    _this.containerNode.crossOrigin = "anonymous";
    _this.containerNode.autoplay = true;
    _this.containerNode.allowsInlineMediaPlayback = true;

    _this.containerNode.setAttribute('webkit-playsinline', 'webkit-playsinline');

    _this.containerNode.setAttribute('webkit-playsinline', true);

    _this.containerNode.setAttribute('playsinline', true);

    _this.containerNode.setAttribute('preload', 'auto');

    _this.containerNode.setAttribute('x-webkit-airplay', 'allow');

    _this.containerNode.setAttribute('x5-playsinline', true);

    _this.containerNode.setAttribute('x5-video-player-type', 'h5');

    _this.containerNode.setAttribute('x5-video-player-fullscreen', true);

    _this.containerNode.setAttribute('x5-video-orientation', 'portrait');

    _this.containerNode.setAttribute('style', 'object-fit: fill');

    _this.containerNode.setAttribute('loop', "loop");
  });

  _defineProperty(this, "getTextureFromVideo", function (video) {
    var texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;
    return texture;
  });

  _defineProperty(this, "loadFlvVideo", function (resUrl) {
    _this.initVideoNode();

    if (_flvMin.default.isSupported()) {
      var flvPlayer = _flvMin.default.createPlayer({
        type: 'flv',
        url: resUrl
      });

      _this.videoLoader = flvPlayer;
      flvPlayer.attachMediaElement(_this.containerNode);
      flvPlayer.load();
      flvPlayer.play();
    } else {
      console.error('Your browser does not support flvjs');

      _this.onLoadErrorHandler('设备不支持FLV');
    }

    return _this.getTextureFromVideo(_this.containerNode);
  });

  _defineProperty(this, "loadHlsVideo", function (resUrl) {
    _this.initVideoNode();

    if (_hls.default.isSupported()) {
      var hls = new _hls.default();
      _this.videoLoader = hls;
      hls.loadSource(resUrl);
      hls.attachMedia(_this.containerNode);
      hls.on(_hls.default.Events.MANIFEST_PARSED, function () {
        _this.containerNode.play();

        _this.onLoadSuccessHandler();
      });
    } else {
      console.log('设备不支持HLS');

      _this.onLoadErrorHandler('设备不支持HLS');
    }

    return _this.getTextureFromVideo(_this.containerNode);
  });

  _defineProperty(this, "loadMp4Video", function (resUrl) {
    _this.initVideoNode();

    _this.containerNode.src = resUrl;

    _this.containerNode.load();

    _this.containerNode.play();

    return _this.getTextureFromVideo(_this.containerNode);
  });

  _defineProperty(this, "loadImage", function (resUrl) {
    var texture = new THREE.TextureLoader().load(resUrl);
    return texture;
  });

  _defineProperty(this, "loadTexture", function (resource) {
    var type = resource.type,
        res_url = resource.res_url;
    _this.resType = type;

    switch (type) {
      case 'hls':
        return _this.loadHlsVideo(res_url);

      case 'flv':
        return _this.loadFlvVideo(res_url);

      case 'mp4':
        return _this.loadMp4Video(res_url);

      case 'image':
        return _this.loadImage(res_url);

      default:
        return null;
    }
  });

  _defineProperty(this, "startDisplay", function () {
    switch (_this.resType) {
      case 'hls':
      case 'mp4':
        _this.containerNode && _this.containerNode.play();
        break;

      case 'flv':
        _this.videoLoader && _this.videoLoader.play();
        break;

      default:
        break;
    }
  });

  _defineProperty(this, "pauseDisplay", function () {
    switch (_this.resType) {
      case 'hls':
      case 'mp4':
        _this.containerNode && _this.containerNode.pause();
        break;

      case 'flv':
        _this.videoLoader && _this.videoLoader.pause();
        break;

      default:
        break;
    }
  });

  _defineProperty(this, "unloadFlvVideo", function () {
    if (_this.videoLoader) {
      _this.videoLoader.unload();

      _this.videoLoader.detachMediaElement();
    }
  });

  _defineProperty(this, "unloadHlsVideo", function () {
    if (_this.videoLoader) {
      _this.videoLoader.stopLoad();

      _this.videoLoader.detachMedia();

      _this.videoLoader.destroy();
    }
  });

  _defineProperty(this, "unloadResource", function () {
    switch (_this.resType) {
      case 'hls':
        _this.unloadHlsVideo();

        break;

      case 'flv':
        _this.unloadFlvVideo();

        break;

      case 'mp4':
      case 'image':
        // TODO 是否需要释放资源？？
        break;

      default:
        return null;
    }
  });

  this.containerNode = containerNode;
  this.onLoadSuccessHandler = null;
  this.onLoadErrorHandler = null;
  this.videoLoader = null;
  this.resType = 'image';
};

var _default = TextureHelper;
exports.default = _default;