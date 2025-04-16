import { useState, useEffect } from 'react'
import {
    Alert, Box, Stack, BottomNavigation, BottomNavigationAction, Paper,
    Typography, Switch, TextField, MenuItem,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import TuneIcon from '@mui/icons-material/Tune'
import ListIcon from '@mui/icons-material/List'
import { readDnsConfig, readDnsModeList, readDnsTableList } from "../util/invoke.ts"

export const Dns = () => {
    const [dnsNav, setDnsNav] = useState(0)
    const [dnsConfig, setDnsConfig] = useState<DnsConfig>({
        enable: false,
        mode: 0,
    })
    const [dnsModeList, setDnsModeList] = useState<DnsModeList>([])
    const [dnsTableList, setDnsTableList] = useState<DnsTableList>([])
    useEffect(() => {
        (async () => {
            const config = await readDnsConfig() as DnsConfig
            if (config) setDnsConfig(config)

            const modeList = await readDnsModeList() as DnsModeList
            if (modeList) setDnsModeList(modeList)

            const tableList = await readDnsTableList() as DnsTableList
            if (tableList) setDnsTableList(tableList)
        })()
    }, [])

    const handleDnsEnabled = async (checked: boolean) => {
        setDnsConfig({...dnsConfig, enable: checked})
    }

    const handleDnsModeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setDnsConfig({...dnsConfig, mode: Number(e.target.value)})
    }

    return (<Stack spacing={2}>
        <BottomNavigation
            sx={{mb: 2}} elevation={5} component={Paper} showLabels
            value={dnsNav}
            onChange={(_, v) => setDnsNav(v)}>
            <BottomNavigationAction label="DNS 设置" icon={<SettingsIcon/>}/>
            <BottomNavigationAction label="模式管理" icon={<TuneIcon/>}/>
            <BottomNavigationAction label="常见 DNS" icon={<ListIcon/>}/>
        </BottomNavigation>
        {dnsNav === 0 && <Box>
            <div className="flex-between">
                <Typography variant="body1" sx={{pl: 1}}>启用内置 DNS</Typography>
                <Switch checked={dnsConfig.enable} onChange={(_, checked) => handleDnsEnabled(checked)}/>
            </div>
            {dnsConfig.enable && <TextField
                select fullWidth size="small" sx={{mt: 2}}
                label="采用模式"
                value={dnsConfig.mode}
                onChange={handleDnsModeChange}>
                {dnsModeList.map((item, index) => (
                    <MenuItem key={index} value={index}>{item.name}</MenuItem>
                ))}
            </TextField>}
            <Alert severity="info" sx={{mt: 2}}>
                DNS（Domain Name System，域名系统）是互联网的核心基础设施之一，其主要功能是将人类可读的域名（如 www.google.com）转换为计算机可识别的 IP 地址（如 142.250.190.14）
            </Alert>
            <Alert severity="warning" sx={{mt: .5}}>
                网络传输的底层依赖于 IP 地址，而域名则是 IP 地址的“别名”，这一设计旨在方便人类记忆和使用
            </Alert>
            <Alert severity="success" sx={{mt: .5}}>
                正确设置 DNS 可以提升访问速度、增强安全性、绕过地域限制、提高稳定性，优化网络体验
            </Alert>
            <Alert severity="error" sx={{mt: .5}}>
                错误设置 DNS 可能导致访问失败、隐私泄露、安全性降低、网络延迟增加和功能受限，影响网络体验
            </Alert>
        </Box>}
    </Stack>)
}
