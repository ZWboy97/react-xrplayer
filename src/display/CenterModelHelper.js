/**
 * 支持向全景场景中心加入可以360°观看的3D模型
 */
import FBXLoader from './loader/FBXLoader';
import ObjLoader from './loader/ObjLoader';

class CenterModelHelper {

    constructor(scene) {
        this.scene = scene;
        this.modelLoaderMap = new Map();
    }

    loadModel = (model_key, model) => {
        const loader = this.getLoader(model);
        this.modelLoaderMap.set(model_key, loader);
        loader.loadObj(model);
    }

    loadModelList = (model_list) => {
        model_list && model_list.forEach(data => {
            this.loadModel(data[0], data[1])
        })
    }

    removeModel = (model_key) => {
        const modelLoader = this.modelLoaderMap.get(model_key);
        modelLoader.remove();
        this.modelLoaderMap.delete(model_key);
    }

    removeAllModel = () => {
        const loaderArray = Array.from(this.modelLoaderMap.values());
        loaderArray.forEach(loader => {
            loader.remove();
        });
        this.modelLoaderMap.clear();
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
        this.modelLoaderMap.forEach(data => {
            const loader = data;
            loader.update();
        })
    }
}

export default CenterModelHelper;