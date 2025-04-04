import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToggleButtonGroup, ToggleButton, Card, TextField, Button, Grid } from '@mui/material'

import { useAppBar } from "../component/useAppBar.tsx"
import { hashString } from "../util/util.ts"
import { validateServerField, validateServerRow } from "../util/validate.ts"
import { readServerList, saveServerList } from "../util/invoke.ts"
import { useSnackbar } from "../component/useSnackbar.tsx"
import { VmessForm } from '../server/VmessForm.tsx'
import { VlessForm } from '../server/VlessForm.tsx'
import { SsForm } from '../server/SsForm.tsx'
import { TrojanForm } from '../server/TrojanForm.tsx'

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
    const [idNotUUID, setIdNotUUID] = useState(false)
    const [pwdError, setPwdError] = useState(false)

    const handleServerTypeChange = (v: string) => {
        if (!v) return
        setServerType(v)
        setPsError(false)
        setAddError(false)
        setPortError(false)
        setIdError(false)
        setIdNotUUID(false)
        setPwdError(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(e.target.name, e.target.value)
    }

    const setFormData = (name: string, value: any) => {
        name = name.trim()
        if (typeof value === 'string') value = value.trim()
        // console.log('setFormData', name, value)

        value = validateServerField(name, value, setAddError, setPortError, setIdError, setIdNotUUID, setPwdError)
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

                {serverType === 'vmess' ? (
                    <VmessForm
                        form={vmessForm}
                        errors={{addError, portError, idError, idNotUUID}}
                        handleChange={handleChange}
                        setFormData={setFormData}
                    />
                ) : serverType === 'vless' ? (
                    <VlessForm
                        form={vlessForm}
                        errors={{addError, portError, idError, idNotUUID}}
                        handleChange={handleChange}
                        setFormData={setFormData}
                    />
                ) : serverType === 'ss' ? (
                    <SsForm
                        form={ssForm}
                        errors={{addError, portError, pwdError}}
                        handleChange={handleChange}
                        setFormData={setFormData}
                    />
                ) : serverType === 'trojan' && (
                    <TrojanForm
                        form={trojanForm}
                        errors={{addError, portError, pwdError}}
                        handleChange={handleChange}
                        setFormData={setFormData}
                    />
                )}

                <Grid size={12} sx={{mt: 2}}>
                    <Button variant="contained" fullWidth onClick={handleSubmit}>添加服务器</Button>
                </Grid>
            </Grid>
        </Card>
    </>
}

export default ServerCreate
