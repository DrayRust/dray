import { useEffect, useState } from 'react'
import {
    ToggleButtonGroup, ToggleButton, Stack, Switch, Typography,
    Card, TextField, Button, Grid
} from '@mui/material'

import { useAppBar } from "../component/useAppBar.tsx"
import { PasswordInput } from '../component/PasswordInput.tsx'
import { SelectField } from '../component/SelectField.tsx'
import { AutoCompleteField } from '../component/AutoCompleteField.tsx'
import {
    vlessNetworkTypeList,
    vlessSecurityList,
    vmessNetworkTypeList,
    vmessSecurityList,
    ssMethodList,
    trojanNetworkTypeList,
    fingerprintList,
    flowList,
    tcpHeaderTypeList,
    kcpHeaderTypeList, grpcModeList,
} from "../util/data.ts"

const ServerCreate: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(1), [setNavState])

    const [serverType, setServerType] = useState('vless')

    const [vmessForm, setVmessForm] = useState<VmessRow>({
        add: '', // 地址 address 如：IP / 域名
        port: 443, // 端口 port
        id: '', // 用户 ID (uuid)
        aid: "0", // 用户副 ID (alterId) 默认: "0"

        net: 'tcp', // 网络传输方式 network
        scy: 'auto', // 安全类型 security = encryption

        tls: false, // 是否启用 TLS
        fp: '', // TLS 伪装指纹 fingerprint
        alpn: '', // TLS ALPN

        host: '', // 伪装域名 host
        path: '', // 路径 path

        type: 'none', // 伪装类型 headerType

        mode: '', // gRPC 传输模式
        seed: '', // mKCP 种子
    })

    const [vlessForm, setVlessForm] = useState<VlessRow>({
        add: '', // 服务器地址
        port: 443, // 服务器端口
        id: '', // 用户ID

        net: 'tcp', // 网络传输方式
        scy: 'none', // 安全类型

        host: '', // 伪装域名
        path: '', // 路径
        sni: '', // (grpc / reality) 主机名 Server Name Indication

        mode: '', // gRPC 传输模式
        extra: '', // XHTTP 额外参数 extra

        fp: '', // TLS 伪装指纹
        flow: 'xtls-rprx-vision', // XTLS 流控模式

        pbk: '', // REALITY 公钥
        sid: '', // REALITY shortId
        spx: '', // REALITY 爬虫初始路径与参数
    })

    const [ssForm, setSsForm] = useState<SsRow>({
        add: '', // 服务器地址
        port: 443, // 服务器端口
        pwd: '', // 密码
        scy: '2022-blake3-aes-256-gcm', // 加密方式
    })

    const [trojanForm, setTrojanForm] = useState<TrojanRow>({
        add: '', // 服务器地址
        port: 443, // 服务器端口
        pwd: '', // 密码
        net: 'ws', // 传输方式
        scy: 'tls', // 安全类型
        host: '', // 伪装域名
        path: '', // (ws) 路径
        sni: '', // (grpc) 主机名
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(e.target.name, e.target.value)
    }
    const setFormData = (name: string, value: any) => {
        name = name.trim()
        if (typeof value === 'string') value = value.trim()
        console.log('setFormData', name, value)
        if (name === 'port') {
            value = Number(value)
            value = value < 0 ? 0 : value
            value = value > 65535 ? 65535 : value
            value = value || ''
        }
        if (name === 'aid') value = Number(value) || 0
        if (serverType === 'vless') {
            setVlessForm({...vlessForm, [name]: value})
        } else if (serverType === 'vmess') {
            setVmessForm({...vmessForm, [name]: value})
        } else if (serverType === 'ss') {
            setSsForm({...ssForm, [name]: value})
        } else if (serverType === 'trojan') {
            setTrojanForm({...trojanForm, [name]: value})
        }
    }

    const handleSubmit = () => {

    }

    const {AppBarComponent} = useAppBar('/server', '添加')
    return <>
        <AppBarComponent/>
        <Card sx={{p: 2, mt: 1}}>
            <Grid container spacing={2} sx={{maxWidth: 800, m: 'auto'}}>
                <Grid size={12}>
                    <ToggleButtonGroup exclusive value={serverType} className="server-type"
                                       onChange={(_: any, v: string) => v && setServerType(v)}>
                        <ToggleButton value="vmess">Vmess</ToggleButton>
                        <ToggleButton value="vless">Vless</ToggleButton>
                        <ToggleButton value="ss">Shadowsocks</ToggleButton>
                        <ToggleButton value="trojan">Trojan</ToggleButton>
                    </ToggleButtonGroup>
                </Grid>
                <Grid size={12} sx={{mb: 2}}>
                    <TextField fullWidth size="small" label="服务器名称(postscript)" name="ps" onChange={handleChange}/>
                </Grid>

                {serverType === 'vmess' ? (<>
                    <Grid size={{xs: 12, md: 8}}>
                        <TextField fullWidth size="small" label="IP/域名" name="add" value={vmessForm.add} onChange={handleChange}/>
                    </Grid>
                    <Grid size={{xs: 12, md: 4}}>
                        <TextField fullWidth size="small" label="端口(port)" name="port" value={vmessForm.port} onChange={handleChange}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="用户 ID" name="id" value={vmessForm.id} onChange={handleChange}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="额外 ID (alterId)" name="aid" value={vmessForm.aid} onChange={handleChange}/>
                    </Grid>

                    <Grid size={12} sx={{mt: 3}}>
                        <SelectField label="传输方式(network)" id="vmess-network" value={vmessForm.net} options={vmessNetworkTypeList}
                                     onChange={(value) => setFormData('net', value)}/>
                    </Grid>
                    <Grid size={12}>
                        <SelectField label="安全类型(security)" id="vmess-security" value={vmessForm.scy} options={vmessSecurityList}
                                     onChange={(value) => setFormData('scy', value)}/>
                    </Grid>

                    <Grid size={12} sx={{mt: 3}}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%'}}>
                            <Typography variant="body1" sx={{pl: 1}}>TLS 安全协议</Typography>
                            <Switch checked={vmessForm.tls} onChange={(e) => setFormData('tls', e.target.checked)}/>
                        </Stack>
                    </Grid>
                    {vmessForm.tls && (<>
                        <Grid size={12}>
                            <AutoCompleteField
                                label="伪装指纹(fingerprint)" id="vmess-fp" value={vmessForm.fp} options={fingerprintList}
                                onChange={(value) => setFormData('fp', value)}/>
                        </Grid>
                        <Grid size={12}>
                            <TextField fullWidth size="small" label="ALPN 协议" name="alpn" value={vmessForm.alpn} onChange={handleChange}/>
                        </Grid>
                    </>)}

                    {vmessForm.net !== 'tcp' && (<>
                        <Grid size={12} sx={{mt: 3}}>
                            <TextField fullWidth size="small" label="伪装域名(host)" name="host" value={vmessForm.host} onChange={handleChange}/>
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                label={vmessForm.net === 'grpc' ? '主机名(serviceName)' : '路径(path)'}
                                fullWidth size="small" name="path" value={vmessForm.path} onChange={handleChange}/>
                        </Grid>
                    </>)}

                    {['tcp', 'kcp'].includes(vmessForm.net) && (
                        <Grid size={12}>
                            <SelectField
                                label="伪装类型(headerType)" id="vmess-type" value={vmessForm.type}
                                options={vmessForm.net === 'kcp' ? kcpHeaderTypeList : tcpHeaderTypeList}
                                onChange={(value) => setFormData('type', value)}/>
                        </Grid>
                    )}

                    {vmessForm.net === 'grpc' && (<>
                        <Grid size={12}>
                            <SelectField label="gRPC 传输模式(mode)" id="vmess-mode" value={vmessForm.mode} options={grpcModeList}
                                         onChange={(value) => setFormData('mode', value)}/>
                        </Grid>
                    </>)}

                    {vmessForm.net === 'kcp' && (
                        <Grid size={12}>
                            <TextField fullWidth size="small" label="mKCP 种子(seed)" name="seed" value={vmessForm.seed} onChange={handleChange}/>
                        </Grid>
                    )}
                </>) : serverType === 'vless' ? (<>
                    <Grid size={{xs: 12, md: 8}}>
                        <TextField fullWidth size="small" label="IP/域名" name="add" value={vlessForm.add} onChange={handleChange}/>
                    </Grid>
                    <Grid size={{xs: 12, md: 4}}>
                        <TextField fullWidth size="small" label="端口(port)" name="port" value={vlessForm.port} onChange={handleChange}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="用户 ID" name="id" value={vlessForm.id} onChange={handleChange}/>
                    </Grid>

                    <Grid size={12} sx={{mt: 3}}>
                        <SelectField label="传输方式(network)" id="vless-network" value={vlessForm.net} options={vlessNetworkTypeList}
                                     onChange={(value) => setFormData('net', value)}/>
                    </Grid>
                    <Grid size={12}>
                        <SelectField label="安全类型(security)" id="vless-security" value={vlessForm.scy} options={vlessSecurityList}
                                     onChange={(value) => setFormData('scy', value)}/>
                    </Grid>

                    {vlessForm.net !== 'tcp' && (<>
                        <Grid size={12}>
                            <TextField fullWidth size="small" label="伪装域名(host)" name="host" value={vlessForm.host} onChange={handleChange}/>
                        </Grid>
                        {(vlessForm.net === 'grpc' || vlessForm.scy === 'reality') ? (
                            <Grid size={12}>
                                <TextField fullWidth size="small" label="主机名(serviceName)" name="sni" value={vlessForm.sni} onChange={handleChange}/>
                            </Grid>
                        ) : (
                            <Grid size={12}>
                                <TextField fullWidth size="small" label="路径(path)" name="path" value={vlessForm.path} onChange={handleChange}/>
                            </Grid>
                        )}
                    </>)}

                    {vlessForm.net === 'grpc' && (<>
                        <Grid size={12}>
                            <SelectField label="传输模式(mode)" id="vless-mode" value={vlessForm.mode} options={grpcModeList}
                                         onChange={(value) => setFormData('mode', value)}/>
                        </Grid>
                    </>)}

                    {vlessForm.net === 'xhttp' && (<>
                        <Grid size={12}>
                            <TextField fullWidth size="small" label="额外参数(extra)" name="extra" value={vlessForm.extra} onChange={handleChange}/>
                        </Grid>
                    </>)}

                    {vlessForm.net !== 'tcp' && (<>
                        <Grid size={12} sx={{mt: 3}}>
                            <AutoCompleteField
                                label="伪装指纹(fingerprint)" id="vless-fp" value={vlessForm.fp} options={fingerprintList}
                                onChange={(value) => setFormData('fp', value)}/>
                        </Grid>
                        <Grid size={12}>
                            <SelectField label="流控(flow)" id="vless-flow" value={vlessForm.flow} options={flowList}
                                         onChange={(value) => setFormData('flow', value)}/>
                        </Grid>
                    </>)}

                    {vlessForm.scy === 'reality' && (<>
                        <Grid size={12}>
                            <TextField fullWidth size="small" label="公钥(public key)" name="pbk" value={vlessForm.pbk} onChange={handleChange}/>
                        </Grid>
                        <Grid size={12}>
                            <TextField fullWidth size="small" label="验证(shortId)" name="sid" value={vlessForm.sid} onChange={handleChange}/>
                        </Grid>
                        <Grid size={12}>
                            <TextField fullWidth size="small" label="爬虫(spiderX)" name="spx" value={vlessForm.spx} onChange={handleChange}/>
                        </Grid>
                    </>)}
                </>) : serverType === 'ss' ? (<>
                    <Grid size={{xs: 12, md: 8}}>
                        <TextField fullWidth size="small" label="IP/域名(address)" name="add" value={ssForm.add} onChange={handleChange}/>
                    </Grid>
                    <Grid size={{xs: 12, md: 4}}>
                        <TextField fullWidth size="small" label="端口(port)" name="port" value={ssForm.port} onChange={handleChange}/>
                    </Grid>
                    <Grid size={12}>
                        <PasswordInput label="密码(password)" value={ssForm.pwd} onChange={(value) => setFormData('pwd', value)}/>
                    </Grid>
                    <Grid size={12}>
                        <AutoCompleteField
                            label="加密方式(method)" id="ss-method" value={ssForm.scy} options={ssMethodList}
                            onChange={(value) => setFormData('scy', value)}/>
                    </Grid>
                </>) : serverType === 'trojan' && (<>
                    <Grid size={{xs: 12, md: 8}}>
                        <TextField fullWidth size="small" label="IP/域名(address)" name="add" value={trojanForm.add} onChange={handleChange}/>
                    </Grid>
                    <Grid size={{xs: 12, md: 4}}>
                        <TextField fullWidth size="small" label="端口(port)" name="port" value={trojanForm.port} onChange={handleChange}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="密码(password)" name="pwd" value={trojanForm.pwd} onChange={handleChange}/>
                    </Grid>
                    <Grid size={12} sx={{mt: 3}}>
                        <SelectField label="传输方式(network)" id="trojan-network" value={trojanForm.net} options={trojanNetworkTypeList}
                                     onChange={(value) => setFormData('net', value)}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="伪装域名(host)" name="host" value={trojanForm.host} onChange={handleChange}/>
                    </Grid>
                    {trojanForm.net === 'ws' && (
                        <Grid size={12}>
                            <TextField fullWidth size="small" label="路径(path)" name="path" value={trojanForm.path} onChange={handleChange}/>
                        </Grid>
                    )}
                    {trojanForm.net === 'grpc' && (
                        <Grid size={12}>
                            <TextField fullWidth size="small" label="主机名(serviceName)" name="sni" value={trojanForm.sni} onChange={handleChange}/>
                        </Grid>
                    )}
                </>)}

                <Grid size={12} sx={{mt: 2}}>
                    <Button variant="contained" fullWidth onClick={handleSubmit}>添加服务器</Button>
                </Grid>
            </Grid>
        </Card>
    </>
}

export default ServerCreate
