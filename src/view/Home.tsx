import { useState, useEffect, useRef } from 'react'
import {
    BottomNavigation, BottomNavigationAction,
    Card, Paper, Stack, Typography, Switch,
    TableContainer, Table, TableBody, TableCell, TableRow,
} from '@mui/material'
import InputIcon from '@mui/icons-material/Input'
import OutputIcon from '@mui/icons-material/Output'

import { getNetworksJson, getSysInfoJson, readAppConfig, readRayCommonConfig, setAppConfig } from "../util/invoke.ts"
import { useDebounce } from "../hook/useDebounce.ts"
import { formatTime, formatTimestamp, sizeToUnit } from "../util/util.ts"
import { calculateNetworkSpeed, getStatsData, sumNetworks } from "../util/network.ts"
import { useVisibility } from "../hook/useVisibility.ts"

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

const Home: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(0), [setNavState])

    // 从配置文件中读取配置信息
    const [rayEnable, setRayEnable] = useState(false)
    const statsPortRef = useRef(0)
    const initConf = useDebounce(async () => {
        const appConf = await readAppConfig()
        const rayEnable = Boolean(appConf && appConf.ray_enable)
        setRayEnable(rayEnable)

        const rayConf = await readRayCommonConfig()
        statsPortRef.current = rayConf?.stats_port || 0
        if (rayEnable && statsPortRef.current > 0) await loadStats(statsPortRef.current)

        await getSysInfo()
        await getNetworkData()
    }, 100)
    useEffect(initConf, [])

    // ==================================== stats ====================================
    const [boundType, setBoundType] = useState('outbound')
    const [inbound, setInbound] = useState<Inbound | null>()
    const [outbound, setOutbound] = useState<Outbound | null>()
    const loadStats = async (port: number) => {
        const r = await getStatsData(port) as any
        if (r) {
            r.inbound && setInbound(r.inbound)
            r.outbound && setOutbound(r.outbound)
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

    const intervalRef = useRef<number>(0)
    const isVisibility = useVisibility()
    useEffect(() => {
        if (isVisibility) {
            intervalRef.current = setInterval(async () => {
                const runTime = Math.floor(Date.now() / 1000) - bootTime
                setRunTime(Math.max(0, runTime))

                await loadStats(statsPortRef.current)
                await getNetworkData()
            }, 1000)
        }
        return () => clearInterval(intervalRef.current)
    }, [isVisibility, bootTime])

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

    const handleRayEnable = async (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.checked
        setRayEnable(value)
        setAppConfig('set_ray_enable', value)
    }

    const lastSx = {'&:last-child td, &:last-child th': {border: 0}}
    return (
        <Paper elevation={5} sx={{p: 2, width: '100%', height: `calc(100vh - 20px)`, borderRadius: 2, overflow: 'auto'}}>
            <Stack spacing={2} sx={{maxWidth: 600, margin: 'auto'}}>
                <Stack direction="row" elevation={2} component={Card} sx={{p: 2, justifyContent: 'space-between', alignItems: 'center'}}>
                    <Typography variant="body1" sx={{paddingLeft: 1}}>Ray 服务</Typography>
                    <Switch checked={rayEnable} onChange={handleRayEnable} sx={{transform: 'scale(1.3)'}}/>
                </Stack>

                <TableContainer elevation={2} component={Card}>
                    <Table size="small">
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
                            <TableRow sx={lastSx}>
                                <TableCell>CPU 架构</TableCell><TableCell align="right">{sysInfo.cpu_arch}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                <TableContainer elevation={2} component={Card}>
                    <Table size="small">
                        <TableBody>
                            <TableRow>
                                <TableCell>当前上传速率</TableCell>
                                <TableCell align="right">{sizeToUnit(networkSpeed.upSpeed)}/s</TableCell>
                            </TableRow>
                            <TableRow sx={lastSx}>
                                <TableCell>当前下载速率</TableCell>
                                <TableCell align="right">{sizeToUnit(networkSpeed.downSpeed)}/s</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                <TableContainer elevation={2} component={Card}>
                    <Table size="small">
                        <TableBody>
                            <TableRow>
                                <TableCell>网络上传总量</TableCell>
                                <TableCell align="right">{sizeToUnit(network.up)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>网络下载总量</TableCell>
                                <TableCell align="right">{sizeToUnit(network.down)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>回环流出总量</TableCell>
                                <TableCell align="right">{sizeToUnit(network.loUp)}</TableCell>
                            </TableRow>
                            <TableRow sx={lastSx}>
                                <TableCell>回环流入总量</TableCell>
                                <TableCell align="right">{sizeToUnit(network.loDown)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                {rayEnable && (<>
                    <BottomNavigation sx={{mb: 2}} showLabels component={Paper} elevation={2}
                                      value={boundType}
                                      onChange={(_, v) => setBoundType(v)}>
                        <BottomNavigationAction value="inbound" label="流入数据" icon={<InputIcon/>}/>
                        <BottomNavigationAction value="outbound" label="流出数据" icon={<OutputIcon/>}/>
                    </BottomNavigation>

                    {boundType === 'inbound' && (
                        <TableContainer elevation={2} component={Card}>
                            <Table size="small">
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
                                    <TableRow sx={lastSx}>
                                        <TableCell>SOCKS 下载流量</TableCell>
                                        <TableCell align="right">{sizeToUnit(inbound?.socksDown || 0)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {boundType === 'outbound' && (
                        <TableContainer elevation={2} component={Card}>
                            <Table size="small">
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
                                        <TableCell align="right">{sizeToUnit(outbound?.proxyUp || 0)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>代理下载流量</TableCell>
                                        <TableCell align="right">{sizeToUnit(outbound?.proxyDown || 0)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>直连上传流量</TableCell>
                                        <TableCell align="right">{sizeToUnit(outbound?.directUp || 0)}</TableCell>
                                    </TableRow>
                                    <TableRow sx={lastSx}>
                                        <TableCell>直连下载流量</TableCell>
                                        <TableCell align="right">{sizeToUnit(outbound?.directDown || 0)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </>)}
            </Stack>
        </Paper>
    )
}

export default Home
