// 宏任务
window.queueMacrotask = (() => {
  if (window.MessageChannel.prototype && window.MessageChannel.prototype.constructor === window.MessageChannel) {
    const channel = new MessageChannel();
    const { port1, port2 } = channel;
    port1.start();
    return (fn) => {
      const handler = () => {
        typeof fn === 'function' && fn();
        port1.removeEventListener('message', handler, false);
      }
      port1.addEventListener('message', handler, false);
      port2.postMessage(null);
    }
  }
  return (fn) => {
    setTimeout(() => {
      typeof fn === 'function' && fn();
    });
  };
})();
