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
}

interface NavProps {
    setNavState?: any
}
