import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Iframe from 'react-iframe'
import './style/EffectInfoCard.less';

class EffectInfoCard extends Component {

    onCloseClickListener = (e) => {
        e.preventDefault();
        if (this.props.onCloseClickHandler) {
            this.props.onCloseClickHandler();
        }
    }

    render() {
        return (
            <div className="info-overlay">
                <Iframe
                    url={this.props.iframeUrl}
                    className="iframe"
                    loading='true'
                    allow="fullscreen"
                    display="initial" />

                <div
                    className="info-close"
                    onClick={this.onCloseClickListener}
                ></div>
            </div>)
    }
}

EffectInfoCard.propTypes = {
    onCloseClickHandler: PropTypes.func.isRequired,
    iframeUrl: PropTypes.string.isRequired
};

export default EffectInfoCard;

