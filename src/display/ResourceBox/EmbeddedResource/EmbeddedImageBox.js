import EmbeddedBox from "./EmbeddedBox";

class EmbeddedImageBox extends EmbeddedBox{
    constructor(id) {
        super(id, 'image');
        this.url = '';
        this.width = 30;
        this.height = 30

        this.update();
    }

    setImage = (url, width, height) => {
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
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        let context = this.canvas.getContext('2d');
        let width = this.width;
        let height = this.height;
        let createPlane = this.createPlane;
        img.onload = function () {
            context.drawImage(img, 0, 0, width, height);
            createPlane();
            this.manager && this.manager.updateDisplay(this);
        }
    }
}

export default EmbeddedImageBox;