import { useEffect } from 'react'

function vlessToXrayConfig(vlessUrl: string): any {
    const url = new URL(vlessUrl);
    const params = new URLSearchParams(url.search);

    const config = {
        inbounds: [],
        outbounds: [
            {
                protocol: "vless",
                settings: {
                    vnext: [
                        {
                            address: url.hostname,
                            port: parseInt(url.port, 10),
                            users: [
                                {
                                    id: url.username,
                                    encryption: params.get('encryption') || 'none',
                                    flow: params.get('flow') || ''
                                }
                            ]
                        }
                    ]
                },
                streamSettings: {
                    network: params.get('type') || 'tcp',
                    security: params.get('security') || 'none',
                    realitySettings: {
                        serverName: params.get('sni') || '',
                        publicKey: params.get('pbk') || '',
                        fingerprint: params.get('fp') || 'chrome'
                    }
                },
                tag: "proxy"
            }
        ]
    };

    return config;
}

// 示例用法
const vlessUrl = "vless://be36b6ae-438f-4b7f-a35a-a1ac0b4e91a9@123.123.123.123:15516?encryption=none&security=reality&flow=xtls-rprx-vision&type=tcp&sni=www.amazon.com&pbk=_uhqf3_WouggKQCHicEckxzONtjKIpCWs1L2rBYz9R4&fp=chrome#233boy-tcp-123.123.123.123";
const xrayConfig = vlessToXrayConfig(vlessUrl);
console.log(JSON.stringify(xrayConfig, null, 2));

const Server: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(1), [setNavState])

    return <div>Server Page</div>
}

export default Server
