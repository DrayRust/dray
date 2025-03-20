import { readRayConfig, restartRay, saveRayCommonConfig, saveRayConfig } from "./invoke.ts"

export function rayHostChange(host: string) {
    readRayConfig().then(async c => {
        if (c.inbounds && Array.isArray(c.inbounds)) {
            for (let i = 0; i < c.inbounds.length; i++) {
                if (c.inbounds[i].listen) {
                    c.inbounds[i].listen = host // 修改监听地址
                }
            }
        }
        await saveRayConfig(c).catch(_ => 0) // 保存 Ray 配置
        restartRay() // 重载 Ray 服务
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
        await saveRayConfig(c).catch(_ => 0) // 保存 Ray 配置
        restartRay() // 重载 Ray 服务
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
        await saveRayConfig(c).catch(_ => 0) // 保存 Ray 配置
        restartRay() // 重载 Ray 服务
    }).catch(_ => 0)
}

export function raySocksEnabledChange(value: boolean, config: AppConfig, rayCommonConfig: RayCommonConfig) {
    readRayConfig().then(async c => {
        if (!c.inbounds || !Array.isArray(c.inbounds)) return
        if (value) {
            c.inbounds.push({
                "tag": "socks-in",
                "protocol": "socks",
                "listen": config.ray_host,
                "port": config.ray_socks_port,
                "settings": {
                    "udp": false
                }
            })
        } else {
            c.inbounds = c.inbounds.filter((item: any) => item.protocol !== "socks")
        }
        await saveRayConfig(c).catch(_ => 0) // 保存 Ray 配置
        await saveRayCommonConfig(rayCommonConfig).catch(_ => 0) // 保存 Ray Common 配置
        restartRay() // 重载 Ray 服务
    }).catch(_ => 0)
}

export function rayHttpEnabledChange(value: boolean, config: AppConfig, rayCommonConfig: RayCommonConfig) {
    readRayConfig().then(async c => {
        if (!c.inbounds || !Array.isArray(c.inbounds)) return
        if (value) {
            c.inbounds.push({
                "tag": "http-in",
                "protocol": "http",
                "listen": config.ray_host,
                "port": config.ray_http_port
            })
        } else {
            c.inbounds = c.inbounds.filter((item: any) => item.protocol !== "http")
        }
        await saveRayConfig(c).catch(_ => 0) // 保存 Ray 配置
        await saveRayCommonConfig(rayCommonConfig).catch(_ => 0) // 保存 Ray Common 配置
        restartRay() // 重载 Ray 服务
    }).catch(_ => 0)
}
