# React-XRplayer 接口文档

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
    img: '', //图片url
    text: 'lable', // 文字内容
    text_float:'left', // 文字位置[left,right,top,
    text_size: 'big', // 文字大小[large, medium, small]
    bottom]
    img_width: 30, // 图片宽度
    img_height: 30, // 图片高度
    animate: true,  // icon是否跳动
    event_id: 'e_xxx' // 响应事件id
}
```

### 3. 标签相关接口

#### getLabelManager()

- 标签相关的接口统一通过`LabelManager`实例对外提供服务
- 通过`XRPlayerManager.getLabelManager()`
- 返回`LabelManager`实例

以下接口均由`LabelManager`提供

#### addLabel(label)
- 添加一个热点标签到场景中
- label为该标签对应的结构

#### removeLabel(id)
- 基于id，移除这个标签

#### getLabel(id)
- 基于id查询一个label实例
- 返回查询到的label实例
- 通过返回的实例可以修改标签的属性
    - 修改文本，图片，大小
    - 获取位置

#### addLabelList(labelList)
- 一次性添加多个label列表
- labelList参数为label数组

#### clearAllLabels()
- 清空所有的标签

#### 回调方法 onLabelClicked(label_id)
- 当标签被点击的时候回调该方法
- 用于响应标签被点击，以及编辑时候被选中
- 在内部事件响应(比如展示弹窗视频)之前调用该回调
- 返回true，表明拦截该事件响应，内部事件响应不会继续
- 返回false，为拦截，继续执行内部事件响应


### 3. 内嵌内容相关
- 支持内嵌文本、图片、视频、模型
