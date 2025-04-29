import { useState, useEffect } from 'react'
import {
    BottomNavigation, BottomNavigationAction,
    Card, Paper, Stack, Typography, Switch,
    TableContainer, Table, TableBody, TableCell, TableRow,
} from '@mui/material'
import { fetchGet, log, readAppConfig, setAppConfig } from "../util/invoke.ts"
import { useDebounce } from "../hook/useDebounce.ts"
import { sizeToUnit } from "../util/util.ts"

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
    const [inbound, setInbound] = useState<Inbound | null>()
    const [outbound, setOutbound] = useState<Outbound | null>()
    const initConf = useDebounce(async () => {
        const appConf = await readAppConfig()
        if (appConf) setRayEnable(appConf.ray_enable)

        await statsData()
    }, 100)
    useEffect(initConf, [])

    async function statsData() {
        try {
            const s = await fetchGet('http://127.0.0.1:18686/debug/vars')
            if (!s) return

            const obj = JSON.parse(s)
            if (obj.stats) {
                const {inbound, outbound} = formatStats(obj.stats)
                setInbound(inbound)
                setOutbound(outbound)
            }
            console.log(obj.stats)
        } catch (err) {
            log.error(`Failed to debug vars json parse:`, err)
        }
    }

    // ==================================== stats ====================================
    const [boundType, setBoundType] = useState('outbound')
    const formatStats = (input: any) => {
        const safeGet = (obj: any, path: string) => {
            return path.split('.').reduce((acc, part) => {
                return acc && acc[part] !== undefined ? acc[part] : 0
            }, obj)
        }

        return {
            inbound: {
                totalUp: safeGet(input, 'inbound.http-in.uplink') + safeGet(input, 'inbound.socks-in.uplink'),
                totalDown: safeGet(input, 'inbound.http-in.downlink') + safeGet(input, 'inbound.socks-in.downlink'),
                httpUp: safeGet(input, 'inbound.http-in.uplink'),
                httpDown: safeGet(input, 'inbound.http-in.downlink'),
                socksUp: safeGet(input, 'inbound.socks-in.uplink'),
                socksDown: safeGet(input, 'inbound.socks-in.downlink'),
            },
            outbound: {
                totalUp: safeGet(input, 'outbound.proxy.uplink') + safeGet(input, 'outbound.direct.uplink'),
                totalDown: safeGet(input, 'outbound.proxy.downlink') + safeGet(input, 'outbound.direct.downlink'),
                proxyUp: safeGet(input, 'outbound.proxy.uplink'),
                proxyDown: safeGet(input, 'outbound.proxy.downlink'),
                directUp: safeGet(input, 'outbound.direct.uplink'),
                directDown: safeGet(input, 'outbound.direct.downlink'),
            }
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

                <BottomNavigation sx={{mb: 2}} showLabels component={Paper} elevation={2}
                                  value={boundType}
                                  onChange={(_, v) => setBoundType(v)}>
                    <BottomNavigationAction value="inbound" label="传入流量"/>
                    <BottomNavigationAction value="outbound" label="传出流量"/>
                </BottomNavigation>

                {boundType === 'inbound' && inbound && (
                    <TableContainer elevation={2} component={Card}>
                        <Table size="small">
                            <TableBody>
                                <TableRow>
                                    <TableCell>总上传流量</TableCell>
                                    <TableCell align="right">{sizeToUnit(inbound.totalUp)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>总下载流量</TableCell>
                                    <TableCell align="right">{sizeToUnit(inbound.totalDown)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>HTTP 上传流量</TableCell>
                                    <TableCell align="right">{sizeToUnit(inbound.httpUp)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>HTTP 下载流量</TableCell>
                                    <TableCell align="right">{sizeToUnit(inbound.httpDown)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>SOCKS 上传流量</TableCell>
                                    <TableCell align="right">{sizeToUnit(inbound.socksUp)}</TableCell>
                                </TableRow>
                                <TableRow sx={lastSx}>
                                    <TableCell>SOCKS 下载流量</TableCell>
                                    <TableCell align="right">{sizeToUnit(inbound.socksDown)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {boundType === 'outbound' && outbound && (
                    <TableContainer elevation={2} component={Card}>
                        <Table size="small">
                            <TableBody>
                                <TableRow>
                                    <TableCell>总上传流量</TableCell>
                                    <TableCell align="right">{sizeToUnit(outbound.totalUp)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>总下载流量</TableCell>
                                    <TableCell align="right">{sizeToUnit(outbound.totalDown)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>代理上传流量</TableCell>
                                    <TableCell align="right">{sizeToUnit(outbound.proxyUp)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>代理下载流量</TableCell>
                                    <TableCell align="right">{sizeToUnit(outbound.proxyDown)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>直连上传流量</TableCell>
                                    <TableCell align="right">{sizeToUnit(outbound.directUp)}</TableCell>
                                </TableRow>
                                <TableRow sx={lastSx}>
                                    <TableCell>直连下载流量</TableCell>
                                    <TableCell align="right">{sizeToUnit(outbound.directDown)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Stack>
        </Paper>
    )
}

export default Home
