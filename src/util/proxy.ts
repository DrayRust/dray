import { readAppConfig, saveProxyPac } from "./invoke.ts"
import { processLines } from "./util.ts"

// 更新 proxy.js 文件
export async function updateProxyPAC(ruleConfig: RuleConfig, ruleDomain: RuleDomain) {
    const config = await readAppConfig() as AppConfig
    if (config) {
        const proxy = config.ray_host + ":" + config.ray_socks_port
        const proxyDomains = ruleDomain.proxy ? JSON.stringify(processLines(ruleDomain.proxy.toLowerCase()), null, '\t') : '[]'
        const directDomains = ruleDomain.direct ? JSON.stringify(processLines(ruleDomain.direct.toLowerCase()), null, '\t') : '[]'
        const blockDomains = ruleDomain.block ? JSON.stringify(processLines(ruleDomain.block.toLowerCase()), null, '\t') : '[]'
        const s = generateProxyPAC(proxy, proxyDomains, directDomains, blockDomains, ruleConfig.unmatchedStrategy === 'direct')
        await saveProxyPac(s)
    }
}

function generateProxyPAC(proxy: string, proxyDomains: string, directDomains: string, blockDomains: string, isUnmatchedDirect: boolean = true) {
    return `
var proxy = 'SOCKS5 ${proxy}';

var proxyDomains = ${proxyDomains};

var directDomains = ${directDomains};

var blockDomains = ${blockDomains};

if (!String.prototype.endsWith) {
	String.prototype.endsWith = function(s) {
		return this.length >= s.length && this.lastIndexOf(s) === this.length - s.length;
	};
}

function isHostMatch(domains, host) {
	return domains.some(v => v === host || host.endsWith('.' + v));
}

function FindProxyForURL(url, host) {
	if (isHostMatch(proxyDomains, host)) return proxy;
	if (isHostMatch(directDomains, host)) return "DIRECT";
	if (isHostMatch(blockDomains, host)) return "PROXY 0.0.0.0:80";
	return ${isUnmatchedDirect ? '"DIRECT"' : 'proxy'};
}
`
}
