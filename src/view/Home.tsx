import { useState, useEffect, useRef } from 'react'
import {
    BottomNavigation, BottomNavigationAction,
    Card, Paper, Stack, Typography, Switch,
    TableContainer, Table, TableBody, TableCell, TableRow,
} from '@mui/material'
import InputIcon from '@mui/icons-material/Input'
import OutputIcon from '@mui/icons-material/Output'

import { getNetworksJson, getSysInfoJson, invokeString, readAppConfig, readRayCommonConfig, readRayConfig, safeInvoke, setAppConfig } from "../util/invoke.ts"
import { useDebounce } from "../hook/useDebounce.ts"
import { formatSecond, formatTime, formatTimestamp, sizeToUnit } from "../util/util.ts"
import { calculateNetworkSpeed, getStatsData, sumNetworks } from "../util/network.ts"
import { useVisibility } from "../hook/useVisibility.ts"
import { DEFAULT_RAY_COMMON_CONFIG } from "../util/config.ts"
import { useSnackbar } from "../component/useSnackbar.tsx"

interface Inbound {
    totalUp: number; // 总上传
    totalDown: number; // 总下载
    httpUp: number; // HTTP 上传
    httpDown: number; // HTTP 下载
    socksUp: number; // SOCKS 上传
    socksDown: number; // SOCKS 下载
}

interface Outbound {
    totalUp: number; // 总上传
    totalDown: number; // 总下载
    proxyUp: number; // 代理上传
    proxyDown: number; // 代理下载
    directUp: number; // 直连上传
    directDown: number; // 直连下载
}

interface XrayVersionInfo {
    xray: string;
    go: string;
}

let versionInfo = {
    dray: '',
    rust: '',
    xray: '',
    go: ''
}

const Home: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(0), [setNavState])

    // 从配置文件中读取配置信息
    const [rayEnable, setRayEnable] = useState(false)
    const [rayCommonConfig, setRayCommonConfig] = useState<RayCommonConfig>(DEFAULT_RAY_COMMON_CONFIG)
    const loadConfig = useDebounce(async () => {
        await getVersion()

        const appConf = await readAppConfig()
        const rayEnable = Boolean(appConf && appConf.ray_enable)
        setRayEnable(rayEnable)

        let rayConf = await readRayCommonConfig()
        if (rayConf) {
            setRayCommonConfig(rayConf)
        } else {
            rayConf = rayCommonConfig
        }
        if (rayEnable && rayConf.stats_enable) await loadStats(rayConf.stats_port)

        await getSysInfo()
        await getNetworkData()
    }, 100)
    useEffect(loadConfig, [])

    // ==================================== version ====================================
    const getVersion = async () => {
        if (!versionInfo.dray) {
            const version = await safeInvoke('get_version')
            if (version) {
                versionInfo.dray = version.dray || ''
                versionInfo.rust = getRustVersion(version.rustc || '')
            }

            const rayVersion = await invokeString('get_ray_version')
            if (rayVersion) {
                versionInfo = {...versionInfo, ...parseXrayVersion(rayVersion)}
            }
        }
    }

    const getRustVersion = (input: string): string => {
        const match = input.toString().match(/rustc\s+(\d+\.\d+\.\d+)/)
        return match ? match[1] : ''
    }

    const parseXrayVersion = (input: string): XrayVersionInfo => {
        const xrayRegex = /^Xray\s+(\S+)\s+/i
        const goRegex = /\(go(\S+)\s+[^)]+\)/i
        const xrayMatch = input.match(xrayRegex)
        const goMatch = input.match(goRegex)
        return {
            xray: xrayMatch?.[1] || '',
            go: goMatch?.[1] || '',
        }
    }

    // ==================================== stats ====================================
    const [boundType, setBoundType] = useState('outbound')
    const [inbound, setInbound] = useState<Inbound | null>()
    const [outbound, setOutbound] = useState<Outbound | null>()
    const [memStats, setMemStats] = useState<any>({})
    const loadStats = async (port: number | '') => {
        if (!port) return
        const r = await getStatsData(Number(port)) as any
        if (r) {
            r.inbound && setInbound(r.inbound)
            r.outbound && setOutbound(r.outbound)
            r.memStats && setMemStats(r.memStats)
        }
    }

    // ==================================== system info ====================================
    const [sysInfo, setSysInfo] = useState<any>({})
    const [bootTime, setBootTime] = useState(0)
    const [runTime, setRunTime] = useState(0)
    const getSysInfo = async () => {
        let info = await getSysInfoJson()
        if (info) {
            setSysInfo(info)
            if (info.uptime && info.uptime > 0) {
                const booTime = Math.floor(Date.now() / 1000) - info.uptime
                setBootTime(Math.max(0, booTime))
                setRunTime(info.uptime)
            }
        }
    }

    // ==================================== interval ====================================
    const [errorMsg, setErrorMsg] = useState(false)
    const intervalRef = useRef<number>(0)
    const isVisibility = useVisibility()
    useEffect(() => {
        if (isVisibility && !errorMsg) {
            intervalRef.current = setInterval(async () => {
                const runTime = Math.floor(Date.now() / 1000) - bootTime
                setRunTime(Math.max(0, runTime))

                await getNetworkData()

                if (rayEnable && rayCommonConfig.stats_enable) {
                    await loadStats(rayCommonConfig.stats_port)
                }
            }, 1000)
        }
        return () => clearInterval(intervalRef.current)
    }, [isVisibility, bootTime, errorMsg])

    // ==================================== network ====================================
    const [network, setNetwork] = useState<any>([])
    const [networkSpeed, setNetworkSpeed] = useState({upSpeed: 0, downSpeed: 0})
    const prevNetworkRef = useRef({up: 0, down: 0})

    const getNetworkData = async () => {
        let currentNetwork = await getNetworksJson()
        if (currentNetwork) {
            const net = sumNetworks(currentNetwork)
            setNetwork(net)
            const speed = calculateNetworkSpeed(prevNetworkRef.current, net)
            setNetworkSpeed(speed)
            prevNetworkRef.current = net
        }
    }

    // ==================================== ray enable ====================================
    const handleRayEnable = async (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.checked
        if (value) {
            let c = await readRayConfig()
            if (!c || !c.inbounds || !c.outbounds) {
                setErrorMsg(true)
                setTimeout(() => setErrorMsg(false), 2500)
                showSnackbar('无服务器可以启用', 'error', 2000)
                return
            }
        }

        setRayEnable(value)
        setAppConfig('set_ray_enable', value)
    }

    const {SnackbarComponent, showSnackbar} = useSnackbar()
    return (<>
        <SnackbarComponent/>
        <Paper className="scr-none" elevation={5} sx={{
            p: 2, borderRadius: 2, width: '100%', height: `calc(100vh - 20px)`, overflow: 'auto',
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <Stack spacing={2} sx={{minWidth: 620, m: 'auto'}}>
                <Stack direction="row" elevation={2} component={Card} sx={{p: 1, justifyContent: 'space-between', alignItems: 'center'}}>
                    <Typography variant="body1" sx={{paddingLeft: 1}}>Ray 服务</Typography>
                    <Switch checked={rayEnable} onChange={handleRayEnable} sx={{transform: 'scale(1.3)'}}/>
                </Stack>

                <TableContainer elevation={2} component={Card}>
                    <Table className="table" size="small">
                        <TableBody>
                            <TableRow>
                                <TableCell>开机时间</TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" component="span">{formatTimestamp(bootTime)}</Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>已经运行</TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" component="span" color="info">{formatTime(runTime)}</Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>CPU 架构</TableCell><TableCell align="right">{sysInfo.cpu_arch}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Dray 版本</TableCell><TableCell align="right">{versionInfo.dray}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Rust 版本</TableCell><TableCell align="right">{versionInfo.rust}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                <TableContainer elevation={2} component={Card}>
                    <Table className="table" size="small">
                        <TableBody>
                            <TableRow>
                                <TableCell>上传速率</TableCell>
                                <TableCell align="right">{sizeToUnit(networkSpeed.upSpeed)}/s</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>下载速率</TableCell>
                                <TableCell align="right">{sizeToUnit(networkSpeed.downSpeed)}/s</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                <TableContainer elevation={2} component={Card}>
                    <Table className="table" size="small">
                        <TableBody>
                            <TableRow>
                                <TableCell>网络上传总量</TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" component="span" color="info">{sizeToUnit(network.up)}</Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>网络下载总量</TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" component="span" color="info">{sizeToUnit(network.down)}</Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>回环流出总量</TableCell>
                                <TableCell align="right">{sizeToUnit(network.loUp)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>回环流入总量</TableCell>
                                <TableCell align="right">{sizeToUnit(network.loDown)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                {rayEnable && rayCommonConfig.stats_enable && (<>
                    <BottomNavigation sx={{mb: 2}} showLabels component={Paper} elevation={2}
                                      value={boundType}
                                      onChange={(_, v) => setBoundType(v)}>
                        <BottomNavigationAction value="inbound" label="入站数据" icon={<InputIcon/>}/>
                        <BottomNavigationAction value="outbound" label="出站数据" icon={<OutputIcon/>}/>
                    </BottomNavigation>

                    {boundType === 'inbound' && (
                        <TableContainer elevation={2} component={Card}>
                            <Table className="table" size="small">
                                <TableBody>
                                    <TableRow>
                                        <TableCell>总上传流量</TableCell>
                                        <TableCell align="right">{sizeToUnit(inbound?.totalUp || 0)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>总下载流量</TableCell>
                                        <TableCell align="right">{sizeToUnit(inbound?.totalDown || 0)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>HTTP 上传流量</TableCell>
                                        <TableCell align="right">{sizeToUnit(inbound?.httpUp || 0)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>HTTP 下载流量</TableCell>
                                        <TableCell align="right">{sizeToUnit(inbound?.httpDown || 0)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>SOCKS 上传流量</TableCell>
                                        <TableCell align="right">{sizeToUnit(inbound?.socksUp || 0)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>SOCKS 下载流量</TableCell>
                                        <TableCell align="right">{sizeToUnit(inbound?.socksDown || 0)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {boundType === 'outbound' && (
                        <TableContainer elevation={2} component={Card}>
                            <Table className="table" size="small">
                                <TableBody>
                                    <TableRow>
                                        <TableCell>总上传流量</TableCell>
                                        <TableCell align="right">{sizeToUnit(outbound?.totalUp || 0)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>总下载流量</TableCell>
                                        <TableCell align="right">{sizeToUnit(outbound?.totalDown || 0)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>代理上传流量</TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" component="span" color="info">{sizeToUnit(outbound?.proxyUp || 0)}</Typography>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>代理下载流量</TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" component="span" color="info">{sizeToUnit(outbound?.proxyDown || 0)}</Typography>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>直连上传流量</TableCell>
                                        <TableCell align="right">{sizeToUnit(outbound?.directUp || 0)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>直连下载流量</TableCell>
                                        <TableCell align="right">{sizeToUnit(outbound?.directDown || 0)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    <TableContainer elevation={2} component={Card}>
                        <Table className="table" size="small">
                            <TableBody>
                                <TableRow>
                                    <TableCell>Xray 版本</TableCell><TableCell align="right">{versionInfo.xray}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Golang 版本</TableCell><TableCell align="right">{versionInfo.go}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>当前内存使用</TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2" component="span" color="info">{sizeToUnit(memStats.currentAlloc)}</Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>系统内存分配</TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2" component="span" color="info">{sizeToUnit(memStats.sys)}</Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>累计内存分配</TableCell>
                                    <TableCell align="right">{sizeToUnit(memStats.totalAlloc)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>GC 次数</TableCell>
                                    <TableCell align="right">{memStats.gcCount || 0}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>GC 总耗时</TableCell>
                                    <TableCell align="right">{formatSecond(memStats.pauseTotalMs)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>上次 GC 时间</TableCell>
                                    <TableCell align="right">{formatTimestamp(memStats.lastGC)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>)}
            </Stack>
        </Paper>
    </>)
}

export default Home
