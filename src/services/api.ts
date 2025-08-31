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
    PageResponse
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
        return http.post(`/excel/updateTaskSetting`, {
            taskId,
            ...settings
        })
    }
}

/**
 * 导出所有API
 */
export default {
    file: fileApi,
    excel: excelApi
}
