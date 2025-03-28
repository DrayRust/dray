import { log } from './invoke.ts'
import { encodeBase64 } from './base64.ts'

export function uriToServerRow(uri: string): ServerRow | null {
    if (!isValidUri(uri)) {
        log.error("Invalid URI:", uri)
        return null
    }

    if (uri.startsWith('vless://')) {
        return uriToVlessRow(uri)
    } else if (uri.startsWith('vmess://')) {
        return uriToVmessRow(uri)
    } else if (uri.startsWith('ss://')) {
        return uriToSsRow(uri)
    } else if (uri.startsWith('trojan://')) {
        return uriToTrojanRow(uri)
    } else {
        log.error("Unsupported protocol, url:", uri)
        return null
    }
}

function uriToVlessRow(uri: string): ServerRow {
    const url = new URL(uri)
    const p = new URLSearchParams(url.search)

    return {
        ps: '',
        type: 'vless',
        host: `${url.hostname}:${url.port || 0}`,
        scy: p.get('security') || 'none',
        data: {
            add: url.hostname,
            port: Number(url.port),
            id: url.username,
            flow: p.get('flow') || '',
            scy: p.get('security') || 'none',
            encryption: p.get('encryption') || 'none',
            type: p.get('type') || 'tcp',
            host: p.get('host') || '',
            path: p.get('path') || '',
            net: p.get('type') || 'tcp',
            fp: p.get('fp') || 'chrome',
            pbk: p.get('pbk') || '',
            sid: p.get('sid') || '',
            sni: p.get('sni') || '',
            serviceName: p.get('serviceName') || '',
            headerType: p.get('headerType') || '',
            seed: p.get('seed') || '',
            mode: p.get('mode') || ''
        }
    }
}

function uriToVmessRow(uri: string): ServerRow {
    const url = new URL(uri)
    const p = new URLSearchParams(url.search)

    return {
        ps: '',
        type: 'vmess',
        host: `${url.hostname}:${url.port || 0}`,
        scy: p.get('security') || 'auto',
        data: {
            add: url.hostname,
            port: Number(url.port),
            id: url.username,
            aid: Number(p.get('aid')) || 0,
            scy: p.get('security') || 'auto',
            alpn: p.get('alpn') || '',
            sni: p.get('sni') || '',
            net: p.get('net') || 'tcp',
            host: p.get('host') || '',
            path: p.get('path') || '',
            tls: p.get('tls') || 'none',
            fp: p.get('fp') || 'chrome',
            type: p.get('type') || '',
            seed: p.get('seed') || '',
            mode: p.get('mode') || ''
        }
    }
}

function uriToSsRow(uri: string): ServerRow {
    const url = new URL(uri)
    const [method, password] = encodeBase64(url.username).split(':')

    return {
        ps: '',
        type: 'ss',
        host: `${url.hostname}:${url.port || 0}`,
        scy: method || 'aes-256-gcm',
        data: {
            add: url.hostname,
            port: Number(url.port),
            scy: method || 'aes-256-gcm',
            pwd: password || ''
        }
    }
}

function uriToTrojanRow(uri: string): ServerRow {
    const url = new URL(uri)
    const p = new URLSearchParams(url.search)

    return {
        ps: '',
        type: 'trojan',
        host: `${url.hostname}:${url.port || 0}`,
        scy: p.get('security') || 'tls',
        data: {
            add: url.hostname,
            port: Number(url.port),
            pwd: url.username,
            flow: p.get('flow') || '',
            scy: p.get('security') || 'tls',
            sni: p.get('sni') || url.hostname,
            fp: p.get('fp') || 'chrome'
        }
    }
}

export function isValidUri(uri: string): boolean {
    try {
        new URL(uri)
        return true
    } catch (e) {
        return false
    }
}

export function vlessRowToConf(row: VlessRow): any {
    return {
        tag: "proxy",
        protocol: "vless",
        settings: {
            vnext: [
                {
                    address: row.add,
                    port: row.port,
                    users: [
                        {
                            id: row.id,
                            encryption: row.encryption || 'none',
                            flow: row.flow || ''
                        }
                    ]
                }
            ]
        },
        streamSettings: {
            network: row.net || 'tcp',
            security: row.scy || 'none',
            realitySettings: {
                serverName: row.sni || '',
                publicKey: row.pbk || '',
                fingerprint: row.fp || 'chrome'
            }
        }
    }
}

export function vmessRowToConf(row: VmessRow): any {
    return {
        tag: "proxy",
        protocol: "vmess",
        settings: {
            vnext: [
                {
                    address: row.add,
                    port: row.port,
                    users: [
                        {
                            id: row.id,
                            alterId: row.aid || 0,
                            security: row.scy || 'auto'
                        }
                    ]
                }
            ]
        },
        streamSettings: {
            network: row.net || 'tcp',
            security: row.tls || 'none',
            tlsSettings: {
                serverName: row.sni || '',
            },
            wsSettings: {
                path: row.path || '',
                headers: {
                    Host: row.host || ''
                }
            }
        }
    }
}

export function ssRowToConf(row: SsRow): any {
    return {
        tag: "proxy",
        protocol: "shadowsocks",
        settings: {
            servers: [
                {
                    address: row.add,
                    port: row.port,
                    method: row.scy || 'aes-256-gcm',
                    password: row.pwd || '',
                }
            ]
        }
    }
}

export function trojanRowToConf(row: TrojanRow): any {
    return {
        tag: "proxy",
        protocol: "trojan",
        settings: {
            servers: [
                {
                    address: row.add,
                    port: row.port,
                    password: row.pwd || '',
                }
            ]
        },
        streamSettings: {
            network: "tcp",
            security: "tls",
            tlsSettings: {
                serverName: row.sni || row.add,
            }
        }
    }
}
