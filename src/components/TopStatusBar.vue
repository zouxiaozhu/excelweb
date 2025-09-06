<template>
  <header class="top-status-bar">
    <div class="container">
      <div class="status-bar-content">
        <!-- 左侧：Logo和导航 -->
        <div class="left-section">
          <div class="logo" @click="goHome">
            <el-icon class="logo-icon"><Document /></el-icon>
            <span class="logo-text">Excel Web</span>
          </div>
          <nav class="nav-menu">
            <router-link to="/" class="nav-item">首页</router-link>
            <router-link to="/excel-query" class="nav-item">表格快查</router-link>
            <router-link to="/excel-to-word" class="nav-item">Excel转Word</router-link>
          </nav>
          
          <!-- 移动端汉堡菜单 -->
          <div class="mobile-menu-toggle" @click="toggleMobileMenu">
            <el-icon class="menu-icon"><Menu /></el-icon>
          </div>
        </div>

        <!-- 右侧：用户状态 -->
        <div class="right-section">
          <!-- 体验账号提示 -->
          <div v-if="isExperienceAccount" class="experience-badge">
            <el-tag type="warning" size="small">
              <el-icon><Warning /></el-icon>
              体验账号
            </el-tag>
          </div>

          <!-- 未登录状态 -->
          <div v-if="!isLoggedIn" class="auth-actions">
            <el-button type="primary" @click="handleShowAuthModal">
              <el-icon><User /></el-icon>
              登录/注册
            </el-button>
          </div>
          
          <!-- 已登录状态 -->
          <div v-else class="user-info">
            <el-dropdown @command="handleUserCommand">
              <div class="user-avatar">
                <el-avatar :size="32" :src="userAvatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="username">{{ displayName }}</span>
                <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="!isExperienceAccount" command="profile">
                    <el-icon><User /></el-icon>
                    个人资料
                  </el-dropdown-item>
                  <el-dropdown-item command="logout" divided>
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端菜单 -->
    <div v-if="showMobileMenu" class="mobile-menu">
      <div class="mobile-menu-content">
        <router-link to="/" class="mobile-nav-item" @click="closeMobileMenu">
          <el-icon><HomeFilled /></el-icon>
          首页
        </router-link>
        <router-link to="/excel-query" class="mobile-nav-item" @click="closeMobileMenu">
          <el-icon><Document /></el-icon>
          表格快查
        </router-link>
        <router-link to="/excel-to-word" class="mobile-nav-item" @click="closeMobileMenu">
          <el-icon><Document /></el-icon>
          Excel转Word
        </router-link>
      </div>
    </div>

  </header>

  <!-- 二合一登录注册弹框 -->
  <AuthModal
    v-model="showAuthModal"
    @login-success="handleLoginSuccess"
  />
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  User,
  ArrowDown,
  SwitchButton,
  Warning,
  Menu,
  HomeFilled
} from '@element-plus/icons-vue'
import { useGlobalStore } from '@/store'
import AuthModal from './AuthModal.vue'

const router = useRouter()
const globalStore = useGlobalStore()

// 响应式数据
const showAuthModal = ref(false)
const showMobileMenu = ref(false)

// 计算属性 - 从全局状态获取登录信息
const isLoggedIn = computed(() => globalStore.isLoggedIn)
const isExperienceAccount = computed(() => globalStore.isExperienceAccount)
const userAvatar = computed(() => globalStore.userAvatar)

// 显示名称：优先显示昵称，如果没有则显示用户名
const displayName = computed(() => {
  const nickName = globalStore.userInfo?.nickName
  return nickName || globalStore.username
})

/**
 * 跳转到首页
 */
const goHome = () => {
  router.push('/')
}

/**
 * 显示登录弹框
 */
const handleShowAuthModal = () => {
  showAuthModal.value = true
}

/**
 * 处理登录成功
 */
const handleLoginSuccess = () => {
  showAuthModal.value = false
}

/**
 * 处理用户下拉菜单命令
 */
const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/user-profile')
      break
    case 'logout':
      ElMessageBox.confirm(
        '确定要退出登录吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        globalStore.logout()
        ElMessage.success('已退出登录')
      }).catch(() => {
        // 用户取消
      })
      break
  }
}

/**
 * 切换移动端菜单显示状态
 */
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

/**
 * 关闭移动端菜单
 */
const closeMobileMenu = () => {
  showMobileMenu.value = false
}

/**
 * 处理点击外部区域关闭菜单
 */
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (showMobileMenu.value && !target.closest('.mobile-menu') && !target.closest('.mobile-menu-toggle')) {
    closeMobileMenu()
  }
}

// 组件挂载时添加事件监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.top-status-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e4e7ed;
  z-index: 1000;
  padding: 12px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.status-bar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 40px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
  cursor: pointer;
  transition: color 0.3s ease;
}

.logo:hover {
  color: #337ecc;
}

.logo-icon {
  font-size: 20px;
}

.nav-menu {
  display: flex;
  gap: 24px;
}

.nav-item {
  color: #606266;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  transition: color 0.3s ease;
  padding: 4px 8px;
  border-radius: 4px;
}

.nav-item:hover {
  color: #409eff;
  background-color: #f0f9ff;
}

.nav-item.router-link-active {
  color: #409eff;
  background-color: #f0f9ff;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.experience-badge {
  display: flex;
  align-items: center;
}

.auth-actions {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.user-avatar:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #606266;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  font-size: 12px;
  color: #c0c4cc;
}

/* 移动端菜单样式 */
.mobile-menu-toggle {
  display: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.mobile-menu-toggle:hover {
  background-color: #f5f7fa;
}

.menu-icon {
  font-size: 18px;
  color: #606266;
}

.mobile-menu {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mobile-menu-content {
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #606266;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.mobile-nav-item:hover {
  color: #409eff;
  background-color: #f0f9ff;
}

.mobile-nav-item.router-link-active {
  color: #409eff;
  background-color: #f0f9ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .left-section {
    gap: 20px;
  }
  
  .nav-menu {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: block;
  }
  
  .username {
    max-width: 60px;
  }
  
  .experience-badge {
    display: none;
  }
}

@media (max-width: 480px) {
  .logo-text {
    display: none;
  }
  
  .username {
    display: none;
  }
}
</style>
