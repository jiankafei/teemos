# 埋点

## Methods

init(options)

```js
// 初始化方法

// options
{
  // 数据源服务地址，必填
  dsn: '',
  // 是否使用客户端时间
  use_client_time: true,
  // 发送方式, beacon image
  send_type: 'beacon',
  // 是否开启自动收集点击事件
  auto_track_click: true,
  // 收集包含有元素 attribute 的点击
  track_attrs_click: [],
  // 收集包含有元素 className 的点击
  track_class_name_click: [],
  // 是否开启收集所有点击事件
  track_all_click: false,
  // 单页面配置，默认开启
  auto_track_single_page: true,
  // 单页应用的发布路径，默认为/
  single_page_public_path: '/',
  // 开启调试
  debug: false,
  // 唯一ID
  distinct_id: '',
};
```

track(eventType, payload, callback)

```js
// 发送自定义事件

// eventType 事件名称
// payload 额外的信息负载
// callback 事件的回调函数
```

trackClick(event, payload)

```js
// 手动触发click事件

// event 点击时的事件对象
// payload 额外的信息负载
```

trackSinglePage(payload)

```js
// 手动触发spa应用页面浏览事件

// payload 额外的信息负载
```

appendPresetState(name, value)

```js
// 添加额外的预置属性
// name 预置属性名称
// value 预置属性值
```

setDistinctId(id)

```js
// 设置唯一ID
```

## 自动收集 $click 点击事件介绍

默认 $click 点击事件会收集以下元素的点击事件

1. a, button, input, textarea
2. 包含特定属性的元素
3. 包含特定类名的元素
4. cursor 属性值为 pointer 的元素

如果需要开启收集除了 html body 外的所有元素的点击事件，请设置 track_all_click: true.
