import { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Switch, Select, MenuItem, Button, ButtonGroup } from '@mui/material'
import { FormControl, InputLabel, SelectChangeEvent } from '@mui/material'

import { useTheme } from '../context/ThemeProvider'

const Setting: React.FC = () => {
    const {mode, toggleMode} = useTheme()

    const handleThemeChange = (event: SelectChangeEvent) => {
        toggleMode(event.target.value as 'light' | 'dark' | 'system')
    }

    const invoke = (action: string) => {
        console.log(`Invoking action: ${action}`)
    }

    const enableAutoStart = () => {
        console.log('Enabling auto start')
    }

    const [activeTab, setActiveTab] = useState<'basic' | 'proxy' | 'web'>('basic')

    return (
        <Paper elevation={3} sx={{borderRadius: 3, overflow: 'visible'}}>
            <AppBar position="static" sx={{
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? theme.palette.background.default : '#7F7F7F',
            }}>
                <Toolbar>
                    <Typography variant="h6">设置</Typography>
                </Toolbar>
            </AppBar>
            <Stack sx={{alignItems: "center", marginTop: 2}}>
                <ButtonGroup variant="contained">
                    <Button onClick={() => setActiveTab('basic')} variant={activeTab === 'basic' ? 'contained' : 'outlined'}>基本设置</Button>
                    <Button onClick={() => setActiveTab('proxy')} variant={activeTab === 'proxy' ? 'contained' : 'outlined'}>代理设置</Button>
                    <Button onClick={() => setActiveTab('web')} variant={activeTab === 'web' ? 'contained' : 'outlined'}>Web 设置</Button>
                </ButtonGroup>
            </Stack>
            {activeTab === 'basic' ? (
                <List>
                    <FormControl fullWidth>
                        <InputLabel id="theme-select-label">Theme</InputLabel>
                        <Select
                            labelId="theme-select-label"
                            id="theme-select"
                            value={mode}
                            label="Theme"
                            onChange={handleThemeChange}
                        >
                            <MenuItem value="light">Light</MenuItem>
                            <MenuItem value="dark">Dark</MenuItem>
                            <MenuItem value="system">System</MenuItem>
                        </Select>
                    </FormControl>
                    <ListItem disablePadding>
                        <ListItemButton sx={{p: 0, cursor: 'default'}}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%', p: 1}}>
                                <Typography variant="body1" sx={{paddingLeft: 1}}>开机启动</Typography>
                                <Switch checked={false} onChange={enableAutoStart}/>
                            </Stack>
                        </ListItemButton>
                    </ListItem>
                </List>
            ) : activeTab === 'proxy' ? (
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
            ) : activeTab === 'web' && (
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
