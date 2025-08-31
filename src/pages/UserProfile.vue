<template>
  <div class="user-profile-page">
    <div class="container">
      <div class="page-container">
        <!-- 页面头部 -->
        <div class="page-header">
          <el-button 
            type="primary" 
            :icon="ArrowLeft" 
            @click="goBack"
            class="back-btn"
          >
            返回
          </el-button>
          <h1>个人资料</h1>
          <p>管理你的个人信息和设置</p>
        </div>

        <!-- 主要内容区域 -->
        <div class="profile-content">
          <el-card class="profile-card">
            <div class="profile-layout">
              <!-- 左侧：头像管理 -->
              <div class="avatar-section">
                <div class="avatar-container">
                  <el-avatar :size="120" :src="avatarUrl">
                    <el-icon><User /></el-icon>
                  </el-avatar>
                </div>
                <el-button 
                  type="primary" 
                  @click="handleAvatarChange"
                  class="avatar-btn"
                >
                  <el-icon><Refresh /></el-icon>
                  更换头像
                </el-button>
                <p class="avatar-tip">支持 JPG、PNG 格式, 文件大小不超过 2MB</p>
                
                <!-- 隐藏的文件上传输入 -->
                <input
                  ref="avatarInputRef"
                  type="file"
                  accept="image/jpeg,image/png"
                  style="display: none"
                  @change="handleAvatarUpload"
                />
              </div>

              <!-- 右侧：个人信息表单 -->
              <div class="form-section">
                <el-form
                  ref="profileFormRef"
                  :model="profileForm"
                  :rules="profileRules"
                  label-width="100px"
                  class="profile-form"
                >
                  <el-form-item label="用户名" prop="username">
                    <el-input
                      v-model="profileForm.username"
                      disabled
                      placeholder="用户名"
                    />
                    <div class="field-tip">用户名不可修改</div>
                  </el-form-item>

                  <el-form-item label="昵称" prop="nickName" required>
                    <el-input
                      v-model="profileForm.nickName"
                      placeholder="请输入昵称"
                      maxlength="20"
                      show-word-limit
                    />
                  </el-form-item>

                  <el-form-item label="邮箱" prop="email" required>
                    <el-input
                      v-model="profileForm.email"
                      placeholder="请输入邮箱"
                      type="email"
                    />
                  </el-form-item>

                  <el-form-item label="手机号" prop="phone">
                    <el-input
                      v-model="profileForm.phone"
                      placeholder="请输入手机号"
                      maxlength="11"
                    />
                  </el-form-item>

                  <el-form-item label="个人简介" prop="bio">
                    <el-input
                      v-model="profileForm.bio"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入个人简介"
                      maxlength="200"
                      show-word-limit
                    />
                  </el-form-item>

                  <el-form-item>
                    <el-button
                      type="primary"
                      @click="handleSave"
                      :loading="saving"
                      class="save-btn"
                    >
                      保存修改
                    </el-button>
                    <el-button @click="handleReset" class="reset-btn">
                      重置
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @component UserProfile
 * @description 个人资料页面，支持修改用户信息
 */

import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Refresh, User } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useGlobalStore } from '../store'
import { authApiService } from '../services/authApi'
import { fileApi } from '../services/api'

const router = useRouter()
const globalStore = useGlobalStore()

// 响应式数据
const saving = ref(false)
const avatarInputRef = ref<HTMLInputElement>()

// 表单引用
const profileFormRef = ref()

// 计算属性
const userInfo = computed(() => globalStore.userInfo || {})

// 文件访问URL格式配置
// 根据你的后端API，选择合适的URL格式
const FILE_ACCESS_URL_FORMAT = '/file/access/{fileId}' // 可以修改为其他格式

// 头像URL计算属性
const avatarUrl = computed(() => {
  const avatar = profileForm.avatar || userInfo.value.avatar
  console.log('Avatar debug:', {
    profileFormAvatar: profileForm.avatar,
    userInfoAvatar: userInfo.value.avatar,
    finalAvatar: avatar
  })
  
  if (!avatar) return ''
  
  // 如果avatar是完整的URL，直接返回
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    console.log('Using full URL:', avatar)
    return avatar
  }
  
  // 如果avatar是fileId，构造文件访问URL
  if (avatar) {
    const url = FILE_ACCESS_URL_FORMAT.replace('{fileId}', avatar)
    console.log('Constructed avatar URL:', url)
    return url
  }
  
  return ''
})

// 测试头像URL是否可访问
const testAvatarUrl = async (fileId: string) => {
  const possibleUrls = [
    '/file/access/{fileId}',
    '/file/download/{fileId}',
    '/api/file/{fileId}',
    '/file/{fileId}',
    '/api/file/access/{fileId}'
  ].map(format => format.replace('{fileId}', fileId))
  
  for (const url of possibleUrls) {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      if (response.ok) {
        console.log('Found working avatar URL:', url)
        return url
      }
    } catch (error) {
      console.log('URL not working:', url, error)
    }
  }
  
  console.log('No working URL found for fileId:', fileId)
  return possibleUrls[0] // 返回第一个作为默认值
}

// 表单数据
const profileForm = reactive({
  username: '',
  nickName: '',
  email: '',
  phone: '',
  bio: '',
  avatar: ''
})

// 表单验证规则
const profileRules = {
  nickName: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度2-20位', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  bio: [
    { max: 200, message: '个人简介不能超过200字', trigger: 'blur' }
  ]
}

/**
 * 返回上一页
 */
const goBack = () => {
  router.back()
}

/**
 * 初始化表单数据
 */
const initFormData = () => {
  if (userInfo.value) {
    profileForm.username = userInfo.value.username || userInfo.value.userName || ''
    profileForm.nickName = userInfo.value.nickName || ''
    profileForm.email = userInfo.value.email || ''
    profileForm.phone = userInfo.value.phone || userInfo.value.mobile || ''
    profileForm.bio = userInfo.value.bio || ''
    profileForm.avatar = userInfo.value.avatar || ''
  }
}

/**
 * 处理头像更换
 */
const handleAvatarChange = () => {
  avatarInputRef.value?.click()
}

/**
 * 处理头像上传
 */
const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // 检查文件类型
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    ElMessage.error('只支持 JPG、PNG 格式的图片')
    return
  }
  
  // 检查文件大小 (2MB)
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过 2MB')
    return
  }
  
  try {
    // 调用文件上传API，使用USER_AVATAR作为businessType
    const response = await fileApi.upload(file, 'USER_AVATAR')
    
    if (response && response.fileId) {
      console.log('Avatar upload response:', response)
      
      // 更新表单中的头像字段
      profileForm.avatar = response.externalUrl
      console.log('Updated profileForm.avatar:', profileForm.avatar)
      
      // 更新全局状态中的头像
      globalStore.updateUserAvatar(response.externalUrl)
      ElMessage.success('头像上传成功，请点击"保存修改"保存到服务器')
    } else {
      ElMessage.error('头像上传失败：未获取到文件ID')
    }
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败：' + (error.message || '未知错误'))
  }
  
  // 清空文件输入
  target.value = ''
}

/**
 * 保存修改
 */
const handleSave = async () => {
  if (!profileFormRef.value) return
  
    await profileFormRef.value.validate()
    
    // 调用更新用户信息API
    const response = await authApiService.updateUserProfile({
      username: profileForm.username,
      nickName: profileForm.nickName,
      email: profileForm.email,
      phone: profileForm.phone,
      bio: profileForm.bio,
      avatar: profileForm.avatar
    })
    
      ElMessage.success('保存成功')
      // 更新全局状态
      globalStore.updateUserInfo({
        nickName: profileForm.nickName,
        email: profileForm.email,
        phone: profileForm.phone,
        bio: profileForm.bio,
        avatar: profileForm.avatar
      })
  
}

/**
 * 重置表单
 */
const handleReset = () => {
  ElMessageBox.confirm(
    '确定要重置所有修改吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    initFormData()
    ElMessage.success('已重置')
  }).catch(() => {
    // 用户取消
  })
}

// 组件挂载时初始化数据
onMounted(() => {
  // 检查登录状态
  if (!globalStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/')
    return
  }
  
  // 检查是否为体验账号
  if (globalStore.isExperienceAccount) {
    ElMessage.warning('体验账号不支持修改个人资料')
    router.push('/')
    return
  }
  
  initFormData()
})
</script>

<style scoped>
.user-profile-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px 0;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 0;
}

.page-header h1 {
  font-size: 32px;
  color: #2c3e50;
  margin: 20px 0 10px;
}

.page-header p {
  color: #7f8c8d;
  font-size: 16px;
}

.profile-content {
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.profile-layout {
  display: flex;
  gap: 40px;
  padding: 20px;
}

.avatar-section {
  flex-shrink: 0;
  text-align: center;
  width: 200px;
}

.avatar-container {
  margin-bottom: 20px;
}

.avatar-debug {
  margin-top: 10px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  border: 1px solid #e9ecef;
}

.avatar-btn {
  margin-bottom: 12px;
}

.avatar-tip {
  font-size: 12px;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.4;
}

.form-section {
  flex: 1;
}

.profile-form {
  max-width: 400px;
}

.profile-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #2c3e50;
}

.profile-form :deep(.el-input__wrapper) {
  border-radius: 8px;
}

.field-tip {
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 4px;
}

.save-btn {
  margin-right: 12px;
}

.reset-btn {
  border-color: #dcdfe6;
  color: #606266;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-layout {
    flex-direction: column;
    gap: 30px;
  }
  
  .avatar-section {
    width: 100%;
  }
  
  .profile-form {
    max-width: 100%;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
}
</style>
