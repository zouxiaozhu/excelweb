<template>
  <div class="excel-to-word-page">
    <!-- 体验账号警告 -->
    <div v-if="isExperienceAccount && !hideExperienceWarning" class="experience-warning">
      <el-alert
        title="体验账号使用提醒"
        type="warning"
        :closable="true"
        show-icon
        @close="hideExperienceWarning = true"
      >
        <template #default>
          <p>您正在使用体验账号，数据仅用于测试，请勿上传重要数据。数据会定期清理，建议使用自己的账号登录。</p>
        </template>
      </el-alert>
    </div>

    <div class="container">
      <div class="page-container">
        <!-- 页面头部 -->
        <div class="page-header">
          <h1>Excel批量转Word</h1>
          <p>将Excel文件批量转换为Word文档，支持自定义模板和格式</p>
        </div>

        <!-- 功能介绍 -->
        <div class="feature-intro">
          <el-alert
            title="功能说明"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <p>本功能参考 <a href="https://www.deskwork.cn/admin/document-convert/new" target="_blank" class="link">deskwork文档转换</a> 实现</p>
              <ul class="feature-list">
                <li>支持Excel(.xlsx, .xls)文件批量转换为Word文档</li>
                <li>提供多种转换模板和格式选项</li>
                <li>支持自定义页面布局和样式设置</li>
                <li>高效批量处理，节省时间成本</li>
              </ul>
            </template>
          </el-alert>
        </div>

        <!-- 转换配置 -->
        <div class="conversion-config">
          <el-row :gutter="20">
            <!-- 左侧：文件上传和设置 -->
            <el-col :xs="24" :md="12">
              <el-card class="config-card">
                <template #header>
                  <span>文件上传与配置</span>
                </template>
                
                <!-- 文件上传区域 -->
                <div class="upload-section">
                  <h4>选择Excel文件</h4>
                  <FileUpload 
                    :accept="'.xlsx,.xls'"
                    :multiple="true"
                    :max-size="20"
                    business-type="excel_to_word"
                    @success="handleUploadSuccess"
                    @error="handleUploadError"
                  />
                </div>

                <!-- 转换设置 -->
                <div class="settings-section">
                  <h4>转换设置</h4>
                  <el-form :model="convertSettings" label-width="100px">
                    <el-form-item label="输出格式">
                      <el-select v-model="convertSettings.outputFormat" style="width: 100%">
                        <el-option label="Word文档 (.docx)" value="docx" />
                        <el-option label="PDF文档 (.pdf)" value="pdf" />
                        <el-option label="富文本 (.rtf)" value="rtf" />
                      </el-select>
                    </el-form-item>
                    
                    <el-form-item label="页面方向">
                      <el-radio-group v-model="convertSettings.orientation">
                        <el-radio label="portrait">纵向</el-radio>
                        <el-radio label="landscape">横向</el-radio>
                      </el-radio-group>
                    </el-form-item>
                    
                    <el-form-item label="页面大小">
                      <el-select v-model="convertSettings.pageSize" style="width: 100%">
                        <el-option label="A4" value="A4" />
                        <el-option label="A3" value="A3" />
                        <el-option label="Letter" value="Letter" />
                        <el-option label="Legal" value="Legal" />
                      </el-select>
                    </el-form-item>
                    
                    <el-form-item label="字体大小">
                      <el-slider 
                        v-model="convertSettings.fontSize" 
                        :min="8" 
                        :max="24" 
                        show-input 
                      />
                    </el-form-item>
                    
                    <el-form-item label="表格边框">
                      <el-switch v-model="convertSettings.showBorders" />
                    </el-form-item>
                    
                    <el-form-item label="保留格式">
                      <el-switch v-model="convertSettings.preserveFormatting" />
                    </el-form-item>
                  </el-form>
                </div>
              </el-card>
            </el-col>

            <!-- 右侧：预览和文件列表 -->
            <el-col :xs="24" :md="12">
              <el-card class="preview-card">
                <template #header>
                  <span>文件列表与预览</span>
                </template>
                
                <!-- 上传文件列表 -->
                <div class="file-list-section">
                  <h4>待转换文件 ({{ uploadedFiles.length }})</h4>
                  <div v-if="uploadedFiles.length === 0" class="empty-state">
                    <el-empty description="暂无文件，请先上传Excel文件" />
                  </div>
                  <div v-else class="file-list">
                    <div 
                      v-for="(file, index) in uploadedFiles" 
                      :key="index"
                      class="file-item"
                    >
                      <div class="file-info">
                        <el-icon class="file-icon"><Document /></el-icon>
                        <div class="file-details">
                          <div class="file-name">{{ file.fileName }}</div>
                          <div class="file-meta">
                            {{ formatFileSize(file.fileSize) }} • 
                            {{ formatTime(file.uploadTime) }}
                          </div>
                        </div>
                      </div>
                      <div class="file-actions">
                        <el-button 
                          type="danger" 
                          size="small" 
                          :icon="Delete"
                          @click="removeFile(index)"
                        >
                          删除
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 转换预览设置 -->
                <div class="preview-settings">
                  <h4>预览设置</h4>
                  <el-descriptions :column="2" size="small" border>
                    <el-descriptions-item label="输出格式">
                      {{ getFormatLabel(convertSettings.outputFormat) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="页面方向">
                      {{ convertSettings.orientation === 'portrait' ? '纵向' : '横向' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="页面大小">
                      {{ convertSettings.pageSize }}
                    </el-descriptions-item>
                    <el-descriptions-item label="字体大小">
                      {{ convertSettings.fontSize }}pt
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 转换操作 -->
        <div class="conversion-actions">
          <el-card>
            <div class="actions-content">
              <div class="action-buttons">
                <el-button 
                  type="primary" 
                  size="large"
                  :disabled="uploadedFiles.length === 0"
                  :loading="converting"
                  @click="startConversion"
                >
                  {{ converting ? '转换中...' : `开始转换 (${uploadedFiles.length}个文件)` }}
                </el-button>
                <el-button 
                  size="large"
                  @click="clearAllFiles"
                  :disabled="uploadedFiles.length === 0"
                >
                  清空列表
                </el-button>
              </div>
              
              <!-- 转换进度 -->
              <div v-if="converting" class="conversion-progress">
                <el-progress 
                  :percentage="conversionProgress" 
                  :status="conversionStatus"
                  :stroke-width="8"
                />
                <p class="progress-text">{{ progressText }}</p>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 转换历史 -->
        <div class="conversion-history">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>转换历史</span>
                <el-button @click="refreshHistory" :icon="Refresh">刷新</el-button>
              </div>
            </template>
            
            <el-table 
              :data="conversionHistory" 
              :loading="loadingHistory"
              border
              style="width: 100%"
            >
              <el-table-column prop="fileName" label="原文件名" min-width="200" />
              <el-table-column prop="outputFormat" label="输出格式" width="100">
                <template #default="{ row }">
                  {{ getFormatLabel(row.outputFormat) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="120">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="转换时间" width="180" />
              <el-table-column label="操作" width="150">
                <template #default="{ row }">
                  <el-button 
                    v-if="row.status === 'completed'"
                    type="success" 
                    size="small"
                    @click="downloadFile(row)"
                  >
                    下载
                  </el-button>
                  <el-button 
                    v-else-if="row.status === 'failed'"
                    type="danger" 
                    size="small"
                    @click="showError(row)"
                  >
                    查看错误
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 登录选择对话框 -->
    <LoginChoiceDialog
      v-model="showLoginChoiceDialog"
      @login-success="handleLoginSuccess"
      @show-normal-login="handleShowNormalLogin"
    />

    <!-- 二合一登录注册弹框 -->
    <AuthModal
      v-model="showAuthModal"
      @login-success="handleLoginSuccess"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * @component ExcelToWord
 * @description Excel转Word页面，提供Excel文件批量转换为Word文档的功能
 * 
 * @dependencies
 * @api fileApi.upload - 文件上传接口
 * @reference https://www.deskwork.cn/admin/document-convert/new
 */

import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Document, Delete, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import FileUpload from '@/components/FileUpload.vue'
import { useGlobalStore } from '@/store'
import AuthModal from '@/components/AuthModal.vue'
import LoginChoiceDialog from '@/components/LoginChoiceDialog.vue'
import type { FileUploadResponse } from '@/typings/api'

const router = useRouter()
const globalStore = useGlobalStore()

// 响应式数据
const showAuthModal = ref(false)
const showLoginChoiceDialog = ref(false)
const hideExperienceWarning = ref(false)

// 计算属性 - 登录状态
const isLoggedIn = computed(() => globalStore.isLoggedIn)
const isExperienceAccount = computed(() => globalStore.isExperienceAccount)

// 转换设置
const convertSettings = reactive({
  outputFormat: 'docx',
  orientation: 'portrait',
  pageSize: 'A4',
  fontSize: 12,
  showBorders: true,
  preserveFormatting: true
})

// 响应式数据
const uploadedFiles = ref<FileUploadResponse[]>([])
const converting = ref(false)
const conversionProgress = ref(0)
const conversionStatus = ref<'success' | 'exception' | undefined>()
const progressText = ref('')
const conversionHistory = ref<any[]>([])
const loadingHistory = ref(false)

/**
 * 返回首页
 */
const goBack = () => {
  router.push('/')
}

/**
 * 格式化文件大小
 */
const formatFileSize = (size: number): string => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  return (size / (1024 * 1024)).toFixed(1) + ' MB'
}

/**
 * 格式化时间
 */
const formatTime = (time: string): string => {
  return new Date(time).toLocaleString()
}

/**
 * 获取格式标签
 */
const getFormatLabel = (format: string): string => {
  switch (format) {
    case 'docx': return 'Word文档'
    case 'pdf': return 'PDF文档'
    case 'rtf': return '富文本'
    default: return format.toUpperCase()
  }
}

/**
 * 处理文件上传成功
 */
const handleUploadSuccess = ({ response }: { response: FileUploadResponse }) => {
  uploadedFiles.value.push(response)
  ElMessage.success(`文件"${response.fileName}"上传成功！`)
}

/**
 * 处理文件上传失败
 */
const handleUploadError = (error: Error) => {
  ElMessage.error('文件上传失败：' + error.message)
}

/**
 * 移除文件
 */
const removeFile = (index: number) => {
  const fileName = uploadedFiles.value[index].fileName
  uploadedFiles.value.splice(index, 1)
  ElMessage.success(`已移除文件"${fileName}"`)
}

/**
 * 清空所有文件
 */
const clearAllFiles = () => {
  ElMessageBox.confirm(
    `确定要清空所有 ${uploadedFiles.value.length} 个文件吗？`,
    '确认清空',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    uploadedFiles.value = []
    ElMessage.success('已清空所有文件')
  }).catch(() => {
    // 用户取消
  })
}

/**
 * 开始转换
 */
const startConversion = async () => {
  if (uploadedFiles.value.length === 0) {
    ElMessage.warning('请先上传文件')
    return
  }

  converting.value = true
  conversionProgress.value = 0
  conversionStatus.value = undefined
  progressText.value = '准备转换...'

  try {
    const totalFiles = uploadedFiles.value.length
    
    for (let i = 0; i < totalFiles; i++) {
      const file = uploadedFiles.value[i]
      progressText.value = `正在转换 ${file.fileName} (${i + 1}/${totalFiles})`
      
      // 模拟转换过程
      await simulateConversion(file)
      
      conversionProgress.value = Math.round(((i + 1) / totalFiles) * 100)
    }

    conversionStatus.value = 'success'
    progressText.value = '转换完成！'
    ElMessage.success(`成功转换 ${totalFiles} 个文件`)
    
    // 刷新历史记录
    await loadConversionHistory()
    
    // 2秒后重置进度
    setTimeout(() => {
      conversionProgress.value = 0
      conversionStatus.value = undefined
      progressText.value = ''
    }, 2000)
    
  } catch (error) {
    conversionStatus.value = 'exception'
    progressText.value = '转换失败！'
    ElMessage.error('转换过程中出现错误')
    console.error('Conversion error:', error)
  } finally {
    converting.value = false
  }
}

/**
 * 模拟转换过程
 */
const simulateConversion = (file: FileUploadResponse): Promise<void> => {
  return new Promise((resolve) => {
    // 模拟转换时间 1-3秒
    const delay = Math.random() * 2000 + 1000
    setTimeout(() => {
      // 添加到历史记录
      conversionHistory.value.unshift({
        id: Date.now() + Math.random(),
        fileName: file.fileName,
        outputFormat: convertSettings.outputFormat,
        status: 'completed',
        createTime: new Date().toISOString(),
        downloadUrl: '#'
      })
      resolve()
    }, delay)
  })
}

/**
 * 加载转换历史
 */
const loadConversionHistory = async () => {
  loadingHistory.value = true
  try {
    // 这里应该调用实际的API
    // const history = await conversionApi.getHistory()
    // conversionHistory.value = history
    
    // 模拟数据
    setTimeout(() => {
      loadingHistory.value = false
    }, 500)
  } catch (error) {
    ElMessage.error('加载转换历史失败')
    loadingHistory.value = false
  }
}

/**
 * 刷新历史记录
 */
const refreshHistory = () => {
  loadConversionHistory()
}

/**
 * 获取状态类型
 */
const getStatusType = (status: string) => {
  switch (status) {
    case 'completed': return 'success'
    case 'failed': return 'danger'
    case 'processing': return 'warning'
    default: return 'info'
  }
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return '待处理'
    case 'processing': return '转换中'
    case 'completed': return '已完成'
    case 'failed': return '失败'
    default: return status
  }
}

/**
 * 下载文件
 */
const downloadFile = (record: any) => {
  // 这里应该实现实际的下载逻辑
  ElMessage.success(`开始下载 ${record.fileName}`)
}

/**
 * 显示错误信息
 */
const showError = (record: any) => {
  ElMessageBox.alert(
    record.errorMessage || '转换过程中发生未知错误',
    '错误详情',
    { type: 'error' }
  )
}

// 组件挂载时检查登录状态并加载历史记录
onMounted(() => {
  // 检查登录状态
  if (!isLoggedIn.value) {
    showLoginChoiceDialog.value = true
    return
  }
  
  loadConversionHistory()
})

/**
 * 处理登录成功
 */
const handleLoginSuccess = () => {
  loadConversionHistory()
}

/**
 * 处理显示正常登录
 */
const handleShowNormalLogin = () => {
  showAuthModal.value = true
}
</script>

<style scoped>
.excel-to-word-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.experience-warning {
  position: sticky;
  top: 60px;
  z-index: 999;
  margin-bottom: 20px;
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

.feature-intro {
  margin-bottom: 30px;
}

.feature-list {
  margin: 15px 0 0 20px;
  padding: 0;
}

.feature-list li {
  margin-bottom: 8px;
  color: #666;
}

.link {
  color: #409eff;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.conversion-config {
  margin-bottom: 30px;
}

.config-card,
.preview-card {
  height: 100%;
}

.upload-section,
.settings-section,
.file-list-section,
.preview-settings {
  margin-bottom: 30px;
}

.upload-section h4,
.settings-section h4,
.file-list-section h4,
.preview-settings h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 16px;
}

.file-list {
  max-height: 300px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 10px;
  background: white;
}

.file-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.file-icon {
  font-size: 24px;
  color: #409eff;
  margin-right: 12px;
}

.file-details {
  flex: 1;
}

.file-name {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.file-meta {
  font-size: 12px;
  color: #909399;
}

.conversion-actions {
  margin-bottom: 30px;
}

.actions-content {
  text-align: center;
}

.action-buttons {
  margin-bottom: 30px;
}

.action-buttons .el-button {
  margin: 0 10px;
}

.conversion-progress {
  max-width: 500px;
  margin: 0 auto;
}

.progress-text {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}

.conversion-history {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 24px;
  }
  
  .back-btn {
    position: static;
    margin-bottom: 15px;
  }
  
  .action-buttons .el-button {
    margin: 5px;
    width: 100%;
  }
  
  .file-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .file-actions {
    margin-top: 10px;
    text-align: right;
  }
}
</style>
