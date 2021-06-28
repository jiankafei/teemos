// 覆写 XMLHttpRequest

// 方案1
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

// 方案2
const OriginXMLHttpRequest = window.XMLHttpRequest;

window.XMLHttpRequest = function XMLHttpRequest(...rest) {
  OriginXMLHttpRequest.apply(this, rest);
  this.addEventListener('loadstart', () => {});
  this.addEventListener('loadend', () => {});
  this.addEventListener('load', () => {});
  this.addEventListener('abort', () => {});
  this.addEventListener('error', (ev) => {
    console.log(ev);
  });
  this.addEventListener('timeout', () => {});
};

Reflect.setPrototypeOf(XMLHttpRequest, Object.create(OriginXMLHttpRequest.prototype));
XMLHttpRequest.prototype.construct = XMLHttpRequest;

// 覆写 fetch
window.fetch = async (...rest) => {
  try {
    return await window.fetch(rest);
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};
