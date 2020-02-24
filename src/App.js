import React, { Component } from 'react';
import * as THREE from 'three';
//import Orbitcontrols from 'three-orbitcontrols';
import InnerViewControls from './controls/InnerViewControls';
import * as HLS from 'hls.js';
import SpriteShapeHelper from './display/SpriteShapeHelper';
import EffectInfoCard from './effect/EffectInfoCard';

class App extends Component {

  state = {
    showingEffect: false
  }

  constructor(props) {
    super(props);
    this.mount = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.videoNode = null;

    this.innerView = true; // 是否是内视角
    this.innerViewControls = null;
    this.spriteShapeHelper = null;
  }

  componentDidMount() {
    this.initScene();
    this.initMesh();
    this.initEvent();
    this.initControls();
    this.animate();
    this.initDisplay();
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

  initMesh = () => {
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
      hls.loadSource('http://cache.utovr.com/s1e3tzoku70yk8mpa3/L3_5dxsrk4kh56gc4l1_v2.m3u8');
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
    var axisHelper = new THREE.AxesHelper(1000)//每个轴的长度
    this.scene.add(axisHelper);
  }

  initEvent = () => {
    window.addEventListener('resize', this.onWindowResize, false); //
  }

  initDisplay = () => {
    this.spriteShapeHelper = new SpriteShapeHelper(this.scene, this.camera);
    this.spriteShapeHelper.initPoints();
    this.spriteShapeHelper.objectClickHandler = (intersects) => {
      this.setState({ showingEffect: true });
      console.log(intersects);
    }

  }

  onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  initRenderer = () => {
    const renderer = this.renderer;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.sortObjects = false;
    renderer.autoClear = false;
    this.mount.appendChild(renderer.domElement);
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    if (this.innerView) {
      this.innerViewControls.update();
    } else {
      this.controls.update();
    }
    if (this.spriteShapeHelper) {
      this.spriteShapeHelper.update();
    }
    this.renderer.render(this.scene, this.camera);
  }

  initControls = () => {
    this.innerViewControls = new InnerViewControls(this.camera);
    this.innerViewControls.initControlsListener();
    // Three.js自带的控制器
    // const controls = new Orbitcontrols(this.camera, this.renderer.domElement);
    // this.controls = controls;
    // controls.enableZoom = false;
    // controls.autoRotate = false;
    // controls.enableKeys = true;
    // controls.panSpeed = 3;
    // controls.rotateSpeed = 3;
    // controls.zoomSpeed = 2;
    // controls.keys = {
    //   LEFT: 37, //left arrow
    //   UP: 38, // up arrow
    //   RIGHT: 39, // right arrow
    //   BOTTOM: 40 // down arrow
    // }
    // controls.mouseButtons = {
    //   LEFT: THREE.MOUSE.ROTATE,
    //   MIDDLE: THREE.MOUSE.DOLLY,
    //   RIGHT: THREE.MOUSE.PAN
    // }
  }

  componentWillUnmount() {
    this.mount.removeChild(this.renderer.domElement)
  }

  render() {
    return (
      <div
        style={{
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
        <div id="display"
          style={{ display: "none" }}></div>
        {
          this.state.showingEffect ?
            <EffectInfoCard
              onCloseClickHandler={() => {
                this.setState({ showingEffect: false })
              }
              }
            ></EffectInfoCard>
            :
            ""
        }
      </div>
    );
  }
}

export default App;