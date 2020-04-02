import React from 'react';
//import XRPlayer from '../../lib/index';
import XRPlayer from '../../src/index';
//import XRPlayer from 'react-xrplayer'
console.log('xrplayer', XRPlayer);
class App extends React.Component {

    state = {
        isFullScreen: false
    }

    constructor(props) {
        super(props);
        this.xrManager = null;

        this.model_list = [
            ['12332', {
                objUrl: "https://live360.oss-cn-beijing.aliyuncs.com/xr/models/SambaDancing.fbx",
                texture: "texture1.png",
                modeFormat: "fbx",
                scale: 1
            }],
            ['23433', {
                objUrl: "https://live360.oss-cn-beijing.aliyuncs.com/xr/models/texture1.json",
                texture: "https://live360.oss-cn-beijing.aliyuncs.com/xr/models/texture1.png",
                modeFormat: "obj",
                scale: 1
            }]
        ];

        this.hot_spot_list = [
            ['infocard', {
                phi: -90, theta: -10, animate: true,
                res_url: 'https://live360.oss-cn-beijing.aliyuncs.com/xr/icons/hotspot_video.png'
            }],
            ['image', { phi: 32, theta: 14, res_url: 'https://live360.oss-cn-beijing.aliyuncs.com/xr/icons/hotspot_video.png' }],
            ['video', { phi: -153, theta: -44, res_url: 'https://live360.oss-cn-beijing.aliyuncs.com/xr/icons/hotspot_video.png' }],
            ['control', { phi: 67, theta: 19, res_url: 'https://live360.oss-cn-beijing.aliyuncs.com/xr/icons/hotspot_video.png' }]
        ];

        this.event_list = [
            ['infocard', {
                id: 'infocard',
                type: 'infocard',
                iframeUrl: "https://gs.ctrip.com/html5/you/place/14.html"
            }],
            ['image', {
                id: 'image',
                type: 'image',
                imageUrl: "https://pic-cloud-bupt.oss-cn-beijing.aliyuncs.com/5c882ee6443a5.jpg",
                jumpUrl: 'http://www.youmuvideo.com',
            }],
            ['video', {
                id: 'video',
                type: 'video',
                videoUrl: 'https://video-cloud-bupt.oss-cn-beijing.aliyuncs.com/hangzhou.mp4'
            }],
            ['control', {
                id: 'control',
                type: 'control',
            }]
        ]
    }

    onXRCreated = (manager) => {
        this.xrManager = manager;
        this.xrManager.setHotSpots(this.hot_spot_list, this.event_list);
        this.xrManager.toNormalView(8000, 1000);
        this.xrManager.setModels(this.model_list);
        this.xrManager.connectCameraControl();
    }

    onEventHandler = (name, props) => {
        console.log('event:', `name=${name},props:${props}`);
    }

    onChangeSenceRes = () => {
        this.xrManager.setSenceResource({
            type: 'image',
            res_url: 'https://pic-cloud-bupt.oss-cn-beijing.aliyuncs.com/5c882ee6443a5.jpg'
        });
    }

    onAddHotSpot = () => {
        this.xrManager.addHotSpot({
            key: `infocard`,
            value: {
                phi: - 90, theta: -10,
                res_url: 'https://live360.oss-cn-beijing.aliyuncs.com/xr/icons/hotspot_video.png'
            }
        }, {
            key: `infocard`,
            value: {
                id: 'infocard',
                type: 'infocard',
                iframeUrl: "https://gs.ctrip.com/html5/you/place/14.html"
            }
        })
        alert(`添加了一个热点标签`)
    }

    onRemoveHotSpot = () => {
        this.xrManager.removeHotSpot('infocard')
        alert(`移除了一个热点标签`);
    }


    render() {
        return (
            <div>
                <XRPlayer
                    width="100vw"
                    height="80vh"
                    onCreated={this.onXRCreated}
                    scene_texture_resource={{
                        type: 'hls',
                        res_url: 'http://cache.utovr.com/s1e3tzoku70yk8mpa3/L3_5dxsrk4kh56gc4l1_v2.m3u8'
                    }}
                    is_full_screen={this.state.isFullScreen}
                    onFullScreenChange={(isFull) => { this.setState({ isFullScreen: isFull }) }}
                    onEventHandler={this.onEventHandler}
                ></XRPlayer>
                <button onClick={() => { this.setState({ isFullScreen: true }) }}>全屏</button>
                <button onClick={this.onChangeSenceRes}>切换场景</button>
                <button onClick={this.onAddHotSpot}>添加热点</button>
                <button onClick={this.onRemoveHotSpot}>移除热点</button>
            </div>
        )
    }
}

export default App;