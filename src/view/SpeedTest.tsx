import { useState, useEffect } from 'react'
import {
    Dialog, Button, Box, BottomNavigation, BottomNavigationAction, Card, Chip, Paper, Stack,
    IconButton, Typography, TextField, MenuItem, LinearProgress,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'

import { LineChart } from '@mui/x-charts/LineChart'

import { SpeedGauge } from "../component/SpeedGauge.tsx"
import { useDebounce } from "../hook/useDebounce.ts"
import { formatSecond, processLines } from "../util/util.ts"
import { downloadSpeedTest, fetchGet, jitterTest, pingTest, readAppConfig, readSpeedTestConfig, saveSpeedTestConfig, uploadSpeedTest } from "../util/invoke.ts"
import { DEFAULT_APP_CONFIG } from "../util/config.ts"

const DEFAULT_SPEED_TEST_CONFIG: SpeedTestConfig = {
    "pingActive": 0,
    "downloadActive": 0,
    "uploadActive": 0,
    "pingContent": "http://www.gstatic.com/generate_204#谷歌网络检测\nhttp://www.google.com/generate_204#谷歌备用检测\nhttp://cp.cloudflare.com/generate_204#Cloudflare网络检测\nhttp://captive.apple.com/hotspot-detect.htm#苹果网络检测\nhttp://www.msftconnecttest.com/connecttest.txt#微软网络检测",
    "downloadContent": "https://cachefly.cachefly.net/50mb.test#CacheFly（全球高速 CDN）\nhttp://ipv4.download.thinkbroadband.com/50MB.zip#ThinkBroadband（英国）\nhttps://nbg1-speed.hetzner.com/100MB.bin#Hetzner（德国数据中心）\nhttp://proof.ovh.net/files/100Mb.dat#OVH（法国）\nhttps://speedtest.tokyo2.linode.com/100MB-tokyo2.bin#Linode（日本东京）\nhttp://speedtest.tele2.net/100MB.zip#Tele2（瑞典）",
    "uploadContent": "https://speedtest.serverius.net/upload.php#Serverius（荷兰）\nhttps://speedtest.wifirst.net/upload.php#Wifirst（法国）\nhttps://speedtest.netzwerge.de/upload.php#Netzwerge（德国）\nhttps://speedtest.lambdanet.co/upload.php#LambdaNet（美国）"
}

const userAgent = navigator.userAgent

interface TestUrlRow {
    name: string;
    url: string;
}

export const SpeedTest = () => {
    const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_APP_CONFIG)

    const [pingList, setPingList] = useState<TestUrlRow[]>([])
    const [downloadList, setDownloadList] = useState<TestUrlRow[]>([])
    const [uploadList, setUploadList] = useState<TestUrlRow[]>([])

    const [isTesting, setIsTesting] = useState(false)
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
        const pingList = extractNames(conf.pingContent)
        const downloadList = extractNames(conf.downloadContent)
        const uploadList = extractNames(conf.uploadContent)

        setPingList(pingList)
        setDownloadList(downloadList)
        setUploadList(uploadList)

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

    const handleSubmit = async () => {
        let newConf = {...speedTestConfig}
        newConf.pingContent = processLines(newConf.pingContent).join('\n')
        newConf.downloadContent = processLines(newConf.downloadContent).join('\n')
        newConf.uploadContent = processLines(newConf.uploadContent).join('\n')
        const ok = await saveSpeedTestConfig(newConf)
        if (!ok) {
        }
        loadList(newConf)
        handleClose()
    }

    // const [pubIP, setPubIP] = useState('')
    const handleGetIP = async () => {
        const result = await fetchGet("https://httpbin.org/ip")
        console.log('get IP result', result)
        const result2 = await fetchGet("https://myip.ipip.net/")
        console.log('get IP result', result2)
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
    const [downloadTesting, setDownloadTesting] = useState(false)
    const handleStartDownload = async () => {
        if (!downloadUrl) return
        setIsTesting(true)
        setDownloadTesting(true)

        const startTime = performance.now()
        const result = await downloadSpeedTest(downloadUrl, getProxyUrl(), userAgent)
        const elapsed = Math.floor(performance.now() - startTime)
        setDownloadElapsed(elapsed)

        console.log(result)
        if (result?.ok) {
            let speed = result?.speed_mbps || 0
            if (speed) {
                setDownloadValue(result.speed_mbps.toFixed(1) + ` Mbps`)
                setDownloadPercent(calcPercentage(speed))
            }
        }

        setIsTesting(false)
        setDownloadTesting(false)
    }

    const calcPercentage = (speed: number) => {
        speed = Number(speed) || 0
        speed = speed < 0 ? 0 : speed
        const maxSpeed = 100
        if (speed >= maxSpeed) return 100
        return Number(Math.min(((speed / maxSpeed) * 100), 100).toFixed(1))
    }

    // ============== Upload Test ==============
    const [uploadPercent, setUploadPercent] = useState(0)
    const [uploadValue, setUploadValue] = useState('')
    const [uploadElapsed, setUploadElapsed] = useState(0)
    const [uploadTesting, setUploadTesting] = useState(false)
    const handleStartUpload = async () => {
        if (!uploadUrl) return
        setIsTesting(true)
        setUploadTesting(true)

        const startTime = performance.now()
        const result = await uploadSpeedTest(uploadUrl, getProxyUrl(), userAgent, 5)
        const elapsed = Math.floor(performance.now() - startTime)
        setUploadElapsed(elapsed)

        if (result?.ok) {
            let speed = result?.speed_mbps || 0
            if (speed) {
                setUploadValue(result.speed_mbps.toFixed(1) + ` Mbps`)
                setUploadPercent(calcPercentage(speed))
            }
        }

        setIsTesting(false)
        setUploadTesting(false)
    }

    const handleStart = async () => {
        await handleStartPing()
        await handleStartJitter()
        await handleStartDownload()
        await handleStartUpload()
    }

    const [open, setOpen] = useState(false)
    const [tab, setTab] = useState(0)
    const handleOpen = () => {
        setOpen(true)
    }
    const handleClose = () => {
        setOpen(false)
    }

    return (<>
        <Dialog open={open} onClose={handleClose}>
            <Stack spacing={2} sx={{p: 2, minWidth: 580}}>
                <Stack spacing={2} component={Card} elevation={5} sx={{p: 1, pt: 2}}>
                    <BottomNavigation
                        showLabels
                        component={Card}
                        sx={{mb: 2, mt: 1}}
                        value={tab}
                        onChange={(_, v) => setTab(v)}>
                        <BottomNavigationAction label="测速设置"/>
                        <BottomNavigationAction label="测速服务"/>
                    </BottomNavigation>

                    {tab === 0 ? (<>
                        <TextField
                            select fullWidth size="small"
                            label="Ping 测试服务"
                            value={speedTestConfig.pingActive}
                            onChange={handleConfigChange('pingActive')}>
                            {pingList.map((item, key) => (
                                <MenuItem key={key} value={key}>{item.name}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select fullWidth size="small"
                            label="下载测速服务"
                            value={speedTestConfig.downloadActive}
                            onChange={handleConfigChange('downloadActive')}>
                            {downloadList.map((item, key) => (
                                <MenuItem key={key} value={key}>{item.name}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select fullWidth size="small"
                            label="上传测速服务"
                            value={speedTestConfig.uploadActive}
                            onChange={handleConfigChange('uploadActive')}>
                            {uploadList.map((item, key) => (
                                <MenuItem key={key} value={key}>{item.name}</MenuItem>
                            ))}
                        </TextField>
                    </>) : tab === 1 && (<>
                        <Stack spacing={2} component={Card} sx={{p: 1, pt: 2}}>
                            <TextField
                                multiline minRows={2} maxRows={10}
                                size="small"
                                label="Ping 测试链接"
                                placeholder="每行一条，用等于符号 (=) 分割，前为名称，后为链接"
                                value={speedTestConfig.pingContent}
                                onChange={handleConfigChange('pingContent')}/>
                            <TextField
                                multiline minRows={2} maxRows={10}
                                size="small"
                                label="下载测速链接"
                                placeholder="每行一条，用等于符号 (=) 分割，前为名称，后为链接"
                                value={speedTestConfig.downloadContent}
                                onChange={handleConfigChange('downloadContent')}/>
                            <TextField
                                multiline minRows={2} maxRows={10}
                                size="small"
                                label="下载测速服务"
                                placeholder="每行一条，用等于符号 (=) 分割，前为名称，后为链接"
                                value={speedTestConfig.uploadContent}
                                onChange={handleConfigChange('uploadContent')}/>
                        </Stack>
                    </>)}
                    <div className="flex-between">
                        <Button variant="contained" color="info" onClick={handleSubmit}>确定</Button>
                        <Button variant="contained" onClick={handleClose}>取消</Button>
                    </div>
                </Stack>
            </Stack>
        </Dialog>

        <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{position: 'relative'}}>
                <Stack direction="row" justifyContent="center" spacing={1}>
                    <Button variant="contained" onClick={handleGetIP}>获取公网 IP 地址</Button>
                    <Button variant="contained" onClick={handleStart}>全部测试</Button>
                </Stack>
                <IconButton color="default" onClick={handleOpen} sx={{position: 'absolute', right: 0, top: 2}}><SettingsIcon/></IconButton>
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center" component={Card} elevation={3} sx={{p: 2}}>
                <Typography variant="body1">公网 IP</Typography>
                -
            </Stack>

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
                            {downloadValue !== '' && (
                                <Chip variant="outlined" size="small" label={`测试耗时: ${formatSecond(downloadElapsed)}`} color="info"/>
                            )}
                        </Stack>
                    </Paper>
                    <Box sx={{height: 240, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        {downloadTesting ? (
                            <LinearProgress sx={{height: 10, width: '90%', borderRadius: 5}}/>
                        ) : downloadValue === '' ? (
                            <Button variant="contained" disabled={isTesting} onClick={handleStartDownload}>开始测试</Button>
                        ) : (
                            <SpeedGauge percent={downloadPercent} value={downloadValue}/>
                        )}
                    </Box>
                </Card>

                <Card elevation={3} sx={{flex: 1, alignItems: 'center'}}>
                    <Paper elevation={2} sx={{p: 1, px: 1.5, mb: '1px', borderRadius: '8px 8px 0 0'}}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1">上传</Typography>
                            {uploadValue !== '' && (
                                <Chip variant="outlined" size="small" label={`测试耗时: ${formatSecond(uploadElapsed)}`} color="info"/>
                            )}
                        </Stack>
                    </Paper>
                    <Box sx={{height: 240, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        {uploadTesting ? (
                            <LinearProgress sx={{height: 10, width: '90%', borderRadius: 5}}/>
                        ) : uploadValue === '' ? (
                            <Button variant="contained" disabled={isTesting} onClick={handleStartUpload}>开始测试</Button>
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
