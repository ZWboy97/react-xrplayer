import React, { Component } from 'react';
import PropTypes from 'prop-types';
import EffectInfoCard from './EffectInfoCard';
import EffectImageCard from './EffectImageCard';
import EffectVideoPanel from './EffectVideoPanel';
import EffectControlPanel from './EffectControlPanel';

class EffectContainer extends Component {

    state = {
        infocard_visible: false
    }

    getEffect = (data) => {
        if (!data) {
            return "";
        }
        if (data.type === 'infocard') {
            return (
                <EffectInfoCard
                    onCloseClickHandler={() => {
                        this.props.onCloseClickHandler && this.props.onCloseClickHandler();
                    }}
                ></EffectInfoCard>
            )
        } else if (data.type === 'image') {
            return (
                <EffectImageCard
                    onCloseClickHandler={() => {
                        this.props.onCloseClickHandler && this.props.onCloseClickHandler();
                    }}
                    imageUrl={data.imageUrl}
                    jumpUrl={data.jumpUrl}
                ></EffectImageCard>
            )
        } else if (data.type === 'video') {
            return (
                <EffectVideoPanel
                    onCloseClickHandler={() => {
                        this.props.onCloseClickHandler && this.props.onCloseClickHandler();
                    }}
                    videoUrl={data.videoUrl}
                ></EffectVideoPanel>
            )
        } else if (data.type === 'control') {
            return (
                <EffectControlPanel
                    onCloseClickHandler={() => {
                        this.props.onCloseClickHandler && this.props.onCloseClickHandler();
                    }}
                ></EffectControlPanel>
            )
        }
        else {
            return ""
        }
    }

    render() {
        const showEffect = this.getEffect(this.props.data);
        return (
            <div >
                {
                    showEffect
                }
            </div>)
    }
}

EffectContainer.propTypes = {
    data: PropTypes.object,
    onCloseClickHandler: PropTypes.func.isRequired
}

export default EffectContainer;

