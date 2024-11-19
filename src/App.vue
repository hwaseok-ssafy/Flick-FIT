<template>
  <div id="app">
    <!-- 라우터 출력 -->
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
/* 글로벌 스타일 */
#app {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  height: 100vh;
  background-color: #f5f5f5;
}
</style>
