import { useState, useEffect } from 'react'
import {
    Paper, Card, TextField, ToggleButtonGroup, ToggleButton,
    Stack, Box, Button, Alert, Typography, Switch, MenuItem,
    BottomNavigation, BottomNavigationAction
} from '@mui/material'
import RouteIcon from '@mui/icons-material/Route'
import DnsIcon from '@mui/icons-material/Dns'
import SendIcon from '@mui/icons-material/Send'
import FlightIcon from '@mui/icons-material/Flight'
import BlockIcon from '@mui/icons-material/Block'

const Rule: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => {
        setNavState(3)
    }, [setNavState])

    const [ruleMode, setRuleMode] = useState('route')
    const [ruleType, setRuleType] = useState(0)
    const [globalProxy, setGlobalProxy] = useState(false)
    const [domainStrategy, setDomainStrategy] = useState('IPIfNonMatch')

    const handleGlobalProxy = () => {
        setGlobalProxy(!globalProxy)
    }

    const handleDomainStrategy = (e: any) => {
        setDomainStrategy(e.target.value)
    }

    return (
        <Paper elevation={5} sx={{p: 1, borderRadius: 2, height: 'calc(100vh - 20px)', overflow: 'visible'}}>
            <div className="flex-center">
                <ToggleButtonGroup exclusive value={ruleMode} onChange={(_, v) => v && setRuleMode(v)}>
                    <ToggleButton value="route"><RouteIcon sx={{mr: 1}}/>访问规则</ToggleButton>
                    <ToggleButton value="dns"><DnsIcon sx={{mr: 1}}/>DNS 规则</ToggleButton>
                </ToggleButtonGroup>
            </div>
            <Paper elevation={3} sx={{p: 2, maxWidth: '800px', m: 'auto', overflow: 'auto'}}>
                {ruleMode === 'route' && (<>
                    <div className="flex-between">
                        <Typography variant="body1" sx={{pl: 1}}>全局代理</Typography>
                        <Switch checked={globalProxy} onChange={handleGlobalProxy}/>
                    </div>
                    <div className="flex-between p1">
                        <TextField
                            select fullWidth size="small"
                            label="域名匹配策略"
                            value={domainStrategy}
                            onChange={handleDomainStrategy}>
                            <MenuItem value="AsIs">仅使用域名匹配</MenuItem>
                            <MenuItem value="IPIfNonMatch">优先域名匹配，IP次选</MenuItem>
                            <MenuItem value="IPOnDemand">优先解析IP匹配，域名次选</MenuItem>
                        </TextField>
                    </div>
                    {!globalProxy && (<>
                        <BottomNavigation
                            sx={{mb: 2, mt: 1}}
                            component={Card}
                            showLabels value={ruleType}
                            onChange={(_, v) => setRuleType(v)}>
                            <BottomNavigationAction label="代理" icon={<SendIcon/>}/>
                            <BottomNavigationAction label="直连" icon={<FlightIcon/>}/>
                            <BottomNavigationAction label="阻止" icon={<BlockIcon/>}/>
                        </BottomNavigation>
                        {ruleType === 0 ? (
                            <Stack spacing={2}>
                                <Alert variant="filled" severity="warning">
                                    通过第三方服务器访问网络，适合访问国外网站或需要隐藏真实 IP 的场景。比如访问 Google、YouTube 等。
                                </Alert>
                                <TextField
                                    variant="outlined" label="请输入域名" fullWidth multiline minRows={6} maxRows={20}
                                    placeholder="每行一条，例如：google.com" autoFocus={true}/>
                                <Box>
                                    <Button variant="contained" fullWidth>确认</Button>
                                </Box>
                            </Stack>
                        ) : ruleType === 1 ? (
                            <Stack spacing={2}>
                                <Alert variant="filled" severity="success">
                                    直接连接网络，不经过任何代理服务器，适合访问国内网站或不需要加速的场景。比如访问百度、淘宝等。
                                </Alert>
                                <TextField
                                    variant="outlined" label="请输入域名" fullWidth multiline minRows={6} maxRows={20}
                                    placeholder="每行一条，例如：baidu.com" autoFocus={true}/>
                                <Box>
                                    <Button variant="contained" fullWidth>确认</Button>
                                </Box>
                            </Stack>
                        ) : ruleType === 2 && (
                            <Stack spacing={2}>
                                <Alert variant="filled" severity="error">
                                    阻止访问某些网站或服务，适合屏蔽广告、恶意网站或不希望访问的内容。
                                </Alert>
                                <TextField
                                    variant="outlined" label="请输入域名" fullWidth multiline minRows={6} maxRows={20}
                                    placeholder="每行一条，例如：360.cn" autoFocus={true}/>
                                <Box>
                                    <Button variant="contained" fullWidth>确认</Button>
                                </Box>
                            </Stack>
                        )}
                    </>)}
                </>)}

                {ruleMode === 'dns' && (<>
                </>)}
            </Paper>
        </Paper>
    )
}

export default Rule
