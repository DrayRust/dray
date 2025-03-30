import { log } from './invoke.ts'
import { decodeBase64, encodeBase64 } from './base64.ts'
import { hashString } from "./util.ts"

export function isValidUri(uri: string): boolean {
    try {
        new URL(uri)
        return true
    } catch (e) {
        return false
    }
}

export async function uriToServerRow(uri: string): Promise<ServerRow | null> {
    if (!isValidUri(uri)) {
        log.error("Invalid URI:", uri)
        return null
    }
    try {
        if (uri.startsWith('vless://')) {
            return uriToVlessRow(uri)
        } else if (uri.startsWith('vmess://')) {
            return uriToVmessRow(uri)
        } else if (uri.startsWith('ss://')) {
            return uriToSsRow(uri)
        } else if (uri.startsWith('trojan://')) {
            return uriToTrojanRow(uri)
        } else {
            log.error("Unsupported protocol, URI:", uri)
            return null
        }
    } catch (e) {
        log.error("Failed to parse URI:", uri, e)
        return null
    }
}

async function uriToVlessRow(uri: string): Promise<ServerRow> {
    const url = new URL(uri)
    let ps = ''
    let data: VlessRow
    if (url.search) {
        if (url.hash) ps = url.hash.slice(1).trim()
        const p = new URLSearchParams(url.search)
        data = {
            add: url.hostname,
            port: Number(url.port) || 0,
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
    } else {
        const base64 = uri.replace('vless://', '')
        const decoded = decodeBase64(base64)
        const d = JSON.parse(decoded)
        ps = d.ps || ''
        data = {
            add: d.add,
            port: Number(d.port) || 0,
            id: d.id,
            flow: d.flow || '',
            scy: d.scy || 'none',
            encryption: d.encryption || 'none',
            type: d.type || 'tcp',
            host: d.host || '',
            path: d.path || '',
            net: d.net || 'tcp',
            fp: d.fp || 'chrome',
            pbk: d.pbk || '',
            sid: d.sid || '',
            sni: d.sni || '',
            serviceName: d.serviceName || '',
            headerType: d.headerType || '',
            seed: d.seed || '',
            mode: d.mode || ''
        }
    }

    return {
        ps: ps,
        type: 'vless',
        host: `${data.add}:${url.port}`,
        scy: data.scy,
        hash: await hashString(JSON.stringify(data)),
        data
    }
}

async function uriToVmessRow(uri: string): Promise<ServerRow> {
    const url = new URL(uri)
    let ps = ''
    let data: VmessRow

    if (url.search) {
        if (url.hash) ps = url.hash.slice(1).trim()
        const p = new URLSearchParams(url.search)
        data = {
            add: url.hostname,
            port: Number(url.port) || 0,
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
    } else {
        const base64 = uri.replace('vmess://', '')
        const decoded = decodeBase64(base64)
        const d = JSON.parse(decoded)
        ps = d.ps || ''
        data = {
            add: d.add,
            port: Number(d.port) || 0,
            id: d.id,
            aid: d.aid || 0,
            scy: d.scy || 'auto',
            alpn: d.alpn || '',
            sni: d.sni || '',
            net: d.net || 'tcp',
            host: d.host || '',
            path: d.path || '',
            tls: d.tls || 'none',
            fp: d.fp || 'chrome',
            type: d.type || '',
            seed: d.seed || '',
            mode: d.mode || ''
        }
    }

    return {
        ps,
        type: 'vmess',
        host: `${data.add}:${url.port}`,
        scy: data.scy,
        hash: await hashString(JSON.stringify(data)),
        data
    }
}

async function uriToSsRow(uri: string): Promise<ServerRow> {
    const url = new URL(uri)
    let ps = ''
    let data: SsRow

    if (url.search) {
        if (url.hash) ps = url.hash.slice(1).trim()
        const [method, password] = decodeBase64(url.username).split(':')
        data = {
            add: url.hostname,
            port: Number(url.port) || 0,
            scy: method || 'aes-256-gcm',
            pwd: password || ''
        }
    } else {
        const base64 = uri.replace('ss://', '')
        const decoded = decodeBase64(base64)
        const d = JSON.parse(decoded)
        ps = d.ps || ''
        data = {
            add: d.add,
            port: Number(d.port) || 0,
            scy: d.scy || 'aes-256-gcm',
            pwd: d.pwd || ''
        }
    }

    return {
        ps,
        type: 'ss',
        host: `${data.add}:${url.port}`,
        scy: data.scy,
        hash: await hashString(JSON.stringify(data)),
        data
    }
}

async function uriToTrojanRow(uri: string): Promise<ServerRow> {
    const url = new URL(uri)
    let ps = ''
    let data: TrojanRow

    if (url.search) {
        if (url.hash) ps = url.hash.slice(1).trim()
        const p = new URLSearchParams(url.search)
        data = {
            add: url.hostname,
            port: Number(url.port) || 0,
            pwd: url.username,
            flow: p.get('flow') || '',
            scy: p.get('security') || 'tls',
            sni: p.get('sni') || url.hostname,
            fp: p.get('fp') || 'chrome'
        }
    } else {
        const base64 = uri.replace('trojan://', '')
        const decoded = decodeBase64(base64)
        const d = JSON.parse(decoded)
        ps = d.ps || ''
        data = {
            add: d.add,
            port: Number(d.port) || 0,
            pwd: d.pwd || '',
            flow: d.flow || '',
            scy: d.scy || 'tls',
            sni: d.sni || url.hostname,
            fp: d.fp || 'chrome'
        }
    }

    return {
        ps,
        type: 'trojan',
        host: `${data.add}:${url.port}`,
        scy: data.scy,
        hash: await hashString(JSON.stringify(data)),
        data
    }
}

export function serverRowToUri(row: ServerRow): string {
    const {type, data, ps} = row
    try {
        switch (type) {
            case 'vless':
                return vlessRowToUri(data as VlessRow, ps)
            case 'vmess':
                return vmessRowToUri(data as VmessRow, ps)
            case 'ss':
                return ssRowToUri(data as SsRow, ps)
            case 'trojan':
                return trojanRowToUri(data as TrojanRow, ps)
            default:
                log.error("Unknown server type:", type)
                return ''
        }
    } catch (e) {
        log.error("Error converting server row to URI:", e)
        return ''
    }
}

function vlessRowToUri(row: VlessRow, ps: string): string {
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

function vmessRowToUri(row: VmessRow, ps: string): string {
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

function ssRowToUri(row: SsRow, ps: string): string {
    const url = new URL('ss://')
    url.hostname = row.add
    url.port = row.port.toString()
    url.username = `${row.scy}:${row.pwd}`
    url.hash = ps ? `#${ps}` : ''
    return url.toString()
}

function trojanRowToUri(row: TrojanRow, ps: string): string {
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

export function serverRowToBase64Uri(row: ServerRow): string {
    const {type, data, ps} = row
    try {
        switch (type) {
            case 'vless':
                return vlessRowToBase64Uri(data as VlessRow, ps)
            case 'vmess':
                return vmessRowToBase64Uri(data as VmessRow, ps)
            case 'ss':
                return ssRowToBase64Uri(data as SsRow, ps)
            case 'trojan':
                return trojanRowToBase64Uri(data as TrojanRow, ps)
            default:
                log.error("Unknown server type:", type)
                return ''
        }
    } catch (e) {
        log.error("Error converting server row to Base64 URI:", e)
        return ''
    }
}

function vlessRowToBase64Uri(row: VlessRow, ps: string): string {
    const data = {ps, ...row}
    return `vless://${encodeBase64(JSON.stringify(data))}`
}

function vmessRowToBase64Uri(row: VmessRow, ps: string): string {
    const data = {ps, v: 2, ...row}
    return `vmess://${encodeBase64(JSON.stringify(data))}`
}

function ssRowToBase64Uri(row: SsRow, ps: string): string {
    const data = {ps, ...row}
    return `ss://${encodeBase64(JSON.stringify(data))}`
}

function trojanRowToBase64Uri(row: TrojanRow, ps: string): string {
    const data = {ps, ...row}
    return `trojan://${encodeBase64(JSON.stringify(data))}`
}

export function serverRowToConf(row: ServerRow): any {
    const {type, data} = row
    try {
        switch (type) {
            case 'vless':
                return vlessRowToConf(data as VlessRow)
            case 'vmess':
                return vmessRowToConf(data as VmessRow)
            case 'ss':
                return ssRowToConf(data as SsRow)
            case 'trojan':
                return trojanRowToConf(data as TrojanRow)
            default:
                log.error("Unknown server type:", type)
                return null
        }
    } catch (e) {
        log.error("Error converting server row to config:", e)
        return null
    }
}

function vlessRowToConf(row: VlessRow): any {
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

function vmessRowToConf(row: VmessRow): any {
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

function ssRowToConf(row: SsRow): any {
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

function trojanRowToConf(row: TrojanRow): any {
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
