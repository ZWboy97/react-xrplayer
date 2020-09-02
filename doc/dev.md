
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

#### 嵌入式文本框相关
嵌入式文本框是嵌入到XR场景中的文本框，可以展示文字、图片和视频，默认始终面向相机所在的平行于y轴的直线，可以更改位置、朝向、内容、大小等属性，并且可以通过修改draggable属性使其可拖动。创建后默认设置为不可见，需使用showTextBox方法使其可见。本质是使用canvas作为材质应用到XR场景中的一个平面上。
##### createTextBox(params)
使用一组选项创建并返回一个TextBox类，并且添加到场景中，默认不可见。
* params：Object类型，包含创建时的选项
    * message：String类型，文本框中的内容。默认为“请输入文字”。
    * font：String类型，文本框中文字的字体。默认为“Arial”。
    * fontSize：Number类型，文本框中文字的大小，单位为像素。默认为36。
    * fontColor：Object类型，文本框中文字的颜色。默认为{ r:255, g:255, b:255, a:1.0 }。
    * borderDistanceX：Number类型，文本框中文字距边框的左边距，单位为像素。默认为15。
    * borderDistanceY：Number类型，文本框中文字距边框的上边距，单位为像素。默认为15。
    * borderThickness：Number类型，文本框的边框粗细，单位为像素。默认为5。
    * borderWidth：Number类型，文本框的边框宽度，单位为像素。默认为190。
    * borderHeight：Number类型，文本框的边框高度，单位为像素。默认为60。
    * borderColor：Object类型，文本框的边框颜色。默认为{ r:100, g:100, b:100, a:0.5 }。
    * backgroundColor：Object类型，文本框的背景颜色。默认为{ r:100, g:100, b:100, a:0.5 }。
    * scaleX：Number类型，文本框的横向缩放比例。默认为0.8。
    * scaleY：Number类型，文本框的纵向缩放比例。默认为0.8。
    * position：Object类型，文本框在XR场景中的位置。默认为{ x:0, y:0, z:0 }。
    * depthTest：Boolean类型，控制文本框是否可被遮挡。默认为false。
    * draggable：Boolean类型，控制文本框是否可拖动。默认为false。
    * inputCanvas：Object类型，HTML DOM中的canvas元素，可以让文本框只显示输入canvas上的内容。默认为null。注意：如果文本框已经使用了输入的canvas，想要取消的话需置此项为null。
        * 注意：使用给定canvas将会导致从message到backgroundColor的所有属性无效，但是仍会保存在TextBox中，可以通过取消给定canvas恢复。

##### showTextBox(textBox)
使传入的textBox可见，若已经可见则不会有任何效果。
* textBox：TextBox类型，为想要显示的文本框。

##### hideTextBox(textBox)
使传入的textBox不可见，若已经不可见则不会有任何效果。
* textBox：TextBox类型，为想要隐藏的文本框。

##### changeTextBox(textBox, params)
改变特定文本框的属性。
* textBox：TextBox类型，为想要改变的文本框。
* params：Objext类型，包含各属性的选项，具体构造同createTextBox的params参数。

##### removeTextBox(textBox)
从XR场景中移除文本框。注意：该textBox并不会删除，如不再使用请手动置NULL防止内存泄漏。
* textBox：TextBox类型，为想要移除的文本框。

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


