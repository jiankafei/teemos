// 覆写 XMLHttpRequest
class XHR extends XMLHttpRequest {
  constructor(...rest) {
    super(rest);
    this.addEventListener('loadstart', () => {});
    this.addEventListener('loadend', () => {});
    this.addEventListener('load', () => {});
    this.addEventListener('abort', () => {});
    this.addEventListener('error', () => {});
    this.addEventListener('timeout', () => {});
  }
}

window.XMLHttpRequest = XHR;

// 覆写 fetch
window.fetch = async (...rest) => {
  try {
    return await window.fetch(rest);
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};
