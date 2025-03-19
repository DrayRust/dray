import { invoke, isTauri } from '@tauri-apps/api/core'

export function debounce(func: Function, wait: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null
    return function (this: any, ...args: any[]) {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(this, args), wait)
    }
}

function sendLog(msg: string) {
    try {
        // window?.__TAURI__?.core // 全局变量，增加了安全性风险，性能影响，页面加载变慢
        isTauri() && invoke('send_log', {msg}).catch((e) => {
            console.error('Failed to send log:', e)
        })
    } catch (e) {
        console.log('[Failed to sendLog]', e)
    }
}

export const log = {
    error: (message: string, ...args: any[]) => {
        console.log(`[ERROR] ${message}`, ...args)
        sendLog(`[ERROR] ${message} ${args.map(arg => JSON.stringify(arg)).join(' ')}`)
    },
    warn: (message: string, ...args: any[]) => {
        console.log(`[WARN] ${message}`, ...args)
        sendLog(`[WARN] ${message} ${args.map(arg => JSON.stringify(arg)).join(' ')}`)
    },
    info: (message: string, ...args: any[]) => {
        console.log(`[INFO] ${message}`, ...args)
        sendLog(`[INFO] ${message} ${args.map(arg => JSON.stringify(arg)).join(' ')}`)
    },
}
