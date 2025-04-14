import { useState, useEffect } from 'react'
import {
    Paper, Card, TextField, ToggleButtonGroup, ToggleButton,
    Stack, Button, Alert, Typography, Switch,
    BottomNavigation, BottomNavigationAction
} from '@mui/material'
import RouteIcon from '@mui/icons-material/Route'
import DnsIcon from '@mui/icons-material/Dns'
import SendIcon from '@mui/icons-material/Send'
import FlightIcon from '@mui/icons-material/Flight'
import BlockIcon from '@mui/icons-material/Block'
import SettingsIcon from '@mui/icons-material/Settings'

import { useChip } from "../component/useChip.tsx"
import { RuleAdvanced } from './RuleAdvanced.tsx'
import { readRayConfig, readRuleConfig, readRuleDomain, readRuleModeList, restartRay, saveRayConfig, saveRuleDomain } from "../util/invoke.ts"
import { useDebounce } from "../hook/useDebounce.ts"
import { DEFAULT_RULE_CONFIG, DEFAULT_RULE_DOMAIN, DEFAULT_RULE_MODE_LIST } from "../util/config.ts"
import { processDomain } from "../util/util.ts"
import { ruleToConf } from "../util/rule.ts"
import { updateProxyPAC } from "../util/proxy.ts"

const Rule: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => {
        setNavState(3)
    }, [setNavState])

    const [ruleMode, setRuleMode] = useState('route')
    const [ruleType, setRuleType] = useState(0)
    const [ruleConfig, setRuleConfig] = useState<RuleConfig>(DEFAULT_RULE_CONFIG)
    const [ruleDomain, setRuleDomain] = useState<RuleDomain>(DEFAULT_RULE_DOMAIN)
    useEffect(() => {
        (async () => {
            const newRuleConfig = await readRuleConfig() as RuleConfig
            if (newRuleConfig) setRuleConfig({...DEFAULT_RULE_CONFIG, ...newRuleConfig})

            const newRuleDomain = await readRuleDomain() as RuleDomain
            if (newRuleDomain) setRuleDomain({...DEFAULT_RULE_DOMAIN, ...newRuleDomain})
        })()
    }, [])

    const updateRayConfig = async (ruleConfig: RuleConfig, ruleDomain: RuleDomain) => {
        const rayConfig = await readRayConfig()
        if (rayConfig) {
            const ruleModeList = await readRuleModeList() || DEFAULT_RULE_MODE_LIST
            const routing = ruleToConf(ruleConfig, ruleDomain, ruleModeList)
            const conf = {...rayConfig, ...routing}
            const ok = await saveRayConfig(conf)
            if (ok) {
                restartRay()
            }
        }
    }

    const handleGlobalProxy = () => {
        setRuleConfig(prev => {
            const newRuleConfig = {...prev, globalProxy: !prev.globalProxy}
            updateRayConfig(newRuleConfig, ruleDomain).catch(_ => 0)
            return newRuleConfig
        })
    }

    const handleDomainChange = (type: keyof RuleDomain) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setRuleDomain(prev => ({...prev, [type]: e.target.value}))
    }

    const handleSaveRuleDomain = useDebounce(async () => {
        const newRuleDomain = {
            proxy: processDomain(ruleDomain.proxy, true),
            direct: processDomain(ruleDomain.direct, true),
            block: processDomain(ruleDomain.block, true),
        }
        setRuleDomain(newRuleDomain)
        const ok = await saveRuleDomain(newRuleDomain)
        if (!ok) {
            showChip('保存失败', 'error')
            return
        }

        await updateRayConfig(ruleConfig, newRuleDomain)
        await updateProxyPAC(newRuleDomain)
        showChip('设置成功', 'success')
    }, 50)

    const [open, setOpen] = useState(false)
    const handleOpenAdvanced = () => {
        setOpen(true)
    }

    const {ChipComponent, showChip} = useChip()
    return (<>
        <Paper elevation={5} sx={{p: 1, borderRadius: 2, height: 'calc(100vh - 20px)', overflow: 'visible'}}>
            <div className="flex-center p1">
                <ToggleButtonGroup exclusive value={ruleMode} onChange={(_, v) => v && setRuleMode(v)}>
                    <ToggleButton value="route"><RouteIcon sx={{mr: 1}}/>访问规则</ToggleButton>
                    <ToggleButton value="dns"><DnsIcon sx={{mr: 1}}/>DNS 规则</ToggleButton>
                </ToggleButtonGroup>
            </div>
            <Card sx={{p: 2, maxWidth: '800px', maxHeight: 'calc(100% - 56px)', m: 'auto', overflow: 'auto'}}>
                {ruleMode === 'route' && (<div className="flex-column gap2">
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
                                直接连接网络，不经过任何代理服务器，适合访问国内网站。比如访问百度、淘宝等。
                            </Alert>
                            <TextField
                                variant="outlined" fullWidth multiline rows={6}
                                label="请填写域名(每行一条)"
                                value={ruleDomain.direct}
                                onChange={handleDomainChange('direct')}
                                placeholder="例如：baidu.com"/>
                        </>) : ruleType === 2 && (<>
                            <Alert variant="filled" severity="error">
                                阻止访问某些网站或服务，适合屏蔽广告、恶意网站、病毒网站、钓鱼网站或不希望访问的内容。
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
                                <ChipComponent/>
                            </Stack>
                            <Button variant="contained" onClick={handleOpenAdvanced} startIcon={<SettingsIcon/>}>高级</Button>
                        </div>
                    </>)}
                </div>)}

                {ruleMode === 'dns' && (<>
                </>)}
            </Card>
        </Paper>
        <RuleAdvanced open={open} setOpen={setOpen} ruleConfig={ruleConfig} setRuleConfig={setRuleConfig} ruleDomain={ruleDomain}/>
    </>)
}

export default Rule
