// 覆写 XMLHttpRequest

const methodSymbol = Symbol('method');
const urlSymbol = Symbol('url');

const originOpen = window.XMLHttpRequest.prototype.open;
window.XMLHttpRequest.prototype.open = function(...rest) {
  const [method, url] = rest;
  this[methodSymbol] = method;
  this[urlSymbol] = url;
  originOpen.apply(this, rest);
};
window.XMLHttpRequest = class XMLHttpRequest extends window.XMLHttpRequest {
  constructor(...rest) {
    super(rest);
    console.log(this);
    this.addEventListener('loadstart', () => {});
    this.addEventListener('abort', () => {});
    this.addEventListener('error', (ev) => {
      console.log(ev);
    });
    this.addEventListener('timeout', () => {});
    this.addEventListener('load', () => {});
    this.addEventListener('loadend', () => {});
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
