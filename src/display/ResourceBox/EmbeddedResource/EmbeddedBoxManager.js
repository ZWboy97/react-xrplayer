import * as THREE from 'three';

class EmbeddedBoxManager {
    constructor(XRPlayerManager) {
        this.XRManager = XRPlayerManager;

        this.embeddedBoxes = new Map();
        this.boxesNeedAddToScene = new Set();
    }

    //外部接口
    addEmbeddedBox = (embeddedBox) => {
        this.embeddedBoxes.set(embeddedBox.id, embeddedBox);
        embeddedBox.manager = this;
        this.boxesNeedAddToScene.add(embeddedBox);
    }

    removeEmbeddedBox = (embeddedBox) => {
        this.embeddedBoxes.delete(embeddedBox.id);

        this.XRManager.scene.remove(embeddedBox.planeMesh);
    }

    getEmbeddedBox = (id) => {
        return this.embeddedBoxes.get(id);
    }

    addEmbeddedBoxList = (embeddedBoxList) => {
        for (let embeddedBox in embeddedBoxList) {
            this.addEmbeddedBox(embeddedBox);
        }
    }

    clearAllEmbeddedBox = () => {
        this.embeddedBoxes.clear();
    }

    //内部控制
    updateDisplay = (embeddedBox) => {
        this.boxesNeedAddToScene.add(embeddedBox);
    }

    update = () => {
        let deletBox = [];
        this.boxesNeedAddToScene.forEach(embeddedBox => {
            if (embeddedBox.meshReady) {
                let mesh = this.XRManager.scene.children.find(box => box.name === embeddedBox.id);
                this.XRManager.scene.remove(mesh);
                this.XRManager.scene.add(embeddedBox.planeMesh);
                deletBox.push(embeddedBox);
            }
        });
        for (let box in deletBox) {
            this.boxesNeedAddToScene.delete(box);
        }
    }
}
export default EmbeddedBoxManager;