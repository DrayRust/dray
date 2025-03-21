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

export function debounceWithCallback<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    callback?: () => void
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null
    return function (this: any, ...args: Parameters<T>) {
        const later = () => {
            timeout = null
            func.apply(this, args)
            if (callback) callback()
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
