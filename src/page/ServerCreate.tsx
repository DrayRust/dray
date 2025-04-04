import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
    rawHeaderTypeList,
    kcpHeaderTypeList,
    grpcModeList,
    alpnList,
    validateServerRow,
} from "../util/serverOption.ts"
import { formatPort, hashString } from "../util/util.ts"
import { readServerList, saveServerList } from "../util/invoke.ts"
import { useSnackbar } from "../component/useSnackbar.tsx"

const ServerCreate: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(1), [setNavState])

    const navigate = useNavigate()
    const [serverType, setServerType] = useState('vless')
    const [ps, setPs] = useState('')

    const [vmessForm, setVmessForm] = useState<VmessRow>({
        add: '', // 地址 address 如：IP / 域名
        port: 443, // 端口 port
        id: '', // 用户 ID (uuid)
        aid: "0", // 用户副 ID (alterId) 默认: "0"

        net: 'raw', // 网络传输方式 network
        scy: 'auto', // 安全类型 security = encryption

        host: '', // 伪装域名 host
        path: '', // 伪装路径 / 主机名 path
        type: 'none', // 伪装类型 headerType

        seed: '', // mKCP 种子
        mode: '', // gRPC 传输模式

        tls: false, // 是否启用 TLS
        alpn: 'h2, http/1.1', // TLS ALPN 协议
        fp: 'chrome', // TLS 伪装指纹 fingerprint
    })

    const [vlessForm, setVlessForm] = useState<VlessRow>({
        add: '', // 服务器地址
        port: 443, // 服务器端口
        id: '', // 用户ID

        net: 'raw', // 网络传输方式
        scy: 'none', // 安全类型

        host: '', // 伪装域名
        path: '', // 伪装路径
        sni: '', // (grpc / reality) 伪装主机名 Server Name Indication

        mode: '', // gRPC 传输模式
        extra: '', // XHTTP 额外参数 extra

        alpn: 'h2, http/1.1', // TLS ALPN 协议
        fp: 'chrome', // TLS 伪装指纹

        flow: 'xtls-rprx-vision', // XTLS 流控模式

        pbk: '', // REALITY 公钥
        sid: '', // REALITY shortId
        spx: '', // REALITY 伪装爬虫初始路径与参数
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

    const [psError, setPsError] = useState(false)
    const [addError, setAddError] = useState(false)
    const [portError, setPortError] = useState(false)
    const [idError, setIdError] = useState(false)
    const [pwdError, setPwdError] = useState(false)
    const handleServerTypeChange = (v: string) => {
        if (!v) return
        setServerType(v)
        setPsError(false)
        setAddError(false)
        setPortError(false)
        setIdError(false)
        setPwdError(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        if (name === 'add') {
            setAddError(!value.trim())
        } else if (name === 'port') {
            setPortError(!value.trim())
        } else if (name === 'id') {
            setIdError(!value.trim())
        } else if (name === 'pwd') {
            setPwdError(!value.trim())
        }
        setFormData(name, value)
    }
    const setFormData = (name: string, value: any) => {
        name = name.trim()
        if (typeof value === 'string') value = value.trim()
        // console.log('setFormData', name, value)
        if (name === 'port') value = formatPort(value)
        if (serverType === 'vmess') {
            setVmessForm({...vmessForm, [name]: value})
        } else if (serverType === 'vless') {
            setVlessForm({...vlessForm, [name]: value})
        } else if (serverType === 'ss') {
            setSsForm({...ssForm, [name]: value})
        } else if (serverType === 'trojan') {
            setTrojanForm({...trojanForm, [name]: value})
        }
    }

    const handleSubmit = async () => {
        if (psError || addError || portError || idError || pwdError) return

        let data: VmessRow | VlessRow | SsRow | TrojanRow | null = null
        if (serverType === 'vmess') {
            data = vmessForm
        } else if (serverType === 'vless') {
            data = vlessForm
        } else if (serverType === 'ss') {
            data = ssForm
        } else if (serverType === 'trojan') {
            data = trojanForm
        }
        if (!data) return

        const isValid = validateServerRow(data, ps, setPsError, setAddError, setPortError, setIdError, setPwdError)
        if (!isValid) return

        let serverList = await readServerList() || []
        const scy = "net" in data ? `${data.scy}+${data.net}` : data.scy
        serverList = [{
            ps: ps,
            type: serverType,
            host: `${data.add}:${data.port}`,
            scy: scy,
            hash: await hashString(JSON.stringify(data)),
            data
        }, ...serverList]
        const ok = await saveServerList(serverList)
        if (!ok) {
            showSnackbar('添加失败', 'error')
        } else {
            setTimeout(() => navigate(`/server`), 100)
        }
    }

    const {SnackbarComponent, showSnackbar} = useSnackbar(true)
    const {AppBarComponent} = useAppBar('/server', '添加')
    return <>
        <SnackbarComponent/>
        <AppBarComponent/>
        <Card sx={{p: 2, mt: 1}}>
            <Grid container spacing={2} sx={{maxWidth: 800, m: 'auto'}}>
                <Grid size={12}>
                    <ToggleButtonGroup
                        exclusive value={serverType} className="server-type"
                        onChange={(_, v: string) => handleServerTypeChange(v)}>
                        <ToggleButton value="vmess">Vmess</ToggleButton>
                        <ToggleButton value="vless">Vless</ToggleButton>
                        <ToggleButton value="ss">Shadowsocks</ToggleButton>
                        <ToggleButton value="trojan">Trojan</ToggleButton>
                    </ToggleButtonGroup>
                </Grid>
                <Grid size={12} sx={{mb: 2}}>
                    <TextField
                        fullWidth required size="small" label="服务器名称(postscript)"
                        value={ps}
                        error={psError} helperText={psError ? "服务器名称不能为空" : ""}
                        onChange={e => {
                            let v = e.target.value.trim()
                            setPsError(!v)
                            setPs(v)
                        }}/>
                </Grid>

                {serverType === 'vmess' ? (<>
                    <Grid size={{xs: 12, md: 8}}>
                        <TextField fullWidth size="small" label="IP/域名" name="add" value={vmessForm.add}
                                   error={addError} helperText={addError ? "服务器地址不能为空" : ""}
                                   onChange={handleChange}/>
                    </Grid>
                    <Grid size={{xs: 12, md: 4}}>
                        <TextField fullWidth size="small" label="端口(port)" name="port" value={vmessForm.port}
                                   error={portError} helperText={portError ? "端口号必须在1-65535之间" : ""}
                                   onChange={handleChange}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="用户 ID" name="id" value={vmessForm.id}
                                   error={idError} helperText={idError ? "用户ID不能为空" : ""}
                                   onChange={handleChange}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="额外 ID (alterId)" name="aid" value={vmessForm.aid} onChange={handleChange}/>
                    </Grid>

                    <Grid size={12} sx={{mt: 2}}>
                        <SelectField label="传输方式(network)" id="vmess-network" value={vmessForm.net} options={vmessNetworkTypeList}
                                     onChange={(value) => setFormData('net', value)}/>
                    </Grid>
                    <Grid size={12}>
                        <SelectField label="安全类型(security)" id="vmess-security" value={vmessForm.scy} options={vmessSecurityList}
                                     onChange={(value) => setFormData('scy', value)}/>
                    </Grid>

                    <Grid container spacing={2} size={12} sx={{mt: 2}}>
                        {vmessForm.net !== 'raw' && (<>
                            <Grid size={12}>
                                <TextField fullWidth size="small" label="伪装域名(host)" name="host" value={vmessForm.host} onChange={handleChange}/>
                            </Grid>
                            <Grid size={12}>
                                <TextField
                                    label={vmessForm.net === 'grpc' ? '伪装主机名(serviceName)' : '伪装路径(path)'}
                                    fullWidth size="small" name="path" value={vmessForm.path} onChange={handleChange}/>
                            </Grid>
                        </>)}

                        {['raw', 'kcp'].includes(vmessForm.net) && (
                            <Grid size={12}>
                                <SelectField
                                    label="伪装类型(headerType)" id="vmess-type" value={vmessForm.type}
                                    options={vmessForm.net === 'kcp' ? kcpHeaderTypeList : rawHeaderTypeList}
                                    onChange={(value) => setFormData('type', value)}/>
                            </Grid>
                        )}

                        {vmessForm.net === 'kcp' && (
                            <Grid size={12}>
                                <TextField fullWidth size="small" label="mKCP 种子(seed)" name="seed" value={vmessForm.seed} onChange={handleChange}/>
                            </Grid>
                        )}

                        {vmessForm.net === 'grpc' && (<>
                            <Grid size={12}>
                                <SelectField label="gRPC 传输模式(mode)" id="vmess-mode" value={vmessForm.mode} options={grpcModeList}
                                             onChange={(value) => setFormData('mode', value)}/>
                            </Grid>
                        </>)}
                    </Grid>

                    <Grid size={12} sx={{mt: 2}}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%'}}>
                            <Typography variant="body1" sx={{pl: 1}}>TLS 安全协议</Typography>
                            <Switch checked={vmessForm.tls} onChange={(e) => setFormData('tls', e.target.checked)}/>
                        </Stack>
                    </Grid>
                    {vmessForm.tls && (<>
                        <Grid size={12}>
                            <SelectField label="TLS ALPN 协议" id="vmess-alpn" value={vmessForm.alpn} options={alpnList}
                                         onChange={(value) => setFormData('alpn', value)}/>
                        </Grid>
                        <Grid size={12}>
                            <AutoCompleteField
                                label="TLS 伪装指纹(fingerprint)" id="vmess-fp" value={vmessForm.fp} options={fingerprintList}
                                onChange={(value) => setFormData('fp', value)}/>
                        </Grid>
                    </>)}
                </>) : serverType === 'vless' ? (<>
                    <Grid size={{xs: 12, md: 8}}>
                        <TextField fullWidth size="small" label="IP/域名" name="add" value={vlessForm.add}
                                   error={addError} helperText={addError ? "服务器地址不能为空" : ""}
                                   onChange={handleChange}/>
                    </Grid>
                    <Grid size={{xs: 12, md: 4}}>
                        <TextField fullWidth size="small" label="端口(port)" name="port" value={vlessForm.port}
                                   error={portError} helperText={portError ? "端口号必须在1-65535之间" : ""}
                                   onChange={handleChange}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="用户 ID" name="id" value={vlessForm.id}
                                   error={idError} helperText={idError ? "用户ID不能为空" : ""}
                                   onChange={handleChange}/>
                    </Grid>

                    <Grid size={12} sx={{mt: 2}}>
                        <SelectField label="传输方式(network)" id="vless-network" value={vlessForm.net} options={vlessNetworkTypeList}
                                     onChange={(value) => setFormData('net', value)}/>
                    </Grid>
                    <Grid size={12}>
                        <SelectField label="安全类型(security)" id="vless-security" value={vlessForm.scy} options={vlessSecurityList}
                                     onChange={(value) => setFormData('scy', value)}/>
                    </Grid>

                    {vlessForm.net !== 'raw' && (<>
                        <Grid size={12} sx={{mt: 2}}>
                            <TextField fullWidth size="small" label="伪装域名(host)" name="host" value={vlessForm.host} onChange={handleChange}/>
                        </Grid>
                        {(vlessForm.net === 'grpc' || vlessForm.scy === 'reality') ? (
                            <Grid size={12}>
                                <TextField fullWidth size="small" label="伪装主机名(serviceName)" name="sni" value={vlessForm.sni} onChange={handleChange}/>
                            </Grid>
                        ) : (
                            <Grid size={12}>
                                <TextField fullWidth size="small" label="伪装路径(path)" name="path" value={vlessForm.path} onChange={handleChange}/>
                            </Grid>
                        )}
                    </>)}

                    {vlessForm.net === 'grpc' && (<>
                        <Grid size={12} sx={{mt: 2}}>
                            <SelectField label="gRPC 传输模式(mode)" id="vless-mode" value={vlessForm.mode} options={grpcModeList}
                                         onChange={(value) => setFormData('mode', value)}/>
                        </Grid>
                    </>)}

                    {vlessForm.net === 'xhttp' && (<>
                        <Grid size={12} sx={{mt: 2}}>
                            <TextField fullWidth multiline minRows={2} size="small" label="XHTTP 额外参数(extra)" name="extra" value={vlessForm.extra} onChange={handleChange}/>
                        </Grid>
                    </>)}

                    {vlessForm.scy !== 'none' && (<>
                        <Grid size={12} sx={{mt: 2}}>
                            <SelectField label="TLS ALPN 协议" id="vless-alpn" value={vlessForm.alpn} options={alpnList}
                                         onChange={(value) => setFormData('alpn', value)}/>
                        </Grid>
                        <Grid size={12}>
                            <AutoCompleteField
                                label="TLS 伪装指纹(fingerprint)" id="vless-fp" value={vlessForm.fp} options={fingerprintList}
                                onChange={(value) => setFormData('fp', value)}/>
                        </Grid>
                        <Grid size={12}>
                            <SelectField label="XTLS 流控模式(flow)" id="vless-flow" value={vlessForm.flow} options={flowList}
                                         onChange={(value) => setFormData('flow', value)}/>
                        </Grid>
                    </>)}

                    {vlessForm.scy === 'reality' && (<>
                        <Grid size={12} sx={{mt: 2}}>
                            <TextField fullWidth size="small" label="公钥(public key)" name="pbk" value={vlessForm.pbk} onChange={handleChange}/>
                        </Grid>
                        <Grid size={12}>
                            <TextField fullWidth size="small" label="验证(shortId)" name="sid" value={vlessForm.sid} onChange={handleChange}/>
                        </Grid>
                        <Grid size={12}>
                            <TextField fullWidth size="small" label="伪装爬虫(spiderX)" name="spx" value={vlessForm.spx} onChange={handleChange}/>
                        </Grid>
                    </>)}
                </>) : serverType === 'ss' ? (<>
                    <Grid size={{xs: 12, md: 8}}>
                        <TextField fullWidth size="small" label="IP/域名(address)" name="add" value={ssForm.add}
                                   error={addError} helperText={addError ? "服务器地址不能为空" : ""}
                                   onChange={handleChange}/>
                    </Grid>
                    <Grid size={{xs: 12, md: 4}}>
                        <TextField fullWidth size="small" label="端口(port)" name="port" value={ssForm.port}
                                   error={portError} helperText={portError ? "端口号必须在1-65535之间" : ""}
                                   onChange={handleChange}/>
                    </Grid>
                    <Grid size={12}>
                        <PasswordInput
                            label="密码(password)" value={ssForm.pwd}
                            error={pwdError} helperText={pwdError ? "密码不能为空" : ""}
                            onChange={(value) => {
                                setPwdError(!value.trim())
                                setFormData('pwd', value)
                            }}/>
                    </Grid>
                    <Grid size={12}>
                        <AutoCompleteField
                            label="加密方式(method)" id="ss-method" value={ssForm.scy} options={ssMethodList}
                            onChange={(value) => setFormData('scy', value)}/>
                    </Grid>
                </>) : serverType === 'trojan' && (<>
                    <Grid size={{xs: 12, md: 8}}>
                        <TextField fullWidth size="small" label="IP/域名(address)" name="add" value={trojanForm.add}
                                   error={addError} helperText={addError ? "服务器地址不能为空" : ""}
                                   onChange={handleChange}/>
                    </Grid>
                    <Grid size={{xs: 12, md: 4}}>
                        <TextField fullWidth size="small" label="端口(port)" name="port" value={trojanForm.port}
                                   error={portError} helperText={portError ? "端口号必须在1-65535之间" : ""}
                                   onChange={handleChange}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="密码(password)" name="pwd" value={trojanForm.pwd}
                                   error={pwdError} helperText={pwdError ? "密码不能为空" : ""}
                                   onChange={handleChange}/>
                    </Grid>
                    <Grid size={12} sx={{mt: 2}}>
                        <SelectField label="传输方式(network)" id="trojan-network" value={trojanForm.net} options={trojanNetworkTypeList}
                                     onChange={(value) => setFormData('net', value)}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="伪装域名(host)" name="host" value={trojanForm.host} onChange={handleChange}/>
                    </Grid>
                    {trojanForm.net === 'ws' && (
                        <Grid size={12}>
                            <TextField fullWidth size="small" label="伪装路径(path)" name="path" value={trojanForm.path} onChange={handleChange}/>
                        </Grid>
                    )}
                    {trojanForm.net === 'grpc' && (
                        <Grid size={12}>
                            <TextField fullWidth size="small" label="伪装主机名(serviceName)" name="sni" value={trojanForm.sni} onChange={handleChange}/>
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
