import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

class CameraTween {
    constructor(tweenParams, camera, cameraDistance, cameraControl) {

        this.key = 0;
        this.pos0 = null;
        this.pos1 = null;
        this.duration = null;
        this.easing = null;
        this.tween = null;
        this.onUpdate = null;
        this.focus = new THREE.Vector3(0, 0, 0);

        this.camera = camera;
        this.distance = cameraDistance;
        this.fovDownEdge = cameraControl.fovDownEdge;
        this.fovTopEdge = cameraControl.fovTopEdge;
        this.reset = cameraControl.initSphericalData;        //动画结束后视角停在结束的位置，不会回到之前的位置
        this.started = false;               //在start之后stop之前调用start会导致不会调用onStop，无法使用相机控制

        this.startTime = 0;
        this.endTime = 0;

        this.posType = 0;                   // 0 表示都不用， 1 采用xyz， 2 采用经纬度
        this.fovChange = false;             //是否涉及fov的改变
        this.disChange = false;             //是否涉及distance的改变

        this.onCameraAnimationEnded = null; // 动画结束后回调
        this.onCameraAnimationStop = null;
        this.onCameraAnimationStart = null;
        this.init(tweenParams);
    }

    init = (params) => {
        this.duration = params.duration;
        this.easing = params.easing;
        this.pos0 = {};
        this.pos1 = {};
        Object.assign(this.pos0, params.start);
        Object.assign(this.pos1, params.end);
        this.tween = new TWEEN.Tween(this.pos0).to(this.pos1, params.duration);
        this.tween.onStart(() => {
            this.started = true;
            this.startTime = new Date().getTime();
            this.onCameraAnimationStart &&
                this.onCameraAnimationStart(this.key);
        });
        this.tween.onComplete(() => {
            this.onCameraAnimationEnded &&
                this.onCameraAnimationEnded(this.key);
            this.reset();
            this.started = false;
        });
        this.tween.onStop(() => {
            this.onCameraAnimationStop &&
                this.onCameraAnimationStop(this.key);
            this.reset();
            this.started = false;
        });

        if (params.hasOwnProperty("easing")) {
            let easing = this.getEasingFunc(params.easing);
            this.tween.easing(easing);
        }
        if (this.pos0.hasOwnProperty("x")) {
            this.posType = 1;
        }
        if (this.pos0.hasOwnProperty("lat")) {
            this.posType = 2;
        }
        if (this.pos0.hasOwnProperty("fov")) {
            this.fovChange = true;
        }
        if (this.pos0.hasOwnProperty("distance")) {
            this.disChange = true;
        }

        const cameraTween = this;
        this.tween.onUpdate((pos) => {
            if (this.onUpdate) {
                this.onUpdate(pos);
            }
            if (cameraTween.posType === 2) {
                if (!this.disChange) {
                    pos.distance = this.distance;
                }
                const newPos = cameraTween.spherical2Cartesian(pos.lat, pos.lon, pos.distance);
                cameraTween.camera.position.x = newPos.x;
                cameraTween.camera.position.y = newPos.y;
                cameraTween.camera.position.z = newPos.z;
            }
            else if (cameraTween.posType === 1) {
                cameraTween.camera.position.x = pos.x;
                cameraTween.camera.position.y = pos.y;
                cameraTween.camera.position.z = pos.z;
            }
            if (cameraTween.fovChange) {
                cameraTween.camera.fov = pos.fov;
                this.camera.updateProjectionMatrix();
            }
            cameraTween.camera.lookAt(cameraTween.camera.target);
        });
    }

    setFocus = (focus) => {
        this.focus.x = focus.x;
        this.focus.y = focus.y;
        this.focus.z = focus.z;
    }

    getEasingFunc = (name) => {
        switch (name) {
            case 'InOut':
                return TWEEN.Easing.Sinusoidal.InOut;
            case 'In':
                return TWEEN.Easing.Sinusoidal.In;
            case 'Out':
                return TWEEN.Easing.Sinusoidal.Out;
            default: return TWEEN.Easing.Sinusoidal.InOut;
        }
    }

    //经纬度到xyz的转换
    spherical2Cartesian = (lat, lon, distance) => {
        const pos = { x: 0, y: 0, z: 0 };
        // lat = Math.max(this.fovDownEdge, Math.min(this.fovTopEdge, lat));
        const phi = THREE.Math.degToRad(lat);
        const theta = THREE.Math.degToRad(lon);
        pos.x = this.focus.x + distance * Math.sin(phi) * Math.sin(theta);
        pos.y = this.focus.y + distance * Math.cos(phi);
        pos.z = this.focus.z + distance * Math.sin(phi) * Math.cos(theta);
        return pos;
    }

    start = (time) => {
        if (this.started) {
            return;
        }
        if (!!!time)
            this.tween.start();
        else {
            this.tween.start(time);
        }
    }

    stop = () => {
        this.tween.stop();
    }

    chain = (cameraTween) => {
        this.tween.chain(cameraTween.tween);
    }
}

class CameraTweenGroup {

    constructor(cameraTweens, distance, cameraControl) {
        this.cameraTweens = cameraTweens;
        this.cameraControl = cameraControl;
        this.distance = distance;

        this.autoNext = false;

        this.playTween = null;

        this.loop = false;

        this.len = cameraTweens.length;

        this.state = 'ready';       // ready, running, stop, paused

        this.currentIndex = 0;

        this.onCameraAnimationEnded = null;
        this.onCameraAnimationStart = null;
        this.onCameraAnimationStop = null;

        this.startTime = 0;
        this.pauseTime = 0;

        this.init();
    }

    init = () => {
        this.initCallback();
    }

    initAutoNext = () => {
        for (let i = 0; i < this.len - 1; i++) {
            this.cameraTweens[i].chain(this.cameraTweens[i + 1]);
        }
    }

    initCallback = () => {
        this.cameraTweens.forEach((item, itemIndex) => {
            item.onCameraAnimationEnded = (key) => {
                this.state = 'ready';
                this.onCameraAnimationEnded &&
                    this.onCameraAnimationEnded(key);
            }
            item.onCameraAnimationStart = (key) => {//以后修改这个函数时记得同步修改createPlayTween的start函数
                this.currentIndex = itemIndex;
                this.state = 'running';
                this.startTime = new Date().getTime();
                this.onCameraAnimationStart &&
                    this.onCameraAnimationStart(key);
            }
            item.onCameraAnimationStop = (key) => {
                if (this.state === 'stoped') {
                    this.resetState();
                } else {
                    this.state = 'paused';
                }
                this.onCameraAnimationStop &&
                    this.onCameraAnimationStop(key);
            }
        })
    }

    cancleAutoNext = () => {
        if (this.cameraTweens) {
            this.cameraTweens.forEach((item) => {
                item.chain([]);
            })
        }
    }

    enableAutoNext = (enable) => {
        if (enable && !this.autoNext) {
            this.initAutoNext();
        } else if (this.autoNext && !enable) {
            this.cancleAutoNext();
        }
    }

    enableLoop = (enable) => {

        if (enable && !this.loop) {
            this.loop = enable;
            this.initLoop()
        } else if (this.loop && !enable) {
            this.cancleLoop();
        }
    }

    initLoop = () => {
        if (this.autoNext) {
            this.cameraTweens[this.len - 1].chain(this.cameraTweens[0]);
        }
    }

    cancleLoop = () => {
        if (this.autoNext) {
            this.cameraTweens[this.len - 1].chain([]);
        }
    }

    start = (index = 0) => {
        this.stop();
        this.currentIndex = index;
        this.cameraTweens[this.currentIndex].start();
    }

    stop = () => {
        if (this.state === 'running') {
            this.state = 'stoped';
            this.cameraTweens[this.currentIndex].stop();
        } else {
            this.resetState();
        }
    }

    resetState = () => {
        this.currentIndex = 0;
        this.state = 'ready';
        this.playTween = null;
    }

    //暂停的思路为创建新的tween记录断点，下次play从断点继续，不考虑easing不同带来的影响
    pause = () => {
        if (this.state !== 'running') return;
        this.pauseTime = new Date().getTime();
        let duration = this.cameraTweens[this.currentIndex].duration + this.startTime - this.pauseTime;
        const nowTween = this.cameraTweens[this.currentIndex];  //当前tween

        if (this.playTween) {  //仍然在原来的PlayTween里面
            const oldPlayTween = this.playTween;
            this.createPlayTween(oldPlayTween, duration);
            oldPlayTween.stop();
        } else {
            this.createPlayTween(this.cameraTweens[this.currentIndex], duration);
            this.outOfPlayTween = false;
            nowTween.stop();
        }

        //连接后继tween
        if (this.currentIndex + 1 < this.len) {
            this.playTween.chain(this.cameraTweens[this.currentIndex + 1]);
        } else if (this.loop) {
            this.playTween.chain(this.cameraTweens[0]);
        }
    }

    createPlayTween = (Tween, duration) => {
        //记录断点信息
        const nowTween = Tween;
        let pos0 = null;
        if (nowTween.posType === 2) {                   //暂停的是经纬度
            pos0 = this.cameraControl.initSphericalData();
            while (pos0.lon > 180) pos0.lon -= 360;
            while (pos0.lon < -180) pos0.lon += 360;
            if (nowTween.fovChange) {
                pos0.fov = this.cameraControl.camera.fov;
            }
            if (nowTween.disChange) {
                pos0.distance = this.cameraControl.distance;
            }
        }
        else if (nowTween.posType === 1) {                                          //xyz
            pos0 = {
                x: this.cameraControl.camera.position.x, y: this.cameraControl.camera.position.y,
                z: this.cameraControl.camera.position.z
            };
            if (nowTween.fovChange) {
                pos0.fov = this.cameraControl.camera.fov;
            }
            if (nowTween.disChange) {
                pos0.distance = this.cameraControl.distance;
            }
        }

        //创建新tween
        this.playTween = new CameraTween({
            start: pos0, end: nowTween.pos1,
            duration: duration,
            easing: nowTween.easing
        },
            this.cameraControl.camera,
            this.distance,
            this.cameraControl
        );
        this.playTween.onCameraAnimationEnded = () => {
            nowTween.onCameraAnimationEnded();
            this.playTween = null;
        }
        this.playTween.onCameraAnimationStart = (key) => {
            this.state = 'running';
            this.onCameraAnimationStart &&
                this.onCameraAnimationStart(key);
        };

        this.playTween.onCameraAnimationStop = nowTween.onCameraAnimationStop;
    }

    play = () => {
        if (this.state === 'paused') {
            this.playTween && this.playTween.start();
            this.startTime = new Date().getTime() + this.startTime - this.pauseTime;
        }
    }

    next = () => {
        this.currentIndex++;
        if (this.currentIndex >= this.cameraTweens.length) {
            this.currentIndex = 0;
        }
        this.start(this.currentIndex)
    }

    prev = () => {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.cameraTweens.length - 1;
        }
        this.start(this.currentIndex)
    }

}

export { CameraTween, CameraTweenGroup };
