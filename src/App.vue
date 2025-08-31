<template>
  <div id="app">
    <TopStatusBar v-if="showTopStatusBar" />
    <main class="main-content" :class="{ 'no-header': !showTopStatusBar }">
      <router-view />
    </main>
    <Footer v-if="showFooter" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TopStatusBar from './components/TopStatusBar.vue'
import Footer from './components/Footer.vue'

const route = useRoute()

// 根据路由决定是否显示顶部状态栏和底部
const showTopStatusBar = computed(() => {
  return route.name !== 'ExcelSearch'
})

const showFooter = computed(() => {
  return route.name !== 'ExcelSearch'
})
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

.main-content.no-header {
  padding-top: 0; /* 没有头部时不需要顶部间距 */
}
</style>
