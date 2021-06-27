// 覆写 XMLHttpRequest

// one
window.XMLHttpRequest = class XMLHttpRequest extends window.XMLHttpRequest {
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

// two ???
const OriginXMLHttpRequest = window.XMLHttpRequest;
window.XMLHttpRequest = class XMLHttpRequest {
  constructor(...rest) {
    const xhr = Reflect.construct(OriginXMLHttpRequest, rest);
    xhr.addEventListener('loadstart', () => {});
    xhr.addEventListener('loadend', () => {});
    xhr.addEventListener('load', () => {});
    xhr.addEventListener('abort', () => {});
    xhr.addEventListener('error', (ev) => {
      console.log(ev);
    });
    xhr.addEventListener('timeout', () => {});
    return xhr;
  }
};

OriginXMLHttpRequest.prototype.construct = XMLHttpRequest;
Reflect.setPrototypeOf(XMLHttpRequest, OriginXMLHttpRequest.prototype);

// 覆写 fetch
window.fetch = async (...rest) => {
  try {
    return await window.fetch(rest);
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};
