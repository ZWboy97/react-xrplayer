import React from 'react';
import XRPlayer from '../../src/index'; // 实际项目中使用，请使用如下方式

class TiledDemo extends React.Component {

    state = {
        isFullScreen: false,
        onOrientationControls: false,
        isDataReady: false,
        operationVisible: true
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
        const operation_visible = this.state.operationVisible ? "visible" : "hidden";
        return (
            <div>
                {
                    this.state.isDataReady ?
                        <XRPlayer
                            width="100vw"
                            height="100vh"
                            camera_position={{
                                x: 0,
                                y: 10,
                                z: 0
                            }}
                            onCreated={this.onXRCreated}
                            scene_texture_resource={
                                this.xrConfigure.res_urls
                            }
                            axes_helper_display={false}
                            is_full_screen={this.state.isFullScreen}
                            onFullScreenChange={(isFull) => { this.setState({ isFullScreen: isFull }) }}
                            onEventHandler={this.onEventHandler}
                        ></XRPlayer>
                        :
                        <div>加载中</div>
                }
                <button style={{ "position": "fixed", "top": "0" }}
                    onClick={() => this.setState({ operationVisible: !this.state.operationVisible })}
                >操作</button>
                <div id="operation" style={{
                    "position": "fixed", "bottom": "0",
                    "color": "white",
                    "visibility": operation_visible
                }}>
                    分块选择
                    <table>
                        <tr>
                            <button id='tile0-0'>tile0-0</button>
                            <button id='tile1-0'>tile1-0</button>
                            <button id='tile2-0'>tile2-0</button>
                            <button id='tile3-0'>tile3-0</button>
                        </tr>
                        <tr>
                            <button id='tile0-1'>tile0-1</button>
                            <button id='tile1-1'>tile1-1</button>
                            <button id='tile2-1'>tile2-1</button>
                            <button id='tile3-1'>tile3-1</button>
                        </tr>
                        <tr>
                            <button id='tile0-2'>tile0-2</button>
                            <button id='tile1-2'>tile1-2</button>
                            <button id='tile2-2'>tile2-2</button>
                            <button id='tile3-2'>tile3-2</button>
                        </tr>
                    </table>
                </div>
            </ div>
        )
    }
}

export default TiledDemo;