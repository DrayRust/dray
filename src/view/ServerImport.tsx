import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import QrScanner from 'qr-scanner'
import { Card, TextField, Button, Stack } from '@mui/material'
import { useDebounce } from '../hook/useDebounce.ts'
import { useSnackbar } from "../component/useSnackbar.tsx"
import { useAppBar } from "../component/useAppBar.tsx"
import { useServerImport } from "../component/useServerImport.tsx"
import { clipboardReadImage } from "../util/tauri.ts"

const ServerImport: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(1), [setNavState])
    const navigate = useNavigate()

    // =============== text import ===============
    const [text, setText] = useState('')
    const [error, setError] = useState(false)
    const handleSubmit = useDebounce(async () => {
        await useServerImport(text, showSnackbar, setError, () => {
            setTimeout(() => navigate('/server'), 1000)
        })
    }, 300)

    // =============== file import ===============
    const fileInputRef = useRef<HTMLInputElement>(null)
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setError(false)
        const files = event.target.files
        if (!files || files.length < 1) return

        let ok = 0
        let err = 0
        let s = ''
        for (const file of files) {
            if (!file.type.startsWith('image/')) return
            try {
                let r = await QrScanner.scanImage(file, {alsoTryWithoutScanRegion: true})
                s += r.data + '\n'
                ok++
            } catch (e) {
                err++
            }
        }

        setText(s)
        if (err > 0) showSnackbar(`识别失败 ${err} 张, 成功 ${ok} 张`, 'warning')
        event.target.value = ''
    }

    // =============== clipboard import ===============
    const handleReadClipboard = async () => {
        try {
            const clipboardImage = await clipboardReadImage()
            const blob = new Blob([await clipboardImage.rgba()], {type: 'image'})
            const url = URL.createObjectURL(blob)
            try {
                let r = await QrScanner.scanImage(url, {alsoTryWithoutScanRegion: true})
                setText(r.data)
            } catch (e) {
                showSnackbar('没有识别到内容', 'error')
            }
        } catch (e) {
            showSnackbar('从剪切板没有读取到内容', 'error')
        }
    }

    const {SnackbarComponent, showSnackbar, handleClose} = useSnackbar()
    const {AppBarComponent} = useAppBar('/server', '导入')
    return (<>
        <SnackbarComponent/>
        <AppBarComponent/>
        <Card sx={{p: 2, mt: 1}}>
            <Stack spacing={2}>
                <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
                    <div className="qr-upload-but">
                        <Button variant="contained" color="secondary">选择二维码图片</Button>
                        <input multiple type="file" accept="image/*" ref={fileInputRef} onClick={handleClose} onChange={handleFileChange}/>
                    </div>
                    <Button variant="contained" color="success" onClick={handleReadClipboard}>读取剪切板图片</Button>
                    <Button variant="contained" color="warning">通过摄像头识别</Button>
                </Stack>
                <TextField variant="outlined" label="请输入链接(URI)" fullWidth multiline minRows={6} maxRows={20} value={text}
                           placeholder="每行一条，例如：vless://xxxxxx 或 ss://xxxxxx" autoFocus={true} error={error}
                           onChange={(e) => setText(e.target.value)}/>
                <Stack direction="row" spacing={1}>
                    <Button variant="contained" onClick={handleSubmit} disabled={!text}>确认</Button>
                </Stack>
            </Stack>
        </Card>
    </>)
}

export default ServerImport
