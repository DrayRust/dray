import { useState } from 'react'
import { Alert, Dialog, } from '@mui/material'

export const useErrorDialog = () => {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [severity, setSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('error')

    const showErrorDialog = (msg: string, severity?: 'success' | 'info' | 'warning' | 'error', duration?: number) => {
        setOpen(true)
        setMessage(msg)
        setSeverity(severity || 'error')
        duration && setTimeout(() => setOpen(false), duration)
    }

    const ErrorDialog = () => (
        <Dialog open={open} onClose={() => setOpen(false)}>
            <Alert variant="filled" severity={severity} onClose={() => setOpen(false)}>{message}</Alert>
        </Dialog>
    )

    return {ErrorDialog, showErrorDialog}
}
