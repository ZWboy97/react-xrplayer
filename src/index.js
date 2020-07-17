import React from 'react';
import './index.css';
import Player from './Player';
import { Provider } from 'react-redux' // https://react-redux.js.org/api/connect
import store from './store';

class XRPlayer extends React.Component {
    render() {
        return (
            <Provider store={store}>
                <Player {...this.props} />
            </Provider>
        )
    }
}

export default XRPlayer;

