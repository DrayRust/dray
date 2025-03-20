import { useState, useEffect, SyntheticEvent } from 'react'
import {
    Paper, Box, Card, Divider,
    Tabs, Tab,
    ListItem, ListItemButton,
    Stack,
    Typography,
    Switch, Slider, Tooltip,
    Button, ButtonGroup, TextField, IconButton,
    FormControl, FormControlLabel, Checkbox,
    Select, MenuItem, SelectChangeEvent
} from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

import {
    enable as autoStartEnable,
    isEnabled as autoStartIsEnabled,
    disable as autoStartDisable,
} from '@tauri-apps/plugin-autostart'

import { useTheme } from '../context/ThemeProvider'
import { debounce, validateIp, validatePort } from '../util/util.ts'
import {
    log, isTauri, checkPortAvailable,
    readAppConfig, setAppConfig,
    readRayCommonConfig, saveRayCommonConfig,
    readRayConfig, saveRayConfig
} from '../util/invoke.ts'
import {
    rayHostChange, raySocksPortChange, rayHttpPortChange,
    raySocksEnabledChange, rayHttpEnabledChange
} from "../util/ray.ts"

const Setting: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => {
        setNavState(5)
    }, [setNavState])

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
    const [autoStart, setAutoStart] = useState(false)
    useEffect(() => {
        if (!isTauri) return
        (async () => {
            try {
                setAutoStart(await autoStartIsEnabled())
            } catch (err) {
                log.error('Failed to autoStartIsEnabled:', err)
            }
        })()
    }, [])
    const handleAutoStart = async (event: React.ChangeEvent<HTMLInputElement>) => {
        let checked = event.target.checked
        setAutoStart(checked)
        if (!isTauri) return
        try {
            checked ? await autoStartEnable() : await autoStartDisable()
        } catch (err) {
            log.error('Failed to handleAutoStart:', err)
        }
    }

    // 从配置文件中读取配置信息
    const [config, setConfig] = useState<AppConfig>({
        "app_log_level": "info",

        "web_server_enable": true,
        "web_server_host": "127.0.0.1",
        "web_server_port": 18687,

        "ray_enable": true,
        "ray_force_restart": true,
        "ray_host": "127.0.0.1",
        "ray_socks_port": 1086,
        "ray_http_port": 1089,

        "auto_setup_pac": false,
        "auto_setup_socks": true,
        "auto_setup_http": false,
        "auto_setup_https": false
    })

    const [rayCommonConfig, setRayCommonConfig] = useState<RayCommonConfig>({
        "log_level": "warning",

        "socks_enabled": true,
        "http_enabled": true,

        "socks_udp": false,
        "socks_sniffing": false,
        "socks_sniffing_dest_override": ["http", "tls"],

        "outbounds_mux": false,
        "outbounds_concurrency": 8,
    })

    useEffect(() => {
        if (!isTauri) return
        readAppConfig().then(c => setConfig(c))
        readRayCommonConfig().then(c => setRayCommonConfig(c))
    }, [])

    const handleAppLogLevel = (event: SelectChangeEvent) => {
        const value = event.target.value as AppConfig['app_log_level']
        setConfig(prevConfig => ({...prevConfig, app_log_level: value}))
        setAppConfig('set_app_log_level', value)
    }

    // ======================================================================================================
    const handleAutoSetupPac = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked
        setConfig(prevConfig => ({...prevConfig, auto_setup_pac: value}))
        setAppConfig('set_auto_setup_pac', value)
    }

    const handleAutoSetupSocks = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked
        setConfig(prevConfig => ({...prevConfig, auto_setup_socks: value}))
        setAppConfig('set_auto_setup_socks', value)
    }

    const handleAutoSetupHttp = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked
        setConfig(prevConfig => ({...prevConfig, auto_setup_http: value}))
        setAppConfig('set_auto_setup_http', value)
    }

    const handleAutoSetupHttps = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked
        setConfig(prevConfig => ({...prevConfig, auto_setup_https: value}))
        setAppConfig('set_auto_setup_https', value)
    }

    // ======================================================================================================
    const handleRayLogLevel = (event: SelectChangeEvent) => {
        const value = event.target.value as RayCommonConfig['log_level']
        setRayCommonConfig(prevConfig => ({...prevConfig, log_level: value}))

        readRayConfig().then(async c => {
            if (!c.log) return
            c.log.loglevel = value
            await saveRayConfig(c) // 保存 Ray 配置
            await saveRayCommonConfig(rayCommonConfig).catch(_ => 0) // 保存 Ray Common 配置
        }).catch(_ => 0)
    }

    const handleRayForceRestart = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked
        setConfig(prevConfig => ({...prevConfig, ray_force_restart: value}))
        setAppConfig('set_ray_force_restart', value)
    }

    // ======================================================================================================
    const [rayIpError, setRayIpError] = useState(false)
    const [raySocksPortError, setRaySocksPortError] = useState(false)
    const [raySocksPortErrorText, setRaySocksPortErrorText] = useState('')
    const [rayHttpPortError, setRayHttpPortError] = useState(false)
    const [rayHttpPortErrorText, setRayHttpPortErrorText] = useState('')

    const debouncedSetRayHost = debounce((value: string) => {
        setAppConfig('set_ray_host', value)
        rayHostChange(value)
    }, 500)
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
            setAppConfig('set_ray_socks_port', value)
            raySocksPortChange(value)
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

    const debouncedSetRayHttpPort = debounce(async (value: number) => {
        if (!value || !validatePort(value)) return
        const ok = await checkPortAvailable(value)
        if (!ok) {
            setRayHttpPortError(true)
            setRayHttpPortErrorText('本机端口不可用')
        } else if (config.ray_http_port !== value) {
            setAppConfig('set_ray_http_port', value)
            rayHttpPortChange(value)
        }
    }, 500)
    const handleRayHttpPort = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value) || 0
        setConfig(prevConfig => ({...prevConfig, ray_http_port: value || ""}))
        setRayHttpPortErrorText('')
        const ok = validatePort(value)
        setRayHttpPortError(!ok)
        !ok && setRayHttpPortErrorText('请输入有效的端口号 (1-65535)')
        debouncedSetRayHttpPort(value)
    }

    // ======================================================================================================
    const handleRaySocksEnabled = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked as RayCommonConfig['socks_enabled']
        setRayCommonConfig(prevConfig => ({...prevConfig, socks_enabled: value}))
        raySocksEnabledChange(value, config, rayCommonConfig)
    }

    const handleRayHttpEnabled = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked as RayCommonConfig['http_enabled']
        setRayCommonConfig(prevConfig => ({...prevConfig, http_enabled: value}))
        rayHttpEnabledChange(value, config, rayCommonConfig)
    }

    // ======================================================================================================
    const handleRaySocksUdp = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked as RayCommonConfig['socks_udp']
        setRayCommonConfig(prevConfig => ({...prevConfig, socks_udp: value}))
    }

    const handleRaySocksSniffing = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked as RayCommonConfig['socks_sniffing']
        setRayCommonConfig(prevConfig => ({...prevConfig, socks_sniffing: value}))
    }

    const handleDestOverride = async (option: "http" | "tls" | "quic" | "fakedns" | "fakedns+others") => {
        setRayCommonConfig(prevConfig => ({
            ...prevConfig,
            socks_sniffing_dest_override: prevConfig.socks_sniffing_dest_override.includes(option)
                ? prevConfig.socks_sniffing_dest_override.filter(item => item !== option)
                : [...prevConfig.socks_sniffing_dest_override, option]
        }))
    }

    const handleRayOutboundsMux = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked as RayCommonConfig['outbounds_mux']
        setRayCommonConfig(prevConfig => ({...prevConfig, outbounds_mux: value}))
    }

    const handleRayOutboundsConcurrency = async (value: number) => {
        setRayCommonConfig(prevConfig => ({...prevConfig, outbounds_concurrency: value}))
    }

    // ======================================================================================================
    // 用于记录当前 Web 服务的设置
    const [webIpError, setWebIpError] = useState(false)
    const [webPortError, setWebPortError] = useState(false)
    const [webPortErrorText, setWebPortErrorText] = useState('')

    const handleWebServerEnable = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.checked
        setConfig(prevConfig => ({...prevConfig, web_server_enable: value}))
        setAppConfig('set_web_server_enable', value)
    }

    const debouncedSetWebServerHost = debounce((value: string) => setAppConfig('set_web_server_host', value), 500)
    const handleWebIp = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        const ok = validateIp(value)
        setWebIpError(!ok)
        setConfig(prevConfig => ({...prevConfig, web_server_host: value}))
        if (ok && config.web_server_host !== value) {
            debouncedSetWebServerHost(value)
        }
    }

    const debouncedSetWebServerPort = debounce(async (value: number) => {
        if (!value || !validatePort(value)) return
        const ok = await checkPortAvailable(value)
        if (!ok) {
            setWebPortError(true)
            setWebPortErrorText('本机端口不可用')
        } else if (config.web_server_port !== value) {
            setAppConfig('set_web_server_port', value)
        }
    }, 500)
    const handleWebPort = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value) || 0
        setConfig(prevConfig => ({...prevConfig, web_server_port: value || ""}))
        setWebPortErrorText('')
        const ok = validatePort(value)
        setWebPortError(!ok)
        !ok && setWebPortErrorText('请输入有效的端口号 (1-65535)')
        debouncedSetWebServerPort(value)
    }

    const sxBox = {p: 2, m: '0 auto', maxWidth: 660}
    return (
        <Paper elevation={3} sx={{borderRadius: 2, overflow: 'visible'}}>
            <Paper elevation={1} sx={{display: 'flex', justifyContent: 'center', borderRadius: '8px 8px 0 0'}}>
                <Tabs value={activeTab} onChange={handleTab} aria-label="设置导航">
                    <Tab label="基本设置"/>
                    <Tab label="代理设置"/>
                    <Tab label="Ray 设置"/>
                    <Tab label="Web 设置"/>
                </Tabs>
            </Paper>
            {activeTab === 0 ? (
                <Box sx={sxBox}>
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
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{p: 2}}>
                            <Typography variant="body1">日志级别</Typography>
                            <FormControl sx={{minWidth: 120}} size="small">
                                <Select value={config.app_log_level} onChange={handleAppLogLevel}>
                                    <MenuItem value="none">关闭日志</MenuItem>
                                    <MenuItem value="error">错误日志</MenuItem>
                                    <MenuItem value="warn">警告日志</MenuItem>
                                    <MenuItem value="info">普通日志</MenuItem>
                                    <MenuItem value="debug">调试日志</MenuItem>
                                    <MenuItem value="trace">追踪日志</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                    </Card>
                </Box>
            ) : activeTab === 1 ? (
                <Box sx={sxBox}>
                    <Card>
                        <Typography variant="body1" sx={{p: 2}}>自动设置</Typography>
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
                </Box>
            ) : activeTab === 2 ? (
                <Box sx={sxBox}>
                    <Card>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{p: 2}}>
                            <Typography variant="body1">Ray 日志级别</Typography>
                            <FormControl sx={{minWidth: 120}} size="small">
                                <Select value={rayCommonConfig.log_level} onChange={handleRayLogLevel}>
                                    <MenuItem value="none">关闭日志</MenuItem>
                                    <MenuItem value="error">错误日志</MenuItem>
                                    <MenuItem value="warning">警告日志</MenuItem>
                                    <MenuItem value="info">普通日志</MenuItem>
                                    <MenuItem value="debug">调试日志</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                        <Divider/>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{p: 1}}>
                            <Typography variant="body1" sx={{pl: 1}}>粗暴重启</Typography>
                            <Switch checked={config.ray_force_restart} onChange={handleRayForceRestart}/>
                        </Stack>
                        <Divider/>
                        <Stack direction="row" spacing={2} sx={{p: 2}}>
                            <TextField
                                label="本机地址"
                                variant="standard"
                                value={config.ray_host}
                                onChange={handleRayHost}
                                error={rayIpError}
                                helperText={rayIpError ? "请输入有效的IP地址" : ""}
                                sx={{flex: 'auto'}}
                            />
                        </Stack>
                        <Stack direction="row" spacing={2} sx={{p: 2, pt: 1}}>
                            <TextField
                                label="SOCKS 端口"
                                variant="standard"
                                value={config.ray_socks_port}
                                onChange={handleRaySocksPort}
                                error={raySocksPortError}
                                helperText={raySocksPortErrorText}
                                sx={{flex: 1}}
                            />
                            <TextField
                                label="HTTP 端口"
                                variant="standard"
                                value={config.ray_http_port}
                                onChange={handleRayHttpPort}
                                error={rayHttpPortError}
                                helperText={rayHttpPortErrorText}
                                sx={{flex: 1}}
                            />
                        </Stack>
                        <Divider/>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{p: 1}}>
                            <Typography variant="body1" sx={{pl: 1}}>SOCKS 服务</Typography>
                            <Switch checked={rayCommonConfig.socks_enabled} onChange={handleRaySocksEnabled}/>
                        </Stack>
                        <Divider/>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{p: 1}}>
                            <Typography variant="body1" sx={{pl: 1}}>HTTP 服务</Typography>
                            <Switch checked={rayCommonConfig.http_enabled} onChange={handleRayHttpEnabled}/>
                        </Stack>
                        <Divider/>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{p: 1}}>
                            <Typography variant="body1" sx={{pl: 1}}>UDP 协议</Typography>
                            <Switch checked={rayCommonConfig.socks_udp} onChange={handleRaySocksUdp}/>
                        </Stack>
                        <Divider/>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{p: 1}}>
                            <Typography variant="body1" sx={{pl: 1}}>Sniffing 探测</Typography>
                            <Switch checked={rayCommonConfig.socks_sniffing} onChange={handleRaySocksSniffing}/>
                        </Stack>
                        {rayCommonConfig.socks_sniffing && (<>
                            <Divider/>
                            <Stack spacing={2} sx={{p: 2}}>
                                <Typography variant="body1">探测类型</Typography>
                                <Stack direction="row" spacing={1} sx={{justifyContent: "flex-start", alignItems: "center"}}>
                                    <FormControlLabel
                                        control={<Checkbox
                                            checked={rayCommonConfig.socks_sniffing_dest_override.includes("http")}
                                            onChange={() => handleDestOverride("http")}/>}
                                        label="HTTP"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox
                                            checked={rayCommonConfig.socks_sniffing_dest_override.includes("tls")}
                                            onChange={() => handleDestOverride("tls")}/>}
                                        label="TLS"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox
                                            checked={rayCommonConfig.socks_sniffing_dest_override.includes("quic")}
                                            onChange={() => handleDestOverride("quic")}/>}
                                        label="QUIC"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox
                                            checked={rayCommonConfig.socks_sniffing_dest_override.includes("fakedns")}
                                            onChange={() => handleDestOverride("fakedns")}/>}
                                        label="FakeDNS"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox
                                            checked={rayCommonConfig.socks_sniffing_dest_override.includes("fakedns+others")}
                                            onChange={() => handleDestOverride("fakedns+others")}/>}
                                        label="FakeDNS+Others"
                                    />
                                </Stack>
                            </Stack>
                        </>)}

                        <Divider/>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{p: 1}}>
                            <Tooltip title="开启后，网页浏览加速，但视频和下载速度可能变慢。" placement="right">
                                <Typography variant="body1" sx={{pl: 1}}>Mux 协议</Typography>
                            </Tooltip>
                            <Switch checked={rayCommonConfig.outbounds_mux} onChange={handleRayOutboundsMux}/>
                        </Stack>
                        {rayCommonConfig.outbounds_mux && (<>
                            <Divider/>
                            <Stack sx={{p: 2}}>
                                <Typography variant="body2">并发数</Typography>
                                <Box sx={{p: '15px 10px 0'}}>
                                    <Slider defaultValue={rayCommonConfig.outbounds_concurrency}
                                            onChange={(_, value) => handleRayOutboundsConcurrency(value as number)}
                                            min={1} max={128} aria-label="Concurrency" valueLabelDisplay="auto"/>
                                </Box>
                            </Stack>
                        </>)}
                    </Card>
                </Box>
            ) : activeTab === 3 && (
                <Box sx={sxBox}>
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
                                helperText={webPortErrorText}
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
