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

export function validateIp(value: string) {
    const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    return ipPattern.test(value)
}

export function validatePort(value: number) {
    return value > 0 && value <= 65535
}
