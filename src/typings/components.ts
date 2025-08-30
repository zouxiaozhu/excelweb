/**
 * 组件类型定义
 */

// 上传组件参数
export interface UploadProps {
    accept?: string
    multiple?: boolean
    maxSize?: number // MB
    disabled?: boolean
}

// 上传组件事件
export interface UploadEmits {
    success: (response: any) => void
    error: (error: Error) => void
    progress: (percent: number) => void
}

// 表格组件参数
export interface TableProps {
    data: any[]
    columns: TableColumn[]
    loading?: boolean
    pagination?: PaginationConfig
}

// 表格列配置
export interface TableColumn {
    key: string
    title: string
    width?: number
    align?: 'left' | 'center' | 'right'
    sortable?: boolean
    render?: (value: any, row: any, index: number) => any
}

// 分页配置
export interface PaginationConfig {
    current: number
    pageSize: number
    total: number
    showSizeChanger?: boolean
    showQuickJumper?: boolean
    pageSizeOptions?: string[]
}

// 步骤条配置
export interface StepItem {
    title: string
    description?: string
    status?: 'wait' | 'process' | 'finish' | 'error'
}
