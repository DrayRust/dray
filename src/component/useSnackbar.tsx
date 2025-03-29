import { useState, Fragment } from 'react'
import { Snackbar, IconButton, Alert } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

export const useSnackbar = () => {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [autoHideDuration, setAutoHideDuration] = useState<number>(3000)
    const [severity, setSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('info')

    const handleClose = (_: any, reason?: string) => {
        if (reason === 'clickaway') return
        setOpen(false)
    }

    const showSnackbar = (msg: string, severity?: 'success' | 'info' | 'warning' | 'error', duration?: number) => {
        setMessage(msg)
        setSeverity(severity || 'info')
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
        <Snackbar open={open} onClose={handleClose} autoHideDuration={autoHideDuration}
                  anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}>
            <Alert severity={severity} action={action} onClose={handleClose}>{message}</Alert>
        </Snackbar>
    )

    return {SnackbarComponent, showSnackbar}
}
