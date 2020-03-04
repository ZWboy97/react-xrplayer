import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Iframe from 'react-iframe'
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
            <div className="overlay">
                <Iframe
                    url="https://gs.ctrip.com/html5/you/place/14.html"
                    className="iframe"
                    loading='true'
                    allow="fullscreen"
                    display="initial" />

                <div
                    className="close"
                    onClick={this.onCloseClickListener}
                ></div>
            </div>)
    }
}

EffectInfoCard.propTypes = {
    onCloseClickHandler: PropTypes.func.isRequired
};

export default EffectInfoCard;

