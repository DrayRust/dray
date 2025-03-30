import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Card, Box, Divider, Typography, Switch,
    FormControlLabel, Checkbox,
    CircularProgress, Stack, Button
} from '@mui/material'

import { save } from '@tauri-apps/plugin-dialog'
import { useAppBar } from "../component/useAppBar.tsx"
import { log, readServerList, saveTextFile } from "../util/invoke.ts"
import { useSnackbar } from "../component/useSnackbar.tsx"
import { serverRowToBase64Uri, serverRowToUri } from "../util/server.ts"

const ServerExport: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(1), [setNavState])
    const navigate = useNavigate()

    const [serverList, setServerList] = useState<ServerList>()
    const readList = () => {
        readServerList().then((d) => {
            setServerList(d as ServerList)
        }).catch(_ => 0)
    }
    useEffect(() => readList(), [])

    const [selectedAll, setSelectedAll] = useState(true)
    const [selectedServers, setSelectedServers] = useState<boolean[]>([])
    const [isBase64, setIsBase64] = useState(false)

    useEffect(() => {
        if (serverList) setSelectedServers(new Array(serverList.length).fill(true))
    }, [serverList])

    const handleSelectAll = (checked: boolean) => {
        setSelectedAll(checked)
        if (serverList) setSelectedServers(new Array(serverList.length).fill(checked))
    }

    const handleSelectServer = (index: number, checked: boolean) => {
        const newSelected = [...selectedServers]
        newSelected[index] = checked
        setSelectedServers(newSelected)
        setSelectedAll(newSelected.every(Boolean))
    }

    const handleExportQRCode = () => {
        const selected = serverList?.filter((_, index) => selectedServers[index])
        if (selected && selected.length > 0) {
            console.log(selected)
        } else {
            showSnackbar(`请选择要导出的服务器`, 'error')
        }
    }

    const handleExport = async () => {
        const selected = serverList?.filter((_, index) => selectedServers[index])
        if (selected && selected.length > 0) {
            let s = selected.map(server => {
                return isBase64 ? serverRowToBase64Uri(server) : serverRowToUri(server)
            }).join('\n')
            const ok = await saveExportFile(s)
            if (!ok) showSnackbar(`导出失败`, 'error')
        } else {
            showSnackbar(`请选择要导出的服务器`, 'error')
        }
    }

    const saveExportFile = async (content: string) => {
        try {
            const path = await save({
                title: "导出文件",
                defaultPath: "dray-servers.txt",
                filters: [{name: 'Text File', extensions: ['txt']}],
            })
            if (!path) return false
            return await saveTextFile(path, content)
        } catch (e) {
            log.error(`Tauri save dialog error: ${e}`)
            return false
        }
    }

    const {SnackbarComponent, showSnackbar} = useSnackbar(true)
    const {AppBarComponent} = useAppBar('导出')
    return <>
        <SnackbarComponent/>
        <AppBarComponent/>
        <Card sx={{mt: 1}}>
            <Box sx={{px: 2, py: 1}}>
                <FormControlLabel
                    control={<Checkbox
                        checked={selectedAll}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                    />}
                    label={`全选`}
                />
                <div>
                    {!serverList ? (
                        <CircularProgress sx={{m: 3}}/>
                    ) : serverList?.map((server, index) => (
                        <FormControlLabel
                            key={index}
                            control={
                                <Checkbox
                                    checked={selectedServers[index] ?? false}
                                    onChange={(e) => handleSelectServer(index, e.target.checked)}
                                />
                            }
                            label={`${server.ps}`}
                        />
                    ))}
                </div>
            </Box>
            <Divider/>
            <Stack direction="row" spacing={1} sx={{p: 2, pt: 1, pb: 0, alignItems: 'center'}}>
                <Typography>URL 格式</Typography>
                <Switch checked={isBase64} onChange={(e) => setIsBase64(e.target.checked)}/>
                <Typography>Base64 URI 格式</Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{p: 2, pt: 1}}>
                <Button variant="contained" color="secondary" onClick={handleExportQRCode}>导出二维码</Button>
                <Button variant="contained" color="success" onClick={handleExport}>导出备份文件</Button>
                <Button variant="outlined" onClick={() => navigate(`/server`)}>返回</Button>
            </Stack>
        </Card>
    </>
}

export default ServerExport
