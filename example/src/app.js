import React from 'react';
//import XRPlayer from '../../lib/index';
import XRPlayer from '../../src/index';
//import XRPlayer from 'react-xrplayer'
console.log('xrplayer', XRPlayer);
class App extends React.Component {

    state = {
        isFullScreen: false,
        onOrientationControls: false
    }

    constructor(props) {
        super(props);
        this.xrManager = null;

        this.model_list = [
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
            ['video', { phi: -153, theta: -44, res_url: 'https://live360.oss-cn-beijing.aliyuncs.com/xr/icons/hotspot_video.png' }]
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
        this.xrManager.setFovVerticalScope(-50, 50);
        this.xrManager.setParticleEffectRes({
            url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/sprites/snowflake1.png'
            ,
            num: 5000, range: 500,
            color: 0xffffff, sizeAttenuation: true
        });
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

    onAddModel = () => {
        this.xrManager.addModel('12332', {
            objUrl: "https://live360.oss-cn-beijing.aliyuncs.com/xr/models/SambaDancing.fbx",
            texture: "texture1.png",
            modeFormat: "fbx",
            scale: 1
        })
    }

    onRemoveModel = () => {
        this.xrManager.removeModel('12332');
    }

    onRemoveAllModel = () => {
        this.xrManager.removeAllModel();
    }

    onOrientationControls = () => {
        if (this.xrManager.getEnableOrientationControls()) {
            this.xrManager.disableOrientationControls();
        } else {
            this.xrManager.enableOrientationControls();
        }
    }

    onAutoRotateEnable = () => {
        const enable = this.xrManager.getEnableAutoRotate();
        this.xrManager.setEnableAutoRotate(!enable);
    }

    onAutoRotateDirection = () => {
        this.xrManager.setAutoRotateDirection('right');
    }

    onAutoRotateSpeed = () => {
        this.xrManager.setAutoRotateSpeed(10.0);
    }

    onParticleEffect = () => {
        if (this.xrManager.getEnableParticleDisplay()) {
            this.xrManager.enableParticleDisplay(false);
        } else {
            this.xrManager.enableParticleDisplay(true)
        }
    }

    onGetCameraParas = () => {
        const fov = this.xrManager.getCameraFov();
        const position = this.xrManager.getCameraPosition();
        alert(`fov:${fov}\nposition:\nx:${position.x}\ny:${position.y}\nz:${position.z}`)
    }

    onSetCameraParas = () => {
        this.xrManager.setCameraPosition(0, 450, 0);
        this.xrManager.setCameraFov(150);
    }

    onStartSenceVideoDisplay = () => {
        this.xrManager.startDisplaySenceResource();
    }
    onPauseSenceVideoDisplay = () => {
        this.xrManager.pauseDisplaySenceResource();
    }

    onVRControls = () => {
        this.xrManager.changeVRStatus();
    }

    onCreateTextBox = () => {
        if (!!!this.TextBox) {
            this.TextBox = this.xrManager.createTextBox({
                position: {x:0,y:0,z:-500}
            });
            this.TextBoxHidden = false;
        }
    }

    onChangeTextBox = () => {
        this.xrManager.changeTextBox(this.TextBox,{
            message: "Text has changed. 想要输入更长的句子,请同时修改canvasWidth和scaleX，否则会发生这种情况",
            borderWidth: 1650,
        });
    }

    onShowTextBox = () => {
        if (this.TextBoxHidden) {
            this.xrManager.showTextBox(this.TextBox);
            this.TextBoxHidden = false;
        }
        else {
            this.xrManager.hideTextBox(this.TextBox);
            this.TextBoxHidden = true;
        }
    }

    onRemoveTextBox = () => {
        this.xrManager.removeTextBox(this.TextBox);
        this.TextBox = null;
    }


    render() {
        return (
            <div>
                <XRPlayer
                    width="100vw"
                    height="90vh"
                    camera_position={{
                        x: 0,
                        y: 450,
                        z: 0
                    }}
                    onCreated={this.onXRCreated}
                    scene_texture_resource={{
                        type: 'hls',
                        res_url: 'http://cache.utovr.com/s1e3tzoku70yk8mpa3/L3_5dxsrk4kh56gc4l1_v2.m3u8'
                    }}
                    is_full_screen={this.state.isFullScreen}
                    onFullScreenChange={(isFull) => { this.setState({ isFullScreen: isFull }) }}
                    onEventHandler={this.onEventHandler}
                ></XRPlayer>
                <button onClick={this.onStartSenceVideoDisplay}>播放</button>
                <button onClick={this.onPauseSenceVideoDisplay}>暂停</button>
                <button onClick={() => { this.setState({ isFullScreen: true }) }}>全屏</button>
                <button onClick={this.onOrientationControls}>切换/取消传感器控制</button>
                <button onClick={this.onChangeSenceRes}>切换场景</button>
                <button onClick={this.onAddHotSpot}>添加热点</button>
                <button onClick={this.onRemoveHotSpot}>移除热点</button>
                <button onClick={this.onAddModel}>添加模型</button>
                <button onClick={this.onRemoveModel}>移除模型</button>
                <button onClick={this.onRemoveAllModel}>移除所有模型</button>
                <button onClick={this.onAutoRotateEnable}>自动旋转</button>
                <button onClick={this.onAutoRotateSpeed}>自动旋转速度</button>
                <button onClick={this.onAutoRotateDirection}>自动旋转方向</button>
                <button onClick={this.onParticleEffect}>添加粒子效果</button>
                <button onClick={this.onGetCameraParas}>获取相机参数</button>
                <button onClick={this.onSetCameraParas}>重置相机初始位置</button>
                <button onClick={this.onVRControls}>进入/退出VR视角</button>
                <button onClick={this.onCreateTextBox}>创建文本框</button>
                <button onClick={this.onShowTextBox}>显示/隐藏文本框</button>
                <button onClick={this.onChangeTextBox}>修改文本框</button>
                <button onClick={this.onRemoveTextBox}>移除文本框</button>
            </div >
        )
    }
}

export default App;