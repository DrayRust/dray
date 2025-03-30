import { useNavigate } from 'react-router-dom'
import { AppBar, Typography, Button } from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'

export const useAppBar = (backUrl: string, title: string) => {
    const navigate = useNavigate()
    const AppBarComponent = () => (
        <AppBar position="static" sx={{p: 1, pl: 2, display: 'flex', flexDirection: 'row', justifyContent: "flex-start", alignItems: "center"}}>
            <Button variant="outlined" startIcon={<ArrowBackIosNewIcon/>} onClick={() => navigate(backUrl || '/')} sx={{mr: 2}}>返回</Button>
            <Typography variant="body1">{title}</Typography>
        </AppBar>
    )
    return {AppBarComponent}
}
