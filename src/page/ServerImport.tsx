import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppBar, Card, TextField, Typography, Button, Stack } from '@mui/material'
import PublishIcon from '@mui/icons-material/Publish'
import { readServerList, saveServerList } from "../util/invoke.ts"
import { uriToServerRow } from "../util/server.ts"
import { useSnackbar } from "../component/useSnackbar.tsx"

const ServerImport: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(1), [setNavState])
    const navigate = useNavigate()
    const [inputValue, setInputValue] = useState('')

    // 防抖处理，防止频繁提交
    const timeoutRef = useRef<number>()
    const handleSubmit = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(submitFn, 300)
    }

    const submitFn = async () => {
        const s = inputValue.trim()
        if (!s) return
        // setInputValue('')

        let errNum = 0
        let newNum = 0
        let existNum = 0
        let newServerList: ServerList = []
        let serverList = await readServerList() || []
        const arr = s.split('\n')
        for (let uri of arr) {
            uri = uri.trim()
            if (!uri) continue
            const row = await uriToServerRow(uri)
            if (!row) {
                errNum++
            } else {
                const isExist = serverList.some(server => server.hash === row.hash)
                if (isExist) {
                    existNum++
                } else {
                    newNum++
                    newServerList.push(row)
                }
            }
        }

        const errMsg = `解析链接（URI）错误: ${errNum} 条`
        const okMsg = `导入成功: ${newNum} 条`
        const existMsg = `已存在: ${existNum} 条`
        if (newNum) {
            serverList = [...newServerList, ...serverList]
            const ok = await saveServerList(serverList)
            if (!ok) {
                showSnackbar('导入失败', 'error')
            } else {
                if (errNum) {
                    showSnackbar(`${errMsg}，${okMsg}，${existMsg}`, 'error')
                } else if (existNum) {
                    showSnackbar(`${existMsg}，${okMsg}`, 'warning')
                } else {
                    showSnackbar(okMsg)
                }
                setTimeout(() => navigate(`/server`), 1000)
            }
        } else if (existNum) {
            if (errNum) {
                showSnackbar(`${existMsg}，${errMsg}，${okMsg}`, 'error')
            } else if (existNum) {
                showSnackbar(`${existMsg}，${okMsg}`, 'warning')
            }
        } else {
            showSnackbar(errMsg, 'error')
        }
    }

    const {SnackbarComponent, showSnackbar} = useSnackbar()
    return (<>
        <SnackbarComponent/>
        <AppBar position="static" sx={{p: 1, pl: 1.5, display: 'flex', flexDirection: 'row', justifyContent: "flex-start", alignItems: "center"}}>
            <PublishIcon sx={{mr: 1}}/>
            <Typography variant="body1">导入</Typography>
        </AppBar>
        <Card sx={{p: 2, mt: 1}}>
            <TextField label="请输入链接(URI)" multiline rows={6} fullWidth variant="outlined" value={inputValue}
                       onChange={(e) => setInputValue(e.target.value)}/>
            <Stack direction="row" spacing={1} sx={{mt: 2}}>
                <Button variant="contained" onClick={handleSubmit}>确认</Button>
                <Button variant="outlined" onClick={() => navigate(`/server`)}>返回</Button>
            </Stack>
        </Card>
    </>)
}

export default ServerImport
