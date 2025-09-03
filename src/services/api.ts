/**
 * API接口服务层
 * 统一管理所有API请求
 */

import { http } from './request'
import type {
    FileUploadResponse,
    FileInfoResponse,
    ExcelParseResponse,
    ExcelParseTask,
    PageParams,
    ExcelDataPageParams,
    PageResponse,
    UpdateTaskRequest,
    ApiResponse,
    ExcelDataDetailResponse
} from '@/typings/api'

/**
 * 文件相关API
 */
export const fileApi = {
    /**
     * 上传文件
     * @param file 文件对象
     * @returns 上传结果
     */
    upload(file: File, businessType: string): Promise<FileUploadResponse> {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('businessType', businessType)
        return http.postFile('/file/upload', formData)
    },

    /**
     * 获取文件信息
     * @param fileId 文件ID
     * @returns 文件信息
     */
    getFileInfo(fileId: string): Promise<FileInfoResponse> {
        return http.get(`/file/info/?fileId=${fileId}`)
    }
}

/**
 * Excel解析相关API
 */
export const excelApi = {
    /**
     * 解析Excel文件
     * @param fileId 文件ID
     * @returns 解析结果
     */
    parse(fileId: string): Promise<ExcelParseResponse> {
        const formData = new FormData()
        formData.append('fileId', fileId)
        return http.postFile('/excel/parse', formData)
    },

    /**
     * 获取Excel解析任务列表
     * @param params 分页参数
     * @returns 任务列表
     */
    getExcelFileList(params: PageParams): Promise<PageResponse<ExcelParseTask>> {
        return http.get('/excel/excelFileList', {
            params
        })
    },

    /**
     * 获取解析任务详情
     * @param taskId 任务ID
     * @returns 任务详情
     */
    getTaskDetail(taskId: string): Promise<ExcelParseResponse> {
        return http.get(`/excel/getParseFileDetailPage?taskId=${taskId}`)
    },

    /**
     * 更新任务设置
     * @param taskId 任务ID
     * @param settings 任务设置
     * @returns 更新结果
     */
    updateTaskSetting(taskId: string, settings: any): Promise<ApiResponse> {
        const requestData: UpdateTaskRequest = {
            id: taskId,
            excelFile: settings.excelFile,
            status: settings.status,
            startTime: settings.startTime || null,
            endTime: settings.endTime || null,
            extendData: settings.extendData
        }

        return http.post(`/excel/updateParseFile`, requestData)
    },

    /**
     * 删除任务
     * @param taskId 任务ID
     * @returns 删除结果
     */
    deleteTask(taskId: string): Promise<ApiResponse> {
        return http.delete(`/excel/deleteParseFile?taskId=${taskId}`)
    },

    /**
     * 获取Excel数据详情
     * @param taskId 任务ID
     * @param params 分页参数
     * @returns Excel数据详情
     */
    getExcelData(taskId: string, params: PageParams): Promise<ApiResponse> {
        return http.get(`/excel/getExcelData?taskId=${taskId}`, {
            params
        })
    },

    /**
     * 获取解析文件详情页面数据
     * @param taskId 任务ID
     * @param params 分页参数
     * @returns Excel数据详情响应
     */
    getParseFileDetailPage(taskId: string, params: ExcelDataPageParams): Promise<ExcelDataDetailResponse> {
        return http.get(`/excel/getParseFileDetailPage`, {
            params: {
                taskId,
                ...params
            }
        })
    },

    /**
     * 搜索Excel数据
     * @param params 搜索参数
     * @returns 搜索结果
     */
    searchExcelData(params: any): Promise<ApiResponse<any[]>> {
        return http.post('/excel/searchRows', params)
    },

    /**
     * 获取Excel文件元数据
     * @param fileCoding 文件编码
     * @returns 文件元数据
     */
    getExcelMeta(fileCoding: string): Promise<ApiResponse<any>> {
        return http.get(`/excel/meta?fileCoding=${fileCoding}`)
    }
}

/**
 * Excel转Word相关API
 */
export const excelToWordApi = {
    /**
     * 解析Excel表格
     * @param params 解析参数
     * @returns 解析结果
     */
    parseTable(params: {
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
    }): Promise<ApiResponse<{
        vars: Array<{
            title: string
            var: string
        }>
        path: string
    }>> {
        return http.post('/api/excel-to-word/parse-table', params)
    }
}

/**
 * 导出所有API
 */
export default {
    file: fileApi,
    excel: excelApi
}
