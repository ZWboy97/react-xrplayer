import React, { Component } from 'react';
import PropTypes from 'prop-types';
import EffectInfoCard from './EffectInfoCard';
import EffectImageCard from './EffectImageCard';
import EffectVideoPanel from './EffectVideoPanel';
import EffectControlPanel from './EffectControlPanel';
import EffectAlphaVideoPanel from './EffectAlphaVideoPanle';
import NewEffectAlphaVideoPanel from './NewEffectAlphaVideoPanle';

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
                    iframeUrl={data.iframeUrl}
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
        } else if (data.type === 'alpha_video') {
            return (
                <NewEffectAlphaVideoPanel
                    key={data.id}
                    videoUrl={data.videoUrl}
                    videoStyle={{
                        width: data.width,
                        height: data.height,
                        margin: data.margin
                    }}
                    enableMask={data.enableMask}
                    enableClose={data.enableClose}
                    videoMuted={data.videoMuted}

                    onCloseClickHandler={() => {
                        this.props.onCloseClickHandler && this.props.onCloseClickHandler();
                    }}
                    onDisplayEndedHandler={() => {
                        this.props.onCallback && this.props.onCallback();
                    }}
                ></NewEffectAlphaVideoPanel>
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

