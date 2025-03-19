import { useState, useEffect, SyntheticEvent } from 'react'
import {
    Paper, Box, Card, Divider,
    Tabs, Tab,
    ListItem, ListItemButton,
    Stack,
    Typography,
    Switch,
    Button, ButtonGroup, TextField, IconButton,
    Select, MenuItem, SelectChangeEvent
} from '@mui/material'

import OpenInNewIcon from '@mui/icons-material/OpenInNew'

import { invoke } from '@tauri-apps/api/core'
import { useTheme } from '../context/ThemeProvider'
import { debounce } from '../util/util.ts'

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
        return value > 0 && value <= 65535
    }

    const checkPortAvailable = async (port: number) => {
        try {
            return await invoke<boolean>('check_port_available', {port})
        } catch (err) {
            console.error('Failed to check port availability:', err)
            return false
        }
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
        "app_log_level": "info",
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
        "auto_setup_http": false,
        "auto_setup_https": false
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

    const handleAppLogLevel = (event: SelectChangeEvent) => {
        const value = event.target.value as AppConfig['app_log_level']
        setConfig(prevConfig => ({...prevConfig, app_log_level: value}))
        invokeSend('set_app_log_level', value)
    }

    const handleRayLogLevel = (event: SelectChangeEvent) => {
        const value = event.target.value as AppConfig['ray_log_level']
        setConfig(prevConfig => ({...prevConfig, ray_log_level: value}))
        invokeSend('set_ray_log_level', value)
    }

    const [rayIpError, setRayIpError] = useState(false)
    const [raySocksPortError, setRaySocksPortError] = useState(false)
    const [raySocksPortErrorText, setRaySocksPortErrorText] = useState('')
    const [rayHttpPortError, setRayHttpPortError] = useState(false)

    const debouncedSetRayHost = debounce((value: string) => invokeSend('set_ray_host', value), 500)
    const handleRayHost = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        const ok = validateIp(value)
        setRayIpError(!ok)
        setConfig(prevConfig => ({...prevConfig, ray_host: value}))
        if (ok && config.ray_host !== value) {
            debouncedSetRayHost(value)
        }
    }

    const debouncedSetRaySocksPort = debounce(async (value: number) => {
        if (!value || !validatePort(value)) return
        const ok = await checkPortAvailable(value)
        if (!ok) {
            setRaySocksPortError(true)
            setRaySocksPortErrorText('本机端口不可用')
        } else if (config.ray_socks_port !== value) {
            invokeSend('set_ray_socks_port', value)
        }
    }, 500)
    const handleRaySocksPort = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value) || 0
        setConfig(prevConfig => ({...prevConfig, ray_socks_port: value || ""}))
        setRaySocksPortErrorText('')
        const ok = validatePort(value)
        setRaySocksPortError(!ok)
        !ok && setRaySocksPortErrorText('请输入有效的端口号 (1-65535)')
        debouncedSetRaySocksPort(value)
    }

    const debouncedSetRayHttpPort = debounce((value: number) => invokeSend('set_ray_http_port', value), 500)
    const handleRayHttpPort = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value) || 0
        const ok = validatePort(value)
        setRayHttpPortError(!ok)
        setConfig(prevConfig => ({...prevConfig, ray_http_port: value || ""}))
        if (ok && value && config.ray_http_port !== value) {
            debouncedSetRayHttpPort(value)
        }
    }

    const handleRayStartHttp = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked
        setConfig(prevConfig => ({...prevConfig, ray_start_http: value}))
        invokeSend('set_ray_start_http', value)
    }

    const handleAutoSetupPac = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked
        setConfig(prevConfig => ({...prevConfig, auto_setup_pac: value}))
        invokeSend('set_auto_setup_pac', value)
    }

    const handleAutoSetupSocks = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked
        setConfig(prevConfig => ({...prevConfig, auto_setup_socks: value}))
        invokeSend('set_auto_setup_socks', value)
    }

    const handleAutoSetupHttp = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked
        setConfig(prevConfig => ({...prevConfig, auto_setup_http: value}))
        invokeSend('set_auto_setup_http', value)
    }

    const handleAutoSetupHttps = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked
        setConfig(prevConfig => ({...prevConfig, auto_setup_https: value}))
        invokeSend('set_auto_setup_https', value)
    }

    // 用于记录当前 Web 服务的设置
    const [webIpError, setWebIpError] = useState(false)
    const [webPortError, setWebPortError] = useState(false)

    const handleWebServerEnable = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.checked
        setConfig(prevConfig => ({...prevConfig, web_server_enable: value}))
        invokeSend('set_web_server_enable', value)
    }


    const debouncedSetWebServerHost = debounce((value: string) => invokeSend('set_web_server_host', value), 500)
    const handleWebIp = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        const ok = validateIp(value)
        setWebIpError(!ok)
        setConfig(prevConfig => ({...prevConfig, web_server_host: value}))
        if (ok && config.web_server_host !== value) {
            debouncedSetWebServerHost(value)
        }
    }

    const debouncedSetWebServerPort = debounce((value: number) => invokeSend('set_web_server_port', value), 500)
    const handleWebPort = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value) || 0
        const ok = validatePort(value)
        setWebPortError(!ok)
        setConfig(prevConfig => ({...prevConfig, web_server_port: value || ""}))
        if (ok && value && config.web_server_port !== value) {
            debouncedSetWebServerPort(value)
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
                <Box sx={{p: 2}}>
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
                        <Divider/>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{p: 1}}>
                            <Typography variant="body1" sx={{pl: 1}}>日志级别</Typography>
                            <Select value={config.app_log_level} onChange={handleAppLogLevel} sx={{width: 120}}>
                                <MenuItem value="none">关闭日志</MenuItem>
                                <MenuItem value="error">错误日志</MenuItem>
                                <MenuItem value="warn">警告日志</MenuItem>
                                <MenuItem value="info">普通日志</MenuItem>
                                <MenuItem value="debug">调试日志</MenuItem>
                                <MenuItem value="trace">追踪日志</MenuItem>
                            </Select>
                        </Stack>
                    </Card>
                </Box>
            ) : activeTab === 1 ? (
                <Box sx={{p: 2}}>
                    <Card sx={{mb: 2}}>
                        <Typography variant="h6" sx={{p: 2, pt: 1.1, pb: 0.9}}>自动设置</Typography>
                        <Divider/>
                        <ListItem disablePadding>
                            <ListItemButton sx={{cursor: 'default'}}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%'}}>
                                    <Typography variant="body1" sx={{pl: 1}}>PAC 自动配置代理</Typography>
                                    <Switch checked={config.auto_setup_pac} onChange={handleAutoSetupPac}/>
                                </Stack>
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton sx={{cursor: 'default'}}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%'}}>
                                    <Typography variant="body1" sx={{pl: 1}}>SOCKS 代理</Typography>
                                    <Switch checked={config.auto_setup_socks} onChange={handleAutoSetupSocks}/>
                                </Stack>
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton sx={{cursor: 'default'}}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%'}}>
                                    <Typography variant="body1" sx={{pl: 1}}>HTTP 代理</Typography>
                                    <Switch checked={config.auto_setup_http} onChange={handleAutoSetupHttp}/>
                                </Stack>
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton sx={{cursor: 'default'}}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%'}}>
                                    <Typography variant="body1" sx={{pl: 1}}>HTTPS 代理</Typography>
                                    <Switch checked={config.auto_setup_https} onChange={handleAutoSetupHttps}/>
                                </Stack>
                            </ListItemButton>
                        </ListItem>
                    </Card>
                    <Card>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{p: 1}}>
                            <Typography variant="body1" sx={{pl: 1}}>Ray 日志级别</Typography>
                            <Select value={config.ray_log_level} onChange={handleRayLogLevel} sx={{width: 120}}>
                                <MenuItem value="none">关闭日志</MenuItem>
                                <MenuItem value="error">错误日志</MenuItem>
                                <MenuItem value="warning">警告日志</MenuItem>
                                <MenuItem value="info">普通日志</MenuItem>
                                <MenuItem value="debug">调试日志</MenuItem>
                            </Select>
                        </Stack>
                        <Divider/>
                        <Stack direction="row" spacing={2} sx={{p: 2, pb: 1}}>
                            <TextField
                                label="本机地址"
                                value={config.ray_host}
                                onChange={handleRayHost}
                                error={rayIpError}
                                helperText={rayIpError ? "请输入有效的IP地址" : ""}
                                sx={{flex: 'auto'}}
                            />
                        </Stack>
                        <Stack direction="row" spacing={2} sx={{p: 2}}>
                            <TextField
                                label="SOCKS 端口"
                                value={config.ray_socks_port}
                                onChange={handleRaySocksPort}
                                error={raySocksPortError}
                                helperText={raySocksPortErrorText}
                                sx={{flex: 1}}
                            />
                            <TextField
                                label="HTTP 端口"
                                value={config.ray_http_port}
                                onChange={handleRayHttpPort}
                                error={rayHttpPortError}
                                helperText={rayHttpPortError ? "请输入有效的端口号 (0-65535)" : ""}
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
                            <Switch checked={config.ray_start_http} onChange={handleRayStartHttp}/>
                        </Stack>
                    </Card>
                </Box>
            ) : activeTab === 2 && (
                <Box sx={{p: 2}}>
                    <Card>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{p: 2}}>
                            <Typography variant="body1" sx={{pl: 1}}>Web 服务
                                <IconButton color="primary" href={`http://${config.web_server_host}:${config.web_server_port}/dray/`} target="_blank">
                                    <OpenInNewIcon/>
                                </IconButton>
                            </Typography>
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
