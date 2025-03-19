export function debounce(func: Function, wait: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null
    return function (this: any, ...args: any[]) {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(this, args), wait)
    }
}

function sendLog(msg: string) {
    try {
        window?.__TAURI__.core.invoke('send_log', {msg}).catch((e) => {
            console.error('Failed to send log:', e)
        })
    } catch (e) {
        console.log('[Failed to sendLog]', e)
    }
}

export const log = {
    error: (message: string, ...args: any[]) => {
        const logMessage = `[ERROR] ${message} ${args.map(arg => JSON.stringify(arg)).join(' ')}`
        console.log(logMessage)
        sendLog(logMessage)
    },
    warn: (message: string, ...args: any[]) => {
        const logMessage = `[WARN] ${message} ${args.map(arg => JSON.stringify(arg)).join(' ')}`
        console.log(logMessage)
        sendLog(logMessage)
    },
    info: (message: string, ...args: any[]) => {
        const logMessage = `[INFO] ${message} ${args.map(arg => JSON.stringify(arg)).join(' ')}`
        console.log(logMessage)
        sendLog(logMessage)
    },
}
