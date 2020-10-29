/**
 * 控制全景相机的入场和出场
 */
import TWEEN from '@tweenjs/tween.js';


class CameraMoveAction {

    constructor(camera, endState, duration = 5000, delay = 1000) {
        this.camera = camera;
        this.tween = null;
        this.onCompleteHandler = null;
        this.onStartHandler = null;
        this.init(endState, duration, delay);
    }

    // TODO 升级采用lat，lon的方式来控制相机动画
    init = (endState, duration = 5000, delay = 1000) => {
        const coords = { // Start 
            x: this.camera.position.x,
            y: this.camera.position.y,
            z: this.camera.position.z,
            fov: this.camera.fov
        };
        this.tween = new TWEEN.Tween(coords)
            .to({
                x: endState.x,
                y: endState.y,
                z: endState.z,
                fov: endState.fov
            }, duration)
            .delay(delay)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                this.camera.position.x = coords.x;
                this.camera.position.y = coords.y;
                this.camera.position.z = coords.z;
                this.camera.fov = coords.fov;
                this.camera.updateProjectionMatrix();
            })
            .onStart(() => {
                this.onStartHandler && this.onStartHandler();
            })
            .onComplete(() => {
                this.onCompleteHandler && this.onCompleteHandler();
            });
    }

    start = () => {
        if (this.tween) {
            this.tween.start();
        }
    }

    update = () => {
        TWEEN.update();
    }
}

export default CameraMoveAction;