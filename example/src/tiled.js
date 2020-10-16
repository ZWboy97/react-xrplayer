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
        this.tileStreaming = null;
        this.loadedTileId = -1;
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
            let id = this.getTileId(pos.lat, pos.lon);
            console.log('id', id);
            if (this.loadedTileId === id) {
                return;
            }
            if (this.loadedTileId !== -1) {
                this.tileStreaming.unloadTile(this.loadedTileId)
            }
            this.tileStreaming.loadTile(id, 1);
            this.loadedTileId = id;
        });
        let textureHelper = this.xrManager.getSenceTextureHelper();
        this.tileStreaming = textureHelper.getTextureMediaSource();
    }

    getTileX = (lat) => {
        if (lat >= 120) {
            return 0;
        } else if (lat <= 60) {
            return 2;
        } else {
            return 1;
        }
    }

    getTileY = (lon) => {
        if (lon <= -90) {
            return 0;
        } else if (lon > -90 && lon <= 0) {
            return 1;
        } else if (lon > 0 && lon <= 90) {
            return 2;
        } else if (lon > 90 && lon <= 180) {
            return 3;
        }
    }

    getTileId = (lat, lon) => {
        let x = this.getTileX(lat);
        let y = this.getTileY(lon);
        console.log('x', x, 'y', y);
        return x * 4 + y;
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
                            camera_helper_display={true}
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