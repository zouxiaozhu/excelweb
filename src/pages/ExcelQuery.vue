<template>
  <div class="excel-query-page">
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
          <h1>表格快查</h1>
          <p>上传Excel文件，快速解析和查看表格数据</p>
        </div>

        <!-- 操作步骤 -->
        <div class="steps-container">
          <el-steps :active="currentStep" finish-status="success">
            <el-step 
              title="上传Excel" 
              description="选择并上传Excel文件"
              :status="currentStep >= 0 ? 'finish' : 'wait'"
            />
            <el-step 
              title="解析数据" 
              description="解析Excel文件内容"
              :status="parseResult ? 'finish' : (currentStep >= 1 ? 'process' : 'wait')"
            />
            <el-step 
              title="查看详情" 
              description="预览和管理数据"
              :status="currentStep === 2 ? 'finish' : (parseResult ? 'finish' : 'wait')"
            />
          </el-steps>
        </div>

        <!-- 第一步：文件上传 -->
        <div v-show="currentStep === 0" class="step-content">
          <el-card class="upload-card">
            <template #header>
              <div class="card-header">
                <span>第一步：上传Excel文件</span>
              </div>
            </template>
            <FileUpload 
              :accept="'.xlsx'"
              :max-size="10"
              business-type="USER_EXCEL_PARSE"
              @success="handleUploadSuccess"
              @error="handleUploadError"
            />
          </el-card>
        </div>

        <!-- 第二步：解析数据 -->
        <div v-show="currentStep === 1" class="step-content">
          <el-card class="parse-card">
            <template #header>
              <div class="card-header">
                <span>第二步：解析Excel数据</span>
              </div>
            </template>
            <div class="parse-content">
              <div class="file-info">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="文件名">
                    {{ currentFileInfo?.fileName }}
                  </el-descriptions-item>
                  <el-descriptions-item label="文件大小">
                    {{ (currentFileInfo?.sizeText || 0) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="上传时间">
                    {{ currentFileInfo?.uploadTime }}
                  </el-descriptions-item>
                  <el-descriptions-item label="文件ID">
                    {{ currentFileInfo?.fileId }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
              
              <!-- 解析状态显示 -->
              <div v-if="parsing" class="parse-status">
                <el-alert
                  title="正在解析中..."
                  type="info"
                  :closable="false"
                  show-icon
                >
                  <template #default>
                    <p>文件正在解析中，请稍候...</p>
                  </template>
                </el-alert>
              </div>
              
              <div v-else-if="parseResult" class="parse-status">
                <el-alert
                  title=""
                  type="success"
                  :closable="false"
                  show-icon
                >
                  <template #default>
                    <p>文件解析已完成，可以查看解析结果或重新上传文件进行新的解析。</p>
                  </template>
                </el-alert>
              </div>
              
              <div class="parse-actions">
                <!-- 只有在未解析完成且当前文件未被解析过时才显示解析按钮 -->
                <el-button 
                  v-if="!parseResult && !hasParsedCurrentFile"
                  type="primary" 
                  size="large"
                  :loading="parsing"
                  @click="handleParse"
                >
                  {{ parsing ? '解析中...' : '开始解析' }}
                </el-button>
                
                <!-- 重新上传按钮始终显示 -->
                <el-button 
                  type="default" 
                  size="large"
                  @click="handleReupload"
                  style="margin-left: 10px;"
                >
                  重新上传文件
                </el-button>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 第三步：查看详情 -->
        <div v-show="currentStep === 2" class="step-content">
          <el-card class="detail-card">
            <template #header>
              <div class="card-header">
                <span>第三步：查看解析结果</span>
                <div class="header-actions">
                  <el-button type="primary" @click="createNewParse">创建新的解析</el-button>
                  <el-button type="success" @click="viewDetail">查看详情</el-button>
                </div>
              </div>
            </template>
            <div v-if="parseResult" class="parse-result">
              <el-alert
                :title="`解析完成`"
                type="success"
                :closable="false"
                show-icon
              />
              
              <!-- 工作表预览 -->
              <div v-if="parseResult.data?.sheets" class="sheets-preview">
                <h3>工作表预览</h3>
                <el-tabs v-model="activeSheet" type="card">
                  <el-tab-pane 
                    v-for="(sheet, index) in parseResult.data.sheets" 
                    :key="index"
                    :label="`${sheet.sheetName} (${sheet.rowCount}行)`"
                    :name="index.toString()"
                  >
                    <div class="sheet-content">
                      <el-table 
                        :data="sheet.rows.slice(0, 10)" 
                        border
                        style="width: 100%"
                        max-height="400"
                      >
                        <el-table-column
                          v-for="(cell, cellIndex) in sheet.rows[0]?.cells || []"
                          :key="cellIndex"
                          :prop="`cells.${cellIndex}.value`"
                          :label="`列${cellIndex + 1}`"
                          width="120"
                        >
                          <template #default="{ row }">
                            {{ row.cells[cellIndex]?.value || '' }}
                          </template>
                        </el-table-column>
                      </el-table>
                      <div v-if="sheet.rowCount > 10" class="more-data-tip">
                        <el-text type="info">仅显示前10行数据，完整数据请查看详情</el-text>
                      </div>
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 解析任务列表 -->
        <div class="tasks-section">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>解析任务列表</span>
                <el-button @click="refreshTasks" :icon="Refresh">刷新</el-button>
              </div>
            </template>
            <el-table 
              :data="taskList" 
              :loading="loadingTasks"
              border
              style="width: 100%"
            >
              <el-table-column prop="excelFile" label="任务名" min-width="250" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="开始时间" width="160">
                <template #default="{ row }">
                  {{ formatTime(row.startTime) }}
                </template>
              </el-table-column>
              <el-table-column label="结束时间" width="160">
                <template #default="{ row }">
                  {{ formatTime(row.endTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="创建时间" width="160" />
              <el-table-column label="时间状态" width="120">
                <template #default="{ row }">
                  <div class="time-status-container">
                    <el-tag 
                      v-if="isTaskNotStarted(row)" 
                      type="warning" 
                      size="small"
                    >
                      未开始
                    </el-tag>
                    <el-tag 
                      v-else-if="isTaskExpired(row)" 
                      type="danger" 
                      size="small"
                    >
                      已过期
                    </el-tag>
                    <el-tag 
                      v-else-if="row.startTime || row.endTime" 
                      type="success" 
                      size="small"
                    >
                      进行中
                    </el-tag>
                    <el-tag 
                      v-else 
                      type="info" 
                      size="small"
                    >
                      无时间限制
                    </el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="操作" min-width="300">
                <template #default="{ row }">
                  <el-button 
                    type="primary" 
                    size="small"
                    @click="viewTaskDetail(row)"
                  >
                    查看详情
                  </el-button>
                  <el-button 
                    type="success" 
                    size="small"
                    @click="downloadFile(row)"
                  >
                    下载文件
                  </el-button>
                  <el-button 
                    type="warning" 
                    size="small"
                    @click="editTask(row)"
                  >
                    设置
                  </el-button>
                  <el-button 
                    type="info" 
                    size="small"
                    @click="shareTask(row)"
                  >
                    分享
                  </el-button>
                  <el-button 
                    type="danger" 
                    size="small"
                    @click="deleteTask(row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <!-- 分页 -->
            <div class="pagination-wrapper">
              <el-pagination
                v-model:current-page="pagination.current"
                v-model:page-size="pagination.pageSize"
                :total="pagination.total"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
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

    <!-- 任务设置弹框 -->
    <TaskSettingDialog
      v-model="showTaskSettingDialog"
      :task="currentTask"
      @save="handleTaskSettingSave"
    />

    <!-- Excel数据详情弹框 -->
    <ExcelDataDetailDialog
      v-model="showExcelDetailDialog"
      :task="currentTask"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * @component ExcelQuery
 * @description 表格快查页面，提供Excel文件上传、解析、预览功能
 * 
 * @dependencies
 * @api fileApi.upload - 文件上传接口
 * @api excelApi.parse - Excel解析接口
 * @api excelApi.getExcelFileList - 获取解析任务列表
 * @store globalStore - 全局状态管理
 */

import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import FileUpload from '@/components/FileUpload.vue'
import { excelApi } from '@/services/api'
import { useGlobalStore } from '@/store'
import AuthModal from '@/components/AuthModal.vue'
import LoginChoiceDialog from '@/components/LoginChoiceDialog.vue'
import TaskSettingDialog from '@/components/TaskSettingDialog.vue'
import ExcelDataDetailDialog from '@/components/ExcelDataDetailDialog.vue'
import type { 
  FileUploadResponse, 
  ExcelParseResponse, 
  ExcelParseTask,
  ExcelSheet,
  TaskSettingData
} from '@/typings/api'
import { debug } from 'console'

const router = useRouter()
const globalStore = useGlobalStore()

// 响应式数据
const showAuthModal = ref(false)
const showLoginChoiceDialog = ref(false)
const hideExperienceWarning = ref(false)
const showTaskSettingDialog = ref(false)
const showExcelDetailDialog = ref(false)
const currentTask = ref<ExcelParseTask | null>(null)

// 计算属性 - 登录状态
const isLoggedIn = computed(() => globalStore.isLoggedIn)
const isExperienceAccount = computed(() => globalStore.isExperienceAccount)

// 响应式数据
const currentStep = ref(0)
const parsing = ref(false)
const loadingTasks = ref(false)
const activeSheet = ref('0')
const hasParsedCurrentFile = ref(false)

const currentFileInfo = ref<FileUploadResponse | null>(null)
const parseResult = ref<ExcelParseResponse | null>(null)
const taskList = ref<ExcelParseTask[]>([])

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

/**
 * 返回首页
 */
const goBack = () => {
  router.push('/')
}


/**
 * 处理文件上传成功
 */
const handleUploadSuccess = ({ response }: { response: FileUploadResponse }) => {
  currentFileInfo.value = response
  // 重置解析状态，因为这是新文件
  parseResult.value = null
  hasParsedCurrentFile.value = false
  parsing.value = false
  
  globalStore.setCurrentFile({
    fileId: response.fileId,
    fileName: response.fileName,
    fileSize: response.fileSize,
  })
  currentStep.value = 1
  ElMessage.success('文件上传成功！')
}

/**
 * 处理文件上传失败
 */
const handleUploadError = (error: Error) => {
  ElMessage.error('文件上传失败：' + error.message)
}

/**
 * 处理重新上传
 */
const handleReupload = () => {
  // 清空当前文件信息和解析结果
  currentFileInfo.value = null
  parseResult.value = null
  hasParsedCurrentFile.value = false
  globalStore.clearCurrent()
  
  // 回到第一步
  currentStep.value = 0
  
  ElMessage.info('请重新选择文件上传')
}

/**
 * 处理Excel解析
 */
const handleParse = async () => {
  if (!currentFileInfo.value) {
    ElMessage.error('请先上传文件')
    return
  }

  parsing.value = true
  try {
    const response = await excelApi.parse(currentFileInfo.value.fileId)
    console.log('解析接口返回:', response)
    
          // 检查解析接口返回的状态
      if (response && response.id) {
        // 解析完成，设置解析结果
        parseResult.value = response
        hasParsedCurrentFile.value = true
        ElMessage.success('解析完成！')
        parsing.value = false
      } else {
        // 解析失败或没有返回ID
        ElMessage.error('解析失败，请重试')
        parsing.value = false
      }
    await loadTasks()
  } catch (error) {
    ElMessage.error('解析失败，请重试')
    console.error('Parse error:', error)
    parsing.value = false
  }
}

/**
 * 轮询解析状态
 */
const pollParseStatus = (taskId: string) => {
  console.log('开始轮询任务状态:', taskId)
  const timer = setInterval(async () => {
    try {
      const result = await excelApi.getTaskDetail(taskId)
      console.log('轮询状态结果:', result)
      
      if (result.status === 'completed') {
        parseResult.value = result
        // 解析完成后保持在第二步，不自动跳转到第三步
        ElMessage.success('解析完成！')
        clearInterval(timer)
        parsing.value = false // 停止loading状态
        await loadTasks()
      } else if (result.status === 'failed') {
        ElMessage.error('解析失败：' + (result.message || '未知错误'))
        clearInterval(timer)
        parsing.value = false // 停止loading状态
      } else if (result.status === 'processing' || result.status === 'pending') {
        // 继续轮询，状态还在处理中
        console.log('任务状态:', result.status, '继续轮询...')
      }
    } catch (error) {
      console.error('Poll status error:', error)
      // 轮询出错时不要立即停止，继续尝试
    }
  }, 2000)

  // 30秒后停止轮询
  setTimeout(() => {
    clearInterval(timer)
    if (parsing.value) {
      ElMessage.warning('解析超时，请检查任务状态')
      parsing.value = false // 超时后停止loading状态
    }
  }, 30000)
}

/**
 * 查看详情
 */
const viewDetail = () => {
  if (parseResult.value?.data) {
    ElMessageBox.alert(
      `文件解析完成！\n工作表数量：${parseResult.value.data.sheets?.length}\n总行数：${parseResult.value.data.totalRows}\n总列数：${parseResult.value.data.totalColumns}`,
      '解析详情',
      { type: 'info' }
    )
  }
}

/**
 * 查看解析结果
 */
const viewParseResult = () => {
  if (parseResult.value) {
    currentStep.value = 2
  }
}

/**
 * 创建新的解析
 */
const createNewParse = () => {
  // 清空当前文件信息和解析结果
  currentFileInfo.value = null
  parseResult.value = null
  hasParsedCurrentFile.value = false
  parsing.value = false
  globalStore.clearCurrent()
  
  // 回到第一步
  currentStep.value = 0
  
  ElMessage.info('请上传新的Excel文件进行解析')
}

/**
 * 加载任务列表
 */
const loadTasks = async () => {
  loadingTasks.value = true
  try {
    const response = await excelApi.getExcelFileList({
      page: pagination.current,
      size: pagination.pageSize
    })
    taskList.value = response.records
    pagination.total = response.total
  } catch (error) {
    ElMessage.error('加载任务列表失败')
    console.error('Load tasks error:', error)
  } finally {
    loadingTasks.value = false
  }
}

/**
 * 刷新任务列表
 */
const refreshTasks = () => {
  loadTasks()
}

/**
 * 获取状态类型
 */
const getStatusType = (status: string) => {
  switch (status) {
    case 'Enable': return 'success'
    case 'Disable': return 'info'
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
    case 'Enable': return '启用'
    case 'Disable': return '禁用'
    case 'pending': return '待处理'
    case 'processing': return '处理中'
    case 'completed': return '已完成'
    case 'failed': return '失败'
    default: return status
  }
}

/**
 * 查看任务详情
 */
const viewTaskDetail = (task: ExcelParseTask) => {
  currentTask.value = task
  showExcelDetailDialog.value = true
}

/**
 * 显示错误信息
 */
const showError = (task: ExcelParseTask) => {
  ElMessageBox.alert(
    task.errorMessage || '未知错误',
    '错误详情',
    { type: 'error' }
  )
}

/**
 * 下载文件
 */
const downloadFile = (task: ExcelParseTask) => {
  try {
    // 检查是否有文件信息
    if (!task.fileInfo || !task.fileInfo.externalUrl) {
      ElMessage.error('文件下载链接不存在')
      return
    }

    const downloadUrl = task.fileInfo.externalUrl
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = downloadUrl
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success('开始下载文件')
    console.log('下载文件:', task.fileInfo.fileName, 'URL:', downloadUrl)
  } catch (error: any) {
    ElMessage.error('下载失败：' + (error.message || '未知错误'))
    console.error('下载文件错误:', error)
  }
}

/**
 * 设置任务
 */
const editTask = (task: ExcelParseTask) => {
  currentTask.value = task
  showTaskSettingDialog.value = true
}

/**
 * 分享任务
 */
const shareTask = (task: ExcelParseTask) => {
  try {
    // 生成分享链接
    const shareUrl = `${window.location.origin}/excel-search?fileCoding=${task.fileCoding || task.id}`
    
    // 复制到剪贴板
    navigator.clipboard.writeText(shareUrl).then(() => {
      ElMessage.success('分享链接已复制到剪贴板')
      
      // 显示分享链接详情
      ElMessageBox.alert(
        `<div style="text-align: left;">
          <p><strong>分享链接：</strong></p>
          <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px; margin: 10px 0;">
            ${shareUrl}
          </p>
          <p style="color: #666; font-size: 14px;">
            链接已复制到剪贴板，可以直接分享给其他人使用。
          </p>
        </div>`,
        '分享成功',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定',
          type: 'success'
        }
      )
    }).catch(() => {
      // 如果复制失败，直接显示链接
      ElMessageBox.alert(
        `<div style="text-align: left;">
          <p><strong>分享链接：</strong></p>
          <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px; margin: 10px 0;">
            ${shareUrl}
          </p>
          <p style="color: #666; font-size: 14px;">
            请手动复制链接分享给其他人。
          </p>
        </div>`,
        '分享链接',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '复制链接',
          type: 'info'
        }
      ).then(() => {
        // 用户点击确定后，尝试复制
        navigator.clipboard.writeText(shareUrl).then(() => {
          ElMessage.success('链接已复制')
        }).catch(() => {
          ElMessage.warning('复制失败，请手动复制')
        })
      })
    })
    
    console.log('分享任务:', task.excelFile, '链接:', shareUrl)
  } catch (error: any) {
    ElMessage.error('生成分享链接失败：' + (error.message || '未知错误'))
    console.error('分享任务错误:', error)
  }
}



/**
 * 删除任务
 */
const deleteTask = async (task: ExcelParseTask) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除任务 "${task.excelFile}" 吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: false
      }
    )
    
    // 调用删除API
    await excelApi.deleteTask(task.id || task.taskId)
    
    ElMessage.success('删除成功')
    console.log('删除任务:', task)
    
    // 重新加载任务列表
    await loadTasks()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + (error.message || '未知错误'))
      console.error('删除任务错误:', error)
    } else {
      ElMessage.info('已取消删除')
    }
  }
}

/**
 * 处理页大小变化
 */
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadTasks()
}

/**
 * 处理当前页变化
 */
const handleCurrentChange = (page: number) => {
  pagination.current = page
  loadTasks()
}

// 组件挂载时检查登录状态并加载任务列表
onMounted(() => {
  // 检查登录状态
  if (!isLoggedIn.value) {
    showLoginChoiceDialog.value = true
    return
  }
  
  loadTasks()
  

})

/**
 * 处理登录成功
 */
const handleLoginSuccess = () => {
  loadTasks()
}

/**
 * 处理显示正常登录
 */
const handleShowNormalLogin = () => {
  showAuthModal.value = true
}

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化时间
 */
const formatTime = (time: string | null | undefined): string => {
  if (!time) return '未设置'
  return time
}

/**
 * 判断任务是否过期
 */
const isTaskExpired = (task: ExcelParseTask): boolean => {
  const now = new Date()
  
  // 如果设置了开始时间，且当前时间在开始时间之前，则不算过期
  if (task.startTime) {
    const startTime = new Date(task.startTime)
    if (now < startTime) {
      return false // 还未开始，不算过期
    }
  }
  
  // 如果设置了结束时间，且当前时间在结束时间之后，则算过期
  if (task.endTime) {
    const endTime = new Date(task.endTime)
    if (now > endTime) {
      return true // 已过期
    }
  }
  
  return false
}

/**
 * 判断任务是否未开始
 */
const isTaskNotStarted = (task: ExcelParseTask): boolean => {
  if (!task.startTime) return false
  
  const now = new Date()
  const startTime = new Date(task.startTime)
  return now < startTime
}

/**
 * 处理任务设置保存
 */
const handleTaskSettingSave = async (settingData: TaskSettingData) => {
  try {
    const taskId = currentTask.value?.id || currentTask.value?.taskId
    if (!taskId) {
      ElMessage.error('任务ID不存在')
      return
    }
    
    // 调用API保存任务设置
    await excelApi.updateTaskSetting(taskId, settingData)
    
    ElMessage.success('任务设置保存成功')
    showTaskSettingDialog.value = false
    
    // 重新加载任务列表
    await loadTasks()
  } catch (error: any) {
    console.error('保存任务设置错误:', error)
    ElMessage.error('保存设置失败：' + (error.message || '未知错误'))
  }
}
</script>

<style scoped>
.excel-query-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  width: 100%;
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

.steps-container {
  margin-bottom: 40px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.step-content {
  margin-bottom: 30px;
}

.upload-card,
.parse-card,
.detail-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.parse-content {
  text-align: center;
}

.file-info {
  margin-bottom: 30px;
}

.parse-actions {
  margin-top: 20px;
}

.parse-status {
  margin: 20px 0;
  padding: 15px;
  background-color: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #e0f2fe;
}

.parse-result {
  text-align: left;
}

.sheets-preview {
  margin-top: 30px;
}

.sheets-preview h3 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.sheet-content {
  margin-top: 20px;
}

.more-data-tip {
  text-align: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-top: 15px;
}

.tasks-section {
  margin-top: 40px;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: center;
}

.hidden {
  display: none !important;
}

.status-container,
.time-container,
.time-status-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 24px;
  }
  
  .back-btn {
    position: static;
    margin-bottom: 15px;
  }
  
  .steps-container {
    padding: 20px 15px;
  }
  
  :deep(.el-steps--horizontal) {
    display: flex;
    flex-direction: column;
  }
  
  :deep(.el-step) {
    margin-bottom: 15px;
  }
}
</style>
