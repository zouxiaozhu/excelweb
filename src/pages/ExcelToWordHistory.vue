<template>
  <div class="excel-to-word-history-page">
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
              <h1>历史转换记录</h1>
              <el-text type="info" size="default">查看之前转换过的所有任务</el-text>
            </div>
            <div class="header-actions">
              <el-button 
                type="primary" 
                @click="goToConvertPage"
                class="new-convert-btn"
              >
                <el-icon><Plus /></el-icon>
                新建转换
              </el-button>
            </div>
          </div>
        </div>

        <!-- 主要内容区域 -->
        <div class="main-content">
          <!-- 搜索和筛选 -->
          <div class="search-section">
            <div class="search-bar">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索文件名或任务ID"
                clearable
                @input="handleSearch"
                class="search-input"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-select
                v-model="statusFilter"
                placeholder="状态筛选"
                clearable
                @change="handleStatusFilter"
                class="status-filter"
              >
                <el-option label="全部" value="" />
                <el-option label="成功" value="SUCCESS" />
                <el-option label="失败" value="FAILED" />
                <el-option label="处理中" value="PROCESSING" />
                <el-option label="等待中" value="PENDING" />
              </el-select>
              <el-select
                v-model="sortField"
                placeholder="排序字段"
                @change="handleSortChange"
                class="sort-field"
              >
                <el-option label="创建时间" value="createdAt" />
                <el-option label="文件数量" value="fileCount" />
              </el-select>
              <el-select
                v-model="sortOrder"
                placeholder="排序方式"
                @change="handleSortChange"
                class="sort-order"
              >
                <el-option label="降序" value="desc" />
                <el-option label="升序" value="asc" />
              </el-select>
            </div>
            
            <!-- 快速排序按钮 -->
            <div class="quick-sort-buttons">
              <div class="sort-info">
                <el-text type="info" size="small">
                  当前排序: {{ getSortDisplayText() }}
                </el-text>
              </div>
              <el-button-group>
                <el-button 
                  :type="sortField === 'createdAt' && sortOrder === 'desc' ? 'primary' : 'default'"
                  size="small"
                  @click="setQuickSort('createdAt', 'desc')"
                >
                  最新创建
                </el-button>
                <el-button 
                  :type="sortField === 'fileCount' && sortOrder === 'desc' ? 'primary' : 'default'"
                  size="small"
                  @click="setQuickSort('fileCount', 'desc')"
                >
                  文件最多
                </el-button>
              </el-button-group>
            </div>
          </div>

          <!-- 历史记录列表 -->
          <div class="history-list">
            <div v-if="loading" class="loading-container">
              <el-skeleton :rows="5" animated />
            </div>
            
            <div v-else-if="historyList.length === 0" class="empty-state">
              <div class="empty-icon">
                <el-icon size="60"><Box /></el-icon>
              </div>
              <el-text type="info" size="large">暂无历史转换记录</el-text>
              <el-button type="primary" @click="goToConvertPage">
                开始第一次转换
              </el-button>
            </div>

            <div v-else class="history-items">
              <el-table
                :data="historyList"
                style="width: 100%"
                @row-click="viewTaskDetail"
                @sort-change="handleTableSortChange"
                class="history-table"
                :row-class-name="getRowClassName"
              >
                <el-table-column prop="payload.tableFileName" label="文件名" min-width="200">
                  <template #default="{ row }">
                    <div class="file-name-cell">
                      <el-icon class="file-icon"><Document /></el-icon>
                      <span class="file-name">{{ getTaskDisplayName(row) }}</span>
                    </div>
                  </template>
                </el-table-column>
                
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag 
                      :type="getStatusTagType(row.status)"
                      :class="getStatusClass(row.status)"
                      size="small"
                    >
                      {{ getStatusText(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                
                <el-table-column label="文件统计" width="120" sortable="custom" :sort-orders="['ascending', 'descending']">
                  <template #default="{ row }">
                    <div class="stats-cell">
                      <el-text size="small">{{ row.completeCount }}/{{ row.exceptCount }}</el-text>
                    </div>
                  </template>
                  <template #header>
                    <div class="sort-header">
                      <span>文件统计</span>
                      <el-icon v-if="sortField === 'fileCount'" class="sort-icon">
                        <component :is="sortOrder === 'asc' ? 'SortUp' : 'SortDown'" />
                      </el-icon>
                    </div>
                  </template>
                </el-table-column>
                
                <el-table-column prop="createdAt" label="创建时间" width="160" sortable="custom" :sort-orders="['ascending', 'descending']">
                  <template #default="{ row }">
                    <el-text size="small">{{ formatTime(row.createdAt) }}</el-text>
                  </template>
                  <template #header>
                    <div class="sort-header">
                      <span>创建时间</span>
                      <el-icon v-if="sortField === 'createdAt'" class="sort-icon">
                        <component :is="sortOrder === 'asc' ? 'SortUp' : 'SortDown'" />
                      </el-icon>
                    </div>
                  </template>
                </el-table-column>
                
                <el-table-column label="操作" width="180" fixed="right">
                  <template #default="{ row }">
                    <div class="action-buttons">
                      <el-button 
                        v-if="row.status === 'SUCCESS' && row.result?.zip_url"
                        type="primary" 
                        size="small"
                        @click.stop="downloadZip(row)"
                        class="download-btn"
                      >
                        <el-icon><Download /></el-icon>
                        下载
                      </el-button>
                      <el-button 
                        type="default" 
                        size="small"
                        @click.stop="viewTaskDetail(row)"
                        class="detail-btn"
                      >
                        <el-icon><View /></el-icon>
                        详情
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="historyList.length > 0" class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              class="pagination"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 任务详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="转换任务详情"
      width="80%"
      :close-on-click-modal="false"
      class="detail-dialog"
    >
      <div v-if="selectedTask" class="task-detail-content">
        <!-- 任务基本信息 -->
        <div class="detail-section">
          <h3>任务信息</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">任务ID:</span>
              <span class="value">{{ selectedTask.taskId }}</span>
            </div>
            <div class="detail-item">
              <span class="label">状态:</span>
              <el-tag :type="getStatusTagType(selectedTask.status)">
                {{ getStatusText(selectedTask.status) }}
              </el-tag>
            </div>
            <div class="detail-item">
              <span class="label">创建时间:</span>
              <span class="value">{{ formatTime(selectedTask.createdAt) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">更新时间:</span>
              <span class="value">{{ formatTime(selectedTask.updatedAt) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">总文件数:</span>
              <span class="value">{{ selectedTask.exceptCount }}</span>
            </div>
            <div class="detail-item">
              <span class="label">已完成:</span>
              <span class="value success">{{ selectedTask.completeCount }}</span>
            </div>
          </div>
        </div>

        <!-- 文件列表 -->
        <div v-if="taskDetail && taskDetail.transferTasks && taskDetail.transferTasks.length > 0" class="detail-section">
          <h3>转换文件列表</h3>
          <div class="files-list">
            <div 
              v-for="file in taskDetail.transferTasks" 
              :key="file.id"
              class="file-item"
              :class="getTaskStatusClass(file.status)"
            >
              <div class="file-info">
                <el-icon class="file-icon"><Document /></el-icon>
                <div class="file-details">
                  <div class="file-name">{{ getTaskFileName(file) }}</div>
                  <div class="file-status">{{ getTransferTaskStatusText(file.status) }}</div>
                </div>
              </div>
              <div class="file-actions">
                <el-button 
                  v-if="file.status === 'SUCCESS' && file.fileUrl"
                  type="primary" 
                  size="small"
                  @click="downloadWordFile(file.fileUrl, file.id)"
                  class="download-btn"
                >
                  下载
                </el-button>
                <span v-if="file.status === 'FAILED' && file.errorMessage" class="error-message">
                  {{ file.errorMessage }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

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
 * @component ExcelToWordHistory
 * @description Excel转Word历史转换记录页面
 */

import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Document, Box, Plus, Search, Download, View, SortUp, SortDown } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useGlobalStore } from '@/store'
import AuthModal from '@/components/AuthModal.vue'
import LoginChoiceDialog from '@/components/LoginChoiceDialog.vue'
import { excelToWordApi } from '@/services/api'
import type { ExcelToWordHistoryTask, ExcelToWordHistoryDetail, PageParams } from '@/typings/api'

const router = useRouter()
const globalStore = useGlobalStore()

// 响应式数据
const showAuthModal = ref(false)
const showLoginChoiceDialog = ref(false)
const hideExperienceWarning = ref(false)

// 计算属性 - 登录状态
const isLoggedIn = computed(() => globalStore.isLoggedIn)
const isExperienceAccount = computed(() => globalStore.isExperienceAccount)

// 历史记录相关数据
const historyList = ref<ExcelToWordHistoryTask[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const searchKeyword = ref('')
const statusFilter = ref('')

// 排序相关数据
const sortField = ref('createdAt')
const sortOrder = ref('desc')

// 详情对话框
const showDetailDialog = ref(false)
const selectedTask = ref<ExcelToWordHistoryTask | null>(null)
const taskDetail = ref<ExcelToWordHistoryDetail | null>(null)

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

// 获取历史记录列表
const fetchHistoryList = async () => {
  loading.value = true
  try {
    const params: PageParams & { sortField?: string; sortOrder?: string } = {
      page: currentPage.value,
      size: pageSize.value,
      sortField: sortField.value,
      sortOrder: sortOrder.value
    }
    
    const response = await excelToWordApi.getHistoryList(params)
    
    // 如果API不支持排序，则在客户端进行排序
    if (sortField.value && sortOrder.value) {
      historyList.value = sortHistoryList(response.records)
    } else {
      historyList.value = response.records
    }
    
    total.value = response.total
  } catch (error) {
    console.error('获取历史记录失败:', error)
    ElMessage.error('获取历史记录失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  fetchHistoryList()
}

// 状态筛选处理
const handleStatusFilter = () => {
  currentPage.value = 1
  fetchHistoryList()
}

// 排序处理
const handleSortChange = () => {
  currentPage.value = 1
  fetchHistoryList()
}

// 快速排序设置
const setQuickSort = (field: string, order: string) => {
  sortField.value = field
  sortOrder.value = order
  handleSortChange()
}

// 获取排序显示文本
const getSortDisplayText = (): string => {
  const fieldMap: Record<string, string> = {
    'createdAt': '创建时间',
    'fileCount': '文件数量'
  }
  
  const orderMap: Record<string, string> = {
    'asc': '升序',
    'desc': '降序'
  }
  
  const fieldText = fieldMap[sortField.value] || '创建时间'
  const orderText = orderMap[sortOrder.value] || '降序'
  
  return `${fieldText} ${orderText}`
}

// 客户端排序逻辑
const sortHistoryList = (list: ExcelToWordHistoryTask[]): ExcelToWordHistoryTask[] => {
  if (!sortField.value || !sortOrder.value) {
    return list
  }

  return [...list].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortField.value) {
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
        break
      case 'fileCount':
        aValue = a.exceptCount
        bValue = b.exceptCount
        break
      default:
        return 0
    }

    if (sortOrder.value === 'asc') {
      return aValue - bValue
    } else {
      return bValue - aValue
    }
  })
}

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchHistoryList()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchHistoryList()
}

// 获取任务显示名称
const getTaskDisplayName = (task: ExcelToWordHistoryTask): string => {
  return task.payload?.tableFileName || `转换任务_${task.taskId}`
}

// 格式化时间
const formatTime = (timeStr: string): string => {
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取状态文本
const getStatusText = (status: string): string => {
  switch (status) {
    case 'SUCCESS':
      return '成功'
    case 'FAILED':
      return '失败'
    case 'PROCESSING':
      return '处理中'
    case 'PENDING':
      return '等待中'
    default:
      return '未知'
  }
}

// 获取状态标签类型
const getStatusTagType = (status: string): string => {
  switch (status) {
    case 'SUCCESS':
      return 'success'
    case 'FAILED':
      return 'danger'
    case 'PROCESSING':
      return 'warning'
    case 'PENDING':
      return 'info'
    default:
      return ''
  }
}

// 获取状态样式类
const getStatusClass = (status: string): string => {
  return `status-${status.toLowerCase()}`
}

// 获取进度百分比
const getProgressPercentage = (task: ExcelToWordHistoryTask): number => {
  if (task.exceptCount === 0) return 0
  return Math.floor((task.completeCount / task.exceptCount) * 100)
}

// 下载压缩包
const downloadZip = (task: ExcelToWordHistoryTask) => {
  if (task.result?.zip_url) {
    const link = document.createElement('a')
    link.href = task.result.zip_url
    link.download = task.result.zipFileName || '转换结果.zip'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success('开始下载压缩包')
  } else {
    ElMessage.warning('下载链接不可用')
  }
}

// 查看任务详情
const viewTaskDetail = async (task: ExcelToWordHistoryTask) => {
  selectedTask.value = task
  showDetailDialog.value = true
  
  try {
    const response = await excelToWordApi.getHistoryDetail(task.taskId)
    taskDetail.value = response.data
  } catch (error) {
    console.error('获取任务详情失败:', error)
    ElMessage.error('获取任务详情失败')
  }
}

// 获取Word文件转换状态文本
const getTransferTaskStatusText = (status: string): string => {
  switch (status) {
    case 'SUCCESS':
      return '转换成功'
    case 'FAILED':
      return '转换失败'
    case 'PROCESSING':
      return '转换中'
    case 'PENDING':
      return '等待转换'
    default:
      return '未知状态'
  }
}

// 获取任务文件名
const getTaskFileName = (task: {
  id: string
  remark?: string
  [key: string]: any
}): string => {
  try {
    if (task.remark) {
      const remarkData = JSON.parse(task.remark)
      const nameFields = ['姓名', '名称', '器材名称', '设备名称', '编号', 'ID']
      for (const field of nameFields) {
        if (remarkData[field]) {
          return `${remarkData[field]}_${task.id}.docx`
        }
      }
      const firstValue = Object.values(remarkData).find(value => value && value.toString().trim())
      if (firstValue) {
        return `${firstValue}_${task.id}.docx`
      }
    }
  } catch (error) {
    console.error('解析remark失败:', error)
  }
  return `转换结果_${task.id}.docx`
}

// 获取Word文件状态样式类
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

// 下载Word文件
const downloadWordFile = (fileUrl: string, taskId: string) => {
  const link = document.createElement('a')
  link.href = fileUrl
  link.download = `转换结果_${taskId}.docx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('开始下载Word文件')
}

// 跳转到转换页面
const goToConvertPage = () => {
  router.push('/excel-to-word')
}

// 获取表格行样式类名
const getRowClassName = ({ row }: { row: ExcelToWordHistoryTask }) => {
  return `status-${row.status.toLowerCase()}`
}

// 处理表格排序变化
const handleTableSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  if (!order) {
    sortField.value = 'createdAt'
    sortOrder.value = 'desc'
  } else {
    // 映射表格字段到排序字段
    const fieldMap: Record<string, string> = {
      'createdAt': 'createdAt',
      'fileCount': 'fileCount'
    }
    
    sortField.value = fieldMap[prop] || 'createdAt'
    sortOrder.value = order === 'ascending' ? 'asc' : 'desc'
  }
  
  handleSortChange()
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
  
  // 加载历史记录
  fetchHistoryList()
})

// 监听登录状态变化，重新初始化体验账号提醒
watch([isLoggedIn, isExperienceAccount], ([loggedIn, isExp]) => {
  if (loggedIn && isExp) {
    nextTick(() => {
      initExperienceWarning()
    })
  }
  if (loggedIn) {
    fetchHistoryList()
  }
})

/**
 * 处理登录成功
 */
const handleLoginSuccess = () => {
  fetchHistoryList()
}

/**
 * 处理显示正常登录
 */
const handleShowNormalLogin = () => {
  showAuthModal.value = true
}
</script>

<style scoped>
.excel-to-word-history-page {
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

.new-convert-btn {
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

.search-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-input {
  flex: 1;
  max-width: 400px;
}

.status-filter {
  width: 150px;
}

.sort-field {
  width: 120px;
}

.sort-order {
  width: 100px;
}

.quick-sort-buttons {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.sort-info {
  flex-shrink: 0;
}

.history-list {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.loading-container {
  padding: 20px 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #64748b;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.7;
  color: #94a3b8;
}

.empty-text {
  font-size: 16px;
  margin: 0 0 20px;
  font-weight: 500;
  color: #64748b;
}

.history-items {
  width: 100%;
}

.history-table {
  border-radius: 8px;
  overflow: hidden;
}

.history-table :deep(.el-table__row) {
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-table :deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  color: #409eff;
  font-size: 16px;
}

.file-name {
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
}


.stats-cell {
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.download-btn, .detail-btn {
  font-size: 12px;
  padding: 4px 8px;
  height: auto;
  border-radius: 4px;
  font-weight: 500;
}

.sort-header {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.sort-icon {
  font-size: 14px;
  color: #409eff;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.pagination {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 详情对话框样式 */
.detail-dialog {
  .task-detail-content {
    max-height: 70vh;
    overflow-y: auto;
  }
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  margin: 0 0 16px;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 500;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item .label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.detail-item .value {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

.detail-item .value.success {
  color: #67c23a;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
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

.error-message {
  font-size: 11px;
  color: #f56c6c;
  max-width: 200px;
  word-break: break-word;
  background: #fef0f0;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #fbc4c4;
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

/* 表格行状态样式 */
.history-table :deep(.status-success) {
  background-color: #f0f9ff;
}

.history-table :deep(.status-success:hover) {
  background-color: #e1f5fe !important;
}

.history-table :deep(.status-failed) {
  background-color: #fef0f0;
}

.history-table :deep(.status-failed:hover) {
  background-color: #fde2e2 !important;
}

.history-table :deep(.status-processing) {
  background-color: #fdf6ec;
}

.history-table :deep(.status-processing:hover) {
  background-color: #fce4b4 !important;
}

.history-table :deep(.status-pending) {
  background-color: #f4f4f5;
}

.history-table :deep(.status-pending:hover) {
  background-color: #e9e9eb !important;
}

/* 状态标签样式 */
.status-success {
  background: #f0f9ff;
  color: #67c23a;
  border-color: #67c23a;
}

.status-failed {
  background: #fef0f0;
  color: #f56c6c;
  border-color: #f56c6c;
}

.status-processing {
  background: #fdf6ec;
  color: #e6a23c;
  border-color: #e6a23c;
}

.status-pending {
  background: #f4f4f5;
  color: #909399;
  border-color: #909399;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    max-width: none;
  }

  .status-filter,
  .sort-field,
  .sort-order {
    width: auto;
  }

  .quick-sort-buttons {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .sort-info {
    text-align: center;
  }

  .quick-sort-buttons .el-button-group {
    flex-wrap: wrap;
    gap: 4px;
    justify-content: center;
  }

  .history-table {
    font-size: 12px;
  }

  .history-table :deep(.el-table__cell) {
    padding: 8px 4px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }

  .download-btn, .detail-btn {
    font-size: 10px;
    padding: 2px 6px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
