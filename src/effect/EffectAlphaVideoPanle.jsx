/**
 * 弹窗透明视频效果
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './style/EffectAlphaVideoPanel.less';
import { connect } from 'react-redux';


class EffectAlphaVideoPanel extends Component {

    constructor(props) {
        super(props);
        this.video = null;
        this.bufferCtx = null;
        this.image = null;
        this.alphaData = null;
        this.isPlaying = false;
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
        this.video.crossOrigin = "anonymous";
        this.showCanvas = document.getElementById("show");
        this.showCtx = this.showCanvas.getContext("2d");
        this.bufferCanvas = document.getElementById("buffer");
        this.bufferCtx = this.bufferCanvas.getContext("2d");

        this.updateCanvasSize();

        this.video.play();

        this.video.addEventListener('play', this.startPlay, false);

        this.video.addEventListener('ended', this.endPlay, false);

        window.addEventListener('resize', this.updateCanvasSize, false);
    }

    startPlay = () => {
        this.isPlaying = true;
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
            this.showCanvas.width = output.clientWidth;
            this.showCanvas.height = output.clientHeight;
            this.bufferCanvas.width = output.clientWidth;
            this.bufferCanvas.height = output.clientHeight * 2;
            this.width = this.showCanvas.width;
            this.height = this.showCanvas.height;
        } else {
            this.width = 10;
            this.height = 10;
        }
    }

    processFrame = () => {
        if (this.isPlaying === false) return;
        this.bufferCtx.drawImage(this.video, 0, 0, this.width, this.height * 2);
        this.image = this.bufferCtx.getImageData(0, 0, this.width, this.height);
        this.image.crossOrigin = "Anonymous";

        this.alphaData = this.bufferCtx.getImageData(0, this.height, this.width,
            this.height).data;

        for (var i = 3, len = this.image.data.length; i < len; i = i + 4) {
            this.image.data[i] = this.alphaData[i - 1];
        }
        this.showCtx.putImageData(this.image, 0, 0, 0, 0, this.width, this.height);
        requestAnimationFrame(this.processFrame);
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
        this.bufferCtx = null;
        this.image = null;
        this.alphaData = null;
        this.showCanvas = null;
        this.showCtx = null;
        this.bufferCanvas = null;
        this.bufferCtx = null;
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
                    ref={(mount) => { this.videoNode = mount }}
                >
                </video>
                <div id="output"
                    className="alpha_video_overlay"
                    style={videoStyle}
                >
                    <canvas id="show" ></canvas>
                    <canvas id="buffer" style={{ display: "none" }}></canvas>
                </div>
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

EffectAlphaVideoPanel.propTypes = {
    videoUrl: PropTypes.string.isRequired,
    enableClose: PropTypes.bool,
    enableMask: PropTypes.bool,
    videoStyle: PropTypes.object,
    videoMuted: PropTypes.bool,
    onCloseClickHandler: PropTypes.func,
    onDisplayEndedHandler: PropTypes.func,
    onStartPlayHandler: PropTypes.func
};

EffectAlphaVideoPanel.defaultProps = {
    enableClose: false,
    position: "right",
    videoMuted: false,
    enableMask: false,
    videoStyle: { width: 400, height: 400 }
}

export default connect(
    state => state.player,
    {}
)(EffectAlphaVideoPanel);