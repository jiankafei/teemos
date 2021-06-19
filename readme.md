# 埋点

## 预置事件

1. $click
2. $pageview

预置事件可以通过配置自动开启。
也可以调用方法手动开启。

## 属性

### 全局非埋点属性

```txt
ename   # 事件名称
vid     # 访问者id
```

以 $ 开头的属性都为原有预置属性，为了便于区分，请在添加额外预置属性时，属性名不要以 $ 开头。

### 全局预置属性

```txt
$st       # sdk 类别，值为 web
$sv       # sdk 版本
$lg       # 浏览器语言
$pf       # 平台
$os       # 系统
$ov       # 系统版本
$br       # 浏览器品牌
$bv       # 浏览器版本
$eg       # 浏览器引擎
$ev       # 浏览器引擎版本
$tt       # 页面 title
$url      # 页面 href
$path     # 页面 path
```

### $click 事件预置属性

```txt
$el_tag     # 元素 tag
$el_id      # 元素属性 id
$el_name    # 元素属性 name
$el_cls     # 元素属性 class
$el_href    # 元素属性 href
$el_ct      # 元素内容
$el_sel     # 元素选择器
$page_x     # 点击的页面x轴坐标
$page_y     # 点击的页面y轴坐标
```

### $pageview 事件预置属性

```txt
$ref # 来源页面
```

## Methods

### init(options)

```js
// 初始化方法

// options
{
  // 数据源服务地址，必填
  dsn: '',
  // 发送方式: beacon, image
  send_type: 'beacon',
  // 是否开启自动收集点击事件，默认开启
  auto_track_click: true,
  // 收集包含有元素 attribute 的点击
  track_attrs_click: [],
  // 收集包含有元素 className 的点击
  track_class_name_click: [],
  // 是否开启收集所有点击事件，默认不开启
  track_all_click: false,
  // 是否自动收集spa应用页面浏览事件，默认开启
  auto_track_single_page: true,
  // 单页应用的发布路径，默认为 /
  single_page_public_path: '/',
  // 是否开启调试
  debug: false,
  // 唯一ID，一般用于调试或者绑定用户ID
  vid: '',
};
```

### track(eventName, payload, callback)

```js
// 发送自定义事件

// eventName 事件名称
// payload 额外的信息负载
// callback 事件的回调函数
```

### trackClick(event, payload)

```js
// 手动触发$click事件

// event 点击时的事件对象
// payload 额外的信息负载
```

### trackSinglePage(payload)

```js
// 手动触发spa应用$pageview事件

// payload 额外的信息负载
```

### appendPresetState(name, value)

```js
// 添加额外的全局预置属性
// name 预置属性名称
// value 预置属性值
```

### setVisitorId(id)

```js
// 设置唯一ID，一般用于调试或者绑定用户ID
```

## 自动收集 $click 点击事件介绍

默认 $click 点击事件遵循以下规则，优先级依次递减。

1. a, button, input, textarea
2. 包含特定属性的元素
3. 包含特定类名的元素
4. cursor 属性值为 pointer 的元素

注意：

1. 不收集 body html 元素的点击事件
2. 除了以上说明外的其他元素的所有点击事件的收集，请设置 track_all_click: true.

## example

示例内的 burypoint.es.js 由工程生成，如需要运行示例，复制最新的 burypoint.es.js 到示例项目。
