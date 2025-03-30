import { useState } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

export function useDialog() {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [onConfirm, setOnConfirm] = useState<() => void>(() => {
    })

    const confirm = (title: string, content: string, onConfirm: () => void) => {
        setTitle(title)
        setContent(content)
        setOnConfirm(() => onConfirm)
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleConfirm = () => {
        onConfirm()
        handleClose()
    }

    const DialogComponent = () => (
        <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">{content}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>取消</Button>
                <Button onClick={handleConfirm} autoFocus>确认</Button>
            </DialogActions>
        </Dialog>
    )

    return {DialogComponent, confirm}
}
