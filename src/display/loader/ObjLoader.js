import * as THREE from 'three';

class ObjLoader {

    constructor(scene) {
        this.scene = scene;
        this.obj = null;
        this.data = null;
    }

    loadObj = (data) => {
        this.data = data;
        var loader = new THREE.ObjectLoader();
        loader.load(data.objUrl,
            (obj) => {
                this.obj = obj;
                var texture = new THREE.TextureLoader().load(data.texture);
                obj.material = new THREE.MeshBasicMaterial({
                    map: texture,
                });
                this.scene.add(obj);
                obj.scale.set(data.scale, data.scale, data.scale);//网格模型缩放
                obj.geometry.center();//几何体居中
            },
            (data) => { console.log('loading json obj', data.loaded); },
            (e) => { console.log('err', e); }
        )
    }

    display = () => {
        this.scene.add(this.obj);
    }

    remove = () => {
        this.scene.remove(this.obj);
        this.mixer = null;
        this.animationAction = null;
    }

    update = () => {

    }
}

export default ObjLoader;