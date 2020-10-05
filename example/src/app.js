import React from 'react';
import XRPlayer from '../../src/index'; // 实际项目中使用，请使用如下方式
//import XRPlayer from 'react-xrplayer'
import TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';
import EmbeddedTextBox from "../../src/display/ResourceBox/EmbeddedResource/EmbeddedTextBox";
import EmbeddedImageBox from "../../src/display/ResourceBox/EmbeddedResource/EmbeddedImageBox";
import EmbeddedVideoBox from "../../src/display/ResourceBox/EmbeddedResource/EmbeddedVideoBox";
class App extends React.Component {

    state = {
        isFullScreen: false,
        onOrientationControls: false,
        isDataReady: false
    }

    constructor(props) {
        super(props);
        this.xrManager = null;
        this.xrConfigure = {};
        this.hot_spot_list = [];
        this.event_list = [];
        this.model_list = [];
        this.autoDisplayList = [];
        fetch('/react-xrplayer/mock/view1.json')
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
        window.xrManager = manager;
        this.xrManager.setHotSpots(this.xrConfigure.hot_spot_list, this.xrConfigure.event_list);
        this.xrManager.toNormalView(5000, 1000);
        this.xrManager.setModels(this.xrConfigure.model_list);
        this.xrManager.connectCameraControl();
        this.xrManager.setFovVerticalScope(-90, 90);
        this.xrManager.enableChangeFov(true);
        this.xrManager.setParticleEffectRes(this.xrConfigure.particle_effect);
        this.onCameraAnimationSet();
    }

    onCameraAnimationSet = () => {
        this.xrManager.initAudio();
        this.xrManager.setAudioSrc("http://www.tutorialrepublic.com/examples/audio/sea.mp3");

        let animateList = [
            {
                pos0: { lat: 0, lon: 180, fov: 80, distance: 100 },
                pos1: { lat: 0, lon: 0, fov: 80, distance: 100 },
                duration: 5000, easing: TWEEN.Easing.Sinusoidal.InOut,
            },
            {
                pos0: { lat: 0, lon: 0, fov: 80 },
                pos1: { lat: 0, lon: -180, fov: 80 },
                duration: 5000, easing: TWEEN.Easing.Sinusoidal.InOut,
            }
        ]
        var cameraTweenGroup = this.xrManager.createCameraTweenGroup(animateList, true);
        //cameraTweenGroup.enableAutoNext(true);
        this.xrManager.setCameraTweenGroup(cameraTweenGroup);
        // this.xrManager.onCameraAnimationEnded = (index) => {
        //     cameraTweenGroup.next();
        // }
    }

    onEventHandler = (name, props) => {
        console.log('event:', `name=${name},props:${props}`);
    }

    onChangeSenceRes = () => {
        this.xrManager.setSenceResource({
            type: 'hls',
            res_url: 'https://cache2.utovr.com/977825f316044bd6b20362be4cf39680/L2_1buy4rinqqxlqesb.m3u8'
        });
    }

    onAddHotSpot = () => {
        this.xrManager.addHotSpot({
            key: `infocard`,
            value: {
                lat: - 90, lon: -10,
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
        const spherical = new THREE.Spherical();
        spherical.setFromCartesianCoords(position.x, position.y, position.z);
        var phi = spherical.phi;
        var theta = spherical.theta;
        var lon = 90 - THREE.Math.radToDeg(theta);
        var lat = 90 - THREE.Math.radToDeg(phi);
        alert(`fov:${fov}\nposition:\nx:${position.x}\ny:${position.y}\nz:${position.z}
             \nlon:${lon},lat:${lat}`)
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
        let textBox = new EmbeddedTextBox('box1');
        // textBox.setText('helloooooooooooooooooooooo');
        textBox.setPosition(-30, 0);
        this.boxManager = this.xrManager.getEmbeddedBoxManager();
        this.boxManager.addEmbeddedBox(textBox);

        let imageBox = new EmbeddedImageBox('box2');
        imageBox.setImage(process.env.PUBLIC_URL+'/logo192.png', 192, 192);
        imageBox.setPosition(0, 45);
        this.boxManager.addEmbeddedBox(imageBox);

        let videoBox = new EmbeddedVideoBox('box3');
        videoBox.setVideo(process.env.PUBLIC_URL+'/shuttle.mp4', 426, 240);
        videoBox.setPosition(0, 120);
        // videoBox.setEnableAutoDisplay(true);
        this.boxManager.addEmbeddedBox(videoBox);
    }

    onChangeTextBox = () => {
        if (!!!this.boxManager) {
            alert("请先点击“创建文本框”按钮");
            return;
        }

        let textBox = this.boxManager.getEmbeddedBox('box1');
        textBox && textBox.setTextSize('large');
        textBox && textBox.setDraggable(true);
        /*textBox.onClick(() => {
            console.log("点击了标签");
        });*/
        this.xrManager.simpleSetEmbeddedBoxEvent('box1', {
                type: 'infocard',
                iframeUrl: "https://gs.ctrip.com/html5/you/place/14.html"
            });

        let imageBox = this.boxManager.getEmbeddedBox('box2');
        imageBox.setImage(process.env.PUBLIC_URL+'/logo512.png', 512, 512);
        imageBox.setDraggable(true);
        imageBox.setScale(0.3, 0.3);
        this.xrManager.simpleSetEmbeddedBoxEvent('box2', {
            type: 'image',
            imageUrl: "https://pic-cloud-bupt.oss-cn-beijing.aliyuncs.com/5c882ee6443a5.jpg",
            jumpUrl: 'http://www.youmuvideo.com',
        });

        let videoBox = this.boxManager.getEmbeddedBox('box3');
        videoBox.setVideoSize(213, 120);
        videoBox.setPosition(30, 0);
        videoBox.play();
        videoBox.setDraggable(true);
        this.xrManager.simpleSetEmbeddedBoxEvent('box3', {
            type: 'video',
            videoUrl: 'https://video-cloud-bupt.oss-cn-beijing.aliyuncs.com/hangzhou.mp4'
        });
    }

    onShowTextBox = () => {
        let boxManager = this.xrManager.getEmbeddedBoxManager();
        let boxes = [];
        let textBox = boxManager.getEmbeddedBox('box1');
        boxes.push(textBox);
        textBox = boxManager.getEmbeddedBox('box2');
        boxes.push(textBox);
        textBox = boxManager.getEmbeddedBox('box3');
        boxes.push(textBox);
        for (let textBox of boxes) {
            if (!!!textBox) {
                alert("请先点击“创建文本框”按钮");
                continue;
            }
            let visible = textBox.getVisible();
            if (!visible) {
                textBox.setVisible(true);
                this.TextBoxHidden = false;
            }
            else {
                textBox.setVisible(false);
                this.TextBoxHidden = true;
            }
        }
    }

    onRemoveTextBox = () => {
        let boxManager = this.xrManager.getEmbeddedBoxManager();
        if (!boxManager.removeEmbeddedBox('box1')) {
            alert("请先点击“创建文本框”按钮");
            return;
        }
        if (!boxManager.removeEmbeddedBox('box2')) {
            alert("请先点击“创建文本框”按钮");
            return;
        }
        if (!boxManager.removeEmbeddedBox('box3')) {
            alert("请先点击“创建文本框”按钮");
        }
    }

    onChangeTextBoxType = () => {
        let manager = this.xrManager.getEmbeddedBoxManager();
        let boxes = [];
        let boxx = manager.getEmbeddedBox('box1');
        boxes.push(boxx);
        boxx = manager.getEmbeddedBox('box2');
        boxes.push(boxx);
        boxx = manager.getEmbeddedBox('box3');
        boxes.push(boxx);
        for (let box of boxes) {
            if (!!!box) return;
            let showType = box.getShowType();
            if (showType === '2d') {
                showType = 'embed';
            }
            else {
                showType = '2d';
            }
            box.setShowType(showType);
        }
    }

    onSimpleCreateTextBox = () => {
        let simpleBox = this.xrManager.simpleCreateImageBox('textBoxSimple');
        simpleBox.setImage(process.env.PUBLIC_URL+'/logo512.png', 512, 512);
        let boxManager = this.xrManager.getEmbeddedBoxManager();
        boxManager.addEmbeddedBox(simpleBox);
    }

    onSimpleChangeTextBox = () => {
        let boxManager = this.xrManager.getEmbeddedBoxManager();
        let textBox = boxManager.getEmbeddedBox('textBoxSimple');
        if (textBox == null) {
            alert("请先点击“在相机注视位置创建文本框”按钮");
            return;
        }
        textBox.setImageSize(256, 256);
        textBox.onClick(() => {
            console.log("点击了简易标签");
        });
    }

    onPickDirector = () => {
        let pos = this.xrManager.getCameraLatLon();
        let fov = this.xrManager.getCameraFov();
        let startLat = 0, startLon = 180;
        if (this.autoDisplayList.length !== 0) {
            startLat = this.autoDisplayList[this.autoDisplayList.length - 1].pos1.lat;
            startLon = this.autoDisplayList[this.autoDisplayList.length - 1].pos1.lon;
        }
        this.autoDisplayList.push({
            pos0: { lat: startLat, lon: startLon, fov: 80, distance: 100 },
            pos1: { lat: pos.lat, lon: pos.lon, fov: fov, distance: 100 },
            duration: 5000, easing: TWEEN.Easing.Sinusoidal.InOut,
        })
    }

    onStartAutoDisplay = () => {
        var cameraTweenGroup = this.xrManager.createCameraTweenGroup(this.autoDisplayList, true);
        this.xrManager.setCameraTweenGroup(cameraTweenGroup);
        cameraTweenGroup.enableAutoNext(true);
        this.xrManager.startCameraTweenGroup();
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
                                this.xrConfigure.res_urls[0]
                            }
                            axes_helper_display={true}
                            is_full_screen={this.state.isFullScreen}
                            onFullScreenChange={(isFull) => { this.setState({ isFullScreen: isFull }) }}
                            onEventHandler={this.onEventHandler}
                        ></XRPlayer>
                        :
                        <div>加载中</div>
                }
                <div style={{ "position": "fixed", "bottom": "0" }}>
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
                    <button onClick={this.onChangeTextBoxType}>改变文本框类型</button>
                    <button onClick={this.onSimpleCreateTextBox}>在相机注视位置创建文本框</button>
                    <button onClick={this.onSimpleChangeTextBox}>修改文本框内容</button>
                    <button onClick={() => { this.xrManager.getAudioPaused() ? this.xrManager.playAudio() : this.xrManager.pauseAudio(); }}>播放/暂停音频</button>
                    <button onClick={() => { this.xrManager.getAudioVolume() === 1 ? this.xrManager.setAudioVolume(0.5) : this.xrManager.setAudioVolume(1); }}>减小音量/复原</button>
                    <button onClick={() => { this.xrManager.getAudioMuted() ? this.xrManager.setAudioMuted(false) : this.xrManager.setAudioMuted(true); }}>静音/复原</button>
                    <button onClick={() => { this.xrManager.replayAudio(); }}>回到开头</button>
                    <button onClick={() => { this.xrManager.endAudio(); }}>到达结尾</button>
                    <button onClick={() => { this.xrManager.startCameraTweenGroup(); }}>开始导览</button>
                    <button onClick={() => { this.xrManager.playCameraTweenGroup(); }}>播放</button>
                    <button onClick={() => { this.xrManager.pauseCameraTweenGroup() }}>暂停</button>
                    <button onClick={() => { this.xrManager.stopCameraTweenGroup(); }}>停止</button>
                    <button onClick={this.onPickDirector}>拾取导览点</button>
                    <button onClick={this.onStartAutoDisplay}>开始自动导览</button>
                </div>
            </div >
        )
    }
}

export default App;