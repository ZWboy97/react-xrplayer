import EmbeddedBox from "./EmbeddedBox";
import * as THREE from "three";

class EmbeddedTextBox extends EmbeddedBox {
    constructor(id) {
        super(id, 'text');
        this.text = '请输入文字';
        this.textSize = 'medium';

        //以下皆为默认参数，目前未提供接口
        this.font = 'Arial';    //字体
        this.fontSize = 36;     //字体大小
        this.borderThickness = 5;   //边框厚度
        this.maxWidth = 100;     //一行中文字占用的最多像素，超过就换行
        this.borderDistanceX = 15;  //左边距
        this.borderDistanceY = 15;  //上边距
        this.fontColor = { r:255, g:255, b:255, a:1.0 };    //字体颜色（默认白色不透明）
        this.borderColor = { r:100, g:100, b:100, a:0.5 };  //边框颜色（默认灰色半透明）
        this.backgroundColor = { r:100, g:100, b:100, a:0.5 };  //背景颜色（默认灰色半透明）

        this.update();
    }

    //外部接口
    setText = (text) => {
        this.text = text;
        this.update();
    }

    setTextSize = (textSize) => {
        this.textSize = textSize;
        switch (textSize) {
            case 'large':
                this.fontSize = 60;
                break;
            case 'medium':
                this.fontSize = 36;
                break;
            case 'small':
                this.fontSize = 12;
                break;
            default:
                return;
        }
        this.update();
    }

    getTextInfo = () => {
        return this.text;
    }

    //内部控件
    update = () => {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.updateCanvas();

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.createPlane();

        this.updateDisplay();
    }

    updateCanvas = () => {
        const r = 12;//圆角矩形的圆半径
        this.adjustWidthAndHeight(r);//根据文本生成文本框和画布的宽度和高度
        this.roundRect(0,0, this.borderWidth, this.borderHeight, r);
        this.fillText();
    }

    adjustWidthAndHeight = (r) => {
        if (this.context.measureText(this.text).width < this.maxWidth + r * 2 + this.borderThickness * 2) {
            this.context.font = "Bold " + this.fontSize + "px " + this.font;
            this.borderWidth = this.context.measureText(this.text).width + this.borderDistanceX * 2 - this.fontSize / 2;
            this.borderHeight = this.fontSize * 0.9 + this.borderDistanceY * 2;
            this.canvas.width = this.borderWidth + r * 2 + this.borderThickness * 2;
            this.canvas.height = this.borderHeight + r * 2 + this.borderThickness * 2;
        }
        else {
            this.canvas.width = this.maxWidth + r * 2 + this.borderThickness * 2;
            this.context.font = "Bold " + this.fontSize + "px " + this.font;
            let lineWidth = this.borderDistanceX * 2;
            let canvasWidth = this.canvas.width;
            let deltaHeight = this.fontSize + 2 + this.borderDistanceY; //当前行距边框顶部的距离(2是行间距)
            for(let i = 0; i < this.text.length; i++) {
                let dLength = this.context.measureText(this.text[i]).width;
                lineWidth += dLength;
                if (lineWidth > canvasWidth) {
                    deltaHeight += this.fontSize + 2;
                    lineWidth = this.borderDistanceX * 2 + dLength;
                }
            }
            this.borderWidth = this.maxWidth;
            this.borderHeight = deltaHeight + this.borderDistanceY;
            this.canvasHeight = this.borderHeight + r * 2 + this.borderThickness * 2;
            this.canvas.height = this.canvasHeight;
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

    fillText = () => {
        this.context.font = "Bold " + this.fontSize + "px " + this.font;
        this.context.fillStyle = "rgba(" + this.fontColor.r + "," + this.fontColor.g + ","
            + this.fontColor.b + "," + this.fontColor.a + ")";
        //根据边距自动换行
        let lineWidth = this.borderDistanceX * 2;
        let canvasWidth = this.canvas.width;
        let deltaHeight = this.fontSize + 2 + this.borderDistanceY; //当前行距边框顶部的距离
        let lastSubStrIndex= 0; //每次开始截取的字符串的索引
        for(let i = 0; i < this.text.length; i++) {
            let dLength = this.context.measureText(this.text[i]).width;
            lineWidth += dLength;
            if (lineWidth > canvasWidth) {
                this.context.fillText(this.text.substring(lastSubStrIndex, i), this.borderDistanceX, deltaHeight);//绘制截取部分
                deltaHeight += this.fontSize + 2;
                lineWidth = this.borderDistanceX * 2 + dLength;
                lastSubStrIndex = i;
            }
            if (i === this.text.length - 1) {//绘制剩余部分
                this.context.fillText(this.text.substring(lastSubStrIndex, i + 1), this.borderDistanceX, deltaHeight);
            }
        }
    }
}

export default EmbeddedTextBox;