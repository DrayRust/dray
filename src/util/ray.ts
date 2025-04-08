import { readRayConfig, restartRay, saveRayCommonConfig, saveRayConfig } from "./invoke.ts"

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

export function rayLogLevelChange(value: string, rayCommonConfig: RayCommonConfig) {
    readRayConfig().then(async c => {
        if (c.log) {
            c.log.loglevel = value
            const ok = await saveRayConfig(c) // 保存 Ray 配置
            ok && await saveRayCommonConfig(rayCommonConfig).catch(_ => 0) // 保存 Ray Common 配置
        }
    }).catch(_ => 0)
}

export function rayHostChange(host: string) {
    readRayConfig().then(async c => {
        if (c.inbounds && Array.isArray(c.inbounds)) {
            for (let i = 0; i < c.inbounds.length; i++) {
                if (c.inbounds[i].listen) {
                    c.inbounds[i].listen = host // 修改监听地址
                }
            }
        }
        const ok = await saveRayConfig(c) // 保存 Ray 配置
        ok && restartRay() // 重启 Ray 服务
    }).catch(_ => 0)
}

export function raySocksPortChange(port: number) {
    readRayConfig().then(async c => {
        if (c.inbounds && Array.isArray(c.inbounds)) {
            for (let i = 0; i < c.inbounds.length; i++) {
                if (c.inbounds[i].protocol === "socks") {
                    c.inbounds[i].port = port // 修改端口
                }
            }
        }
        const ok = await saveRayConfig(c) // 保存 Ray 配置
        ok && restartRay() // 重启 Ray 服务
    }).catch(_ => 0)
}

export function rayHttpPortChange(port: number) {
    readRayConfig().then(async c => {
        if (c.inbounds && Array.isArray(c.inbounds)) {
            for (let i = 0; i < c.inbounds.length; i++) {
                if (c.inbounds[i].protocol === "http") {
                    c.inbounds[i].port = port // 修改端口
                }
            }
        }
        const ok = await saveRayConfig(c) // 保存 Ray 配置
        ok && restartRay() // 重启 Ray 服务
    }).catch(_ => 0)
}

export function raySocksEnabledChange(value: boolean, config: AppConfig, rayCommonConfig: RayCommonConfig) {
    readRayConfig().then(async c => {
        if (!c.inbounds || !Array.isArray(c.inbounds)) return
        if (value) {
            c.inbounds.push(getSocksConf(config, rayCommonConfig))
        } else {
            c.inbounds = c.inbounds.filter((item: any) => item.protocol !== "socks")
        }
        const ok = await saveRayConfig(c) // 保存 Ray 配置
        if (ok) {
            await saveRayCommonConfig(rayCommonConfig).catch(_ => 0) // 保存 Ray Common 配置
            restartRay() // 重启 Ray 服务
        }
    }).catch(_ => 0)
}

export function rayHttpEnabledChange(value: boolean, config: AppConfig, rayCommonConfig: RayCommonConfig) {
    readRayConfig().then(async c => {
        if (!c.inbounds || !Array.isArray(c.inbounds)) return
        if (value) {
            c.inbounds.push(getHttpConf(config))
        } else {
            c.inbounds = c.inbounds.filter((item: any) => item.protocol !== "http")
        }
        const ok = await saveRayConfig(c) // 保存 Ray 配置
        if (ok) {
            await saveRayCommonConfig(rayCommonConfig).catch(_ => 0) // 保存 Ray Common 配置
            restartRay() // 重启 Ray 服务
        }
    }).catch(_ => 0)
}

export function raySocksUdpChange(value: boolean, rayCommonConfig: RayCommonConfig) {
    readRayConfig().then(async c => {
        if (!c.inbounds || !Array.isArray(c.inbounds)) return
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
        const ok = await saveRayConfig(c)
        if (ok) {
            await saveRayCommonConfig(rayCommonConfig).catch(_ => 0) // 保存 Ray Common 配置
            restartRay() // 重启 Ray 服务
        }
    }).catch(_ => 0)
}

export function raySocksSniffingChange(value: boolean, rayCommonConfig: RayCommonConfig) {
    readRayConfig().then(async c => {
        if (!c.inbounds || !Array.isArray(c.inbounds)) return
        for (let i = 0; i < c.inbounds.length; i++) {
            const inbounds = c.inbounds[i]
            if (inbounds.protocol === "socks") {
                if (typeof inbounds.sniffing !== 'object') inbounds.sniffing = {}
                inbounds.sniffing.enabled = value
                inbounds.sniffing.destOverride = rayCommonConfig.socks_sniffing_dest_override
                // break
            }
        }
        const ok = await saveRayConfig(c)
        if (ok) {
            await saveRayCommonConfig(rayCommonConfig).catch(_ => 0) // 保存 Ray Common 配置
            restartRay() // 重启 Ray 服务
        }
    }).catch(_ => 0)
}

export function raySocksDestOverrideChange(value: string[], rayCommonConfig: RayCommonConfig) {
    readRayConfig().then(async c => {
        if (!c.inbounds || !Array.isArray(c.inbounds)) return
        for (let i = 0; i < c.inbounds.length; i++) {
            const inbounds = c.inbounds[i]
            if (inbounds.protocol === "socks") {
                if (typeof inbounds.sniffing !== 'object') inbounds.sniffing = {enabled: rayCommonConfig.socks_sniffing}
                inbounds.sniffing.destOverride = value
                // break
            }
        }
        const ok = await saveRayConfig(c)
        if (ok) {
            await saveRayCommonConfig(rayCommonConfig).catch(_ => 0) // 保存 Ray Common 配置
            restartRay() // 重启 Ray 服务
        }
    }).catch(_ => 0)
}

export function rayOutboundsMuxChange(value: boolean, rayCommonConfig: RayCommonConfig) {
    readRayConfig().then(async c => {
        if (!c.outbounds || !Array.isArray(c.outbounds)) return
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
        const ok = await saveRayConfig(c)
        if (ok) {
            await saveRayCommonConfig(rayCommonConfig).catch(_ => 0) // 保存 Ray Common 配置
            restartRay() // 重启 Ray 服务
        }
    }).catch(_ => 0)
}

export function rayOutboundsConcurrencyChange(value: number, rayCommonConfig: RayCommonConfig) {
    readRayConfig().then(async c => {
        if (!c.outbounds || !Array.isArray(c.outbounds)) return
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
        const ok = await saveRayConfig(c)
        if (ok) {
            await saveRayCommonConfig(rayCommonConfig).catch(_ => 0) // 保存 Ray Common 配置
            restartRay() // 重启 Ray 服务
        }
    }).catch(_ => 0)
}
