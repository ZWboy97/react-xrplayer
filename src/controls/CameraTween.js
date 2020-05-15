import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

class CameraTween {
    constructor(params, camera, distance, fovDownEdge, fovTopEdge, resetCameraPos, status) {
        console.log("distance"+distance);
        this.pos0 = null;
        this.pos1 = null;
        this.tween = null;
        this.camera = camera;
        this.distance = distance;
        this.posType = 0;                   // 0 采用经纬度， 1 采用xyz
        this.fovChange = false;             //是否涉及fov的改变
        this.fovDownEdge = fovDownEdge;
        this.fovTopEdge = fovTopEdge;
        this.status = status;
        this.reset = resetCameraPos;        //动画结束后视角停在结束的位置，不会回到之前的位置

        this.init(params);
    }

    init = (params) => {
        this.pos0 = {};
        this.pos1 = {};
        Object.assign(this.pos0, params.pos0);
        Object.assign(this.pos1, params.pos1);
        this.tween = new TWEEN.Tween(this.pos0).to(this.pos1, params.duration);
        this.tween.onStart(() => {this.status.num++;});
        var newCallBack = null;
        if (params.hasOwnProperty("callback")) {
            newCallBack = () => {
                params.callback();
                this.status.num--;
                this.reset();
            }
        }
        else {
            newCallBack = () => {
                this.status.num--;
                this.reset();
            }
        }
        this.tween.onComplete(newCallBack).onStop(newCallBack);
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
        if (!!!time)
            this.tween.start();
        else
            this.tween.start(time);
    }

    stop = () => {
        this.tween.stop();
    }

    chain = (cameraTween) => {
        this.tween.chain(cameraTween.tween);
    }
}

export default CameraTween;