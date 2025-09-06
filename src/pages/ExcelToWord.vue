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
                                    <el-text type="warning" size="small">您正在使用体验账号，数据仅用于测试，请勿上传重要数据。数据会定期清理，建议使用自己的账号登录。</el-text>
        </template>
      </el-alert>
    </div>

    <div class="container">
      <div class="page-container">
        <!-- 页面头部 -->
        <div class="page-header">
          <div class="header-content">
            <div class="title-section">
              <h1>Excel转Word工具</h1>
              <el-text type="info" size="default">批量将Excel数据填充到Word模板中,支持变量替换</el-text>
            </div>
            <div class="header-actions">
              <el-button 
                type="default" 
                @click="goToHistoryPage"
                class="history-btn"
              >
                <el-icon><Clock /></el-icon>
                历史记录
              </el-button>
            </div>
          </div>
        </div>

        <!-- 主要内容区域 -->
        <div class="main-content">
          <el-row :gutter="40">
            <!-- 左侧：上传和操作步骤 -->
            <el-col :span="14">
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
                  
                  <!-- 显示解析的变量 -->
                  <div v-if="excelParseResults" class="parse-results">
                    <div class="parse-results-header">
                      <h4>Excel变量列表</h4>
                      <div class="header-actions">
                        <el-tag type="success" size="small">
                          共{{ getTotalVarsCount() }}个
                        </el-tag>
                        <el-button 
                          type="danger" 
                          size="small" 
                          @click="clearAllParseResults"
                          class="clear-btn"
                        >
                          <el-icon><Delete /></el-icon>
                          清除
                        </el-button>
                      </div>
                    </div>
                    <div class="vars-list">
                      <el-card 
                        v-for="(variable, varIndex) in excelParseResults.vars" 
                        :key="varIndex"
                        class="var-card"
                        shadow="hover"
                        @click="copyVariableCode(variable.var)"
                        style="cursor: pointer;"
                      >
                        <template #header>
                          <div class="var-title">
                            <el-icon><Document /></el-icon>
                            {{ variable.title }}
                          </div>
                        </template>
                        <div class="var-code-wrapper">
                          <el-text type="primary" class="var-code">{{ variable.var }}</el-text>
                          <el-icon class="copy-icon"><CopyDocument /></el-icon>
                        </div>
                      </el-card>
                      <el-alert
                        title="使用提示"
                        type="info"
                        :closable="false"
                        show-icon
                        class="parse-tip"
                      >
                        <template #default>
                          <el-text type="info" size="small">点击变量卡片可复制代码到剪贴板</el-text>
                        </template>
                      </el-alert>
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
                      <el-icon v-if="!converting"><VideoPlay /></el-icon>
                      {{ converting ? '转换中...' : '开始转换' }}
                    </el-button>
                    <el-button 
                      v-else
                      type="success" 
                      size="large"
                      @click="resetForNewConversion"
                      class="convert-btn"
                    >
                      <el-icon><Refresh /></el-icon>
                      开始新的转换
                    </el-button>
                  </div>
                </div>
              </div>
            </el-col>

            <!-- 右侧：转换结果 -->
            <el-col :span="10">
              <div class="right-panel">
                <div class="result-header">
                  <h3>转换结果</h3>
                  
                </div>
                <div class="result-content">
                  <div v-if="!conversionMainResult && conversionResults.length === 0" class="empty-result">
                    <div class="empty-icon">
                      <el-icon size="60"><Box /></el-icon>
                    </div>
                    <el-text type="info" size="large">暂无转换结果</el-text>
                  </div>
                  <div v-else class="result-list">
                    <!-- 第一块：压缩包状态和进度 -->
                    <div v-if="conversionMainResult" class="compression-section">
                      <div class="section-header">
                        <h4>压缩包状态</h4>
                        <el-tag type="info" size="small">共{{ getTotalFileCount() }}个文件</el-tag>
                      </div>
                      
                      <div class="compression-status">
                        <div class="status-icon">
                          <el-icon class="success-icon"><CircleCheck /></el-icon>
                        </div>
                        <div class="status-content">
                          <el-text class="status-text" type="primary">{{ getCompressionStatusText() }}</el-text>
                          <div class="progress-info">
                            <el-text type="info" size="small">
                              进度: {{ conversionMainResult.completeCount }}/{{ conversionMainResult.exceptCount }}
                            </el-text>
                          </div>
                        </div>
                        <div class="status-actions">
                          <el-button 
                            v-if="getCompressionDownloadUrl()"
                            type="primary" 
                            size="small"
                            @click="downloadCompressionPackage"
                            class="header-batch-download-btn"
                          >
                            <el-icon><Download /></el-icon>
                            批量下载
                          </el-button>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 第二块：转换的每一个Word文件 -->
                    <div v-if="conversionResults.length > 0" class="files-section">
                      <div class="section-header">
                        <h4>转换文件列表</h4>
                        <el-tag type="info" size="small">{{ conversionResults.length }}个文件</el-tag>
                      </div>
                      
                      <div class="files-list">
                        <div 
                          v-for="task in conversionResults" 
                          :key="task.id"
                          class="file-item"
                          :class="getTaskStatusClass(task.status)"
                        >
                          <div class="file-info">
                            <el-icon class="file-icon"><Document /></el-icon>
                            <div class="file-details">
                              <div class="file-name">{{ getTaskFileName(task) }}</div>
                              <el-text v-if="getTransferTaskStatusText(task.status)" type="info" size="small">
                                {{ getTransferTaskStatusText(task.status) }}
                              </el-text>
                            </div>
                          </div>
                          <div class="file-actions">
                            <!-- 成功且有URL时显示下载按钮 -->
                            <el-button 
                                v-if="task.status === 'SUCCESS' && task.fileUrl"
                                type="primary" 
                                size="small"
                                @click="downloadWordFile(task.fileUrl, task.id)"
                                class="download-btn"
                              >
                                <el-icon><Download /></el-icon>
                                下载
                              </el-button>
                            <!-- 失败时显示错误信息 -->
                            <el-alert
                              v-if="task.status === 'FAILED' && task.errorMessage"
                              :title="task.errorMessage"
                              type="error"
                              :closable="false"
                              show-icon
                              class="error-alert"
                            />
                          </div>
                        </div>
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
          <el-card shadow="always">
            <template #header>
              <div class="progress-header">
                <el-icon class="progress-icon"><Loading /></el-icon>
                <span>转换进度</span>
              </div>
            </template>
            <div class="progress-content">
              <el-progress 
                :percentage="conversionProgress" 
                :status="conversionStatus"
                :stroke-width="8"
                :show-text="true"
                :format="(percentage) => `${percentage}%`"
              />
              <el-text class="progress-text" type="info">{{ progressText }}</el-text>
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

import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Document, Box, CircleCheck, Clock, Delete, CopyDocument, Loading, VideoPlay, Refresh, Download } from '@element-plus/icons-vue'
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
// 转换任务列表（每个Word文件）
const conversionResults = ref<{
  id: string,
  taskId: string,
  taskType: string,
  fromObject: string,
  toObject: string,
  fromOssType: string,
  toOssType: string,
  status: string,
  fileUrl: string,
  remark: string,
  errorMessage: string,
  createdAt: string,
  updatedAt: string
}[]>([])

// 主要转换结果（压缩包、状态等）
const conversionMainResult = ref<{
  id: number,
  remark: string,
  taskId: string,
  exceptCount: number,
  completeCount: number,
  status: string,
  payload: any,
  result: any,
  fileName: string,
  zipUrl: string,
  zipText: string,
  zipFileName: string,
  createTime: string,
  taskStatus: string
} | null>(null)


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
  return conversionMainResult.value?.status === 'SUCCESS' || conversionMainResult.value?.status === 'completed'
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
 * 获取任务文件名
 */
const getTaskFileName = (task: {
  id: string
  remark?: string
  [key: string]: any
}): string => {

    
var toObject=    task.toObject;
const fileName = toObject.substring(toObject.lastIndexOf('/') + 1);
  
  
  // 默认文件名
  return fileName;
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
 * 获取压缩包状态文本
 */
const getCompressionStatusText = (): string => {
  if (conversionMainResult.value?.zipText) {
    return conversionMainResult.value.zipText
  }
  return '压缩包已生成,可批量下载'
}

/**
 * 获取压缩包下载链接
 */
const getCompressionDownloadUrl = (): string => {
  return conversionMainResult.value?.zipUrl || ''
}

/**
 * 获取总文件数量
 */
const getTotalFileCount = (): number => {
  return conversionResults.value.length
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
const startTaskPolling = (taskId: string, _resultId: number) => {
  const pollInterval = setInterval(async () => {
    try {
      const response = await excelToWordApi.getTaskProgress({
        taskId: taskId,
        onlyTask: false,
        excludeIds: ''
      })

      const { transferTasks, commonTask } = response
      // 更新转换任务列表
      if (transferTasks && transferTasks.length > 0) {
        console.log('更新transferTasks:', transferTasks)
        // 更新conversionResults数组
        conversionResults.value = transferTasks
        
        // 计算进度
        const successCount = commonTask.completeCount;
        const totalCount = commonTask.exceptCount;
        
        if (conversionMainResult.value) {
          conversionMainResult.value.completeCount = successCount;
        }
      
        conversionProgress.value = Math.floor((successCount / totalCount) * 100)
        
        // 更新进度文本
        if (commonTask.status === 'PROCESSING' || commonTask.status === 'PENDING') {
          progressText.value = `正在转换中... (${successCount}/${totalCount})`
        }
        
        console.log('转换进度:', successCount, '/', totalCount, '=', conversionProgress.value)
      }
      
      var zipText = "";
      var zipUrl = "";
      var zipFileName = "";
              // 更新压缩包信息
      if (commonTask.result && conversionMainResult.value) {
        if (commonTask.result.zip_text) {
          progressText.value = commonTask.result.zip_text
          zipText = commonTask.result.zip_text
          conversionMainResult.value.zipText = zipText;
        }
        
        if (commonTask.result.zip_url) {
          zipUrl = commonTask.result.zip_url
          progressText.value = "压缩包已生成,可批量下载"
          conversionMainResult.value.zipUrl = zipUrl;
        }
        
        if (commonTask.result.zipFileName) {
          zipFileName = commonTask.result.zipFileName
          conversionMainResult.value.zipFileName = zipFileName;
        }
      }
      
      // 检查任务是否完成
      if (commonTask.status === 'SUCCESS') {
        // 停止轮询
        clearInterval(pollInterval)
        // 更新进度条状态
        conversionProgress.value = 100
        conversionStatus.value = 'success'
        progressText.value = '转换完成！'
        
        // 转换完成，重置转换按钮状态
        converting.value = false
        
        // 显示成功消息
        const successCount = commonTask.completeCount;
        ElMessage.success(`转换任务已完成！共生成 ${successCount} 个文件`)
      } else if (commonTask.status === 'FAILED') {
        // 任务失败
        clearInterval(pollInterval)
        conversionStatus.value = 'exception'
        progressText.value = '转换失败！'
        converting.value = false
        ElMessage.error('转换任务失败，请重试')
      }
    } catch (error) {
      console.error('轮询任务进度失败:', error)
      // 如果轮询失败，继续尝试，不停止轮询
    }
  }, 2000) // 每2秒轮询一次
  
  // 存储轮询定时器，以便后续可以停止
  // 注意：由于数据结构改变，这里不再需要存储pollInterval到数组中
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
    conversionResults.value = []
    conversionMainResult.value = null
    ElMessage.success('已清除文件和解析结果')
  }).catch(() => {
    // 用户取消
  })
}


/**
 * 清理所有轮询定时器
 */
const clearAllPolling = () => {
  // 由于数据结构改变，这里不再需要清理轮询定时器
  // 轮询定时器会在任务完成或失败时自动清理
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
    conversionMainResult.value = null
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
    bucket: fileResponse.bucket || "",
    engine: fileResponse.engine || "",
    externalDomain: fileResponse.externalDomain || "",
    externalUrl: fileResponse.externalUrl || "",
    fileId: parseInt(fileResponse.fileId),
    fileName: fileResponse.fileName,
    internalDomain: fileResponse.internalDomain || "",
    internalUrl: fileResponse.internalUrl || "",
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
const handleExcelFileRemove = (_fileId: string | number) => {
  // 清除文件列表
  uploadedExcelFiles.value = []
  // 清除解析结果
  excelParseResults.value = null
  ElMessage.success('Excel文件已删除')
}

/**
 * 处理Word模板文件删除
 */
const handleTemplateFileRemove = (_fileId: string | number) => {
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

      conversionProgress.value = 30
      conversionStatus.value = undefined
      progressText.value = '转换任务已提交！'
      
      // 添加到转换结果
      const resultItem = {
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
      conversionMainResult.value = {
        id: response.task.id,
        fileName: excelFile.fileName,
        status: response.task.status,
        exceptCount: response.task.exceptCount || 0,
        completeCount: 0,
        payload: response.task.payload,
        result: response.task.result,
        remark: '',
        taskId: response.task.taskId,
        zipUrl: '',
        zipText: '',
        zipFileName: '',
        createTime: new Date().toISOString(),
        taskStatus: response.task.status
      }

      ElMessage.success('转换任务已成功提交！')
      
      // 开始轮询任务进度
      startTaskPolling(resultItem.taskId, conversionMainResult.value.id)
      
      // 注意：不在这里设置 converting.value = false，让轮询函数来控制转换状态
  } catch (error) {
    conversionStatus.value = 'exception'
    progressText.value = '转换失败！'
    converting.value = false // 只有在出错时才重置转换状态
    ElMessage.error('转换过程中出现错误：' + (error as Error).message)
    console.error('Conversion error:', error)
  }
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

/**
 * 跳转到历史记录页面
 */
const goToHistoryPage = () => {
  router.push('/excel-to-word-history')
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
  margin-bottom: 20px;
  padding: 20px 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.title-section h1 {
  font-size: 32px;
  color: #2c3e50;
  margin: 0 0 8px;
  font-weight: 600;
}

.title-section p {
  color: #7f8c8d;
  font-size: 16px;
  margin: 0;
}

.history-btn {
  height: 40px;
  padding: 0 20px;
  font-weight: 500;
  border-radius: 8px;
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
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

.step-section {
  margin-bottom: 24px;
}

.step-section:last-child {
  margin-bottom: 0;
}

.step-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.step-number {
  width: 32px;
  height: 32px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  margin-right: 12px;
}

.step-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 500;
}

.upload-area {
  border: 2px dashed #e4e7ed;
  border-radius: 8px;
  padding: 20px;
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
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.result-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 500;
}

.header-batch-download-btn {
  background: #409eff;
  border-color: #409eff;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
}

.header-batch-download-btn:hover {
  background: #337ecc;
  border-color: #337ecc;
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
  height: 200px;
  color: #64748b;
  background: white;
  border-radius: 12px;
  border: 2px dashed #cbd5e1;
  margin: 20px 0;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.7;
  color: #94a3b8;
}

.empty-text {
  font-size: 16px;
  margin: 0;
  font-weight: 500;
  color: #64748b;
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
  padding: 8px 12px;
  margin-bottom: 6px;
  border-radius: 6px;
  font-size: 12px;
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.task-file-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 13px;
  word-break: break-word;
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
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
.compression-section {
  margin-bottom: 24px;
  background: #f9f9f9;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h4 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.file-count, .files-count {
  background: #67c23a;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.compression-status {
  display: flex;
  align-items: center;
  padding: 15px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 10px;
}

.progress-info {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.status-icon {
  margin-right: 12px;
  color: #67c23a;
  font-size: 20px;
}

.success-icon {
  font-size: 20px;
  color: #67c23a;
}

.status-content {
  flex: 1;
}

.status-text {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
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

/* 文件列表样式 */
.files-section {
  margin-bottom: 24px;
  background: #f9f9f9;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.files-list::-webkit-scrollbar {
  width: 6px;
}

.files-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.files-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.files-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: white;
  transition: all 0.2s ease;
}

.file-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.file-info {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 12px;
}

.file-icon {
  color: #409eff;
  font-size: 18px;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
  margin-bottom: 4px;
  word-break: break-word;
  line-height: 1.4;
}

.file-status {
  font-size: 12px;
  color: #909399;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.download-btn {
  font-size: 12px;
  padding: 6px 12px;
  height: auto;
  border-radius: 4px;
  font-weight: 500;
  background: #409eff;
  border-color: #409eff;
}

.download-btn:hover {
  background: #337ecc;
  border-color: #337ecc;
}

.error-alert {
  max-width: 200px;
  font-size: 11px;
}

.error-alert :deep(.el-alert__content) {
  padding: 0;
}

.error-alert :deep(.el-alert__title) {
  font-size: 11px;
  line-height: 1.4;
}

/* 文件状态样式 */
.file-item.status-success {
  border-color: #67c23a;
  background: #f0f9ff;
}

.file-item.status-failed {
  border-color: #f56c6c;
  background: #fef0f0;
}

.file-item.status-processing {
  border-color: #e6a23c;
  background: #fdf6ec;
}

.file-item.status-pending {
  border-color: #909399;
  background: #f4f4f5;
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

.progress-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.progress-icon {
  color: #409eff;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.progress-content {
  text-align: center;
  padding: 20px;
}

.progress-text {
  margin-top: 15px;
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
  
  /* 移动端时恢复等宽布局 */
  .el-col {
    width: 100% !important;
    flex: 0 0 100% !important;
    max-width: 100% !important;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .title-section h1 {
    font-size: 28px;
  }
  
  .title-section p {
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
  margin-top: 12px;
  padding: 16px;
  background: #f9f9f9;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.parse-results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
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
  gap: 12px;
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

.var-card {
  transition: all 0.2s ease;
}

.var-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.var-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.var-code-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  padding: 8px 12px;
}

.var-code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  font-weight: 500;
}

.copy-icon {
  color: #94a3b8;
  font-size: 16px;
  transition: color 0.2s ease;
}

.var-card:hover .copy-icon {
  color: #409eff;
}

.parse-tip {
  margin-top: 12px;
}
</style>
