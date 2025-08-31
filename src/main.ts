import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import App from './App.vue'
import './assets/styles/global.css'
import { getAppTitle } from './utils/env'

console.log('Starting app initialization...')

const app = createApp(App)

// 错误处理
app.config.errorHandler = (err, instance, info) => {
    console.error('Vue Error:', err)
    console.log('Error Instance:', instance)
    console.log('Error Info:', info)
}

// 警告处理
app.config.warnHandler = (msg, instance, trace) => {
    console.warn('Vue Warning:', msg)
    console.log('Warning Instance:', instance)
    console.log('Warning Trace:', trace)
}

console.log('Registering Element Plus icons...')
// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

console.log('Installing plugins...')
const pinia = createPinia()
app.use(pinia)
app.use(ElementPlus, {
    locale: zhCn,
})
app.use(router)

console.log('Mounting app...')
app.mount('#app')

// 初始化用户状态
import { useGlobalStore } from './store'
const globalStore = useGlobalStore()
globalStore.initUserState().catch(error => {
    console.error('初始化用户状态失败:', error)
})

// 设置应用标题
document.title = getAppTitle()

console.log('App initialization completed.')
console.log('Environment:', import.meta.env.NODE_ENV)
console.log('App Title:', getAppTitle())
