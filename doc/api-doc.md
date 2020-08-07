# React-XRplayer 接口文档（初步）

## 零、基础全景相关


## 一、标签内容相关

### 1. 标签种类和UI组成

普通标签(label)UI由以下几个部分组成

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


### 3. 内嵌内容相关

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