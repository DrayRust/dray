import { useState, useMemo } from 'react'
import { ThemeProvider, createTheme, FormControlLabel, Switch } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Paper from '@mui/material/Paper'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

import { styled } from '@mui/material/styles'
import HomeIcon from '@mui/icons-material/Home'
import StorageIcon from '@mui/icons-material/Storage'
import InboxIcon from '@mui/icons-material/Inbox'
import AssignmentIcon from '@mui/icons-material/Assignment'
import SettingsIcon from '@mui/icons-material/Settings'

import RestoreIcon from '@mui/icons-material/Restore'
import FavoriteIcon from '@mui/icons-material/Favorite'
import LocationOnIcon from '@mui/icons-material/LocationOn'

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

function App() {
    const [drayMsg, setDrayMsg] = useState("")
    const [name, setName] = useState("")
    const [value, setValue] = useState(0)

    async function dray() {
        // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
        setName("Hello World!")
        setDrayMsg(await invoke("dray", {name}))
    }

    // 从 localStorage 中读取主题模式
    const [mode, setMode] = useState<'light' | 'dark'>(() => {
        const savedMode = localStorage.getItem('themeMode') as 'light' | 'dark'
        return savedMode || 'light'
    })

    const toggleColorMode = () => {
        const newMode = mode === 'light' ? 'dark' : 'light'
        setMode(newMode)
        localStorage.setItem('themeMode', newMode)
    }

    const CustomListItemIcon = styled(ListItemIcon)(() => ({minWidth: 36}))

    const theme = useMemo(() => createTheme({palette: {mode}}), [mode])
    const MaterialUISwitch = styled(Switch)(({theme}) => ({
        width: 62,
        height: 34,
        padding: 7,
        '& .MuiSwitch-switchBase': {
            margin: 1,
            padding: 0,
            transform: 'translateX(6px)',
            '&.Mui-checked': {
                color: '#fff',
                transform: 'translateX(22px)',
                '& .MuiSwitch-thumb:before': {
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent('#fff')}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
                },
                '& + .MuiSwitch-track': {
                    opacity: 1,
                    backgroundColor: '#aab4be',
                    ...theme.applyStyles('dark', {
                        backgroundColor: '#8796A5',
                    }),
                },
            },
        },
        '& .MuiSwitch-thumb': {
            backgroundColor: '#001e3c',
            width: 32,
            height: 32,
            '&::before': {
                content: "''",
                position: 'absolute',
                width: '100%',
                height: '100%',
                left: 0,
                top: 0,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent('#fff')}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
            },
            ...theme.applyStyles('dark', {
                backgroundColor: '#003892',
            }),
        },
        '& .MuiSwitch-track': {
            opacity: 1,
            backgroundColor: '#aab4be',
            borderRadius: 20 / 2,
            ...theme.applyStyles('dark', {
                backgroundColor: '#8796A5',
            }),
        },
    }))

    return (
        <ThemeProvider theme={theme}>
            <div className="panel-left">
                <Paper elevation={3} sx={{width: '100%', height: '100%', borderRadius: 0}}>
                    <List>
                        <ListItem disablePadding>
                            <ListItemButton>
                                <CustomListItemIcon><HomeIcon/></CustomListItemIcon>
                                <ListItemText primary="首页"/>
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton>
                                <CustomListItemIcon><StorageIcon/></CustomListItemIcon>
                                <ListItemText primary="服务器"/>
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton>
                                <CustomListItemIcon><InboxIcon/></CustomListItemIcon>
                                <ListItemText primary="订阅"/>
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton>
                                <CustomListItemIcon><AssignmentIcon/></CustomListItemIcon>
                                <ListItemText primary="日志"/>
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton>
                                <CustomListItemIcon><SettingsIcon/></CustomListItemIcon>
                                <ListItemText primary="设置"/>
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Paper>
            </div>
            <div className="panel-right">
                <CssBaseline/>
                <BottomNavigation
                    showLabels
                    value={value}
                    onChange={(_event, newValue) => {
                        setValue(newValue)
                    }}
                >
                    <BottomNavigationAction label="Recents" icon={<RestoreIcon/>}/>
                    <BottomNavigationAction label="Favorites" icon={<FavoriteIcon/>}/>
                    <BottomNavigationAction label="Nearby" icon={<LocationOnIcon/>}/>
                </BottomNavigation>
                <FormControlLabel
                    control={<MaterialUISwitch checked={mode === 'dark'} onChange={toggleColorMode}/>}
                    style={{position: 'fixed', right: 16, top: 16, zIndex: 9999}}
                    label=""
                />
                <div className="card">
                    <button onClick={() => dray()}>{drayMsg}</button>
                </div>
            </div>
        </ThemeProvider>
    )
}

export default App
