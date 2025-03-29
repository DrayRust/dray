import { AppBar, Typography } from '@mui/material'
import StorageIcon from '@mui/icons-material/Storage'

export const useAppBar = (title: string) => {
    const AppBarComponent = () => (
        <AppBar position="static" sx={{p: 1, pl: 1.5, display: 'flex', flexDirection: 'row', justifyContent: "flex-start", alignItems: "center"}}>
            <StorageIcon sx={{mr: 1}}/>
            <Typography variant="body1">{title}</Typography>
        </AppBar>
    )
    return {AppBarComponent}
}
