import React, { Component } from 'react';
import '../style/EffectInfoCard.less';

class EffectInfoCard extends Component {




    render() {
        return (
            <div className="md-modal ">
                {/* <button id="unmuteButton">声音</button>
                <button id="playButton">播放暂停</button>
                <button id="view-fullscreen">全屏</button>
                <button id="cancel-fullscreen">关全屏</button>
                <button id="addCubuButton">添加展示物体</button>
                <button id="removeCubeButton">移除展示物体</button> */}
                <div className="md-close"></div>
                <div className="md-main">
                    <div className="md-content">
                        <p>中秋是我国三大灯节之一，人月双圆，少不了花灯。早在北宋《武林旧事》中，记载中秋夜节俗：将“一点红”灯放入江中漂流玩耍……</p>
                        <p>中秋玩花灯，多集中在南方。中秋夜，树中秋，“树”即“竖”，即将灯彩高竖起来。小孩子在家长协助下扎出兔仔灯、杨桃灯或正方形灯，横挂在短竿中，再竖在高杆上，彩光闪耀，为中秋添景。孩子们互相比赛，看谁竖得高，竖得多，灯彩最精巧。</p>
                        <p>花灯，又名“彩灯”，有吉祥的含意，是我国传统农业时代的文化产物，兼具生活功能与艺术特色。</p>
                    </div>
                    <div className="md-text-mask"></div>
                </div>
            </div>)
    }

}

export default EffectInfoCard;