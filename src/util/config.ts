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
        "name": "中国大陆模式",
        "note": "专为中国大陆网络环境优化的访问规则",
        "domainStrategy": 'IPIfNonMatch',
        "hash": "e7600b7f166e9726297e58cbe54ba431a726f85eb061ed5fca7f4577eccf670a",
        "rules": [
            {
                "name": "中国大陆 DNS 服务器",
                "note": "排除中国大陆常用 DNS 服务器",
                "outboundTag": "direct",
                "ruleType": "ip",
                "domain": "",
                "ip": "1.12.12.12\n1.2.4.8\n101.226.4.6\n101.6.6.6\n114.114.114.110\n114.114.114.114\n114.114.114.119\n114.114.115.110\n114.114.115.115\n114.114.115.119\n117.50.22.22\n119.29.29.29\n123.125.81.6\n140.207.198.6\n180.76.76.76\n182.254.116.116\n2001:da8:202:10::36\n202.96.128.86\n202.96.134.33\n210.2.4.8\n211.136.192.6\n211.136.192.7\n218.30.118.6\n223.5.5.5\n223.6.6.6\n2400:3200::1\n2400:3200:baba::1\n2408:8899::1\n2409:8088::1\n240e:4c:4008::1\n52.80.66.66",
                "port": "",
                "sourcePort": "",
                "network": "",
                "protocol": ""
            },
            {
                "name": "中国大陆 DNS 服务器（域名）",
                "note": "排除中国大陆常用 DNS 服务器（域名）",
                "outboundTag": "direct",
                "ruleType": "domain",
                "domain": "domain:114dns.com\ndomain:360.cn\ndomain:alidns.com\ndomain:chinamobile.com\ndomain:chinatelecom.com.cn\ndomain:chinaunicom.com\ndomain:cnnic.cn\ndomain:dns.360.cn\ndomain:dns.alidns.com\ndomain:dns.baidu.com\ndomain:dnspod.cn\ndomain:dnspod.com\ndomain:doh.360.cn\ndomain:doh.pub\ndomain:dot.360.cn\ndomain:dot.pub\ndomain:onedns.net\ndomain:tsinghua.edu.cn",
                "ip": "",
                "port": "",
                "sourcePort": "",
                "network": "",
                "protocol": ""
            },
            {
                "name": "常用 Google 域名",
                "note": "代理常用 Google 域名，精准匹配域名，性能能快那么一点",
                "outboundTag": "proxy",
                "ruleType": "domain",
                "domain": "domain:google-analytics.com\ndomain:google-analytics.com.cn\ndomain:google.com\ndomain:googleadapis.com\ndomain:googleadservices.com\ndomain:googleadservices.com.cn\ndomain:googleapis.cn\ndomain:googleapis.com\ndomain:googletagmanager.com\ndomain:googletagservices.com\ndomain:googleusercontent.com\ndomain:gstatic.com",
                "ip": "",
                "port": "",
                "sourcePort": "",
                "network": "",
                "protocol": ""
            },
            {
                "name": "UDP 443 流量",
                "note": "屏蔽 UDP 443 端口流量，部分游戏，流媒体会用这个端口",
                "outboundTag": "block",
                "ruleType": "multi",
                "domain": "",
                "ip": "",
                "port": "443",
                "sourcePort": "",
                "network": "udp",
                "protocol": ""
            },
            {
                "name": "广告域名",
                "note": "屏蔽热心网友整理的广告域名和广告商域名",
                "outboundTag": "block",
                "ruleType": "domain",
                "domain": "geosite:category-ads-all",
                "ip": "",
                "port": "",
                "sourcePort": "",
                "network": "",
                "protocol": ""
            },
            {
                "name": "屏蔽 BT 流量",
                "note": "屏蔽 BT 流量走代理服务器，否则可能导致代理服务器被封",
                "outboundTag": "block",
                "ruleType": "multi",
                "domain": "",
                "ip": "",
                "port": "",
                "sourcePort": "",
                "network": "",
                "protocol": "bittorrent"
            },
            {
                "name": "私有IP",
                "note": "排除代理服务器无法访问的私有IP 如: 192.168.1.1",
                "outboundTag": "direct",
                "ruleType": "ip",
                "domain": "",
                "ip": "geoip:private",
                "port": "",
                "sourcePort": "",
                "network": "",
                "protocol": ""
            },
            {
                "name": "私有域名",
                "note": "排除代理服务器无法访问的私有域名 如: localhost",
                "outboundTag": "direct",
                "ruleType": "domain",
                "domain": "geosite:private",
                "ip": "",
                "port": "",
                "sourcePort": "",
                "network": "",
                "protocol": ""
            },
            {
                "name": "中国大陆 IP",
                "note": "排除 IP 数据库中的所有中国大陆 IP",
                "outboundTag": "direct",
                "ruleType": "ip",
                "domain": "",
                "ip": "geoip:cn",
                "port": "",
                "sourcePort": "",
                "network": "",
                "protocol": ""
            },
            {
                "name": "中国大陆域名",
                "note": "排除域名数据库中的中国大陆常见域名",
                "outboundTag": "direct",
                "ruleType": "domain",
                "domain": "geosite:cn",
                "ip": "",
                "port": "",
                "sourcePort": "",
                "network": "",
                "protocol": ""
            }
        ]
    },
    {
        "name": "俄罗斯模式",
        "note": "专为俄罗斯网络环境优化的访问规则",
        "domainStrategy": 'IPIfNonMatch',
        "hash": "144ea270d77f516f60138522620149c521d8fa72c7cff7fcdefc82ad73bb97ae",
        "rules": [
            {
                "name": "UDP 443 流量",
                "note": "屏蔽 UDP 443 端口流量，部分游戏，流媒体会用这个端口",
                "outboundTag": "block",
                "ruleType": "multi",
                "domain": "",
                "ip": "",
                "port": "443",
                "sourcePort": "",
                "network": "udp",
                "protocol": ""
            },
            {
                "name": "广告域名",
                "note": "屏蔽热心网友整理的广告域名和广告商域名",
                "outboundTag": "block",
                "ruleType": "domain",
                "domain": "geosite:category-ads-all",
                "ip": "",
                "port": "",
                "sourcePort": "",
                "network": "",
                "protocol": ""
            },
            {
                "name": "屏蔽 BT 流量",
                "note": "屏蔽 BT 流量走代理服务器，否则可能导致代理服务器被封",
                "outboundTag": "block",
                "ruleType": "multi",
                "domain": "",
                "ip": "",
                "port": "",
                "sourcePort": "",
                "network": "",
                "protocol": "bittorrent"
            },
            {
                "name": "私有IP",
                "note": "排除代理服务器无法访问的私有IP 如: 192.168.1.1",
                "outboundTag": "direct",
                "ruleType": "ip",
                "domain": "",
                "ip": "geoip:private",
                "port": "",
                "sourcePort": "",
                "network": "",
                "protocol": ""
            },
            {
                "name": "私有域名",
                "note": "排除代理服务器无法访问的私有域名 如: localhost",
                "outboundTag": "direct",
                "ruleType": "domain",
                "domain": "geosite:private",
                "ip": "",
                "port": "",
                "sourcePort": "",
                "network": "",
                "protocol": ""
            },
            {
                "name": "俄罗斯 IP",
                "note": "排除 IP 数据库中的所有俄罗斯 IP",
                "outboundTag": "direct",
                "ruleType": "ip",
                "domain": "",
                "ip": "geoip:ru",
                "port": "",
                "sourcePort": "",
                "network": "",
                "protocol": ""
            }
        ]
    },
    {
        "name": "伊朗模式",
        "note": "专为伊朗网络环境优化的访问规则",
        "domainStrategy": 'IPIfNonMatch',
        "hash": "740b450642f85c0e78ccd15810ced1fedefb865f66bef1b168b4e52a8fda3558",
        "rules": [
            {
                "name": "常用 Google 域名",
                "note": "代理常用 Google 域名",
                "outboundTag": "proxy",
                "ruleType": "domain",
                "domain": "domain:google-analytics.com\ndomain:google-analytics.com.cn\ndomain:google.com\ndomain:googleadapis.com\ndomain:googleadservices.com\ndomain:googleadservices.com.cn\ndomain:googleapis.cn\ndomain:googleapis.com\ndomain:googletagmanager.com\ndomain:googletagservices.com\ndomain:googleusercontent.com\ndomain:gstatic.com",
                "ip": "",
                "port": "",
                "sourcePort": "",
                "network": "",
                "protocol": ""
            },
            {
                "name": "UDP 443 流量",
                "note": "屏蔽 UDP 443 端口流量，部分游戏，流媒体会用这个端口",
                "outboundTag": "block",
                "ruleType": "multi",
                "domain": "",
                "ip": "",
                "port": "443",
                "sourcePort": "",
                "network": "udp",
                "protocol": ""
            },
            {
                "name": "广告域名",
                "note": "屏蔽热心网友整理的广告域名和广告商域名",
                "outboundTag": "block",
                "ruleType": "domain",
                "domain": "geosite:category-ads-all",
                "ip": "",
                "port": "",
                "sourcePort": "",
                "network": "",
                "protocol": ""
            },
            {
                "name": "屏蔽 BT 流量",
                "note": "屏蔽 BT 流量走代理服务器，否则可能导致代理服务器被封",
                "outboundTag": "block",
                "ruleType": "multi",
                "domain": "",
                "ip": "",
                "port": "",
                "sourcePort": "",
                "network": "",
                "protocol": "bittorrent"
            },
            {
                "name": "私有IP",
                "note": "排除代理服务器无法访问的私有IP 如: 192.168.1.1",
                "outboundTag": "direct",
                "ruleType": "ip",
                "domain": "",
                "ip": "geoip:private",
                "port": "",
                "sourcePort": "",
                "network": "",
                "protocol": ""
            },
            {
                "name": "私有域名",
                "note": "排除代理服务器无法访问的私有域名 如: localhost",
                "outboundTag": "direct",
                "ruleType": "domain",
                "domain": "geosite:private",
                "ip": "",
                "port": "",
                "sourcePort": "",
                "network": "",
                "protocol": ""
            },
            {
                "name": "伊朗 IP",
                "note": "排除 IP 数据库中的所有伊朗 IP",
                "outboundTag": "direct",
                "ruleType": "ip",
                "domain": "",
                "ip": "geoip:ir",
                "port": "",
                "sourcePort": "",
                "network": "",
                "protocol": ""
            }
        ]
    }
]
