import React, { Component } from 'react';
import PropTypes from 'prop-types';
import '../style/EffectControlPanel.less';

class EffectControlPanel extends Component {

    componentDidMount() {
    }

    onCloseClickListener = (e) => {
        e.preventDefault();
        if (this.props.onCloseClickHandler) {
            this.props.onCloseClickHandler();
        }
    }

    componentWillUnmount() {
    }

    render() {
        return (
            <div className="overlay">
                <div className="container ">
                    <div
                        className="close"
                        onClick={this.onCloseClickListener}
                    ></div>
                    <div className="content">
                        <button>控制面板</button>
                    </div>
                </div>

            </div>
        )
    }
}

EffectControlPanel.propTypes = {
    onCloseClickHandler: PropTypes.func.isRequired,
};

export default EffectControlPanel;

