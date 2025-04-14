export function generateProxyPAC(proxy: string, proxyDomains: string, directDomains: string, blockDomains: string) {
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
	// for (let v of domains) { if (v === host || host.endsWith('.' + v)) return true; } return false;
}

function FindProxyForURL(url, host) {
	if (isHostMatch(proxyDomains, host)) return proxy;
	if (isHostMatch(directDomains, host)) return "DIRECT";
	if (isHostMatch(blockDomains, host)) return "PROXY 0.0.0.0:80";
	return "DIRECT";
}
`
}
