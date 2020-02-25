import * as THREE from 'three';
import FBXLoader from 'three-fbxloader-offical';


class MyFBXLoader {

    constructor(scene) {
        this.scene = scene;
        this.mixer = null;  //混合器
        this.obj = null;
        this.animationAction = null;
        this.clock = new THREE.Clock();
    }

    loadObj = (data) => {
        var loader = new FBXLoader(); //创建一个FBX加载器
        loader.load(data.objUrl,
            (obj) => {
                this.obj = obj;
                this.display();
                console.log('load fbxobj success:', this.obj);
                this.obj.translateY(-80);
                this.startAnimation();
            },
            (data) => {
                console.log('load fbx obj', data.loaded);
            },
            (e) => {
                console.log('load fbxobj error:', e);
            });
    }

    display = () => {
        this.scene.add(this.obj);
        var ambient = new THREE.AmbientLight(0xffffff);
        this.scene.add(ambient);
    }

    remove = () => {
        this.scene.remove(this.obj);
        this.mixer = null;
        this.animationAction = null;
    }

    startAnimation = () => {
        this.mixer = new THREE.AnimationMixer(this.obj);
        this.animationAction = this.mixer.clipAction(this.obj.animations[0]);
        this.animationAction.play();
    }

    stopAnimation = () => {
        this.animationAction && this.animationAction.stop();
    }

    update = () => {
        if (this.mixer) {
            const delta = this.clock.getDelta()  //方法获得两帧的时间间隔
            this.mixer.update(delta);
        }
    }

}

export default MyFBXLoader;