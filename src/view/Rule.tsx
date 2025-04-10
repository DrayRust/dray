import { useState, useEffect } from 'react'
import {
    Paper, Card, TextField, ToggleButtonGroup, ToggleButton,
    Stack, Button, Alert, Typography, Switch, Chip,
    BottomNavigation, BottomNavigationAction
} from '@mui/material'
import RouteIcon from '@mui/icons-material/Route'
import DnsIcon from '@mui/icons-material/Dns'
import SendIcon from '@mui/icons-material/Send'
import FlightIcon from '@mui/icons-material/Flight'
import BlockIcon from '@mui/icons-material/Block'
import SettingsIcon from '@mui/icons-material/Settings'

import { RuleAdvanced } from './RuleAdvanced.tsx'
import { readRuleConfig, readRuleDomain, saveRuleDomain } from "../util/invoke.ts"
import { useDebounce } from "../hook/useDebounce.ts"

const Rule: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => {
        setNavState(3)
    }, [setNavState])

    const [ruleMode, setRuleMode] = useState('route')
    const [ruleType, setRuleType] = useState(0)
    const [ruleConfig, setRuleConfig] = useState<RuleConfig>({
        globalProxy: false,
        domainStrategy: 'AsIs',
        unmatchedStrategy: 'direct',
        mode: 0
    })
    const [ruleDomain, setRuleDomain] = useState<RuleDomain>({
        proxy: '',
        direct: '',
        block: ''
    })
    useEffect(() => {
        readRuleConfig().then((d) => {
            setRuleConfig(d as RuleConfig)
        }).catch(_ => 0)
        readRuleDomain().then((d) => {
            setRuleDomain(d as RuleDomain)
        }).catch(_ => 0)
    }, [])

    const handleGlobalProxy = () => {
        setRuleConfig(prev => ({...prev, globalProxy: !prev.globalProxy}))
    }

    const handleDomainChange = (type: keyof RuleDomain) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setRuleDomain(prev => ({...prev, [type]: e.target.value}))
    }

    const [showSuccess, setShowSuccess] = useState(false)
    const handleSaveRuleDomain = useDebounce(() => {
        const newRuleDomain = {
            proxy: ruleDomain.proxy.trim(),
            direct: ruleDomain.direct.trim(),
            block: ruleDomain.block.trim()
        }
        setRuleDomain(newRuleDomain)
        saveRuleDomain(newRuleDomain).then(() => {
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 1000)
        }).catch(_ => 0)
    }, 300)

    const [open, setOpen] = useState(false)
    const handleOpenAdvanced = () => {
        setOpen(true)
    }

    return (<>
        <Paper elevation={5} sx={{p: 1, borderRadius: 2, height: 'calc(100vh - 20px)', overflow: 'visible'}}>
            <div className="flex-center p1">
                <ToggleButtonGroup exclusive value={ruleMode} onChange={(_, v) => v && setRuleMode(v)}>
                    <ToggleButton value="route"><RouteIcon sx={{mr: 1}}/>访问规则</ToggleButton>
                    <ToggleButton value="dns"><DnsIcon sx={{mr: 1}}/>DNS 规则</ToggleButton>
                </ToggleButtonGroup>
            </div>
            <Card sx={{p: 2, maxWidth: '800px', maxHeight: 'calc(100% - 56px)', m: 'auto', overflow: 'auto'}}>
                {ruleMode === 'route' && (<Stack spacing={2}>
                    <div className="flex-between">
                        <Typography variant="body1" sx={{pl: 1}}>全局代理</Typography>
                        <Switch checked={ruleConfig.globalProxy} onChange={handleGlobalProxy}/>
                    </div>
                    {!ruleConfig.globalProxy && (<>
                        <BottomNavigation
                            sx={{mb: 2}}
                            showLabels
                            component={Paper}
                            elevation={5}
                            value={ruleType}
                            onChange={(_, v) => setRuleType(v)}>
                            <BottomNavigationAction label="代理" icon={<SendIcon/>}/>
                            <BottomNavigationAction label="直连" icon={<FlightIcon/>}/>
                            <BottomNavigationAction label="阻止" icon={<BlockIcon/>}/>
                        </BottomNavigation>

                        {ruleType === 0 ? (<>
                            <Alert variant="filled" severity="warning">
                                通过第三方服务器访问网络，适合访问国外网站或需要隐藏真实 IP 的场景。比如访问 Google、YouTube 等。
                            </Alert>
                            <TextField
                                variant="outlined" fullWidth multiline rows={6}
                                label="请填写域名(每行一条)"
                                value={ruleDomain.proxy}
                                onChange={handleDomainChange('proxy')}
                                placeholder="例如：google.com"/>
                        </>) : ruleType === 1 ? (<>
                            <Alert variant="filled" severity="success">
                                直接连接网络，不经过任何代理服务器，适合访问国内网站或不需要加速的场景。比如访问百度、淘宝等。
                            </Alert>
                            <TextField
                                variant="outlined" fullWidth multiline rows={6}
                                label="请填写域名(每行一条)"
                                value={ruleDomain.direct}
                                onChange={handleDomainChange('direct')}
                                placeholder="例如：baidu.com"/>
                        </>) : ruleType === 2 && (<>
                            <Alert variant="filled" severity="error">
                                阻止访问某些网站或服务，适合屏蔽广告、恶意网站或不希望访问的内容。
                            </Alert>
                            <TextField
                                variant="outlined" fullWidth multiline rows={6}
                                label="请填写域名(每行一条)"
                                value={ruleDomain.block}
                                onChange={handleDomainChange('block')}
                                placeholder="例如：360.cn"/>
                        </>)}

                        <div className="flex-between">
                            <Stack direction="row" spacing={2} sx={{justifyContent: "flex-start", alignItems: "center"}}>
                                <Button variant="contained" color="info" onClick={handleSaveRuleDomain}>确认</Button>
                                {showSuccess && <Chip label="保存成功" color="success" size="small"/>}
                            </Stack>
                            <Button variant="contained" onClick={handleOpenAdvanced} startIcon={<SettingsIcon/>}>高级</Button>
                        </div>
                    </>)}
                </Stack>)}

                {ruleMode === 'dns' && (<>
                </>)}
            </Card>
        </Paper>
        <RuleAdvanced open={open} setOpen={setOpen} ruleConfig={ruleConfig} setRuleConfig={setRuleConfig}/>
    </>)
}

export default Rule
