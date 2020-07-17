# XRPlayer XR全景互动直播React组件

## 关于

### 简介

自主研发一款功能丰富，架构合理的XR全景互动直播播放器。基于React以及Three.jsReact框架，以React组件方式输出能力。

### 特性

#### 支持多种全景资源的展示

* [x] 支持常见格式的全景图片
* [x] 支持全景视频点播
  * [x] MP4
  * [x] FLV
  * [x] HLS
* [x] 支持全景视频直播
  * [x] MP4
  * [x] HTTP-FLV
  * [x] HLS

#### 支持多种全景视角控制

* [x] 支持鼠标点击拖动控制
* [ ] 支持鼠标点击滑动控制
* [ ] 支持鼠标拖动偏移量控制
* [x] 支持鼠标直接控制
* [x] 支持键盘直接控制
* [x] 支持手机传感器直接控制
* [x] 支持滚轮切换视野大小

#### 支持多种全景视角切换

* [x] 支持小行星视角切换

#### 支持3D模型展示

* [x] 支持加载3D模型到全景场景中
  * [x] FBX格式模型
  * [x] JSON格式模型
* [ ] 支持指定位置展示模型
* [ ] 支持模型动画

#### 支持热点标签展示与交互

* [x] 支持指定位置展示热点标签
  * [x] 图片标签
  * [ ] 文字标签
* [x] 支持为热点标签绑定事件响应
  * [x] 鼠标点击触发热点标签事件
  * [ ] 光标停留2秒触发标签事件
* [x] 支持热点标签动态添加与移除
* [ ] 支持热点标签动态拖动
* [ ] 支持热点标签远近缩放  

#### 支持VR展示与交互

* [ ] 支持双目VR展示效果
* [ ] 支持双目VR热点交互
* [ ] 支持GoogleCardBoard

#### 支持全景漫游

* [x] 支持全景背景动态切换
* [ ] 支持漫游穿梭效果

#### 支持标准化、格式化的参数编辑 （基于本项目开发的另一个配套研发项目）

* [ ] 提供标准化、格式化编辑功能
* [ ] 可视化的全景编辑器

#### 交互控制指令执行引擎

* [x] 框架开放高度灵活开放的控制接口
* [ ] 支持指令脚本按时间戳解析执行
  * [ ] 指令脚本自动解析执行
  * [ ] 脚本生成器
* [ ] 支持指令控制台实时分发
  * [ ] 指令服务器
  * [ ] 可视化指令操作控制界面

## 开发

### 1. 安装依赖

```js
npm install
```

### 2. 运行example

```js
npm run start
```

### 3. 编译React库

```js
npm run compile
```
生成的可发布到npm库位于`/lib`文件夹中

### 4. 打包项目

```js
npm run build
```
打包好的项目位于`/build`文件夹中

### 项目结构
略

## 快速集成 

### 1. 安装XRPlayer库

```js
npm install react-xrplayer
```

### 2. 以组件方式使用

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

## 接口文档


### 标准化数据结构
XRPlayer除了具备全景播控能力以外，还有配套使用的编辑控制器，推荐使用标准化的数据表达方式
#### 场景数据

##### 全景资源数据
```js

```
##### 热点标签数据
```js
[
    ['infocard', {
                phi: -90, theta: -10, animate: true,
                res_url: 'https://live360.oss-cn-beijing.aliyuncs.com/xr/icons/hotspot_video.png'
                }
    ],
    ['image', { phi: 32, theta: 14, res_url: 'https://live360.oss-cn-beijing.aliyuncs.com/xr/icons/hotspot_video.png' }],
]
```
##### 模型数据
Map格式
```js
[
    ['12332', {
        objUrl: "https://live360.oss-cn-beijing.aliyuncs.com/xr/models/SambaDancing.fbx",
        texture: "texture1.png",
        modeFormat: "fbx",
        scale: 1
        }
    ],       
    ['23433', {
        objUrl: "https://live360.oss-cn-beijing.aliyuncs.com/xr/models/texture1.json",
        texture: "https://live360.oss-cn-beijing.aliyuncs.com/xr/models/texture1.png",
        modeFormat: "obj",
        scale: 1
        }
    ]            
]
```
##### 完整场景数据

##### 事件数据
```js
 [
            ['infocard', {
                id: 'infocard',
                type: 'infocard',
                iframeUrl: "https://gs.ctrip.com/html5/you/place/14.html"
            }],
            ['image', {
                id: 'image',
                type: 'image',
                imageUrl: "https://pic-cloud-bupt.oss-cn-beijing.aliyuncs.com/5c882ee6443a5.jpg",
                jumpUrl: 'http://www.youmuvideo.com',
            }]
        ]
```

### 组件开放属性

#### 组件相关
##### width
    width: Proptypes.string, 播放器组件的宽度
##### height
    height: Proptypes.string, 播放器组件的高度
##### is_full_screen
    Proptypes.bool,

#### 全景相机相关
##### camera_fov
    camera_fov: Proptypes.number,
##### camera_near
    camera_near: Proptypes.number,
##### camera_far
    camera_far: Proptypes.number,
##### camera_position
    camera_position: Proptypes.object,
##### camera_target
    camera_target: Proptypes.object,

#### 全景场景属性
##### scene_texture_resource
    Proptypes.object.isRequired,
##### axes_helper_display
    Proptypes.bool,
##### hot_spot_list
    Proptypes.array,
##### event_list
    Proptypes.array,

#### 回调接口函数
##### onCreated
    Proptypes.func,
##### onFullScreenChange
    Proptypes.func,
##### onEventHandler
    Proptypes.func

### 组件外部控制器
开放给业务组件的控制接口，提供各种动态控制能力
#### 全景背景控制相关

#### 热点标签控制相关
##### setHotSpots(hot_spot_list, event_list)
用于向场景中添加一组热点标签，在添加前，会将之前所有已有的热点标签清空
* hot_spot_list 
    热点标签列表
* event_list
    标签中涉及的事件列表
##### addHotSpot(hot_spot, event)
用于向场景中单独添加一个热点标签
* hot_spot
    热点标签数据
* event
    事件数据，可以为null
##### removeHotSpot(hot_spot_key)
用于从场景热点标签中移除一个热点标签
* hot_spot_key
    目标移除热点的key

#### 模型控制相关
##### setModels(model_list)
通过列表一次性设置一组模型加载，先前加载的模型会被清除
model_list是一个Map结构，结构示例如下
```js
[
    ['12332', {
        objUrl: "https://live360.oss-cn-beijing.aliyuncs.com/xr/models/SambaDancing.fbx",
        texture: "texture1.png",
        modeFormat: "fbx",
        scale: 1
        }
    ],       
    ['23433', {
        objUrl: "https://live360.oss-cn-beijing.aliyuncs.com/xr/models/texture1.json",
        texture: "https://live360.oss-cn-beijing.aliyuncs.com/xr/models/texture1.png",
        modeFormat: "obj",
        scale: 1
        }
    ]            
]
```
##### addModel(model_key, model)
向场景中添加单个模型，不影响已有的模型
* model_key：String类型，需要保障唯一性，便于后期的控制与移除
* model：Object类型，模型相关的数据

举例：
```js
addModel('12332', {
            objUrl: "https://live360.oss-cn-beijing.aliyuncs.com/xr/models/SambaDancing.fbx",
            texture: "texture1.png",
            modeFormat: "fbx",
            scale: 1
        })
```
##### removeModel(model_key)
基于模型的key从场景中移除一个已有模型
举例：
```js
removeModel('12332');
```
##### removeAllModel()
移除所有模型，场景中之前加载的所有模型都被清空
举例：略

#### 相机移动与控制相关

#### 其他接口


