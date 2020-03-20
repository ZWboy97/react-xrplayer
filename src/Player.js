import React, { Component } from 'react';
import * as THREE from 'three';
import { connect } from 'react-redux'
import { fetchLiveConfigure } from './redux/basic.redux';
import InnerViewControls from './controls/InnerViewControls';
import SpriteShapeHelper from './display/SpriteShapeHelper';
import EffectContainer from './effect/EffectContainer';
import './App.css';
import CenterModelHelper from './display/CenterModelHelper';
import TWEEN from '@tweenjs/tween.js';
import ViewConvertHelper from './action/ViewConvertHelper';
import FullScreen from './utils/fullscreen';
import TextureHelper from './texture/TextureHelper';

class Player extends Component {

  state = {
    showingEffect: false,
    effectData: null,
    isFullScreen: false
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
    this.viewConvertHelper = null;
    this.spriteData = null;
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
    //TODO test redux 
    this.props.fetchLiveConfigure();
  }

  initScene = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      150, this.mount.clientWidth / this.mount.clientHeight, 0.001, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer = renderer;
    camera.position.set(0, 450, 0);
    camera.target = new THREE.Vector3(0, 0, 0);
    this.scene = scene;
    this.camera = camera;
  }

  initMesh = () => {
    let geometry = new THREE.SphereGeometry(500, 60, 40); // 球体
    geometry.scale(-1, 1, 1);
    var video = this.videoNode;
    this.video = video;
    const textureHelper = new TextureHelper(video);
    let hlsUrl = "http://cache.utovr.com/s1e3tzoku70yk8mpa3/L3_5dxsrk4kh56gc4l1_v2.m3u8";
    var texture = textureHelper.loadHlsVideo(hlsUrl);
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

  initspriteData = () => {
    this.spriteData = new Map();
    this.spriteData.set('infocard', {
      id: 'infocard',
      type: 'infocard',
      iframeUrl: "https://gs.ctrip.com/html5/you/place/14.html"
    });
    this.spriteData.set('image', {
      id: 'image',
      type: 'image',
      imageUrl: "https://pic-cloud-bupt.oss-cn-beijing.aliyuncs.com/5c882ee6443a5.jpg",
      jumpUrl: 'http://www.youmuvideo.com',
    });
    this.spriteData.set('video', {
      id: 'video',
      type: 'video',
      videoUrl: 'https://video-cloud-bupt.oss-cn-beijing.aliyuncs.com/hangzhou.mp4'
    });
    this.spriteData.set('control', {
      id: 'control',
      type: 'control',
    });
  }

  initDisplay = () => {
    this.initspriteData();
    this.spriteShapeHelper = new SpriteShapeHelper(this.scene, this.camera);
    this.spriteShapeHelper.initPoints();
    this.spriteShapeHelper.objectClickHandler = (intersects) => {
      const key = intersects[0].object.name;
      if (this.spriteData.has(key)) {
        this.setState({
          showingEffect: true,
          effectData: this.spriteData.get(key)
        });
      }
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

  initAction = () => {
    this.viewConvertHelper = new ViewConvertHelper(this.camera, this.innerViewControls);
    this.viewConvertHelper.toNormalView(8000, 2000);
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
    if (this.centerModelHelper) {
      this.centerModelHelper.update();
    }
    TWEEN.update(); // 不要轻易去掉，渐变动画依赖该库
    this.renderer.render(this.scene, this.camera);
  }

  initControls = () => {
    this.innerViewControls = new InnerViewControls(this.camera);
    this.innerViewControls.connect();

  }

  componentWillUnmount() {
    this.mount.removeChild(this.renderer.domElement)
  }

  render() {
    // TODO test redux state
    console.log('redux.data.live_configure', this.props.live_configure);
    return (
      <FullScreen
        enabled={this.state.isFullScreen}
        onChange={isFull => this.setState({ isFullScreen: isFull })}
      >
        <div
          style={{
            width: '100vw', height: '100vh',
            background: '#888', overflow: "hidden"
          }}
        >
          <div
            id="canvas"
            style={{ width: '100%', height: '100%', background: '#888' }}
            ref={(mount) => { this.mount = mount }}
          >
          </div>
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
          <video id="video"
            style={{ display: "none" }}
            ref={(mount) => { this.videoNode = mount }} >
          </video>
          <div
            id="display"
            style={{ display: "none" }}>
          </div>
        </div>
      </FullScreen >
    );
  }
}

export default connect(
  state => state.basic,
  { fetchLiveConfigure }
)(Player);