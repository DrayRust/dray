import { useState, useEffect } from 'react'
import { Paper, Stack, Typography, Switch } from '@mui/material'
import { readAppConfig, setAppConfig } from "../util/invoke.ts"

const Home: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => {
        setNavState(0)
    }, [setNavState])

    // 从配置文件中读取配置信息
    const [rayEnable, setRayEnable] = useState(false)
    useEffect(() => {
        readAppConfig().then((c) => {
            setRayEnable(c.ray_enable)
        }).catch(_ => 0)
    }, [])

    const handleRayEnable = async (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.checked
        setRayEnable(value)
        setAppConfig('set_ray_enable', value)
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
