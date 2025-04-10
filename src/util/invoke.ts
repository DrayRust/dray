import { invoke, isTauri as isTauriFn } from '@tauri-apps/api/core'
import { DEFAULT_RAY_COMMON_CONFIG } from "./config.ts"

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

export async function getDrayAppDir(): Promise<string> {
    if (!isTauri) return ''
    try {
        return await invoke('get_dray_app_dir')
    } catch (err) {
        log.error('Failed to get dray app dir:', err)
        return ''
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
            const s = await invoke('get_config_json') as string
            const data = JSON.parse(s) as AppConfig
            resolve(data)
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

export async function loadRayCommonConfig(): Promise<RayCommonConfig> {
    return new Promise(async (resolve, reject) => {
        if (!isTauri) return reject()
        readRayCommonConfig().then(c => {
            resolve({...DEFAULT_RAY_COMMON_CONFIG, ...c})
        }).catch(_ => {
            saveRayCommonConfig(DEFAULT_RAY_COMMON_CONFIG).catch(_ => 0)
            resolve(DEFAULT_RAY_COMMON_CONFIG)
        })
    })
}

export async function readRayCommonConfig(): Promise<RayCommonConfig> {
    return new Promise(async (resolve, reject) => {
        if (!isTauri) return reject()
        try {
            let s = await invoke('read_conf', {'filename': 'ray_common_config.json'}) as string
            s = s.trim()
            if (s) {
                const data = JSON.parse(s) as RayCommonConfig
                resolve(data)
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

export async function readServerList(): Promise<ServerList> {
    return new Promise(async (resolve, reject) => {
        if (!isTauri) return reject()
        try {
            let s = await invoke('read_conf', {'filename': 'server.json'}) as string
            s = s.trim()
            if (s) {
                const data = JSON.parse(s) as ServerList
                resolve(data)
            } else {
                reject()
            }
        } catch (err) {
            log.error('Failed to readServerList:', err)
            reject(err)
        }
    })
}

export async function saveServerList(serverList: ServerList) {
    if (!isTauri) return false
    try {
        return invoke<Boolean>('save_conf',
            {'filename': 'server.json', 'content': JSON.stringify(serverList, null, 2)}
        )
    } catch (err) {
        log.error('Failed to saveServerList:', err)
        return false
    }
}

export async function readRuleConfig(): Promise<RuleConfig> {
    return new Promise(async (resolve, reject) => {
        if (!isTauri) return reject()
        try {
            let s = await invoke('read_conf', {'filename': 'rule_config.json'}) as string
            s = s.trim()
            if (s) {
                const data = JSON.parse(s) as RuleConfig
                resolve(data)
            } else {
                reject()
            }
        } catch (err) {
            log.error('Failed to readRuleConfig:', err)
            reject(err)
        }
    })
}

export async function saveRuleConfig(ruleConfig: RuleConfig) {
    if (!isTauri) return false
    try {
        return invoke<Boolean>('save_conf',
            {'filename': 'rule_config.json', 'content': JSON.stringify(ruleConfig, null, 2)}
        )
    } catch (err) {
        log.error('Failed to saveRuleConfig:', err)
        return false
    }
}

export async function readRuleDomain(): Promise<RuleDomain> {
    return new Promise(async (resolve, reject) => {
        if (!isTauri) return reject()
        try {
            let s = await invoke('read_conf', {'filename': 'rule_domain.json'}) as string
            s = s.trim()
            if (s) {
                const data = JSON.parse(s) as RuleDomain
                resolve(data)
            } else {
                reject()
            }
        } catch (err) {
            log.error('Failed to readRuleDomain:', err)
            reject(err)
        }
    })
}

export async function saveRuleDomain(ruleDomain: RuleDomain) {
    if (!isTauri) return false
    try {
        return invoke<Boolean>('save_conf',
            {'filename': 'rule_domain.json', 'content': JSON.stringify(ruleDomain, null, 2)}
        )
    } catch (err) {
        log.error('Failed to saveRuleDomain:', err)
        return false
    }
}

export async function readRuleModeList(): Promise<RuleModeList> {
    return new Promise(async (resolve, reject) => {
        if (!isTauri) return reject()
        try {
            let s = await invoke('read_conf', {'filename': 'rule_mode_list.json'}) as string
            s = s.trim()
            if (s) {
                const data = JSON.parse(s) as RuleModeList
                resolve(data)
            } else {
                reject()
            }
        } catch (err) {
            log.error('Failed to readRuleModeList:', err)
            reject(err)
        }
    })
}

export async function saveRuleModeList(ruleModeList: RuleModeList) {
    if (!isTauri) return false
    try {
        return invoke<Boolean>('save_conf',
            {'filename': 'rule_mode_list.json', 'content': JSON.stringify(ruleModeList, null, 2)}
        )
    } catch (err) {
        log.error('Failed to saveRuleModeList:', err)
        return false
    }
}

export async function readRayConfig(): Promise<any> {
    return new Promise(async (resolve, reject) => {
        if (!isTauri) return reject()
        try {
            let s = await invoke('read_ray_config') as string
            s = s.trim()
            if (s) {
                const data = JSON.parse(s)
                resolve(data)
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

export async function saveProxyPac(content: string) {
    if (!isTauri) return false
    try {
        return await invoke<Boolean>('save_proxy_pac', {content})
    } catch (err) {
        log.error('Failed to saveProxyPac:', err)
        return false
    }
}

export async function saveTextFile(path: string, content: string) {
    if (!isTauri) return false
    try {
        return await invoke<Boolean>('save_text_file', {path, content})
    } catch (err) {
        log.error('Failed to saveTextFile:', err)
        return false
    }
}

export async function openWebServerDir() {
    if (!isTauri) return false
    try {
        return await invoke<boolean>('open_web_server_dir')
    } catch (err) {
        log.error('Failed to clearLogAll:', err)
        return false
    }
}

export async function clearLogAll() {
    if (!isTauri) return false
    try {
        return await invoke<boolean>('clear_log_all')
    } catch (err) {
        log.error('Failed to clearLogAll:', err)
        return false
    }
}

export async function readLogList(): Promise<LogList> {
    return new Promise(async (resolve, reject) => {
        if (!isTauri) return reject()
        try {
            let s = await invoke('read_log_list') as string
            s = s.trim()
            if (s) {
                const data = JSON.parse(s) as LogList
                resolve(data)
            } else {
                reject()
            }
        } catch (err) {
            log.error('Failed to readLogList:', err)
            reject(err)
        }
    })
}

export async function readLogFile(filename: string, reverse: boolean = true, start: number = -1) {
    return new Promise(async (resolve, reject) => {
        if (!isTauri) return reject()
        try {
            const s = await invoke('read_log_file', {filename, reverse, start}) as string
            const data = JSON.parse(s) as LogContent
            resolve(data)
        } catch (err) {
            log.error('Failed to readLogFile:', err)
            reject(err)
        }
    })
}
