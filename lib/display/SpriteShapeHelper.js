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
  function SpriteShapeHelper(scene, camera) {
    var _this = this;

    _classCallCheck(this, SpriteShapeHelper);

    _defineProperty(this, "setPointList", function (list) {
      _this.pointList = list;

      _this.initPoints();
    });

    _defineProperty(this, "initPoints", function () {
      _this.pointList = [{
        phi: -90,
        theta: -10,
        name: 'infocard'
      }, {
        phi: 32,
        theta: 14,
        name: 'image'
      }, {
        phi: -153,
        theta: -44,
        name: 'video'
      }, {
        phi: 67,
        theta: 19,
        name: 'control'
      }, {
        phi: 58,
        theta: -9,
        name: 'touguasongzi'
      }];
      _this.pointGroup = new THREE.Group();
      _this.pointArr = [];

      _this.pointList.forEach(function (point) {
        _this.createPoint(point);
      });

      _this.scene.add(_this.pointGroup);

      _this.bindEvent();
    });

    _defineProperty(this, "contertSph2Rect", function (phi, theta) {
      var r = _PanoConst.Radius;
      return [r * Math.sin(THREE.Math.degToRad(phi)) * Math.cos(THREE.Math.degToRad(theta)), r * Math.sin(THREE.Math.degToRad(phi)) * Math.sin(THREE.Math.degToRad(theta)), r * Math.cos(THREE.Math.degToRad(phi))];
    });

    _defineProperty(this, "createSpriteShape", function (url, opacity, scale) {
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

    _defineProperty(this, "animatePoints", function (meshGroup) {
      var t = 300;
      meshGroup.children.forEach(function (item) {
        var scale = item.scale;
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
    });

    _defineProperty(this, "update", function () {
      _tween.default.update();
    });

    _defineProperty(this, "bindEvent", function () {
      var raycaster = new THREE.Raycaster();
      document.addEventListener('click', function (event) {
        event.preventDefault();
        var mouse = new THREE.Vector2(); //通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.

        mouse.x = event.clientX / window.innerWidth * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; // 通过鼠标点的位置和当前相机的矩阵计算出raycaster

        raycaster.setFromCamera(mouse, _this.camera); // 获取raycaster直线和所有模型相交的数组集合

        var intersects = raycaster.intersectObjects(_this.pointArr); //如果只需要将第一个触发事件，那就取数组的第一个模型

        if (intersects.length > 0) {
          //this.showModal(intersects[0].object.name)
          if (_this.objectClickHandler) {
            _this.objectClickHandler(intersects);
          }
        }
      }, true);
    });

    this.scene = scene;
    this.camera = camera;
    this.pointList = [];
    this.pointGroup = null;
    this.objectClickHandler = null;
  }

  _createClass(SpriteShapeHelper, [{
    key: "createPoint",
    value: function createPoint(point) {
      var _meshGroup$position;

      var position = this.contertSph2Rect(point.phi, point.theta);
      var meshGroup = new THREE.Group();
      meshGroup.name = point.name;

      (_meshGroup$position = meshGroup.position).set.apply(_meshGroup$position, _toConsumableArray(position));

      var mesh = this.createSpriteShape("hotspot_video.png", 1, 16);
      meshGroup.add(mesh);
      mesh = this.getBackgroundTexture('#2d2d2d', 0.2, 20);
      meshGroup.add(mesh);
      this.pointArr.push(mesh);
      mesh.name = point.name;
      this.pointGroup.add(meshGroup);
      this.animatePoints(meshGroup);
    }
  }]);

  return SpriteShapeHelper;
}();

var _default = SpriteShapeHelper;
exports.default = _default;