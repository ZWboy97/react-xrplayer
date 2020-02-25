import React, { Component } from 'react';
import * as THREE from 'three';
//import Orbitcontrols from 'three-orbitcontrols';
import InnerViewControls from './controls/InnerViewControls';
import * as HLS from 'hls.js';
import SpriteShapeHelper from './display/SpriteShapeHelper';
import EffectContainer from './effect/EffectContainer';
import './App.css';
import CenterModelHelper from './display/CenterModelHelper';
import TWEEN from '@tweenjs/tween.js';

class App extends Component {

  state = {
    showingEffect: false,
    effectData: null
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
    this.centerModelHelper = null;
  }

  componentDidMount() {
    this.initScene();
    this.initMesh();
    this.initEvent();
    this.initControls();
    this.animate();
    this.initDisplay();
    this.initRenderer();
    this.initAction();
  }

  initAction = () => {
    const coords = { // Start 
      x: this.camera.position.x, y: this.camera.position.y, z: this.camera.position.z, fov: 150
    };
    new TWEEN.Tween(coords)
      .to({ x: 100, y: 0, z: 100, fov: 80 }, 8000)
      .delay(2000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        this.camera.position.x = coords.x;
        this.camera.position.y = coords.y;
        this.camera.position.z = coords.z;
        this.camera.fov = coords.fov;
        this.camera.updateProjectionMatrix();
      })
      .onComplete(() => {
        this.innerViewControls && this.innerViewControls.connect();
      })
      .start()
  }

  initScene = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      100, this.mount.clientWidth / this.mount.clientHeight, 0.001, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer = renderer;
    camera.position.set(1600, 1600, 1600);
    camera.target = new THREE.Vector3(0, 0, 0);
    this.scene = scene;
    this.camera = camera;
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
    window.addEventListener('resize', this.onWindowResize, false);
  }

  initDisplay = () => {
    this.spriteShapeHelper = new SpriteShapeHelper(this.scene, this.camera);
    this.spriteShapeHelper.initPoints();
    this.spriteShapeHelper.objectClickHandler = (intersects) => {
      const effectData = {
        type: intersects[0].object.name,
        imageUrl: "http://seopic.699pic.com/photo/50055/5642.jpg_wh1200.jpg",
        jumpUrl: 'http://www.youmuvideo.com'
      }
      this.setState({
        showingEffect: true,
        effectData: effectData
      });
      console.log(intersects[0].object.name);
    }

    this.centerModelHelper = new CenterModelHelper(this.scene);
    // this.centerModelHelper.loadObj({
    //   objUrl: "model.json",
    //   texture: "texture1.png",
    //   modeFormat: "obj",
    //   scale: 1
    // });
    this.centerModelHelper.loadObj({
      objUrl: "SambaDancing.fbx",
      texture: "texture1.png",
      modeFormat: "fbx",
      scale: 1
    });


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
      this.innerViewControls && this.innerViewControls.update();
    } else {
      this.controls.update();
    }
    if (this.spriteShapeHelper) {
      this.spriteShapeHelper.update();
    }
    if (this.centerModelHelper) {
      this.centerModelHelper.update();
    }
    this.renderer.render(this.scene, this.camera);
  }

  initControls = () => {
    this.innerViewControls = new InnerViewControls(this.camera);
    this.innerViewControls.initControlsListener();
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
        <div
          id="display"
          style={{ display: "none" }}></div>
        {
          this.state.showingEffect ?
            <EffectContainer
              data={this.state.effectData}
              onCloseClickHandler={() => {
                this.setState({
                  effectData: null
                })
              }}
            ></EffectContainer>
            :
            ""
        }
      </div>
    );
  }
}

export default App;