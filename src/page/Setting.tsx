import { useState, useEffect, useMemo, SyntheticEvent } from 'react'
import {
    Paper, Box, Card, Divider,
    Tabs, Tab,
    ListItem, ListItemButton,
    Stack,
    Typography,
    Switch, Slider, Tooltip,
    Button, ButtonGroup, TextField,
    FormControl, FormControlLabel, Checkbox,
    Select, MenuItem, SelectChangeEvent
} from '@mui/material'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

import {
    enable as autoStartEnable,
    isEnabled as autoStartIsEnabled,
    disable as autoStartDisable,
} from '@tauri-apps/plugin-autostart'

import { useTheme } from '../context/ThemeProvider.tsx'
import { debounce, validateIp, validatePort } from '../util/util.ts'
import {
    log, isTauri, checkPortAvailable,
    readAppConfig, setAppConfig,
    readRayCommonConfig, saveRayCommonConfig, openWebServerDir,
} from '../util/invoke.ts'
import {
    rayLogLevelChange,
    rayHostChange, raySocksPortChange, rayHttpPortChange,
    raySocksEnabledChange, rayHttpEnabledChange,
    raySocksUdpChange,
    raySocksSniffingChange, raySocksDestOverrideChange,
    rayOutboundsMuxChange, rayOutboundsConcurrencyChange
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

        "ray_enable": false,
        "ray_host": "127.0.0.1",
        "ray_socks_port": 1086,
        "ray_http_port": 1089,

        "auto_setup_pac": false,
        "auto_setup_socks": true,
        "auto_setup_http": false,
        "auto_setup_https": false
    })

    const defaultRayCommonConfig: RayCommonConfig = {
        "ray_log_level": "warning",

        "socks_enable": true,
        "http_enable": true,

        "socks_udp": false,
        "socks_sniffing": false,
        "socks_sniffing_dest_override": ["http", "tls"],

        "outbounds_mux": false,
        "outbounds_concurrency": 8,
    }
    const [rayCommonConfig, setRayCommonConfig] = useState<RayCommonConfig>(defaultRayCommonConfig)

    useEffect(() => {
        if (!isTauri) return
        readAppConfig().then(c => setConfig(c))
        readRayCommonConfig().then(c => {
            setRayCommonConfig({...defaultRayCommonConfig, ...c})
        }).catch(_ => {
            saveRayCommonConfig(defaultRayCommonConfig).catch(_ => 0) // 初始化 Ray Common 配置
        })
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
        const value = event.target.value as RayCommonConfig['ray_log_level']
        setRayCommonConfig(prevConfig => {
            const updatedConfig = {...prevConfig, ray_log_level: value}
            rayLogLevelChange(value, updatedConfig)
            return updatedConfig
        })
    }

    // ======================================================================================================
    const [rayIpError, setRayIpError] = useState(false)
    const [raySocksPortError, setRaySocksPortError] = useState(false)
    const [raySocksPortErrorText, setRaySocksPortErrorText] = useState('')
    const [rayHttpPortError, setRayHttpPortError] = useState(false)
    const [rayHttpPortErrorText, setRayHttpPortErrorText] = useState('')

    const debouncedSetRayHost = useMemo(() => debounce((value: string) => {
        readAppConfig().then(async c => {
            if (c.ray_host !== value) {
                setConfig(prevConfig => ({...prevConfig, ray_host: value}))
                setAppConfig('set_ray_host', value)
                rayHostChange(value)
            }
        }).catch(_ => 0)
    }, 1000), [])
    const handleRayHost = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.trim()
        setConfig(prevConfig => ({...prevConfig, ray_host: value}))
        const ok = validateIp(value)
        setRayIpError(!ok)
        if (ok) debouncedSetRayHost(value)
    }

    const debouncedSetRaySocksPort = useMemo(() => debounce((value: number) => {
        readAppConfig().then(async c => {
            if (c.ray_socks_port !== value) {
                const ok = await checkPortAvailable(value)
                setRaySocksPortError(!ok)
                !ok && setRaySocksPortErrorText('本机端口不可用')
                if (ok) {
                    setRaySocksPortErrorText('')
                    setConfig(prevConfig => ({...prevConfig, ray_socks_port: value}))
                    setAppConfig('set_ray_socks_port', value)
                    raySocksPortChange(value)
                }
            }
        }).catch(_ => 0)
    }, 1500), [])
    const handleRaySocksPort = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value) || 0
        setConfig(prevConfig => ({...prevConfig, ray_socks_port: value || ""}))
        setRaySocksPortErrorText('')
        const ok = validatePort(value)
        setRaySocksPortError(!ok)
        !ok && setRaySocksPortErrorText('请输入有效的端口号 (1-65535)')
        if (ok) debouncedSetRaySocksPort(value)
    }

    const debouncedSetRayHttpPort = useMemo(() => debounce(async (value: number) => {
        readAppConfig().then(async c => {
            if (c.ray_http_port !== value) {
                const ok = await checkPortAvailable(value)
                setRayHttpPortError(!ok)
                !ok && setRayHttpPortErrorText('本机端口不可用')
                if (ok) {
                    setRayHttpPortErrorText('')
                    setConfig(prevConfig => ({...prevConfig, ray_http_port: value}))
                    setAppConfig('set_ray_http_port', value)
                    rayHttpPortChange(value)
                }
            }
        }).catch(_ => 0)
    }, 1500), [])
    const handleRayHttpPort = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value) || 0
        setConfig(prevConfig => ({...prevConfig, ray_http_port: value || ""}))
        setRayHttpPortErrorText('')
        const ok = validatePort(value)
        setRayHttpPortError(!ok)
        !ok && setRayHttpPortErrorText('请输入有效的端口号 (1-65535)')
        if (ok) debouncedSetRayHttpPort(value)
    }

    // ======================================================================================================
    const handleRaySocksEnabled = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked as RayCommonConfig['socks_enable']
        setRayCommonConfig(prevConfig => {
            const updatedConfig = {...prevConfig, socks_enable: value}
            raySocksEnabledChange(value, config, updatedConfig)
            return updatedConfig
        })
    }

    const handleRayHttpEnabled = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked as RayCommonConfig['http_enable']
        setRayCommonConfig(prevConfig => {
            const updatedConfig = {...prevConfig, http_enable: value}
            rayHttpEnabledChange(value, config, updatedConfig)
            return updatedConfig
        })
    }

    // ======================================================================================================
    const handleRaySocksUdp = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked as RayCommonConfig['socks_udp']
        setRayCommonConfig(prevConfig => {
            const updatedConfig = {...prevConfig, socks_udp: value}
            raySocksUdpChange(value, updatedConfig)
            return updatedConfig
        })
    }

    const handleRaySocksSniffing = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked as RayCommonConfig['socks_sniffing']
        setRayCommonConfig(prevConfig => {
            const updatedConfig = {...prevConfig, socks_sniffing: value}
            raySocksSniffingChange(value, updatedConfig)
            return updatedConfig
        })
    }

    const handleDestOverride = async (option: "http" | "tls" | "quic" | "fakedns" | "fakedns+others") => {
        setRayCommonConfig(prevConfig => {
            const updatedConfig = {
                ...prevConfig,
                socks_sniffing_dest_override: prevConfig.socks_sniffing_dest_override.includes(option)
                    ? prevConfig.socks_sniffing_dest_override.filter(item => item !== option)
                    : [...prevConfig.socks_sniffing_dest_override, option]
            }
            raySocksDestOverrideChange(updatedConfig.socks_sniffing_dest_override, updatedConfig)
            return updatedConfig
        })
    }

    const handleRayOutboundsMux = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked as RayCommonConfig['outbounds_mux']
        setRayCommonConfig(prevConfig => {
            const updatedConfig = {...prevConfig, outbounds_mux: value}
            rayOutboundsMuxChange(value, updatedConfig)
            return updatedConfig
        })
    }

    const debouncedRayOutboundsConcurrency = useMemo(() => debounce(async (value: number, updatedConfig: RayCommonConfig) => {
        rayOutboundsConcurrencyChange(value, updatedConfig)
    }, 1000), [])
    const handleRayOutboundsConcurrency = async (value: number) => {
        setRayCommonConfig(prevConfig => {
            const updatedConfig = {...prevConfig, outbounds_concurrency: value}
            debouncedRayOutboundsConcurrency(value, updatedConfig)
            return updatedConfig
        })
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

    const debouncedSetWebServerHost = useMemo(() => debounce((value: string) => {
        readAppConfig().then(async c => {
            if (c.web_server_host !== value) {
                setConfig(prevConfig => ({...prevConfig, web_server_host: value}))
                setAppConfig('set_web_server_host', value)
            }
        }).catch(_ => 0)
    }, 1000), [])
    const handleWebIp = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.trim()
        setConfig(prevConfig => ({...prevConfig, web_server_host: value}))
        const ok = validateIp(value)
        setWebIpError(!ok)
        if (ok) debouncedSetWebServerHost(value)
    }

    const debouncedSetWebServerPort = useMemo(() => debounce(async (value: number) => {
        readAppConfig().then(async c => {
            if (c.web_server_port !== value) {
                const ok = await checkPortAvailable(value)
                setWebPortError(!ok)
                !ok && setWebPortErrorText('本机端口不可用')
                if (ok) {
                    setWebPortErrorText('')
                    setConfig(prevConfig => ({...prevConfig, web_server_port: value}))
                    setAppConfig('set_web_server_port', value)
                }
            }
        }).catch(_ => 0)
    }, 1500), [])
    const handleWebPort = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value) || 0
        setConfig(prevConfig => ({...prevConfig, web_server_port: value || ""}))
        setWebPortErrorText('')
        const ok = validatePort(value)
        setWebPortError(!ok)
        !ok && setWebPortErrorText('请输入有效的端口号 (1-65535)')
        if (ok) debouncedSetWebServerPort(value)
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
                                <Select value={rayCommonConfig.ray_log_level} onChange={handleRayLogLevel}>
                                    <MenuItem value="none">关闭日志</MenuItem>
                                    <MenuItem value="error">错误日志</MenuItem>
                                    <MenuItem value="warning">警告日志</MenuItem>
                                    <MenuItem value="info">普通日志</MenuItem>
                                    <MenuItem value="debug">调试日志</MenuItem>
                                </Select>
                            </FormControl>
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
                            <Switch checked={rayCommonConfig.socks_enable} onChange={handleRaySocksEnabled}/>
                        </Stack>
                        <Divider/>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{p: 1}}>
                            <Typography variant="body1" sx={{pl: 1}}>HTTP 服务</Typography>
                            <Switch checked={rayCommonConfig.http_enable} onChange={handleRayHttpEnabled}/>
                        </Stack>
                        {rayCommonConfig.socks_enable && (<>
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
                                    <Slider value={rayCommonConfig.outbounds_concurrency}
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
                                helperText={webPortErrorText}
                                sx={{width: '210px'}}
                            />
                        </Stack>
                        <Stack direction="row" spacing={2} sx={{p: 2}}>
                            <Button startIcon={<FolderOpenIcon/>} variant="contained" onClick={openWebServerDir}>打开目录</Button>
                            <Button startIcon={<OpenInNewIcon/>} variant="contained" target="_blank"
                                    href={`http://${config.web_server_host}:${config.web_server_port}/dray/`}>打开网站</Button>
                        </Stack>
                    </Card>
                </Box>
            )}
        </Paper>
    )
}

export default Setting
