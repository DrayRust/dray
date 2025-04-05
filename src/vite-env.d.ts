/// <reference types="vite/client" />

interface AppConfig {
    app_log_level: "none" | "error" | "warn" | "info" | "debug" | "trace";

    web_server_enable: boolean;
    web_server_host: string;
    web_server_port: number | "";

    ray_enable: boolean;
    ray_host: string;
    ray_socks_port: number | "";
    ray_http_port: number | "";

    auto_setup_pac: boolean;
    auto_setup_socks: boolean;
    auto_setup_http: boolean;
    auto_setup_https: boolean;
}

interface RayCommonConfig {
    ray_log_level: "debug" | "info" | "warning" | "error" | "none";

    socks_enable: boolean;
    http_enable: boolean;

    socks_udp: boolean;
    socks_sniffing: boolean;
    socks_sniffing_dest_override: ("http" | "tls" | "quic" | "fakedns" | "fakedns+others")[];

    outbounds_mux: boolean;
    outbounds_concurrency: number;
}

interface NavProps {
    setNavState?: any;
}

// ============= Log ============
interface LogRow {
    filename: string;
    last_modified: string;
    size: number;
}

interface LogList extends Array<LogRow> {
}

interface LogContent {
    content: string;
    start: number;
    end: number;
    size: number;
}

interface PrevLogContent {
    fileSize: number;
    start: number;
    end: number;
    len: number;
}

// ============= server ============
interface ServerRow {
    ps: string; // 附言 postscript / 服务器备注 remark
    host: string; // 主机名+端口 如：example.com:8080
    type: string; // 类型 vless / vmess / ss / trojan
    scy: string; // 安全类型 security
    hash: string; // data JSON 字符串的哈希值，用来排重
    data: VmessRow | VlessRow | SsRow | TrojanRow | null;
}

interface ServerList extends Array<ServerRow> {
}

/**
 * 设计宗旨：做减法（挺难的一件事，哪些参数可以砍掉？雷同的参数是否可合并？砍掉和合并后有什么利弊？）
 *
 * VMess / VLESS 分享链接提案: https://github.com/XTLS/Xray-core/discussions/716
 * https://xtls.github.io/config/transport.html
 *
 * https://xtls.github.io/config/outbounds/vmess.html
 * https://www.v2fly.org/v5/config/proxy/vmess.html
 */
interface VmessRow {
    add: string; // 地址 address 如：IP / 域名
    port: number | ''; // 端口 port
    id: string; // 用户 ID (uuid)
    aid: string; // 用户副 ID / 额外 ID (alterId) 默认: "0"

    /**
     * 精简 vmess & vless 配置，将 vmess 和 vless 参数进行拆分，xhttp 部分拆离 vmess
     * 当前的取值必须为 tcp、kcp、ws、http、grpc、httpupgrade、xhttp 其中之一
     * 分别对应 RAW、mKCP、WebSocket、HTTP 2/3、gRPC、HTTPUpgrade、XHTTP 传输方式
     **/
    net: string; // 网络传输方式 network 如: raw、kcp、ws、http、grpc、httpupgrade
    scy: string; // 安全类型 security = encryption 如：none / auto / zero / aes-128-gcm / chacha20-poly1305

    host: string; // 伪装域名 host
    path: string; // 伪装路径 / 主机名 path

    // raw / mKCP
    type: string; // (raw / mKCP) 伪装类型 headerType 如：none / srtp / utp / wechat-video / dtls / wireguard

    // mKCP
    // https://xtls.github.io/config/transports/mkcp.html
    seed: string; // mKCP 种子，省略时不使用种子，但不可以为空字符串

    // gRPC
    mode: string; // gRPC 传输模式 transport mode 如：gun / multi / guna

    // TLS
    // https://xtls.github.io/config/transport.html#tlsobject
    // ALPN = TLS ALPN（Application-Layer Protocol Negotiation，应用层协议协商，TLS 的扩展）
    tls: boolean; // TLS（Transport Layer Security，传输层安全协议）是否启用
    alpn: string; // TLS ALPN 协议，多个 ALPN 之间用英文逗号隔开，中间无空格
    fp: string; //  TLS 伪装指纹 fingerprint，TLS Client Hello 指纹 如：chrome / firefox / safari / edge / ios / android / random
}

// https://xtls.github.io/config/outbounds/vless.html
// https://www.v2fly.org/v5/config/proxy/vless.html
interface VlessRow {
    add: string; // 地址 address 如：IP / 域名
    port: number | ''; // 端口 port
    id: string; // 用户 ID (uuid)

    net: string; // 网络传输方式 network 如：raw / ws / grpc / xhttp
    scy: string; // 安全类型 security 如: none / tls / reality

    host: string; // 伪装域名 host
    path: string; // (ws / xhttp) 伪装路径 path / (grpc / reality) 伪装主机名 SNI = Server Name Indication 如：example.com

    // gRPC
    mode: string; // gRPC 传输模式 transport mode 如：gun / guna / multi

    // XHTTP
    // https://github.com/XTLS/Xray-core/discussions/4113
    extra: string; // XHTTP 额外参数 extra https://github.com/XTLS/Xray-core/pull/4000

    // TLS
    // https://xtls.github.io/config/transport.html#tlsobject
    alpn: string; // TLS ALPN 协议，多个 ALPN 之间用英文逗号隔开，中间无空格
    fp: string; //  TLS 伪装指纹 fingerprint，TLS Client Hello 指纹 如：chrome / firefox / safari / edge / ios / android / random

    // XTLS
    flow: string; // XTLS 流控模式 如：xtls-rprx-vision / xtls-rprx-vision-udp443

    // REALITY
    // https://xtls.github.io/config/transport.html#realityobject
    // https://github.com/XTLS/REALITY
    pbk: string; // public key 服务端私钥对应的公钥
    sid: string; // shortId 服务端 shortIds 之一
    spx: string; // spiderX 伪装爬虫初始路径与参数，建议每个客户端不同
}

interface SsRow {
    add: string; // 地址 address 如：IP / 域名
    port: number | ''; // 端口 port
    pwd: string; // 密码 password
    scy: string; // 安全类型 security = 加密方式 method
}

interface TrojanRow {
    add: string; // 地址 address 如：IP / 域名
    port: number | ''; // 端口 port
    pwd: string; // 密码 password

    net: string; // 网络传输方式 network 如：ws / grpc
    scy: string; // 安全类型 security 只有：tls = "Transport Layer Security"（传输层安全协议）

    host: string; // 伪装域名 host
    path: string; // (ws) 伪装路径 path / (grpc) 伪装主机名 SNI = Server Name Indication 如：example.com
}

/*interface Tauri {
    app: {
        defaultWindowIcon(): Promise<Image | null>;
        getName(): Promise<string>;
        getVersion(): Promise<string>;
        getTauriVersion(): Promise<string>;
        hide(): Promise<void>;
        show(): Promise<void>;
        setTheme(theme?: string): Promise<void>;
    };
    core: {
        invoke(cmd: string, args?: Record<string, any>, options?: Record<string, any>): Promise<void>;
        isTauri(): boolean;
    }
    dpi: any;
    event: {
        emit(event: string, payload?: any): Promise<void>;
        emitTo(target: string, event: string, payload?: any): Promise<void>;
        listen(event: string, handler: any): Promise<void>;
        once(event: string, handler: any): Promise<void>;
    };
    image: any;
    menu: any;
    mocks: any;
    path: any;
    tray: any;
    webview: any;
    webviewWindow: any;
    window: {
        cursorPosition(): Promise<void>;
        getAllWindows(): Promise<void>;
        getCurrentWindow(): any;
    };
}

interface Window {
    __TAURI__: Tauri;
}*/
