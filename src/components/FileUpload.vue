<template>
  <div class="file-upload">
    <el-upload
      ref="uploadRef"
      class="upload-demo"
      drag
      :action="uploadAction"
      :before-upload="beforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-progress="handleProgress"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      :show-file-list="false"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          {{ uploadTip }}
        </div>
      </template>
    </el-upload>
    
    <!-- 上传进度 -->
    <div v-if="uploading" class="upload-progress">
      <el-progress :percentage="uploadPercent" :status="uploadStatus" />
      <p class="progress-text">{{ progressText }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @component FileUpload
 * @description 文件上传组件，支持拖拽上传和点击上传
 * 
 * @props
 * @param {string} accept - 接受的文件类型
 * @param {boolean} multiple - 是否支持多选
 * @param {number} maxSize - 最大文件大小(MB)
 * @param {boolean} disabled - 是否禁用
 * 
 * @emits
 * @event success - 上传成功事件
 * @event error - 上传失败事件
 * @event progress - 上传进度事件
 */

import { ref, computed } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { UploadProps, UploadRequestOptions } from 'element-plus'
import { fileApi } from '@/services/api'

// 定义组件属性
interface Props {
  accept?: string
  multiple?: boolean
  maxSize?: number // MB
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  accept: '.xlsx,.xls',
  multiple: false,
  maxSize: 10,
  disabled: false
})

// 定义组件事件
interface Emits {
  success: [response: any]
  error: [error: Error]
  progress: [percent: number]
}

const emit = defineEmits<Emits>()

// 响应式数据
const uploadRef = ref()
const uploading = ref(false)
const uploadPercent = ref(0)
const uploadStatus = ref<'success' | 'exception' | undefined>()

// 计算属性
const uploadAction = computed(() => '#') // 使用自定义上传
const uploadTip = computed(() => {
  const types = props.accept.replace(/\./g, '').toUpperCase()
  return `只能上传 ${types} 文件，且不超过 ${props.maxSize}MB`
})
const progressText = computed(() => {
  if (uploadStatus.value === 'success') {
    return '上传成功！'
  } else if (uploadStatus.value === 'exception') {
    return '上传失败！'
  } else {
    return `上传中... ${uploadPercent.value}%`
  }
})

/**
 * 上传前验证
 */
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  // 检查文件类型
  if (props.accept) {
    const acceptTypes = props.accept.split(',').map(type => type.trim())
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptTypes.includes(fileExtension)) {
      ElMessage.error(`文件格式不正确，请上传 ${props.accept} 格式的文件`)
      return false
    }
  }

  // 检查文件大小
  const maxSizeBytes = props.maxSize * 1024 * 1024
  if (file.size > maxSizeBytes) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB`)
    return false
  }

  uploading.value = true
  uploadPercent.value = 0
  uploadStatus.value = undefined

  return false // 阻止自动上传，使用自定义上传
}

/**
 * 自定义上传
 */
const customUpload = async (file: File) => {
  try {
    const response = await fileApi.upload(file)
    handleSuccess(response, file)
  } catch (error) {
    handleError(error as Error, file)
  }
}

/**
 * 上传成功处理
 */
const handleSuccess = (response: any, file: File) => {
  uploading.value = false
  uploadPercent.value = 100
  uploadStatus.value = 'success'
  
  ElMessage.success('文件上传成功！')
  emit('success', { response, file })
  
  // 2秒后隐藏进度条
  setTimeout(() => {
    uploadPercent.value = 0
    uploadStatus.value = undefined
  }, 2000)
}

/**
 * 上传失败处理
 */
const handleError = (error: Error, file: File) => {
  uploading.value = false
  uploadStatus.value = 'exception'
  
  console.error('Upload error:', error)
  emit('error', error)
}

/**
 * 上传进度处理
 */
const handleProgress = (event: any) => {
  uploadPercent.value = Math.round((event.loaded / event.total) * 100)
  emit('progress', uploadPercent.value)
}

// 监听文件选择，触发自定义上传
const handleFileChange = (file: File) => {
  if (beforeUpload(file) !== false) {
    customUpload(file)
  }
}

// 处理 Element Plus Upload 组件的文件变化
const handleUploadChange = (uploadFile: any) => {
  if (uploadFile.raw) {
    handleFileChange(uploadFile.raw)
  }
}

// 暴露方法给父组件
defineExpose({
  clearFiles: () => uploadRef.value?.clearFiles()
})
</script>

<style scoped>
.file-upload {
  width: 100%;
}

.upload-demo {
  width: 100%;
}

.upload-progress {
  margin-top: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.progress-text {
  margin-top: 10px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

:deep(.el-upload) {
  width: 100%;
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 200px;
}
</style>
