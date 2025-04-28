import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import {
    Box, Typography, Tooltip,
    TextField, IconButton, ToggleButtonGroup, ToggleButton,
    Accordion, AccordionSummary, AccordionDetails,
    Stack, Button
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SaveAltIcon from '@mui/icons-material/SaveAlt'

import { save } from '@tauri-apps/plugin-dialog'
import { useAppBar } from "../component/useAppBar.tsx"
import { useSnackbar } from "../component/useSnackbar.tsx"
import { ErrorCard, LoadingCard } from "../component/useCard.tsx"
import { log, readServerList, saveTextFile } from "../util/invoke.ts"
import { serverRowToBase64Uri, serverRowToUri } from "../util/server.ts"
import { getCurrentYMDHIS } from "../util/util.ts"
import { clipboardWriteText } from "../util/tauri.ts"

const ServerExport: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(1), [setNavState])

    const location = useLocation()
    const {selectedKeys} = location.state || {}

    const [serverList, setServerList] = useState<ServerList>()
    const [isBase64, setIsBase64] = useState(false)
    const [psList, setPsList] = useState<string[]>([])
    const [uriList, setUriList] = useState<string[]>([])
    const [base64UriList, setBase64UriList] = useState<string[]>([])
    const [errorMsg, setErrorMsg] = useState('')
    const readList = () => {
        (async () => {
            let serverList = await readServerList()
            if (serverList) {
                if (selectedKeys && selectedKeys.length > 0) {
                    serverList = serverList.filter((_, index) => selectedKeys.includes(index))
                }
                setServerList(serverList)
                initPsAndUriList(serverList)
            } else {
                setServerList([])
                setErrorMsg('暂无服务器')
            }
        })()
    }
    useEffect(() => readList(), [])

    const initPsAndUriList = (serverList: ServerList) => {
        const psList = []
        const uriList = []
        for (let i = 0; i < serverList.length; i++) {
            const server = serverList[i]
            psList.push(server.ps)
            uriList.push(serverRowToUri(server))
        }
        setPsList(psList)
        setUriList(uriList)
    }

    const initBase64UriList = () => {
        if (base64UriList.length > 0 || !serverList) return // 不重复计算
        const list = []
        for (let i = 0; i < serverList.length; i++) {
            const server = serverList[i]
            list.push(serverRowToBase64Uri(server))
        }
        setBase64UriList(list)
    }

    const handleFormatChange = (isBase64: boolean) => {
        if (isBase64 !== null) setIsBase64(isBase64)
        isBase64 && initBase64UriList()
    }

    const handleExportTextFile = async () => {
        const path = await showSaveDialog()
        if (!path) return

        let content: string
        if (isBase64) {
            initBase64UriList()
            content = base64UriList.join('\n')
        } else {
            content = uriList.join('\n')
        }
        const ok = await saveTextFile(path, content)
        if (!ok) showSnackbar(`保存文件失败`, 'error')
    }

    const showSaveDialog = async () => {
        try {
            const path = await save({
                title: "Export Backup File",
                defaultPath: `dray_servers_${getCurrentYMDHIS()}.txt`,
                filters: [{name: 'Text File', extensions: ['txt']}],
            })
            return path || ''
        } catch (e) {
            log.error(`Tauri save dialog error: ${e}`)
            return ''
        }
    }

    const getUri = (i: number) => {
        return isBase64 ? base64UriList[i] : uriList[i]
    }

    const handleAccordion = (i: number) => {
        if (!showKeys.includes(i)) setShowKeys([...showKeys, i])
    }

    const [uriCopied, setUriCopied] = useState(false)
    const handleCopyURI = async (i: number) => {
        await clipboardWriteText(getUri(i))
        setUriCopied(true)
        setTimeout(() => setUriCopied(false), 1000)
    }

    const [svgCopied, setSvgCopied] = useState(false)
    const handleCopyQRCodeSVG = async (i: number) => {
        const qrCodeHtml = document.querySelector(`.qrcode-${i}`)?.outerHTML
        if (qrCodeHtml) {
            await clipboardWriteText(qrCodeHtml)
            setSvgCopied(true)
            setTimeout(() => setSvgCopied(false), 1000)
        }
    }

    const [showKeys, setShowKeys] = useState<number[]>([0])
    const height = 'calc(100vh - 85px)'
    const {SnackbarComponent, showSnackbar} = useSnackbar('br')
    const {AppBarComponent} = useAppBar('/server', '导出')
    return <>
        <SnackbarComponent/>
        <AppBarComponent/>
        {!serverList ? (
            <LoadingCard height={height} mt={1}/>
        ) : errorMsg ? (
            <ErrorCard errorMsg={errorMsg} height={height} mt={1}/>
        ) : (<>
            <Stack direction="row" spacing={1} sx={{py: 1, alignItems: 'center', justifyContent: 'space-between'}}>
                <ToggleButtonGroup exclusive value={isBase64} onChange={(_, v: boolean) => handleFormatChange(v)}>
                    <ToggleButton value={false}>URL 格式</ToggleButton>
                    <ToggleButton value={true}>Base64 URI 格式</ToggleButton>
                </ToggleButtonGroup>
                <Button variant="contained" onClick={handleExportTextFile} startIcon={<SaveAltIcon/>}>导出备份文件</Button>
            </Stack>
            {psList.map((ps, i) => (
                <Accordion key={i} defaultExpanded={i === 0} onChange={() => handleAccordion(i)}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                        <Typography component="span">{ps}</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{textAlign: 'center'}}>
                        {showKeys.includes(i) && (<>
                            <div className="qr-box">
                                <QRCodeSVG className={`qrcode-${i}`} value={getUri(i)} title={ps} size={256} xmlns="http://www.w3.org/2000/svg"/>
                            </div>
                            <Box sx={{mt: 1}}>
                                <TextField value={getUri(i)} variant="outlined" size="small" fullWidth multiline disabled/>
                            </Box>
                            <Box sx={{mt: 1}}>
                                <Tooltip arrow title={uriCopied ? '已复制' : (isBase64 ? '复制 Base64 URI' : '复制 URL')}>
                                    <IconButton onClick={() => handleCopyURI(i)}><ContentCopyIcon/></IconButton>
                                </Tooltip>
                                <Tooltip arrow title={svgCopied ? '已复制' : '复制二维码 SVG'}>
                                    <IconButton onClick={() => handleCopyQRCodeSVG(i)}><FileCopyIcon/></IconButton>
                                </Tooltip>
                            </Box>
                        </>)}
                    </AccordionDetails>
                </Accordion>
            ))}
        </>)}
    </>
}

export default ServerExport
