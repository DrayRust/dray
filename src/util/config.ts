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
    reject: ''
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
        "domainStrategy": "IPIfNonMatch",
        "hash": "e085c319f010c08e502bfbc8bcdf3e3d28a1f93ed10488a6819be2064f174d99",
        "rules": [
            {
                "name": "中国大陆 DNS 服务器",
                "note": "排除中国大陆常用 DNS 服务器",
                "outboundTag": "direct",
                "ruleType": "multi",
                "domain": "domain:114dns.com\ndomain:360.cn\ndomain:alidns.com\ndomain:chinamobile.com\ndomain:chinatelecom.com.cn\ndomain:chinaunicom.com\ndomain:cnnic.cn\ndomain:dns.360.cn\ndomain:dns.alidns.com\ndomain:dns.baidu.com\ndomain:dnspod.cn\ndomain:dnspod.com\ndomain:doh.360.cn\ndomain:doh.pub\ndomain:dot.360.cn\ndomain:dot.pub\ndomain:onedns.net\ndomain:tsinghua.edu.cn",
                "ip": "1.12.12.12\n1.2.4.8\n101.226.4.6\n101.6.6.6\n114.114.114.110\n114.114.114.114\n114.114.114.119\n114.114.115.110\n114.114.115.115\n114.114.115.119\n117.50.22.22\n119.29.29.29\n123.125.81.6\n140.207.198.6\n180.76.76.76\n182.254.116.116\n2001:da8:202:10::36\n202.96.128.86\n202.96.134.33\n210.2.4.8\n211.136.192.6\n211.136.192.7\n218.30.118.6\n223.5.5.5\n223.6.6.6\n2400:3200::1\n2400:3200:baba::1\n2408:8899::1\n2409:8088::1\n240e:4c:4008::1\n52.80.66.66",
                "port": "",
                "sourcePort": "",
                "network": "",
                "protocol": ""
            },
            {
                "name": "UDP 443 流量",
                "note": "屏蔽 UDP 443 端口流量，部分游戏，流媒体会用这个端口",
                "outboundTag": "reject",
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
                "outboundTag": "reject",
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
                "outboundTag": "reject",
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
        "domainStrategy": "IPIfNonMatch",
        "hash": "2326c8c982f75314cac9269f249c45655cc207841dedac3024b8ef9529cb460e",
        "rules": [
            {
                "name": "UDP 443 流量",
                "note": "屏蔽 UDP 443 端口流量，部分游戏，流媒体会用这个端口",
                "outboundTag": "reject",
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
                "outboundTag": "reject",
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
                "outboundTag": "reject",
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
        "domainStrategy": "IPIfNonMatch",
        "hash": "94f55a409977848dfb3206d564ff75a41bb580c5c143192eb8a01242562eeca1",
        "rules": [
            {
                "name": "UDP 443 流量",
                "note": "屏蔽 UDP 443 端口流量，部分游戏，流媒体会用这个端口",
                "outboundTag": "reject",
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
                "outboundTag": "reject",
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
                "outboundTag": "reject",
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

export const DEFAULT_DNS_CONFIG: DnsConfig = {
    enable: true,
    mode: 0,
}

export const DEFAULT_DNS_MODE_ROW: DnsModeRow = {
    name: '',
    note: '',
    hash: '',
    hosts: [],
    servers: [],
    clientIP: '',
    queryStrategy: 'UseIP',
    disableCache: false,
    disableFallback: false,
    disableFallbackIfMatch: false,
}

export const DEFAULT_DNS_MODE_LIST: DnsModeList = [
    {
        "name": "Cloudflare DNS 优先模式",
        "note": "优先使用 Cloudflare DNS、Google DNS 解析域名，中国大陆域名使用阿里云 DNS 解析",
        "hash": "32ba424272a378ec4c55bd9a1f317b1f7485783f6f27c302d659e1139dcba279",
        "hosts": [
            {
                "name": "Google DNS",
                "note": "跳过 Google DNS 域名解析，直接使用 IP 地址",
                "domain": "dns.google",
                "host": "8.8.8.8"
            },
            {
                "name": "Cloudflare DNS",
                "note": "跳过 Cloudflare DNS 域名解析，直接使用 IP 地址",
                "domain": "one.one.one.one",
                "host": "1.1.1.1"
            },
            {
                "name": "阿里云 DNS",
                "note": "跳过阿里云 DNS 域名解析，直接使用 IP 地址",
                "domain": "dns.alidns.com",
                "host": "223.5.5.5"
            },
            {
                "name": "腾讯云 DNS",
                "note": "跳过腾讯云 DNS 域名解析，直接使用 IP 地址",
                "domain": "dns.pub",
                "host": "119.29.29.29"
            },
            {
                "name": "广告域名",
                "note": "跳过远程域名系统解析域名数据库中的广告域名",
                "domain": "geosite:category-ads-all",
                "host": "127.0.0.1"
            }
        ],
        "servers": [
            {
                "name": "Cloudflare DNS",
                "note": "使用 Cloudflare 解析域名数据库中常见的非中国大陆域名",
                "type": "object",
                "address": "https://1.1.1.1/dns-query",
                "port": "",
                "domains": "geosite:geolocation-!cn",
                "expectIPs": "geoip:!cn",
                "clientIP": "",
                "queryStrategy": "UseIP",
                "timeoutMs": 4000,
                "skipFallback": false,
                "allowUnexpectedIPs": false
            },
            {
                "name": "Google DNS",
                "note": "使用 Google DNS 系统解析域名",
                "type": "address",
                "address": "8.8.8.8",
                "port": "",
                "domains": "",
                "expectIPs": "",
                "clientIP": "",
                "queryStrategy": "UseIP",
                "timeoutMs": 4000,
                "skipFallback": false,
                "allowUnexpectedIPs": false
            },
            {
                "name": "阿里云 DNS",
                "note": "使用阿里云 DNS 解析域名数据库中常见的中国大陆域名",
                "type": "object",
                "address": "223.5.5.5",
                "port": "",
                "domains": "geosite:cn",
                "expectIPs": "geoip:cn",
                "clientIP": "",
                "queryStrategy": "UseIP",
                "timeoutMs": 4000,
                "skipFallback": true,
                "allowUnexpectedIPs": false
            },
            {
                "name": "本机 DNS",
                "note": "使用本机设置的域名服务器解析域名",
                "type": "address",
                "address": "localhost",
                "port": "",
                "domains": "",
                "expectIPs": "",
                "clientIP": "",
                "queryStrategy": "UseIP",
                "timeoutMs": 4000,
                "skipFallback": false,
                "allowUnexpectedIPs": false
            }
        ],
        "clientIP": "",
        "queryStrategy": "UseIP",
        "disableCache": false,
        "disableFallback": false,
        "disableFallbackIfMatch": false
    },
    {
        "name": "Google DNS 优先模式",
        "note": "优先使用 Google DNS 解析，其次使用阿里云 DNS",
        "hash": "b35161a6822e9634f917f0774669969fab556636914a438bb453d75e941db9cb",
        "hosts": [
            {
                "name": "Google DNS",
                "note": "跳过 Google DNS 域名解析，直接使用 IP 地址",
                "domain": "dns.google",
                "host": "8.8.8.8"
            },
            {
                "name": "阿里云 DNS",
                "note": "跳过阿里云 DNS 域名解析，直接使用 IP 地址",
                "domain": "dns.alidns.com",
                "host": "223.5.5.5"
            },
            {
                "name": "广告域名",
                "note": "跳过远程域名系统解析域名数据库中的广告域名",
                "domain": "geosite:category-ads-all",
                "host": "127.0.0.1"
            }
        ],
        "servers": [
            {
                "name": "Google DNS",
                "note": "使用 Google DNS 解析域名",
                "type": "address",
                "address": "8.8.8.8",
                "port": "",
                "domains": "",
                "expectIPs": "",
                "clientIP": "",
                "queryStrategy": "UseIP",
                "timeoutMs": 4000,
                "skipFallback": false,
                "allowUnexpectedIPs": false
            },
            {
                "name": "阿里云 DNS",
                "note": "使用阿里云 DNS 解析域名",
                "type": "address",
                "address": "223.5.5.5",
                "port": "",
                "domains": "",
                "expectIPs": "",
                "clientIP": "",
                "queryStrategy": "UseIP",
                "timeoutMs": 4000,
                "skipFallback": false,
                "allowUnexpectedIPs": false
            },
            {
                "name": "本机 DNS",
                "note": "使用本机设置的域名服务器解析域名",
                "type": "address",
                "address": "localhost",
                "port": "",
                "domains": "",
                "expectIPs": "",
                "clientIP": "",
                "queryStrategy": "UseIP",
                "timeoutMs": 4000,
                "skipFallback": false,
                "allowUnexpectedIPs": false
            }
        ],
        "clientIP": "",
        "queryStrategy": "UseIP",
        "disableCache": false,
        "disableFallback": false,
        "disableFallbackIfMatch": false
    }
]

export const DEFAULT_DNS_TABLE_LIST: DnsTableList = [
    {
        "name": "[全球] Google Public DNS",
        "note": "全球用户量最大（日均千亿级请求），响应速度快，支持DNSSEC，但隐私政策存在争议；中国大陆访问不稳定，可能被屏蔽",
        "hash": "2c7ed6e0148ed21334fb3b778991cabb300214bca700f24b9e8fed1abe107d05",
        "IPv4": "8.8.8.8\n8.8.4.4",
        "IPv6": "2001:4860:4860::8888\n2001:4860:4860::8844",
        "DoH": "https://dns.google/dns-query",
        "DoT": "dns.google"
    },
    {
        "name": "[全球] Cloudflare DNS",
        "note": "国际服务商，以隐私保护著称（承诺不记录用户IP），全球节点多，响应速度与Google相当；中国大陆访问延迟较高，部分地区被干扰",
        "hash": "dc9818edfb8337b671b1eaa45fb86a49eb9aed8d47a12262508a0af5dec14621",
        "IPv4": "1.1.1.1\n1.0.0.1",
        "IPv6": "2606:4700:4700::1111\n2606:4700:4700::1001",
        "DoH": "https://cloudflare-dns.com/dns-query",
        "DoT": "one.one.one.one"
    },
    {
        "name": "阿里云 DNS",
        "note": "中国大陆速度最快，支持 CDN 优化，IPv6 覆盖全，适合访问中国大陆网站",
        "hash": "782e80b173575531b720bdb572a44e4f11fc26b2b3a9ac7121cd1dce20c54b32",
        "IPv4": "223.5.5.5\n223.6.6.6",
        "IPv6": "2400:3200::1\n2400:3200:baba::1",
        "DoH": "https://dns.alidns.com/dns-query",
        "DoT": "dns.alidns.com"
    },
    {
        "name": "腾讯云 DNS",
        "note": "适合对安全性和隐私有较高要求的用户，游戏和视频解析优化",
        "hash": "2149a382c025a4a4e1d853987e4eaed77083be815c48d1fa3fa79e2eec465c74",
        "IPv4": "1.12.12.12\n119.29.29.29",
        "IPv6": "2402:4e00:1::\n2402:4e00::",
        "DoH": "https://doh.pub/dns-query",
        "DoT": "dot.pub"
    },
    {
        "name": "DNSPod DNS （腾讯）",
        "note": "腾讯旗下，支持ECS（提升CDN解析精度），适合游戏和视频用户",
        "hash": "cd2963d20b8b8bf5e6df3ffc1233c26cc3e8c70b2643c5b480d7d0d9e4f9e402",
        "IPv4": "119.29.29.29\n182.254.116.116",
        "IPv6": "",
        "DoH": "https://119.29.29.29/dns-query",
        "DoT": ""
    },
    {
        "name": "114 DNS",
        "note": "中国大陆老牌稳定DNS，稳定性高，但无广告过滤功能，仅限 IPv4，由南京信风公司（Newifi）于2010年前后推出",
        "hash": "82d6267b6275009df4dbac7ffa05c004e820410c005a553d028963cc7a25ab99",
        "IPv4": "114.114.114.114\n114.114.115.115",
        "IPv6": "",
        "DoH": "https://114.114.114.114/dns-query",
        "DoT": ""
    },
    {
        "name": "114 DNS 安全版",
        "note": "",
        "hash": "0baecc720dcf3734440d75cf0949c1d4bee015120194552283846470c23e7239",
        "IPv4": "114.114.114.119\n114.114.115.119",
        "IPv6": "",
        "DoH": "",
        "DoT": ""
    },
    {
        "name": "114 DNS 家庭版",
        "note": "",
        "hash": "d136bf70865722f4586da85e86b66f8a237c0cadfe290c57b85fc7367ee0f0ea",
        "IPv4": "114.114.114.110\n114.114.115.110",
        "IPv6": "",
        "DoH": "",
        "DoT": ""
    },
    {
        "name": "华为云 DNS",
        "note": "企业级服务，主要面向华为云用户",
        "hash": "5e52eee00cb5ba9bc246cfe64c5f0df82bfdab65298c79d48e8503fa8daee613",
        "IPv4": "100.125.1.250\n100.125.21.250",
        "IPv6": "240c::6666\n240c::6644",
        "DoH": "https://dns.huaweicloud.com/dns-query",
        "DoT": ""
    },
    {
        "name": "百度 DNS",
        "note": "侧重安全拦截，IPv6支持有限，节点覆盖和速度略逊于阿里和 114 DNS",
        "hash": "51d3a209c1fcc433e96a01f0c88b38e275ca0d5cebd669e197056f64020b9b52",
        "IPv4": "180.76.76.76",
        "IPv6": "2400:da00::6666",
        "DoH": "https://180.76.76.76/dns-query",
        "DoT": ""
    },
    {
        "name": "360 DNS",
        "note": "过滤恶意网站，适合家庭用户，仅限 IPv4",
        "hash": "d239aa4795aafd93e31882a5f5c4041987adfa4bc8ba5a47a39271869135ea13",
        "IPv4": "101.226.4.6\n123.125.81.6\n218.30.118.6",
        "IPv6": "",
        "DoH": "https://doh.360.cn/dns-query",
        "DoT": "dot.360.cn"
    },
    {
        "name": "OneDNS",
        "note": "OneDNS 是由北京微步在线科技有限公司提供的 DNS 服务",
        "hash": "5f6677b27a884b996c4da496cd6c58adc80a765d5fc00b5b67d48d146b5526d2",
        "IPv4": "117.50.22.22\n52.80.66.66",
        "IPv6": "",
        "DoH": "https://117.50.22.22/dns-query",
        "DoT": ""
    },
    {
        "name": "清华大学 DNS",
        "note": "",
        "hash": "b9cc9d2101ca00a7d186535ef1f9abe4e690c9f0946fc8ff3ddd30007144c3c9",
        "IPv4": "101.6.6.6",
        "IPv6": "2001:da8:202:10::36",
        "DoH": "https://101.6.6.6/dns-query",
        "DoT": ""
    },
    {
        "name": "CNNIC DNS",
        "note": "CNNIC DNS 是由中国互联网信息中心（China Internet Network Information Center，简称 CNNIC）提供的免费公共 DNS 服务，国家域名系统，稳定性高，但已逐渐下线",
        "hash": "192af06b89ea2575f3463d1418c10491a7b222626e6e3f43887285ca706affea",
        "IPv4": "1.2.4.8\n210.2.4.8",
        "IPv6": "",
        "DoH": "https://1.2.4.8/dns-query",
        "DoT": ""
    },
    {
        "name": "中国电信 DNS",
        "note": "",
        "hash": "17cc93f45632afc63292bd1af16884252628d7bcc63eccf3722385a470cff51a",
        "IPv4": "222.222.222.222\n222.222.202.202\n202.96.128.86",
        "IPv6": "240e:4c:4008::1\n240e:4c:4808::1",
        "DoH": "https://202.96.128.86/dns-query",
        "DoT": ""
    },
    {
        "name": "中国移动 DNS",
        "note": "",
        "hash": "88ffdd6a1f4989ff6b01de2e2c293fec3479a3dab22b65fd0dbf53f6ebbec1ea",
        "IPv4": "211.136.192.6\n211.136.192.7",
        "IPv6": "2409:8088::1\n2409:8088::a\n2409:8088::b",
        "DoH": "https://211.136.192.6/dns-query",
        "DoT": ""
    },
    {
        "name": "中国联通 DNS",
        "note": "",
        "hash": "105be68b9aadd957e057bf345dbe45881f66ac06f351f7d77e7faf7c130a7b5b",
        "IPv4": "123.125.81.6\n140.207.198.6",
        "IPv6": "2408:8899::1",
        "DoH": "https://123.125.81.6/dns-query",
        "DoT": ""
    },
    {
        "name": "知道创宇DNS",
        "note": "安全防护型DNS，拦截钓鱼网站",
        "hash": "1902ad820d2bef0cdd13613684e33014f557bb1f29df70566c52a2b233c6915d",
        "IPv4": "1.1.8.8\n1.0.8.8",
        "IPv6": "",
        "DoH": "",
        "DoT": ""
    },
    {
        "name": "[全球] OpenDNS (Cisco)",
        "note": "主打安全防护（过滤恶意网站），适合家庭和企业，提供家长控制功能",
        "hash": "08be55e3f775db0072f1fec32e34fb6a795314226fa626918ec579cc13f014ae",
        "IPv4": "208.67.222.222\n208.67.220.220",
        "IPv6": "2620:119:35::35\n2620:119:53::53",
        "DoH": "https://doh.opendns.com/dns-query",
        "DoT": ""
    },
    {
        "name": "[全球] Quad9",
        "note": "非营利组织运营，实时拦截恶意域名，隐私保护强，但节点覆盖略差，中国大陆访问受限",
        "hash": "b352f5aed9d47e8bf648c623aaa0a458a97b75fe1e42cd4e16936ca7c057993b",
        "IPv4": "9.9.9.9\n149.112.112.112",
        "IPv6": "2620:fe::fe",
        "DoH": "https://dns.quad9.net/dns-query",
        "DoT": ""
    },
    {
        "name": "[全球] AdGuard DNS",
        "note": "专注广告和跟踪器拦截，适合厌恶广告的用户，提供免费版和付费版",
        "hash": "4c3b7e7dfb8b2cdd5eea728109cb2fab7d70906921c9e3a559d2eacbbce0170a",
        "IPv4": "94.140.14.14\n94.140.15.15",
        "IPv6": "2a10:50c0::ad1:ff\n2a10:50c0::ad2:ff",
        "DoH": "https://dns.adguard.com/dns-query",
        "DoT": ""
    },
    {
        "name": "[全球] DNS.SB",
        "note": "小众服务商，支持无审查解析，中国大陆速度波动大",
        "hash": "4c867afc0100d0b0d0a2e312240f1e917a5a1e826f798426b9682c573011431f",
        "IPv4": "185.222.222.222\n45.11.45.11",
        "IPv6": "2a09::1\n2a09::2",
        "DoH": "https://doh.dns.sb/dns-query",
        "DoT": "dns.sb"
    }
]
