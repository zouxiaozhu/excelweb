<template>
  <div class="excel-to-word-page">
    <!-- 体验账号警告 -->
    <div v-if="isExperienceAccount && !hideExperienceWarning" class="experience-warning">
      <el-alert
        title="体验账号使用提醒"
        type="warning"
        :closable="true"
        show-icon
        @close="handleCloseExperienceWarning"
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
          <h1>Excel转Word工具</h1>
          <p>批量将Excel数据填充到Word模板中,支持变量替换</p>
        </div>

        <!-- 主要内容区域 -->
        <div class="main-content">
          <el-row :gutter="40">
            <!-- 左侧：上传和操作步骤 -->
            <el-col :span="12">
              <div class="left-panel">
                <!-- 步骤1：上传Excel文件 -->
                <div class="step-section">
                  <div class="step-header">
                    <div class="step-number">1</div>
                    <h3>上传Excel文件</h3>
                  </div>
                  <div class="upload-area">
                    <FileUpload 
                      :accept="'.xlsx'"
                      :multiple="true"
                      :max-size="100"
                      business-type="EXCEL_TO_WORD_EXCEL"
                      @success="handleExcelUploadSuccess"
                      @error="handleUploadError"
                    />
                  </div>
                  
                  <!-- 显示解析的变量 -->
                  <div v-if="excelParseResults.length > 0" class="parse-results">
                    <h4>发现的变量</h4>
                    <div class="vars-list">
                      <div 
                        v-for="(result, index) in excelParseResults" 
                        :key="index"
                        class="var-group"
                      >
                        <div class="file-title">{{ result.fileName }}</div>
                        <div class="vars-grid">
                          <div 
                            v-for="(variable, varIndex) in result.vars" 
                            :key="varIndex"
                            class="var-item"
                          >
                            <span class="var-title">{{ variable.title }}</span>
                            <span class="var-code">{{ variable.var }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 步骤2：上传Word模板 -->
                <div class="step-section">
                  <div class="step-header">
                    <div class="step-number">2</div>
                    <h3>上传Word模板</h3>
                  </div>
                  <div class="upload-area">
                    <FileUpload 
                      :accept="'.docx'"
                      :multiple="false"
                      :max-size="10"
                      business-type="word_template"
                      @success="handleTemplateUploadSuccess"
                      @error="handleUploadError"
                    />
                    <div class="upload-tip">
                      仅支持.docx格式,文件大小不超过10MB
                    </div>
                  </div>
                </div>

                <!-- 步骤3：开始转换 -->
                <div class="step-section">
                  <div class="step-header">
                    <div class="step-number">3</div>
                    <h3>开始转换</h3>
                  </div>
                  <div class="convert-button-area">
                    <el-button 
                      type="primary" 
                      size="large"
                      :disabled="!canStartConversion"
                      :loading="converting"
                      @click="startConversion"
                      class="convert-btn"
                    >
                      {{ converting ? '转换中...' : '开始转换' }}
                    </el-button>
                  </div>
                </div>
              </div>
            </el-col>

            <!-- 右侧：转换结果 -->
            <el-col :span="12">
              <div class="right-panel">
                <div class="result-header">
                  <h3>转换结果</h3>
                </div>
                <div class="result-content">
                  <div v-if="conversionResults.length === 0" class="empty-result">
                    <div class="empty-icon">
                      <el-icon size="60"><Box /></el-icon>
                    </div>
                    <p class="empty-text">暂无转换结果</p>
                  </div>
                  <div v-else class="result-list">
                    <div 
                      v-for="(result, index) in conversionResults" 
                      :key="index"
                      class="result-item"
                    >
                      <div class="result-info">
                        <el-icon class="result-icon"><Document /></el-icon>
                        <div class="result-details">
                          <div class="result-name">{{ result.fileName }}</div>
                          <div class="result-meta">
                            {{ result.status === 'completed' ? '转换完成' : '转换中...' }} • 
                            {{ formatTime(result.createTime) }}
                          </div>
                        </div>
                      </div>
                      <div class="result-actions">
                        <el-button 
                          v-if="result.status === 'completed'"
                          type="success" 
                          size="small"
                          @click="downloadResult(result)"
                        >
                          下载
                        </el-button>
                        <el-button 
                          v-else-if="result.status === 'failed'"
                          type="danger" 
                          size="small"
                          @click="showError(result)"
                        >
                          查看错误
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 转换进度 -->
        <div v-if="converting" class="conversion-progress">
          <el-card>
            <div class="progress-content">
              <el-progress 
                :percentage="conversionProgress" 
                :status="conversionStatus"
                :stroke-width="8"
              />
              <p class="progress-text">{{ progressText }}</p>
            </div>
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

import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Document, Box } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import FileUpload from '@/components/FileUpload.vue'
import { useGlobalStore } from '@/store'
import AuthModal from '@/components/AuthModal.vue'
import LoginChoiceDialog from '@/components/LoginChoiceDialog.vue'
import type { FileUploadResponse } from '@/typings/api'
import { excelToWordApi } from '@/services/api'

const router = useRouter()
const globalStore = useGlobalStore()

// 响应式数据
const showAuthModal = ref(false)
const showLoginChoiceDialog = ref(false)
const hideExperienceWarning = ref(false)

// 计算属性 - 登录状态
const isLoggedIn = computed(() => globalStore.isLoggedIn)
const isExperienceAccount = computed(() => globalStore.isExperienceAccount)

// 文件上传状态
const uploadedExcelFiles = ref<FileUploadResponse[]>([])
const uploadedTemplateFile = ref<FileUploadResponse | null>(null)

// 转换状态
const converting = ref(false)
const conversionProgress = ref(0)
const conversionStatus = ref<'success' | 'exception' | undefined>()
const progressText = ref('')
const conversionResults = ref<any[]>([])

// Excel解析结果
const excelParseResults = ref<Array<{
    fileId: number
    fileName: string
    vars: Array<{ title: string; var: string }>
    path: string
}>>([])

// 计算属性 - 是否可以开始转换
const canStartConversion = computed(() => {
  return uploadedExcelFiles.value.length > 0 && uploadedTemplateFile.value !== null
})

// 初始化体验账号提醒状态
const initExperienceWarning = () => {
  if (isExperienceAccount.value) {
    const hidden = localStorage.getItem('hideExperienceWarning')
    hideExperienceWarning.value = hidden === 'true'
  }
}

// 处理关闭体验账号提醒
const handleCloseExperienceWarning = () => {
  hideExperienceWarning.value = true
  localStorage.setItem('hideExperienceWarning', 'true')
}

/**
 * 格式化时间
 */
const formatTime = (time: string): string => {
  return new Date(time).toLocaleString()
}

/**
 * 处理Excel文件上传成功
 */
const handleExcelUploadSuccess = async ({ response }: { response: FileUploadResponse }) => {
  uploadedExcelFiles.value.push(response)
  ElMessage.success(`Excel文件"${response.fileName}"上传成功！`)
  
  // 调用解析接口
  try {
    await parseExcelTable(response)
  } catch (error) {
    console.error('解析Excel文件失败:', error)
    ElMessage.error('解析Excel文件失败，请重试')
  }
}

/**
 * 解析Excel表格
 */
const parseExcelTable = async (fileResponse: FileUploadResponse) => {
  const params = {
    bucket: "default",
    engine: "LOCAL",
    externalDomain: "https://api.deskwork.cn",
    externalUrl: fileResponse.externalUrl || "",
    fileId: parseInt(fileResponse.fileId),
    fileName: fileResponse.fileName,
    internalDomain: "https://api.deskwork.cn",
    internalUrl: "",
    meta: null,
    path: fileResponse.path || "",
    size: fileResponse.fileSize
  }

  const result = await excelToWordApi.parseTable(params)
  
  if (result.success) {
    // 保存解析结果
    excelParseResults.value.push({
      fileId: parseInt(fileResponse.fileId),
      fileName: fileResponse.fileName,
      vars: result.data.vars,
      path: result.data.path
    })
    
    ElMessage.success(`Excel文件"${fileResponse.fileName}"解析成功，发现 ${result.data.vars.length} 个变量`)
    
    // 可以在这里显示变量列表或进行其他处理
    console.log('解析结果:', result.data)
  } else {
    throw new Error(result.message || '解析失败')
  }
}

/**
 * 处理Word模板上传成功
 */
const handleTemplateUploadSuccess = ({ response }: { response: FileUploadResponse }) => {
  uploadedTemplateFile.value = response
  ElMessage.success(`Word模板"${response.fileName}"上传成功！`)
}

/**
 * 处理文件上传失败
 */
const handleUploadError = (error: Error) => {
  ElMessage.error('文件上传失败：' + error.message)
}

/**
 * 开始转换
 */
const startConversion = async () => {
  if (!canStartConversion.value) {
    ElMessage.warning('请先上传Excel文件和Word模板')
    return
  }

  converting.value = true
  conversionProgress.value = 0
  conversionStatus.value = undefined
  progressText.value = '准备转换...'

  try {
    const totalFiles = uploadedExcelFiles.value.length
    
    for (let i = 0; i < totalFiles; i++) {
      const file = uploadedExcelFiles.value[i]
      progressText.value = `正在转换 ${file.fileName} (${i + 1}/${totalFiles})`
      
      // 模拟转换过程
      await simulateConversion(file)
      
      conversionProgress.value = Math.round(((i + 1) / totalFiles) * 100)
    }

    conversionStatus.value = 'success'
    progressText.value = '转换完成！'
    ElMessage.success(`成功转换 ${totalFiles} 个文件`)
    
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
      // 添加到转换结果
      conversionResults.value.unshift({
        id: Date.now() + Math.random(),
        fileName: file.fileName,
        status: 'completed',
        createTime: new Date().toISOString(),
        downloadUrl: '#'
      })
      resolve()
    }, delay)
  })
}

/**
 * 下载转换结果
 */
const downloadResult = (result: any) => {
  // 这里应该实现实际的下载逻辑
  ElMessage.success(`开始下载 ${result.fileName}`)
}

/**
 * 显示错误信息
 */
const showError = (result: any) => {
  ElMessageBox.alert(
    result.errorMessage || '转换过程中发生未知错误',
    '错误详情',
    { type: 'error' }
  )
}

// 组件挂载时检查登录状态
onMounted(() => {
  // 检查登录状态
  if (!isLoggedIn.value) {
    showLoginChoiceDialog.value = true
    return
  }
  
  // 初始化体验账号提醒状态
  initExperienceWarning()
})

// 监听登录状态变化，重新初始化体验账号提醒
watch([isLoggedIn, isExperienceAccount], ([loggedIn, isExp]) => {
  if (loggedIn && isExp) {
    // 延迟一下确保store状态完全更新
    nextTick(() => {
      initExperienceWarning()
    })
  }
})

/**
 * 处理登录成功
 */
const handleLoginSuccess = () => {
  // 登录成功后可以加载历史数据等
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
  margin-bottom: 40px;
  padding: 40px 0;
}

.page-header h1 {
  font-size: 36px;
  color: #2c3e50;
  margin: 0 0 15px;
  font-weight: 600;
}

.page-header p {
  color: #7f8c8d;
  font-size: 18px;
  margin: 0;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.left-panel,
.right-panel {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  height: 600px;
}

.step-section {
  margin-bottom: 40px;
}

.step-section:last-child {
  margin-bottom: 0;
}

.step-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.step-number {
  width: 40px;
  height: 40px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  margin-right: 15px;
}

.step-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 500;
}

.upload-area {
  border: 2px dashed #e4e7ed;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  background: #fafafa;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.upload-tip {
  margin-top: 15px;
  color: #909399;
  font-size: 14px;
}

.convert-button-area {
  text-align: center;
  padding: 20px;
}

.convert-btn {
  width: 200px;
  height: 50px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
}

.right-panel {
  display: flex;
  flex-direction: column;
}

.result-header {
  margin-bottom: 30px;
}

.result-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 500;
}

.result-content {
  flex: 1;
  overflow-y: auto;
}

.empty-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.empty-icon {
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-text {
  font-size: 16px;
  margin: 0;
}

.result-list {
  max-height: 500px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 10px;
  background: white;
}

.result-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.result-icon {
  font-size: 24px;
  color: #409eff;
  margin-right: 12px;
}

.result-details {
  flex: 1;
}

.result-name {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.result-meta {
  font-size: 12px;
  color: #909399;
}

.conversion-progress {
  max-width: 1200px;
  margin: 30px auto 0;
  padding: 0 20px;
}

.progress-content {
  text-align: center;
  padding: 20px;
}

.progress-text {
  margin-top: 15px;
  color: #666;
  font-size: 14px;
}

@media (max-width: 768px) {
  .main-content {
    padding: 0 10px;
  }
  
  .left-panel,
  .right-panel {
    padding: 20px;
    height: auto;
    margin-bottom: 20px;
  }
  
  .page-header h1 {
    font-size: 28px;
  }
  
  .page-header p {
    font-size: 16px;
  }
  
  .step-number {
    width: 35px;
    height: 35px;
    font-size: 16px;
  }
  
  .step-header h3 {
    font-size: 18px;
  }
  
  .convert-btn {
    width: 100%;
  }
  
  .result-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .result-actions {
    margin-top: 10px;
    text-align: right;
  }
}

/* 解析变量结果样式 */
.parse-results {
  margin-top: 30px;
  padding: 20px;
  background: #f9f9f9;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.parse-results h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 18px;
  font-weight: 500;
}

.vars-list {
  display: flex;
  flex-direction: column;
}

.var-group {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #eee;
}

.var-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.file-title {
  font-size: 16px;
  font-weight: 500;
  color: #409eff;
  margin-bottom: 10px;
}

.vars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.var-item {
  background: #eef;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.var-title {
  font-weight: 500;
  margin-right: 10px;
}

.var-code {
  font-family: monospace;
  background-color: #f4f4f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
  color: #555;
}
</style>
