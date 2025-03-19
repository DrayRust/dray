import { useState, useEffect } from 'react'
import { invoke } from "@tauri-apps/api/core"
import { Paper, Stack, Typography, Switch } from '@mui/material'

const Home: React.FC<NavProps> = ({setNavState}) => {
    setNavState(0)

    // 从配置文件中读取配置信息
    const [rayEnable, setRayEnable] = useState(false)

    useEffect(() => {
        (async () => {
            try {
                const data = await invoke('get_config_json')
                const config = typeof data === 'string' ? JSON.parse(data) : data
                setRayEnable(config.ray_enable)
            } catch (err) {
                console.log('Failed to get_config_json:', err)
            }
        })()
    }, [])

    const invokeSend = (fn: string, value: string | number | boolean) => {
        (async () => {
            try {
                await invoke(fn, {value})
            } catch (err) {
                console.log('Failed to invokeSend:', err)
            }
        })()
    }

    const handleRayEnable = async (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.checked
        setRayEnable(value)
        invokeSend('set_ray_enable', value)
    }

    return (
        <Paper elevation={5} sx={{
            width: '100%',
            height: `calc(100vh - 20px)`,
            borderRadius: 3,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                borderRadius: 3,
                width: 250,
                p: 2
            }}>
                <Typography variant="body1" sx={{paddingLeft: 1}}>Ray 服务</Typography>
                <Switch checked={rayEnable} onChange={handleRayEnable} sx={{transform: 'scale(1.3)'}}/>
            </Stack>
        </Paper>
    )
}

export default Home
