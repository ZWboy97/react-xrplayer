/**
 * 弹窗视频效果
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import '../style/EffectVideoPanel.less';
import Hls from 'hls.js';
import { connect } from 'react-redux';
import { Spin } from "antd";


class EffectVideoPanel extends Component {

    state = {
        is_loading: true
    }

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
        this.video.addEventListener('canplay', this.startPlay, false);
        this.video.addEventListener('ended', this.endPlay, false);
        const { videoUrl, videoType = "" } = this.props;
        if (videoType === "") {
            if (videoUrl.endsWith('.mp4')) {
                this.loadMp4Video();
            } else if (videoUrl.endsWith('.m3u8')) {
                this.loadHlsVideo();
            }
        } else {
            if (videoType === "hls") {
                this.loadHlsVideo();
            } else if (videoType === "mp4") {
                this.loadMp4Video();
            }
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

    startPlay = () => {
        this.setState({ is_loading: false })
    }

    endPlay = () => {
    }

    onCloseClickListener = (e) => {
        e.preventDefault();
        if (this.props.onCloseClickHandler) {
            this.props.onCloseClickHandler();
        }
    }

    componentWillUnmount() {
        this.video.removeEventListener('canplay', this.startPlay);
        this.video.removeEventListener('ended', this.endPlay);
        this.hls && this.hls.destroy();
    }

    render() {
        const { muted, volume, videoStyle } = this.props;
        if (this.video) {
            this.video.muted = muted;
            this.video.volume = volume;
        }
        return (
            <div className="overlay">

                <div className="container ">
                    <video
                        className="video"
                        style={videoStyle}
                        ref={(mount) => { this.videoNode = mount }}
                    ></video>
                </div>
                <div
                    className="close"
                    onClick={this.onCloseClickListener}
                ></div>
                {
                    this.state.is_loading ?
                        <div className={'loading-cover'}>
                            <div className={'loading-icon'}>
                                <Spin size={'large'} tip={'实时直播画面连接中...'} />
                            </div>
                        </div>
                        : ""
                }
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