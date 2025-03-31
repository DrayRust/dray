import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
    Card, Box, Divider, Typography, Switch, Tooltip,
    FormControlLabel, Checkbox, TextField, IconButton,
    CircularProgress, Stack, Button
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import FileCopyIcon from '@mui/icons-material/FileCopy'

import { save } from '@tauri-apps/plugin-dialog'
import { useAppBar } from "../component/useAppBar.tsx"
import { log, readServerList, saveTextFile } from "../util/invoke.ts"
import { useSnackbar } from "../component/useSnackbar.tsx"
import { serverRowToBase64Uri, serverRowToUri } from "../util/server.ts"

interface QRCode {
    ps: string;
    uri: string;
}

const ServerExport: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(1), [setNavState])

    const [showQRCodeList, setShowQRCodeList] = useState<QRCode[]>([])
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
    const [isDisabled, setIsDisabled] = useState(true)

    useEffect(() => {
        if (serverList) {
            setSelectedServers(new Array(serverList.length).fill(selectedAll))
            setIsDisabled(!selectedAll)
        }
    }, [serverList])

    const handleSelectAll = (checked: boolean) => {
        setSelectedAll(checked)
        setIsDisabled(!checked)
        if (serverList) setSelectedServers(new Array(serverList.length).fill(checked))
    }

    const handleSelectServer = (index: number, checked: boolean) => {
        const newSelected = [...selectedServers]
        newSelected[index] = checked
        setSelectedServers(newSelected)
        setSelectedAll(newSelected.every(Boolean))
        setIsDisabled(!newSelected.some(Boolean))
    }

    const handleExportQRCode = () => {
        const selected = serverList?.filter((_, index) => selectedServers[index])
        if (selected && selected.length > 0) {
            const qrCodeList = selected.map(server => {
                return {
                    ps: server.ps,
                    uri: isBase64 ? serverRowToBase64Uri(server) : serverRowToUri(server)
                }
            })
            setShowQRCodeList(qrCodeList)
        }
    }

    const handleExportTextFile = async () => {
        const selected = serverList?.filter((_, index) => selectedServers[index])
        if (selected && selected.length > 0) {
            const path = await showSaveDialog()
            if (!path) return

            let content = selected.map(server => {
                return isBase64 ? serverRowToBase64Uri(server) : serverRowToUri(server)
            }).join('\n')
            const ok = await saveTextFile(path, content)
            if (!ok) showSnackbar(`保存文件失败`, 'error')
        }
    }

    const showSaveDialog = async () => {
        try {
            const path = await save({
                title: "导出文件",
                defaultPath: "dray-servers.txt",
                filters: [{name: 'Text File', extensions: ['txt']}],
            })
            return path || ''
        } catch (e) {
            log.error(`Tauri save dialog error: ${e}`)
            return ''
        }
    }

    const {SnackbarComponent, showSnackbar} = useSnackbar(true)
    const {AppBarComponent} = useAppBar('/server', '导出')
    return <>
        <SnackbarComponent/>
        <AppBarComponent/>
        {!serverList ? (
            <Card sx={{mt: 1, p: 2, textAlign: 'center'}}><CircularProgress sx={{m: 3}}/></Card>
        ) : serverList.length === 0 ? (
            <Card sx={{mt: 1, p: 3, textAlign: 'center'}}>暂无服务器</Card>
        ) : showQRCodeList.length > 0 ? (
            <Card sx={{mt: 1, p: 2}}>
                <Button variant="outlined" onClick={() => setShowQRCodeList([])}>返回</Button>
                {showQRCodeList?.map((v, i) => (
                    <Card key={i} sx={{mt: 2, p: 2, border: '1px solid #ddd', textAlign: 'left'}}>
                        <Typography gutterBottom variant="h5" component="div">{v.ps}</Typography>
                        <QRCodeSVG className={`qrcode-${i}`} value={v.uri} title={v.ps} size={256} xmlns="http://www.w3.org/2000/svg"/>
                        <Box sx={{mt: 1}}><TextField value={v.uri} variant="outlined" size="small" fullWidth multiline disabled/></Box>
                        <Box sx={{mt: 1}}>
                            <Tooltip title="复制 URI">
                                <IconButton title="" onClick={async () => {
                                    await navigator.clipboard.writeText(v.uri)
                                    showSnackbar('URI 已复制', 'success')
                                }}>
                                    <ContentCopyIcon/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="复制二维码 SVG">
                                <IconButton onClick={async () => {
                                    const qrCodeHtml = document.querySelector(`.qrcode-${i}`)?.outerHTML
                                    if (qrCodeHtml) {
                                        await navigator.clipboard.writeText(qrCodeHtml)
                                        showSnackbar('二维码 SVG 已复制', 'success')
                                    }
                                }}>
                                    <FileCopyIcon/>
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Card>
                ))}
            </Card>
        ) : (
            <Card sx={{mt: 1}}>
                <Box sx={{px: 2, py: 1}}>
                    <div>
                        <FormControlLabel label={`全选`} control={<Checkbox
                            checked={selectedAll}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                        />}/>
                    </div>
                    {serverList?.map((server, index) => (
                        <FormControlLabel
                            key={index}
                            label={`${server.ps}`}
                            control={
                                <Checkbox
                                    checked={selectedServers[index] ?? false}
                                    onChange={(e) => handleSelectServer(index, e.target.checked)}
                                />
                            }
                        />
                    ))}
                </Box>
                <Divider/>
                <Stack direction="row" spacing={1} sx={{p: 2, pt: 1, pb: 0, alignItems: 'center'}}>
                    <Typography>URL 格式</Typography>
                    <Switch checked={isBase64} onChange={(e) => setIsBase64(e.target.checked)}/>
                    <Typography>Base64 URI 格式</Typography>
                </Stack>
                <Stack direction="row" spacing={1} sx={{p: 2, pt: 1}}>
                    <Button variant="contained" color="secondary" onClick={handleExportQRCode} disabled={isDisabled}>导出二维码</Button>
                    <Button variant="contained" color="success" onClick={handleExportTextFile} disabled={isDisabled}>导出备份文件</Button>
                </Stack>
            </Card>
        )}
    </>
}

export default ServerExport
