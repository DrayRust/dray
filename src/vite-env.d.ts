/// <reference types="vite/client" />

interface AppConfig {
    app_log_level: "none" | "error" | "warn" | "info" | "debug" | "trace";

    web_server_enable: boolean;
    web_server_host: string;
    web_server_port: number | "";

    ray_enable: boolean;
    ray_log_level: "debug" | "info" | "warning" | "error" | "none";
    ray_host: string;
    ray_socks_port: number | "";
    ray_http_port: number | "";

    ray_start_socks: boolean;
    ray_start_http: boolean;

    auto_setup_pac: boolean;
    auto_setup_socks: boolean;
    auto_setup_http: boolean;
    auto_setup_https: boolean;
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
        setTheme(theme?): Promise<void>;
    };
    core: {
        invoke<T>(cmd, args, options?): Promise<T>;
        isTauri(): boolean;
    }
    dpi: any;
    event: {
        emit(event, payload?): Promise<void>;
        emitTo(target, event, payload?): Promise<void>;
        listen<T>(event, handler, options?): Promise<UnlistenFn>;
        once<T>(event, handler, options?): Promise<UnlistenFn>;
    };
    image: any;
    menu: any;
    mocks: any;
    path: any;
    tray: any;
    webview: any;
    webviewWindow: any;
    window: {
        cursorPosition(): Promise<PhysicalPosition>;
        getAllWindows(): Promise<Window[]>;
        getCurrentWindow(): Window;
    };
}

interface Window {
    __TAURI__: Tauri;
}
