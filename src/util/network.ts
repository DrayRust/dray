import { fetchGet } from "./invoke.ts"
import { safeJsonParse } from "./crypto.ts"

export const sumNetworks = (networks: any[]) => {
    let up = 0
    let down = 0
    let loUp = 0
    let loDown = 0
    for (const net of networks) {
        if (net.type === 'Loopback') {
            // 回环地址不计入网络流量统计
            loUp += net.up || 0
            loDown += net.down || 0
        } else {
            up += net.up || 0
            down += net.down || 0
        }
    }
    return {up, down, loUp, loDown}
}

/**
 * 计算每秒的上传和下载速率
 * @param prev 上一次的上传和下载总量
 * @param current 当前的上传和下载总量
 * @param interval 时间间隔（秒），默认值为 1
 * @returns 每秒的上传和下载速率（单位：字节/秒）
 */
export const calculateNetworkSpeed = (
    prev: { up: number; down: number },
    current: { up: number; down: number },
    interval: number = 1
): { upSpeed: number; downSpeed: number } => {
    const upSpeed = (current.up - prev.up) / interval
    const downSpeed = (current.down - prev.down) / interval
    return {upSpeed: Math.max(upSpeed, 0), downSpeed: Math.max(downSpeed, 0)}
}

export async function getStatsData(port: number) {
    const r = await fetchGet(`http://127.0.0.1:${port}/debug/vars`)
    if (!r || !r.ok) return false
    const obj = safeJsonParse(r.text)
    if (obj.stats) return formatStats(obj.stats)
    return false
}

const formatStats = (input: any): { inbound: any, outbound: any } => {
    const safeGet = (obj: any, path: string) => {
        return path.split('.').reduce((acc, part) => {
            return acc && acc[part] !== undefined ? acc[part] : 0
        }, obj)
    }

    return {
        inbound: {
            totalUp: safeGet(input, 'inbound.http-in.uplink') + safeGet(input, 'inbound.socks-in.uplink'),
            totalDown: safeGet(input, 'inbound.http-in.downlink') + safeGet(input, 'inbound.socks-in.downlink'),
            httpUp: safeGet(input, 'inbound.http-in.uplink'),
            httpDown: safeGet(input, 'inbound.http-in.downlink'),
            socksUp: safeGet(input, 'inbound.socks-in.uplink'),
            socksDown: safeGet(input, 'inbound.socks-in.downlink'),
        },
        outbound: {
            totalUp: safeGet(input, 'outbound.proxy.uplink') + safeGet(input, 'outbound.direct.uplink'),
            totalDown: safeGet(input, 'outbound.proxy.downlink') + safeGet(input, 'outbound.direct.downlink'),
            proxyUp: safeGet(input, 'outbound.proxy.uplink'),
            proxyDown: safeGet(input, 'outbound.proxy.downlink'),
            directUp: safeGet(input, 'outbound.direct.uplink'),
            directDown: safeGet(input, 'outbound.direct.downlink'),
        }
    }
}
