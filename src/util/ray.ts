import { readRayConfig, restartRay, saveRayCommonConfig, saveRayConfig } from "./invoke.ts"
import { getStatsConf } from "./serverConf.ts"
import { ruleToConf } from "./rule.ts"
import { dnsModeToConf } from "./dns.ts"

export function getSocksConf(config: AppConfig, rayCommonConfig: RayCommonConfig) {
    return {
        tag: "socks-in",
        protocol: "socks",
        listen: config.ray_host,
        port: config.ray_socks_port,
        settings: {
            udp: rayCommonConfig.socks_udp,
        },
        sniffing: {
            enabled: rayCommonConfig.socks_sniffing,
            destOverride: rayCommonConfig.socks_sniffing_dest_override,
            // metadataOnly: false
        }
    }
}

export function getHttpConf(config: AppConfig) {
    return {
        tag: "http-in",
        protocol: "http",
        listen: config.ray_host,
        port: config.ray_http_port
    }
}

async function saveAndRestart(conf: any) {
    const ok = await saveRayConfig(conf)
    if (ok) {
        await restartRay()
    }
}

export async function rayRuleChange(ruleConfig: RuleConfig, ruleDomain: RuleDomain, ruleModeList: RuleModeList) {
    const rayConfig = await readRayConfig()
    if (rayConfig) {
        // 生成配置文件
        const routing = ruleToConf(ruleConfig, ruleDomain, ruleModeList)
        const conf = {...rayConfig, ...routing}
        await saveAndRestart(conf)
    }
}

export async function rayDnsChange(dnsConfig: DnsConfig, dnsModeList: DnsModeList) {
    const rayConfig = await readRayConfig()
    if (rayConfig) {
        let conf = {...rayConfig}
        if (dnsConfig.enable) {
            const row = dnsModeList[dnsConfig.mode]
            if (row) conf.dns = dnsModeToConf(row)
        } else {
            delete conf.dns
        }
        await saveAndRestart(conf)
    }
}

export function rayLogLevelChange(value: string, rayCommonConfig: RayCommonConfig) {
    (async () => {
        await saveRayCommonConfig(rayCommonConfig) // 保存 Ray Common 配置

        let c = await readRayConfig()
        if (c.log) {
            c.log.loglevel = value
            await saveAndRestart(c)
        }
    })()
}

export function rayStatsEnabledChange(value: boolean, rayCommonConfig: RayCommonConfig) {
    (async () => {
        await saveRayCommonConfig(rayCommonConfig) // 保存 Ray Common 配置

        let c = await readRayConfig()
        if (!c) return

        if (!value) {
            delete c.stats
            delete c.metrics
            delete c.policy
            // delete c?.policy?.system
        } else {
            c = {...c, ...getStatsConf()}
        }
        await saveAndRestart(c)
    })()
}

export function rayHostChange(host: string) {
    (async () => {
        let c = await readRayConfig()
        if (!c || !c.inbounds || !Array.isArray(c.inbounds)) return

        for (let i = 0; i < c.inbounds.length; i++) {
            if (c.inbounds[i].listen) {
                c.inbounds[i].listen = host // 修改监听地址
            }
        }
        await saveAndRestart(c)
    })()
}

export function raySocksPortChange(port: number) {
    (async () => {
        let c = await readRayConfig()
        if (!c || !c.inbounds || !Array.isArray(c.inbounds)) return

        for (let i = 0; i < c.inbounds.length; i++) {
            if (c.inbounds[i].protocol === "socks") {
                c.inbounds[i].port = port // 修改端口
            }
        }
        await saveAndRestart(c)
    })()
}

export function rayHttpPortChange(port: number) {
    (async () => {
        let c = await readRayConfig()
        if (!c || !c.inbounds || !Array.isArray(c.inbounds)) return

        for (let i = 0; i < c.inbounds.length; i++) {
            if (c.inbounds[i].protocol === "http") {
                c.inbounds[i].port = port // 修改端口
            }
        }
        await saveAndRestart(c)
    })()
}

export function raySocksEnabledChange(value: boolean, config: AppConfig, rayCommonConfig: RayCommonConfig) {
    (async () => {
        await saveRayCommonConfig(rayCommonConfig) // 保存 Ray Common 配置

        let c = await readRayConfig()
        if (!c || !c.inbounds || !Array.isArray(c.inbounds)) return

        if (value) {
            c.inbounds.push(getSocksConf(config, rayCommonConfig))
        } else {
            c.inbounds = c.inbounds.filter((item: any) => item.protocol !== "socks")
        }
        await saveAndRestart(c)
    })()
}

export function rayHttpEnabledChange(value: boolean, config: AppConfig, rayCommonConfig: RayCommonConfig) {
    (async () => {
        await saveRayCommonConfig(rayCommonConfig) // 保存 Ray Common 配置

        let c = await readRayConfig()
        if (!c || !c.inbounds || !Array.isArray(c.inbounds)) return

        if (value) {
            c.inbounds.push(getHttpConf(config))
        } else {
            c.inbounds = c.inbounds.filter((item: any) => item.protocol !== "http")
        }
        await saveAndRestart(c)
    })()
}

export function raySocksUdpChange(value: boolean, rayCommonConfig: RayCommonConfig) {
    (async () => {
        await saveRayCommonConfig(rayCommonConfig) // 保存 Ray Common 配置

        let c = await readRayConfig()
        if (!c || !c.inbounds || !Array.isArray(c.inbounds)) return

        for (let i = 0; i < c.inbounds.length; i++) {
            if (c.inbounds[i].protocol === "socks") {
                if (c.inbounds[i].settings && typeof c.inbounds[i].settings === 'object') {
                    c.inbounds[i].settings.udp = value // 修改是否启用 UDP 协议转发
                } else {
                    c.inbounds[i].settings = {udp: value} // 初始化 settings 对象
                }
                // break
            }
        }
        await saveAndRestart(c)
    })()
}

export function raySocksSniffingChange(value: boolean, rayCommonConfig: RayCommonConfig) {
    (async () => {
        await saveRayCommonConfig(rayCommonConfig) // 保存 Ray Common 配置

        let c = await readRayConfig()
        if (!c || !c.inbounds || !Array.isArray(c.inbounds)) return

        for (let i = 0; i < c.inbounds.length; i++) {
            const inbounds = c.inbounds[i]
            if (inbounds.protocol === "socks") {
                if (typeof inbounds.sniffing !== 'object') inbounds.sniffing = {}
                inbounds.sniffing.enabled = value
                inbounds.sniffing.destOverride = rayCommonConfig.socks_sniffing_dest_override
                // break
            }
        }
        await saveAndRestart(c)
    })()
}

export function raySocksDestOverrideChange(value: string[], rayCommonConfig: RayCommonConfig) {
    (async () => {
        await saveRayCommonConfig(rayCommonConfig) // 保存 Ray Common 配置

        let c = await readRayConfig()
        if (!c || !c.inbounds || !Array.isArray(c.inbounds)) return

        for (let i = 0; i < c.inbounds.length; i++) {
            const inbounds = c.inbounds[i]
            if (inbounds.protocol === "socks") {
                if (typeof inbounds.sniffing !== 'object') inbounds.sniffing = {enabled: rayCommonConfig.socks_sniffing}
                inbounds.sniffing.destOverride = value
                // break
            }
        }
        await saveAndRestart(c)
    })()
}

export function rayOutboundsMuxChange(value: boolean, rayCommonConfig: RayCommonConfig) {
    (async () => {
        await saveRayCommonConfig(rayCommonConfig) // 保存 Ray Common 配置
        let c = await readRayConfig()
        if (!c || !c.outbounds || !Array.isArray(c.outbounds)) return

        for (let i = 0; i < c.outbounds.length; i++) {
            const outbound = c.outbounds[i]
            if (outbound.tag === "proxy") {
                if (typeof outbound.mux === 'object') {
                    outbound.mux.enabled = value
                    outbound.mux.concurrency = rayCommonConfig.outbounds_concurrency
                } else {
                    outbound.mux = {
                        enabled: value,
                        concurrency: rayCommonConfig.outbounds_concurrency
                    }
                }
                c.outbounds[i] = outbound
            }
        }
        await saveAndRestart(c)
    })()
}

export function rayOutboundsConcurrencyChange(value: number, rayCommonConfig: RayCommonConfig) {
    (async () => {
        await saveRayCommonConfig(rayCommonConfig) // 保存 Ray Common 配置

        let c = await readRayConfig()
        if (!c || !c.outbounds || !Array.isArray(c.outbounds)) return

        for (let i = 0; i < c.outbounds.length; i++) {
            const outbound = c.outbounds[i]
            if (outbound.tag === "proxy") {
                if (typeof outbound.mux === 'object') {
                    outbound.mux.concurrency = value
                } else {
                    outbound.mux = {enabled: rayCommonConfig.outbounds_mux, concurrency: value}
                }
                c.outbounds[i] = outbound
            }
        }
        await saveAndRestart(c)
    })()
}
