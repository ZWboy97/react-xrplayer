import React from 'react';
//import XRPlayer from '../../lib/index';
import XRPlayer from '../../src/index';
//import XRPlayer from 'react-xrplayer'
console.log('xrplayer', XRPlayer);
class App extends React.Component {


    render() {
        return (
            <div>
                <XRPlayer></XRPlayer>
            </div>
        )
    }
}

export default App;