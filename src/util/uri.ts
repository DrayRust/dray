import { log } from './invoke.ts'
import { decodeBase64, encodeBase64 } from './base64.ts'

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
    const ps = url.hash ? url.hash.slice(1) : ''

    return {
        ps,
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
    const ps = url.hash ? url.hash.slice(1) : ''

    return {
        ps,
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
    const [method, password] = decodeBase64(url.username).split(':')
    const ps = url.hash ? url.hash.slice(1) : ''

    return {
        ps,
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
    const ps = url.hash ? url.hash.slice(1) : ''

    return {
        ps,
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

export function vlessRowToUri(row: VlessRow, ps: string): string {
    const url = new URL('vless://')
    url.hostname = row.add
    url.port = row.port.toString()
    url.username = row.id
    url.hash = ps ? `#${ps}` : ''

    const p = new URLSearchParams()
    if (row.flow) p.set('flow', row.flow)
    if (row.encryption) p.set('encryption', row.encryption)
    if (row.type) p.set('type', row.type)
    if (row.host) p.set('host', row.host)
    if (row.path) p.set('path', row.path)
    if (row.fp) p.set('fp', row.fp)
    if (row.pbk) p.set('pbk', row.pbk)
    if (row.sid) p.set('sid', row.sid)
    if (row.sni) p.set('sni', row.sni)
    if (row.serviceName) p.set('serviceName', row.serviceName)
    if (row.headerType) p.set('headerType', row.headerType)
    if (row.seed) p.set('seed', row.seed)
    if (row.mode) p.set('mode', row.mode)

    url.search = p.toString()
    return url.toString()
}

export function vmessRowToUri(row: VmessRow, ps: string): string {
    const url = new URL('vmess://')
    url.hostname = row.add
    url.port = row.port.toString()
    url.username = row.id
    url.hash = ps ? `#${ps}` : ''

    const p = new URLSearchParams()
    if (row.aid) p.set('aid', row.aid.toString())
    if (row.alpn) p.set('alpn', row.alpn)
    if (row.sni) p.set('sni', row.sni)
    if (row.net) p.set('net', row.net)
    if (row.host) p.set('host', row.host)
    if (row.path) p.set('path', row.path)
    if (row.tls) p.set('tls', row.tls)
    if (row.fp) p.set('fp', row.fp)
    if (row.type) p.set('type', row.type)
    if (row.seed) p.set('seed', row.seed)
    if (row.mode) p.set('mode', row.mode)

    url.search = p.toString()
    return url.toString()
}

export function ssRowToUri(row: SsRow, ps: string): string {
    const url = new URL('ss://')
    url.hostname = row.add
    url.port = row.port.toString()
    url.username = `${row.scy}:${row.pwd}`
    url.hash = ps ? `#${ps}` : ''
    return url.toString()
}

export function trojanRowToUri(row: TrojanRow, ps: string): string {
    const url = new URL('trojan://')
    url.hostname = row.add
    url.port = row.port.toString()
    url.username = row.pwd
    url.hash = ps ? `#${ps}` : ''

    const p = new URLSearchParams()
    if (row.flow) p.set('flow', row.flow)
    if (row.sni) p.set('sni', row.sni)
    if (row.fp) p.set('fp', row.fp)

    url.search = p.toString()
    return url.toString()
}

export function vlessRowToBase64Uri(row: VlessRow, ps: string): string {
    const data = {ps, ...row}
    return `vless://${encodeBase64(JSON.stringify(data))}`
}

export function vmessRowToBase64Uri(row: VmessRow, ps: string): string {
    const data = {ps, v: 2, ...row}
    return `vmess://${encodeBase64(JSON.stringify(data))}`
}

export function ssRowToBase64Uri(row: SsRow, ps: string): string {
    const data = {ps, ...row}
    return `ss://${encodeBase64(JSON.stringify(data))}`
}

export function trojanRowToBase64Uri(row: TrojanRow, ps: string): string {
    const data = {ps, ...row}
    return `trojan://${encodeBase64(JSON.stringify(data))}`
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
