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

  </header>

  <!-- 二合一登录注册弹框 -->
  <AuthModal
    v-model="showAuthModal"
    @login-success="handleLoginSuccess"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  User,
  ArrowDown,
  SwitchButton,
  Warning
} from '@element-plus/icons-vue'
import { useGlobalStore } from '@/store'
import AuthModal from './AuthModal.vue'

const router = useRouter()
const globalStore = useGlobalStore()

// 响应式数据
const showAuthModal = ref(false)

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
