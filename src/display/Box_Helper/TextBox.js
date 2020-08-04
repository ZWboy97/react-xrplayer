import * as THREE from "three";

class TextBox {
    constructor(param) {
        this.message = "请输入文字";                                  //文字
        this.font = "Arial";                                        //字体
        this.fontSize = 36;                                         //字体大小
        this.fontColor = { r:255, g:255, b:255, a:1.0 };            //字体颜色（默认白色不透明）
        this.borderDistanceX = 15;                                  //左边距
        this.borderDistanceY = 15;                                  //上边距
        this.borderThickness = 5;                                   //边框粗细
        this.borderWidth = 190;                                     //边框宽
        this.borderHeight = 60;                                     //边框高
        this.borderColor = { r:100, g:100, b:100, a:0.5 };          //边框颜色（默认灰色半透明）
        this.backgroundColor = { r:100, g:100, b:100, a:0.5 };      //背景颜色（默认灰色半透明）
        this.scaleX = 0.8;                                          //文本框缩放比例X
        this.scaleY = 0.8;                                          //文本框缩放比例Y
        this.position = new THREE.Vector3(0,0,0);          //文本框位置
        this.cameraPosition = null;                                 //文本框初始朝向
        this.canvasWidth = 1024;                                    //画布宽度
        this.canvasHeight = 150;                                    //画布高度
        this.depthTest = false;                                     //是否会被其它物体（如模型，视频背景）遮挡
        this.canvas = null;                                         //通过画布创建three.js Sprite实现文字现实
        this.inputCanvas = null;                                    //用户输入的canvas
        this.inputVideo = null;                                     //用户输入的video的地址
        this.context = null;                                        //具体的内容对象
        this.planeMesh = null;                                      //也可以通过Plane呈现
        this.draggable = false;                                     //可拖拽改变位置
        this.videoElement = null;                                   //HTML Video元素

        this.init(param);
        this.createCanvas();
        this.fillMessage();
        this.createPlane();
    }

    init = (parameters) => {
        let needNewPlane = false;
        //文字信息设置
        if (parameters.hasOwnProperty("message")) {
            this.message = parameters.message;
            needNewPlane = true;
        }
        if (parameters.hasOwnProperty("font")) {
            this.font = parameters.font;
            needNewPlane = true;
        }
        if (parameters.hasOwnProperty("fontSize")) {
            this.fontSize = parameters.fontSize;
            needNewPlane = true;
        }
        if (parameters.hasOwnProperty("fontColor")) {
            this.fontColor = parameters.fontColor;
            needNewPlane = true;
        }
        // 边框设置
        if (parameters.hasOwnProperty("borderDistanceX")) {
            this.borderDistanceX = parameters.borderDistanceX;
            needNewPlane = true;
        }
        if (parameters.hasOwnProperty("borderDistanceY")) {
            this.borderDistanceY = parameters.borderDistanceY;
            needNewPlane = true;
        }
        if (parameters.hasOwnProperty("borderThickness")) {
            this.borderThickness = parameters.borderThickness;
            needNewPlane = true;
        }
        if (parameters.hasOwnProperty("borderWidth")) {
            this.borderWidth = parameters.borderWidth;
            needNewPlane = true;
        }
        if (parameters.hasOwnProperty("borderHeight")) {
            this.borderHeight = parameters.borderHeight;
            needNewPlane = true;
        }
        if (parameters.hasOwnProperty("borderColor")) {
            this.borderColor = parameters.borderColor;
            needNewPlane = true;
        }
        //画布设置
        if (parameters.hasOwnProperty("backgroundColor")) {
            this.backgroundColor = parameters.backgroundColor;
            needNewPlane = true;
        }
        if (parameters.hasOwnProperty("scaleX")) {
            this.scaleX = parameters.scaleX;
        }
        if (parameters.hasOwnProperty("scaleY")) {
            this.scaleY = parameters.scaleY;
        }
        if (parameters.hasOwnProperty("position")) {
            this.position = parameters.position;
        }
        if (parameters.hasOwnProperty("cameraPosition")) {
            this.cameraPosition = parameters.cameraPosition;
        }
        if (parameters.hasOwnProperty("inputCanvas")) {
            this.inputCanvas = parameters.inputCanvas;
            this.canvas = this.inputCanvas;
            needNewPlane = true;
        }
        if (parameters.hasOwnProperty("inputVideo")) {
            this.inputVideo = parameters.inputVideo;
            needNewPlane = true;
        }
        //其它设置
        if (parameters.hasOwnProperty("depthTest")) {
            this.depthTest = parameters.depthTest;
            needNewPlane = true;
        }
        if (parameters.hasOwnProperty("draggable")) {
            this.draggable = parameters.draggable;
        }
        return needNewPlane;
    }

    createCanvas = () => {
        if (this.inputCanvas === null && this.inputVideo === null) {
            this.canvas = document.createElement('canvas');
            this.context = this.canvas.getContext('2d');
            this.updateCanvas();
        }
    }

    updateCanvas = () => {
        if (this.inputCanvas !== null || this.inputVideo !== null) {
            return;
        }
        const r = 12;//圆角矩形的圆半径

        this.canvasWidth = this.borderWidth + r * 2 + this.borderThickness * 2;
        this.canvasHeight = this.borderHeight + r * 2 + this.borderThickness * 2;
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        var context = this.context;
        context.clearRect(0,0,this.canvas.width,this.canvas.height);
        // 背景颜色
        context.fillStyle   = "rgba(" + this.backgroundColor.r + "," + this.backgroundColor.g + ","
            + this.backgroundColor.b + "," + this.backgroundColor.a + ")";
        // 边框的颜色
        context.strokeStyle = "rgba(" + this.borderColor.r + "," + this.borderColor.g + ","
            + this.borderColor.b + "," + this.borderColor.a + ")";
        context.lineWidth = this.borderThickness;
        //先使用圆角矩形作为文本框，以后有需求可以设计更多文本框样式


        this.roundRect(0,0,this.borderWidth,this.borderHeight,r);
    }

    //在画布上画一个圆角矩形，x0,y0:起始坐标，x,y:除去半径的宽和高, r:半径
    roundRect = (x0, y0, x, y, r) => {
        var ctx = this.context;
        var lineW = ctx.lineWidth;
        ctx.beginPath();
        ctx.moveTo(x0+r+lineW/2, y0+lineW/2);
        ctx.lineTo(x0+x+r+lineW/2, y0+lineW/2);
        ctx.arc(x0+x+r+lineW/2, y0+lineW/2+r, r, -Math.PI/2, 0);
        ctx.lineTo(x0+x+2*r+lineW/2, y0+y+r+lineW/2);
        ctx.arc(x0+x+r+lineW/2, y0+y+r+lineW/2, r, 0, Math.PI/2);
        ctx.lineTo(x0+r+lineW/2, y0+y+2*r+lineW/2);
        ctx.arc(x0+r+lineW/2, y0+y+r+lineW/2, r, Math.PI/2, Math.PI);
        ctx.lineTo(x0+lineW/2, y0+r+lineW/2);
        ctx.arc(x0+r+lineW/2, y0+r+lineW/2, r, Math.PI, 1.5*Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    fillMessage = () => {
        if (this.inputCanvas !== null || this.inputVideo !== null) {
            return;
        }
        this.context.font = "Bold " + this.fontSize + "px " + this.font;
        this.context.fillStyle = "rgba(" + this.fontColor.r + "," + this.fontColor.g + ","
            + this.fontColor.b + "," + this.fontColor.a + ")";

        //根据边距自动换行
        let lineWidth = this.borderDistanceX * 2;
        let canvasWidth = this.canvas.width;    //计算canvas的宽度
        let deltaHeight = this.fontSize + 2 + this.borderDistanceY; //当前行距边框顶部的距离
        let lastSubStrIndex= 0; //每次开始截取的字符串的索引
        for(let i = 0; i < this.message.length; i++) {
            let dLength = this.context.measureText(this.message[i]).width;
            lineWidth += dLength;
            if (lineWidth > canvasWidth) {
                this.context.fillText(this.message.substring(lastSubStrIndex, i), this.borderDistanceX, deltaHeight);//绘制截取部分
                deltaHeight += this.fontSize + 2;//20为字体的高度
                lineWidth = this.borderDistanceX * 2 + dLength;
                lastSubStrIndex = i;
            }
            if (i === this.message.length - 1) {//绘制剩余部分
                this.context.fillText(this.message.substring(lastSubStrIndex, i + 1), this.borderDistanceX, deltaHeight);
            }
        }
    }

    createPlane = () => {
        let texture = null;
        if (this.inputVideo !== null) {
            this.videoElement = document.createElement("video");
            this.videoElement.src = this.inputVideo;
            this.videoElement.autoplay = 'autoplay';
            texture = new THREE.VideoTexture(this.videoElement);
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.format = THREE.RGBFormat;
        }
        else {
            texture = new THREE.Texture(this.canvas);
            texture.needsUpdate = true;
        }
        let planeMaterial = new THREE.MeshBasicMaterial({map: texture});
        planeMaterial.depthTest = this.depthTest;
        planeMaterial.needsUpdate = true;
        planeMaterial.map.needsUpdate = true;
        planeMaterial.transparent = true;
        planeMaterial.opacity = 1;
        let planeGeometry = new THREE.PlaneGeometry(this.borderWidth, this.borderHeight);
        let visible = this.planeMesh === null ? true : this.planeMesh.visible;
        this.planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        this.planeMesh.visible = visible;
        this.updatePlane();

    }

    updatePlane = () => {
        this.planeMesh.scale.set(this.scaleX, this.scaleY, 1);
        this.planeMesh.position.set(this.position.x, this.position.y, this.position.z);
        this.planeMesh.lookAt(this.cameraPosition.x, this.position.y, this.cameraPosition.z);
    }

    setMessage = (params) => {
        var needNewPlane = this.init(params);
        this.updateCanvas();
        this.fillMessage();
        if (needNewPlane) {
            this.createPlane();
        }
        else {
            this.updatePlane();
        }
    }

    addTo = (scene) => {
        scene.add(this.planeMesh);
    }

    removeFrom = (scene) => {
        scene.remove(this.planeMesh);
    }

    show = () => {
        if (this.planeMesh !== null) {
            this.planeMesh.visible = true;
        }
    }

    hide = () => {
        if (this.planeMesh !== null) {
            this.planeMesh.visible = false;
        }
    }

    kill = () => {
        if (this.videoElement !== null) {
            this.videoElement.setAttribute("src","");
        }
    }
}

export default TextBox;