<template>
  <div id="app">
    <div id="nav" @click="handleNavClick">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
      <button @click.stop="handleCapture">测试阻止冒泡</button>
      <a href="https://fanyi.baidu.com/">百度翻译</a>
    </div>
    <router-view/>
  </div>
</template>

<script>
export default {
  methods: {
    handleNavClick() {
      console.log('captured test');
    },
    handleCapture() {
      console.log('test');
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
