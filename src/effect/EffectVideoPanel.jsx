/**
 * 弹窗视频效果
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import '../style/EffectVideoPanel.less';
import Hls from 'hls.js';
import { connect } from 'react-redux'


class EffectVideoPanel extends Component {

    constructor(props) {
        super(props);
        this.hls = null;
        this.video = null;
    }

    componentDidMount() {
        this.video = this.videoNode;
        this.video.muted = this.props.muted;
        this.video.volume = this.props.volume;
        console.log('videoUrl', this.props.videoUrl);
        this.video.setAttribute('webkit-playsinline', 'webkit-playsinline');
        const videoUrl = this.props.videoUrl;
        if (videoUrl.endsWith('.mp4')) {
            this.loadMp4Video();
        } else if (videoUrl.endsWith('.m3u8')) {
            this.loadHlsVideo();
        }

    }

    loadMp4Video = () => {
        this.video.src = this.props.videoUrl;
        this.video.play();
    }

    loadHlsVideo = () => {
        if (Hls.isSupported()) {
            this.hls = new Hls();
            console.log('hls', 'support');
            this.hls.attachMedia(this.video);
            this.hls.loadSource(this.props.videoUrl);
            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                this.video.play();
                console.log('videoplay');
            });
        } else {
            console.log('设备不支持')
            alert("设备不支持");
        }
    }

    onCloseClickListener = (e) => {
        e.preventDefault();
        if (this.props.onCloseClickHandler) {
            this.props.onCloseClickHandler();
        }
    }

    componentWillUnmount() {
        this.hls && this.hls.destroy();
    }

    render() {
        return (
            <div className="overlay">

                <div className="container ">
                    <video
                        className="video"
                        controls
                        ref={(mount) => { this.videoNode = mount }}
                    ></video>
                </div>
                <div
                    className="close"
                    onClick={this.onCloseClickListener}
                ></div>
            </div>)
    }
}

EffectVideoPanel.propTypes = {
    onCloseClickHandler: PropTypes.func.isRequired,
    videoUrl: PropTypes.string.isRequired,
};

export default connect(
    state => state.player,
)(EffectVideoPanel);