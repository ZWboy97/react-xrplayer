import React from 'react';
import XRPlayer from '../../src/index'; // 实际项目中使用，请使用如下方式

class TiledDemo extends React.Component {

    state = {
        isFullScreen: false,
        onOrientationControls: false,
        isDataReady: false,
        operation_state: "none"
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
        this.tileStreaming = null;
    }

    onXRCreated = (manager) => {
        this.xrManager = manager;
        this.xrManager.connectCameraControl();
        this.xrManager.enableKeyControl(true);
        this.xrManager.onCameraPositionUpdate((pos) => {
            console.log('lat', pos.lat, 'lon', pos.lon);
            if (this.tileStreaming === null) {
                return;
            }
            this.tileStreaming.onCameraPositionUpdate(pos.lat, pos.lon);
        });
        let textureHelper = this.xrManager.getSenceTextureHelper();
        this.tileStreaming = textureHelper.getTextureMediaSource();
    }

    render() {
        const operation_state = this.state.operation_state;
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
                            camera_helper_display={true}
                            is_full_screen={this.state.isFullScreen}
                            onFullScreenChange={(isFull) => { this.setState({ isFullScreen: isFull }) }}
                            onEventHandler={this.onEventHandler}
                        ></XRPlayer>
                        :
                        <div>加载中</div>
                }
                <div id="operation" style={{
                    "position": "fixed", "bottom": "0",
                    "color": "white",
                    "visibility": operation_state === 'tile' ? 'visible' : "hidden"
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
                <div
                    style={{
                        "position": "fixed", "bottom": "0",
                        "color": "white",
                        "background": 'white',
                        "visibility": operation_state === 'chart' ? 'visible' : "hidden"
                    }}
                >
                    <div id="c1"></div>
                    <div id="c1"></div>
                </div>
                <div style={{ "position": "fixed", "top": "0" }} >
                    <button
                        onClick={() => this.setState({ operation_state: "tile" })}
                    >分块</button>
                    <button
                        onClick={() => this.setState({ operation_state: 'chart' })}
                    >图标</button>
                    <button
                        onClick={() => this.setState({ operation_state: 'none' })}
                    >关闭</button>
                </div>
            </ div>
        )
    }
}

export default TiledDemo;