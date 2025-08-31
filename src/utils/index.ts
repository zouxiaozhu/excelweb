/**
 * 通用工具函数
 */


/**
 * 格式化时间
 * @param time 时间字符串或时间戳
 * @param format 格式类型
 * @returns 格式化后的时间字符串
 */
export function formatTime(time: string | number, format: 'datetime' | 'date' | 'time' = 'datetime'): string {
    const date = new Date(time)

    if (isNaN(date.getTime())) {
        return '无效时间'
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    switch (format) {
        case 'date':
            return `${year}-${month}-${day}`
        case 'time':
            return `${hours}:${minutes}:${seconds}`
        case 'datetime':
        default:
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout

    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => func.apply(this, args), delay)
    }
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let lastTime = 0

    return (...args: Parameters<T>) => {
        const now = Date.now()
        if (now - lastTime >= delay) {
            lastTime = now
            func.apply(this, args)
        }
    }
}

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 深拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
        return obj
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime()) as T
    }

    if (obj instanceof Array) {
        return obj.map(item => deepClone(item)) as T
    }

    if (typeof obj === 'object') {
        const cloned = {} as T
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                cloned[key] = deepClone(obj[key])
            }
        }
        return cloned
    }

    return obj
}

/**
 * 生成唯一ID
 * @param prefix 前缀
 * @returns 唯一ID字符串
 */
export function generateId(prefix = ''): string {
    const timestamp = Date.now().toString(36)
    const randomStr = Math.random().toString(36).substring(2, 8)
    return prefix ? `${prefix}_${timestamp}_${randomStr}` : `${timestamp}_${randomStr}`
}

/**
 * 下载文件
 * @param url 文件URL
 * @param filename 文件名
 */
export function downloadFile(url: string, filename: string): void {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

/**
 * 将文件转换为Base64
 * @param file 文件对象
 * @returns Promise<string> Base64字符串
 */
export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result)
            } else {
                reject(new Error('Failed to convert file to base64'))
            }
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

/**
 * 验证文件类型
 * @param file 文件对象
 * @param allowedTypes 允许的文件类型数组
 * @returns 是否为允许的文件类型
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    return allowedTypes.includes(fileExtension)
}

/**
 * 验证文件大小
 * @param file 文件对象
 * @param maxSizeMB 最大文件大小（MB）
 * @returns 是否在允许的大小范围内
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    return file.size <= maxSizeBytes
}

/**
 * 获取文件扩展名
 * @param filename 文件名
 * @returns 文件扩展名
 */
export function getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * 判断是否为空值
 * @param value 要判断的值
 * @returns 是否为空值
 */
export function isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') return value.trim() === ''
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === 'object') return Object.keys(value).length === 0
    return false
}
