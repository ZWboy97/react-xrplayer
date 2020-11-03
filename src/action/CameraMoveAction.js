/**
 * 控制全景相机的入场和出场
 */
import TWEEN from '@tweenjs/tween.js';


class CameraMoveAction {

    constructor(start, end, duration = 5000, delay = 1000) {
        this.tween = null;
        this.onCompleteHandler = null;
        this.onStartHandler = null;
        this.onUpdateHandler = null;
        this.init(start, end, duration, delay);
    }

    init = (start, end, duration, delay) => {
        let coords = start;
        this.tween = new TWEEN.Tween(coords)
            .to({
                lat: end.lat,
                lon: end.lon,
                fov: end.fov,
                distance: end.distance
            }, duration)
            .delay(delay)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                let pos = {
                    lat: coords.lat,
                    lon: coords.lon,
                    fov: coords.fov,
                    distance: coords.distance
                }
                this.onUpdateHandler && this.onUpdateHandler(pos);
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
}

export default CameraMoveAction;