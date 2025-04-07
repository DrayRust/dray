import { log } from "./invoke.ts"

export function serverRowToConf(row: ServerRow): any {
    const {type, data} = row
    switch (type) {
        case 'vmess':
            return vmessRowToConf(data as VmessRow)
        case 'vless':
            return vlessRowToConf(data as VlessRow)
        case 'ss':
            return ssRowToConf(data as SsRow)
        case 'trojan':
            return trojanRowToConf(data as TrojanRow)
        default:
            log.error("Unknown server type:", type)
            return null
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
                serverName: row.path || '',
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
                            encryption: 'none',
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
                serverName: row.path || '',
                publicKey: row.pbk || '',
                fingerprint: row.fp || 'chrome'
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
                    address: row.add || '',
                    port: row.port || '',
                    method: row.scy || '',
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
                serverName: row.path || row.add,
            }
        }
    }
}
