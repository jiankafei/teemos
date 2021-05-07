// 类型判断
const typeis = obj => Object.prototype.toString.call(obj).slice(8, -1); // SNB 类型

const isSNBType = obj => {
  const type = typeis(obj);
  return type === 'String' || type === 'Number' || type === 'Boolean';
}; // 获取代理信息

const parseUserAgent = () => {
  if (navigator.userAgentData) {
    return navigator.userAgentData.brands[2];
  }

  const res = /\b(Chrome|Firefox|Safari)\/([\d.]+)\b/.exec(navigator.userAgent);

  if (res) {
    return {
      brand: res[1],
      version: res[2]
    };
  }
};
const localStore = {
  get: key => {
    let res = localStorage.getItem(key);

    try {
      res = JSON.parse(res) || '';
    } catch (error) {
      // console.warn(error);
      res = '';
    }

    return res;
  },
  set: (key, value) => {
    try {
      value = value || '';

      if (!isSNBType(value)) {
        value = JSON.stringify(value);
      }
    } catch (error) {
      // console.warn(error);
      value = '';
    }

    localStorage.setItem(key, value);
  },
  remove: key => {
    if (key) {
      localStorage.removeItem(key);
    } else {
      localStorage.clear();
    }
  }
}; // 获取随机值

const getRandomValue = () => {
  const array = new Uint32Array(3);
  window.crypto.getRandomValues(array);
  return array.join('-');
};

var name = "barypoint";
var version = "1.0.0";
var main = "index.js";
var author = "ct";
var license = "MIT";
var scripts = {
	watch: "rollup -c rollup.config.js -w",
	build: "rollup -c rollup.config.js"
};
var devDependencies = {
	"@babel/core": "^7.14.0",
	"@babel/preset-env": "^7.14.0",
	"@rollup/plugin-babel": "^4.4.0",
	"@rollup/plugin-commonjs": "^10.1.0",
	"@rollup/plugin-json": "^4.1.0",
	"@rollup/plugin-node-resolve": "^5.2.0",
	chokidar: "^3.5.1",
	rollup: "^2.46.0",
	"rollup-plugin-terser": "^7.0.2a"
};
var dependencies = {
};
var pkg = {
	name: name,
	version: version,
	main: main,
	author: author,
	license: license,
	scripts: scripts,
	devDependencies: devDependencies,
	dependencies: dependencies
};

const defaultOptions = {
  // sdk_url: '',
  // project: '', // 标识项目
  dsn: '',
  // 数据源服务地址
  use_client_time: true,
  send_type: 'beacon',
  // 发送方式, beacon image
  // 是否开启自动追踪页面浏览事件
  track_page_view: true,
  // 是否开启自动追踪点击事件
  track_click: true,
  // 单页面配置，默认开启
  track_single_page: true,
  // 单页应用的发布路径，默认为/
  single_page_public_path: '/',
  // 开启调试
  debug: true
}; // 状态信息

const state = Object.create(null); // 挂载用户代理数据

state.userAgentData = parseUserAgent(); // 挂载全局预制属性

state.preset = new Map(Object.entries({
  $sdk_version: pkg.version,
  $sdk_type: 'web',
  $title: document.title,
  $url: location.href,
  $url_path: location.pathname,
  $user_agent: navigator.userAgent,
  $browser_brand: state.userAgentData.brand,
  $browser_version: state.userAgentData.version,
  $language: navigator.language,
  $platform: navigator.platform
})); // 通过图片发送信息
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
}; // 通过 beacon 发送信息


const sendBeacon = (params, callback) => {
  const usp = new URLSearchParams(params).toString();
  navigator.sendBeacon(state.options.dsn, usp);
  setTimeout(() => {
    typeof callback === 'function' && callback();
  }, 0);
}; // 最终发送信息的方法


let sendMethod; // 发送追踪信息的方法，payload 必须是对象

const track = ($event_type, payload, callback) => {
  const message = {
    $event_type,
    ...Object.fromEntries(state.preset),
    ...payload
  }; // 使用本地发送时间

  if (state.options.use_client_time) {
    message.$timestamp = Date.now();
  }

  if (state.options.debug) {
    console.log(message);
  }

  sendMethod(message, callback);
}; // 追踪历史记录变动


const trackHistoryState = () => {
  let lastHref = document.referrer;
  const historyPushState = window.history.pushState;
  const historyReplaceState = window.history.replaceState;

  window.history.pushState = (...rest) => {
    historyPushState.apply(window.history, rest); // 设置是否自动追踪页面浏览事件

    if (state.options.track_page_view) {
      track('$pageview', {
        $url: location.href,
        $referrer: lastHref
      });
    }

    lastHref = location.href;
  };

  window.history.replaceState = (...rest) => {
    historyReplaceState.apply(window.history, rest); // 设置是否自动追踪页面浏览事件

    if (state.options.track_page_view) {
      track('$pageview', {
        $url: location.href,
        $referrer: lastHref
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
        $referrer: lastHref
      });
    }

    lastHref = location.href;
  });
}; // 追踪点击事件


const trackWebClick = () => {
  // 获取选择器
  const getSelectorFromPath = path => {
    const sels = []; // console.log('getSelectorFromPath', path);

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
  }; // 获取有效点击元素的信息


  const getClickPayload = (el, path) => {
    const payload = {
      $element_tag_name: el.tagName.toLowerCase()
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

  document.addEventListener('click', ev => {
    if (!ev || !ev.target) return false;
    let trackedEL = ev.target;
    if (trackedEL.nodeType !== 1) return;
    if (trackedEL.tagName === 'BODY' || trackedEL.tagName === 'HTML') return; // 追踪 a button 点击

    const clickElIndex = ev.path.findIndex(el => el.tagName === 'A' || 'BUTTON');

    if (clickElIndex !== -1) {
      const clickEl = ev.path[clickElIndex];

      if (clickEl.tagName === 'A' && /^https?:\/\//.test(clickEl.href) && clickEl.target !== '_blank' && !clickEl.download) {
        // 有效可刷新链接
        try {
          const clickElURL = new URL(clickEl.href);
          const payload = getClickPayload(clickEl, ev.path.slice(clickElIndex));

          if (state.options.track_single_page && clickElURL.origin === location.origin && clickElURL.href.startsWith(`${location.origin}${state.options.single_page_public_path}`)) {
            // 单页应用路由点击
            track('$click', payload);
          } else {
            // 不满足单页应用路由的情况下恢复原有的链接跳转
            // 阻止默认
            ev.preventDefault(); // 是否已经触发过跳转

            let hasCalled = false; // 对于 image 发送方式，如果发送数据时间大于1000ms，则可能无法成功发送数据

            const jumpUrl = () => {
              if (!hasCalled) {
                hasCalled = true;
                location.href = clickEl.href;
              }
            }; // 最大时间后跳转，保证用户体验


            let timeout = setTimeout(jumpUrl, 1000);
            track('$click', payload, () => {
              clearTimeout(timeout);
              jumpUrl();
            });
          }
        } catch (error) {
          console.warn(error);
        }
      } else {
        track('$click', getClickPayload(clickEl, ev.path));
      }
    } else {
      track('$click', getClickPayload(trackedEL, ev.path));
    }
  }, true);
}; // 初始化设备ID


const initDistinctId = () => {
  let distinct_id = localStore.get('distinct_id');

  if (!distinct_id) {
    distinct_id = getRandomValue();
    localStore.set('distinct_id', distinct_id);
  }

  state.preset.set('distinct_id', distinct_id);
}; // 初始化方法


const init = options => {
  // 初始化并挂载选项
  state.options = options = Object.assign(defaultOptions, options); // 格式化 single_page_public_path

  if (!options.single_page_public_path.startsWith('/')) {
    options.single_page_public_path = `/${options.single_page_public_path}`;
  } // 初始化设备ID


  initDistinctId(); // 设置发送方法

  sendMethod = options.send_type === 'beacon' ? sendBeacon : sendImage; // 初次加载触发pv事件

  track('$pageview', {
    $url: location.href,
    $referrer: document.referrer
  }); // 设置追踪单页应用

  if (options.track_single_page) {
    trackHistoryState();
  } // 设置追踪点击事件


  if (options.track_click) {
    trackWebClick();
  }
};

var index = {
  // 只包含全局预制属性
  get statePreset() {
    return state.preset;
  },

  init,
  track
};

export default index;
