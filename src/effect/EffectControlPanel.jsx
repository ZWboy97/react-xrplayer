import React, { Component } from 'react';
import '../style/EffectControlPanel.less';

class EffectControlPanel extends Component {

    render() {
        return (
            <div className="container">
                <button id="unmuteButton">声音</button>
                <button id="playButton">播放暂停</button>
                <button id="view-fullscreen">全屏</button>
                <button id="cancel-fullscreen">关全屏</button>
                <button id="addCubuButton">添加展示物体</button>
                <button id="removeCubeButton">移除展示物体</button>
            </div>)
    }
}

export default EffectControlPanel;