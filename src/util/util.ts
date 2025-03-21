import { useRef, useEffect } from 'react'

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null

    const debounced = function (this: any, ...args: Parameters<T>) {
        const later = () => {
            timeout = null
            func.apply(this, args)
        }
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }

    debounced.cancel = () => {
        if (timeout) {
            clearTimeout(timeout)
            timeout = null
        }
    }

    return debounced
}

export const useDebounce = <T extends (...args: any[]) => any>(callback: T, delay: number) => {
    const debouncedCallback = useRef(debounce(callback, delay))
    useEffect(() => {
        return () => debouncedCallback.current.cancel()
    }, [callback, delay])
    return debouncedCallback.current
}

export function validateIp(value: string) {
    const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    return ipPattern.test(value)
}

export function validatePort(value: number) {
    return value > 0 && value <= 65535
}
