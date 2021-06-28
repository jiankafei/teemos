// 覆写 XMLHttpRequest
window.XMLHttpRequest = class XMLHttpRequest extends window.XMLHttpRequest {
  constructor(...rest) {
    super(rest);
    this.addEventListener('loadstart', () => {});
    this.addEventListener('loadend', () => {});
    this.addEventListener('load', () => {});
    this.addEventListener('abort', () => {});
    this.addEventListener('error', (ev) => {
      console.log(ev);
    });
    this.addEventListener('timeout', () => {});
  }
}

// 覆写 fetch
window.fetch = async (...rest) => {
  try {
    return await window.fetch(rest);
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};
