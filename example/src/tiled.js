import React from 'react';
import XRPlayer from '../../src/index'; // 实际项目中使用，请使用如下方式

class TiledDemo extends React.Component {

    state = {
        isFullScreen: false,
        onOrientationControls: false,
        isDataReady: false
    }

    constructor(props) {
        super(props);
        this.xrManager = null;
        this.xrConfigure = {};
        fetch('/react-xrplayer/mock/view-tiled.json')
            .then(res => {
                return res.json();
            })
            .then(json => {
                console.log('json', json);
                this.xrConfigure = json;
                this.setState({
                    isDataReady: true,
                });
            });
    }

    onXRCreated = (manager) => {
        this.xrManager = manager;
        this.xrManager.connectCameraControl();
    }


    render() {
        return (
            <div>
                {
                    this.state.isDataReady ?
                        <XRPlayer
                            width="100vw"
                            height="100vh"
                            camera_position={{
                                x: 0,
                                y: 450,
                                z: 0
                            }}
                            onCreated={this.onXRCreated}
                            scene_texture_resource={
                                this.xrConfigure.res_urls
                            }
                            axes_helper_display={true}
                            is_full_screen={this.state.isFullScreen}
                            onFullScreenChange={(isFull) => { this.setState({ isFullScreen: isFull }) }}
                            onEventHandler={this.onEventHandler}
                        ></XRPlayer>
                        :
                        <div>加载中</div>
                }
                <div id="operation" style={{ "position": "fixed", "bottom": "0" }}>
                </div>
            </div >
        )
    }
}

export default TiledDemo;