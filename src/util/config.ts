export const DEFAULT_APP_CONFIG: AppConfig = {
    app_log_level: "info",

    web_server_enable: true,
    web_server_host: "127.0.0.1",
    web_server_port: 18687,

    ray_enable: false,
    ray_host: "127.0.0.1",
    ray_socks_port: 1086,
    ray_http_port: 1089,

    auto_setup_pac: false,
    auto_setup_socks: true,
    auto_setup_http: false,
    auto_setup_https: false
}

export const DEFAULT_RAY_COMMON_CONFIG: RayCommonConfig = {
    ray_log_level: "warning",
    stats_enable: true,

    socks_enable: true,
    http_enable: true,

    socks_udp: false,
    socks_sniffing: false,
    socks_sniffing_dest_override: ["http", "tls"],

    outbounds_mux: false,
    outbounds_concurrency: 8,
}

export const DEFAULT_RULE_MODE_LIST: RuleModeList = [
    {
        name: "大陆模式",
        note: "专为大陆网络环境优化的访问规则",
        hash: "",
        rules: []
    },
    {
        name: "俄罗斯模式",
        note: "专为俄罗斯网络环境优化的访问规则",
        hash: "",
        rules: []
    },
    {
        name: "伊朗模式",
        note: "专为伊朗网络环境优化的访问规则",
        hash: "",
        rules: []
    },
]
