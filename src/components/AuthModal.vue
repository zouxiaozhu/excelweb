<template>
  <el-dialog
    v-model="visible"
    :title="null"
    width="400px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    append-to-body
    class="auth-modal"
  >
    <div class="auth-container">
      <!-- 应用图标和标题 -->
      <div class="auth-header">
        <div class="app-icon">
          <el-icon><Document /></el-icon>
        </div>
        <h1 class="app-title">Excel管理系统</h1>
        <p class="auth-subtitle">{{ isLogin ? '请登录您的账户' : '创建新账户' }}</p>
      </div>

      <!-- 登录表单 -->
      <el-form
        v-if="isLogin"
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="auth-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <div class="form-options">
          <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
          <a href="#" class="forgot-link">忘记密码?</a>
        </div>

        <el-button
          type="primary"
          size="large"
          class="auth-button"
          :loading="loginLoading"
          @click="handleLogin"
        >
          登录
        </el-button>
      </el-form>

      <!-- 注册表单 -->
      <el-form
        v-else
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="auth-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名 (必填)"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱 (必填)"
            size="large"
            :prefix-icon="Message"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item prop="nickName">
          <el-input
            v-model="registerForm.nickName"
            placeholder="请输入昵称 (可选)"
            size="large"
            :prefix-icon="UserFilled"
          />
        </el-form-item>
        
        <el-form-item prop="mobile">
          <el-input
            v-model="registerForm.mobile"
            placeholder="请输入手机号 (可选)"
            size="large"
            :prefix-icon="Phone"
          />
        </el-form-item>

        <div class="form-options">
          <el-checkbox v-model="registerForm.rememberMe">记住密码</el-checkbox>
        </div>

        <el-button
          type="primary"
          size="large"
          class="auth-button"
          :loading="registerLoading"
          @click="handleRegister"
        >
          立即注册
        </el-button>
      </el-form>

      <!-- 切换模式 -->
      <div class="auth-switch">
        <span>{{ isLogin ? '没有账户?' : '已有账户?' }}</span>
        <a href="#" @click="toggleMode">
          {{ isLogin ? '立即注册' : '立即登录' }}
        </a>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
/**
 * @component AuthModal
 * @description 二合一登录注册弹框组件
 */

import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  User,
  UserFilled,
  Lock,
  Message,
  Phone,
  Document
} from '@element-plus/icons-vue'
import { useGlobalStore } from '../store'
import { authApiService } from '../services/authApi'

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
}

const emit = defineEmits<Emits>()

// 响应式数据
const isLogin = ref(true)
const loginLoading = ref(false)
const registerLoading = ref(false)

// 表单引用
const loginFormRef = ref()
const registerFormRef = ref()

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 登录表单
const loginForm = reactive({
  username: 'admin',
  password: '',
  rememberMe: true
})

// 注册表单
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  nickName: '',
  mobile: '',
  rememberMe: false
})

// 登录验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 注册验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度3-20位', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字、下划线', trigger: 'blur' },
    {
      validator: async (rule: any, value: string, callback: Function) => {
        if (value && value.length >= 3) {
          try {
            const response = await authApiService.checkUserName(value)
            if (response.data) {
              callback(new Error('用户名已存在'))
            } else {
              callback()
            }
          } catch (error) {
            callback()
          }
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
    {
      validator: async (rule: any, value: string, callback: Function) => {
        if (value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          try {
            const response = await authApiService.checkEmail(value)
            if (response.data) {
              callback(new Error('邮箱已被使用'))
            } else {
              callback()
            }
          } catch (error) {
            callback()
          }
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { 
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message: '密码必须包含大小写字母、数字和特殊字符，且长度至少8位',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

/**
 * 切换登录/注册模式
 */
const toggleMode = () => {
  isLogin.value = !isLogin.value
  // 重置表单
  if (isLogin.value) {
    loginForm.username = 'admin'
    loginForm.password = ''
    loginForm.rememberMe = true
  } else {
    registerForm.username = ''
    registerForm.email = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
    registerForm.nickName = ''
    registerForm.mobile = ''
    registerForm.rememberMe = false
  }
}

/**
 * 处理登录
 */
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loginLoading.value = true
    
    const result = await globalStore.loginWithUserAccount(
      loginForm.username,
      loginForm.password
    )
    
    if (result.success) {
      ElMessage.success('登录成功')
      emit('login-success')
      visible.value = false
      // 重置表单
      loginForm.username = 'admin'
      loginForm.password = ''
    } else {
      ElMessage.error(result.error || '登录失败')
    }
  } catch (error) {
    console.error('登录错误:', error)
  } finally {
    loginLoading.value = false
  }
}

/**
 * 处理注册
 */
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    await registerFormRef.value.validate()
    registerLoading.value = true
    
    const result = await globalStore.registerUser(
      registerForm.username,
      registerForm.email,
      registerForm.password,
      registerForm.confirmPassword,
      registerForm.nickName || registerForm.username
    )
    
    if (result.success) {
      ElMessage.success('注册成功，请登录')
      // 切换到登录模式
      isLogin.value = true
      loginForm.username = registerForm.username
      loginForm.password = ''
      // 重置注册表单
      registerForm.username = ''
      registerForm.email = ''
      registerForm.password = ''
      registerForm.confirmPassword = ''
      registerForm.nickName = ''
      registerForm.mobile = ''
    } else {
      ElMessage.error(result.error || '注册失败')
    }
  } catch (error) {
    console.error('注册错误:', error)
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped>
.auth-modal :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  margin-top: 50px !important;
}

.auth-modal :deep(.el-dialog__header) {
  display: none;
}

.auth-modal :deep(.el-dialog__body) {
  padding: 0;
}

.auth-container {
  padding: 40px;
  background: white;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.app-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.app-icon .el-icon {
  font-size: 32px;
  color: white;
}

.app-title {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px;
}

.auth-subtitle {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

.auth-form {
  margin-bottom: 24px;
}

.auth-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.auth-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  box-shadow: none;
}

.auth-form :deep(.el-input__wrapper:hover) {
  border-color: #409eff;
}

.auth-form :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.forgot-link {
  color: #409eff;
  text-decoration: none;
  font-size: 14px;
}

.forgot-link:hover {
  text-decoration: underline;
}

.auth-button {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
}

.auth-button:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.auth-switch {
  text-align: center;
  font-size: 14px;
  color: #7f8c8d;
}

.auth-switch a {
  color: #409eff;
  text-decoration: none;
  margin-left: 4px;
}

.auth-switch a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .auth-container {
    padding: 24px;
  }
  
  .app-icon {
    width: 48px;
    height: 48px;
  }
  
  .app-icon .el-icon {
    font-size: 24px;
  }
  
  .app-title {
    font-size: 20px;
  }
}
</style>
