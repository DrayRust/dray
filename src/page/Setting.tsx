import { useState, SyntheticEvent } from 'react'
import {
    Paper,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemButton,
    Stack,
    Typography,
    Switch,
    Button,
    ButtonGroup,
    TextField,
} from '@mui/material'

import { useTheme } from '../context/ThemeProvider'

import {
    enable as autoStartEnable,
    isEnabled as autoStartIsEnabled,
    disable as autoStartDisable,
} from '@tauri-apps/plugin-autostart'

const Setting: React.FC = () => {
    // 从上下文中获取当前主题模式和切换模式的函数
    const {mode, toggleMode} = useTheme()
    const changeTheme = (newMode: string) => {
        toggleMode(newMode as 'light' | 'dark' | 'system')
    }

    // 用于记录当前激活的选项卡索引，初始值为0（即第一个选项卡）
    const [activeTab, setActiveTab] = useState(0)
    const changeTab = (_event: SyntheticEvent, newValue: number) => {
        setActiveTab(newValue)
    }

    // 用于记录当前开机自动启动的设置，初始值为false（即未设置自动启动）
    const [autoStart, setAutoStart] = useState(false);
    (async () => {
        setAutoStart(await autoStartIsEnabled())
    })()
    const changeAutoStart = async (event: React.ChangeEvent<HTMLInputElement>) => {
        let checked = event.target.checked
        setAutoStart(checked)
        checked ? await autoStartEnable() : await autoStartDisable()
    }

    // 用于记录当前 Web 服务的设置
    const [ip, setIp] = useState('127.0.0.1')
    const [port, setPort] = useState('18687')
    const [ipError, setIpError] = useState(false)
    const [portError, setPortError] = useState(false)

    const validateIp = (value: string) => {
        const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        return ipPattern.test(value)
    }

    const validatePort = (value: string) => {
        const portNumber = parseInt(value, 10)
        return !isNaN(portNumber) && portNumber >= 0 && portNumber <= 65535
    }

    const handleIpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setIp(value)
        setIpError(!validateIp(value))
    }

    const handlePortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setPort(value)
        setPortError(!validatePort(value))
    }

    const invoke = (action: string) => {
        console.log(`Invoking action: ${action}`)
    }

    return (
        <Paper elevation={3} sx={{borderRadius: 2, overflow: 'visible'}}>
            <Paper elevation={1} sx={{alignItems: "center", borderRadius: '8px 8px 0 0'}}>
                <Tabs value={activeTab} onChange={changeTab} aria-label="设置导航">
                    <Tab label="基本设置"/>
                    <Tab label="代理设置"/>
                    <Tab label="Web 设置"/>
                </Tabs>
            </Paper>
            {activeTab === 0 ? (
                <List>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>外观</Typography>
                                <ButtonGroup variant="contained">
                                    <Button onClick={() => changeTheme('light')} variant={mode === 'light' ? 'contained' : 'outlined'}>亮色</Button>
                                    <Button onClick={() => changeTheme('dark')} variant={mode === 'dark' ? 'contained' : 'outlined'}>暗色</Button>
                                    <Button onClick={() => changeTheme('system')} variant={mode === 'system' ? 'contained' : 'outlined'}>跟随系统</Button>
                                </ButtonGroup>
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>开机启动</Typography>
                                <Switch checked={autoStart} onChange={changeAutoStart}/>
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                </List>
            ) : activeTab === 1 ? (
                <List>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>启动 Ray</Typography>
                                <Switch
                                    checked={false}
                                    onChange={() => invoke('start_ray')}
                                />
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>停止 Ray</Typography>
                                <Switch
                                    checked={false}
                                    onChange={() => invoke('stop_ray')}
                                />
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>强制重启 Ray</Typography>
                                <Switch
                                    checked={false}
                                    onChange={() => invoke('force_restart_ray')}
                                />
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>强制终止 Ray</Typography>
                                <Switch
                                    checked={false}
                                    onChange={() => invoke('force_kill_ray')}
                                />
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>启用自动代理</Typography>
                                <Switch
                                    checked={false}
                                    onChange={() => invoke('enable_auto_proxy')}
                                />
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>启用 Socks 代理</Typography>
                                <Switch
                                    checked={false}
                                    onChange={() => invoke('enable_socks_proxy')}
                                />
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>启用 Web 代理</Typography>
                                <Switch
                                    checked={false}
                                    onChange={() => invoke('enable_web_proxy')}
                                />
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>启用安全 Web 代理</Typography>
                                <Switch
                                    checked={false}
                                    onChange={() => invoke('enable_secure_web_proxy')}
                                />
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>禁用代理</Typography>
                                <Switch
                                    checked={false}
                                    onChange={() => invoke('disable_proxies')}
                                />
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                </List>
            ) : activeTab === 2 && (
                <List>
                    <ListItem disablePadding>
                        <ListItemButton sx={{cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>Web 服务</Typography>
                                <Switch checked={false} onChange={() => invoke('start_web')}/>
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton sx={{cursor: 'default'}}>
                            <Stack direction="row" spacing={2} sx={{width: '100%', p: 1}}>
                                <TextField
                                    label="IP 地址"
                                    value={ip}
                                    onChange={handleIpChange}
                                    error={ipError}
                                    helperText={ipError ? "请输入有效的IP地址" : ""}
                                    sx={{flex: 'auto'}}
                                />
                                <TextField
                                    label="端口"
                                    value={port}
                                    onChange={handlePortChange}
                                    error={portError}
                                    helperText={portError ? "请输入有效的端口号 (0-65535)" : ""}
                                    sx={{width: '220px'}}
                                />
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                </List>
            )}
        </Paper>
    )
}

export default Setting
