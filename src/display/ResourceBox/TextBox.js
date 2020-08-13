import * as THREE from "three";

class TextBox {
    constructor(param, container, camera) {

        //2d的拖拽

        //通用设置
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
        this.widthAdaptation = false;                               //根据文本自适应设置borderWidth，borderHeight。若关闭，则根据设定borderWidth自动换行，自适应borderHeight
        this.draggable = false;                                     //可拖拽改变位置

        //3d设置
        this.depthTest = false;                                     //3D场景下是否会被其它物体（如模型，视频背景）遮挡

        //通用控件
        this.canvas = null;                                         //通过画布创建three.js Sprite实现文字现实
        this.context = null;                                        //具体的内容对象
        this.canvasWidth = 0;                                       //画布宽度
        this.canvasHeight = 0;                                      //画布高度
        this.showType = "2d";                                       //默认显示2d标签，另一种：this.showType = "embedded"
        this.hidden = false;

        //3d控件
        this.planeMesh = null;                                      //通过Plane呈现

        //2d控件
        this.container = container;
        this.camera = camera;

        this.init(param);
        this.createCanvas();
        this.createPlane();                                         //创建3d标签
        this.init2DCanvas();                                        //2d标签同样基于该canvas，做一些初始设定
    }

    init = (parameters) => {
        let needNewMaterial = false;
        let needNewGeometry = false;
        //文字信息设置
        if (parameters.hasOwnProperty("message")) {
            this.message = parameters.message;
            needNewMaterial = true;
        }
        if (parameters.hasOwnProperty("font")) {
            this.font = parameters.font;
            needNewMaterial = true;
        }
        if (parameters.hasOwnProperty("fontSize")) {
            this.fontSize = parameters.fontSize;
            needNewMaterial = true;
        }
        if (parameters.hasOwnProperty("fontColor")) {
            this.fontColor = parameters.fontColor;
            needNewMaterial = true;
        }
        // 边框设置
        if (parameters.hasOwnProperty("borderDistanceX")) {
            this.borderDistanceX = parameters.borderDistanceX;
            needNewMaterial = true;
        }
        if (parameters.hasOwnProperty("borderDistanceY")) {
            this.borderDistanceY = parameters.borderDistanceY;
            needNewMaterial = true;
        }
        if (parameters.hasOwnProperty("borderThickness")) {
            this.borderThickness = parameters.borderThickness;
            needNewMaterial = true;
        }
        if (parameters.hasOwnProperty("borderWidth")) {
            this.borderWidth = parameters.borderWidth;
            needNewMaterial = true;
            needNewGeometry = true;
        }
        if (parameters.hasOwnProperty("borderHeight")) {
            this.borderHeight = parameters.borderHeight;
            needNewMaterial = true;
            needNewGeometry = true;
        }
        if (parameters.hasOwnProperty("borderColor")) {
            this.borderColor = parameters.borderColor;
            needNewMaterial = true;
        }
        //画布设置
        if (parameters.hasOwnProperty("backgroundColor")) {
            this.backgroundColor = parameters.backgroundColor;
            needNewMaterial = true;
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
        else {
            this.position = this.planeMesh.position;
        }
        if (parameters.hasOwnProperty("cameraPosition")) {
            this.cameraPosition = parameters.cameraPosition;
        }
        //其它设置
        if (parameters.hasOwnProperty("depthTest")) {
            this.depthTest = parameters.depthTest;
            needNewMaterial = true;
        }
        if (parameters.hasOwnProperty("draggable")) {
            this.draggable = parameters.draggable;
        }
        if (parameters.hasOwnProperty("widthAdaptation")) {
            this.widthAdaptation = parameters.widthAdaptation;
            needNewMaterial = true;
            needNewGeometry = true;
        }

        return {needNewMaterial, needNewGeometry};
    }

    createCanvas = () => {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.updateCanvas();
    }

    updateCanvas = () => {
        const r = 12;//圆角矩形的圆半径
        this.adjustWidthAndHeight(r);
        this.roundRect(0,0,this.borderWidth,this.borderHeight,r);
        this.fillMessage();
    }

    adjustWidthAndHeight = (r) => {
        if (this.widthAdaptation) {
            this.context.font = "Bold " + this.fontSize + "px " + this.font;
            this.borderWidth = this.context.measureText(this.message).width + this.borderDistanceX * 2 - this.fontSize / 2;
            this.borderHeight = this.fontSize * 0.9 + this.borderDistanceY * 2;
            this.canvasWidth = this.borderWidth + r * 2 + this.borderThickness * 2;
            this.canvasHeight = this.borderHeight + r * 2 + this.borderThickness * 2;
            this.canvas.width = this.canvasWidth;
            this.canvas.height = this.canvasHeight;
        }
        else {
            this.canvasWidth = this.borderWidth + r * 2 + this.borderThickness * 2;
            this.canvas.width = this.canvasWidth;
            this.context.font = "Bold " + this.fontSize + "px " + this.font;
            let lineWidth = this.borderDistanceX * 2;
            let canvasWidth = this.canvasWidth;
            let deltaHeight = this.fontSize + 2 + this.borderDistanceY; //当前行距边框顶部的距离(2是行间距)
            for(let i = 0; i < this.message.length; i++) {
                let dLength = this.context.measureText(this.message[i]).width;
                lineWidth += dLength;
                if (lineWidth > canvasWidth) {
                    deltaHeight += this.fontSize + 2;
                    lineWidth = this.borderDistanceX * 2 + dLength;
                }
            }
            this.borderHeight = deltaHeight + this.borderDistanceY;
            this.canvasHeight = this.borderHeight + r * 2 + this.borderThickness * 2;
            this.canvas.height = this.canvasHeight;
        }
    }

    fillMessage = () => {
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
                deltaHeight += this.fontSize + 2;
                lineWidth = this.borderDistanceX * 2 + dLength;
                lastSubStrIndex = i;
            }
            if (i === this.message.length - 1) {//绘制剩余部分
                this.context.fillText(this.message.substring(lastSubStrIndex, i + 1), this.borderDistanceX, deltaHeight);
            }
        }
    }

    //在画布上画一个圆角矩形，x0,y0:起始坐标，x,y:除去半径的宽和高, r:半径
    roundRect = (x0, y0, x, y, r) => {
        let ctx = this.context;
        ctx.fillStyle   = "rgba(" + this.backgroundColor.r + "," + this.backgroundColor.g + ","
            + this.backgroundColor.b + "," + this.backgroundColor.a + ")";
        // 边框的颜色
        ctx.strokeStyle = "rgba(" + this.borderColor.r + "," + this.borderColor.g + ","
            + this.borderColor.b + "," + this.borderColor.a + ")";
        ctx.lineWidth = this.borderThickness;
        let lineW = ctx.lineWidth;
        //先使用圆角矩形作为文本框，以后有需求可以设计更多文本框样式
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

    createPlane = () => {
        let planeMaterial = this.newPlaneMaterial();
        let planeGeometry = new THREE.PlaneGeometry(this.borderWidth, this.borderHeight);
        let visible = this.planeMesh === null ? false : this.planeMesh.visible;
        this.planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        this.planeMesh.visible = visible;
        this.updatePlane();
    }

    newPlaneMaterial = () => {
        let texture = new THREE.Texture(this.canvas);
        texture.needsUpdate = true;
        let planeMaterial = new THREE.MeshBasicMaterial({map: texture});
        planeMaterial.depthTest = this.depthTest;
        planeMaterial.needsUpdate = true;
        planeMaterial.map.needsUpdate = true;
        planeMaterial.transparent = true;
        planeMaterial.opacity = 1;

        return planeMaterial;
    }

    updatePlane = () => {
        this.planeMesh.scale.set(this.scaleX, this.scaleY, 1);
        this.planeMesh.position.set(this.position.x, this.position.y, this.position.z);
        this.planeMesh.lookAt(this.cameraPosition.x, this.position.y, this.cameraPosition.z);
    }

    setMessage = (params) => {
        let {needNewMaterial, needNewGeometry} = this.init(params);
        this.updateCanvas();
        if (needNewMaterial) {
            this.planeMesh.material = this.newPlaneMaterial();
        }
        if (needNewGeometry) {
            this.planeMesh.geometry = new THREE.PlaneGeometry(this.borderWidth, this.borderHeight);
        }
        this.updatePlane();
    }

    init2DCanvas = () => {
        this.canvas.display = "block";
        this.canvas.style.position = 'absolute';
        this.container.appendChild(this.canvas);

        this.update2DCanvas();
    }

    update2DCanvas = () => {
        this.canvas.style.transform = "scale("+this.scaleX+","+this.scaleY+")";
    }

    update2DPosition = () => {
        let tip = this.canvas;
        if (tip) {
            let wpPosition = new THREE.Vector3();
            let pos = this.planeMesh.getWorldPosition(wpPosition).applyMatrix4(this.camera.matrixWorldInverse).applyMatrix4(this.camera.projectionMatrix);
            if ((pos.x >= -1 && pos.x <= (1 - this.canvas.width/this.container.clientWidth)) && (pos.y >= -(1 - this.canvas.height/this.container.clientHeight) && pos.y <= 1) && (pos.z >= -1 && pos.z <= 1)) {
                if (this.hidden === false && this.showType === '2d')
                    tip.style.display = "block";
                let screenPos = this.objectPosToScreenPos(this.planeMesh, this.container, this.camera);
                tip.style.left = screenPos.x - tip.clientWidth / 2 + "px";
                tip.style.top = screenPos.y - tip.clientHeight + 0.5 * this.canvas.height + "px";
            }
            else {
                tip.style.display = "none";
            }
        }

    }

    objectPosToScreenPos = (object, container, camera) => {
        var vector = new THREE.Vector3();
        vector.setFromMatrixPosition(object.matrixWorld).project(camera);
        var x2hat = vector.x,
            y2hat = vector.y;
        var W = container.clientWidth;
        var H = container.clientHeight;
        var pos = new THREE.Vector2();
        pos.x = (W / 2) * (x2hat + 1);
        pos.y = (H / 2) * (1 - y2hat);
        return pos;
    }

    addTo = (scene) => {
        scene.add(this.planeMesh);
    }

    removeFrom = (scene) => {
        scene.remove(this.planeMesh);
    }

    show = () => {
        if (this.planeMesh === null) return;
        this.hidden = false;
        if (this.showType === "embedded") {
            this.planeMesh.visible = true;
            this.canvas.style.display = "none";
        }
        else if (this.showType === "2d") {
            this.planeMesh.visible = false;
            this.canvas.style.display = "block";
        }
    }

    hide = () => {
        if (this.planeMesh !== null) {
            this.hidden = true;
            this.planeMesh.visible = false;
            this.canvas.style.display = "none";
            console.log("hide");
        }
    }

    setType = (type) => {
        if (type === "embedded") {
            this.showType = type;
            if (this.hidden === false) {
                this.planeMesh.visible = true;
                this.canvas.style.display = "none";
                console.log("set embedded");
            }
        }
        else if (type === "2d") {
            this.showType = type;
            if (this.hidden === false) {
                this.planeMesh.visible = false;
                this.canvas.style.display = "block";
                console.log("set 2d");
            }
        }
    }

    kill = () => {
        this.container.removeChild(this.canvas);
    }
}

export default TextBox;