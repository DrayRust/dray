import { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'

export const useErrorDialog = () => {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')

    const showErrorDialog = (msg: string) => {
        setMessage(msg)
        setOpen(true)
    }

    const ErrorDialog = () => (
        <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>错误提示</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)}>关闭</Button>
            </DialogActions>
        </Dialog>
    )

    return {ErrorDialog, showErrorDialog}
}
