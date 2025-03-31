import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

import {
    styled, CssBaseline, GlobalStyles,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Paper, Tooltip, Stack, Box, Fab
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
import { useWindowFocus } from './hook/useWindowFocus.ts'

import Home from "./page/Home.tsx"
import Server from "./page/Server.tsx"
import ServerCreate from "./page/ServerCreate.tsx"
import ServerExport from "./page/ServerExport.tsx"
import ServerImport from "./page/ServerImport.tsx"
import ServerUpdate from "./page/ServerUpdate.tsx"
import Subscription from "./page/Subscription.tsx"
import Rule from "./page/Rule.tsx"
import Log from "./page/Log.tsx"
import LogDetail from "./page/LogDetail.tsx"
import Setting from "./page/Setting.tsx"

import { invoke } from "@tauri-apps/api/core"
import { getCurrentWindow } from '@tauri-apps/api/window'
import './App.css'

const App: React.FC = () => {
    const navItems = [
        {path: '/', text: '首页', icon: <HomeIcon/>},
        {path: '/server', text: '服务器', icon: <StorageIcon/>},
        {path: '/subscription', text: '订阅', icon: <InboxIcon/>},
        {path: '/rule', text: '规则', icon: <RuleIcon/>},
        {path: '/log', text: '日志', icon: <AssignmentIcon/>},
        {path: '/setting', text: '设置', icon: <SettingsIcon/>}
    ]

    const [navState, setNavState] = useState(-1)
    const handleNavClick = (index: number) => {
        setNavState(index)
    }

    const isWindowVisible = useWindowFocus()
    useEffect(() => {
        setTimeout(async () => {
            if (!isWindowVisible) {
                await getCurrentWindow().hide()
            } else {
                // await getCurrentWindow().show()
                // await getCurrentWindow().setFocus()
            }
        })
    }, [isWindowVisible])

    const CustomListItemIcon = styled(ListItemIcon)(() => ({minWidth: 36}))

    return (
        <ThemeProvider>
            <GlobalStyles styles={{body: {userSelect: 'none'}}}/>
            <CssBaseline/>
            <Router>
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
                    <Paper elevation={5} sx={{width: '100%', height: '100%', borderRadius: 0}}>
                        <List>
                            {navItems.map((item, index) => (
                                <ListItem disablePadding key={index}>
                                    <ListItemButton
                                        component={Link}
                                        to={item.path}
                                        selected={navState === index}
                                        onClick={() => handleNavClick(index)}
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
                        <Route path="/" element={<Home setNavState={setNavState}/>}/>
                        <Route path="/server" element={<Server setNavState={setNavState}/>}/>
                        <Route path="/server_create" element={<ServerCreate setNavState={setNavState}/>}/>
                        <Route path="/server_import" element={<ServerImport setNavState={setNavState}/>}/>
                        <Route path="/server_export" element={<ServerExport setNavState={setNavState}/>}/>
                        <Route path="/server_update" element={<ServerUpdate setNavState={setNavState}/>}/>
                        <Route path="/subscription" element={<Subscription setNavState={setNavState}/>}/>
                        <Route path="/rule" element={<Rule setNavState={setNavState}/>}/>
                        <Route path="/log" element={<Log setNavState={setNavState}/>}/>
                        <Route path="/log_detail" element={<LogDetail setNavState={setNavState}/>}/>
                        <Route path="/setting" element={<Setting setNavState={setNavState}/>}/>
                    </Routes>
                </div>
            </Router>
        </ThemeProvider>
    )
}

export default App
