import { invoke, isTauri as isTauriFn } from '@tauri-apps/api/core'

export const isTauri = isTauriFn()
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

function sendLog(content: string) {
    if (!isTauri) return
    try {
        // window?.__TAURI__?.core // 全局变量，增加了安全性风险，性能影响，页面加载变慢
        invoke('send_log', {content}).catch((e) => {
            console.error('Failed to send log:', e)
        })
    } catch (e) {
        console.log('[Failed to sendLog]', e)
    }
}

export async function checkPortAvailable(port: number) {
    if (!isTauri) return false
    try {
        return await invoke<boolean>('check_port_available', {port})
    } catch (err) {
        log.error('Failed to check port availability:', err)
        return false
    }
}

export function restartRay() {
    if (!isTauri) return
    try {
        invoke('restart_ray')
    } catch (err) {
        log.error('Failed to restartRay:', err)
    }
}

export async function readAppConfig(): Promise<AppConfig> {
    return new Promise(async (resolve, reject) => {
        if (!isTauri) return reject()
        try {
            const data = await invoke('get_config_json') as string
            const config = JSON.parse(data) as AppConfig
            resolve(config)
        } catch (err) {
            log.error('Failed to readConfig:', err)
            reject(err)
        }
    })
}

export function setAppConfig(cmd: string, value: string | number | boolean) {
    if (!isTauri) return
    (async () => {
        try {
            const ok = await invoke<boolean>(cmd, {value})
            !ok && log.warn(`Failed to setConfig ${cmd}:`, value)
        } catch (err) {
            log.error('Failed to setConfig:', err)
        }
    })()
}

export async function readRayCommonConfig(): Promise<RayCommonConfig> {
    return new Promise(async (resolve, reject) => {
        if (!isTauri) return reject()
        try {
            let data = await invoke('read_conf', {'filename': 'ray_common_config.json'}) as string
            data = data.trim()
            if (data) {
                const config = JSON.parse(data) as RayCommonConfig
                resolve(config)
            } else {
                reject()
            }
        } catch (err) {
            log.error('Failed to readRayCommonConfig:', err)
            reject(err)
        }
    })
}

export async function saveRayCommonConfig(content: RayCommonConfig) {
    if (!isTauri) return false
    try {
        return invoke<Boolean>('save_conf', {
            'filename': 'ray_common_config.json',
            'content': JSON.stringify(content, null, 2)
        })
    } catch (err) {
        log.error('Failed to saveRayCommonConfig:', err)
        return false
    }
}

export async function readRayConfig(): Promise<any> {
    return new Promise(async (resolve, reject) => {
        if (!isTauri) return reject()
        try {
            let data = await invoke('read_ray_config') as string
            data = data.trim()
            if (data) {
                const config = JSON.parse(data)
                resolve(config)
            } else {
                reject()
            }
        } catch (err) {
            log.error('Failed to readRayConfig:', err)
            reject(err)
        }
    })
}

export async function saveRayConfig(content: any) {
    if (!isTauri) return false
    try {
        return await invoke<Boolean>('save_ray_config', {'content': JSON.stringify(content, null, 2)})
    } catch (err) {
        log.error('Failed to saveRayConfig:', err)
        return false
    }
}

export async function saveProxyPac(content: any) {
    if (!isTauri) return false
    try {
        return await invoke<Boolean>('save_proxy_pac', {'content': content.trim()})
    } catch (err) {
        log.error('Failed to saveProxyPac:', err)
        return false
    }
}

export async function readLogsAllList() {
    return new Promise(async (resolve, reject) => {
        if (!isTauri) return reject()
        try {
            const s = await invoke('read_logs_all_list') as string
            const data = JSON.parse(s)
            resolve(data)
        } catch (err) {
            log.error('Failed to readLogsAllList:', err)
            reject(err)
        }
    })
}

export async function clearAllLogFiles() {
    if (!isTauri) return false
    try {
        return await invoke<boolean>('clear_log_all_files')
    } catch (err) {
        log.error('Failed to clearAllLogFiles:', err)
        return false
    }
}
