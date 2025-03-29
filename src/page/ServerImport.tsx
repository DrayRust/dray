import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppBar, Card, TextField, Typography, Button, Stack } from '@mui/material'
import PublishIcon from '@mui/icons-material/Publish'

const ServerImport: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(1), [setNavState])
    const navigate = useNavigate()
    const [inputValue, setInputValue] = useState('')

    const handleSubmit = () => {
        console.log('提交的内容:', inputValue)
    }

    return (<>
        <AppBar position="static" sx={{p: 1, pl: 1.5, display: 'flex', flexDirection: 'row', justifyContent: "flex-start", alignItems: "center"}}>
            <PublishIcon sx={{mr: 1}}/>
            <Typography variant="body1">导入</Typography>
        </AppBar>
        <Card sx={{p: 2, mt: 1}}>
            <TextField label="请输入内容" multiline rows={5} fullWidth variant="outlined" value={inputValue}
                       onChange={(e) => setInputValue(e.target.value)}/>
            <Stack direction="row" spacing={1} sx={{mt: 2}}>
                <Button variant="contained" onClick={handleSubmit}>确认</Button>
                <Button variant="outlined" onClick={() => navigate(`/server`)}>返回</Button>
            </Stack>
        </Card>
    </>)
}

export default ServerImport
