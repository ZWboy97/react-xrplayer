import * as THREE from "three";

class EmbeddedBox {
    constructor(id, type) {
        this.id = id;
        this.type = type;
        this.eventId = null;
        this.lat = 0;
        this.lon = 0;

        //控制信息
        this.planeMesh = null;
        this.canvas = null;
        this.width = 0;
        this.height = 0;
        this.manager = null;
        this.meshReady = false;
    }

    //外部接口
    setPosition = (lat, lon) => {
        this.lat = lat;
        this.lon = lon;

        if (this.planeMesh) {
            console.log('set position')
            let pos = this.Sph2Cart(this.lat, this.lon);
            this.planeMesh.position.set(pos.x, pos.y, pos.z);
            this.planeMesh.lookAt(0, 0, 0);
        }
    }

    getPosition = () => {
        return {lat: this.lat, lon: this.lon};
    }

    setDragable = (enable) => {

    }

    getDragable = () => {
        return false;
    }

    onClick = (callback) => {
        this.callback = callback;
    }

    //内部控制函数
    updateDisplay = () => {
        this.manager && this.manager.updateDisplay(this);
    }

    createPlane = () => {
        let planeMaterial = this.newPlaneMaterial();
        let planeGeometry = new THREE.PlaneGeometry(this.width, this.height);
        let visible = this.planeMesh === null ? true : this.planeMesh.visible;
        this.planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        this.planeMesh.visible = visible;

        let pos = this.Sph2Cart(this.lat, this.lon);
        this.planeMesh.position.set(pos.x, pos.y, pos.z);
        this.planeMesh.lookAt(0, 0, 0);
        this.planeMesh.name = this.id;
        this.meshReady = true;
    }

    newPlaneMaterial = () => {
        let texture = new THREE.Texture(this.canvas);
        texture.needsUpdate = true;
        let planeMaterial = new THREE.MeshBasicMaterial({map: texture});
        planeMaterial.depthTest = false;
        planeMaterial.needsUpdate = true;
        planeMaterial.map.needsUpdate = true;
        planeMaterial.transparent = true;
        planeMaterial.opacity = 1;

        return planeMaterial;
    }

    Sph2Cart = (lat, lon) => {
        let phi = THREE.Math.degToRad(90 - lat);
        let theta = THREE.Math.degToRad(lon);
        return new THREE.Vector3(
            500 * Math.sin(phi) * Math.cos(theta),
            500 * Math.cos(phi),
            500 * Math.sin(phi) * Math.sin(theta)
        );
    };

    kill = () => {
        console.log('kill');
    }

}
export default EmbeddedBox;