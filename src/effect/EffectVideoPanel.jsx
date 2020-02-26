/**
 * 弹窗视频效果
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import '../style/EffectVideoPanel.less';
import * as HLS from 'hls.js';


class EffectVideoPanel extends Component {

    constructor(props) {
        super(props);
        this.hls = null;
        this.video = null;
    }

    componentDidMount() {
        this.hls = new HLS();
        this.video = this.videoNode;
        this.video.loop = true;
        this.video.muted = true;
        console.log('videoUrl', this.props.videoUrl);
        this.video.setAttribute('webkit-playsinline', 'webkit-playsinline');
        if (HLS.isSupported()) {
            console.log('hls', 'support');
            this.hls.loadSource(this.props.videoUrl);
            this.hls.attachMedia(this.video);
            this.hls.on(HLS.Events.MANIFEST_PARSED, () => {
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
        this.hls.destroy();
    }

    render() {
        return (
            <div className="container ">
                <div
                    className="close"
                    onClick={this.onCloseClickListener}
                ></div>
                <div className="content">
                    <video
                        className="video"
                        controls
                        ref={(mount) => { this.videoNode = mount }}
                    ></video>
                </div>
            </div>)
    }
}

EffectVideoPanel.propTypes = {
    onCloseClickHandler: PropTypes.func.isRequired,
    videoUrl: PropTypes.string.isRequired,
};

export default EffectVideoPanel;

