<template>
  <div class="excel-search-page">
    <!-- 页面标题 -->
    <div class="page-title">
      <h1>{{ fileMeta?.fileInfo?.fileInfo?.fileName || '表格快搜' }}</h1>
      <p>快速查询Excel数据</p>
    </div>

    <!-- 搜索条件区域 -->
    <div class="search-section">
      <div class="search-header">
        <h2>搜索条件</h2>
        <el-button 
          type="text" 
          @click="clearSearch"
          class="clear-search-btn"
        >
          清空搜索
        </el-button>
      </div>
      
      <div class="search-form">
        <!-- 加载状态 -->
        <div v-if="loadingMeta" class="loading-meta">
          <el-skeleton :rows="3" animated />
        </div>
        
        <!-- 动态搜索表单 -->
        <div v-else-if="searchHeaders.length > 0" class="search-grid">
          <div 
            v-for="(header, index) in searchHeaders" 
            :key="index"
            class="search-column"
          >
            <div class="form-item">
              <label>{{ header }}</label>
              <el-input
                v-model="searchForm[header]"
                :placeholder="`请输入${header}`"
                clearable
                size="large"
              />
            </div>
          </div>
        </div>
        
        <!-- 无搜索字段提示 -->
        <div v-else class="no-search-fields">
          <el-empty description="暂无搜索字段" />
        </div>
      </div>
      
      <!-- 搜索按钮 -->
      <div class="search-actions">
        <el-button 
          type="primary" 
          size="large"
          :loading="searching"
          @click="handleSearch"
          class="search-btn"
        >
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        
        <el-button 
          type="default" 
          size="large"
          @click="resetSearch"
          class="reset-btn"
        >
          重置
        </el-button>
      </div>
    </div>

    <!-- 搜索结果区域 -->
    <div v-if="hasSearched" class="results-section">
      <div class="results-header">
        <h2>搜索结果</h2>
        <div class="results-info">
          <span>共找到 {{ totalCount }} 条记录</span>
          <el-button 
            v-if="searchResults.length > 0"
            type="success" 
            size="small"
            @click="exportResults"
          >
            导出结果
          </el-button>
        </div>
      </div>
      
      <!-- 结果表格 -->
      <div v-if="searchResults.length > 0" class="results-table">
        <el-table 
          :data="searchResults" 
          :loading="searching"
          border
          stripe
          style="width: 100%"
          max-height="600"
          class="mobile-table"
        >
          <el-table-column
            v-for="(column, index) in tableColumns"
            :key="index"
            :prop="column.prop"
            :label="column.label"
            :min-width="column.minWidth"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span class="cell-content">{{ row[column.prop] || '-' }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 无结果提示 -->
      <div v-else-if="!searching" class="no-results">
        <el-empty description="未找到匹配的数据" />
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
/**
 * @component ExcelSearch
 * @description 表格快搜页面，支持根据文件编码查询Excel数据
 * 
 * @dependencies
 * @api excelApi.searchExcelData - Excel数据搜索接口
 * @store globalStore - 全局状态管理
 */

import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { excelApi } from '@/services/api'

const route = useRoute()

// 响应式数据
const searching = ref(false)
const hasSearched = ref(false)
const fileCoding = ref('')
const loadingMeta = ref(false)
const fileMeta = ref<any>(null)
const searchHeaders = ref<string[]>([])
const searchForm = reactive({})

// 动态生成搜索表单
const generateSearchForm = (headers: string[]) => {
  headers.forEach(header => {
    if (header && header.trim()) {
      searchForm[header] = ''
    }
  })
}

// 搜索结果
const searchResults = ref<any[]>([])
const totalCount = ref(0)

// 分页配置（新API不支持分页，保留用于兼容性）
const pagination = reactive({
  current: 1,
  pageSize: 20
})

// 表格列配置
const tableColumns = ref<any[]>([])

// 动态生成表格列
const generateTableColumns = (headers: string[]) => {
  console.log('开始生成表格列，输入headers:', headers)
  if (!headers || headers.length === 0) {
    console.warn('没有搜索字段，无法生成表格列')
    tableColumns.value = []
    return
  }
  
  tableColumns.value = headers.map((header, index) => ({
    prop: header,
    label: header,
    width: index === 0 ? '80' : index < 3 ? '120' : '100',
    minWidth: index >= 3 ? '120' : undefined
  }))
  console.log('生成的表格列:', tableColumns.value)
}



/**
 * 初始化页面
 */
const initPage = async () => {
  // 从路由参数获取文件编码
  const coding = route.query.fileCoding as string
  if (coding) {
    fileCoding.value = coding
    await loadFileMeta()
  } else {
    ElMessage.error('缺少文件编码参数')
  }
}

/**
 * 加载文件元数据
 */
const loadFileMeta = async () => {
  if (!fileCoding.value) return
  
  loadingMeta.value = true
  try {
    const response = await excelApi.getExcelMeta(fileCoding.value)
    
      fileMeta.value = response
      // 获取可搜索的字段
      const headers = response.fileInfo?.extendData?.searchHeaders || []
      searchHeaders.value = headers.filter((header: string) => header && header.trim())
      
      console.log('API响应:', response)
      console.log('搜索字段:', searchHeaders.value)
      
      // 动态生成搜索表单
      generateSearchForm(searchHeaders.value)
      
      // 动态生成表格列
      generateTableColumns(searchHeaders.value)
      
      console.log('文件元数据加载成功:', response)
      console.log('生成的表格列:', tableColumns.value)
    
  } catch (error: any) {
    ElMessage.error('加载文件信息失败：' + (error.message || '未知错误'))
    console.error('加载文件元数据失败:', error)
  } finally {
    loadingMeta.value = false
  }
}

/**
 * 处理搜索
 */
const handleSearch = async () => {
  if (!fileCoding.value) {
    ElMessage.error('文件编码不能为空')
    return
  }

  searching.value = true
  hasSearched.value = true
  
  try {
    // 构建搜索查询数组
    const searchQueries: { columnKey: string; columnValue: any }[] = []
    Object.keys(searchForm).forEach(key => {
      if (searchForm[key] && searchForm[key].trim()) {
        searchQueries.push({
          columnKey: key,
          columnValue: searchForm[key].trim()
        })
      }
    })
    
    // 构建搜索参数
    const searchParams = {
      fileCode: fileCoding.value,
      logic: "AND",
      searchQueries: searchQueries
    }
    
    console.log('搜索参数:', searchParams)
    
    const response = await excelApi.searchExcelData(searchParams)
    
    // 处理searchRow返回的数据格式
    if (response && response.length > 0) {
      // 从第一条数据中获取列信息
      const firstRow = response[0]
      const columnData = firstRow.columnData
      
      console.log('API返回的原始数据:', response)
      console.log('第一条数据的列信息:', columnData)
      
      // 动态生成表格列配置
      tableColumns.value = Object.keys(columnData).map((columnKey, index) => ({
        prop: columnKey,
        label: columnData[columnKey].columnName,
        minWidth: '120'
      }))
      
      // 转换数据格式以适配表格显示
      searchResults.value = response.map((item: any) => {
        const rowData: any = {}
        Object.keys(item.columnData).forEach(columnKey => {
          rowData[columnKey] = item.columnData[columnKey].columnValue
        })
        return rowData
      })
      
      console.log('转换后的表格数据:', searchResults.value)
      console.log('生成的表格列配置:', tableColumns.value)
      
      totalCount.value = searchResults.value.length
   
      if (searchResults.value.length === 0) {
        ElMessage.info('未找到匹配的数据')
      } else {
        ElMessage.success(`找到 ${totalCount.value} 条记录`)
      }
    } else {
      searchResults.value = []
      totalCount.value = 0
      ElMessage.info('未找到匹配的数据')
    }
  } catch (error: any) {
    ElMessage.error('搜索失败：' + (error.message || '未知错误'))
    console.error('Search error:', error)
  } finally {
    searching.value = false
  }
}

/**
 * 重置搜索
 */
const resetSearch = () => {
  searchHeaders.value.forEach(header => {
    if (searchForm[header] !== undefined) {
      searchForm[header] = ''
    }
  })
  pagination.current = 1
  hasSearched.value = false
  searchResults.value = []
  totalCount.value = 0
}

/**
 * 清空搜索
 */
const clearSearch = () => {
  resetSearch()
}

/**
 * 导出结果
 */
const exportResults = () => {
  if (searchResults.value.length === 0) {
    ElMessage.warning('没有数据可导出')
    return
  }
  
  try {
    // 创建CSV内容
    const headers = tableColumns.value.map(col => col.label).join(',')
    const rows = searchResults.value.map(row => 
      tableColumns.value.map(col => `"${row[col.prop] || ''}"`).join(',')
    ).join('\n')
    
    const csvContent = `${headers}\n${rows}`
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `Excel数据_搜索结果_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success('导出成功')
  } catch (error: any) {
    ElMessage.error('导出失败：' + (error.message || '未知错误'))
  }
}

/**
 * 处理页大小变化（新API不支持分页，暂时禁用）
 */
const handleSizeChange = (size: number) => {
  // 新API不支持分页，暂时禁用
  console.log('分页功能已禁用')
}

/**
 * 处理当前页变化（新API不支持分页，暂时禁用）
 */
const handleCurrentChange = (page: number) => {
  // 新API不支持分页，暂时禁用
  console.log('分页功能已禁用')
}

// 组件挂载时初始化
onMounted(() => {
  initPage()
})
</script>

<style scoped>
.excel-search-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.page-title {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px 0;
}

.page-title h1 {
  font-size: 32px;
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.page-title p {
  color: #7f8c8d;
  font-size: 16px;
  margin: 0;
}

.search-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
}

.search-header h2 {
  font-size: 20px;
  color: #2c3e50;
  margin: 0;
}

.clear-search-btn {
  color: #6c757d;
  font-size: 14px;
}

.search-form {
  width: 100%;
}

.search-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.loading-meta {
  padding: 20px;
  text-align: center;
}

.no-search-fields {
  padding: 40px 20px;
  text-align: center;
}

.search-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-size: 14px;
  color: #495057;
  font-weight: 500;
}

.search-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
  margin-left: 0px;
}

.search-btn {
  min-width: 120px;
}

.reset-btn {
  min-width: 100px;
}

.results-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
}

.results-header h2 {
  font-size: 20px;
  color: #2c3e50;
  margin: 0;
}

.results-info {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #6c757d;
  font-size: 14px;
}

.results-table {
  width: 100%;
  overflow-x: auto;
}

/* 确保表格充分利用可用空间 */
:deep(.el-table) {
  width: 100% !important;
}

:deep(.el-table__body-wrapper) {
  width: 100%;
}

:deep(.el-table__header-wrapper) {
  width: 100%;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: center;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
}

.cell-content {
  word-break: break-all;
}

/* 移动端响应式设计 */
@media (max-width: 768px) {
  .excel-search-page {
    padding: 10px;
  }
  
  .page-title {
    padding: 20px 0;
    margin-bottom: 20px;
  }
  
  .page-title h1 {
    font-size: 24px;
  }
  
  .page-title p {
    font-size: 14px;
  }
  
  .search-section,
  .results-section {
    padding: 20px 15px;
  }
  
  .search-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .loading-meta {
    padding: 15px;
  }
  
  .no-search-fields {
    padding: 30px 15px;
  }
  
  .search-column {
    gap: 15px;
  }
  
  .search-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .search-btn,
  .reset-btn {
    width: 100%;
    max-width: 200px;
  }
  
  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .results-info {
    width: 100%;
    justify-content: space-between;
  }
  
  /* 移动端表格优化 */
  .mobile-table {
    font-size: 12px;
  }
  
  :deep(.el-table) {
    font-size: 12px;
  }
  
  :deep(.el-table th) {
    padding: 8px 4px;
  }
  
  :deep(.el-table td) {
    padding: 6px 4px;
  }
  
  :deep(.el-pagination) {
    font-size: 12px;
  }
  
  :deep(.el-pagination .el-pager li) {
    min-width: 28px;
    height: 28px;
    line-height: 28px;
  }
}

@media (max-width: 480px) {
  .page-title {
    padding: 15px 0;
  }
  
  .page-title h1 {
    font-size: 20px;
  }
  
  .page-title p {
    font-size: 13px;
  }
  
  .search-section,
  .results-section {
    padding: 15px 10px;
  }
  
  .search-header h2,
  .results-header h2 {
    font-size: 18px;
  }
  
  .form-item label {
    font-size: 13px;
  }
  
  :deep(.el-input__wrapper) {
    padding: 0 8px;
  }
  
  :deep(.el-button) {
    padding: 8px 12px;
    font-size: 13px;
  }
}

/* 平板端优化 */
@media (min-width: 769px) and (max-width: 1024px) {
  .search-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .search-column:last-child {
    grid-column: span 2;
    flex-direction: row;
    justify-content: space-between;
  }
  
  .search-column:last-child .form-item {
    flex: 1;
  }
}
</style>
