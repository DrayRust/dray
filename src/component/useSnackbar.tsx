import { useState, Fragment } from 'react'
import { Snackbar, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

export const useSnackbar = () => {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [autoHideDuration, setAutoHideDuration] = useState<number | null>(3000)

    const handleClose = (_: any, reason?: string) => {
        if (reason === 'clickaway') return
        setOpen(false)
    }

    const showSnackbar = (msg: string, duration?: number | null) => {
        setMessage(msg)
        setAutoHideDuration(duration ?? 3000)
        setOpen(true)
    }

    const action = (
        <Fragment>
            <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
                <CloseIcon fontSize="small"/>
            </IconButton>
        </Fragment>
    )

    const SnackbarComponent = () => (
        <Snackbar
            open={open}
            onClose={handleClose}
            autoHideDuration={autoHideDuration}
            message={message}
            action={action}
            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        />
    )

    return {SnackbarComponent, showSnackbar}
}
