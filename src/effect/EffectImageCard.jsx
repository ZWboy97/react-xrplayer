import React, { Component } from 'react';
import PropTypes from 'prop-types';
import '../style/EffectImageCard.less';

class EffectImageCard extends Component {

    onCloseClickListener = (e) => {
        e.preventDefault();
        if (this.props.onCloseClickHandler) {
            this.props.onCloseClickHandler();
        }
    }

    onImageClickListenr = (e) => {
        e.preventDefault();
        if (this.props.jumpUrl) {
            window.open(this.props.jumpUrl, '_blank');
        }
    }

    render() {
        console.log('imageurl', this.props.imageUrl);
        return (
            <div className="overlay">
                <div className="container">
                    <img
                        className="image"
                        onClick={this.onImageClickListenr}
                        src={this.props.imageUrl}
                        alt=""></img>
                </div>
                <div
                    className="close"
                    onClick={this.onCloseClickListener}
                ></div>
            </div>
        )
    }
}

EffectImageCard.propTypes = {
    onCloseClickHandler: PropTypes.func.isRequired,
    imageUrl: PropTypes.string.isRequired,
    jumpUrl: PropTypes.string,
};

export default EffectImageCard;

