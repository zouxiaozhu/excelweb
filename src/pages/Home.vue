<template>
  <div class="home-page">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <el-icon class="logo-icon"><Document /></el-icon>
            <span class="logo-text">Excel Web</span>
          </div>
          <nav class="nav-menu">
            <a href="#features" class="nav-item">功能特性</a>
            <a href="#stats" class="nav-item">使用统计</a>
            <a href="#about" class="nav-item">关于我们</a>
          </nav>
          <div class="nav-auth">
            <!-- 未登录状态 -->
            <el-button v-if="!isLoggedIn" type="primary" @click="showAuthModal = true">
              <el-icon><User /></el-icon>
              登录/注册
            </el-button>
            
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

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="container">


        <!-- 功能特性区域 -->
        <section id="features" class="features-section">
          <div class="section-header">
            <h2>核心功能</h2>
            <p>强大的工具，满足您的各种数据处理需求</p>
          </div>
          
          <div class="features-grid">
            <!-- 表格快查卡片 -->
            <div class="feature-card" @click="goToExcelQuery">
              <div class="card-header">
                <div class="card-icon">
                  <el-icon><Search /></el-icon>
                </div>
                <h3 class="card-title">表格快查</h3>
              </div>
              <div class="card-content">
                <p>快速上传Excel文件，智能解析表格内容，支持数据预览和详细查看。提供强大的搜索和筛选功能。</p>
                <div class="card-tags">
                  <span class="tag">Excel解析</span>
                  <span class="tag">数据预览</span>
                  <span class="tag">智能搜索</span>
                </div>
              </div>
              <div class="card-arrow">
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>

            <!-- Excel转Word卡片 -->
            <div class="feature-card" @click="goToExcelToWord">
              <div class="card-header">
                <div class="card-icon">
                  <el-icon><Document /></el-icon>
                </div>
                <h3 class="card-title">Excel批量转Word</h3>
              </div>
              <div class="card-content">
                <p>将Excel文件批量转换为Word文档，支持自定义模板和格式设置。高效处理大量文件转换需求。</p>
                <div class="card-tags">
                  <span class="tag">批量转换</span>
                  <span class="tag">自定义模板</span>
                  <span class="tag">高效处理</span>
                </div>
              </div>
              <div class="card-arrow">
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </section>

        <!-- 使用统计区域 -->
        <section id="stats" class="stats-section">
          <div class="section-header">
            <h2>平台数据</h2>
            <p>值得信赖的数据处理平台</p>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">1,234</div>
                <div class="stat-label">文件处理总数</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">567</div>
                <div class="stat-label">今日处理</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">89</div>
                <div class="stat-label">在线用户</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">99.9%</div>
                <div class="stat-label">服务可用率</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 关于我们区域 -->
        <section id="about" class="about-section">
          <div class="section-header">
            <h2>关于我们</h2>
            <p>专业的团队，优质的服务</p>
          </div>
          
          <div class="about-content">
            <div class="about-text">
              <p>
                Excel Web 工具是一个专业的在线Excel文件处理平台，致力于为用户提供高效、便捷的表格数据处理服务。
                我们的团队拥有丰富的数据处理经验，专注于为企业和个人用户提供最优质的文档处理解决方案。
              </p>
            </div>
            
            <div class="features-highlight">
              <div class="highlight-item">
                <div class="highlight-icon">
                  <el-icon><Lightning /></el-icon>
                </div>
                <div class="highlight-content">
                  <h4>高效处理</h4>
                  <p>快速处理大量数据，提升工作效率</p>
                </div>
              </div>
              <div class="highlight-item">
                <div class="highlight-icon">
                  <el-icon><CircleCheck /></el-icon>
                </div>
                <div class="highlight-content">
                  <h4>安全可靠</h4>
                  <p>数据安全加密，保护您的隐私</p>
                </div>
              </div>
              <div class="highlight-item">
                <div class="highlight-icon">
                  <el-icon><Star /></el-icon>
                </div>
                <div class="highlight-content">
                  <h4>专业服务</h4>
                  <p>7x24小时技术支持服务</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- 二合一登录注册弹框 -->
    <AuthModal
      v-model="showAuthModal"
      @login-success="handleLoginSuccess"
    />

    <!-- 登录选择对话框 -->
    <LoginChoiceDialog
      v-model="showLoginChoiceDialog"
      @login-success="handleLoginSuccess"
      @show-normal-login="handleShowNormalLogin"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * @component Home
 * @description 首页组件，展示两个主要功能入口：表格快查和Excel转Word
 * 
 * @dependencies
 * @store globalStore - 全局状态管理
 * @router - 页面路由导航
 */

import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  Document,
  DataAnalysis,
  InfoFilled,
  Lightning,
  CircleCheck,
  Star,
  ArrowRight,
  TrendCharts,
  User,
  ArrowDown,
  SwitchButton
} from '@element-plus/icons-vue'
import { useGlobalStore } from '../store'
import AuthModal from '../components/AuthModal.vue'
import LoginChoiceDialog from '../components/LoginChoiceDialog.vue'

const router = useRouter()
const globalStore = useGlobalStore()

// 响应式数据
const showAuthModal = ref(false)
const showLoginChoiceDialog = ref(false)

// 计算属性 - 从全局状态获取登录信息
const isLoggedIn = computed(() => globalStore.isLoggedIn)
const isExperienceAccount = computed(() => globalStore.isExperienceAccount)
const userAvatar = computed(() => globalStore.userAvatar)

// 显示名称：优先显示昵称，如果没有则显示用户名
const displayName = computed(() => {
  const nickName = globalStore.userInfo?.nickName
  return nickName || globalStore.username
})

// 当前模式
const currentMode = computed({
  get: () => globalStore.mode,
  set: (value: 'preview' | 'practical') => {
    globalStore.mode = value
  }
})

// 预览模式文案
const previewModeText = computed(() => {
  return '使用默认体验账号'
})

// 实用模式文案
const practicalModeText = computed(() => {
  if (!isLoggedIn.value) {
    return '立即登录使用'
  } else if (isExperienceAccount.value) {
    return '立即登录使用'
  } else {
    return '已登录，完整功能'
  }
})

/**
 * 模式切换处理
 */
const handleModeChange = (mode: 'preview' | 'practical') => {
  console.log('切换到模式:', mode)
  
  if (mode === 'practical') {
    // 实用模式：检查登录状态
    if (!isLoggedIn.value || isExperienceAccount.value) {
      // 触发登录流程
      handleLogin()
    }
  }
}

/**
 * 处理登录
 */
const handleLogin = () => {
  // 这里应该调用实际的登录逻辑
  console.log('触发登录流程')
  // 模拟登录成功
  // isLoggedIn.value = true
  // isExperienceAccount.value = false
}

/**
 * 跳转到表格快查页面
 */
const goToExcelQuery = () => {
  if (!isLoggedIn.value) {
    showLoginChoiceDialog.value = true
  } else {
    router.push('/excel-query')
  }
}

/**
 * 跳转到Excel转Word页面
 */
const goToExcelToWord = () => {
  if (!isLoggedIn.value) {
    showLoginChoiceDialog.value = true
  } else {
    router.push('/excel-to-word')
  }
}

/**
 * 处理登录成功
 */
const handleLoginSuccess = () => {
  // 登录成功后可以执行一些操作
  console.log('登录成功')
}

/**
 * 处理显示正常登录
 */
const handleShowNormalLogin = () => {
  showAuthModal.value = true
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
/* 全局样式 */
.home-page {
  min-height: 100vh;
  background: #ffffff;
  color: #2c3e50;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 顶部导航栏 */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e4e7ed;
  z-index: 1000;
  padding: 16px 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #409eff;
}

.logo-icon {
  font-size: 24px;
}

.nav-menu {
  display: flex;
  gap: 32px;
}

.nav-item {
  color: #606266;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-item:hover {
  color: #409eff;
}

.nav-auth {
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

/* 主要内容区域 */
.main-content {
  padding-top: 120px;
}



/* 区域标题 */
.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-header h2 {
  font-size: 36px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 16px;
}

.section-header p {
  font-size: 18px;
  color: #606266;
  line-height: 1.6;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 32px;
}

.feature-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #e4e7ed;
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: #409eff;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.card-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon .el-icon {
  font-size: 24px;
  color: white;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}



.card-content p {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 24px;
}

.card-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  padding: 4px 12px;
  background: #f0f9ff;
  color: #409eff;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.card-arrow {
  position: absolute;
  top: 32px;
  right: 32px;
  color: #c0c4cc;
  transition: all 0.3s ease;
}

.feature-card:hover .card-arrow {
  color: #409eff;
  transform: translateX(4px);
}

/* 统计区域 */
.stats-section {
  padding: 80px 0;
  background: #f8f9fa;
  margin: 0 -24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.stat-icon .el-icon {
  font-size: 32px;
  color: white;
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  color: #606266;
  font-size: 16px;
}

/* 关于我们区域 */
.about-section {
  padding: 80px 0;
}

.about-content {
  max-width: 800px;
  margin: 0 auto;
}

.about-text {
  text-align: center;
  margin-bottom: 60px;
}

.about-text p {
  font-size: 18px;
  color: #606266;
  line-height: 1.8;
}

.features-highlight {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
}

.highlight-item {
  text-align: center;
  padding: 32px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.highlight-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.highlight-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.highlight-icon .el-icon {
  font-size: 32px;
  color: white;
}

.highlight-content h4 {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.highlight-content p {
  color: #606266;
  line-height: 1.6;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .hero-title {
    font-size: 32px;
  }
  
  .hero-subtitle {
    font-size: 16px;
  }
  
  .section-header h2 {
    font-size: 28px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
  
  .features-highlight {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  

  
  .nav-menu {
    display: none;
  }
  
  .username {
    max-width: 60px;
  }
}
</style>
