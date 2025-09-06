/**
 * API 接口类型定义
 */

// 通用响应结构
export interface ApiResponse<T = any> {
    [x: string]: any
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
    sizeText?: string
    // Excel转Word所需的额外属性
    bucket?: string
    engine?: string
    externalDomain?: string
    externalUrl?: string
    internalDomain?: string
    internalUrl?: string
    path?: string
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
    id?: string
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

// 文件信息
export interface FileInfo {
    fileId: string
    fileName: string
    fileSize: number
    sizeText?: string
    externalUrl?: string
}

// Excel解析任务列表
export interface ExcelParseTask {
    id?: string
    taskId: string
    fileName: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    createTime: string
    completeTime?: string
    errorMessage?: string
    fileInfo?: FileInfo,
    excelFile: string,
    extendData?: ExcelParseExtendData
    startTime?: string
    endTime?: string
    fileCoding?: string
}

// 任务状态映射
export type TaskStatus = 'Enable' | 'Disable'

// 分页参数
export interface PageParams {
    page: number
    size: number
}

// Excel数据详情分页参数
export interface ExcelDataPageParams {
    offset: number
    size: number
}

// 分页响应
export interface PageResponse<T> {
    records: T[]
    total: number
    page: number
    size: number
    totalPages: number
}

// 任务设置数据
export interface TaskSettingData {
    excelFile: string
    status: 'Enable' | 'Disable'
    startTime: string
    endTime: string
    extendData: {
        headers: string[]
        searchHeaders: string[]
    }
}

// 扩展数据
export interface ExcelParseExtendData {
    headers: string[]
    searchHeaders: string[]
}

// 更新任务请求参数
export interface UpdateTaskRequest {
    id: string
    excelFile: string
    status: string
    startTime: string | null
    endTime: string | null
    extendData: ExcelParseExtendData
}

// Excel数据详情响应 - 新增
export interface ExcelDataDetailResponse {
    maxRowLine: number
    total: number
    records: ExcelDataRecord[]
    minRowLine: number
}

// Excel数据记录 - 新增
export interface ExcelDataRecord {
    rowLine: number
    columnData: Record<string, ExcelColumnData>
}

// Excel列数据 - 新增
export interface ExcelColumnData {
    id: number
    columnName: string
    columnValue: string
}

// 任务设置字段选项
export interface TaskFieldOption {
    label: string
    value: string
}

// Excel转Word相关类型定义
export interface ExcelToWordParseParams {
    bucket: string
    engine: string
    externalDomain: string
    externalUrl: string
    fileId: number
    fileName: string
    internalDomain: string
    internalUrl: string
    meta: any
    path: string
    size: number
}

export interface ExcelToWordParseResponse {
    vars: Array<{
        title: string
        var: string
    }>
    path: string
}

// Excel转Word历史记录任务
export interface ExcelToWordHistoryTask {
    id: number
    taskId: string
    taskType: string
    status: string
    completeCount: number
    exceptCount: number
    createdAt: string
    updatedAt: string
    payload: {
        tableFileExtension: string
        tableFileName: string
        wordVars: string[]
        ossType: string
        wordPath: string
        storagePath: string
        wordFileName: string
        tablePath: string
    }
    result: {
        has_zip_count: number
        zip_end: boolean
        completedAt: string
        zipFileName: string
        zip_text: string
        zip_success: boolean
        zip_path: string
        need_zip_count: number
        totalFiles: number
        zipFile: string
        zip_url: string
    }
}

// Excel转Word历史记录详情
export interface ExcelToWordHistoryDetail {
    commonTask: ExcelToWordHistoryTask
    transferTasks: Array<{
        id: string
        taskId: string
        taskType: string
        fromObject: string
        toObject: string
        fromOssType: string
        toOssType: string
        status: string
        fileUrl: string
        remark: string
        errorMessage: string
        createdAt: string
        updatedAt: string
    }>
}
