import Vue from 'vue'
import App from './App.vue'
import router from './router'
import teemos from 'teemos';

teemos.init({
  dsn: 'http://www.exp.com/dsn',
  click_attr_trace: ['data-bp-click'],
  click_class_trace: ['el-button'],
  log: true,
});

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
