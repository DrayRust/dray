import { useState, useEffect, useRef } from 'react'
import {
    Card, Chip, Box, Button, BottomNavigation, BottomNavigationAction, Paper, Stack, ToggleButtonGroup, ToggleButton, TextField
} from '@mui/material'
import TerminalIcon from '@mui/icons-material/Terminal'
import WysiwygIcon from '@mui/icons-material/Wysiwyg'
import SpeedIcon from '@mui/icons-material/Speed'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

import { readAppConfig, readRayCommonConfig } from "../util/invoke.ts"
import { DEFAULT_APP_CONFIG, DEFAULT_RAY_COMMON_CONFIG } from "../util/config.ts"
import { clipboardWriteText } from "../util/tauri.ts"
import { isLinux, isMacOS, isWindows } from "../util/util.ts"

const Tool: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(5), [setNavState])

    const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_APP_CONFIG)
    const [rayConfig, setRayConfig] = useState<RayCommonConfig>(DEFAULT_RAY_COMMON_CONFIG)
    const [action, setAction] = useState('term')
    const [osType, setOsType] = useState('macOS')
    useEffect(() => {
        (async () => {
            let newAppConfig = await readAppConfig()
            if (newAppConfig) setAppConfig(newAppConfig)

            let newRayConfig = await readRayCommonConfig()
            if (newRayConfig) setRayConfig(newRayConfig)

            if (isMacOS()) setOsType('macOS')
            if (isLinux()) setOsType('linux')
            if (isWindows()) setOsType('windows')
        })()
    }, [])

    const getProxySetEnv = () => {
        const {ray_host, ray_http_port, ray_socks_port} = appConfig
        const {http_enable} = rayConfig
        const http_port = http_enable ? ray_http_port : ray_socks_port
        const cmd = osType === 'windows' ? 'set' : 'export'
        return `${cmd} http_proxy=http://${ray_host}:${http_port};
${cmd} https_proxy=http://${ray_host}:${http_port};
${cmd} all_proxy=socks5://${ray_host}:${ray_socks_port}`
    }

    const getProxyGetEnv = () => {
        return osType === 'windows' ? 'set | findstr /i "proxy"' : 'env | grep -i proxy'
    }

    const getProxyTestSocks = () => {
        return `curl -x socks5://${appConfig.ray_host}:${appConfig.ray_socks_port} https://www.google.com`
    }

    const getProxyTestHttp = () => {
        const http_port = rayConfig.http_enable ? appConfig.ray_http_port : appConfig.ray_socks_port
        return `curl -x http://${appConfig.ray_host}:${http_port} https://www.google.com`
    }

    const timeoutRef = useRef<number>(0)
    const [isCopied, setIsCopied] = useState(-1)
    const handleCommandCopy = async (type: number) => {
        let content = ''
        if (type === 0) {
            content = getProxySetEnv()
        } else if (type === 1) {
            content = getProxyGetEnv()
        } else if (type === 2) {
            content = getProxyTestSocks()
        } else if (type === 3) {
            content = getProxyTestHttp()
        }
        const ok = await clipboardWriteText(content)
        if (!ok) return

        setIsCopied(type)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => setIsCopied(-1), 2000)
    }

    return (
        <Paper elevation={5} sx={{p: 1, borderRadius: 2, height: 'calc(100vh - 20px)', overflow: 'visible'}}>
            <div className="flex-center p1">
                <ToggleButtonGroup exclusive value={action} onChange={(_, v) => v && setAction(v)}>
                    <ToggleButton value="term"><TerminalIcon sx={{mr: 1}}/>终端命令</ToggleButton>
                    <ToggleButton value="system"><WysiwygIcon sx={{mr: 1}}/>系统信息</ToggleButton>
                    <ToggleButton value="speed"><SpeedIcon sx={{mr: 1}}/>网速测试</ToggleButton>
                </ToggleButtonGroup>
            </div>
            <Card sx={{p: 2, maxWidth: '800px', maxHeight: 'calc(100% - 56px)', m: 'auto', overflow: 'auto'}}>
                {action === 'term' && (<>
                    <BottomNavigation sx={{mb: 2}} showLabels component={Paper} elevation={5}
                                      value={osType}
                                      onChange={(_, v) => setOsType(v)}>
                        <BottomNavigationAction value="windows" label="Windows"/>
                        <BottomNavigationAction value="macOS" label="MacOS"/>
                        <BottomNavigationAction value="linux" label="Linux"/>
                    </BottomNavigation>

                    <Stack spacing={1} component={Card} elevation={5} sx={{p: 1}}>
                        <Box sx={{pt: 1}}><TextField fullWidth multiline disabled size="small" label="设置代理命令" value={getProxySetEnv()}/></Box>
                        <Box>
                            <Button variant="contained" color="info" startIcon={<ContentCopyIcon/>} onClick={() => handleCommandCopy(0)}>复制</Button>
                            {isCopied === 0 && <Chip label="复制成功" color="success" size="small" sx={{ml: 2}}/>}
                        </Box>

                        <Box sx={{pt: 3}}><TextField fullWidth multiline disabled size="small" label="查看代理命令" value={getProxyGetEnv()}/></Box>
                        <Box>
                            <Button variant="contained" color="info" startIcon={<ContentCopyIcon/>} onClick={() => handleCommandCopy(1)}>复制</Button>
                            {isCopied === 1 && <Chip label="复制成功" color="success" size="small" sx={{ml: 2}}/>}
                        </Box>

                        <Box sx={{pt: 3}}><TextField fullWidth multiline disabled size="small" label="测试 SOCKS 代理" value={getProxyTestSocks()}/></Box>
                        <Box>
                            <Button variant="contained" color="info" startIcon={<ContentCopyIcon/>} onClick={() => handleCommandCopy(2)}>复制</Button>
                            {isCopied === 2 && <Chip label="复制成功" color="success" size="small" sx={{ml: 2}}/>}
                        </Box>

                        <Box sx={{pt: 3}}><TextField fullWidth multiline disabled size="small" label="测试 HTTP 代理" value={getProxyTestHttp()}/></Box>
                        <Box>
                            <Button variant="contained" color="info" startIcon={<ContentCopyIcon/>} onClick={() => handleCommandCopy(3)}>复制</Button>
                            {isCopied === 3 && <Chip label="复制成功" color="success" size="small" sx={{ml: 2}}/>}
                        </Box>
                    </Stack>
                </>)}
                {action === 'system' && (<></>)}
                {action === 'speed' && (<></>)}
            </Card>
        </Paper>
    )
}

export default Tool
