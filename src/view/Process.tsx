import { Box, Paper, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

export const Process = ({handleClose}: { handleClose: () => void }) => {

    return (
        <Box sx={{p: 1}}>
            <IconButton
                aria-label="close" onClick={handleClose}
                sx={{position: 'fixed', right: 8, top: 8, color: (theme) => theme.palette.grey[500]}}>
                <CloseIcon/>
            </IconButton>

            <Paper elevation={2} sx={{
                width: '100%',
                height: `calc(100vh - 20px)`,
                borderRadius: 3,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <h1 onClick={handleClose}>Process</h1>
            </Paper>
        </Box>
    )
}

export default Process
