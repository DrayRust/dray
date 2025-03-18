// import { useState } from 'react'
import { invoke } from "@tauri-apps/api/core"
import { Paper, Stack, Typography, Switch } from '@mui/material'

const Home: React.FC<NavProps> = ({setNavState}) => {
    setNavState(0)

    return (
        <Paper sx={{
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
                <Switch checked={false} onChange={() => invoke('stop_ray')}/>
            </Stack>
        </Paper>
    )
}

export default Home
