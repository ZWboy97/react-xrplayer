import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

class CameraTween {
    constructor(params, camera, distance, fovDownEdge, fovTopEdge, resetCameraPos, status) {
        this.pos0 = null;
        this.pos1 = null;
        this.duration = null;
        this.callback = null;
        this.easing = null;
        this.tween = null;
        this.camera = camera;
        this.distance = distance;
        this.posType = 0;                   // 0 采用经纬度， 1 采用xyz
        this.fovChange = false;             //是否涉及fov的改变
        this.fovDownEdge = fovDownEdge;
        this.fovTopEdge = fovTopEdge;
        this.status = status;
        this.reset = resetCameraPos;        //动画结束后视角停在结束的位置，不会回到之前的位置
        this.started = false;               //在start之后stop之前调用start会导致不会调用onStop，无法使用相机控制

        this.init(params);
    }

    init = (params) => {
        this.duration = params.duration;
        this.easing = params.easing;
        this.pos0 = {};
        this.pos1 = {};
        Object.assign(this.pos0, params.pos0);
        Object.assign(this.pos1, params.pos1);
        this.tween = new TWEEN.Tween(this.pos0).to(this.pos1, params.duration);
        this.tween.onStart(() => {this.status.num++;this.started = true;});
        var newCallBack = null;
        if (params.hasOwnProperty("callback")) {
            this.callback = params.callback;
            newCallBack = () => {
                params.callback();
                this.status.num--;
                this.reset();
                this.started = false;
            }
        }
        else {
            newCallBack = () => {
                this.status.num--;
                this.reset();
                this.started = false;
            }
        }
        this.tween.onComplete(newCallBack);         //只有完成动画才会触发传入的callback，中途停止不会
        this.tween.onStop(() => {
            this.status.num--;
            this.reset();
            this.started = false;
        });
        if (params.hasOwnProperty("easing")) {
            this.tween.easing(params.easing);
        }
        if (this.pos0.hasOwnProperty("x")) {
            this.posType = 1
        }
        if (this.pos0.hasOwnProperty("fov")) {
            this.fovChange = true;
        }
        var cameraTween = this;
        this.tween.onUpdate((pos) => {
            if (cameraTween.posType === 0) {
                var newPos = cameraTween.spherical2Cartesian(pos.lat, pos.lon);
                cameraTween.camera.position.x = newPos.x;
                cameraTween.camera.position.y = newPos.y;
                cameraTween.camera.position.z = newPos.z;
            }
            else {
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

    //经纬度到xyz的转换
    spherical2Cartesian = (lat, lon) => {
        var pos = {x: 0, y: 0, z: 0};
        lat = Math.max(this.fovDownEdge, Math.min(this.fovTopEdge, lat));
        var phi = THREE.Math.degToRad(90 - lat);
        var theta = THREE.Math.degToRad(lon);
        pos.x = this.distance * Math.sin(phi) * Math.cos(theta);
        pos.y = this.distance * Math.cos(phi);
        pos.z = this.distance * Math.sin(phi) * Math.sin(theta);
        return pos;
    }

    start = (time) => {
        if (this.started) {
            this.tween.stop();
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
    constructor(cameraTweens, loop, camera, distance, fovDownEdge, fovTopEdge, resetCameraPos, status) {
        this.cameraTweens = cameraTweens;
        this.len = cameraTweens.length;
        this.loop = loop;
        this.paused = false;
        this.startTime = 0;
        this.stopTime = 0;
        this.playTween = null;
        this.outOfPlayTween = true;

        this.params = {
            camera: camera, distance: distance, fovDownEdge: fovDownEdge, fovTopEdge: fovTopEdge, resetCameraPos: resetCameraPos, status: status
        };

        this.init();
    }

    init = () => {
        for (let i = 0; i < this.len - 1; i++) {
            this.cameraTweens[i].chain(this.cameraTweens[i + 1]);
        }
        if (this.loop) {
            this.cameraTweens[this.len - 1].chain(this.cameraTweens[0]);
        }
        else {
            var endTween = new TWEEN.Tween({}).to({},0).onStop(() => {this.stop();}).onComplete(() => {this.stop()});
            this.cameraTweens[this.len - 1].tween.chain(endTween);
        }
    }

    //获取当前时间对应的Tween序号和剩余时间
    getTweenNum = (time) => {
        let i = 0;
        while (time >= this.cameraTweens[i].duration) {
            time -= this.cameraTweens[i].duration;
            i++;
            i %= this.len;
        }
        return [i, time];
    }

    start = (time) => {
        this.cameraTweens[0].start();
        this.startTime = new Date().getTime();
    }

    stop = () => {
        this.outOfPlayTween = true;
        if (this.paused) {
            this.stopTime = this.startTime;
            this.paused = false;
        }
        else {
            let deltaTime = new Date().getTime() - this.startTime;
            var TweenNum = this.getTweenNum(deltaTime);
            this.cameraTweens[TweenNum[0]].stop();
            this.stopTime = this.startTime;
        }
    }

    createPlayTween = (Tween, TweenNum) => {
        //记录断点信息
        var nowTween = Tween;
        var pos0 = null;
        if (nowTween.posType === 0) {                   //暂停的是经纬度
            pos0 = this.params.resetCameraPos();
            if (nowTween.fovChange) {
                pos0.fov = this.params.camera.fov;
            }
        }
        else {                                          //xyz
            pos0 = {
                x: this.params.camera.position.x, y: this.params.camera.position.y,
                z: this.params.camera.position.z
            };
            if (nowTween.fovChange) {
                pos0.fov = this.params.camera.fov;
            }
        }

        //设置新的callback
        var newCallback = () => {
            nowTween.callback();
            this.outOfPlayTween = true;
        };

        //创建新tween
        this.playTween = new CameraTween({pos0: pos0, pos1: nowTween.pos1,
                duration: this.cameraTweens[TweenNum[0]].duration - TweenNum[1], easing: nowTween.easing, callback: newCallback},
            this.params.camera, this.params.distance, this.params.fovDownEdge, this.params.fovTopEdge, this.params.resetCameraPos, this.params.status
        );
    }

    pause = () => {                                     //暂停的思路为创建新的tween记录断点，下次play从断点继续，不考虑easing不同带来的影响
        if (this.paused) return;
        this.paused = true;
        this.stopTime = new Date().getTime();
        let deltaTime = this.stopTime - this.startTime;
        var TweenNum = this.getTweenNum(deltaTime);
        var nowTween = this.cameraTweens[TweenNum[0]];  //当前tween

        if (this.outOfPlayTween === false) {            //仍然在原来的PlayTween里面
            var oldPlayTween = this.playTween;
            this.createPlayTween(oldPlayTween, TweenNum);
            oldPlayTween.stop();
        }
        else {
            this.createPlayTween(this.cameraTweens[TweenNum[0]], TweenNum);
            this.outOfPlayTween = false;
            nowTween.stop();
        }

        //连接后继tween
        if (TweenNum[0] + 1 < this.len) {
            this.playTween.chain(this.cameraTweens[TweenNum[0] + 1]);
        }
        else if (this.loop) {
            this.playTween.chain(this.cameraTweens[0]);
        }
    }

    play = () => {
        if (this.paused === false) return;
        this.paused = false;
        let deltaTime = this.stopTime - this.startTime;
        this.startTime = new Date().getTime() - deltaTime;
        this.playTween.start();
    }

}

export {CameraTween, CameraTweenGroup};
