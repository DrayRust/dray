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

    socks_enabled: boolean;
    http_enabled: boolean;

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
    scy: string; // 加密方式 security
    hash: string; // data JSON 字符串的哈希值，用来排重
    data: VlessRow | VmessRow | SsRow | TrojanRow | null;
}

interface ServerList extends Array<ServerRow> {
}

interface VlessRow {
    add: string; // 地址 address
    port: number; // 端口 port
    id: string; // uuid
    flow: string;
    scy: string; // 加密方式 security
    encryption: string;
    type: string;
    host: string;
    path: string;
    net: string; // 网络类型 network
    fp: string;
    pbk: string; // reality public key
    sid: string; // reality shortId
    sni: string;
    serviceName: string;
    headerType: string;
    seed: string;
    mode: string;
}

interface VmessRow {
    add: string; // 地址 address
    port: number; // 端口 port
    id: string; // uuid
    aid: number; // 用户副ID alterId
    scy: string; // 加密方式 security
    alpn: string;
    sni: string;
    net: string; // 网络类型 network
    host: string;
    path: string;
    tls: string;
    fp: string;
    type: string;
    seed: string;
    mode: string;
}

interface SsRow {
    add: string; // 地址 address
    port: number; // 端口 port
    pwd: string; // 密码 password
    scy: string; // 加密方式 method
}

interface TrojanRow {
    add: string; // 地址 address
    port: number; // 端口 port
    pwd: string; // 密码 password
    scy: string; // 加密方式 security
    flow: string;
    sni: string;
    fp: string;
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
