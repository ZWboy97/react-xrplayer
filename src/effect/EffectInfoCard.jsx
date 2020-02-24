import React, { Component } from 'react';
import PropTypes from 'prop-types';
import '../style/EffectInfoCard.less';

class EffectInfoCard extends Component {

    onCloseClickListener = (e) => {
        e.preventDefault();
        if (this.props.onCloseClickHandler) {
            this.props.onCloseClickHandler();
        }
    }

    render() {
        return (
            <div className="md-modal ">
                <div
                    className="md-close"
                    onClick={this.onCloseClickListener}
                ></div>
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

EffectInfoCard.propTypes = {
    onCloseClickHandler: PropTypes.func.isRequired
};

export default EffectInfoCard;

