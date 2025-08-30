import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage, ElLoading } from 'element-plus'
import type { ApiResponse } from '@/typings/api'

// 自定义错误类型
interface CustomError extends Error {
    responseData?: Record<string, any>
    code?: number | string
}

// 环境配置
const isDev = import.meta.env.DEV
const baseURL = import.meta.env.VITE_API_BASE_URL

// 创建axios实例
const request: AxiosInstance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        // 添加token等认证信息
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
        const { data } = response
        // 根据业务需求处理响应数据
        if (data.code === 0) {
            return data.data
        } else {
            const error = new Error(data.message || '请求失败') as CustomError
            error.responseData = data.data
            error.code = data.code
            ElMessage.error(data.message || '请求失败')
            return Promise.reject(error)
        }
    },
    (error) => {
        let message = '网络错误'

        if (error.response) {
            const { status, data } = error.response
            switch (status) {
                case 400:
                    message = data.message || '请求参数错误'
                    break
                case 401:
                    message = '未授权，请重新登录'
                    break
                case 403:
                    message = '权限不足'
                    break
                case 404:
                    message = '请求的资源不存在'
                    break
                case 500:
                    message = '服务器内部错误'
                    break
                default:
                    message = data.message || `请求失败 (${status})`
            }
        } else if (error.code === 'ECONNABORTED') {
            message = '请求超时'
        } else if (error.message) {
            message = error.message
        }

        ElMessage.error(message)
        return Promise.reject(error)
    }
)

// 封装不同类型的请求方法
export const http = {
    // GET请求
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return request.get(url, config)
    },

    // POST请求
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return request.post(url, data, config)
    },

    // POST JSON请求
    postJson<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return request.post(url, data, {
            ...config,
            headers: {
                'Content-Type': 'application/json',
                ...config?.headers
            }
        })
    },

    // POST 文件上传
    postFile<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
        return request.post(url, formData, {
            ...config,
            headers: {
                'Content-Type': 'multipart/form-data',
                ...config?.headers
            }
        })
    },

    // PUT请求
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return request.put(url, data, config)
    },

    // DELETE请求
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return request.delete(url, config)
    }
}

// 带加载状态的请求封装
export const httpWithLoading = {
    async request<T = any>(
        requestFn: () => Promise<T>,
        loadingText = '加载中...'
    ): Promise<T> {
        const loading = ElLoading.service({
            lock: true,
            text: loadingText,
            background: 'rgba(0, 0, 0, 0.7)'
        })

        try {
            const result = await requestFn()
            return result
        } finally {
            loading.close()
        }
    }
}

export default request
