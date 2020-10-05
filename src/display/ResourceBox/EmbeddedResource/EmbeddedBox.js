import * as THREE from "three";

class EmbeddedBox {
    constructor(id, type) {
        this.id = id;
        this.type = type;
        this.callback = null;
        this.lat = 0;
        this.lon = 0;
        this.draggable = false;
        this.visible = true;
        this.scale2DX = 1;
        this.scale2DY = 1;
        this.meshReady = false;
        this.showTypeChangable = false;

        this.showType = 'embed';
    }

    //外部接口
    setPosition = (lat, lon) => {
        this.lat = lat;
        this.lon = lon;

        if (this.planeMesh) {
            let pos = this.Sph2Cart(this.lat, this.lon);
            this.planeMesh.position.set(pos.x, pos.y, pos.z);
            this.planeMesh.lookAt(0, 0, 0);
        }
    }

    getPosition = () => {
        return {lat: this.lat, lon: this.lon};
    }

    setDraggable = (enable) => {
        if (this.draggable === enable)
            return;
        this.draggable = enable;
        if (this.meshReady === false) return;
        if (this.manager !== null) {
            if (enable) {
                this.manager.dragMeshes.add(this.planeMesh);
            }
            else {
                this.manager.dragMeshes.delete(this.planeMesh);
            }
        }
    }

    getDraggable = () => {
        return this.draggable;
    }

    setVisible = (visible) => {
        if (this.visible === visible) return;
        this.visible = visible;
        if (visible) {
            if (this.showType === '2d') {
                this.showTypeChangable && (this.canvas.style.display = 'block');
            }
            else if (this.meshReady && this.showType === 'embed') {
                this.planeMesh.visible = true;
            }
        }
        else {
            if (this.meshReady) this.planeMesh.visible = false;
            this.showTypeChangable && (this.canvas.style.display = 'none');
        }
    }

    getVisible = () => {
        return this.visible;
    }

    setShowType = (showType) => {
        if (this.showType === showType) return;
        if (!this.showTypeChangable) return;
        if (showType === '2d') {
            this.showType = showType;
            if (this.visible) {
                if (this.meshReady) this.planeMesh.material.opacity = 0;
                this.canvas.style.display = 'block';
            }
        }
        else if (showType === 'embed') {
            this.showType = showType;
            if (this.visible) {
                if (this.meshReady) this.planeMesh.material.opacity = 1;
                this.canvas.style.display = 'none';
            }
        }
    }

    getShowType = () => {
        return this.showType;
    }

    setScale = (x, y) => {
        this.scale2DX = x;
        this.scale2DY = y;
        this.canvas && (this.canvas.style.transform = "scale("+this.scale2DX+","+this.scale2DY+")");
    }

    onClick = (callback) => {
        this.callback = callback;
    }

    //内部控制函数
    initCanvas = () => {
        this.canvas.id = "canvas_of_box_" + this.id;
        this.canvas.display = "block";
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = "50px";
        this.canvas.style.top = "100px";
        this.canvas.style.transform = "scale("+this.scale2DX+","+this.scale2DY+")";
        // document.body.appendChild(this.canvas)
    }

    updateDisplay = () => {
        this.manager && this.manager.updateDisplay(this);
    }

    createPlane = () => {
        let planeMaterial = this.newPlaneMaterial();
        let planeGeometry = new THREE.PlaneGeometry(this.width, this.height);
        this.planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

        let pos = this.Sph2Cart(this.lat, this.lon);
        this.planeMesh.position.set(pos.x, pos.y, pos.z);
        this.planeMesh.lookAt(0, 0, 0);
        this.planeMesh.name = this.id;
        this.planeMesh.visible = true;
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
        planeMaterial.opacity = this.visible && this.showType === 'embed' ? 1 : 0;

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

    }
}
export default EmbeddedBox;