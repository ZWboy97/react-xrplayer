import EmbeddedBox from "./EmbeddedBox";

class EmbeddedImageBox extends EmbeddedBox{
    constructor(id) {
        super(id, 'image');
        this.url = '';
        this.width = 30;
        this.height = 30
        this.showTypeChangable = true;
        this.update();
    }

    setImage = (url, width = 30, height = 30) => {
        this.url = url;
        this.width = width;
        this.height = height;

        this.update();
    }

    setImageSize = (width, height) => {
        this.width = width;
        this.height = height;
        this.update();
    }

    getImageInfo = () => {
        return {url: this.url, width: this.width, height: this.height};
    }

    //内部控制
    update = () => {
        if (this.url === '') return;
        this.meshReady = false;
        let img = document.createElement("img");
        img.src = this.url;
        this.canvas = document.createElement('canvas');
        this.initCanvas();
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        let context = this.canvas.getContext('2d');
        let width = this.width;
        let height = this.height;
        let createPlane = this.createPlane;
        let tHis = this;
        img.onload = function () {
            context.drawImage(img, 0, 0, width, height);
            createPlane();
            tHis.manager && tHis.manager.updateDisplay(tHis);
        }
    }
}

export default EmbeddedImageBox;