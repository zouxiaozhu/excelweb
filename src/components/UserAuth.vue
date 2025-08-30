<template>
  <div class="user-auth">
    <!-- 未登录状态 -->
    <div v-if="!isLoggedIn" class="auth-buttons">
      <el-button type="primary" @click="showLoginDialog = true">
        <el-icon><User /></el-icon>
        登录
      </el-button>
      <el-button @click="showRegisterDialog = true">
        <el-icon><UserFilled /></el-icon>
        注册
      </el-button>
    </div>

    <!-- 已登录状态 -->
    <div v-else class="user-info">
      <el-dropdown @command="handleCommand">
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

    <!-- 登录对话框 -->
    <el-dialog
      v-model="showLoginDialog"
      title="用户登录"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            clearable
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showLoginDialog = false">取消</el-button>
          <el-button type="primary" @click="handleLogin" :loading="loginLoading">
            登录
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 注册对话框 -->
    <el-dialog
      v-model="showRegisterDialog"
      title="用户注册"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱"
            clearable
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            clearable
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
            clearable
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showRegisterDialog = false">取消</el-button>
          <el-button type="primary" @click="handleRegister" :loading="registerLoading">
            注册
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
/**
 * @component UserAuth
 * @description 用户认证组件，包含登录、注册和用户信息显示
 */

import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
  UserFilled,
  ArrowDown,
  SwitchButton
} from '@element-plus/icons-vue'
import { useGlobalStore } from '../store'
import { authApiService } from '../services/authApi'

const router = useRouter()
const globalStore = useGlobalStore()

// 响应式数据
const showLoginDialog = ref(false)
const showRegisterDialog = ref(false)
const loginLoading = ref(false)
const registerLoading = ref(false)

// 登录表单
const loginForm = reactive({
  username: '',
  password: ''
})

// 注册表单
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 表单引用
const loginFormRef = ref()
const registerFormRef = ref()

// 计算属性
const isLoggedIn = computed(() => globalStore.isLoggedIn)
const username = computed(() => globalStore.username)
const userAvatar = computed(() => globalStore.userAvatar)
const isExperienceAccount = computed(() => globalStore.isExperienceAccount)

// 显示名称：优先显示昵称，如果没有则显示用户名
const displayName = computed(() => {
  const nickName = globalStore.userInfo?.nickName
  return nickName || username.value
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

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
      showLoginDialog.value = false
      // 重置表单
      loginForm.username = ''
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
      registerForm.username
    )
    
    if (result.success) {
      ElMessage.success('注册成功，请登录')
      showRegisterDialog.value = false
      showLoginDialog.value = true
      // 重置表单
      registerForm.username = ''
      registerForm.email = ''
      registerForm.password = ''
      registerForm.confirmPassword = ''
    } else {
      ElMessage.error(result.error || '注册失败')
    }
  } catch (error) {
    console.error('注册错误:', error)
  } finally {
    registerLoading.value = false
  }
}

/**
 * 处理下拉菜单命令
 */
const handleCommand = (command: string) => {
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
.user-auth {
  display: flex;
  align-items: center;
}

.auth-buttons {
  display: flex;
  gap: 12px;
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

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .auth-buttons {
    gap: 8px;
  }
  
  .auth-buttons .el-button {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .username {
    max-width: 60px;
  }
}
</style>
