import { useState } from 'react'
import { Alert, Dialog, } from '@mui/material'

export const useErrorDialog = () => {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [severity, setSeverity] = useState<'warning' | 'error'>('error')

    const showErrorDialog = (msg: string, severity?: 'warning' | 'error') => {
        setOpen(true)
        setMessage(msg)
        setSeverity(severity || 'error')
    }

    const ErrorDialog = () => (
        <Dialog open={open} onClose={() => setOpen(false)}>
            <Alert variant="filled" severity={severity} onClose={() => setOpen(false)}>{message}</Alert>
        </Dialog>
    )

    return {ErrorDialog, showErrorDialog}
}
