import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

import {
    styled,
    CssBaseline,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Stack,
    Box,
    Fab
} from '@mui/material'

import {
    Home as HomeIcon,
    Storage as StorageIcon,
    Inbox as InboxIcon,
    Rule as RuleIcon,
    Assignment as AssignmentIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon
} from '@mui/icons-material'

import { ThemeProvider } from './context/ThemeProvider.tsx'

import Home from "./page/Home.tsx"
import Server from "./page/Server.tsx"
import Subscription from "./page/Subscription.tsx"
import Rule from "./page/Rule.tsx"
import Log from "./page/Log.tsx"
import Setting from "./page/Setting.tsx"

import { invoke } from "@tauri-apps/api/core"
import './App.css'

function isMacOS() {
    return /Mac/i.test(navigator.userAgent)
}

if (isMacOS()) {
    isMacOSByKeydown()
}

function isMacOSByKeydown() {
    document.addEventListener('keydown', (event) => {
        if (event.metaKey && event.key === 'z') {
            document.execCommand('undo')
        } else if (event.metaKey && event.shiftKey && event.key === 'z') {
            document.execCommand('redo')
        } else if (event.metaKey && event.key === 'x') {
            document.execCommand('cut')
        } else if (event.metaKey && event.key === 'c') {
            document.execCommand('copy')
        } else if (event.metaKey && event.key === 'v') {
            document.execCommand('paste')
        } else if (event.metaKey && event.key === 'a') {
            document.execCommand('selectAll')
        }
    })
}

const App: React.FC = () => {
    const navItems = [
        {path: '/', icon: <HomeIcon/>, text: '首页', value: 'home'},
        {path: '/server', icon: <StorageIcon/>, text: '服务器', value: 'server'},
        {path: '/subscription', icon: <InboxIcon/>, text: '订阅', value: 'subscription'},
        {path: '/rule', icon: <RuleIcon/>, text: '规则', value: 'rule'},
        {path: '/log', icon: <AssignmentIcon/>, text: '日志', value: 'log'},
        {path: '/setting', icon: <SettingsIcon/>, text: '设置', value: 'setting'}
    ]

    const [navVal, setNavVal] = useState('home')
    const handleNavClick = (v: string) => {
        setNavVal(v)
    }

    const CustomListItemIcon = styled(ListItemIcon)(() => ({minWidth: 36}))

    const pageComponents = {
        home: <Home/>,
        server: <Server/>,
        subscription: <Subscription/>,
        rule: <Rule/>,
        log: <Log/>,
        setting: <Setting/>
    }

    return (
        <ThemeProvider>
            <Router>
                <CssBaseline/>
                <Box sx={{position: 'fixed', left: 0, bottom: 15, width: 130, zIndex: 1}}>
                    <Stack spacing={0} sx={{justifyContent: "center", alignItems: "center"}}>
                        <Tooltip title="退出程序">
                            <Fab color="error" size="medium" aria-label="logout" onClick={() => invoke('quit')}>
                                <LogoutIcon/>
                            </Fab>
                        </Tooltip>
                    </Stack>
                </Box>
                <div className="panel-left">
                    <Paper elevation={3} sx={{width: '100%', height: '100%', borderRadius: 0}}>
                        <List>
                            {navItems.map((item) => (
                                <ListItem disablePadding key={item.value}>
                                    <ListItemButton
                                        component={Link}
                                        to={item.path}
                                        selected={navVal === item.value}
                                        onClick={() => handleNavClick(item.value)}
                                    >
                                        <CustomListItemIcon>{item.icon}</CustomListItemIcon>
                                        <ListItemText primary={item.text}/>
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </div>
                <div className="panel-right">
                    <Routes>
                        {navItems.map((item) => (
                            <Route key={item.path} path={item.path} element={pageComponents[item.value as keyof typeof pageComponents]}/>
                        ))}
                    </Routes>
                </div>
            </Router>
        </ThemeProvider>
    )
}

export default App
