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
  }

  componentDidMount() {
    this.init();
  }

  init = () => {
    this.initScene();
    this.initMesh();
    this.initControls();
    this.animate();

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

    renderer.setSize(this.mount.clientWidth, this.mount.clientHeight);
    this.mount.appendChild(renderer.domElement);
    camera.position.z = 5;
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

  animate = () => {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  initControls = () => {
    const controls = new Orbitcontrols(this.camera, this.renderer.domElement);
    this.controls = controls;
    controls.enableDamping = true
    controls.dampingFactor = 0.25
    controls.enableZoom = true;
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