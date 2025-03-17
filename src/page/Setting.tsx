import { useState, SyntheticEvent } from 'react'
import {
    Paper,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemButton,
    Stack,
    Typography,
    Switch,
    Button,
    ButtonGroup,
} from '@mui/material'

import { useTheme } from '../context/ThemeProvider'

const Setting: React.FC = () => {
    const {mode, toggleMode} = useTheme()

    const changeTheme = (newMode: string) => {
        toggleMode(newMode as 'light' | 'dark' | 'system')
    }

    const [activeTab, setActiveTab] = useState(0)

    const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
        setActiveTab(newValue)
    }

    const invoke = (action: string) => {
        console.log(`Invoking action: ${action}`)
    }

    const enableAutoStart = () => {
        console.log('Enabling auto start')
    }


    return (
        <Paper elevation={3} sx={{borderRadius: 2, overflow: 'visible'}}>
            <Paper elevation={1} sx={{alignItems: "center", borderRadius: '8px 8px 0 0'}}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="设置导航">
                    <Tab label="基本设置"/>
                    <Tab label="代理设置"/>
                    <Tab label="Web 设置"/>
                </Tabs>
            </Paper>
            {activeTab === 0 ? (
                <List>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>外观</Typography>
                                <ButtonGroup variant="contained">
                                    <Button onClick={() => changeTheme('light')} variant={mode === 'light' ? 'contained' : 'outlined'}>亮色</Button>
                                    <Button onClick={() => changeTheme('dark')} variant={mode === 'dark' ? 'contained' : 'outlined'}>暗色</Button>
                                    <Button onClick={() => changeTheme('system')} variant={mode === 'system' ? 'contained' : 'outlined'}>跟随系统</Button>
                                </ButtonGroup>
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>开机启动</Typography>
                                <Switch checked={false} onChange={enableAutoStart}/>
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                </List>
            ) : activeTab === 1 ? (
                <List>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>启动 Ray</Typography>
                                <Switch
                                    checked={false}
                                    onChange={() => invoke('start_ray')}
                                />
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>停止 Ray</Typography>
                                <Switch
                                    checked={false}
                                    onChange={() => invoke('stop_ray')}
                                />
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>强制重启 Ray</Typography>
                                <Switch
                                    checked={false}
                                    onChange={() => invoke('force_restart_ray')}
                                />
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>强制终止 Ray</Typography>
                                <Switch
                                    checked={false}
                                    onChange={() => invoke('force_kill_ray')}
                                />
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>启用自动代理</Typography>
                                <Switch
                                    checked={false}
                                    onChange={() => invoke('enable_auto_proxy')}
                                />
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>启用 Socks 代理</Typography>
                                <Switch
                                    checked={false}
                                    onChange={() => invoke('enable_socks_proxy')}
                                />
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>启用 Web 代理</Typography>
                                <Switch
                                    checked={false}
                                    onChange={() => invoke('enable_web_proxy')}
                                />
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>启用安全 Web 代理</Typography>
                                <Switch
                                    checked={false}
                                    onChange={() => invoke('enable_secure_web_proxy')}
                                />
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>禁用代理</Typography>
                                <Switch
                                    checked={false}
                                    onChange={() => invoke('disable_proxies')}
                                />
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                </List>
            ) : activeTab === 2 && (
                <List>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>启动 Web</Typography>
                                <Switch checked={false} onChange={() => invoke('start_web')}/>
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>停止 Web</Typography>
                                <Switch
                                    checked={false}
                                    onChange={() => invoke('stop_web')}
                                />
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                </List>
            )}
        </Paper>
    )
}

export default Setting
