# React-XRplayer 设计

## 零、集成与启动模块

### 1. 集成react-xrplayer到项目中
react-xrplayer播放器通过React组件的方式集成到您的项目中，只需要几行代码，您的应用便能拥有强大的全景互动能力。
实现简单的全景播放
```js
import React from 'react';
import XRPlayer from 'react-xrplayer'
class App extends React.Component {
    render() {
        return (
            <div>
                <XRPlayer
                    width="100vw"
                    height="100vh"
                    scene_texture_resource={{
                        type: 'hls',
                        res_url: 'http://cache.utovr.com/s1e3tzoku70yk8mpa3/L3_5dxsrk4kh56gc4l1_v2.m3u8'
                    }}
                ></XRPlayer>
            </div>
        )
    }
}
export default App;
```
### 2. react-xrplayer组件提供的属性
为了通过传统组件Props的方式来使用react-xrplayer，针对部分属性提供了props的设置方式
通过组件Props属性的方式，适合初始化或者不需要动态变更的场景
以下是提供的props属性（注意：只能用于初始化等场景，不支持动态更改）
```
  width: '100%',                // 设置播放器高度，支持css常用的写法，直接作用于底层canvas
  height: '100%',               // 同上
  camera_fov: 80,               // 设置全景相机的初始fov大小
  axes_helper_display: false,   // 是否展示坐标坐标系
  hot_spot_list: [],            // 按照指定的数据格式，提供热点标签数据
  event_list: [],               // 按照指定的数据格式，提供事件列表
  model_list: [],               // 按照指定的数据格式，提供模型列表
  embeded_box_list: [],         // 按照指定的数据格式，提供嵌入内容列表
  is_full_screen: false,        // 设置是否全屏
```

### 3. react-xrplayer组件提供的回调方法
通过Props，只能实现向播放器设置属性，无法获取来自播放器的信息
因此，还提供了几个方法回调

#### onFullScreenChange 回调方法
- 当浏览器的全屏状态发生变化的时候，通过该回调方法通过外部
- 回调会携带参数 isFull, 表示当前播放器的全屏状态
- 回调的使用示例
```js
    onFullScreenChange={(isFull) => { this.setState({ isFullScreen: isFull }) }}
```

#### onCreated 回调方法
- 通过props属性只能实现一些简单的配置，对于动态变化的需求，还是基于方法调用的方式比较简单
- onCreated回调方法将在播放器初始化之后回调，此时核心组件均已完成初始化
- 回调会携带参数 xrManager, 其是播放器与外部组件之间的代理对象，提供了诸多方法和属性供外部组件使用和调用。
- 回调的使用示例
```js
    onCreated={(xrManager)=>{
        // 获得播放器管理器的代理对象
        this.xrManager = xrManager;
        // 如果需要在多个组件中使用到xrManager，可以直接将其加入到全局变量中
        window.xrManager = xrManager;
        // 通过代理对象，动态控制播放器的行为
        this.xrManager.setHotSpots(this.hot_spot_list, this.event_list);
        this.xrManager.toNormalView(5000, 1000);
    }}
```
- xrManager 集成了几乎react-xrplayer的所有能力，下文会详细介绍其提供的接口方法

#### onEventHandler 回调方法
- react-xrplayer有多种事件，比如标签点击事件、视频结束事件等
- react-xrplayer内部对这些事件均提供了默认的处理方式。但实际应用中常常会有动态定制事件处理的场景，因此，通过onEventHandler回调方法，为外层提供灵活的定制能力。
- 回调会在内部默认处理方式调用之前被调用，因此可以实现对默认事件的拦截
- 回调会携带两个参数，name, props。 name表示事件的名称，props表示用于事件处理的参数
- 回调的返回值：true和false，为true表示事件被外部处理完成，不需要内部处理了，实现了拦截。false表示事件仍然需要内部处理
- 回调的使用示例
```js
    onEventHandler={ (name, props) => {
        switch (name) {
            case 'sence_res_ready':
                const { resUrl } = props;
                if (resUrl !== this.currentSenceResUrl) {
                    this.currentSenceResUrl = resUrl;
                    this.setState({ is_loading: false });
                    this.onReadyToPlay();
                }
                break;
            default: break;
        }
        return false;
    }}
```

### 4. XRManager主模块
react-xrplayer的主要能力大部分均是通过XRManager主模块对外层应用提供的，其提供了面向热点标签管理、内嵌内容管理等等接口方法。本部分主要介绍那些面向整个播放器的接口方法，对于各个模块中的方式，将在下文再详细展开。

#### import(sence_data)
- sence_data 为整个全景场景的配置对象，该配置对象的各个字段记录了全景场景各个模块的配置和属性信息
- import方法将读取配置对象信息，并解析其中各个模块的配置，从而构建出sence_data对象所描述的全景场景
- 可以直接将之前编辑好的json配置信息解析，然后重建整个全景场景
- 基于import和export方法，能够实现全景编辑器的功能

#### export():Object
- 是import方法的逆过程，实现将当前的全景播放器状态导出到一个配置对象中

## 一、全景模块

### setSenceResource(res)
- 全景背景的资源地址
- 参数res的参考字段
- 支持动态更改res，从而实现全景切换和漫游
```
{
    type:'hls', // 支持[hls,mp4,flv,image]
    res_url: "http://cache.utovr.com/b8.m3u8",
    panoramic_type: "360", // 全景类型['360','180']
    radius: 500  // 全景的半径
}
```

### get/setGlobalMuted(muted)
- 设置全局静音接口

### start/stopDisplaySenceResource
- 背景全景视频播放与暂停

### get/setEnableAutoRotate(enable)
- 设置自动旋转开关

### setAutoRotateSpeed(speed)
- 设置自动旋转速度, 正整数

### setAutoRotateDirection(direction)
- 设置自动旋转方向, -1,1



## 二、标签模块

### 1. 标签种类和UI组成

普通标签(label)UI由以qu下几个部分组成

- icon，一般是一些可点击的button
- title，说明性的文本描述，位于标签上方

图片标签(image)UI由以下几部分组成

- image,展示图片(支持gif动图？？？)
- title,在图片上方展示文本

留言标签(avatar)UI由以下几部分组成

- avatar,头像部分
- message,消息部分，消息在头像的水平右边

### 2. 标签数据结构 Label

```
Label
{
    id:'l_xxxxx',
    type: 'label',// 标签类型【label, avatar,image,... 】
    lat: -90, lon: -10, // 标签位置
    text: 'lable', // 文字内容
    text_float:'left', // 文字位置[left,right,top,
    text_size: 'big', // 文字大小[large, medium, small]
    bottom]
    img_url: '', //图片url
    img_width: 30, // 图片宽度
    img_height: 30, // 图片高度
    animate: true,  // icon是否跳动
    event_id: 'e_xxx' // 响应事件id
}
```

### 3. 标签相关接口

#### 标签管理器

##### getLabelManager()

- 标签相关的接口统一通过`LabelManager`实例对外提供服务
- 通过`XRPlayerManager.getLabelManager()`
- 返回`LabelManager`实例

#### 标签管理器-标签容器

以下接口均由`LabelManager`提供,用于向标签容器中添加和删除标签。

##### addLabel(label)
- 添加一个热点标签到场景中
- label为该标签对应的结构

##### removeLabel(id)
- 基于id，移除这个标签

##### getLabel(id) 
- 基于id查询一个label实例
- 返回查询到的label实例
- 通过返回的实例可以修改标签的属性
    - 修改文本，图片，大小
    - 获取位置

##### addLabelList(labelList)
- 一次性添加多个label列表
- labelList参数为label数组

##### clearAllLabels()
- 清空所有的标签

##### 回调方法 onLabelClicked(label)
- 当标签被点击的时候回调该方法
- 用于响应标签被点击，以及编辑时候被选中
- 在内部事件响应(比如展示弹窗视频)之前调用该回调
- 返回true，表明拦截该事件响应，内部事件响应不会继续
- 返回false，为拦截，继续执行内部事件响应

#### 标签实例
- 对应实际的标签实例，通过对应的标签实例，能够动态修改标签的内容和属性。
- 一下方法均由Label(暂定)提供，用于动态修改标签属性

##### setPosition(int lat, int lon)
- 设置标签在全景场景中的位置

##### getPosition()
- 获取标签在全景场景中的位置
- 注意：不是屏幕2d坐标
- lat，lon

##### setDragable(enable)
- 更改标签是否可拖动

##### getDragable()
- 返回是否允许拖动标签
- true,false

##### setText(text)
- 设置text内容

##### setTextSize(size)
- 设置文本字体大小

##### setTextFloat(float)
- 设置字体位置`[top, bottom, left, right]`

##### getTextInfo()
- 返回与嵌入文本相关的所有信息
- 信息内容 `{text, text_size, text_float }`
##### setImage(url)
- 设置图片url
- width，height为默认

##### setImage(url, width, height)
- 设置图片url

##### setImageSize(width,height)
- 更改图片大小

##### setAnamateEnable(enable)
- 图片，图片是否展示闪动动画

##### getImageInfo()
- 返回图片相关信息
- `img_url, img_width, img_height, anamite`

##### 回调方法 onClick(Label)
- 该标签被点击之后的回调


## 三、内嵌内容模块

#### 内嵌支持的内容
内嵌文本

- 以3D的方式将文本框内容嵌入到全景场景中
- TextBox

内嵌图片

- 以3D的方式将图片框嵌入到全景场景中
- ImageBox

内嵌视频

- 以3D的方式将视频嵌入到全景场景中
- VideoBox

内嵌模型

- 以3D方式将模型嵌入到全景场景中
- ModelBox

#### 数据结构
```js
EmbeddedBox
{
    // 公共字段
    id:'e_xxxxx',
    type: 'text',// 类型【text,image, video,model】
    lat: -90, lon: -10, // 标签位置
    event_id: 'e_xxx' // 响应事件id

    // TextBox字段
    text: 'lable', // 文字内容
    text_size: 'big', // 文字大小[large, medium, small]

    // ImageBox字段
    url: '', //url
    width: 30, // 宽度
    height: 30, // 高度

    // VideoBox字段
    url: '', //url
    width: 30, // 宽度
    height: 30, // 高度
    autoplay: false,
    poster: 'url',

    // ModelBox 字段
    model_type: 'fbx',
    model_res:{
        url...
    },  // 对应模型所需要的资源字段
    scale:2, // 模型大小缩放
}
```

#### 嵌入内容管理器

##### getEmbedBoxManager()

- 标签相关的接口统一通过`EmbedBoxManager`实例对外提供服务
- 通过`XRPlayerManager.getEmbedBoxManager()`
- 返回`getEmbedBoxManager`实例

#### 嵌入内容管理器-嵌入内容容器

以下接口均由`EmbedBoxManager`提供,用于向嵌入内容容器中添加和删除标签。

##### addEmbedBox(EmbedBox)
- 添加一个内嵌内容

##### removeEmbedBox(id)
- 
##### getEmbedBox(id) 
- 

##### addEmbedBoxList(EmbedBoxList)
- 
##### clearAllEmbedBoxs()
- 
##### 回调方法 onEmbedBoxClicked(EmbedBox)
- 

#### 嵌入内容共用接口

##### setPosition(int lat, int lon)
- 设置嵌入内容在全景场景中的位置

##### getPosition()
- 获取嵌入在全景场景中的位置
- lat，lon

##### setDragable(enable)
- 更改是否可拖动

##### getDragable()
- 返回是否允许拖动嵌入内容
- true,false

##### 回调接口 onClick(EmbedBox)
- 该嵌入内容被点击后的回调

#### 嵌入内容TextBox

##### setText(text)
- 

##### setTextSize(size)
- 

##### getTextInfo()
- 

#### 嵌入内容ImageBox

##### setImage(url, width, height)
- 设置图片url

##### setImageSize(width,height)
- 更改图片大小

##### getImageInfo()
- 返回图片相关信息
- `url, width,height`

#### 嵌入内容VideoBox
##### setVideo(url, width,height)
- 

##### setVideoSize(width, height)
- 

##### setEnableDisplay(enable)
- 是否允许自动播放

## 四、事件响应模块


## 三、内嵌内容模块
#### 概述
该模块提供四种类型的内嵌资源（文本、图片、视频、模型），用户可在自己的代码中设计好这些资源后通过内嵌资源管理器（EmbeddedBoxManager）添加到XR场景中。

### 1. 内嵌资源
#### 支持内嵌的内容
内嵌文本

- 以3D的方式将文本框内容嵌入到全景场景中
- EmbeddedTextBox

内嵌图片

- 以3D的方式将图片框嵌入到全景场景中
- EmbeddedImageBox

内嵌视频

- 以3D的方式将视频嵌入到全景场景中
- EmbeddedVideoBox

内嵌模型

- 以3D方式将模型嵌入到全景场景中
- EmbeddedModelBox
- 未实现

#### 数据结构
##### 基类
```js
EmbeddedBox
{
    // 信息字段
    id:'e_xxxxx',
    type: 'text',// 类型【text,image, video,model】
    callback: function,// 点击回调函数
    lat: -90, lon: -10, // 标签位置
    dragable: false,//可否拖拽
    visible: true;// 是否可见

    // 控制字段
    planeMesh: null,// three.js中的mesh，代表资源实体
    canvas: null,// canvas画布，用于生成材质
    width: 0, height: 0,// 具体大小参数
    manager: null,// 与之关联的内嵌资源管理器
    meshReady: false,// 标记mesh实体是否已经准备好添加到场景中
}
```
##### 内嵌文本
```js
EmbeddedTextBox
{
    // 目前已提供接口的参数
    text: "请输入文字",// 文本框中的文字
    textSize: "medium",// 字体大小【large, medium, small】
    // 未提供接口，但可修改的参数，以下为默认值
    this.font = 'Arial';    //字体
    this.fontSize = 36;     //字体大小
    this.borderThickness = 5;   //边框厚度
    this.maxWidth = 100;     //一行中文字占用的最多像素，超过就换行
    this.borderDistanceX = 15;  //左边距
    this.borderDistanceY = 15;  //上边距
    this.fontColor = { r:255, g:255, b:255, a:1.0 };    //字体颜色（默认白色不透明）
    this.borderColor = { r:100, g:100, b:100, a:0.5 };  //边框颜色（默认灰色半透明）
    this.backgroundColor = { r:100, g:100, b:100, a:0.5 };  //背景颜色（默认灰色半透明）
}
```
##### 内嵌图片
```js
EmbeddedImageBox
{
    url = '',// 图片位置
}
```
##### 内嵌视频
```js
EmbeddedVideoBox
{
    url = '',// 视频位置
    autoplay = false;// 是否自动播放
}
```
#### 接口
##### ----共用接口----
##### setPosition(lat, lon)
- 设置当前内嵌资源位置
- 参数为经纬度，角度制

##### getPosition()
- 获取当前内嵌资源经纬度
- `{lat: this.lat, lon: this.lon}`

##### setDraggable(enable)
- 设置当前资源可否被鼠标拖动
- enable取值：[true, false]

##### getDraggable()
- 获取当前资源可否被鼠标拖动

##### setVisible(visible)
- 设置当前资源是否可见

##### getVisible()
- 获取当前资源可见性

##### onClick(callback)
- 设置当前资源被点击后的回调函数

##### ----EmbeddedTextBox特有接口----
##### setText(String)
- 设置文本资源的文字内容

##### setTextSize(textSize)
- 设置文本资源字体大小
- 可选参数：["small", "medium", "large"]

##### getTextInfo()
- 返回当前资源文本内容


##### ----EmbeddedImageBox特有接口----
##### setImage(url, width = 30, height = 30)
- 设置图片资源地址，大小
- 宽高默认为30像素

##### setImageSize(width, height)
- 设置图片大小，单位为像素

##### getImageInfo()
- 返回资源信息
- {url: this.url, width: this.width, height: this.height}

##### -----EmbeddedVideoBox特有接口-----
##### setVideo(url, width = 30, height = 30)
- 设置视频资源地址，大小
- 宽高默认为30像素

##### setVideoSize(width, height)
- 设置视频大小，单位为像素

##### setEnableAutoDisplay(enable)
- 设置视频自动播放

##### play()
- 播放视频

##### pause()
- 暂停视频