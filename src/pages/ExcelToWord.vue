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
                      :multiple="false"
                      :max-size="100"
                      business-type="EXCEL_TO_WORD_EXCEL"
                      :show-file-list="true"
                      @success="handleExcelUploadSuccess"
                      @error="handleUploadError"
                      @remove="handleExcelFileRemove"
                    />
                  </div>
                  
                  <!-- 显示已上传的Excel文件 -->
                  <div v-if="uploadedExcelFiles.length > 0" class="uploaded-files">
                    <h4>已上传的Excel文件</h4>
                    <div class="file-item">
                      <span class="file-name">{{ uploadedExcelFiles[0].fileName }}</span>
                      <el-button 
                        type="danger" 
                        size="small" 
                        @click="removeExcelFile()"
                        class="remove-file-btn"
                      >
                        删除
                      </el-button>
                    </div>
                  </div>
                  
                  <!-- 显示解析的变量 -->
                  <div v-if="excelParseResults" class="parse-results">
                    <div class="parse-results-header">
                      <h4>Excel变量列表</h4>
                      <div class="header-actions">
                        <div class="total-count">
                          共{{ getTotalVarsCount() }}个
                        </div>
                        <el-button 
                          type="danger" 
                          size="small" 
                          @click="clearAllParseResults"
                          class="clear-btn"
                        >
                          清除
                        </el-button>
                      </div>
                    </div>
                    <div class="vars-list">
                      <div class="var-group">
                        <div class="vars-grid">
                          <div 
                            v-for="(variable, varIndex) in excelParseResults.vars" 
                            :key="varIndex"
                            class="var-item"
                            @click="copyVariableCode(variable.var)"
                            title="点击变量可复制代码"
                          >
                            <span class="var-title">{{ variable.title }}</span>
                            <div class="var-code-wrapper">
                              <span class="var-code">{{ variable.var }}</span>
                              <el-icon class="copy-icon"><Document /></el-icon>
                            </div>
                          </div>
                        </div>
                        <div class="parse-tip">
                          <el-icon><Document /></el-icon>
                          <span>点击变量可复制代码</span>
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
                      business-type="EXCEL_TO_WORD_WORD"
                      :show-file-list="true"
                      @success="handleTemplateUploadSuccess"
                      @error="handleUploadError"
                      @remove="handleTemplateFileRemove"
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
                      v-if="!hasCompletedTask"
                      type="primary" 
                      size="large"
                      :disabled="!canStartConversion"
                      :loading="converting"
                      @click="startConversion"
                      class="convert-btn"
                    >
                      {{ converting ? '转换中...' : '开始转换' }}
                    </el-button>
                    <el-button 
                      v-else
                      type="success" 
                      size="large"
                      @click="resetForNewConversion"
                      class="convert-btn"
                    >
                      再次转换
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
                  <el-button 
                    v-if="getCompressionDownloadUrl()"
                    type="primary" 
                    size="small"
                    @click="downloadCompressionPackage"
                    class="header-batch-download-btn"
                  >
                    批量下载
                  </el-button>
                </div>
                <div class="result-content">
                  <div v-if="conversionResults.length === 0" class="empty-result">
                    <div class="empty-icon">
                      <el-icon size="60"><Box /></el-icon>
                    </div>
                    <p class="empty-text">暂无转换结果</p>
                  </div>
                  <div v-else class="result-list">
                    <!-- 压缩包状态显示 -->
                    <div v-if="getCompressionStatus()" class="compression-status">
                      <div class="status-icon">
                        <el-icon class="success-icon"><CircleCheck /></el-icon>
                      </div>
                      <div class="status-content">
                        <div class="status-text">{{ getCompressionStatusText() }}</div>
                        <div class="file-count">共{{ getTotalFileCount() }}个文件</div>
                      </div>
                      <div class="status-actions">
                        <el-button 
                          type="warning" 
                          size="small"
                          @click="resetAllTasks"
                          class="reset-task-btn"
                        >
                          重置任务
                        </el-button>
                      </div>
                    </div>
                    
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
                          <!-- 显示各个Word文件的转换状态 -->
                          <div v-if="result.transferTasks && result.transferTasks.length > 0" class="transfer-tasks-status">
                            <div 
                              v-for="task in result.transferTasks" 
                              :key="task.id"
                              class="task-status-item"
                              :class="getTaskStatusClass(task.status)"
                            >
                              <span class="task-status-text">{{ getTransferTaskStatusText(task.status) }}</span>
                              <!-- 成功且有URL时显示下载按钮 -->
                              <el-button 
                                  type="primary" 
                                  size="small"
                                  @click="downloadWordFile(task.fileUrl, task.id)"
                                  class="word-download-btn"
                                >
                                  下载
                                </el-button>
                              <!-- 失败时显示错误信息 -->
                              <span v-if="task.status === 'FAILED' && task.errorMessage" class="task-error">
                                {{ task.errorMessage }}
                              </span>
                            </div>
                          </div>
                        </div>
                        </div>
                      </div>
                      <div class="result-actions">
                        <el-button 
                          v-if="result.status === 'failed'"
                          type="danger" 
                          size="small"
                          @click="showError(result)"
                        >
                          查看错误
                        </el-button>
                        <el-button 
                          v-else-if="result.status !== 'completed'"
                          type="info" 
                          size="small"
                          disabled
                        >
                          {{ getStatusText(result.status, result.taskStatus) }}
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
import { Document, Box, CircleCheck, Download } from '@element-plus/icons-vue'
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
const excelParseResults = ref<{
    fileName: string
    vars: Array<{ title: string; var: string }>
    path: string
} | null>(null)

// 计算属性 - 是否可以开始转换
const canStartConversion = computed(() => {
  return uploadedExcelFiles.value.length > 0 && uploadedTemplateFile.value !== null
})

// 计算属性 - 是否有已完成的任务
const hasCompletedTask = computed(() => {
  return conversionResults.value.some(result => result.status === 'completed')
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
 * 获取状态文本
 */
const getStatusText = (status: string, taskStatus?: string): string => {
  if (status === 'submitted') {
    switch (taskStatus) {
      case 'PENDING':
        return '任务待处理'
      case 'PROCESSING':
        return '正在转换'
      case 'SUCCESS':
        return '转换完成'
      case 'FAILED':
        return '转换失败'
      default:
        return '任务已提交'
    }
  }
  return '未知状态'
}

/**
 * 获取Word文件转换状态文本
 */
const getTransferTaskStatusText = (status: string): string => {
  switch (status) {
    case 'SUCCESS':
      return '' // 成功时不显示文本
    case 'FAILED':
      return '转换失败' // 失败时显示原因
    case 'PROCESSING':
      return '转换中'
    case 'PENDING':
      return '等待转换'
    default:
      return '未知状态'
  }
}

/**
 * 获取Word文件状态样式类
 */
const getTaskStatusClass = (status: string): string => {
  switch (status) {
    case 'SUCCESS':
      return 'status-success'
    case 'FAILED':
      return 'status-failed'
    case 'PROCESSING':
      return 'status-processing'
    case 'PENDING':
      return 'status-pending'
    default:
      return 'status-unknown'
  }
}

/**
 * 获取压缩包状态
 */
const getCompressionStatus = (): boolean => {
  return conversionResults.value.some(result => result.status === 'completed')
}

/**
 * 获取压缩包状态文本
 */
const getCompressionStatusText = (): string => {
  const completedResult = conversionResults.value.find(result => result.status === 'completed')
  if (completedResult && completedResult.zipText) {
    return completedResult.zipText
  }
  return '压缩包已生成,可批量下载'
}

/**
 * 获取压缩包下载链接
 */
const getCompressionDownloadUrl = (): string => {
  const completedResult = conversionResults.value.find(result => result.status === 'completed')
  return completedResult?.zipUrl || ''
}

/**
 * 获取总文件数量
 */
const getTotalFileCount = (): number => {
  const completedResult = conversionResults.value.find(result => result.status === 'completed')
  if (completedResult && completedResult.transferTasks) {
    return completedResult.transferTasks.length
  }
  return 0
}

/**
 * 下载压缩包
 */
const downloadCompressionPackage = () => {
  const url = getCompressionDownloadUrl()
  if (url) {
    const link = document.createElement('a')
    link.href = url
    link.download = '转换结果压缩包.zip'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success('开始下载压缩包')
  } else {
    ElMessage.warning('下载链接不可用')
  }
}

/**
 * 重置所有任务
 */
const resetAllTasks = () => {
  ElMessageBox.confirm(
    '确定要重置所有任务吗？这将清除所有转换结果。',
    '确认重置',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    resetForNewConversion()
  }).catch(() => {
    // 用户取消
  })
}

/**
 * 下载Word文件
 */
const downloadWordFile = (fileUrl: string, taskId: string) => {
  const link = document.createElement('a')
  link.href = fileUrl
  link.download = `转换结果_${taskId}.docx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  ElMessage.success('开始下载Word文件')
}

/**
 * 开始轮询任务进度
 */
const startTaskPolling = (taskId: string, resultId: number) => {
  const pollInterval = setInterval(async () => {
    try {
      const response = await excelToWordApi.getTaskProgress({
        taskId: taskId,
        onlyTask: false,
        excludeIds: ''
      })

        const { commonTask, transferTasks } = response
        // 更新转换结果状态
        const resultIndex = conversionResults.value.findIndex(item => item.id === resultId)
        if (resultIndex !== -1) {
          const result = conversionResults.value[resultIndex]
          
          // 更新任务状态
          result.taskStatus = commonTask.status
          
          // 更新transferTasks状态
          result.transferTasks = transferTasks
          
          // 更新进度文案
          if (commonTask.result && commonTask.result.zip_text) {
            progressText.value = commonTask.result.zip_text
            result.zipText = commonTask.result.zip_text
          }
          
          // 检查转换任务状态
          const isTransferSuccess = commonTask.status === 'SUCCESS'
          
          // 检查压缩打包是否完成
          const isZipCompleted = commonTask.result.zip_end === true
          
          // 如果转换任务成功且压缩打包完成，更新下载信息
          if (isTransferSuccess && commonTask.result.zip_success && isZipCompleted) {
            result.zipUrl = commonTask.result.zip_url
            result.zipFileName = commonTask.result.zipFileName
            result.status = 'completed'
            result.zipText = commonTask.result.zip_text
            
            // 停止轮询
            clearInterval(pollInterval)
            
            // 更新进度条状态
            conversionProgress.value = 100
            conversionStatus.value = 'success'
            progressText.value = '转换完成！'
            
            // 转换完成，重置转换按钮状态
            converting.value = false
            
            ElMessage.success('转换任务已完成！')
          } else if (commonTask.result.status === 'FAILED') {
            result.status = 'failed'
            // 从transferTasks中获取错误信息
            const failedTask = transferTasks.find(task => task.status === 'FAILED')
            result.errorMessage = failedTask?.errorMessage || '转换失败'
            
            // 停止轮询
            clearInterval(pollInterval)
            
            // 更新进度条状态
            conversionStatus.value = 'exception'
            progressText.value = '转换失败！'
            
            // 转换失败，重置转换按钮状态
            converting.value = false
            
            ElMessage.error('转换任务失败！')
          } else {
            // 更新进度：completeCount是已完成数量，exceptCount是总数
            const progress = Math.round((commonTask.completeCount / commonTask.exceptCount) * 100)
            conversionProgress.value = Math.min(progress, 90) // 保留10%给完成状态
            progressText.value = `正在转换... ${commonTask.completeCount}/${commonTask.exceptCount}`
            
            // 如果压缩打包完成但任务状态还不是SUCCESS，继续轮询直到状态更新
            if (isZipCompleted) {
              progressText.value = '压缩打包完成，等待任务状态更新...'
            }
          }
      }
    } catch (error) {
      console.error('轮询任务进度失败:', error)
      // 如果轮询失败，继续尝试，不停止轮询
    }
  }, 2000) // 每2秒轮询一次
  
  // 存储轮询定时器，以便后续可以停止
  const resultIndex = conversionResults.value.findIndex(item => item.id === resultId)
  if (resultIndex !== -1) {
    conversionResults.value[resultIndex].pollInterval = pollInterval
  }
}

/**
 * 获取变量总数量
 */
const getTotalVarsCount = (): number => {
  return excelParseResults.value?.vars?.length || 0
}

/**
 * 复制变量代码
 */
const copyVariableCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    ElMessage.success('变量代码已复制到剪贴板')
  } catch (error) {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = code
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    ElMessage.success('变量代码已复制到剪贴板')
  }
}

/**
 * 清除所有解析结果和文件
 */
const clearAllParseResults = () => {
  ElMessageBox.confirm(
    '确定要清除已上传的Excel文件和解析结果吗？',
    '确认清除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 清理轮询定时器
    clearAllPolling()
    
    excelParseResults.value = null
    uploadedExcelFiles.value = []
    ElMessage.success('已清除文件和解析结果')
  }).catch(() => {
    // 用户取消
  })
}

/**
 * 删除Excel文件
 */
const removeExcelFile = () => {
  ElMessageBox.confirm(
    '确定要删除此Excel文件吗？删除后将无法恢复。',
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 清除文件列表
    uploadedExcelFiles.value = []
    
    // 清除解析结果
    excelParseResults.value = null
    
    ElMessage.success('文件已删除')
  }).catch(() => {
    // 用户取消
  })
}

/**
 * 清理所有轮询定时器
 */
const clearAllPolling = () => {
  conversionResults.value.forEach(result => {
    if (result.pollInterval) {
      clearInterval(result.pollInterval)
    }
  })
}

/**
 * 重置所有数据，准备新的转换
 */
const resetForNewConversion = () => {
  ElMessageBox.confirm(
    '确定要重置所有数据开始新的转换吗？这将清除所有已上传的文件和转换结果。',
    '确认重置',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 清理轮询定时器
    clearAllPolling()
    
    // 重置所有数据
    excelParseResults.value = null
    uploadedExcelFiles.value = []
    uploadedTemplateFile.value = null
    conversionResults.value = []
    conversionProgress.value = 0
    conversionStatus.value = undefined
    progressText.value = ''
    converting.value = false
    
    ElMessage.success('已重置所有数据，可以开始新的转换')
  }).catch(() => {
    // 用户取消
  })
}

/**
 * 处理Excel文件上传成功
 */
const handleExcelUploadSuccess = async ({ response }: { response: FileUploadResponse }) => {
  // 替换之前的文件（只保留一个文件）
  uploadedExcelFiles.value = [response]
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
    bucket: fileResponse.bucket,
    engine: fileResponse.engine,
    externalDomain: fileResponse.externalDomain,
    externalUrl: fileResponse.externalUrl || "",
    fileId: parseInt(fileResponse.fileId),
    fileName: fileResponse.fileName,
    internalDomain:fileResponse.internalDomain,
    internalUrl: fileResponse.internalUrl,
    meta: null,
    path: fileResponse.path || "",
    size: fileResponse.fileSize
  }

  const result = await excelToWordApi.parseTable(params)
  console.log('解析结果:', result)
    // 保存解析结果
    excelParseResults.value = {
      fileName: fileResponse.fileName,
      vars: result.vars,
      path: result.path
    }
    
    ElMessage.success(`Excel文件"${fileResponse.fileName}"解析成功，发现 ${result.vars.length} 个变量`)
   
}

/**
 * 处理Word模板上传成功
 */
const handleTemplateUploadSuccess = ({ response }: { response: FileUploadResponse }) => {
  // 替换之前的模板文件
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
 * 处理Excel文件删除
 */
const handleExcelFileRemove = (fileId: string | number) => {
  // 清除文件列表
  uploadedExcelFiles.value = []
  // 清除解析结果
  excelParseResults.value = null
  ElMessage.success('Excel文件已删除')
}

/**
 * 处理Word模板文件删除
 */
const handleTemplateFileRemove = (fileId: string | number) => {
  // 清除模板文件
  uploadedTemplateFile.value = null
  ElMessage.success('Word模板已删除')
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
    const excelFile = uploadedExcelFiles.value[0]
    const wordFile = uploadedTemplateFile.value
    
    if (!excelFile || !wordFile) {
      throw new Error('文件信息不完整')
    }

    progressText.value = '正在调用转换接口...'
    conversionProgress.value = 30

    // 调用转换API
    const response = await excelToWordApi.transfer({
      excel: excelFile,
      word: wordFile
    })

      conversionProgress.value = 100
      conversionStatus.value = 'success'
      progressText.value = '转换任务已提交！'
      
      // 添加到转换结果
      const resultItem = {
        id: response.task.id,
        fileName: excelFile.fileName,
        status: 'submitted',
        createTime: new Date().toISOString(),
        taskId: response.task.taskId,
        taskStatus: response.task.status,
        zipUrl: '',
        zipFileName: '',
        transferTasks: [], // 存储各个Word文件的转换状态
        zipText: ''
      }
      
      conversionResults.value.unshift(resultItem)

      ElMessage.success('转换任务已成功提交！')
      
      // 开始轮询任务进度
      startTaskPolling(resultItem.taskId, resultItem.id)
  } catch (error) {
    conversionStatus.value = 'exception'
    progressText.value = '转换失败！'
    ElMessage.error('转换过程中出现错误：' + (error as Error).message)
    console.error('Conversion error:', error)
  } finally {
    converting.value = false
  }
}



/**
 * 下载转换结果
 */
const downloadResult = (result: any) => {
  if (result.zipUrl) {
    // 创建下载链接
    const link = document.createElement('a')
    link.href = result.zipUrl
    link.download = result.zipFileName || '转换结果.zip'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success(`开始下载 ${result.zipFileName}`)
  } else {
    ElMessage.warning('下载链接不可用')
  }
  console.log('下载任务:', result.taskId, '下载链接:', result.zipUrl)
}

/**
 * 批量下载转换结果
 */
const downloadBatchResult = (result: any) => {
  if (result.zipUrl) {
    // 创建下载链接
    const link = document.createElement('a')
    link.href = result.zipUrl
    link.download = result.zipFileName || '批量转换结果.zip'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success(`开始批量下载 ${result.zipFileName}`)
  } else {
    ElMessage.warning('批量下载链接不可用')
  }
  console.log('批量下载任务:', result.taskId, '下载链接:', result.zipUrl)
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
  console.log('错误详情:', result)
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
  min-height: 600px;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.result-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 500;
}

.header-batch-download-btn {
  background: #409eff;
  border-color: #409eff;
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

.result-meta .progress-text {
  margin-top: 4px;
  color: #409eff;
  font-size: 11px;
  font-style: italic;
}

.transfer-tasks-status {
  margin-top: 8px;
}

.task-status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  margin-bottom: 4px;
  border-radius: 4px;
  font-size: 11px;
}

.task-status-item.status-success {
  background: #f0f9ff;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.task-status-item.status-failed {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.task-status-item.status-processing {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fed7aa;
}

.task-status-item.status-pending {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.task-status-item.status-unknown {
  background: #f9fafb;
  color: #9ca3af;
  border: 1px solid #e5e7eb;
}

.task-status-text {
  font-weight: 500;
}

.task-file-link {
  margin-left: 8px;
}

.word-download-btn {
  font-size: 11px;
  padding: 2px 8px;
  height: auto;
  background: #409eff;
  border-color: #409eff;
}

.word-download-btn:hover {
  background: #337ecc;
  border-color: #337ecc;
}

.task-error {
  margin-left: 8px;
  color: #dc2626;
  font-size: 11px;
  font-style: italic;
  max-width: 200px;
  word-break: break-word;
}

/* 压缩包状态样式 */
.compression-status {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.status-icon {
  margin-right: 16px;
  margin-top: 2px;
}

.success-icon {
  font-size: 24px;
  color: #10b981;
}

.status-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-text {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.file-count {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  margin: 0;
}

.download-btn {
  background: #409eff;
  border-color: #409eff;
  font-weight: 500;
}

.download-btn:hover {
  background: #337ecc;
  border-color: #337ecc;
}

.download-icon {
  margin-right: 4px;
}

.status-actions {
  margin-left: auto;
}

.reset-task-btn {
  background: #f59e0b;
  border-color: #f59e0b;
  font-weight: 500;
}

.reset-task-btn:hover {
  background: #d97706;
  border-color: #d97706;
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
    min-height: auto;
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

/* 已上传文件列表样式 */
.uploaded-files {
  margin-top: 20px;
  padding: 15px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
}

.uploaded-files h4 {
  margin: 0 0 15px 0;
  color: #0369a1;
  font-size: 16px;
  font-weight: 500;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.file-name {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

/* 解析变量结果样式 */
.parse-results {
  margin-top: 20px;
  padding: 20px;
  background: #f9f9f9;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.parse-results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.parse-results h4 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 500;
}

.total-count {
  background: #67c23a;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.vars-list {
  display: flex;
  flex-direction: column;
  max-height: 400px;
  overflow-y: auto;
  gap: 0;
}

.vars-list::-webkit-scrollbar {
  width: 6px;
}

.vars-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.vars-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.vars-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 确保滚动条不影响布局 */
.vars-list {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}

.var-group {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #eee;
  flex-shrink: 0;
}

.var-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}



.remove-file-btn {
  font-size: 12px;
  padding: 4px 8px;
  height: auto;
}

.vars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 15px;
}

.var-item {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  color: #333;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.var-item:hover {
  border-color: #409eff;
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.15);
  transform: translateY(-1px);
}

.var-title {
  font-weight: 600;
  color: #2c3e50;
  font-size: 15px;
}

.var-code-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  padding: 8px 10px;
}

.var-code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  color: #0369a1;
  font-size: 13px;
  font-weight: 500;
}

.copy-icon {
  color: #94a3b8;
  font-size: 16px;
  transition: color 0.2s ease;
}

.var-item:hover .copy-icon {
  color: #409eff;
}

.parse-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 15px;
  padding: 10px 15px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  color: #0369a1;
  font-size: 13px;
  flex-shrink: 0;
}

.parse-tip .el-icon {
  font-size: 16px;
}
</style>
