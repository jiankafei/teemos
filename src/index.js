import {
  parseUserAgent,
  localStore,
  getRandomValue,
  getComputedStyle,
} from './utils';
import pkg from '../package.json';

// 默认设置
const defaultOptions = {
  dsn: '', // 数据源服务地址
  use_client_time: true,
  send_type: 'beacon', // 发送方式, beacon image
  // 是否开启自动追踪页面浏览事件
  track_page_view: true,
  // 是否开启自动追踪点击事件
  track_click: true,
  // 追踪的元素属性
  track_attrs: [],
  // 追踪的元素 className
  track_class_name: [],
  // 单页面配置，默认开启
  track_single_page: true,
  // 单页应用的发布路径，默认为/
  single_page_public_path: '/',
  // 开启调试
  debug: false,
};

// 状态信息
const state = Object.create(null);

// 挂载用户代理数据
state.userAgentData = parseUserAgent();

// 挂载全局预置属性
state.preset = {
  $sdk_version: pkg.version,
  $sdk_type: 'web',
  $user_agent: navigator.userAgent,
  $browser_brand: state.userAgentData.brand,
  $browser_version: state.userAgentData.version,
  $language: navigator.language,
  $platform: navigator.platform,
};

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

// 发送追踪信息的方法，payload 必须是对象
const track = ($event_type, payload, callback) => {
  const message = {
    $event_type,
    ...state.preset,
    ...payload,
  };
  // 使用本地发送时间
  if (state.options.use_client_time) {
    message.$timestamp = Date.now();
  }
  // 页面相关预置属性
  message.$title = document.title;
  message.$url = location.href;
  message.$url_path = location.pathname;
  // debug
  if (state.options.debug) {
    console.log(message);
  }
  // 发送
  sendMethod(message, callback);
};

// 追踪历史记录变动
const trackHistoryState = () => {
  let lastHref = document.referrer;
  const historyPushState = window.history.pushState;
  const historyReplaceState = window.history.replaceState;

  window.history.pushState = (...rest) => {
    historyPushState.apply(window.history, rest);
    // 设置是否自动追踪页面浏览事件
    if (state.options.track_page_view) {
      track('$pageview', {
        $url: location.href,
        $referrer: lastHref,
      });
    }
    lastHref = location.href;
  };
  window.history.replaceState = (...rest) => {
    historyReplaceState.apply(window.history, rest);
    // 设置是否自动追踪页面浏览事件
    if (state.options.track_page_view) {
      track('$pageview', {
        $url: location.href,
        $referrer: lastHref,
      });
    }
    lastHref = location.href;
  };
  window.addEventListener('popstate', () => {
    // console.log(ev, ev.state);
    // 设置是否自动追踪页面浏览事件
    if (state.options.track_page_view) {
      track('$pageview', {
        $url: location.href,
        $referrer: lastHref,
      });
    }
    lastHref = location.href;
  });
};

// 追踪点击事件
const trackWebClick = () => {
  // 获取被追踪元素
  const getTrackedEl = (composedPath) => {
    const aEls = [];
    const attrEls = [];
    const classEls = [];
    const buttonEls = [];
    const pointerEls = [];
    for (let index = 0, len = composedPath.length; index < len; index++) {
      const el = composedPath[index];
      if (aEls.length) return { type: 'a', el: aEls[0], index, };
      else if (attrEls.length) return { type: 'attrs', el: attrEls[0], index, };
      else if (classEls.length) return { type: 'class', el: classEls[0], index, };
      else if (buttonEls.length) return { type: 'button', el: buttonEls[0], index, };
      else if (pointerEls.length) return { type: 'pointer', el: pointerEls[0], index, };
      if (el.tagName === 'A') {
        aEls.push(el);
      } else if (state.options.track_attrs.some(attr => el.hasAttribute(attr))) {
        attrEls.push(el);
      } else if (state.options.track_class_name.some(cls => el.classList.contains(cls))) {
        classEls.push(el);
      } else if (el.tagName === 'BUTTON') {
        buttonEls.push(el);
      } else if (getComputedStyle(el, 'cursor') === 'pointer') {
        pointerEls.push(el);
      }
    }
    return { type: 'target', el: composedPath[0], index: 0, };
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
      if (el.tagName.toLowerCase() === 'body') {
        break;
      }
    }
    return sels.join('>');
  };
  // 获取有效点击元素的信息
  const getClickPayload = (el, path) => {
    const payload = {
      $element_tag_name: el.tagName.toLowerCase(),
    };
    if (el.id) {
      payload.$element_id = el.id;
    }
    if (el.name) {
      payload.$element_name = el.name;
    }
    if (el.className) {
      payload.$element_class_name = el.className;
    }
    if (el.href) {
      payload.$element_target_url = el.href;
    }
    if (el.textContent.trim()) {
      payload.$element_content = el.textContent.replace(/\s+/g, ' ').trim().substring(0, 255);
    }
    payload.$element_selector = getSelectorFromPath(path);
    return payload;
  };
  document.addEventListener('click', (ev) => {
    if (!ev || !ev.target) return false;
    const target = ev.target;
    if (target.nodeType !== 1) return;
    if (target.tagName === 'BODY' || target.tagName === 'HTML') return;
    // 点击处在页面中的定位
    const pagePosition = {
      $page_x: ev.pageX,
      $page_y: ev.pageY,
    };
    const composedPath = ev.composedPath ? ev.composedPath() : ev.path;
    // 获取被追踪元素
    const { el: trackedEL, index: trackedELIndex } = getTrackedEl(composedPath);
    // 获取被追踪元素的信息
    const trackedELPayload = getClickPayload(trackedEL, composedPath.slice(trackedELIndex));
    if (
      trackedEL.tagName === 'A' &&
      /^https?:\/\//.test(trackedEL.href) &&
      trackedEL.target !== '_blank' &&
      !trackedEL.download
    ) {
      // 在当前页面打开的a链接
      try {
        const trackedELURL = new URL(trackedEL.href);
        if (
          state.options.track_single_page &&
          trackedELURL.origin === location.origin &&
          trackedELURL.href.startsWith(`${location.origin}${state.options.single_page_public_path}`)
        ) {
          // 单页应用路由点击
          track('$click', { ...pagePosition, ...trackedELPayload });
        } else {
          // 阻止链接跳转
          ev.preventDefault();
          // 是否已经触发过链接跳转
          let hasCalled = false;
          // 恢复原有链接跳转
          const jumpUrl = () => {
            if (!hasCalled) {
              hasCalled = true;
              location.href = trackedEL.href;
            }
          };
          // 最大时间后跳转，保证用户体验
          // 对于 image 发送方式，如果发送数据时间大于1000ms，则可能无法成功发送数据
          let timeout = setTimeout(jumpUrl, 1000);
          track('$click', { ...pagePosition, ...trackedELPayload }, () => {
            clearTimeout(timeout);
            jumpUrl();
          });
        }
      } catch (error) {
        console.warn(error);
      }
    } else {
      track('$click', { ...pagePosition, ...trackedELPayload });
    }

    // 追踪 a button 点击
    // const clickElIndex = composedPath.findIndex(el => el.tagName === 'A' || 'BUTTON');
    // if (clickElIndex !== -1) {
    //   const clickEl = composedPath[clickElIndex];
    //   const payload = getClickPayload(clickEl, composedPath.slice(clickElIndex));
    //   if (
    //     clickEl.tagName === 'A' &&
    //     /^https?:\/\//.test(clickEl.href) &&
    //     clickEl.target !== '_blank' &&
    //     !clickEl.download
    //   ) {
    //     // 有效可刷新链接
    //     try {
    //       const clickElURL = new URL(clickEl.href);
    //       if (
    //         state.options.track_single_page &&
    //         clickElURL.origin === location.origin &&
    //         clickElURL.href.startsWith(`${location.origin}${state.options.single_page_public_path}`)
    //       ) {
    //         // 单页应用路由点击
    //         track('$click', { ...pagePosition, ...payload });
    //       } else {
    //         // 不满足单页应用路由的情况下恢复原有的链接跳转
    //         // 阻止默认
    //         ev.preventDefault();
    //         // 是否已经触发过跳转
    //         let hasCalled = false;
    //         // 对于 image 发送方式，如果发送数据时间大于1000ms，则可能无法成功发送数据
    //         const jumpUrl = () => {
    //           if (!hasCalled) {
    //             hasCalled = true;
    //             location.href = clickEl.href;
    //           }
    //         };
    //         // 最大时间后跳转，保证用户体验
    //         let timeout = setTimeout(jumpUrl, 1000);
    //         track('$click', { ...pagePosition, ...payload }, () => {
    //           clearTimeout(timeout);
    //           jumpUrl();
    //         });
    //       }
    //     } catch (error) {
    //       console.warn(error);
    //     }
    //   } else {
    //     track('$click', { ...pagePosition, ...payload });
    //   }
    // } else {
    //   track('$click', { ...pagePosition, ...getClickPayload(target, composedPath)});
    // }
  }, true);
};

// 初始化设备ID
const initDistinctId = () => {
  let distinct_id = localStore.get('distinct_id');
  if (!distinct_id) {
    distinct_id = getRandomValue();
    localStore.set('distinct_id', distinct_id);
  }
  state.preset.distinct_id = distinct_id;
};

// 初始化方法
const init = (options) => {
  // 初始化并挂载选项
  state.options = options = Object.assign(defaultOptions, options);
  // 格式化配置项
  if (!options.single_page_public_path.startsWith('/')) {
    options.single_page_public_path = `/${options.single_page_public_path}`;
  }
  state.options.track_attrs = state.options.track_attrs || [];
  state.options.track_class_name = state.options.track_class_name || [];

  // 初始化设备ID
  initDistinctId();
  // 设置发送方法
  sendMethod = options.send_type === 'beacon' ? sendBeacon : sendImage;
  // 初次加载触发pv事件
  track('$pageview', {
    $url: location.href,
    $referrer: document.referrer,
  });
  // 设置追踪单页应用
  if (options.track_single_page) {
    trackHistoryState();
  }
  // 设置追踪点击事件
  if (options.track_click) {
    trackWebClick();
  }
};

export default {
  // 添加全局预置属性
  appendPresetState(name, value) {
    state.preset[name] = value;
  },
  // 设置 唯一ID
  setDistinctId: (id) => {
    state.preset.distinct_id = id;
    localStore.set('distinct_id', id);
  },
  init,
  track,
};
