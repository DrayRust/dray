import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, TextField, Button, Stack } from '@mui/material'
import { readServerList, saveServerList } from "../util/invoke.ts"
import { uriToServerRow } from "../util/server.ts"
import { useSnackbar } from "../component/useSnackbar.tsx"
import { useAppBar } from "../component/useAppBar.tsx"

const ServerImport: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(1), [setNavState])
    const navigate = useNavigate()

    const [inputValue, setInputValue] = useState('')
    const [error, setError] = useState(false)

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
        setError(errNum > 0)
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

    const {SnackbarComponent, showSnackbar} = useSnackbar(true)
    const {AppBarComponent} = useAppBar('导入')
    return (<>
        <SnackbarComponent/>
        <AppBarComponent/>
        <Card sx={{p: 2, mt: 1}}>
            <TextField variant="outlined" label="请输入链接(URI)" fullWidth multiline minRows={6} maxRows={20} value={inputValue}
                       placeholder="每行一条，例如：vless://xxxxxxx" autoFocus={true} error={error}
                       onChange={(e) => setInputValue(e.target.value)}/>
            <Stack direction="row" spacing={1} sx={{mt: 2}}>
                <Button variant="contained" onClick={handleSubmit}>确认</Button>
                <Button variant="outlined" onClick={() => navigate(`/server`)}>返回</Button>
            </Stack>
        </Card>
    </>)
}

export default ServerImport
