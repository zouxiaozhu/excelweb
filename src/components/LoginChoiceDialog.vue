<template>
  <el-dialog
    v-model="visible"
    title="选择登录方式"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="login-choice-dialog"
  >
    <div class="choice-container">
      <!-- 体验账号登录选项 -->
      <div class="choice-card">
        <div class="choice-header">
          <div class="choice-icon experience">
            <el-icon><User /></el-icon>
          </div>
          <div class="choice-title">
            <h3>体验账号登录</h3>
            <p class="choice-subtitle">快速体验，无需注册</p>
          </div>
        </div>
        <div class="choice-content">
          <p>使用系统提供的体验账号，无需输入用户名和密码，直接进入系统体验功能。</p>
          <div class="warning-box">
            <el-icon class="warning-icon"><Warning /></el-icon>
            <div class="warning-content">
              <strong>重要提醒：</strong>
              <ul>
                <li>体验账号数据仅用于测试</li>
                <li>使用完毕后请及时删除测试数据</li>
                <li>建议不要使用真实数据进行测试</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="choice-footer">
          <el-button type="primary" :loading="experienceLoading" @click="handleExperienceLogin">
            立即体验
          </el-button>
        </div>
      </div>

      <!-- 分割线 -->
      <div class="divider">
        <span>或</span>
      </div>

      <!-- 正常登录选项 -->
      <div class="choice-card">
        <div class="choice-header">
          <div class="choice-icon normal">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="choice-title">
            <h3>使用自己的账号</h3>
            <p class="choice-subtitle">安全可靠，数据持久</p>
          </div>
        </div>
        <div class="choice-content">
          <p>使用您自己的账号登录，享受完整的个人数据管理和功能体验。</p>
          <div class="benefit-list">
            <div class="benefit-item">
              <el-icon class="benefit-icon"><CircleCheck /></el-icon>
              <span>数据安全加密存储</span>
            </div>
            <div class="benefit-item">
              <el-icon class="benefit-icon"><CircleCheck /></el-icon>
              <span>个人数据持久保存</span>
            </div>
            <div class="benefit-item">
              <el-icon class="benefit-icon"><CircleCheck /></el-icon>
              <span>完整功能体验</span>
            </div>
          </div>
        </div>
        <div class="choice-footer">
          <el-button type="default" @click="handleNormalLogin">
            登录/注册
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
/**
 * @component LoginChoiceDialog
 * @description 登录选择对话框，提供体验账号和正常登录两个选项
 */

import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  User,
  UserFilled,
  Warning,
  CircleCheck
} from '@element-plus/icons-vue'
import { useGlobalStore } from '../store'

const globalStore = useGlobalStore()

// Props
interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'login-success'): void
  (e: 'show-normal-login'): void
}

const emit = defineEmits<Emits>()

// 响应式数据
const experienceLoading = ref(false)

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

/**
 * 处理体验账号登录
 */
const handleExperienceLogin = async () => {
  try {
    experienceLoading.value = true
    
    const result = await globalStore.loginWithExperienceAccount()
    
    if (result.success) {
      ElMessage.success('体验账号登录成功')
      emit('login-success')
      visible.value = false
      
      // 体验账号提醒会通过全局组件自动显示
    } else {
      ElMessage.error(result.error || '体验账号登录失败')
    }
  } catch (error) {
    console.error('体验账号登录错误:', error)
    ElMessage.error('体验账号登录失败，请稍后重试')
  } finally {
    experienceLoading.value = false
  }
}

/**
 * 处理正常登录
 */
const handleNormalLogin = () => {
  visible.value = false
  emit('show-normal-login')
}
</script>

<style scoped>

.login-choice-dialog {
  top: -20px;
}
.login-choice-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.login-choice-dialog :deep(.el-dialog__header) {
  padding: 24px 24px 0;
  border-bottom: none;
}

.login-choice-dialog :deep(.el-dialog__title) {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.login-choice-dialog :deep(.el-dialog__body) {
  padding: 0 24px 24px;
}

.choice-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.choice-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
}

.choice-card:hover {
  border-color: #409eff;
  background: #f0f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
}

.choice-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.choice-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.choice-icon.experience {
  background: linear-gradient(135deg, #ff6b6b, #ffa500);
}

.choice-icon.normal {
  background: linear-gradient(135deg, #409eff, #67c23a);
}

.choice-icon .el-icon {
  font-size: 24px;
  color: white;
}

.choice-title h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px;
}

.choice-subtitle {
  font-size: 14px;
  color: #606266;
  margin: 0;
}

.choice-content {
  margin-bottom: 20px;
}

.choice-content p {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 16px;
}

.warning-box {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.warning-icon {
  color: #f39c12;
  font-size: 16px;
  margin-top: 2px;
  flex-shrink: 0;
}

.warning-content {
  flex: 1;
}

.warning-content strong {
  color: #d68910;
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
}

.warning-content ul {
  margin: 0;
  padding-left: 16px;
  color: #856404;
  font-size: 13px;
}

.warning-content li {
  margin-bottom: 2px;
}

.benefit-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}

.benefit-icon {
  color: #67c23a;
  font-size: 16px;
}

.choice-footer {
  display: flex;
  justify-content: center;
}

.choice-footer .el-button {
  min-width: 120px;
  height: 40px;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #909399;
  font-size: 14px;
  margin: 8px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e4e7ed;
}

.divider span {
  padding: 0 16px;
  background: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-choice-dialog :deep(.el-dialog) {
    width: 90% !important;
    margin: 20px auto;
  }
  
  .choice-container {
    gap: 16px;
  }
  
  .choice-card {
    padding: 16px;
  }
  
  .choice-header {
    gap: 12px;
  }
  
  .choice-icon {
    width: 40px;
    height: 40px;
  }
  
  .choice-icon .el-icon {
    font-size: 20px;
  }
  
  .choice-title h3 {
    font-size: 16px;
  }
}
</style>
