export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null
    return function (this: any, ...args: Parameters<T>) {
        const later = () => {
            timeout = null
            func.apply(this, args)
        }
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

export const sizeToUnit = (size: number): string => {
    if (size <= 0) return '0 B'

    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
    }

    const decimalPlaces = unitIndex === 0 ? 0 : 2
    return `${size.toFixed(decimalPlaces)} ${units[unitIndex]}`
}

export function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

// 支持验证 5 个版本 UUID 的验证
export function isValidUUID(uuid: string): boolean {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return regex.test(uuid)
}

/**
 * 计算字符串的哈希值
 * @param input 输入字符串
 * @param algorithm 哈希算法，默认为 'SHA-256', 可选 'MD5', 'SHA-1', 'SHA-384', 'SHA-512' 等
 * @returns 哈希值的十六进制字符串
 */
export async function hashString(input: string, algorithm: string = 'SHA-256'): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const hashBuffer = await crypto.subtle.digest(algorithm, data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('')
}

export function getCurrentYMDHIS(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    return `${year}${month}${day}_${hours}${minutes}${seconds}`
}

export function isMacOS() {
    return /Mac/i.test(navigator.userAgent)
}

export function isLinux() {
    return /Linux/i.test(navigator.userAgent)
}

export function isWindows() {
    return /Win/i.test(navigator.userAgent)
}

const logNameMap: Record<string, string> = {
    'dray.log': 'Dray 运行日志',
    'web_interface.log': 'Dray 交互日志',
    'web_server.log': 'Web 访问日志',
    'ray_server.log': 'Xray 启动日志',
    'xray_access.log': 'Xray 请求日志',
    'xray_error.log': 'Xray 运行日志',
}

export const formatLogName = (filename: string, showFull: boolean = false): string => {
    return !logNameMap[filename] ? filename : (showFull ? `${logNameMap[filename]} (${filename})` : logNameMap[filename])
}

export function validateIp(value: string) {
    // IPv4 正则表达式
    const ipv4Pattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    /*// IPv6 正则表达式
    const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$|^[0-9a-fA-F]{1,4}::([0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:):([0-9a-fA-F]{1,4}:){0,4}[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){2}:([0-9a-fA-F]{1,4}:){0,3}[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){3}:([0-9a-fA-F]{1,4}:){0,2}[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){4}:([0-9a-fA-F]{1,4}:)?[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){5}:[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){6}$/
    // 支持 IPv4 映射的 IPv6 地址
    const ipv4MappedIpv6Pattern = /^::(ffff(:0{1,4})?:)?((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    return ipv4Pattern.test(value) || ipv6Pattern.test(value) || ipv4MappedIpv6Pattern.test(value)*/
    return ipv4Pattern.test(value)
}

export function validatePort(value: number) {
    return value > 0 && value <= 65535
}

export function formatPort(value: any): string {
    const num = Math.min(Math.max(Number(value), 0), 65535)
    return num ? String(num) : ''
}
