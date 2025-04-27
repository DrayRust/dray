import { useState, useEffect, useRef } from 'react'
import {
    Card, Dialog, Stack, Typography, Tooltip,
    TableContainer, Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material'
import HelpIcon from '@mui/icons-material/Help'

import Process from "./Process.tsx"
import { getComponentsJson, getDisksJson, getLoadAverageJson, getNetworksJson, getSysInfoJson } from "../util/invoke.ts"
import { useDebounce } from "../hook/useDebounce.ts"
import { useVisibility } from "../hook/useVisibility.ts"
import { IS_LINUX, IS_MAC_OS, calcPct, formatFloat, formatTime, sizeToUnit } from "../util/util.ts"

const SHOW_LOAD_AVERAGE = IS_MAC_OS || IS_LINUX
const BASE = IS_MAC_OS ? 1000 : 1024

export const SysInfo = () => {
    const [sysInfo, setSysInfo] = useState<any>({})
    const [loadAverage, setLoadAverage] = useState<any>({})
    const [disk, setDisk] = useState<any>([])
    const [network, setNetwork] = useState<any>([])
    const [components, setComponents] = useState<any>([])

    const prevNetworkRef = useRef({up: 0, down: 0})
    const [networkSpeed, setNetworkSpeed] = useState({upSpeed: 0, downSpeed: 0})
    const [open, setOpen] = useState(false)
    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    const loadData = useDebounce(async () => {
        // console.log('loadData', new Date().toISOString())
        let info = await getSysInfoJson()
        if (info) setSysInfo(info)

        if (SHOW_LOAD_AVERAGE) {
            let la = await getLoadAverageJson()
            if (la) setLoadAverage(la)
        }

        let c = await getComponentsJson()
        if (c) setComponents(c)

        let disks = await getDisksJson()
        if (disks) setDisk(sumDiskSpaces(disks))

        let currentNetwork = await getNetworksJson()
        if (currentNetwork) {
            const net = sumNetworks(currentNetwork)
            setNetwork(net)
            const speed = calculateNetworkSpeed(prevNetworkRef.current, net)
            setNetworkSpeed(speed)
            prevNetworkRef.current = net
        }
    }, 300)

    // 可见时，自动刷新数据
    const intervalRef = useRef<number>(0)
    const isVisibility = useVisibility()
    useEffect(() => {
        loadData()
        if (isVisibility && !open) intervalRef.current = setInterval(loadData, 1000)
        return () => clearInterval(intervalRef.current)
    }, [isVisibility, open])

    const formatComponentsLabel = (label: string) => {
        if (label === 'PECI CPU') return 'CPU 核心'
        if (label === 'CPU Proximity') return 'CPU 表面'
        if (label === 'Battery') return '电池'
        return label
    }

    const sumNetworks = (networks: any[]) => {
        let up = 0
        let down = 0
        let loUp = 0
        let loDown = 0
        for (const net of networks) {
            if (net.type === 'Loopback') {
                // 回环地址不计入网络流量统计
                loUp += net.up || 0
                loDown += net.down || 0
            } else {
                up += net.up || 0
                down += net.down || 0
            }
        }
        return {up, down, loUp, loDown}
    }

    /**
     * 计算每秒的上传和下载速率
     * @param prev 上一次的上传和下载总量
     * @param current 当前的上传和下载总量
     * @param interval 时间间隔（秒），默认值为 1
     * @returns 每秒的上传和下载速率（单位：字节/秒）
     */
    const calculateNetworkSpeed = (
        prev: { up: number; down: number },
        current: { up: number; down: number },
        interval: number = 1
    ): { upSpeed: number; downSpeed: number } => {
        const upSpeed = (current.up - prev.up) / interval
        const downSpeed = (current.down - prev.down) / interval
        return {upSpeed: Math.max(upSpeed, 0), downSpeed: Math.max(downSpeed, 0)}
    }

    const sumDiskSpaces = (disks: any[]) => {
        const nameArr: string[] = []
        let total_space = 0
        let available_space = 0
        for (const disk of disks) {
            if (nameArr.includes(disk.name)) continue
            nameArr.push(disk.name)
            total_space += disk.total_space
            available_space += disk.available_space
        }
        return {total_space, available_space, used_space: total_space - available_space}
    }

    const lastSx = {'&:last-child td, &:last-child th': {border: 0}}
    return (<>
        <Dialog fullScreen open={open} onClose={handleClose}>
            <Process handleClose={handleClose}/>
        </Dialog>

        <Stack spacing={2}>
            <TableContainer elevation={4} component={Card}>
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell>系统版本</TableCell><TableCell align="right">{sysInfo.long_os_version}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>内核版本</TableCell><TableCell align="right">{sysInfo.kernel_long_version}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>主机名</TableCell><TableCell align="right">{sysInfo.host_name}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>已运行</TableCell>
                            <TableCell align="right">
                                <Typography variant="body2" component="span" color="info">{formatTime(sysInfo.uptime)}</Typography>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>进程数</TableCell>
                            <TableCell align="right">
                                <Typography variant="body2" component="span" color="secondary" onClick={handleOpen}>{sysInfo.process_len}</Typography>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>硬盘 (disks)</TableCell>
                            <TableCell align="right">
                                <Typography variant="body2" component="span" color="info" sx={{pr: 2}}>{sizeToUnit(disk.available_space, BASE)} 可用</Typography>
                                {sizeToUnit(disk.used_space, BASE)} / {sizeToUnit(disk.total_space, BASE)}
                                <Typography variant="body2" component="span" color="warning" sx={{pl: 2}}>{calcPct(disk.used_space, disk.total_space)}</Typography>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>内存 (memory)</TableCell>
                            <TableCell align="right">
                                {sizeToUnit(sysInfo.used_memory)} / {sizeToUnit(sysInfo.total_memory)}
                                <Typography variant="body2" component="span" color="warning" sx={{pl: 2}}>{calcPct(sysInfo.used_memory, sysInfo.total_memory)}</Typography>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>交换分区 (swap)</TableCell>
                            <TableCell align="right">
                                {sysInfo.total_swap > 0 ? (<>
                                    {sizeToUnit(sysInfo.used_swap)} / {sizeToUnit(sysInfo.total_swap)}
                                    <Typography variant="body2" component="span" color="warning" sx={{pl: 2}}>{calcPct(sysInfo.used_swap, sysInfo.total_swap)}</Typography>
                                </>) : '-'}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>CPU 使用</TableCell>
                            <TableCell align="right">
                                <Typography variant="body2" component="span" color="warning">{formatFloat(sysInfo.global_cpu_usage, 1)}%</Typography>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>CPU 架构</TableCell><TableCell align="right">{sysInfo.cpu_arch}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>CPU 核数</TableCell><TableCell align="right">{sysInfo.cpu_len}</TableCell>
                        </TableRow>
                        <TableRow sx={lastSx}>
                            <TableCell>CPU 物理核数</TableCell><TableCell align="right">{sysInfo.physical_core_count}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            {SHOW_LOAD_AVERAGE && <TableContainer elevation={4} component={Card}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell align="right">1 分钟</TableCell>
                            <TableCell align="right">5 分钟</TableCell>
                            <TableCell align="right">15 分钟</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow sx={lastSx}>
                            <TableCell component="th" scope="row">
                                <div className="flex-center-gap1">
                                    系统负载平均值
                                    <Tooltip arrow placement="top" title="当超过 CPU 核数，则表示超负载运行">
                                        <HelpIcon fontSize="small" sx={{color: 'text.secondary'}}/>
                                    </Tooltip>
                                </div>
                            </TableCell>
                            <TableCell align="right">{formatFloat(loadAverage.one)}</TableCell>
                            <TableCell align="right">{formatFloat(loadAverage.five)}</TableCell>
                            <TableCell align="right">{formatFloat(loadAverage.fifteen)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>}

            <TableContainer elevation={4} component={Card}>
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell>网络上传总量</TableCell>
                            <TableCell align="right">{sizeToUnit(network.up)}</TableCell>
                        </TableRow>
                        <TableRow sx={lastSx}>
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

            <TableContainer elevation={4} component={Card}>
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

            <TableContainer elevation={4} component={Card}>
                <Table size="small">
                    <TableBody>
                        {components?.length > 0 && components.map((row: any, key: number) => (
                            <TableRow key={key} sx={lastSx}>
                                <TableCell>{formatComponentsLabel(row.label)}</TableCell>
                                <TableCell align="right">{formatFloat(row.temperature, 1)} ℃</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    </>)
}

export default SysInfo
