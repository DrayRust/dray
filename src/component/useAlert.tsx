import { useState } from 'react'
import { IconButton, Alert, Collapse } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

export const useAlert = () => {
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [severity, setSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('info')

    const showAlert = (msg: string, severity?: 'success' | 'info' | 'warning' | 'error') => {
        setMsg(msg)
        setSeverity(severity || 'info')
        setOpen(true)
    }

    const handleClose = () => setOpen(false)
    const action = (
        <IconButton aria-label="close" color="inherit" size="small" onClick={handleClose}>
            <CloseIcon fontSize="inherit"/>
        </IconButton>
    )

    const AlertComponent = () => (
        <Collapse in={open}>
            <Alert sx={{mt: 2}} severity={severity} action={action} onClose={handleClose}>{msg}</Alert>
        </Collapse>
    )

    return {AlertComponent, showAlert}
}
