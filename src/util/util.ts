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

export const processLines = (input: string, delimiter: string = '\n'): string[] => {
    return input
        .split(delimiter) // 按指定分隔符分割
        .map(line => line.trim()) // 清理每行的前后空格
        .filter(line => line.length > 0) // 过滤掉空行
}

export function processDomain(domain: string, validate: boolean = false, sort: boolean = true): string {
    domain = domain.trim()
    if (domain.length === 0) return ''

    // 清理每行字符串的两端空格，排除空字符串行
    const cleanedDomains = domain.split('\n')
        .map(d => d.trim())
        .filter(d => {
            if (d.length === 0) return false
            // 验证域名合法性
            if (validate) {
                const domainPattern = /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/
                return domainPattern.test(d)
            }
            return true
        })

    // 去重
    const uniqueDomains = [...new Set(cleanedDomains)]

    // 根据 sort 参数决定是否排序
    if (sort) uniqueDomains.sort()

    // 重新用 \n 连接
    return uniqueDomains.join('\n')
}

export function processIP(ip: string, sort: boolean = true): string {
    ip = ip.trim()
    if (ip.length === 0) return ''

    // 清理每行字符串的两端空格，排除空字符串行
    const cleanedIPs = ip.split('\n')
        .map(i => i.trim())
        .filter(i => i.length > 0)

    // 去重
    const uniqueIPs = [...new Set(cleanedIPs)]

    // 根据 sort 参数决定是否排序
    if (sort) uniqueIPs.sort()

    // 重新用 \n 连接
    return uniqueIPs.join('\n')
}

export function processPort(port: string): string {
    port = port.trim()
    if (port.length === 0) return ''

    // 清理每行字符串的两端空格，排除空字符串行
    const cleanedPorts = port.split('\n')
        .map(p => p.trim())
        .filter(p => {
            if (p.length === 0) return false

            // 验证单个端口（如 "123"）
            if (/^\d+$/.test(p)) {
                const portNum = Number(p)
                return portNum > 0 && portNum <= 65535
            }

            // 验证端口范围（如 "1000-2000"）
            if (/^\d+-\d+$/.test(p)) {
                const [start, end] = p.split('-').map(Number)
                return start > 0 && start <= 65535 && end > 0 && end <= 65535 && start <= end
            }

            return false // 其他格式无效
        })

    // 去重，并排序
    const uniquePorts = [...new Set(cleanedPorts)].sort()

    // 重新用 \n 连接
    return uniquePorts.join('\n')
}
