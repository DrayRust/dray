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
    let settings = {}
    if (row.scy && row.scy !== 'none') {
        settings = {...settings, tlsSettings: getTlsSettings(row)}
    }

    if (row.scy === 'reality') {
        settings = {...settings, realitySettings: getRealitySettings(row)}
    }

    if (row.net === 'ws') {
        settings = {...settings, wsSettings: getWsSettings(row)}
    } else if (row.net === 'grpc') {
        settings = {...settings, grpcSettings: getGrpcSettings(row)}
    } else if (row.net === 'xhttp') {
        settings = {...settings, xhttpSettings: getXhttpSettings(row)}
    }

    // PS: 这个配置设计真的乱，单独设计一个 xtlsSettings 不含义更明确？
    let flowSettings = {}
    if (row.flow) {
        flowSettings = {flow: row.flow}
    }

    // https://xtls.github.io/config/inbounds/vless.html#clientobject
    // https://www.v2fly.org/config/protocols/vless.html#outboundconfigurationobject
    return {
        tag: "proxy",
        protocol: "vless",
        settings: {
            vnext: [
                {
                    address: row.add || '',
                    port: row.port || '',
                    users: [
                        {
                            id: row.id || '',
                            encryption: "none",
                            ...flowSettings
                        }
                    ]
                }
            ]
        },
        streamSettings: {
            network: row.net || '',
            security: row.scy || 'none',
            ...settings
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
    let settings = {}
    if (row.net === 'ws') {
        settings = {wsSettings: getWsSettings(row)}
    } else if (row.net === 'grpc') {
        settings = {grpcSettings: getGrpcSettings(row)}
    }

    return {
        tag: "proxy",
        protocol: "trojan",
        settings: {
            servers: [
                {
                    address: row.add || '',
                    port: row.port || '',
                    password: row.pwd || ''
                }
            ]
        },
        streamSettings: {
            network: row.net || '',
            security: "tls",
            ...settings
        }
    }
}

// https://xtls.github.io/config/transports/websocket.html
function getWsSettings(row: { add: string, host: string, path: string }) {
    return {
        host: row.add || '',
        path: row.path || '',
        headers: {
            Host: row.host || row.add || ''
        }
    }
}

// PS: 设计的真乱，驼峰命名法 混着 蛇形命名法
// https://xtls.github.io/config/transports/grpc.html
// https://www.v2fly.org/config/transport/grpc.html
function getGrpcSettings(row: { host: string, path: string }) {
    return {
        authority: row.host || '',
        serviceName: row.path || '',
        idle_timeout: 60,
        permit_without_stream: false,
        initial_windows_size: 0
    }
}

// https://xtls.github.io/config/transports/xhttp.html
// https://github.com/XTLS/Xray-core/discussions/4113
function getXhttpSettings(row: { host: string, path: string }) {
    return {
        host: row.host || '',
        path: row.path || ''
    }
}

// https://xtls.github.io/config/transport.html#tlsobject
function getTlsSettings(row: { host: string, alpn: string, fp: string }) {
    return {
        allowInsecure: false,
        serverName: row.host || '',
        alpn: row.alpn ? parseAlpn(row.alpn) : ["h2", "http/1.1"],
        fingerprint: row.fp || '',
    }
}

function parseAlpn(alpn: string): string[] {
    return alpn.split(',').map(item => item.trim())
}

// https://xtls.github.io/config/transport.html#realityobject
// https://github.com/XTLS/REALITY
function getRealitySettings(row: VlessRow) {
    return {
        show: false,
        serverName: row.path || '',
        fingerprint: row.fp || '',
        publicKey: row.pbk || '',
        shortId: row.sid || '',
        spiderX: row.spx || ''
    }
}
