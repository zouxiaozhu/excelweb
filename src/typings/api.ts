/**
 * API 接口类型定义
 */

// 通用响应结构
export interface ApiResponse<T = any> {
    userInfo: any
    tokenInfo: any
    code: number
    message: string
    data: T
}

// 文件上传响应
export interface FileUploadResponse {
    fileId: string
    fileName: string
    fileSize: number
    uploadTime: string
}

// 文件信息响应
export interface FileInfoResponse {
    fileId: string
    fileName: string
    fileSize: number
    fileType: string
    uploadTime: string
    status: string
}

// Excel解析响应
export interface ExcelParseResponse {
    taskId: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    message: string
    data?: {
        sheets: ExcelSheet[]
        totalRows: number
        totalColumns: number
    }
}

// Excel工作表结构
export interface ExcelSheet {
    sheetName: string
    rows: ExcelRow[]
    columnCount: number
    rowCount: number
}

// Excel行数据
export interface ExcelRow {
    rowIndex: number
    cells: ExcelCell[]
}

// Excel单元格数据
export interface ExcelCell {
    columnIndex: number
    value: string | number | boolean
    type: 'string' | 'number' | 'boolean' | 'date' | 'formula'
}

// Excel解析任务列表
export interface ExcelParseTask {
    taskId: string
    fileName: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    createTime: string
    completeTime?: string
    errorMessage?: string
}

// 分页参数
export interface PageParams {
    page: number
    pageSize: number
}

// 分页响应
export interface PageResponse<T> {
    list: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}
