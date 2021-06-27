// api
// window.performance.getEntries();
// window.performance.getEntriesByName(name[, entryType]);
// window.performance.getEntriesByType(entryType);
// window.performance.mark(markName);
// window.performance.measure(measureName, startMarkName, endMarkName);
// window.performance.clearMarks([markName]);
// window.performance.clearMeasures([measureName])
// window.performance.clearResourceTimings();
// window.performance.now(); // 从当前文档生命周期开始到现在的时间戳
// window.performance.toJSON();

/**
 * 受跨域限制，默认entry的时间属性返回0
 * CORS:
 * 设置 Timing-Allow-Origin & origin[s]
 */

/**
 * entry 共有的属性
entryType // 资源类型
name // entry 名称
startTime // entry 开始时间
duration // entry 间隔时间
  // measure的duration为: 两个mark的间隔时间
  // navigation的duration为: startTime >- loadEventStart
 */

/**
 * resource entry 属性
initiatorType // 资源类型

// 资源连接属性
startTime // 在资源加载过程开始之前立即返回的时间
redirectStart // 重定向开始的时间
redirectEnd // 重定向结束的时间
domainLookupStart // DNS 查找开始的时间
domainLookupEnd // DNS 查找结束的时间
fetchStart // 跟踪和重定向处理(如果适用)，并在DNS查找之前的时间
connectStart // 开始建立连接的时间
secureConnectionStart // https开始建立连接的时间
connectEnd // 连接建立完成的时间
requestStart // 向服务器请求资源的时间
responseStart // 资源请求首包返回的时间
responseEnd // 资源全部接收完成的时间

nextHopProtocol // 网络协议
transferSize // 资源大小，包含响应头和响应体
encodedBodySize // 编码后的资源大小
decodedBodySize // 解码后的资源大小
 */

/**
 * navigation entry 属性
initiatorType // navigation
type // navigate, reload, back_forward, prerender
unloadEventStart // 前一个文档卸载开始的时间，同域则返回卸载开始时间戳，不同域或者没有前文档则返回0
unloadEventEnd // 前一个文档卸载完成的时间
domLoading //  Document.readyState 为 loading
domInteractive // DOM可交互之前的时间，DOM树解析完毕
domContentLoadedEventStart // DOMContentLoaded 开始的时间，开始加载资源
domContentLoadedEventEnd // DOMContentLoaded 结束的时间，资源加载完毕
domComplete // Document.readyState 为 complete 的时间
loadEventStart // load 事件开始的时间
loadEventEnd // load 事件结束的时间

redirectCount // 重定向次数
...resource entry 属性
 */


/**
 * 整个加载时间线
startTime
redirectStart
redirectEnd
fetchStart
domainLookupStart
domainLookupEnd
connectStart
secureConnectionStart
connectEnd
requestStart
responseStart
responseEnd
domLoading
domInteractive
domContentLoadedEventStart
domContentLoadedEventEnd
domComplete
loadEventStart
loadEventEnd
 */


// entryType
(() => {
// navigation
// resource
// paint
// mark
// measure

  // 导航 entries
  window.performance.getEntriesByType('navigation');

  // 渲染 entries
  // 整体获取
  window.performance.getEntriesByType('paint');
  // 单独获取
  window.performance.getEntriesByName('first-paint');
  window.performance.getEntriesByName('first-contentful-paint');

  // 资源 entries
  window.performance.getEntriesByType('resource');
})();


// 自定义 entry
(() => {
  const do_work = () => {};

  performance.mark('mark-A');
  do_work(50000);
  performance.mark('mark-B');

  performance.mark('mark-C');
  do_work(50000);
  performance.mark('mark-D');

  // Create some measures
  performance.measure('measure-1', 'mark-A', 'mark-B');
  performance.measure('measure-2', 'mark-C', 'mark-D');

  performance.clearMarks();
  performance.clearMeasures();
})();


// resource 资源分类
(() => {
  const entries = window.performance.getEntriesByType('resource');
  const entriesMap = new Map();
  entries.forEach((entry) => {
    const initiatorType = entry.initiatorType;
    if (!entriesMap.has(initiatorType)) {
      entriesMap.set(initiatorType, new Set());
    }
    const entrySet = entriesMap.get(initiatorType);
    entrySet.add(entry);
  });

  console.log(entriesMap.keys());
})();


// entryType initiatorType 双重维度资源分类
(() => {
  const entries = window.performance.getEntries();
  const entriesMap = new Map();

  entries.forEach((entry) => {
    const entryType = entry.entryType;
    const initiatorType = entry.initiatorType;

    if (!entriesMap.has(entryType)) {
      if (initiatorType) {
        // resource entry
        entriesMap.set(entryType, new Map());
      } else {
        // other entry
        entriesMap.set(entryType, new Set());
      }
    }

    if (initiatorType) {
      const entryTypeMap = entriesMap.get(entryType);
      if (!entryTypeMap.has(initiatorType)) {
        entryTypeMap.set(initiatorType, new Set());
      }
      const entryInitTypeSet = entryTypeMap.get(initiatorType);
      entryInitTypeSet.add(entry);
    } else {
      const entryTypeSet = entriesMap.get(entryType);
      entryTypeSet.add(entry);
    }
  });

  console.log(entriesMap.keys());
})();
