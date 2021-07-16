import {
  localStore,
  getComputedStyle,
  validLink,
} from './utils';
import pkg from '../package.json';
import Bowser from 'bowser';
import Fingerprint from '@fingerprintjs/fingerprintjs';

const fpp = Fingerprint.load()

const {
  browser,
  os,
  engine,
} = Bowser.parse(window.navigator.userAgent);

// 默认设置
const defaultOptions = {
  // 数据源服务地址，必填
  dsn: '',
  // 发送方式: beacon, image，默认beacon
  send_type: 'beacon',
  // 是否自动收集页面浏览事件，默认开启
  pageview_auto_trace: true,
  // 是否自动收集点击事件，默认开启
  click_auto_trace: true,
  // 收集包含有特定属性的元素的点击
  click_attr_trace: [],
  // 收集包含有特定类名的元素的点击
  click_class_trace: [],
  // 是否开启收集兜底事件触发元素的点击，默认不开启
  click_target_trace: false,
  // 开启调试
  debug: false,
};

// 状态信息
const state = Object.create(null);

// 挂载全局预置属性
state.preset = {
  $st: 'web',
  $sv: pkg.version,
  $lg: navigator.language,
  $pf: navigator.platform,
  $os: os.name,
  $ov: os.versionName,
  $br: browser.name,
  $bv: browser.version,
  $eg: engine.name,
  $ev: engine.version,
};

// 页面预置属性
const getPagePresetProps = () => ({
  $tt: document.title,
  $url: location.href,
  $path: location.pathname,
});

// 通过图片发送信息
// 协议必须一致
const sendImage = (params, callback) => {
  const img = document.createElement('img');
  img.onabort = img.onerror = img.onload = () => {
    img.onload = null;
    img.onerror = null;
    img.onabort = null;
    typeof callback === 'function' && callback();
  };
  img.width = 1;
  img.height = 1;
  const usp = new URLSearchParams(params).toString();
  img.src = `${state.options.dsn}?${usp}`;
};

// 通过 beacon 发送信息
const sendBeacon = (params, callback) => {
  const usp = new URLSearchParams(params).toString();
  navigator.sendBeacon(state.options.dsn, usp);
  setTimeout(() => {
    typeof callback === 'function' && callback();
  }, 0);
};

// 最终发送信息的方法
let sendMethod;

// 触发事件的方法
// event_type 事件类型
// payload 载荷信息，必须为Object对象
// callback 回掉函数
const trace = ($ev, payload, callback) => {
  const info = {
    $ev,
    ...state.preset,
    ...getPagePresetProps(),
    ...payload,
  };
  // debug
  if (state.options.debug) {
    console.log(info);
  }
  // 发送
  sendMethod(info, callback);
};

// 来源页面地址
let referrer = document.referrer;

// 自动收集页面浏览
const autoTracePageview = () => {
  // 初次加载触发pageview事件
  trace('$pageview', {
    $ref: referrer,
  });

  const historyPushState = window.history.pushState;
  const historyReplaceState = window.history.replaceState;

  window.history.pushState = (...rest) => {
    historyPushState.apply(window.history, rest);
    trace('$pageview', {
      $ref: referrer,
    });
    referrer = location.href;
  };
  window.history.replaceState = (...rest) => {
    historyReplaceState.apply(window.history, rest);
    trace('$pageview', {
      $ref: referrer,
    });
    referrer = location.href;
  };
  window.addEventListener('popstate', () => {
    // console.log(ev.state);
    trace('$pageview', {
      $ref: referrer,
    });
    referrer = location.href;
  });
};

// 手动触发应用 pageview 事件
// payload 载荷信息，必须为 Object 对象
const tracePageview = (payload) => {
  trace('$pageview', {
    $ref: referrer,
    ...payload,
  });
  referrer = location.href;
};

// 获取被收集元素
const getTracedEl = (composedPath) => {
  const {
    click_attr_trace,
    click_class_trace,
  } = state.options;
  let editEl = null;
  let elEl = null;
  let attrEl = null;
  let pointerEl = null;
  let btnEl = null;
  for (let index = 0, len = composedPath.length; index < len; index++) {
    const el = composedPath[index];
    const tagName = el.tagName.toLowerCase();
    if (tagName === 'body' || tagName === 'html') break;
    if (el.hasAttribute('contenteditable') && el.getAttribute('contenteditable') !== 'false') {
      if (editEl) break;
      editEl = { type: 'editable', el, index };
    } else if (tagName === 'input' || tagName === 'textarea') {
      if (editEl) break;
      editEl = { type: tagName, el, index };
    } else if (tagName === 'a') {
      if (elEl) continue;
      elEl = { type: tagName, el, index };
    } else if (click_attr_trace.some(attr => el.hasAttribute(attr))) {
      if (attrEl) continue;
      attrEl = { type: 'attr', el, index };
    } else if (click_class_trace.some(cls => el.classList.contains(cls))) {
      if (attrEl) continue;
      attrEl = { type: 'class', el, index };
    } else if (getComputedStyle(el, 'cursor') === 'pointer') {
      if (pointerEl) continue;
      pointerEl = { type: 'pointer', el, index };
    } else if (tagName === 'button') {
      !btnEl && (btnEl = { type: 'button', el, index });
    }
  }
  if (editEl) return editEl;
  if (elEl) return elEl;
  if (attrEl) return attrEl;
  if (pointerEl) return pointerEl;
  if (btnEl) return btnEl;
  if (state.options.click_target_trace) {
    return { type: 'target', el: composedPath[0], index: 0 };
  }
};

// 获取选择器
const getSelectorFromPath = (path) => {
  const sels = [];
  for (const el of path) {
    if (el.id) {
      sels.unshift(`#${el.id}`);
      break;
    } else if (el.className) {
      sels.unshift(`.${el.classList[0]}`);
    } else {
      sels.unshift(el.tagName.toLowerCase());
    }
    if (el.tagName === 'BODY' || el.tagName === 'HTML') break;
  }
  return sels.join('>');
};

// 获取有效点击元素的信息
const getClickPayload = (el, path) => {
  const payload = {
    $el_tag: el.tagName.toLowerCase(),
  };
  if (el.id) {
    payload.$el_id = el.id;
  }
  if (el.name) {
    payload.$el_name = el.name;
  }
  if (el.className) {
    payload.$el_cls = el.className;
  }
  if (el.href) {
    payload.$el_href = el.href;
  }
  const maxContent = 85;
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    if (el.value) {
      payload.$el_ct = el.value.substring(0, maxContent);
    }
  } else {
    const textContent = el.textContent.replace(/\s+/g, ' ').trim();
    if (textContent) {
      payload.$el_ct = textContent.substring(0, maxContent);
    }
  }
  payload.$el_sel = getSelectorFromPath(path);
  return payload;
};

// 点击事件前置共性操作
const handleClickPreset = (ev) => {
  if (!ev || !ev.target) return;
  const target = ev.target;
  if (target.nodeType !== 1) return;
  if (target.tagName === 'BODY' || target.tagName === 'HTML') return;
  // 点击处在页面中的定位
  const pagePosition = {
    $page_x: ev.pageX,
    $page_y: ev.pageY,
  };
  const composedPath = ev.composedPath ? ev.composedPath() : ev.path;
  // 获取被收集元素
  const tracedElInfo = getTracedEl(composedPath.slice(0, 10));
  if (!tracedElInfo) return;
  const { el: tracedEL, index: tracedELPathIndex, type: tracedType } = tracedElInfo;
  // 获取被收集元素的信息
  const tracedELPayload = getClickPayload(tracedEL, composedPath.slice(tracedELPathIndex));
  return {
    tracedEL,
    tracedELPathIndex,
    tracedType,
    pagePosition,
    tracedELPayload,
  };
};

// 自动收集点击事件
const autoTraceClick = () => {
  // 冒泡阶段用于 a 有效链接点击收集
  document.addEventListener('click', (ev) => {
    const res = handleClickPreset(ev);
    if (res) {
      const { tracedEL, pagePosition, tracedELPayload } = res;
      if (validLink(tracedEL)) {
        if (ev.defaultPrevented) {
          // 对于项目已经阻止的默认行为，不做任何多余操作，维持原有行为
          trace('$click', { ...pagePosition, ...tracedELPayload });
        } else {
          // 阻止链接跳转
          ev.preventDefault();
          // 是否已经触发过链接跳转
          let hasCalled = false;
          // 恢复原有链接跳转
          const jumpTo = () => {
            if (!hasCalled) {
              hasCalled = true;
              location.href = tracedEL.href;
            }
          };
          // 最大时间后跳转，保证用户体验
          // 非 Beacon 发送方式，如果发送数据时间大于1000ms，则可能无法成功发送数据
          const timeout = setTimeout(jumpTo, 1000);
          trace('$click', { ...pagePosition, ...tracedELPayload }, () => {
            clearTimeout(timeout);
            jumpTo();
          });
        }
      }
    }
  }, false);
  // 捕获阶段用于其他点击收集
  document.addEventListener('click', (ev) => {
    const res = handleClickPreset(ev);
    if (res) {
      const { tracedEL, pagePosition, tracedELPayload } = res;
      // 非 Beacon 发送方式，对于项目自行绑定的脚本跳转(location.href = '')，无能为力
      if (!validLink(tracedEL)) {
        trace('$click', { ...pagePosition, ...tracedELPayload });
      }
    }
  }, true);
};

// 手动触发 click 点击事件
// ev 点击事件的事件对象
// payload 载荷信息，必须为 Object 对象
const traceClick = (ev, payload) => {
  const ct = ev.currentTarget;
  const pagePosition = {
    $page_x: ev.pageX,
    $page_y: ev.pageY,
  };
  const composedPath = ev.composedPath ? ev.composedPath() : ev.path;
  const tracedELIndex = composedPath.findIndex((el) => el === ct);
  trace('$click', {
    ...pagePosition,
    ...getClickPayload(ct, composedPath.slice(tracedELIndex)),
    ...payload,
  });
};

// 初始化设备ID
const initVisitorId = async () => {
  if (state.options.vid) {
    localStore.set('vid', state.options.vid);
  }
  let vid = localStore.get('vid');
  if (!vid) {
    const fp = await fpp;
    const res = await fp.get();
    vid = res.visitorId;
    localStore.set('vid', vid);
  }
  state.preset.$vid = vid;
};

// 初始化方法
const init = (options) => {
  // 初始化并挂载选项
  state.options = options = Object.assign(defaultOptions, options);

  // 格式化配置项
  state.options.click_attr_trace = state.options.click_attr_trace ?? [];
  state.options.click_class_trace = state.options.click_class_trace ?? [];

  // 初始化设备ID
  initVisitorId();

  // 设置发送方法
  sendMethod = options.send_type === 'beacon' ? sendBeacon : sendImage;

  // 设置收集单页应用浏览事件
  if (options.pageview_auto_trace) {
    autoTracePageview();
  }

  // 设置收集元素点击事件
  if (options.click_auto_trace) {
    autoTraceClick();
  }
};

export default {
  init,
  trace,
  traceClick,
  tracePageview,
  // 添加全局预置属性
  addPresetState: (name, value) => {
    state.preset[name] = value;
  },
  // 设置访问者ID
  setVisitorId: (id) => {
    localStore.set('vid', id);
    state.preset.$vid = id;
  },
};
