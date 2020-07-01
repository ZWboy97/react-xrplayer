/**
 * 弹窗透明视频效果
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './style/EffectAlphaVideoPanel.less';
import { connect } from 'react-redux';
import * as THREE from 'three';
import { Spin } from "antd";



class NewEffectAlphaVideoPanel extends Component {

    state = {
        is_loading: true
    }

    constructor(props) {
        super(props);
        this.video = null;
        this.videoWidth = 0;
        this.videoHeight = 0;
        this.isPlaying = false;
        this.renderer = null;
        this.mount = null;
        this.camera = null;
        this.scene = null;
    }

    componentDidMount() {
        const { muted, volume, videoMuted } = this.props;
        this.video = this.videoNode;
        this.video.volume = volume;
        this.video.muted = videoMuted || muted;
        this.video.setAttribute('webkit-playsinline', 'webkit-playsinline');
        this.loadMp4Video();
    }

    loadMp4Video = () => {
        this.video = document.getElementById("alpha-video");
        this.video.src = this.props.videoUrl;
        this.video.crossOrigin = "Anonymous";

        this.updateCanvasSize();

        this.video.play();

        this.video.addEventListener('play', this.startPlay, false);
        this.video.addEventListener('ended', this.endPlay, false);
        window.addEventListener('resize', this.updateCanvasSize, false);
        this.initCanvas();
    }

    initCanvas = () => {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(new THREE.Color("lightgrey"), 0);
        this.renderer.setSize(this.mount.clientWidth, this.mount.clientHeight);
        this.mount.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        this.camera = new THREE.Camera();
        this.scene.add(this.camera);

        var texture = new THREE.VideoTexture(this.video);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBFormat;
        var geometry = new THREE.PlaneBufferGeometry(2, 2);
        var uniforms = {
            time: { type: "f", value: 1.0 },
            texture: { type: "sampler2D", value: texture }
        };
        var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader:
                `varying vec2 vUv;
                        void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                        }`,
            fragmentShader:
                `#ifdef GL_ES
                        precision highp float;
                        #endif
                        
                        uniform float time;
                        uniform sampler2D texture;
                        varying vec2 vUv;
                        
                        void main( void ) {
                        gl_FragColor = vec4(
                        texture2D(texture, vec2(vUv.x, 0.5 + vUv.y/2.)).rgb,
                        texture2D(texture, vec2(vUv.x, vUv.y/2.)).r
                        );
                        }`,
            transparent: true
        });
        var mesh = new THREE.Mesh(geometry, material)
        this.scene.add(mesh);
    }

    processFrame = () => {
        if (this.isPlaying === false) {
            return;
        }
        requestAnimationFrame(this.processFrame);
        this.renderer && this.renderer.render(this.scene, this.camera);
    }


    startPlay = () => {
        this.isPlaying = true;
        this.setState({ is_loading: false })
        this.processFrame();
        if (this.props.onStartPlayHandler) {
            this.props.onStartPlayHandler();
        }
    }

    endPlay = () => {
        this.isPlaying = false;
        if (this.props.onDisplayEndedHandler) {
            this.props.onDisplayEndedHandler();
        }
    }

    updateCanvasSize = () => {
        var output = document.getElementById('output');
        if (output) {
            this.videoWidth = output.clientWidth;
            this.videoHeight = output.clientHeight;
            this.renderer && this.renderer.setSize(this.videoWidth, this.videoHeight);

        } else {
            this.videoWidth = 10;
            this.videoHeight = 10;
        }
    }

    onCloseClickListener = (e) => {
        e.preventDefault();
        if (this.props.onCloseClickHandler) {
            this.props.onCloseClickHandler();
        }
    }

    componentWillUnmount() {
        this.isPlaying = false;
        this.video.removeEventListener('play', this.startPlay);
        this.video.removeEventListener('ended', this.endPlay);
        window.removeEventListener('resize', this.updateCanvasSize);
        this.video = null;

    }

    render() {
        const { muted, volume, videoMuted } = this.props;
        if (this.video) {
            this.video.volume = volume;
            this.video.muted = videoMuted || muted;
        }
        const { enableClose, videoStyle, enableMask } = this.props;
        let overlayClassName = "alpha_video_overlay";
        if (enableMask) {
            overlayClassName += " grep_overlay";
        }
        return (
            <div className={overlayClassName} >
                <video
                    id="alpha-video"
                    className="video"
                    style={{ display: "none" }}
                    playsInline
                    x5-video-player-type="h5-page"
                    ref={(mount) => { this.videoNode = mount }}
                >
                </video>
                <div id="output"
                    className="alpha_video_overlay"
                    style={videoStyle}
                    ref={(mount) => { this.mount = mount }}
                >
                </div>
                {
                    this.state.is_loading ?
                        <div className={'loading-cover'}>
                            <div className={'loading-icon'}>
                                <Spin size={'large'} tip={'加载中...'} />
                            </div>
                        </div>
                        : ""
                }
                {
                    enableClose ?
                        <div
                            className="close"
                            onClick={this.onCloseClickListener}
                        ></div>
                        : ""
                }
            </div >)
    }
}

NewEffectAlphaVideoPanel.propTypes = {
    videoUrl: PropTypes.string.isRequired,
    enableClose: PropTypes.bool,
    enableMask: PropTypes.bool,
    videoStyle: PropTypes.object,
    videoMuted: PropTypes.bool,
    onCloseClickHandler: PropTypes.func,
    onDisplayEndedHandler: PropTypes.func,
    onStartPlayHandler: PropTypes.func
};

NewEffectAlphaVideoPanel.defaultProps = {
    enableClose: false,
    position: "right",
    videoMuted: false,
    enableMask: false,
    videoStyle: { width: 400, height: 400 }
}

export default connect(
    state => state.player,
    {}
)(NewEffectAlphaVideoPanel);