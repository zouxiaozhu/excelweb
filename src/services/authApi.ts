import { http } from './request'
import type { ApiResponse } from '@/typings/api'

// API基础路径
const API_BASE_PATH = '/system/user'

// 接口类型定义
export interface LoginRequest {
    userName: string
    password: string
    rememberMe?: boolean
}

export interface RegisterRequest {
    userName: string
    email: string
    password: string
    confirmPassword: string
    nickName?: string
    mobile?: string
}

export interface UpdateUserProfileRequest {
    nickName?: string
    email?: string
    mobile?: string
}

export interface UserInfoDto {
    userId: number
    userName: string
    nickName: string
    email: string
    mobile: string
    loginTime: string
    avatar: string
}

export interface TokenInfo {
    accessToken: string
    tokenExpireTime: string
    refreshTime: string
}

export interface LoginRegisterResponse {
    userInfo: UserInfoDto
    tokenInfo: TokenInfo
}

export interface RegisterResponse {
    userInfo: UserInfoDto
    tokenInfo: TokenInfo
    needEmailVerification: boolean
    message: string
}

// API方法
export const authApiService = {
    /**
     * 用户登录
     */
    async login(request: LoginRequest): Promise<ApiResponse<LoginRegisterResponse>> {
        return http.post(`${API_BASE_PATH}/login`, request)
    },

    /**
     * 用户注册
     */
    async register(request: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
        return http.post(`${API_BASE_PATH}/register`, request)
    },

    /**
     * 检查token并获取用户信息
     */
    async checkTokenAndGetUserInfo(): Promise<ApiResponse<LoginRegisterResponse>> {
        return http.post(`${API_BASE_PATH}/checkTokenAndGetUserInfo`)
    },

    /**
     * 检查用户名是否存在
     */
    async checkUserName(userName: string): Promise<ApiResponse<boolean>> {
        return http.get(`${API_BASE_PATH}/checkUserName`, {
            params: { userName }
        })
    },

    /**
     * 检查邮箱是否存在
     */
    async checkEmail(email: string): Promise<ApiResponse<boolean>> {
        return http.get(`${API_BASE_PATH}/checkEmail`, {
            params: { email }
        })
    },

    /**
     * 测试接口
     */
    async test(): Promise<ApiResponse<string>> {
        return http.get(`${API_BASE_PATH}/test`)
    },

    /**
     * 更新用户资料
     */
    async updateUserProfile(request: UpdateUserProfileRequest): Promise<ApiResponse<UserInfoDto>> {
        return http.post(`${API_BASE_PATH}/update`, request)
    }
}

export default authApiService
