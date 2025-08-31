<template>
  <el-dialog
    v-model="visible"
    title="Excel数据明细"
    width="90%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="excel-detail-dialog"
  >
    <!-- Excel数据详情 -->
    <div class="excel-info-section">
      <el-descriptions :column="3" border>
        <el-descriptions-item label="任务ID">
          {{ taskData?.taskId || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="Excel文件">
          {{ taskData?.excelFile || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(taskData?.status)">
            {{ getStatusText(taskData?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="总行数">
          {{ pagination.total }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ taskData?.createTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="文件大小">
          {{ formatFileSize(taskData?.fileInfo?.fileSize || 0) }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- Excel表格数据 -->
    <div class="excel-table-section">
      <h3>Excel表格数据</h3>
      <el-table 
        :data="tableData" 
        :loading="loading"
        border
        style="width: 100%"
        stripe
      >
        <el-table-column prop="rowNumber" label="行号" width="80" />
        <el-table-column 
          v-for="field in tableHeaders" 
          :key="field"
          :prop="field"
          :label="field"
          min-width="120"
          show-overflow-tooltip
        />
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[5, 10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { ExcelParseTask } from '@/typings/api'

// 定义组件属性
interface Props {
  modelValue: boolean
  task?: ExcelParseTask | null
}

// 定义组件事件
interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  task: null
})

const emit = defineEmits<Emits>()

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const tableData = ref<any[]>([])
const tableHeaders = ref<string[]>([])

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 任务数据
const taskData = computed(() => props.task)

// 监听任务变化，加载数据
watch(() => props.task, (newTask) => {
  if (newTask && visible.value) {
    loadExcelData()
  }
}, { immediate: true })

// 监听弹框显示状态
watch(() => visible.value, (newVisible) => {
  if (newVisible && props.task) {
    loadExcelData()
  }
})

/**
 * 加载Excel数据
 */
const loadExcelData = async () => {
  if (!props.task?.taskId) return
  
  loading.value = true
  try {
    // 这里需要调用API获取Excel数据
    // 暂时使用模拟数据
    await simulateLoadData()
  } catch (error) {
    console.error('加载Excel数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

/**
 * 模拟加载数据
 */
const simulateLoadData = async () => {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 模拟数据
  const mockHeaders = ['使用时间', '序号', '日期', '途径地点', '上车地点', '下车地点', '结束时间']
  tableHeaders.value = mockHeaders
  
  const mockData = []
  const startRow = (pagination.current - 1) * pagination.pageSize + 1
  
  for (let i = 0; i < pagination.pageSize; i++) {
    const rowNumber = startRow + i
    if (rowNumber > pagination.total) break
    
    mockData.push({
      rowNumber,
      '使用时间': `TEXT(B${rowNumber},"aaaa")`,
      '序号': rowNumber,
      '日期': `2024"年"${Math.floor(Math.random() * 12) + 1}"月"${Math.floor(Math.random() * 28) + 1}"日"`,
      '途径地点': ['大宁商务中心', '虹桥机场', '浦江国际', '宝溢丰大厦'][Math.floor(Math.random() * 4)],
      '上车地点': '宝溢丰大厦',
      '下车地点': '宝溢丰大厦',
      '结束时间': `${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
    })
  }
  
  tableData.value = mockData
  pagination.total = 156 // 模拟总行数
}

/**
 * 处理页大小变化
 */
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  loadExcelData()
}

/**
 * 处理当前页变化
 */
const handleCurrentChange = (page: number) => {
  pagination.current = page
  loadExcelData()
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
 * 处理关闭
 */
const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
.excel-detail-dialog {
  max-height: 90vh;
}

.excel-info-section {
  margin-bottom: 20px;
}

.excel-table-section {
  margin-top: 20px;
}

.excel-table-section h3 {
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 18px;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: center;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-dialog__body) {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
