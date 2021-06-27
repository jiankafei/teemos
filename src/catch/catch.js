window.addEventListener('error', (ev) => {
  console.log(ev);
});

window.addEventListener('unhandledrejection', (ev) => {
  console.log(ev);
});

// 跨域脚本错误捕获
// 1. crossorigin
// 2. Access-Control-Origin:*
