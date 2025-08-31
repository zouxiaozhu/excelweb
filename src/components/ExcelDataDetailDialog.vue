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
      
      <!-- 数据表格 -->
      <el-table 
        :data="tableData" 
        :loading="loading"
        border
        style="width: 100%"
        stripe
        max-height="500"
      >
        <template #empty>
          <el-empty description="暂无数据" />
        </template>
        <el-table-column prop="rowNumber" label="行号" width="80" fixed="left" />
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
      <div v-if="pagination.total > 0" class="pagination-wrapper">
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
import { excelApi } from '@/services/api'
import type { ExcelParseTask, ExcelDataDetailResponse, ExcelDataRecord } from '@/typings/api'

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

// 跟踪上一页的最大行号
const lastMaxRowLine = ref(0)

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
  if (!props.task?.id) return
  
  // 计算offset：上一页的最大行号 + 1
  const offset = pagination.current === 1 ? 0 : lastMaxRowLine.value + 1
  
  console.log('加载数据 - 页码:', pagination.current, '页大小:', pagination.pageSize, 'offset:', offset)
  
  loading.value = true
  
  try {
    const response = await excelApi.getParseFileDetailPage(props.task.id, {
      offset: offset,
      size: pagination.pageSize
    })
    
    console.log('API响应:', response)
    
    // 由于响应拦截器已经返回了data.data，所以response就是实际的数据
    if (response) {
      const data = response
      pagination.total = data.total
      
      // 清空之前的数据
      tableData.value = []
      tableHeaders.value = []
      
      // 处理表头 - 确保所有记录都有相同的列结构
      if (data.records.length > 0) {
        // 获取所有记录的列名并去重
        const allColumns = new Set<string>()
        data.records.forEach(record => {
          Object.keys(record.columnData).forEach(columnName => {
            allColumns.add(columnName)
          })
        })
        tableHeaders.value = Array.from(allColumns)
      }
      
      // 处理表格数据
      tableData.value = data.records.map(record => {
        const rowData: any = {
          rowNumber: record.rowLine
        }
        
        // 将columnData转换为扁平化的行数据，确保所有列都有值
        tableHeaders.value.forEach(columnName => {
          rowData[columnName] = record.columnData[columnName]?.columnValue || ''
        })
        
        return rowData
      })
      
      // 更新上一页的最大行号
      if (data.records.length > 0) {
        const maxRowLine = Math.max(...data.records.map(record => record.rowLine))
        lastMaxRowLine.value = maxRowLine
        console.log('当前页最大行号:', maxRowLine)
      }
      
      console.log('处理后的表格数据:', tableData.value)
      console.log('表头:', tableHeaders.value)
    }
  } catch (error) {
    console.error('加载Excel数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

/**
 * 处理页大小变化
 */
const handleSizeChange = (size: number) => {
  console.log('页大小变化:', size)
  
  // 重置分页状态
  pagination.pageSize = size
  pagination.current = 1
  lastMaxRowLine.value = 0 // 重置最大行号
  
  // 重新加载数据
  loadExcelData()
}

/**
 * 处理当前页变化
 */
const handleCurrentChange = (page: number) => {
  console.log('页码变化:', page)
  
  // 如果跳转到第一页，重置最大行号
  if (page === 1) {
    lastMaxRowLine.value = 0
  }
  
  // 更新页码
  pagination.current = page
  
  // 重新加载数据
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

.empty-data,
.loading-container {
  text-align: center;
  padding: 40px 0;
}

.loading-container p {
  margin-top: 10px;
  color: #909399;
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

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #fafafa;
}

:deep(.el-table__fixed-left) {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}
</style>
