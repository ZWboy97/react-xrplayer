"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var THREE = _interopRequireWildcard(require("three"));

var _PanoConst = require("../const/PanoConst");

var _tween = _interopRequireDefault(require("@tweenjs/tween.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var SpriteShapeHelper = /*#__PURE__*/function () {
  function SpriteShapeHelper(scene, camera, renderer) {
    var _this = this;

    _classCallCheck(this, SpriteShapeHelper);

    _defineProperty(this, "resetHotSpotGroup", function () {
      if (!_this.pointGroup) {
        _this.pointGroup = new THREE.Group();

        _this.scene.add(_this.pointGroup);

        _this.hotSpotMeshMap = new Map();

        _this.bindEvent();
      }
    });

    _defineProperty(this, "setHotSpotList", function (hot_spot_list) {
      _this.resetHotSpotGroup();

      var hotSpotMap = new Map(hot_spot_list);
      hotSpotMap.forEach(function (value, key) {
        _this.createPoint(key, value);
      });
    });

    _defineProperty(this, "addHotSpot", function (hot_spot) {
      if (!_this.pointGroup) {
        _this.resetHotSpotGroup();
      }

      _this.createPoint(hot_spot.key, hot_spot.value);
    });

    _defineProperty(this, "removeHotSpot", function (hot_spot_key) {
      var mesh = _this.hotSpotMeshMap.get(hot_spot_key);

      if (mesh) {
        _this.pointGroup.remove(mesh);
      }
    });

    _defineProperty(this, "contertSph2Rect", function (phi, theta) {
      var r = _PanoConst.Radius;
      return [r * Math.sin(THREE.Math.degToRad(phi)) * Math.cos(THREE.Math.degToRad(theta)), r * Math.sin(THREE.Math.degToRad(phi)) * Math.sin(THREE.Math.degToRad(theta)), r * Math.cos(THREE.Math.degToRad(phi))];
    });

    _defineProperty(this, "createSpriteShape", function (url) {
      var opacity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      var scale = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 16;
      var texture = new THREE.TextureLoader().load(url);
      texture.needsUpdate = true; //注意这句不能少

      var material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: opacity,
        depthTest: false
      });
      var mesh = new THREE.Sprite(material);
      mesh.scale.set(scale * 2, scale * 2, 1);
      return mesh;
    });

    _defineProperty(this, "getBackgroundTexture", function (color, opacity, scale) {
      var canvas = document.createElement("canvas");
      canvas.click(function (e) {
        console.log('canvas', '点击了热点');
      });
      var container = document.getElementById('display');
      container.appendChild(canvas);
      canvas.width = 128;
      canvas.height = 128;
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = color;
      ctx.arc(64, 64, 64, 0, 2 * Math.PI);
      ctx.fill();
      var texture = new THREE.Texture(canvas);
      texture.needsUpdate = true; //注意这句不能少

      var material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: opacity,
        depthTest: false
      });
      var mesh = new THREE.Sprite(material);
      mesh.scale.set(scale * 2, scale * 2, 1);
      return mesh;
    });

    _defineProperty(this, "animatePoint", function (mesh) {
      var t = 300;
      var scale = mesh.scale;
      var tweenA = new _tween.default.Tween(scale).to({
        x: scale.x * 0.8,
        y: scale.y * 0.8
      }, 500).delay(100);
      var tweenB = new _tween.default.Tween(scale).to({
        x: scale.x * 1.2,
        y: scale.y * 1.2
      }, 500).delay(100);
      tweenA.chain(tweenB);
      tweenB.chain(tweenA);
      tweenA.start(t = t + 100);
    });

    _defineProperty(this, "animatePoints", function (meshGroup) {
      meshGroup.children.forEach(function (item) {
        _this.animatePoint(item);
      });
    });

    _defineProperty(this, "update", function () {
      _tween.default.update();
    });

    _defineProperty(this, "getIntersects", function (event) {
      var raycaster = new THREE.Raycaster();
      var mouse = new THREE.Vector2(); // 鼠标的二维设备坐标
      //将屏幕点击的屏幕坐标转化为三维画面平面的坐标，值的范围为-1到1.

      var _this$renderer$domEle = _this.renderer.domElement.getBoundingClientRect(),
          domX = _this$renderer$domEle.x,
          domY = _this$renderer$domEle.y;

      mouse.x = (event.clientX - domX) / _this.renderer.domElement.clientWidth * 2 - 1;
      mouse.y = -((event.clientY - domY) / _this.renderer.domElement.clientHeight) * 2 + 1; //从相机发射一条射线，经过鼠标点击位置
      // mouse为鼠标的二维设备坐标，camera为射线起点处的相机

      raycaster.setFromCamera(mouse, _this.camera); // 射线与模型的交点，这里交点会是多个，因为射线是穿过模型的，
      //与模型的所有mesh都会有交点，但我们选取第一个，也就是intersects[0]。

      var meshArray = Array.from(_this.hotSpotMeshMap.values());
      return raycaster.intersectObjects(meshArray);
    });

    _defineProperty(this, "bindEvent", function () {
      document.addEventListener('click', function (event) {
        event.preventDefault();
        console.log('检测热点点击');

        var intersects = _this.getIntersects(event); //如果只需要将第一个触发事件，那就取数组的第一个模型


        if (intersects.length > 0) {
          if (_this.objectClickHandler) {
            _this.objectClickHandler(intersects);
          }
        }
      }, true);
      document.addEventListener('mousemove', function (event) {
        event.preventDefault();

        var intersects = _this.getIntersects(event); //如果只需要将第一个触发事件，那就取数组的第一个模型


        if (intersects.length > 0) {
          document.getElementById('canvas').style.cursor = 'pointer';
        } else {
          document.getElementById('canvas').style.cursor = 'default';
        }
      }, true);
    });

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.hotSpotMeshMap = null; // 热点标签Mesh Map，便于动态缩减

    this.pointGroup = null; // 场景中的热点组合

    this.objectClickHandler = null;
  }

  _createClass(SpriteShapeHelper, [{
    key: "createPoint",
    value: function createPoint(key, value) {
      var _meshGroup$position, _mesh$position;

      var phi = value.phi,
          theta = value.theta,
          res_url = value.res_url,
          _value$opacity = value.opacity,
          opacity = _value$opacity === void 0 ? 1 : _value$opacity,
          _value$scale = value.scale,
          scale = _value$scale === void 0 ? 16 : _value$scale,
          _value$animate = value.animate,
          animate = _value$animate === void 0 ? false : _value$animate;
      var position = this.contertSph2Rect(phi, theta);
      var meshGroup = new THREE.Group();
      meshGroup.name = key;

      (_meshGroup$position = meshGroup.position).set.apply(_meshGroup$position, _toConsumableArray(position));

      var mesh = this.createSpriteShape(res_url, opacity, scale);
      mesh.name = key;

      (_mesh$position = mesh.position).set.apply(_mesh$position, _toConsumableArray(position));

      this.hotSpotMeshMap.set(key, mesh);
      this.pointGroup.add(mesh);

      if (animate) {
        this.animatePoint(mesh);
      }
    }
  }]);

  return SpriteShapeHelper;
}();

var _default = SpriteShapeHelper;
exports.default = _default;