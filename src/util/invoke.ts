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

function sendLog(msg: string) {
    if (!isTauri) return
    try {
        // window?.__TAURI__?.core // 全局变量，增加了安全性风险，性能影响，页面加载变慢
        invoke('send_log', {msg}).catch((e) => {
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

export async function readConfig() {
    if (!isTauri) return
    try {
        const data = await invoke('get_config_json') as string
        return JSON.parse(data) as AppConfig
    } catch (err) {
        log.error('Failed to readConfig:', err)
    }
}

export function setConfig(cmd: string, value: string | number | boolean) {
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

export async function readRayCommonConfig() {
    if (!isTauri) return
    try {
        const data = await invoke('read_conf', {'filename': 'ray_common_config.json'}) as string
        return JSON.parse(data) as RayConfig
    } catch (err) {
        log.error('Failed to readRayCommonConfig:', err)
    }
}

export function saveRayCommonConfig(content: RayConfig) {
    if (!isTauri) return
    try {
        invoke('save_conf', {
            'filename': 'ray_common_config.json',
            'content': JSON.stringify(content, null, 2)
        })
    } catch (err) {
        log.error('Failed to saveRayCommonConfig:', err)
    }
}

export async function readRayConfig() {
    if (!isTauri) return
    try {
        const data = await invoke('read_ray_config') as string
        return JSON.parse(data)
    } catch (err) {
        log.error('Failed to readRayConfig:', err)
    }
}

export function saveRayConfig(content: any) {
    if (!isTauri) return
    try {
        invoke('save_ray_config', {'content': JSON.stringify(content, null, 2)})
    } catch (err) {
        log.error('Failed to saveRayConfig:', err)
    }
}

export function saveProxyPac(content: any) {
    if (!isTauri) return
    try {
        invoke('save_proxy_pac', {'content': content.trim()})
    } catch (err) {
        log.error('Failed to saveProxyPac:', err)
    }
}
