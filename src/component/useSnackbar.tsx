import { useState } from 'react'
import { Snackbar, Alert } from '@mui/material'

export const useSnackbar = (showTop?: boolean) => {
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

    const SnackbarComponent = () => (
        <Snackbar open={open} onClose={handleClose} autoHideDuration={autoHideDuration}
                  anchorOrigin={showTop ? {vertical: 'top', horizontal: 'center'} : {vertical: 'bottom', horizontal: 'right'}}>
            <Alert variant="filled" severity={severity} onClose={handleClose}>{message}</Alert>
        </Snackbar>
    )

    return {SnackbarComponent, showSnackbar}
}
