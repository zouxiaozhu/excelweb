import { defineStore } from 'pinia'
import type { ExcelParseTask } from '../typings/api'
import { authApiService, type UserInfoDto, type TokenInfo } from '../services/authApi'
import { tr } from 'element-plus/es/locales.mjs'

/**
 * 用户信息接口
 */
interface UserInfo {
    id: string
    username: string
    email: string
    nickName?: string
    mobile?: string
    phone?: string
    bio?: string
    avatar?: string
    isExperienceAccount?: boolean
}

interface TokenInfo {
    accessToken: string
    tokenExpireTime: string
    refreshTime: string
}

/**
 * 全局状态管理
 */
export const useGlobalStore = defineStore('global', {
    state: () => ({
        // 当前模式：预览模式或实用模式
        mode: 'preview' as 'preview' | 'practical',

        // 用户登录状态
        isLoggedIn: false,
        userInfo: null as UserInfo | null,
        token: null as string | null,

        // 当前上传的文件信息
        currentFile: null as {
            fileId: string
            fileName: string
            fileSize: number
        } | null,

        // Excel解析任务列表
        excelTasks: [] as ExcelParseTask[],

        // 当前选中的任务
        currentTask: null as ExcelParseTask | null
    }),

    getters: {
        // 是否为预览模式
        isPreviewMode: (state) => state.mode === 'preview',

        // 是否有当前文件
        hasCurrentFile: (state) => state.currentFile !== null,

        // 当前文件名
        currentFileName: (state) => state.currentFile?.fileName || '',

        // 任务总数
        taskCount: (state) => state.excelTasks.length,

        // 是否为体验账号
        isExperienceAccount: (state) => state.userInfo?.isExperienceAccount || false,

        // 用户名
        username: (state) => state.userInfo?.username || '',

        // 用户头像
        userAvatar: (state) => state.userInfo?.avatar || ''
    },

    actions: {
        /**
         * 切换模式
         */
        toggleMode() {
            this.mode = this.mode === 'preview' ? 'practical' : 'preview'
        },

        /**
 * 设置用户登录状态
 */
        setLoginState(isLoggedIn: boolean, userInfo: UserInfo | null, token: string | null, isExperienceAccount: boolean) {
            this.isLoggedIn = isLoggedIn
            this.userInfo = userInfo
            this.token = token

            // 保存到本地存储
            if (isLoggedIn && userInfo && token) {
                localStorage.setItem('userInfo', JSON.stringify(userInfo))
                localStorage.setItem('token', token)
                localStorage.setItem('isExperienceAccount', isExperienceAccount.toString())
            } else {
                localStorage.removeItem('userInfo')
                localStorage.removeItem('token')
                localStorage.removeItem('isExperienceAccount')
            }
        },

        /**
 * 体验账号登录
 */
        async loginWithExperienceAccount() {
            try {
                // 使用体验账号登录（这里使用固定的体验账号）
                const data = await authApiService.login({
                    userName: '体验账号',
                    password: '@tiyanzhanghaodemima123',
                    rememberMe: false
                })

                const userInfo: UserInfo = {
                    id: data.userInfo.userId.toString(),
                    username: data.userInfo.userName,
                    email: data.userInfo.email,
                    nickName: data.userInfo.nickName,
                    mobile: data.userInfo.mobile,
                    phone: data.userInfo.phone,
                    bio: data.userInfo.bio,
                    isExperienceAccount: true,
                    avatar: data.userInfo.avatar
                }
                this.setLoginState(true, userInfo, data.tokenInfo.accessToken, true)
                return { success: true, userInfo }
            } catch (error) {
                console.error('体验账号登录错误:', error)
                return { success: false, error: error.message || '体验账号登录失败' }
            }
        },

        /**
 * 用户登录
 */
        async loginWithUserAccount(username: string, password: string) {
            try {
                const response = await authApiService.login({
                    userName: username,
                    password: password,
                    rememberMe: false
                })

                if (response.code === 200 && response.data) {
                    const userInfo: UserInfo = {
                        id: response.data.userInfo.userId.toString(),
                        username: response.data.userInfo.userName,
                        email: response.data.userInfo.email,
                        nickName: response.data.userInfo.nickName,
                        mobile: response.data.userInfo.mobile,
                        phone: response.data.userInfo.phone,
                        bio: response.data.userInfo.bio,
                        isExperienceAccount: false,
                        avatar: response.data.userInfo.avatar
                    }

                    this.setLoginState(true, userInfo, response.data.tokenInfo.accessToken)
                    return { success: true, userInfo }
                } else {
                    throw new Error(response.message || '登录失败')
                }
            } catch (error) {
                console.error('用户登录错误:', error)
                return { success: false, error: error.message || '登录失败' }
            }
        },

        /**
 * 用户注册
 */
        async registerUser(username: string, email: string, password: string, confirmPassword: string, nickName?: string) {
            try {
                const response = await authApiService.register({
                    userName: username,
                    email: email,
                    password: password,
                    confirmPassword: confirmPassword,
                    nickName: nickName || username
                })
                return { success: true, message: '注册成功' }
            } catch (error) {
                console.error('用户注册错误:', error)
                return { success: false, error: error.message || '注册失败' }
            }
        },

        /**
         * 用户登出
         */
        logout() {
            this.setLoginState(false, null, null)
        },

        /**
         * 初始化用户状态（从本地存储恢复）
         */
        async initUserState() {
            // 检查当前路由，如果是表格快搜页面则跳过用户状态检查
            const currentRoute = window.location.pathname
            if (currentRoute === '/excel-search') {
                console.log('表格快搜页面，跳过用户状态检查')
                return
            }

            const token = localStorage.getItem('token')
            if (token) {
                try {
                    // 验证token并获取用户信息
                    const data = await authApiService.checkTokenAndGetUserInfo()

                    const userInfo: UserInfo = {
                        id: data.userInfo.userId.toString(),
                        username: data.userInfo.userName,
                        email: data.userInfo.email,
                        nickName: data.userInfo.nickName,
                        mobile: data.userInfo.mobile,
                        phone: data.userInfo.phone,
                        bio: data.userInfo.bio,
                        avatar: data.userInfo.avatar,
                        isExperienceAccount: data.isExp
                    }

                    const tokneInfo: TokenInfo = {
                        accessToken: data.tokenInfo.accessToken,
                        tokenExpireTime: data.tokenInfo.tokenExpireTime,
                        refreshTime: data.tokenInfo.refreshTime
                    }

                    const isExperienceAccount = data.isExp;
                    this.setLoginState(true, userInfo, tokneInfo.accessToken, isExperienceAccount)
                } catch (error) {
                    console.error('Token验证失败，清理登录状态:', error)
                    // 清理store中的登录状态
                    this.logout()
                }
            } else {
                this.logout()
            }
        },

        /**
         * 设置当前文件
         */
        setCurrentFile(file: { fileId: string; fileName: string; fileSize: number } | null) {
            this.currentFile = file
        },

        /**
         * 设置Excel任务列表
         */
        setExcelTasks(tasks: ExcelParseTask[]) {
            this.excelTasks = tasks
        },

        /**
         * 添加Excel任务
         */
        addExcelTask(task: ExcelParseTask) {
            this.excelTasks.unshift(task)
        },

        /**
         * 更新Excel任务状态
         */
        updateExcelTask(taskId: string, updates: Partial<ExcelParseTask>) {
            const index = this.excelTasks.findIndex(task => task.taskId === taskId)
            if (index !== -1) {
                this.excelTasks[index] = { ...this.excelTasks[index], ...updates }
            }
        },

        /**
         * 设置当前任务
         */
        setCurrentTask(task: ExcelParseTask | null) {
            this.currentTask = task
        },

        /**
        * 清空当前文件和任务
        */
        clearCurrent() {
            this.currentFile = null
            this.currentTask = null
        },

        /**
         * 更新用户信息
         */
        updateUserInfo(updates: Partial<UserInfo>) {
            if (this.userInfo) {
                this.userInfo = { ...this.userInfo, ...updates }
                // 更新本地存储
                localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
            }
        },

        /**
         * 更新用户头像
         */
        updateUserAvatar(avatarUrl: string) {
            if (this.userInfo) {
                this.userInfo.avatar = avatarUrl
                // 更新本地存储
                localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
            }
        }
    }
})