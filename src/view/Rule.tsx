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

import { RuleAdvanced } from './RuleAdvanced.tsx'

const Rule: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => {
        setNavState(3)
    }, [setNavState])

    const [ruleMode, setRuleMode] = useState('route')
    const [ruleType, setRuleType] = useState(0)
    const [globalProxy, setGlobalProxy] = useState(false)

    const handleGlobalProxy = () => {
        setGlobalProxy(!globalProxy)
    }

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
            <Paper elevation={3} sx={{p: 2, maxWidth: '800px', m: 'auto', overflow: 'auto'}}>
                {ruleMode === 'route' && (<Stack spacing={2}>
                    <div className="flex-between">
                        <Typography variant="body1" sx={{pl: 1}}>全局代理</Typography>
                        <Switch checked={globalProxy} onChange={handleGlobalProxy}/>
                    </div>
                    {!globalProxy && (<>
                        <BottomNavigation
                            sx={{mb: 2}}
                            showLabels
                            component={Card}
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
                                variant="outlined" label="请输入域名" fullWidth multiline minRows={5} maxRows={20}
                                placeholder="每行一条，例如：google.com"/>
                            <TextField
                                variant="outlined" label="请输入IP" fullWidth multiline minRows={5} maxRows={20}
                                placeholder="每行一条，例如：123.123.123.123"/>
                        </>) : ruleType === 1 ? (<>
                            <Alert variant="filled" severity="success">
                                直接连接网络，不经过任何代理服务器，适合访问国内网站或不需要加速的场景。比如访问百度、淘宝等。
                            </Alert>
                            <TextField
                                variant="outlined" label="请输入域名" fullWidth multiline minRows={5} maxRows={20}
                                placeholder="每行一条，例如：baidu.com"/>
                            <TextField
                                variant="outlined" label="请输入IP" fullWidth multiline minRows={5} maxRows={20}
                                placeholder="每行一条，例如：123.123.123.123"/>
                        </>) : ruleType === 2 && (<>
                            <Alert variant="filled" severity="error">
                                阻止访问某些网站或服务，适合屏蔽广告、恶意网站或不希望访问的内容。
                            </Alert>
                            <TextField
                                variant="outlined" label="请输入域名" fullWidth multiline minRows={5} maxRows={20}
                                placeholder="每行一条，例如：360.cn"/>
                            <TextField
                                variant="outlined" label="请输入IP" fullWidth multiline minRows={5} maxRows={20}
                                placeholder="每行一条，例如：123.123.123.123"/>
                        </>)}
                        <div className="flex-between">
                            <Button variant="contained" color="info">确认</Button>
                            <Button variant="contained" onClick={handleOpenAdvanced} startIcon={<SettingsIcon/>}>高级</Button>
                        </div>
                    </>)}
                </Stack>)}

                {ruleMode === 'dns' && (<>
                </>)}
            </Paper>
        </Paper>
        <RuleAdvanced open={open} setOpen={setOpen}/>
    </>)
}

export default Rule
