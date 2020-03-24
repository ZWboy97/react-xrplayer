import React, { Component } from 'react';
import * as THREE from 'three';
import { connect } from 'react-redux'
import { fetchLiveConfigure } from './redux/basic.redux';
import InnerViewControls from './controls/InnerViewControls';
import SpriteShapeHelper from './display/SpriteShapeHelper';
import EffectContainer from './effect/EffectContainer';
import CenterModelHelper from './display/CenterModelHelper';
import TWEEN from '@tweenjs/tween.js';
import ViewConvertHelper from './action/ViewConvertHelper';
import FullScreen from './utils/fullscreen';
import TextureHelper from './texture/TextureHelper';
import Proptypes from 'prop-types';
import './App.css';

class XRPlayer extends Component {

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
    this.sceneContainer = null;

    this.innerView = true; // 是否是内视角
    this.innerViewControls = null;
    this.spriteShapeHelper = null;
    this.centerModelHelper = null;
    this.viewConvertHelper = null;
    this.spriteData = null;
  }

  componentDidMount() {
    this.initScene();
    this.initCamera();
    this.initEvent();
    this.initControls();
    this.animate();
    this.initDisplay();
    this.initRenderer();
    this.initAction();
    //TODO test redux 
    this.props.fetchLiveConfigure();
  }

  initCamera = () => {
    const {
      camera_fov, camera_far, camera_near,
      camera_position: position, camera_target: target
    } = this.props;
    const camera = new THREE.PerspectiveCamera(
      camera_fov, this.mount.clientWidth / this.mount.clientHeight,
      camera_near, camera_far);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer = renderer;
    camera.position.set(position.x, position.y, position.z);
    camera.target = new THREE.Vector3(target.x, target.y, target.z);
    this.camera = camera;
  }

  initScene = () => {
    const {
      scene_texture_resource: textureResource,
      axes_helper_display: isAxesHelperDisplay
    } = this.props;
    let geometry = new THREE.SphereGeometry(500, 60, 40); // 球体
    geometry.scale(-1, 1, 1);
    const textureHelper = new TextureHelper(this.sceneContainer);
    let texture = textureHelper.loadTexture(textureResource);
    let material = new THREE.MeshBasicMaterial({ map: texture });
    let mesh = new THREE.Mesh(geometry, material);
    this.scene = new THREE.Scene();
    this.scene.add(mesh);
    if (isAxesHelperDisplay) {
      let axisHelper = new THREE.AxesHelper(1000)//每个轴的长度
      this.scene.add(axisHelper);
    }
  }

  initEvent = () => {
    window.addEventListener('resize', this.onWindowResize, false);
  }

  initDisplay = () => {
    const { event_list, hot_spot_list } = this.props;
    this.spriteData = new Map(event_list);
    this.spriteShapeHelper = new SpriteShapeHelper(this.scene, this.camera);
    this.spriteShapeHelper.setPointList(hot_spot_list);
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

    const { model_list } = this.props;
    this.centerModelHelper = new CenterModelHelper(this.scene);
    this.centerModelHelper.loadModelList(model_list);
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
            ref={(mount) => { this.sceneContainer = mount }} >
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

XRPlayer.protoTypes = {
  camera_fov: Proptypes.number,
  camera_near: Proptypes.number,
  camera_far: Proptypes.number,
  camera_position: Proptypes.object,
  camera_target: Proptypes.object,
  scene_texture_resource: Proptypes.object,
  axes_helper_display: Proptypes.bool,
  hot_spot_list: Proptypes.array,
  event_list: Proptypes.array
}

XRPlayer.defaultProps = {
  camera_fov: 150,
  camera_near: 0.01,
  camera_far: 10000,
  camera_position: {
    x: 0,
    y: 450,
    z: 0
  },
  camera_target: {
    x: 0,
    y: 0,
    z: 0
  },
  scene_texture_resource: {
    type: 'hls',
    res_url: 'http://cache.utovr.com/s1e3tzoku70yk8mpa3/L3_5dxsrk4kh56gc4l1_v2.m3u8',
  },
  axes_helper_display: true,
  hot_spot_list: [
    ['infocard', { phi: -90, theta: -10, res_url: 'hotspot_video.png' }],
    ['image', { phi: 32, theta: 14, res_url: 'hotspot_video.png' }],
    ['video', { phi: -153, theta: -44, res_url: 'hotspot_video.png' }],
    ['control', { phi: 67, theta: 19, res_url: 'hotspot_video.png' }]
  ],
  event_list: [
    ['infocard', {
      id: 'infocard',
      type: 'infocard',
      iframeUrl: "https://gs.ctrip.com/html5/you/place/14.html"
    }],
    ['image', {
      id: 'image',
      type: 'image',
      imageUrl: "https://pic-cloud-bupt.oss-cn-beijing.aliyuncs.com/5c882ee6443a5.jpg",
      jumpUrl: 'http://www.youmuvideo.com',
    }],
    ['video', {
      id: 'video',
      type: 'video',
      videoUrl: 'https://video-cloud-bupt.oss-cn-beijing.aliyuncs.com/hangzhou.mp4'
    }],
    ['control', {
      id: 'control',
      type: 'control',
    }]
  ],
  model_list: [
    ['12332', {
      objUrl: "SambaDancing.fbx",
      texture: "texture1.png",
      modeFormat: "fbx",
      scale: 1
    }],
    ['23433', {
      objUrl: "model.json",
      texture: "texture1.png",
      modeFormat: "obj",
      scale: 1
    }]
  ]
}

export default connect(
  state => state.basic,
  { fetchLiveConfigure }
)(XRPlayer);