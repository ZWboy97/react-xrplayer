import React, { Component } from 'react';
import { connect } from 'react-redux'
import { enableEffectContainer, setEffectData, setGlobalVolume, setGlobalMuted } from './redux/player.redux';
import EffectContainer from './effect/EffectContainer';
import FullScreen from './utils/fullscreen';
import Proptypes from 'prop-types';
import XRPlayerManager from './manager/XRPlayerManager';
import './App.css';

class XRPlayer extends Component {

  constructor(props) {
    super(props);
    this.mount = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.sceneContainer = null;

    this.xrManager = null;
    this.effectCallback = null;

    this.innerView = true; // 是否是内视角
    this.innerViewControls = null;
    this.spriteShapeHelper = null;
    this.centerModelHelper = null;
    this.viewConvertHelper = null;
    this.spriteData = null;
  }

  componentDidMount() {
    this.xrManager = new XRPlayerManager(this.mount, this.props);
    this.xrManager.handler = this.eventHandler;
    this.props.onCreated && this.props.onCreated(this.xrManager);
    this.initState();
    this.initEvent();
  }

  initState = () => {
    this.sceneContainer.volume = this.props.volume;
    this.sceneContainer.muted = this.props.muted;
  }

  eventHandler = (name, props, callback = () => { }) => {
    const result = this.props.onEventHandler(name, props);
    if (result === true) return; // 为true，外部拦截响应，由外部处理
    switch (name) {
      case 'infocard':
      case 'image':
      case 'control':
        this.props.enableEffectContainer(true);
        this.props.setEffectData(props.data);
        break;
      case 'video':
      case 'alpha_video':
        this.effectCallback = callback;
        this.props.enableEffectContainer(true);
        console.log('data', props.data);
        this.props.setEffectData(props.data);
        break;
      case 'close_effect_container':
        this.onCloseEffectContainer();
        break;
      case 'global_muted':
        this.props.setGlobalMuted(props.muted);
        break;
      case 'global_volume':
        this.props.setGlobalVolume(props.volume);
        break;
      default: break;
    }
  }

  initEvent = () => {
    window.addEventListener('resize', this.onWindowResize, false);
  }


  onWindowResize = () => {
    this.xrManager.onWindowResize(this.mount.clientWidth,
      this.mount.clientHeight);
  }

  onFullScreenChange = (isFull) => {
    this.props.onFullScreenChange(isFull);
    this.onWindowResize();
  }

  componentWillUnmount() {
    this.xrManager && this.xrManager.destroy();
    window.removeEventListener('resize', this.onWindowResize);
  }

  onCloseEffectContainer = () => {
    this.props.enableEffectContainer(false);
    this.props.setEffectData({});
  }

  render() {
    let { width, height, is_full_screen = false,
      is_effect_displaying, effect_data } = this.props;
    return (
      <FullScreen
        enabled={is_full_screen}
        onChange={this.onFullScreenChange}
      >
        <div
          id="xr-container"
          style={{
            width: is_full_screen ? "100vw" : width,
            height: is_full_screen ? "100vh" : height,
            background: '#fff', overflow: "hidden"
          }}
        >
          <div
            id="canvas"
            style={{ width: '100%', height: '100%', background: '#fff' }}
            ref={(mount) => { this.mount = mount }}
          >
          </div>
          {
            is_effect_displaying ?
              <EffectContainer
                data={effect_data}
                onCloseClickHandler={() => {
                  this.onCloseEffectContainer()
                }}
                onCallback={this.effectCallback}
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
  width: Proptypes.string,
  height: Proptypes.string,
  camera_fov: Proptypes.number,
  camera_near: Proptypes.number,
  camera_far: Proptypes.number,
  camera_position: Proptypes.object,
  camera_target: Proptypes.object,
  scene_texture_resource: Proptypes.object.isRequired,
  axes_helper_display: Proptypes.bool,
  hot_spot_list: Proptypes.array,
  event_list: Proptypes.array,
  is_full_screen: Proptypes.bool,

  onCreated: Proptypes.func,
  onFullScreenChange: Proptypes.func,
  onEventHandler: Proptypes.func
}

XRPlayer.defaultProps = {
  width: '100%',
  height: '100%',
  camera_fov: 80,
  camera_near: 0.01,
  camera_far: 10000,
  camera_position: {
    x: 0,
    y: 0,
    z: 10
  },
  camera_target: {
    x: 0,
    y: 0,
    z: 0
  },
  axes_helper_display: false,
  hot_spot_list: [],
  event_list: [],
  model_list: [],
  is_full_screen: false,
  onFullScreenChange: (isFull) => { },
  onEventHandler: (name, prop) => { return false },
}

export default connect(
  state => state.player,
  { enableEffectContainer, setEffectData, setGlobalVolume, setGlobalMuted }
)(XRPlayer);