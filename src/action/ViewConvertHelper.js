/**
 * 实现小行星和普通视野等效果的切换
 */

import CameraMoveAction from './CameraMoveAction';

class ViewConvertHelper {

    constructor(camera, controls) {
        this.camera = camera;
        this.state = null;
        this.controls = controls;
        this.cameraMoveAction = null;
        this.onCompleteHandler = null;
        this.onStartHandler = null;
    }

    toNormalView = (durtime = 8000, delay = 0) => {
        if (this.state && this.state === 'normal') return;
        this.cameraMoveAction = new CameraMoveAction(this.camera,
            { x: 0, y: 0, z: 100, fov: 80 }, durtime, delay);
        this.cameraMoveAction.onStartHandler = () => {
            this.controls && this.controls.disConnect();
        }
        this.cameraMoveAction.onCompleteHandler = () => {
            this.controls && this.controls.connect();
            this.state = 'planet';
        }
        this.cameraMoveAction.start();
    }

    toPlanetView = (durtime = 8000, delay = 0) => {
        if (this.state && this.state === 'planet') return;
        this.cameraMoveAction = new CameraMoveAction(this.camera,
            { x: 0, y: 450, z: 0, fov: 150 }, durtime, delay);
        this.cameraMoveAction.onStartHandler = () => {
            this.controls && this.controls.disConnect();
        }
        this.cameraMoveAction.onCompleteHandler = () => {
            this.controls && this.controls.connect();
            this.state = 'planet';
        }
        this.cameraMoveAction.start();
    }

}

export default ViewConvertHelper;