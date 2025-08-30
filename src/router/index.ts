import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/Home.vue'),
    meta: {
      title: '首页 - Excel Web'
    }
  },
  {
    path: '/excel-query',
    name: 'ExcelQuery',
    component: () => import('../pages/ExcelQuery.vue'),
    meta: {
      title: '表格快查 - Excel Web'
    }
  },
  {
    path: '/excel-to-word',
    name: 'ExcelToWord',
    component: () => import('../pages/ExcelToWord.vue'),
    meta: {
      title: 'Excel转Word - Excel Web'
    }
  },
  {
    path: '/user-profile',
    name: 'UserProfile',
    component: () => import('../pages/UserProfile.vue'),
    meta: {
      title: '个人资料 - Excel Web'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 设置页面标题和登录检查
router.beforeEach((to, _from, next) => {
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }

  // 检查是否需要登录的页面
  const requiresAuth = ['ExcelQuery', 'ExcelToWord', 'UserProfile']

  if (requiresAuth.includes(to.name as string)) {
    // 这里只是设置标题，实际的登录检查会在组件中进行
    // 因为我们需要显示登录选择对话框而不是直接跳转
  }

  next()
})

export default router
