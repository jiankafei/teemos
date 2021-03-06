// 类型判断
export const tpof = (obj) => Object.prototype.toString.call(obj).slice(8, -1);

// 是否是假值
export const isFalsy = (val) => val.trim() === '' || val === undefined || val === null || val === 'undefined' || val === 'null';

// 是否是真值
export const isTruthy = (val) => !isFalsy(val);

// 获取代理信息，暂未使用
export const parseUserAgent = () => {
  if (navigator.userAgentData) {
    return navigator.userAgentData.brands[2];
  }
  const res = /\b(Chrome|Firefox|Safari)\/([\d.]+)\b/.exec(navigator.userAgent);
  if (res) {
    return {
      brand: res[1],
      version: res[2],
    };
  }
};

// 本地存储
const isSNBType = (obj) => {
  const type = tpof(obj);
  return type === 'String' || type === 'Number' || type === 'Boolean';
};
export const localStore = {
  get: (key) => {
    let res = localStorage.getItem(key);
    try {
      if (res) res = JSON.parse(res);
    } catch (error) {
      // console.warn(error);
    }
    return res;
  },
  set: (key, value) => {
    if (isFalsy(key) || isFalsy(value)) return;
    try {
      value = isTruthy(value) ? value : '';
      if (tpof(value) === 'Object' || Array.isArray(value)) {
        value = JSON.stringify(value);
      } else if (!isSNBType(value)) {
        value = '';
      }
    } catch (error) {
      value = '';
    }
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  },
  remove: key => {
    if (key) {
      localStorage.removeItem(key);
    } else {
      localStorage.clear();
    }
  },
};

// 获取随机值，暂未使用
export const getRandomValue = () => {
  const array = new Uint32Array(3);
  window.crypto.getRandomValues(array);
  return array.join('-');
};

// 获取计算样式
export const getComputedStyle = (el, name) => {
  if (el.computedStyleMap) {
    return el.computedStyleMap().get(name).value;
  }
  return window.getComputedStyle(el).getPropertyValue(name);
};

// 检测和标准化 url
export const checkURL = (url) => {
  if (!url) return null;
  try {
    const URL = window.URL || window.webkitURL;
    if (/^\/\//.test(url)) {
      return new URL(`${window.location.protocol}${url}`);
    }
    if (/^\//.test(url)) {
      return new URL(`${window.location.origin}${url}`);
    }
    if (!/^https?:\/\//.test(url)) {
      return new URL(`${window.location.protocol}//${url}`);
    }
    return new URL(url);
  } catch (error) {
    // console.warn(error);
    return null;
  }
};

// 有效链接
export const validLink = (el) => {
  return (
    el.tagName === 'A'
    && /^https?:\/\//.test(el.href)
    && el.target !== '_blank'
    && !el.download
  );
};

// 是否是 safari
export const IS_SAFARI = typeof window.safari === 'object' && window.safari.pushNotification;
