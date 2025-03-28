import { log } from './invoke.ts'
import { encodeBase64 } from './base64.ts'

export function uriToConf(uri: string): any {
    if (uri.startsWith('vless://')) {
        return vlessToConf(uri)
    } else if (uri.startsWith('vmess://')) {
        return vmessToConf(uri)
    } else if (uri.startsWith('ss://')) {
        return ssToConf(uri)
    } else if (uri.startsWith('trojan://')) {
        return trojanToConf(uri)
    } else {
        log.error("Unsupported protocol, url:", uri)
        return null
    }
}

function vlessToConf(uri: string): any {
    const url = new URL(uri)
    const p = new URLSearchParams(url.search)

    return {
        tag: "proxy",
        protocol: "vless",
        settings: {
            vnext: [
                {
                    address: url.hostname,
                    port: Number(url.port) || 0,
                    users: [
                        {
                            id: url.username,
                            encryption: p.get('encryption') || 'none',
                            flow: p.get('flow') || ''
                        }
                    ]
                }
            ]
        },
        streamSettings: {
            network: p.get('type') || 'tcp',
            security: p.get('security') || 'none',
            realitySettings: {
                serverName: p.get('sni') || '',
                publicKey: p.get('pbk') || '',
                fingerprint: p.get('fp') || 'chrome'
            }
        }
    }
}

function vmessToConf(uri: string): any {
    const url = new URL(uri)
    const p = new URLSearchParams(url.search)

    return {
        tag: "proxy",
        protocol: "vmess",
        settings: {
            vnext: [
                {
                    address: url.hostname,
                    port: Number(url.port) || 0,
                    users: [
                        {
                            id: url.username,
                            alterId: Number(p.get('aid')) || 0,
                            security: p.get('security') || 'auto'
                        }
                    ]
                }
            ]
        },
        streamSettings: {
            network: p.get('net') || 'tcp',
            security: p.get('tls') || 'none',
            tlsSettings: {
                serverName: p.get('sni') || '',
                allowInsecure: p.get('allowInsecure') === '1'
            },
            wsSettings: {
                path: p.get('path') || '',
                headers: {
                    Host: p.get('host') || ''
                }
            }
        }
    }
}

function ssToConf(ssUrl: string): any {
    const url = new URL(ssUrl)
    const [method, password] = encodeBase64(url.username).split(':')

    return {
        tag: "proxy",
        protocol: "shadowsocks",
        settings: {
            servers: [
                {
                    address: url.hostname,
                    port: Number(url.port) || 0,
                    method: method || 'aes-256-gcm',
                    password: password || '',
                    level: 0
                }
            ]
        },
        streamSettings: {
            network: "tcp",
            security: "none"
        }
    }
}

function trojanToConf(trojanUrl: string): any {
    const url = new URL(trojanUrl)
    const p = new URLSearchParams(url.search)

    return {
        tag: "proxy",
        protocol: "trojan",
        settings: {
            servers: [
                {
                    address: url.hostname,
                    port: Number(url.port) || 0,
                    password: url.username || '',
                    level: 0
                }
            ]
        },
        streamSettings: {
            network: "tcp",
            security: "tls",
            tlsSettings: {
                serverName: p.get('sni') || url.hostname,
                allowInsecure: p.get('allowInsecure') === '1'
            }
        }
    }
}
