/**
 * 支持向全景场景中心加入可以360°观看的3D模型
 */
import FBXLoader from './loader/FBXLoader';
import ObjLoader from './loader/ObjLoader';

class CenterModelHelper {

    constructor(scene) {
        this.scene = scene;
        this.modelMap = new Map();
    }

    loadModelList = (model_list) => {
        model_list && model_list.forEach(data => {
            const loader = this.getLoader(data[1]);
            this.modelMap.set(data[0], loader);
            loader.loadObj(data[1]);
        })
    }

    loadObj = (data) => {
        this.data = data;
        this.loader = this.getLoader(data);
        this.loader.loadObj(data);
    }

    display = () => {
        if (!this.loader) return;
        this.loader.display();
    }

    remove = () => {
        if (!this.loader) return;
        this.loader.remove();
    }

    startAnimation = () => {
        if (!this.loader) return;
        if (this.data.modeFormat === 'fbx') {
            this.loader.startAnimation();
        }
    }

    stopAnimation = () => {
        if (!this.loader) return;
        if (this.data.modeFormat === 'fbx') {
            this.loader.stopAnimation();
        }
    }

    getLoader = (data) => {
        switch (data.modeFormat) {
            case 'fbx':
                return new FBXLoader(this.scene);
            case 'obj':
                return new ObjLoader(this.scene);
            default: return null;
        }
    }

    update = () => {
        this.modelMap.forEach(data => {
            const loader = data;
            loader.update();
        })
    }
}

export default CenterModelHelper;