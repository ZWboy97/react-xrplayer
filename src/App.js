import React, { Component } from 'react';
import * as THREE from 'three';
import Orbitcontrols from 'three-orbitcontrols';
import * as HLS from 'hls.js';

class App extends Component {

  constructor(props) {
    super(props);
    this.mount = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.videoNode = null;

    this.innerView = true; // 是否是内视角
    this.isUserInteracting = false;     // 标记用户是否正在交互中
    this.onMouseDownMouseX = 0;         // 鼠标点击的初始坐标x
    this.onMouseDownMouseY = 0;         // 鼠标点击的初始坐标y
    this.lon = 0;                       // 经度
    this.onMouseDownLon = 0;
    this.lat = 0;                       // 纬度
    this.onMouseDownLat = 0;
    this.phi = 0;
    this.theta = 0;
    this.distance = 10;
    this.onPointerDownPointerX = 0;
    this.onPointerDownPointerY = 0;
    this.onPointerDownLon = 0;
    this.onPointerDownLat = 0;
  }

  componentDidMount() {
    this.init();
  }

  init = () => {
    this.initScene();

    this.initMesh();
    this.initEvent();
    this.initControls();
    this.animate();
    this.initRenderer();


  }

  initScene = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75, this.mount.clientWidth / this.mount.clientHeight, 0.001, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    camera.position.set(0, 0, 0);
    camera.target = new THREE.Vector3(0, 0, 0);
    camera.position.z = 5;
  }

  initRenderer = () => {
    const renderer = this.renderer;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.sortObjects = false;
    renderer.autoClear = false;
    this.mount.appendChild(renderer.domElement);

  }

  initMesh = () => {
    // 创建几何体
    let geometry = new THREE.SphereGeometry(500, 60, 40); // 球体
    geometry.scale(-1, 1, 1);
    var video = this.videoNode;
    this.video = video;
    video.width = 0;
    video.height = 0;
    video.loop = true;
    video.muted = true;
    video.setAttribute('webkit-playsinline', 'webkit-playsinline');
    if (HLS.isSupported()) {
      var hls = new HLS();
      hls.loadSource('http://cache.utovr.com/201508270528174780.m3u8');
      hls.attachMedia(video);
      hls.on(HLS.Events.MANIFEST_PARSED, function () {
        video.play();
      });
    } else {
      console.log('设备不支持')
      alert("设备不支持");
    }

    // 添加视频作为纹理，并纹理作为材质
    var texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;
    var material = new THREE.MeshBasicMaterial({ map: texture });
    // 创建网格 = 几何体 + 材质
    let mesh = new THREE.Mesh(geometry, material);
    // 创建场景，并添加mesh
    this.scene = new THREE.Scene();
    this.scene.add(mesh);
  }

  initEvent = () => {
    this.browser = window.navigator.userAgent.toLowerCase();
    if (this.browser.indexOf('mobile') > 0) {
      document.addEventListener('touchstart', this.onTouchstart, false);
      document.addEventListener('touchmove', this.onTouchmove, false);
      document.addEventListener('touchend', this.onTouchend, false);
      document.addEventListener('wheel', this.onDocumentMouseWheel, false);
    } else {
      document.addEventListener('mousedown', this.onDocumentMouseDown, false);
      document.addEventListener('mousemove', this.onDocumentMouseMove, false);
      document.addEventListener('mouseup', this.onDocumentMouseUp, false);
      document.addEventListener('wheel', this.onDocumentMouseWheel, false);
    }
    window.addEventListener('resize', this.onWindowResize, false); //
  }
  onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onDocumentMouseDown = (event) => {
    event.preventDefault();
    console.log('鼠标点击Down')
    this.isUserInteracting = true;
    // 记录鼠标点击屏幕坐标
    this.onPointerDownPointerX = event.clientX;
    this.onPointerDownPointerY = event.clientY;
    // 记录点击时候经纬度
    this.onPointerDownLon = this.lon; // 经度
    this.onPointerDownLat = this.lat; // 纬度
  }

  onTouchstart = (event) => {
    if (event.targetTouches.length == 1) {
      event.preventDefault();
      this.isUserInteracting = true;
      // 记录滑动开始的坐标
      var touch = event.targetTouches[0];
      this.onPointerDownPointerX = touch.pageX; // 把元素放在手指所在的位置
      this.onPointerDownPointerY = touch.pageY;
      // 记录滑动开始时候的经纬度
      this.onPointerDownLon = this.lon; // 经度
      this.onPointerDownLat = this.lat; // 纬度
    }
  }

  onDocumentMouseMove = (event) => {
    if (this.isUserInteracting === true) {
      // 在鼠标Down位置叠加偏移量
      this.lon = (this.onPointerDownPointerX - event.clientX) * 0.1 + this.onPointerDownLon;
      this.lat = (this.onPointerDownPointerY - event.clientY) * 0.1 + this.onPointerDownLat;
      // 用于立体场景音效
      // mouseActionLocal([lon, lat]); 
    }
  }

  onTouchmove = (event) => {
    if (this.isUserInteracting === true) {
      var touch = event.targetTouches[0];
      this.lon = (parseFloat(this.onPointerDownPointerX) - touch.pageX) * 0.1 + this.onPointerDownLon;
      this.lat = (parseFloat(this.onPointerDownPointerY - touch.pageY)) * 0.1 + this.onPointerDownLat;
      // 用于立体场景音效
      // mouseActionLocal([lon, lat]); 
    }
  }

  onDocumentMouseUp = (event) => {
    this.isUserInteracting = false;
  }

  onTouchend = (event) => {
    this.isUserInteracting = false;
  }

  onDocumentMouseWheel = (event) => {
    this.distance += event.deltaY * 0.5;
    if (this.distance <= 0) {
      this.distance = 0;
    } else if (this.distance > 0 && this.distance < 1000) {
      if (!this.innerView) {
        console.log('进来', this.camera.position.y)
        this.innerView = true;
        this.controls.enableZoom = false;
      }
    }
    else if (this.distance >= 1000 && this.distance <= 1500) {
      if (this.innerView) {
        console.log('出来')
        this.innerView = false;
        this.controls.enableZoom = true;
      }
    }
    else if (this.distance >= 1500) {
      //this.distance = 1500;
    }
    console.log('distance', this.distance);

  }

















  animate = () => {
    requestAnimationFrame(this.animate);
    if (this.innerView) {
      this.lat = Math.max(- 85, Math.min(85, this.lat));
      this.phi = THREE.Math.degToRad(90 - this.lat);
      this.theta = THREE.Math.degToRad(this.lon);
      this.camera.position.x = this.distance * Math.sin(this.phi) * Math.cos(this.theta);
      this.camera.position.y = this.distance * Math.cos(this.phi);
      this.camera.position.z = this.distance * Math.sin(this.phi) * Math.sin(this.theta);
      this.camera.lookAt(this.camera.target);
    } else {
      this.controls.update();
    }
    this.renderer.render(this.scene, this.camera);
  }

  initControls = () => {
    const controls = new Orbitcontrols(this.camera, this.renderer.domElement);
    this.controls = controls;
    controls.enableDamping = true
    controls.dampingFactor = 0.25
    controls.enableZoom = false;
    controls.autoRotate = false;
    controls.enableKeys = true;
    controls.keys = {
      LEFT: 37, //left arrow
      UP: 38, // up arrow
      RIGHT: 39, // right arrow
      BOTTOM: 40 // down arrow
    }
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN
    }
  }

  componentWillUnmount() {
    this.mount.removeChild(this.renderer.domElement)
  }

  render() {
    return (
      <div style={{
        width: '100vw', height: '100vh',
        background: '#888', overflow: "hidden"
      }}>
        <div
          id="canvas"
          style={{ width: '100%', height: '100%', background: '#888' }}
          ref={(mount) => { this.mount = mount }}
        >
        </div>
        <video id="video"
          style={{ display: "none" }}
          ref={(mount) => { this.videoNode = mount }} >
        </video>
      </div>

    );
  }
}

export default App;