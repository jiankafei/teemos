<template>
  <div id="app">
    <div id="nav" @click.capture="handleNavCapture">
      <div @click="handleNav">
        <router-link to="/">Home</router-link> |
        <router-link to="/about">About</router-link> |
        <a href="/about">Link About</a>
      </div>
    </div>
    <div style="display: flex; justify-content: center;gap: 20px">
      <div class="el-button">测试className</div>
      <div data-bp-click>测试attrs</div>
      <div style="cursor: pointer">测试cursor: pointer</div>
      <div @click.capture="handleCapture">
        <div @click="handleBubble">
          <button @click.prevent="handlePrevent">测试阻止默认</button>
          <button @click.stop="handleStopBubble">测试阻止冒泡</button>
          <button @click.stop.prevent="handleStopPrevent">测试阻止冒泡和默认</button>
          <button @click="handleHasBubble">测试正常冒泡</button>
        </div>
      </div>
      <a href="https://fanyi.baidu.com/">百度翻译</a>
    </div>
    <router-view/>
  </div>
</template>

<script>
export default {
  methods: {
    handleNavCapture(ev) {
      console.log('Capture Nav', ev.defaultPrevented);
      setTimeout(() => {
        console.log(111);
      }, 10000);
    },
    handleNav(ev) {
      console.log('Nav', ev.defaultPrevented);
      setTimeout(() => {
        console.log('setTimeout Nav', 111);
      }, 10000);
    },
    handleCapture(ev) {
      console.log('Capture Delegate');
      console.log('Normal');
      console.log('prevent', ev.defaultPrevented);
      setTimeout(() => {
        console.log('Capture Timeout');
        console.log('prevent', ev.defaultPrevented);
      });
    },
    handleBubble(ev) {
      console.log('Bubble Delegate');
      console.log('Normal');
      console.log('prevent', ev.defaultPrevented);
      setTimeout(() => {
        console.log('Bubble Timeout');
        console.log('prevent', ev.defaultPrevented);
      });
    },
    handleStopBubble() {
      console.log('Stop Bubble');
    },
    handleHasBubble() {
      console.log('Has Bubble');
    },
    handleStopPrevent() {
      console.log('Stop Bubble & Prevent Default');
    },
    handlePrevent() {
      console.log('Prevent Default');
    },
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
