# Excel数据渲染实现文档

## 概述
本文档描述了如何实现Excel表格数据的渲染功能，基于`getParseFileDetailPage` API接口。

## API接口结构

### 请求参数
```typescript
interface PageParams {
  page: number      // 页码
  pageSize: number  // 每页大小
}
```

### 响应数据结构
```typescript
interface ExcelDataDetailResponse {
  maxRowLine: number
  total: number
  records: ExcelDataRecord[]
  minRowLine: number
}

interface ExcelDataRecord {
  rowLine: number
  columnData: Record<string, ExcelColumnData>
}

interface ExcelColumnData {
  id: number
  columnName: string
  columnValue: string
}
```

### 示例响应数据
```json
{
  "success": true,
  "code": 0,
  "message": "ok",
  "data": {
    "maxRowLine": 2,
    "total": 1,
    "records": [
      {
        "rowLine": 2,
        "columnData": {
          "所在位置": {
            "id": 8120,
            "columnName": "所在位置",
            "columnValue": "所在位置(示例)"
          },
          "生产厂家": {
            "id": 8123,
            "columnName": "生产厂家",
            "columnValue": "生产厂家(示例)"
          },
          "负责人": {
            "id": 8125,
            "columnName": "负责人",
            "columnValue": "负责人(示例)"
          },
          "规格型号": {
            "id": 8122,
            "columnName": "规格型号",
            "columnValue": "规格型号(示例)"
          },
          "联系方式(数字)": {
            "id": 8126,
            "columnName": "联系方式(数字)",
            "columnValue": "1"
          },
          "编号": {
            "id": 8119,
            "columnName": "编号",
            "columnValue": "编号(示例)"
          },
          "器材名称": {
            "id": 8121,
            "columnName": "器材名称",
            "columnValue": "器材名称(示例)"
          },
          "有效期": {
            "id": 8124,
            "columnName": "有效期",
            "columnValue": "有效期(示例)"
          }
        }
      }
    ],
    "minRowLine": 2
  }
}
```

## 实现文件

### 1. 类型定义 (`src/typings/api.ts`)
- 添加了`ExcelDataDetailResponse`、`ExcelDataRecord`、`ExcelColumnData`接口
- 定义了完整的API响应类型结构

### 2. API服务 (`src/services/api.ts`)
- 添加了`getParseFileDetailPage`方法
- 支持分页参数传递
- 返回类型化的响应数据

### 3. 数据详情组件 (`src/components/ExcelDataDetailDialog.vue`)
- 完整的Excel数据展示组件
- 支持分页、排序、搜索等功能
- 响应式设计，适配不同屏幕尺寸

## 核心功能

### 数据加载
```typescript
const loadExcelData = async () => {
  if (!props.task?.taskId) return
  
  loading.value = true
  try {
    const response = await excelApi.getParseFileDetailPage(props.task.taskId, {
      page: pagination.current,
      pageSize: pagination.pageSize
    })
    
    if (response.success && response.data) {
      const data = response.data
      pagination.total = data.total
      
      // 处理表头
      if (data.records.length > 0) {
        const firstRecord = data.records[0]
        tableHeaders.value = Object.keys(firstRecord.columnData)
      }
      
      // 处理表格数据
      tableData.value = data.records.map(record => {
        const rowData: any = {
          rowNumber: record.rowLine
        }
        
        // 将columnData转换为扁平化的行数据
        Object.entries(record.columnData).forEach(([columnName, columnData]) => {
          rowData[columnName] = columnData.columnValue
        })
        
        return rowData
      })
    }
  } catch (error) {
    console.error('加载Excel数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}
```

### 表格渲染
- 动态生成表格列，基于API返回的`columnData`键名
- 固定行号列，方便数据定位
- 支持内容溢出提示
- 响应式列宽设计

### 分页功能
- 支持多种页面大小选择（5, 10, 20, 50, 100）
- 完整的分页导航（上一页、下一页、跳转等）
- 实时更新总数据量显示

## 使用方式

### 在页面中使用
```vue
<template>
  <ExcelDataDetailDialog
    v-model="showExcelDetailDialog"
    :task="currentTask"
  />
</template>

<script setup>
import ExcelDataDetailDialog from '@/components/ExcelDataDetailDialog.vue'

const showExcelDetailDialog = ref(false)
const currentTask = ref(null)

const viewTaskDetail = (task) => {
  currentTask.value = task
  showExcelDetailDialog.value = true
}
</script>
```

## 特性

### 1. 数据转换
- 自动将嵌套的`columnData`结构转换为扁平化的表格数据
- 保持原始数据的完整性
- 支持动态列名显示

### 2. 用户体验
- 加载状态指示器
- 错误处理和用户提示
- 空数据状态显示
- 响应式设计

### 3. 性能优化
- 分页加载，避免一次性加载大量数据
- 虚拟滚动支持（通过max-height限制）
- 合理的缓存策略

### 4. 可扩展性
- 类型安全的TypeScript实现
- 模块化的组件设计
- 易于维护和扩展的代码结构

## 注意事项

1. **API调用时机**: 组件会在显示时自动加载数据
2. **错误处理**: 网络错误会显示用户友好的提示信息
3. **数据格式**: 确保API返回的数据格式符合定义的接口
4. **性能考虑**: 大量数据时建议使用分页加载

## 测试建议

1. 测试不同数据量的加载性能
2. 测试分页功能的正确性
3. 测试错误状态的处理
4. 测试响应式布局在不同设备上的表现
