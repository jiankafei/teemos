// 类型判断
export const typeis = (obj) => Object.prototype.toString.call(obj).slice(8, -1);

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
