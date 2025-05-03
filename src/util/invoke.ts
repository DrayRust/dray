import { invoke, isTauri } from '@tauri-apps/api/core'

export const IS_TAURI = isTauri()
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
    if (!IS_TAURI) return
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

export function restartRay() {
    return invokeBool('restart_ray')
}

export async function checkPortAvailable(port: number) {
    return invokeBool('check_port_available', {port})
}

export async function startSpeedTestServer(port: number, filename: string) {
    return invokeBool('start_speed_test_server', {port, filename})
}

export async function stopSpeedTestServer(port: number) {
    return invokeBool('stop_speed_test_server', {port})
}

export async function readAppConfig(): Promise<AppConfig | undefined> {
    return safeInvoke('get_config_json')
}

export function setAppConfig(cmd: string, value: string | number | boolean) {
    (async () => {
        const ok = await invokeBool(cmd, {value})
        !ok && log.warn(`Failed to setConfig ${cmd}:`, value)
    })()
}

export async function readRayConfig(): Promise<any> {
    return safeInvoke('read_ray_config')
}

export async function saveRayConfig(content: any) {
    return invokeBool('save_ray_config', {content: jsonStringify(content)})
}

export async function saveProxyPac(content: string) {
    return invokeBool('save_proxy_pac', {content})
}

export async function saveTextFile(path: string, content: string) {
    return invokeBool('save_text_file', {path, content})
}

export async function openWebServerDir() {
    return invokeBool('open_web_server_dir')
}

export async function clearLogAll() {
    return invokeBool('clear_log_all')
}

export async function readLogList(): Promise<LogList | undefined> {
    return safeInvoke('read_log_list')
}

export async function readLogFile(filename: string, reverse: boolean = true, start: number = -1): Promise<LogContent | undefined> {
    return safeInvoke('read_log_file', {filename, reverse, start})
}

async function readConf(filename: string) {
    return safeInvoke('read_conf', {filename})
}

async function saveConf(filename: string, content: any) {
    return invokeBool('save_conf', {filename, content: jsonStringify(content)})
}

export async function saveSpeedTestConf(filename: string, content: any) {
    return invokeBool('save_speed_test_conf', {filename, content: jsonStringify(content)})
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

export async function readSpeedTestConfig(): Promise<SpeedTestConfig | undefined> {
    return readConf('speed_test_config.json')
}

export async function saveSpeedTestConfig(content: SpeedTestConfig) {
    return saveConf('speed_test_config.json', content)
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

export async function downloadLargeFile(url: string, filepath: string, timeout: number = 60 * 30) {
    return safeInvoke('download_large_file', {url, filepath, timeout})
}

export async function pingTest(url: string, userAgent: string, count: number, timeout: number = 10) {
    return safeInvoke('ping_test', {url, userAgent, count, timeout})
}

export async function jitterTest(url: string, userAgent: string, count: number, timeout: number = 10) {
    return safeInvoke('jitter_test', {url, userAgent, count, timeout})
}

export async function downloadSpeedTest(url: string, proxyUrl: string, userAgent: string, timeout: number = 60 * 20) {
    return safeInvoke('download_speed_test', {url, proxyUrl, userAgent, timeout})
}

export async function uploadSpeedTest(url: string, userAgent: string, size: number, timeout: number = 60 * 20) {
    return safeInvoke('upload_speed_test', {url, userAgent, size, timeout})
}

export async function fetchResponseHeaders(url: string, proxyUrl: string, userAgent: string = navigator.userAgent, timeout: number = 10) {
    return safeInvoke('fetch_response_headers', {url, proxyUrl, userAgent, timeout})
}

export async function fetchTextContent(url: string, proxyUrl: string, userAgent: string = navigator.userAgent, timeout: number = 10) {
    return safeInvoke('fetch_text_content', {url, proxyUrl, userAgent, timeout})
}

/*
[
  {
    "name": "Chrome (Windows)",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
  },
  {
    "name": "Chrome (macOS)",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
  },
  {
    "name": "Firefox (Windows)",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0"
  },
  {
    "name": "Safari (macOS)",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15"
  },
  {
    "name": "Edge (Windows)",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0"
  },
  {
    "name": "Safari (iPhone)",
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1"
  },
  {
    "name": "Chrome (Android)",
    "userAgent": "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.60 Mobile Safari/537.36"
  },
  {
    "name": "WeChat (iOS)",
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.52(0x1800342b) NetType/WIFI Language/zh_CN"
  },
  {
    "name": "QQ Browser (Android)",
    "userAgent": "Mozilla/5.0 (Linux; U; Android 13; zh-cn; SM-G9730 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 MQQBrowser/11.8 Mobile"
  },
  {
    "name": "Baidu Spider",
    "userAgent": "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)"
  }
]
*/
export async function fetchGet(url: string, isProxy: boolean = false, userAgent: string = navigator.userAgent, timeout: number = 10) {
    return safeInvoke('fetch_get', {url, isProxy, userAgent, timeout})
}
