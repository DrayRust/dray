import { useState, useEffect, SyntheticEvent } from 'react'
import {
    Paper, Box, Card, Divider,
    Tabs, Tab,
    ListItem, ListItemButton,
    Stack,
    Typography,
    Switch,
    Button, ButtonGroup, TextField,
    Select, MenuItem, SelectChangeEvent
} from '@mui/material'

import { invoke } from '@tauri-apps/api/core'
import { useTheme } from '../context/ThemeProvider'

import {
    enable as autoStartEnable,
    isEnabled as autoStartIsEnabled,
    disable as autoStartDisable,
} from '@tauri-apps/plugin-autostart'

const Setting: React.FC<NavProps> = ({setNavState}) => {
    setNavState(5)
    // 从上下文中获取当前主题模式和切换模式的函数
    const {mode, toggleMode} = useTheme()
    const handleTheme = (newMode: string) => {
        toggleMode(newMode as 'light' | 'dark' | 'system')
    }

    // 用于记录当前激活的选项卡索引，初始值为0（即第一个选项卡）
    const [activeTab, setActiveTab] = useState(0)
    const handleTab = (_event: SyntheticEvent, newValue: number) => {
        setActiveTab(newValue)
    }

    // 用于记录当前开机自动启动的设置，初始值为false（即未设置自动启动）
    const [autoStart, setAutoStart] = useState(false);
    (async () => {
        setAutoStart(await autoStartIsEnabled())
    })()
    const handleAutoStart = async (event: React.ChangeEvent<HTMLInputElement>) => {
        let checked = event.target.checked
        setAutoStart(checked)
        checked ? await autoStartEnable() : await autoStartDisable()
    }

    const validateIp = (value: string) => {
        const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        return ipPattern.test(value)
    }

    const validatePort = (value: number) => {
        return value >= 0 && value <= 65535
    }

    const invokeSend = (fn: string, value: string | number | boolean) => {
        (async () => {
            try {
                await invoke(fn, {value})
            } catch (err) {
                console.log('Failed to invokeSend:', err)
            }
        })()
    }

    // 从配置文件中读取配置信息
    const [config, setConfig] = useState<AppConfig>({
        "web_server_enable": true,
        "web_server_host": "127.0.0.1",
        "web_server_port": 18687,
        "ray_enable": true,
        "ray_log_level": "warning",
        "ray_host": "127.0.0.1",
        "ray_socks_port": 1086,
        "ray_http_port": 1089,
        "ray_start_socks": true,
        "ray_start_http": true,
        "auto_setup_pac": false,
        "auto_setup_socks": true,
        "auto_setup_http": false
    })

    useEffect(() => {
        (async () => {
            try {
                const data = await invoke('get_config_json')
                const config = typeof data === 'string' ? JSON.parse(data) : data
                setConfig(config as AppConfig)
            } catch (err) {
                console.log('Failed to get_config_json:', err)
            }
        })()
    }, [])

    const handleRayLogLevel = (event: SelectChangeEvent) => {
        const value = event.target.value as AppConfig['ray_log_level']
        setConfig(prevConfig => ({...prevConfig, ray_log_level: value}))
        invokeSend('set_ray_log_level', value)
    }

    // 用于记录当前 Web 服务的设置
    const [webIpError, setWebIpError] = useState(false)
    const [webPortError, setWebPortError] = useState(false)

    const handleWebServerEnable = async (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.checked
        setConfig(prevConfig => ({...prevConfig, web_server_enable: value}))
        invokeSend('set_web_server_enable', value)
    }

    const handleWebIp = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        const ok = validateIp(value)
        setWebIpError(!ok)
        setConfig(prevConfig => ({...prevConfig, web_server_host: value}))
        if (ok && config.web_server_host !== value) {
            invokeSend('set_web_server_host', value)
        }
    }

    const handleWebPort = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value) || 0
        const ok = validatePort(value)
        setWebPortError(!ok)
        setConfig(prevConfig => ({...prevConfig, web_server_port: value}))
        if (ok && value && config.web_server_port !== value) {
            invokeSend('set_web_server_port', value)
        }
    }

    return (
        <Paper elevation={3} sx={{borderRadius: 2, overflow: 'visible'}}>
            <Paper elevation={1} sx={{alignItems: "center", borderRadius: '8px 8px 0 0'}}>
                <Tabs value={activeTab} onChange={handleTab} aria-label="设置导航">
                    <Tab label="基本设置"/>
                    <Tab label="代理设置"/>
                    <Tab label="Web 设置"/>
                </Tabs>
            </Paper>
            {activeTab === 0 ? (
                <Box sx={{p: 2, maxWidth: 550}}>
                    <Card>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{p: 2}}>
                            <Typography variant="body1">外观</Typography>
                            <ButtonGroup variant="contained">
                                <Button onClick={() => handleTheme('light')} variant={mode === 'light' ? 'contained' : 'outlined'}>亮色</Button>
                                <Button onClick={() => handleTheme('dark')} variant={mode === 'dark' ? 'contained' : 'outlined'}>暗色</Button>
                                <Button onClick={() => handleTheme('system')} variant={mode === 'system' ? 'contained' : 'outlined'}>跟随系统</Button>
                            </ButtonGroup>
                        </Stack>
                        <Divider/>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{p: 2}}>
                            <Typography variant="body1">开机启动</Typography>
                            <Switch checked={autoStart} onChange={handleAutoStart}/>
                        </Stack>
                    </Card>
                </Box>
            ) : activeTab === 1 ? (
                <Box sx={{p: 2, maxWidth: 550}}>
                    <Card>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{p: 1}}>
                            <Typography variant="body1" sx={{pl: 1}}>日志级别</Typography>
                            <Select value={config.ray_log_level} onChange={handleRayLogLevel} sx={{width: 120}}>
                                <MenuItem value="none">None</MenuItem>
                                <MenuItem value="error">Error</MenuItem>
                                <MenuItem value="warning">Warning</MenuItem>
                                <MenuItem value="info">Info</MenuItem>
                                <MenuItem value="debug">Debug</MenuItem>
                            </Select>
                        </Stack>
                        <Divider/>
                        <Stack direction="row" spacing={2} sx={{p: 2}}>
                            <TextField
                                label="本机地址"
                                value={config.ray_host}
                                onChange={handleWebIp}
                                error={webIpError}
                                helperText={webIpError ? "请输入有效的IP地址" : ""}
                                sx={{flex: 'auto'}}
                            />
                        </Stack>
                        <Stack direction="row" spacing={2} sx={{p: 2}}>
                            <TextField
                                label="SOCKS 端口"
                                value={config.ray_socks_port}
                                onChange={handleWebPort}
                                error={webPortError}
                                helperText={webPortError ? "请输入有效的端口号 (0-65535)" : ""}
                                sx={{flex: 1}}
                            />
                            <TextField
                                label="HTTP 端口"
                                value={config.ray_http_port}
                                onChange={handleWebPort}
                                error={webPortError}
                                helperText={webPortError ? "请输入有效的端口号 (0-65535)" : ""}
                                sx={{flex: 1}}
                            />
                        </Stack>
                        <Divider/>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{p: 1}}>
                            <Typography variant="body1" sx={{pl: 1}}>SOCKS 服务</Typography>
                            <Switch checked={config.ray_start_socks} disabled/>
                        </Stack>
                        <Divider/>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{p: 1}}>
                            <Typography variant="body1" sx={{pl: 1}}>HTTP 服务</Typography>
                            <Switch checked={config.ray_start_http} onChange={() => invoke('stop_ray')}/>
                        </Stack>
                    </Card>
                    <Card sx={{mt: 2}}>
                        <Typography variant="h6" sx={{p: 2, pt: 1.1, pb: 0.9}}>自动设置</Typography>
                        <Divider/>
                        <ListItem disablePadding>
                            <ListItemButton sx={{cursor: 'default'}}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%'}}>
                                    <Typography variant="body1" sx={{pl: 1}}>PAC 自动代理</Typography>
                                    <Switch checked={config.auto_setup_pac} onChange={() => invoke('enable_auto_proxy')}/>
                                </Stack>
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton sx={{cursor: 'default'}}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%'}}>
                                    <Typography variant="body1" sx={{pl: 1}}>SOCKS 代理</Typography>
                                    <Switch checked={config.auto_setup_socks} onChange={() => invoke('enable_socks_proxy')}/>
                                </Stack>
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton sx={{cursor: 'default'}}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%'}}>
                                    <Typography variant="body1" sx={{pl: 1}}>HTTP 代理</Typography>
                                    <Switch checked={config.auto_setup_http} onChange={() => invoke('enable_web_proxy')}/>
                                </Stack>
                            </ListItemButton>
                        </ListItem>
                    </Card>
                </Box>
            ) : activeTab === 2 && (
                <Box sx={{p: 2, maxWidth: 550}}>
                    <Card>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{p: 2}}>
                            <Typography variant="body1" sx={{pl: 1}}>Web 服务</Typography>
                            <Switch checked={config.web_server_enable} onChange={handleWebServerEnable}/>
                        </Stack>
                        <Divider/>
                        <Stack direction="row" spacing={2} sx={{p: 2}}>
                            <TextField
                                label="本机地址"
                                value={config.web_server_host}
                                onChange={handleWebIp}
                                error={webIpError}
                                helperText={webIpError ? "请输入有效的IP地址" : ""}
                                sx={{flex: 'auto'}}
                            />
                            <TextField
                                label="Web 端口"
                                value={config.web_server_port}
                                onChange={handleWebPort}
                                error={webPortError}
                                helperText={webPortError ? "请输入有效的端口号 (0-65535)" : ""}
                                sx={{width: '210px'}}
                            />
                        </Stack>
                    </Card>
                </Box>
            )}
        </Paper>
    )
}

export default Setting
