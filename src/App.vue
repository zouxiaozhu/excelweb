<template>
  <div id="app">
    <TopStatusBar />
    <main class="main-content">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import TopStatusBar from './components/TopStatusBar.vue'
import Footer from './components/Footer.vue'
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 60px; /* 为顶部状态栏留出空间 */
}
</style>
