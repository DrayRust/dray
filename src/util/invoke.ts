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

export async function startSpeedTestServer(port: number, filename: string) {
    if (!isTauri) return
    try {
        return await invoke<boolean>('start_speed_test_server', {port, filename})
    } catch (err) {
        log.error('Failed to startSpeedTestServer:', err)
        return false
    }
}

export async function stopSpeedTestServer(port: number) {
    if (!isTauri) return false
    try {
        return await invoke<boolean>('stop_speed_test_server', {port})
    } catch (err) {
        log.error('Failed to stopSpeedTestServer:', err)
        return false
    }
}

export async function fetchGet(url: string, isProxy: boolean = false) {
    if (!isTauri) return ''
    try {
        return await invoke<string>('fetch_get', {url, isProxy}) as string
    } catch (err) {
        log.error('Failed to fetchGet:', err)
        return ''
    }
}

export async function fetchProxyGet(url: string, proxyUrl: string) {
    if (!isTauri) return
    try {
        return await invoke('fetch_get_with_proxy', {url, proxyUrl}) as any
    } catch (err) {
        log.error('Failed to fetchProxyGet:', err)
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

export async function readAppConfig(): Promise<AppConfig | undefined> {
    if (!isTauri) return
    try {
        return await invoke('get_config_json') as AppConfig
    } catch (err) {
        log.error('Failed to readConfig:', err)
    }
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

export async function readRayConfig(): Promise<any> {
    if (!isTauri) return
    try {
        return await invoke('read_ray_config') as any
    } catch (err) {
        log.error('Failed to readRayConfig:', err)
    }
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

export async function readLogList(): Promise<LogList | undefined> {
    if (!isTauri) return
    try {
        return await invoke('read_log_list') as LogList
    } catch (err) {
        log.error('Failed to readLogList:', err)
    }
}

export async function readLogFile(filename: string, reverse: boolean = true, start: number = -1): Promise<LogContent | undefined> {
    if (!isTauri) return
    try {
        return await invoke('read_log_file', {filename, reverse, start}) as LogContent
    } catch (err) {
        log.error('Failed to readLogFile:', err)
    }
}

async function readConf(filename: string) {
    if (!isTauri) return
    try {
        return await invoke('read_conf', {filename}) as any
    } catch (err) {
        log.error('Failed to readConf:', err)
    }
}

async function saveConf(filename: string, content: any) {
    if (!isTauri) return false
    try {
        return invoke<Boolean>('save_conf', {filename, 'content': JSON.stringify(content, null, 2)})
    } catch (err) {
        log.error('Failed to saveConf:', err)
        return false
    }
}

export async function saveSpeedTestConf(filename: string, content: any) {
    if (!isTauri) return false
    try {
        return invoke<Boolean>('save_speed_test_conf', {filename, 'content': JSON.stringify(content, null, 2)})
    } catch (err) {
        log.error('Failed to saveSpeedTestConf:', err)
        return false
    }
}

export async function readRayCommonConfig(): Promise<RayCommonConfig | undefined> {
    return readConf('ray_common_config.json')
}

export async function saveRayCommonConfig(content: RayCommonConfig) {
    return saveConf('ray_common_config.json', content)
}

export async function readServerList(): Promise<ServerList | undefined> {
    return readConf('server.json')
}

export async function saveServerList(content: ServerList) {
    return saveConf('server.json', content)
}

export async function readSubscriptionList(): Promise<SubscriptionList | undefined> {
    return readConf('subscription.json')
}

export async function saveSubscriptionList(content: SubscriptionList) {
    return saveConf('subscription.json', content)
}

export async function readRuleConfig(): Promise<RuleConfig | undefined> {
    return readConf('rule_config.json')
}

export async function saveRuleConfig(content: RuleConfig) {
    return saveConf('rule_config.json', content)
}

export async function readRuleDomain(): Promise<RuleDomain | undefined> {
    return readConf('rule_domain.json')
}

export async function saveRuleDomain(content: RuleDomain) {
    return saveConf('rule_domain.json', content)
}

export async function readRuleModeList(): Promise<RuleModeList | undefined> {
    return readConf('rule_mode_list.json')
}

export async function saveRuleModeList(content: RuleModeList) {
    return saveConf('rule_mode_list.json', content)
}

export async function readDnsConfig(): Promise<DnsConfig | undefined> {
    return readConf('dns_config.json')
}

export async function saveDnsConfig(content: DnsConfig) {
    return saveConf('dns_config.json', content)
}

export async function readDnsModeList(): Promise<DnsModeList | undefined> {
    return readConf('dns_mode_list.json')
}

export async function saveDnsModeList(content: DnsModeList) {
    return saveConf('dns_mode_list.json', content)
}

export async function readDnsTableList(): Promise<DnsTableList | undefined> {
    return readConf('dns_table_list.json')
}

export async function saveDnsTableList(content: DnsTableList) {
    return saveConf('dns_table_list.json', content)
}

async function getJson(apiName: string) {
    if (!isTauri) return
    try {
        return invoke(apiName) as any
    } catch (err) {
        log.error('Failed to getJson:', err)
    }
}

export async function getSysInfoJson() {
    return getJson('get_sys_info_json')
}

export async function getLoadAverageJson() {
    return getJson('get_load_average_json')
}

export async function getProcessesJson() {
    return getJson('get_processes_json')
}

export async function getDisksJson() {
    return getJson('get_disks_json')
}

export async function getNetworksJson() {
    return getJson('get_networks_json')
}

export async function getComponentsJson() {
    return getJson('get_components_json')
}
