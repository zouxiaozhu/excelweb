/**
 * 环境配置工具
 */

// 环境变量类型定义
interface EnvConfig {
  NODE_ENV: string
  VITE_APP_TITLE: string
  VITE_APP_VERSION: string
  VITE_API_BASE_URL: string
  VITE_API_TIMEOUT: number
}

// 获取环境配置
export const getEnvConfig = (): EnvConfig => {
  return {
    NODE_ENV: import.meta.env.NODE_ENV || 'development',
    VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE || 'Excel Web',
    VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8901',
    VITE_API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000')
  }
}

// 判断是否为开发环境
export const isDevelopment = (): boolean => {
  return import.meta.env.NODE_ENV === 'development'
}

// 判断是否为生产环境
export const isProduction = (): boolean => {
  return import.meta.env.NODE_ENV === 'production'
}

// 获取API基础URL
export const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8901'
}

// 获取应用标题
export const getAppTitle = (): string => {
  return import.meta.env.VITE_APP_TITLE || 'Excel Web'
}

// 获取应用版本
export const getAppVersion = (): string => {
  return import.meta.env.VITE_APP_VERSION || '1.0.0'
}

// 获取API超时时间
export const getApiTimeout = (): number => {
  return parseInt(import.meta.env.VITE_API_TIMEOUT || '10000')
}

// 环境信息
export const envInfo = {
  isDev: isDevelopment(),
  isProd: isProduction(),
  apiBaseUrl: getApiBaseUrl(),
  appTitle: getAppTitle(),
  appVersion: getAppVersion(),
  apiTimeout: getApiTimeout()
}

export default envInfo
