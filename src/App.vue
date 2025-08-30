<template>
  <div id="app">
    <router-view />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Footer from './components/Footer.vue'
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
