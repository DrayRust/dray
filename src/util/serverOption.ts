export const vlessNetworkTypeList = [
    'raw',
    'ws',
    'grpc',
    'xhttp',
]

export const vlessSecurityList = [
    'none',
    'tls',
    'reality',
]

export const vmessNetworkTypeList = [
    'raw',
    'kcp',
    'ws',
    'http',
    'grpc',
    'httpupgrade',
]

export const vmessSecurityList = [
    'none',
    'auto',
    'zero',
    'aes-128-gcm',
    'chacha20-poly1305',
]

export const ssMethodList = [
    'none',
    '2022-blake3-aes-128-gcm',
    '2022-blake3-aes-256-gcm',
    '2022-blake3-chacha20-poly1305',
    'aes-128-gcm',
    'aes-256-gcm',
    // 'chacha20-poly1305',
    // 'xchacha20-poly1305',
    'chacha20-ietf-poly1305',
    'xchacha20-ietf-poly1305',
]

export const trojanNetworkTypeList = [
    'ws',
    'grpc',
]

export const flowList = [
    'xtls-rprx-vision',
    'xtls-rprx-vision-udp443',
]

export const fingerprintList = [
    'chrome',
    'firefox',
    'safari',
    'edge',
    '360',
    'qq',
    'ios',
    'android',
    'random',
    'randomized',
]

export const rawHeaderTypeList = [
    'none',
    'http',
]

export const kcpHeaderTypeList = [
    'none',
    'srtp',
    'utp',
    'wechat-video',
    'dtls',
    'wireguard',
]

export const grpcModeList = [
    'gun',
    'multi',
    'guna',
]

export const alpnList = [
    'http/1.1',
    'h2',
    'h2, http/1.1',
    'h3',
    'h3, h2',
    'h3, h2, http/1.1',
]

export function validateServerRow(
    data: VmessRow | VlessRow | SsRow | TrojanRow | null,
    ps: string,
    setPsError: (error: boolean) => void,
    setAddError: (error: boolean) => void,
    setPortError: (error: boolean) => void,
    setIdError: (error: boolean) => void,
    setPwdError: (error: boolean) => void
): boolean {
    if (!data) return false

    let err = false
    if (!ps) {
        setPsError(true)
        err = true
    }
    if ("add" in data && !data.add) {
        setAddError(true)
        err = true
    }
    if ("port" in data && !data.port) {
        setPortError(true)
        err = true
    }
    if ("id" in data && !data.id) {
        setIdError(true)
        err = true
    }
    if ("pwd" in data && !data.pwd) {
        setPwdError(true)
        err = true
    }

    return !err
}
