import React, { Component } from 'react';
import { connect } from 'react-redux'
import { fetchLiveConfigure } from './redux/basic.redux';
import EffectContainer from './effect/EffectContainer';
import FullScreen from './utils/fullscreen';
import Proptypes from 'prop-types';
import XRPlayerManager from './manager/XRPlayerManager';
import './App.css';

class XRPlayer extends Component {

  state = {
    showingEffect: false,
    effectData: null,
  }

  constructor(props) {
    super(props);
    this.mount = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.sceneContainer = null;

    this.xrManager = null;

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

    this.initEvent();
  }

  eventHandler = (name, props) => {
    switch (name) {
      case 'hot_spot_click':
        this.setState({
          showingEffect: true,
          effectData: props.data
        });
        break;
      default: break;
    }
    // 外部补充handler

  }

  initEvent = () => {
    window.addEventListener('resize', this.onWindowResize, false);
  }


  onWindowResize = () => {
    this.xrManager.onWindowResize(this.mount.clientWidth,
      this.mount.clientHeight);
  }

  componentWillUnmount() {
    this.xrManager.distory();
  }

  render() {
    const { width, height } = this.props;
    return (
      <FullScreen
        enabled={this.props.is_full_screen}
        onChange={isFull => this.props.onFullScreenChange(isFull)}
      >
        <div
          style={{
            width: width, height: height,
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
  onFullScreenChange: Proptypes.func
}

XRPlayer.defaultProps = {
  width: '100vw',
  height: '100vh',
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
  axes_helper_display: true,
  hot_spot_list: [],
  event_list: [],
  model_list: [],
  is_full_screen: false,
  onFullScreenChange: (isFull) => { },
}

export default connect(
  state => state.basic,
  { fetchLiveConfigure }
)(XRPlayer);