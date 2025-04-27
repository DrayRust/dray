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

// window?.__TAURI__?.core // 全局变量，增加了安全性风险，性能影响，页面加载变慢
function sendLog(content: string) {
    safeInvoke('send_log', {content}).catch(_ => 0)
}

export async function safeInvoke(apiName: string, options: any = {}) {
    if (!isTauri) return
    try {
        return invoke(apiName, options) as any
    } catch (err) {
        log.error('Failed to invoke:', err)
        return
    }
}

export function jsonStringify(data: any): string {
    try {
        return JSON.stringify(data, null, 2)
    } catch (e) {
        log.error('JSON.stringify failed:', e)
        return '{}'
    }
}

export async function invokeBool(apiName: string, options: any = {}) {
    return Boolean(await safeInvoke(apiName, options))
}

export async function invokeString(apiName: string, options: any = {}) {
    return String(await safeInvoke(apiName, options))
}

export async function getDrayAppDir(): Promise<string> {
    return invokeString('get_dray_app_dir')
}

export async function fetchGet(url: string, isProxy: boolean = false) {
    return await invokeString('fetch_get', {url, isProxy})
}

export async function fetchProxyGet(url: string, proxyUrl: string) {
    return await invokeBool('fetch_get_with_proxy', {url, proxyUrl})
}

export function restartRay() {
    return invokeBool('restart_ray')
}

export async function checkPortAvailable(port: number) {
    return await invokeBool('check_port_available', {port})
}

export async function startSpeedTestServer(port: number, filename: string) {
    return await invokeBool('start_speed_test_server', {port, filename})
}

export async function stopSpeedTestServer(port: number) {
    return await invokeBool('stop_speed_test_server', {port})
}

export async function readAppConfig(): Promise<AppConfig | undefined> {
    return await safeInvoke('get_config_json')
}

export function setAppConfig(cmd: string, value: string | number | boolean) {
    (async () => {
        const ok = await invokeBool(cmd, {value})
        !ok && log.warn(`Failed to setConfig ${cmd}:`, value)
    })()
}

export async function readRayConfig(): Promise<any> {
    return await safeInvoke('read_ray_config')
}

export async function saveRayConfig(content: any) {
    return await invokeBool('save_ray_config', {content: jsonStringify(content)})
}

export async function saveProxyPac(content: string) {
    return await invokeBool('save_proxy_pac', {content})
}

export async function saveTextFile(path: string, content: string) {
    return await invokeBool('save_text_file', {path, content})
}

export async function openWebServerDir() {
    return await invokeBool('open_web_server_dir')
}

export async function clearLogAll() {
    return await invokeBool('clear_log_all')
}

export async function readLogList(): Promise<LogList | undefined> {
    return await safeInvoke('read_log_list')
}

export async function readLogFile(filename: string, reverse: boolean = true, start: number = -1): Promise<LogContent | undefined> {
    return await safeInvoke('read_log_file', {filename, reverse, start})
}

async function readConf(filename: string) {
    return await safeInvoke('read_conf', {filename})
}

async function saveConf(filename: string, content: any) {
    return await invokeBool('save_conf', {filename, content: jsonStringify(content)})
}

export async function saveSpeedTestConf(filename: string, content: any) {
    return await invokeBool('save_speed_test_conf', {filename, content: jsonStringify(content)})
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

export async function getSysInfoJson() {
    return safeInvoke('get_sys_info_json')
}

export async function getLoadAverageJson() {
    return safeInvoke('get_load_average_json')
}

export async function getProcessesJson(keyword: string) {
    return safeInvoke('get_processes_json', {keyword})
}

export async function getDisksJson() {
    return safeInvoke('get_disks_json')
}

export async function getNetworksJson() {
    return safeInvoke('get_networks_json')
}

export async function getComponentsJson() {
    return safeInvoke('get_components_json')
}

export async function killProcessByPid(pid: number) {
    return invokeBool('kill_process_by_pid', {pid})
}
