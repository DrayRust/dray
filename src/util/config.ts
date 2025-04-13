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

export const DEFAULT_RULE_CONFIG: RuleConfig = {
    globalProxy: false,
    domainStrategy: 'AsIs',
    unmatchedStrategy: 'proxy',
    mode: 0
}

export const DEFAULT_RULE_DOMAIN: RuleDomain = {
    proxy: '',
    direct: '',
    block: ''
}

// https://xtls.github.io/config/routing.html#ruleobject
// https://www.v2fly.org/config/routing.html#ruleobject
export const DEFAULT_RULE: RuleRow = {
    name: '',
    note: '',
    outboundTag: 'proxy',
    ruleType: 'domain',
    domain: '',
    ip: '',
    port: '',
    sourcePort: '',
    network: '',
    protocol: '',
}

export const DEFAULT_RULE_MODE_LIST: RuleModeList = [
    {
        name: "中国大陆模式",
        note: "专为中国大陆网络环境优化的访问规则",
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
