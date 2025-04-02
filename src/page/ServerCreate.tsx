import { useEffect, useState } from 'react'
import {
    Autocomplete, ToggleButtonGroup, ToggleButton, MenuItem,
    FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton,
    Card, TextField, Button, Grid
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'

import { useAppBar } from "../component/useAppBar.tsx"
import { ssMethodList, trojanNetworkTypeList } from "../util/data.ts"

const ServerCreate: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(1), [setNavState])

    const [serverType, setServerType] = useState('vless')
    const [showPassword, setShowPassword] = useState(false)

    const [vlessForm, setVlessForm] = useState<VlessRow>({
        add: '', // 地址
        port: 0, // 端口
        id: '', // UUID
        flow: 'xtls-rprx-vision', // 流控
        scy: 'none', // 加密方式
        encryption: '', // 加密
        type: 'none', // 类型
        host: '', // 主机
        path: '', // 路径
        net: 'tcp', // 网络类型
        fp: 'chrome', // 指纹
        pbk: '', // reality public key
        sid: '', // reality shortId
        sni: '', // SNI
        serviceName: '', // 服务名称
        headerType: '', // 头部类型
        seed: '', // 种子
        mode: 'websocket' // 模式
    })

    const [vmessForm, setVmessForm] = useState<VmessRow>({
        add: '', // 服务器地址
        port: 0, // 服务器端口
        id: '', // 用户ID
        aid: 0, // 额外ID
        scy: 'auto', // 加密方式
        alpn: '', // ALPN 协议
        sni: '', // SNI 域名
        net: 'tcp', // 传输协议
        host: '', // 伪装域名
        path: '', // 路径
        tls: '', // TLS 配置
        fp: 'chrome', // 指纹
        type: 'none', // 类型
        seed: '', // 种子
        mode: 'websocket' // 模式
    })

    const [ssForm, setSsForm] = useState<SsRow>({
        add: '', // 服务器地址
        port: 433, // 服务器端口
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
        value = value.trim()
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
                        <ToggleButton value="vless">Vless</ToggleButton>
                        <ToggleButton value="vmess">Vmess</ToggleButton>
                        <ToggleButton value="ss">Shadowsocks</ToggleButton>
                        <ToggleButton value="trojan">Trojan</ToggleButton>
                    </ToggleButtonGroup>
                </Grid>
                <Grid size={12}>
                    <TextField fullWidth size="small" label="服务器名称(postscript)" name="ps" onChange={handleChange}/>
                </Grid>

                {serverType === 'vless' ? (<>
                    <Grid size={{xs: 12, md: 8}}>
                        <TextField fullWidth size="small" label="IP/域名" name="add" value={vlessForm.add} onChange={(e) => setVlessForm({...vlessForm, add: e.target.value})}/>
                    </Grid>
                    <Grid size={{xs: 12, md: 4}}>
                        <TextField fullWidth size="small" label="端口" name="port" value={vlessForm.port}
                                   onChange={(e) => setVlessForm({...vlessForm, port: Number(e.target.value)})}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="UUID" name="id" value={vlessForm.id} onChange={(e) => setVlessForm({...vlessForm, id: e.target.value})}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="加密方式" name="scy" value={vlessForm.scy} onChange={(e) => setVlessForm({...vlessForm, scy: e.target.value})}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="流控" name="flow" value={vlessForm.flow} onChange={(e) => setVlessForm({...vlessForm, flow: e.target.value})}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="网络类型" name="net" value={vlessForm.net} onChange={(e) => setVlessForm({...vlessForm, net: e.target.value})}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="指纹" name="fp" value={vlessForm.fp} onChange={(e) => setVlessForm({...vlessForm, fp: e.target.value})}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="SNI" name="sni" value={vlessForm.sni} onChange={(e) => setVlessForm({...vlessForm, sni: e.target.value})}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="服务名称" name="serviceName" value={vlessForm.serviceName}
                                   onChange={(e) => setVlessForm({...vlessForm, serviceName: e.target.value})}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="头部类型" name="headerType" value={vlessForm.headerType}
                                   onChange={(e) => setVlessForm({...vlessForm, headerType: e.target.value})}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="种子" name="seed" value={vlessForm.seed} onChange={(e) => setVlessForm({...vlessForm, seed: e.target.value})}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="模式" name="mode" value={vlessForm.mode} onChange={(e) => setVlessForm({...vlessForm, mode: e.target.value})}/>
                    </Grid>
                </>) : serverType === 'vmess' ? (<>
                    <Grid size={{xs: 12, md: 8}}>
                        <TextField fullWidth size="small" label="IP/域名" name="add" value={vmessForm.add} onChange={(e) => setVmessForm({...vmessForm, add: e.target.value})}/>
                    </Grid>
                    <Grid size={{xs: 12, md: 4}}>
                        <TextField fullWidth size="small" label="端口" name="port" value={vmessForm.port}
                                   onChange={(e) => setVmessForm({...vmessForm, port: Number(e.target.value)})}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="用户ID" name="id" value={vmessForm.id} onChange={(e) => setVmessForm({...vmessForm, id: e.target.value})}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="加密方式" name="scy" value={vmessForm.scy} onChange={(e) => setVmessForm({...vmessForm, scy: e.target.value})}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="额外ID" name="aid" value={vmessForm.aid}
                                   onChange={(e) => setVmessForm({...vmessForm, aid: Number(e.target.value)})}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="传输协议" name="net" value={vmessForm.net} onChange={(e) => setVmessForm({...vmessForm, net: e.target.value})}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="伪装域名" name="host" value={vmessForm.host} onChange={(e) => setVmessForm({...vmessForm, host: e.target.value})}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="路径" name="path" value={vmessForm.path} onChange={(e) => setVmessForm({...vmessForm, path: e.target.value})}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="TLS 配置" name="tls" value={vmessForm.tls} onChange={(e) => setVmessForm({...vmessForm, tls: e.target.value})}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="指纹" name="fp" value={vmessForm.fp} onChange={(e) => setVmessForm({...vmessForm, fp: e.target.value})}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="类型" name="type" value={vmessForm.type} onChange={(e) => setVmessForm({...vmessForm, type: e.target.value})}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="种子" name="seed" value={vmessForm.seed} onChange={(e) => setVmessForm({...vmessForm, seed: e.target.value})}/>
                    </Grid>
                    <Grid size={12}>
                        <TextField fullWidth size="small" label="模式" name="mode" value={vmessForm.mode} onChange={(e) => setVmessForm({...vmessForm, mode: e.target.value})}/>
                    </Grid>
                </>) : serverType === 'ss' ? (<>
                    <Grid size={{xs: 12, md: 8}}>
                        <TextField fullWidth size="small" label="IP/域名(address)" name="add" value={ssForm.add} onChange={handleChange}/>
                    </Grid>
                    <Grid size={{xs: 12, md: 4}}>
                        <TextField fullWidth size="small" label="端口(port)" name="port" value={ssForm.port} onChange={handleChange}/>
                    </Grid>
                    <Grid size={12}>
                        <FormControl fullWidth size="small" variant="outlined">
                            <InputLabel>密码(password)</InputLabel>
                            <OutlinedInput
                                label="密码(password)"
                                type={showPassword ? 'text' : 'password'}
                                name="pwd"
                                value={ssForm.pwd}
                                onChange={handleChange}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label={showPassword ? 'hide the password' : 'show the password'}
                                            onClick={() => setShowPassword((show) => !show)}
                                            onMouseDown={(e) => e.preventDefault()}
                                            onMouseUp={(e) => e.preventDefault()}
                                            edge="end">
                                            {showPassword ? <VisibilityOff/> : <Visibility/>}
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                        </FormControl>
                    </Grid>
                    <Grid size={12}>
                        <Autocomplete
                            id="ss-method" size="small" fullWidth freeSolo
                            value={ssForm.scy} onChange={(_, v) => setFormData('scy', v)}
                            options={ssMethodList.map((v) => v)}
                            renderInput={(params) => (
                                <TextField label="加密方式(method)" {...params}/>
                            )}/>
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
                    <Grid size={12}>
                        <TextField
                            select fullWidth size="small" label="传输方式(network)"
                            id="trojan-network"
                            name="net" value={trojanForm.net}
                            onChange={handleChange}>
                            {trojanNetworkTypeList.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                        </TextField>
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
                            <TextField fullWidth size="small" label="服务名称(serviceName)" name="sni" value={trojanForm.sni} onChange={handleChange}/>
                        </Grid>
                    )}
                </>)}

                <Grid size={12}>
                    <Button variant="contained" fullWidth onClick={handleSubmit}>添加</Button>
                </Grid>
            </Grid>
        </Card>
    </>
}

export default ServerCreate
