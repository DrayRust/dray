export const vlessNetworkTypeList = [
    'tcp',
    'ws',
    'grpc',
    'xhttp',
]

export const vlessSecurityList = [
    'none',
    'tls',
    'reality',
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

export const vmessNetworkTypeList = [
    'tcp',
    'kcp',
    'ws',
    'http',
    'domainsocket',
    'quic',
    'grpc',
]

export const trojanNetworkTypeList = [
    'ws',
    'grpc',
]

export const ssMethodList = [
    '2022-blake3-aes-128-gcm',
    '2022-blake3-aes-256-gcm',
    '2022-blake3-chacha20-poly1305',
    'aes-128-gcm',
    'aes-256-gcm',
    // 'chacha20-poly1305',
    // 'xchacha20-poly1305',
    'chacha20-ietf-poly1305',
    'xchacha20-ietf-poly1305',
    'none',
]

export const headerTypeList = [
    'srtp',
    'utp',
    'wechat-video',
    'dtls',
    'wireguard',
    'none',
]
