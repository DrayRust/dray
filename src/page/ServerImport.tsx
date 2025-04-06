import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, TextField, Button, Stack } from '@mui/material'
import { useDebounce } from '../hook/useDebounce.ts'
import { useSnackbar } from "../component/useSnackbar.tsx"
import { useAppBar } from "../component/useAppBar.tsx"
import { useServerImport } from "../component/useServerImport.tsx"

const ServerImport: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(1), [setNavState])
    const navigate = useNavigate()

    const [inputValue, setInputValue] = useState('')
    const [error, setError] = useState(false)
    const handleSubmit = useDebounce(async () => {
        await useServerImport(inputValue, showSnackbar, setError, () => {
            setTimeout(() => navigate('/server'), 1000)
        })
    }, 300)

    const {SnackbarComponent, showSnackbar} = useSnackbar()
    const {AppBarComponent} = useAppBar('/server', '导入')
    return (<>
        <SnackbarComponent/>
        <AppBarComponent/>
        <Card sx={{p: 2, mt: 1}}>
            <TextField variant="outlined" label="请输入链接(URI)" fullWidth multiline minRows={6} maxRows={20} value={inputValue}
                       placeholder="每行一条，例如：vless://xxxxxxx" autoFocus={true} error={error}
                       onChange={(e) => setInputValue(e.target.value)}/>
            <Stack direction="row" spacing={1} sx={{mt: 2}}>
                <Button variant="contained" onClick={handleSubmit} disabled={!inputValue}>确认</Button>
            </Stack>
        </Card>
    </>)
}

export default ServerImport
