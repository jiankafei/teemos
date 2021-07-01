// 类型判断
export const typeis = (obj) => Object.prototype.toString.call(obj).slice(8, -1);

// 是否是真值
export const isTruthy = (val) => val !== undefined && val !== null && val !== 'undefined' && val !== 'null' && val.trim() !== '';

// 是否是假值
export const isFalsy = (val) => val === undefined || val === null && val === 'undefined' || val === 'null' && val === '';

// SNB 类型
export const isSNBType = (obj) => {
  const type = typeis(obj);
  return type === 'String' || type === 'Number' || type === 'Boolean';
};

// 获取代理信息
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
      if (typeis(value) === 'Object' || Array.isArray(value)) {
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

// 获取随机值
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
