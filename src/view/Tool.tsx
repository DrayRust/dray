import { useState, useEffect } from 'react'
import {
    Card, Chip, Box, Button, Paper, ToggleButtonGroup, ToggleButton, TextField
} from '@mui/material'
import TerminalIcon from '@mui/icons-material/Terminal'
import WysiwygIcon from '@mui/icons-material/Wysiwyg'
import SpeedIcon from '@mui/icons-material/Speed'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

import { readAppConfig, readRayCommonConfig } from "../util/invoke.ts"
import { DEFAULT_APP_CONFIG, DEFAULT_RAY_COMMON_CONFIG } from "../util/config.ts"
import { clipboardWriteText } from "../util/tauri.ts"

const Tool: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(5), [setNavState])

    const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_APP_CONFIG)
    const [rayConfig, setRayConfig] = useState<RayCommonConfig>(DEFAULT_RAY_COMMON_CONFIG)
    const [action, setAction] = useState('term')
    useEffect(() => {
        (async () => {
            let newAppConfig = await readAppConfig()
            if (newAppConfig) setAppConfig(newAppConfig)

            let newRayConfig = await readRayCommonConfig()
            if (newRayConfig) setRayConfig(newRayConfig)
        })()
    }, [])

    const getProxyEnv = () => {
        const {ray_host, ray_http_port, ray_socks_port} = appConfig
        const {http_enable} = rayConfig
        const http_port = http_enable ? ray_http_port : ray_socks_port
        return `export http_proxy=http://${ray_host}:${http_port};
export https_proxy=http://${ray_host}:${http_port};
export all_proxy=socks5://${ray_host}:${ray_socks_port}`
    }

    const [isCopied, setIsCopied] = useState(false)
    const handleCommandCopy = async (content: string) => {
        const ok = await clipboardWriteText(content)
        if (!ok) return
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
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
                    <TextField fullWidth multiline disabled size="small" label="代理命令" value={getProxyEnv()}/>
                    <Box sx={{mt: 2}}>
                        <Button variant="contained" color="info" startIcon={<ContentCopyIcon/>} onClick={() => handleCommandCopy(getProxyEnv())}>复制</Button>
                        {isCopied && <Chip label="复制成功" color="success" size="small" sx={{ml: 2}}/>}
                    </Box>
                </>)}
                {action === 'system' && (<></>)}
                {action === 'speed' && (<></>)}
            </Card>
        </Paper>
    )
}

export default Tool
