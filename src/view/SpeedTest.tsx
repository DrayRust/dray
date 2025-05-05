import { useState, useEffect, useRef } from 'react'
import {
    Drawer, Button, Box, BottomNavigation, BottomNavigationAction, Card, Chip, Paper, Stack,
    IconButton, Typography, TextField, MenuItem, LinearProgress,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow'
import TuneIcon from '@mui/icons-material/Tune'
import StorageIcon from '@mui/icons-material/Storage'

import { LineChart } from '@mui/x-charts/LineChart'

import { SpeedGauge } from "../component/SpeedGauge.tsx"
import { useChip } from "../component/useChip.tsx"
import { useDebounce } from "../hook/useDebounce.ts"
import { formatSecond, processLines } from "../util/util.ts"
import {
    downloadSpeedTest, fetchTextContent, getNetworksJson, jitterTest, pingTest,
    readAppConfig, readSpeedTestConfig, saveSpeedTestConfig, uploadSpeedTest
} from "../util/invoke.ts"
import { DEFAULT_APP_CONFIG, DEFAULT_SPEED_TEST_CONFIG } from "../util/config.ts"
import { calculateNetworkSpeed, sumNetworks } from "../util/network.ts"
import { useVisibility } from "../hook/useVisibility.ts"

const userAgent = navigator.userAgent

interface TestUrlRow {
    name: string;
    url: string;
}

export const SpeedTest = () => {
    const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_APP_CONFIG)

    const [ipTestList, setIpTestList] = useState<TestUrlRow[]>([])
    const [pingList, setPingList] = useState<TestUrlRow[]>([])
    const [downloadList, setDownloadList] = useState<TestUrlRow[]>([])
    const [uploadList, setUploadList] = useState<TestUrlRow[]>([])

    const [isTesting, setIsTesting] = useState(false)
    const [ipTestUrl, setIpTestUrl] = useState<string>('')
    const [pingUrl, setPingUrl] = useState<string>('')
    const [downloadUrl, setDownloadUrl] = useState<string>('')
    const [uploadUrl, setUploadUrl] = useState<string>('')

    const [speedTestConfig, setSpeedTestConfig] = useState<SpeedTestConfig>(DEFAULT_SPEED_TEST_CONFIG)
    const loadConfig = useDebounce(async () => {
        const newConfig = await readAppConfig()
        if (newConfig) setAppConfig({...DEFAULT_APP_CONFIG, ...newConfig})

        let conf = await readSpeedTestConfig() as SpeedTestConfig
        conf = conf ? {...DEFAULT_SPEED_TEST_CONFIG, ...conf} : DEFAULT_SPEED_TEST_CONFIG
        setSpeedTestConfig(conf)

        loadList(conf)
    }, 100)
    useEffect(loadConfig, [])

    const loadList = (conf: SpeedTestConfig) => {
        const ipTestList = extractNames(conf.ipTestContent)
        const pingList = extractNames(conf.pingContent)
        const downloadList = extractNames(conf.downloadContent)
        const uploadList = extractNames(conf.uploadContent)

        setIpTestList(ipTestList)
        setPingList(pingList)
        setDownloadList(downloadList)
        setUploadList(uploadList)

        setIpTestUrl(ipTestList[conf.ipTestActive]?.url || '')
        setPingUrl(pingList[conf.pingActive]?.url || '')
        setDownloadUrl(downloadList[conf.downloadActive]?.url || '')
        setUploadUrl(uploadList[conf.uploadActive]?.url || '')
    }

    const getProxyUrl = () => {
        return appConfig.ray_enable ? `socks5://${appConfig.ray_host}:${appConfig.ray_socks_port}` : ''
    }

    const extractNames = (content: string): TestUrlRow[] => {
        const result: TestUrlRow[] = []
        const lines = processLines(content)
        for (const line of lines) {
            const arr = line.split('#')
            const url = arr?.[0] || line
            const name = arr?.[1] || line
            result.push({name, url})
        }
        return result
    }

    const handleConfigChange = (name: keyof SpeedTestConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setSpeedTestConfig(prev => ({...prev, [name]: e.target.value}))
    }

    // ============== Submit ==============
    const handleSubmit = async () => {
        let newConf = {...speedTestConfig}
        newConf.ipTestContent = processLines(newConf.ipTestContent).join('\n')
        newConf.pingContent = processLines(newConf.pingContent).join('\n')
        newConf.downloadContent = processLines(newConf.downloadContent).join('\n')
        newConf.uploadContent = processLines(newConf.uploadContent).join('\n')

        if (!newConf.ipTestContent) newConf.ipTestContent = DEFAULT_SPEED_TEST_CONFIG.ipTestContent
        if (!newConf.pingContent) newConf.pingContent = DEFAULT_SPEED_TEST_CONFIG.pingContent
        if (!newConf.downloadContent) newConf.downloadContent = DEFAULT_SPEED_TEST_CONFIG.downloadContent
        if (!newConf.uploadContent) newConf.uploadContent = DEFAULT_SPEED_TEST_CONFIG.uploadContent

        const ok = await saveSpeedTestConfig(newConf)
        if (!ok) {
            showChip('保存失败', 'error')
            return
        }
        showChip('保存成功', 'success')

        loadList(newConf)
        setSpeedTestConfig(newConf)
    }

    // ============== Test All ==============
    const handleTestAll = async () => {
        handleResetAll()
        await handleGetIP()
        await handleStartPing()
        await handleStartJitter()
        await handleStartDownload()
        await handleStartUpload()
    }

    const handleResetAll = () => {
        setPubIpData('')
        setPingData([])
        setPingValue('')
        setJitterData([])
        setJitterValue('')
        setDownloadTestState(0)
        setUploadTestState(0)
    }

    // ============== Public IP Test ==============
    const [pubIpData, setPubIpData] = useState('')
    const [pubIpElapsed, setPubIpElapsed] = useState(0)
    const [pubIpTesting, setPubIpTesting] = useState(false)
    const handleGetIP = async () => {
        if (!ipTestUrl) return
        setIsTesting(true)
        setPubIpTesting(true)

        const startTime = performance.now()
        const result = await fetchTextContent(ipTestUrl, getProxyUrl(), 'curl/8.7.1')
        const elapsed = Math.floor(performance.now() - startTime)
        setPubIpElapsed(elapsed)

        if (result?.ok) {
            setPubIpData(result.body)
        }

        setIsTesting(false)
        setPubIpTesting(false)
    }

    // ============== Ping Test ==============
    const [pingData, setPingData] = useState<any[]>([])
    const [pingValue, setPingValue] = useState('')
    const [pingElapsed, setPingElapsed] = useState(0)
    const [pingTesting, setPingTesting] = useState(false)
    const handleStartPing = async () => {
        if (!pingUrl) return
        setIsTesting(true)
        setPingTesting(true)

        const startTime = performance.now()
        const result = await pingTest(pingUrl, getProxyUrl(), userAgent, 5)
        const elapsed = Math.floor(performance.now() - startTime)
        setPingElapsed(elapsed)

        if (result?.ok) {
            setPingData([{label: 'Ping (ms)', data: [0, ...(result?.samples || [])]}])
            setPingValue(Math.round(result?.avg_latency_ms || 0) + ' ms')
        }

        setIsTesting(false)
        setPingTesting(false)
    }

    // ============== Jitter Test ==============
    const [jitterData, setJitterData] = useState<any[]>([])
    const [jitterValue, setJitterValue] = useState('')
    const [jitterElapsed, setJitterElapsed] = useState(0)
    const [jitterTesting, setJitterTesting] = useState(false)
    const handleStartJitter = async () => {
        if (!pingUrl) return
        setIsTesting(true)
        setJitterTesting(true)

        const startTime = performance.now()
        const result = await jitterTest(pingUrl, getProxyUrl(), userAgent, 20)
        const elapsed = Math.floor(performance.now() - startTime)
        setJitterElapsed(elapsed)

        if (result?.ok) {
            setJitterData([{label: 'Jitter (ms)', data: [0, ...(result?.samples || [])]}])
            setJitterValue(Math.round(result?.jitter_ms || 0) + ' ms')
        }

        setIsTesting(false)
        setJitterTesting(false)
    }

    // ============== Download Test ==============
    const [downloadPercent, setDownloadPercent] = useState(0)
    const [downloadValue, setDownloadValue] = useState('')
    const [downloadElapsed, setDownloadElapsed] = useState(0)
    const [downloadTestState, setDownloadTestState] = useState(0)
    const handleStartDownload = async () => {
        if (!downloadUrl) return
        firstNetwork.current = true
        setIsTesting(true)
        setDownloadTestState(1)
        setDownloadSpeed(0)

        const startTime = performance.now()
        const result = await downloadSpeedTest(downloadUrl, getProxyUrl(), userAgent)
        const elapsed = Math.floor(performance.now() - startTime)
        setDownloadElapsed(elapsed)

        if (result?.ok) {
            let speed_mbps = result?.speed_mbps || 0
            if (speed_mbps) setDownloadSpeed(speed_mbps)
        }

        setIsTesting(false)
        setDownloadTestState(2)
    }

    const setDownloadSpeed = (speed_mbps: number) => {
        setDownloadValue(speed_mbps.toFixed(2) + ` Mbps`)
        setDownloadPercent(calcPercentage(speed_mbps))
    }

    // ============== Upload Test ==============
    const [uploadPercent, setUploadPercent] = useState(0)
    const [uploadValue, setUploadValue] = useState('')
    const [uploadElapsed, setUploadElapsed] = useState(0)
    const [uploadTestState, setUploadTestState] = useState(0)
    const handleStartUpload = async () => {
        if (!uploadUrl) return
        firstNetwork.current = true
        setIsTesting(true)
        setUploadTestState(1)
        setUploadSpeed(0)

        const startTime = performance.now()
        const result = await uploadSpeedTest(uploadUrl, getProxyUrl(), userAgent, 10)
        const elapsed = Math.floor(performance.now() - startTime)
        setUploadElapsed(elapsed)

        if (result?.ok) {
            let speed_mbps = result?.speed_mbps || 0
            if (speed_mbps) setUploadSpeed(speed_mbps)
        }

        setIsTesting(false)
        setUploadTestState(2)
    }

    const setUploadSpeed = (speed_mbps: number) => {
        setUploadValue(speed_mbps.toFixed(1) + ` Mbps`)
        setUploadPercent(calcPercentage(speed_mbps))
    }

    // ============== Calc Percentage ==============
    const calcPercentage = (speed: number) => {
        speed = Number(speed) || 0
        speed = speed < 0 ? 0 : speed
        const maxSpeed = 100
        if (speed >= maxSpeed) return 100
        return Number(Math.min(((speed / maxSpeed) * 100), 100).toFixed(1))
    }

    // ==================================== interval ====================================
    const intervalRef = useRef<number>(0)
    const isVisibility = useVisibility()
    useEffect(() => {
        if (isVisibility && (uploadTestState === 1 || downloadTestState === 1)) {
            intervalRef.current = setInterval(async () => {
                await getNetworkData()
            }, 500)
        }
        return () => clearInterval(intervalRef.current)
    }, [isVisibility, uploadTestState, downloadTestState])

    // ==================================== network ====================================
    const firstNetwork = useRef(true)
    const prevNetworkRef = useRef({up: 0, down: 0})
    const getNetworkData = async () => {
        let currentNetwork = await getNetworksJson()
        if (currentNetwork) {
            const net = sumNetworks(currentNetwork)
            const speed = calculateNetworkSpeed(prevNetworkRef.current, net, 0.5)
            if (!firstNetwork.current) {
                if (downloadTestState === 1) setDownloadSpeed(speed.downSpeed * 8 / 1e6) // 转换为 Mbps
                if (uploadTestState === 1) setUploadSpeed(speed.upSpeed * 8 / 1e6) // 转换为 Mbps
            }
            firstNetwork.current = false
            prevNetworkRef.current = net
        }
    }

    const [open, setOpen] = useState(false)
    const [tab, setTab] = useState(0)
    const handleOpen = () => {
        setOpen(true)
    }
    const handleClose = () => {
        setOpen(false)
    }

    const {ChipComponent, showChip} = useChip()
    return (<>
        <Drawer anchor="right" open={open} onClose={handleClose}>
            <Stack spacing={2} sx={{p: 2, minWidth: 700}}>
                <DoubleArrowIcon onClick={handleClose}/>

                <BottomNavigation
                    showLabels
                    component={Card}
                    sx={{mb: 2, mt: 1}}
                    value={tab}
                    onChange={(_, v) => setTab(v)}>
                    <BottomNavigationAction label="测速配置" icon={<TuneIcon/>}/>
                    <BottomNavigationAction label="测速资源" icon={<StorageIcon/>}/>
                </BottomNavigation>

                <Stack component={Card} elevation={3} spacing={3} sx={{p: 1, pt: 2}}>
                    {tab === 0 ? (<>
                        <TextField
                            select fullWidth size="small"
                            label="IP 测试"
                            value={speedTestConfig.ipTestActive}
                            onChange={handleConfigChange('ipTestActive')}>
                            {ipTestList.map((item, key) => (
                                <MenuItem key={key} value={key}>{item.name}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select fullWidth size="small"
                            label="Ping 测试"
                            value={speedTestConfig.pingActive}
                            onChange={handleConfigChange('pingActive')}>
                            {pingList.map((item, key) => (
                                <MenuItem key={key} value={key}>{item.name}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select fullWidth size="small"
                            label="下载测速"
                            value={speedTestConfig.downloadActive}
                            onChange={handleConfigChange('downloadActive')}>
                            {downloadList.map((item, key) => (
                                <MenuItem key={key} value={key}>{item.name}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select fullWidth size="small"
                            label="上传测速"
                            value={speedTestConfig.uploadActive}
                            onChange={handleConfigChange('uploadActive')}>
                            {uploadList.map((item, key) => (
                                <MenuItem key={key} value={key}>{item.name}</MenuItem>
                            ))}
                        </TextField>
                    </>) : tab === 1 && (<>
                        <TextField
                            multiline minRows={2} maxRows={6}
                            size="small"
                            label="IP 测试链接"
                            value={speedTestConfig.ipTestContent}
                            onChange={handleConfigChange('ipTestContent')}/>
                        <TextField
                            multiline minRows={2} maxRows={6}
                            size="small"
                            label="Ping 测试链接"
                            value={speedTestConfig.pingContent}
                            onChange={handleConfigChange('pingContent')}/>
                        <TextField
                            multiline minRows={2} maxRows={6}
                            size="small"
                            label="下载测速链接"
                            value={speedTestConfig.downloadContent}
                            onChange={handleConfigChange('downloadContent')}/>
                        <TextField
                            multiline minRows={2} maxRows={6}
                            size="small"
                            label="下载测速服务"
                            value={speedTestConfig.uploadContent}
                            onChange={handleConfigChange('uploadContent')}/>
                    </>)}
                </Stack>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Button variant="contained" color="info" onClick={handleSubmit}>确定</Button>
                    <ChipComponent/>
                </Stack>
            </Stack>
        </Drawer>

        <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{position: 'relative'}}>
                <Stack direction="row" justifyContent="center" spacing={1}>
                    <Button variant="contained" disabled={isTesting} color="secondary" onClick={handleTestAll}>测试全部</Button>
                    <Button variant="contained" disabled={isTesting} color="warning" onClick={handleResetAll}>清除结果</Button>
                </Stack>
                <IconButton color="default" onClick={handleOpen} sx={{position: 'absolute', right: 0, top: 2}}><SettingsIcon/></IconButton>
            </Stack>

            <Card elevation={3}>
                <Paper elevation={2} sx={{p: 1, px: 1.5, mb: '1px', borderRadius: '8px 8px 0 0'}}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1">公网 IP</Typography>
                        {pubIpData.length > 0 && (
                            <Chip variant="outlined" size="small" label={`测试耗时: ${formatSecond(pubIpElapsed)}`} color="info"/>
                        )}
                    </Stack>
                </Paper>
                <Box sx={{p: 2, height: 180, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    {pubIpTesting ? (
                        <LinearProgress sx={{height: 10, width: '90%', borderRadius: 5}}/>
                    ) : pubIpData.length === 0 ? (
                        <Button variant="contained" disabled={isTesting} onClick={handleGetIP}>开始测试</Button>
                    ) : (
                        <TextField fullWidth multiline rows={5} size="small" label="返回信息" value={pubIpData}/>
                    )}
                </Box>
            </Card>

            <Card elevation={3}>
                <Paper elevation={2} sx={{p: 1, px: 1.5, mb: '1px', borderRadius: '8px 8px 0 0'}}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1">Ping</Typography>
                        {pingData.length > 0 && (
                            <Stack direction="row" justifyContent="end" alignItems="center" spacing={1}>
                                <Chip variant="outlined" size="small" label={`平均: ${pingValue}`} color="info"/>
                                <Chip variant="outlined" size="small" label={`测试耗时: ${formatSecond(pingElapsed)}`} color="info"/>
                            </Stack>
                        )}
                    </Stack>
                </Paper>
                <Box sx={{height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    {pingTesting ? (
                        <LinearProgress sx={{height: 10, width: '90%', borderRadius: 5}}/>
                    ) : pingData.length === 0 ? (
                        <Button variant="contained" disabled={isTesting} onClick={handleStartPing}>开始测试</Button>
                    ) : (
                        <LineChart series={pingData} height={160}/>
                    )}
                </Box>
            </Card>

            <Card elevation={3}>
                <Paper elevation={2} sx={{p: 1, px: 1.5, mb: '1px', borderRadius: '8px 8px 0 0'}}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1">抖动</Typography>
                        {jitterData.length > 0 && (
                            <Stack direction="row" justifyContent="end" alignItems="center" spacing={1}>
                                <Chip variant="outlined" size="small" label={`抖动: ${jitterValue}`} color="info"/>
                                <Chip variant="outlined" size="small" label={`测试耗时: ${formatSecond(jitterElapsed)}`} color="info"/>
                            </Stack>
                        )}
                    </Stack>
                </Paper>
                <Box sx={{height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    {jitterTesting ? (
                        <LinearProgress sx={{height: 10, width: '90%', borderRadius: 5}}/>
                    ) : jitterData.length === 0 ? (
                        <Button variant="contained" disabled={isTesting} onClick={handleStartJitter}>开始测试</Button>
                    ) : (
                        <LineChart series={jitterData} height={160}/>
                    )}
                </Box>
            </Card>

            <Stack direction="row" justifyContent="center" spacing={1}>
                <Card elevation={3} sx={{flex: 1, alignItems: 'center'}}>
                    <Paper elevation={2} sx={{p: 1, px: 1.5, mb: '1px', borderRadius: '8px 8px 0 0'}}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1">下载</Typography>
                            {downloadTestState === 2 && (
                                <Chip variant="outlined" size="small" label={`测试耗时: ${formatSecond(downloadElapsed)}`} color="info"/>
                            )}
                        </Stack>
                    </Paper>
                    <Box sx={{height: 240, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        {downloadTestState === 0 ? (
                            <Button variant="contained" disabled={isTesting} onClick={handleStartDownload}>开始测速</Button>
                        ) : (
                            <SpeedGauge percent={downloadPercent} value={downloadValue}/>
                        )}
                    </Box>
                </Card>

                <Card elevation={3} sx={{flex: 1, alignItems: 'center'}}>
                    <Paper elevation={2} sx={{p: 1, px: 1.5, mb: '1px', borderRadius: '8px 8px 0 0'}}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1">上传</Typography>
                            {uploadTestState === 2 && (
                                <Chip variant="outlined" size="small" label={`测试耗时: ${formatSecond(uploadElapsed)}`} color="info"/>
                            )}
                        </Stack>
                    </Paper>
                    <Box sx={{height: 240, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        {uploadTestState === 0 ? (
                            <Button variant="contained" disabled={isTesting} onClick={handleStartUpload}>开始测速</Button>
                        ) : (
                            <SpeedGauge percent={uploadPercent} value={uploadValue}/>
                        )}
                    </Box>
                </Card>
            </Stack>
        </Stack>
    </>)
}

export default SpeedTest
