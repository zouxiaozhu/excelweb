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
            <el-step title="上传Excel" description="选择并上传Excel文件" />
            <el-step title="解析数据" description="解析Excel文件内容" />
            <el-step title="查看详情" description="预览和管理数据" />
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
              :accept="'.xlsx,.xls'"
              :max-size="10"
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
                    {{ formatFileSize(currentFileInfo?.fileSize || 0) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="上传时间">
                    {{ currentFileInfo?.uploadTime }}
                  </el-descriptions-item>
                  <el-descriptions-item label="文件ID">
                    {{ currentFileInfo?.fileId }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
              <div class="parse-actions">
                <el-button 
                  type="primary" 
                  size="large"
                  :loading="parsing"
                  @click="handleParse"
                >
                  {{ parsing ? '解析中...' : '开始解析' }}
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
                <el-button type="success" @click="viewDetail">查看详情</el-button>
              </div>
            </template>
            <div v-if="parseResult" class="parse-result">
              <el-alert
                :title="`解析完成！共解析出 ${parseResult.data?.totalRows || 0} 行数据，${parseResult.data?.sheets?.length || 0} 个工作表`"
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
              <el-table-column prop="fileName" label="文件名" min-width="200" />
              <el-table-column prop="status" label="状态" width="120">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="创建时间" width="180" />
              <el-table-column prop="completeTime" label="完成时间" width="180" />
              <el-table-column label="操作" width="150">
                <template #default="{ row }">
                  <el-button 
                    v-if="row.status === 'completed'"
                    type="primary" 
                    size="small"
                    @click="viewTaskDetail(row)"
                  >
                    查看详情
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

import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import FileUpload from '@/components/FileUpload.vue'
import { excelApi } from '@/services/api'
import { useGlobalStore } from '@/store'
import AuthModal from '@/components/AuthModal.vue'
import LoginChoiceDialog from '@/components/LoginChoiceDialog.vue'
import type { 
  FileUploadResponse, 
  ExcelParseResponse, 
  ExcelParseTask,
  ExcelSheet
} from '@/typings/api'

const router = useRouter()
const globalStore = useGlobalStore()

// 响应式数据
const showAuthModal = ref(false)
const showLoginChoiceDialog = ref(false)
const hideExperienceWarning = ref(false)

// 计算属性 - 登录状态
const isLoggedIn = computed(() => globalStore.isLoggedIn)
const isExperienceAccount = computed(() => globalStore.isExperienceAccount)

// 响应式数据
const currentStep = ref(0)
const parsing = ref(false)
const loadingTasks = ref(false)
const activeSheet = ref('0')

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
 * 格式化文件大小
 */
const formatFileSize = (size: number): string => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  return (size / (1024 * 1024)).toFixed(1) + ' MB'
}

/**
 * 处理文件上传成功
 */
const handleUploadSuccess = ({ response }: { response: FileUploadResponse }) => {
  currentFileInfo.value = response
  globalStore.setCurrentFile({
    fileId: response.fileId,
    fileName: response.fileName,
    fileSize: response.fileSize
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
 * 处理Excel解析
 */
const handleParse = async () => {
  if (!currentFileInfo.value) {
    ElMessage.error('请先上传文件')
    return
  }

  parsing.value = true
  try {
    const result = await excelApi.parse(currentFileInfo.value.fileId)
    parseResult.value = result
    
    if (result.status === 'completed') {
      currentStep.value = 2
      ElMessage.success('解析完成！')
      // 刷新任务列表
      await loadTasks()
    } else if (result.status === 'failed') {
      ElMessage.error('解析失败：' + result.message)
    } else {
      ElMessage.info('解析任务已提交，请稍候查看结果')
      // 轮询检查解析状态
      pollParseStatus(result.taskId)
    }
  } catch (error) {
    ElMessage.error('解析失败，请重试')
    console.error('Parse error:', error)
  } finally {
    parsing.value = false
  }
}

/**
 * 轮询解析状态
 */
const pollParseStatus = (taskId: string) => {
  const timer = setInterval(async () => {
    try {
      const result = await excelApi.getTaskDetail(taskId)
      if (result.status === 'completed') {
        parseResult.value = result
        currentStep.value = 2
        ElMessage.success('解析完成！')
        clearInterval(timer)
        await loadTasks()
      } else if (result.status === 'failed') {
        ElMessage.error('解析失败：' + result.message)
        clearInterval(timer)
      }
    } catch (error) {
      console.error('Poll status error:', error)
    }
  }, 2000)

  // 30秒后停止轮询
  setTimeout(() => {
    clearInterval(timer)
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
 * 加载任务列表
 */
const loadTasks = async () => {
  loadingTasks.value = true
  try {
    const response = await excelApi.getExcelFileList({
      page: pagination.current,
      pageSize: pagination.pageSize
    })
    taskList.value = response.list
    pagination.total = response.total
    globalStore.setExcelTasks(response.list)
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
    case 'processing': return '处理中'
    case 'completed': return '已完成'
    case 'failed': return '失败'
    default: return status
  }
}

/**
 * 查看任务详情
 */
const viewTaskDetail = async (task: ExcelParseTask) => {
  try {
    const detail = await excelApi.getTaskDetail(task.taskId)
    // 这里可以打开详情弹窗或跳转到详情页
    console.log('Task detail:', detail)
    ElMessage.success('详情加载完成')
  } catch (error) {
    ElMessage.error('加载详情失败')
  }
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
</script>

<style scoped>
.excel-query-page {
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

.parse-content {
  text-align: center;
}

.file-info {
  margin-bottom: 30px;
}

.parse-actions {
  margin-top: 20px;
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
