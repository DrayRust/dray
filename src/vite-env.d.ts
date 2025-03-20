/// <reference types="vite/client" />

interface AppConfig {
    app_log_level: "none" | "error" | "warn" | "info" | "debug" | "trace";

    web_server_enable: boolean;
    web_server_host: string;
    web_server_port: number | "";

    ray_enable: boolean;
    ray_force_restart: boolean;
    ray_host: string;
    ray_socks_port: number | "";
    ray_http_port: number | "";

    auto_setup_pac: boolean;
    auto_setup_socks: boolean;
    auto_setup_http: boolean;
    auto_setup_https: boolean;
}

interface RayConfig {
    log_level: "debug" | "info" | "warning" | "error" | "none";

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

interface Tauri {
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
}
