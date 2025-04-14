import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Card, Stack, Checkbox, FormControlLabel, Button, Typography, useMediaQuery,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
    Menu, MenuItem, IconButton, Divider, Drawer, TextField, Tooltip,
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import DoneOutlineIcon from '@mui/icons-material/DoneOutline'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

import { readText } from '@tauri-apps/plugin-clipboard-manager'
import { useDialog } from "../component/useDialog.tsx"
import { useSnackbar } from "../component/useSnackbar.tsx"
import { ErrorCard, LoadingCard } from "../component/useCard.tsx"
import { useServerImport } from "../component/useServerImport.tsx"
import { useDebounce } from '../hook/useDebounce.ts'
import {
    readAppConfig, readRayCommonConfig, saveRayConfig, getDrayAppDir,
    restartRay, readServerList, saveServerList, readRuleConfig, readRuleDomain, readRuleModeList
} from "../util/invoke.ts"
import { getConf } from "../util/serverConf.ts"
import { DEFAULT_APP_CONFIG, DEFAULT_RAY_COMMON_CONFIG, DEFAULT_RULE_CONFIG, DEFAULT_RULE_DOMAIN, DEFAULT_RULE_MODE_LIST } from "../util/config.ts"
import { ruleToConf } from "../util/rule.ts"

const Server: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(1), [setNavState])
    const navigate = useNavigate()
    const isMediumScreen = useMediaQuery('(max-width: 1100px)')

    const [serverList, setServerList] = useState<ServerList>()
    const [selectedServers, setSelectedServers] = useState<boolean[]>([])
    const [selectedAll, setSelectedAll] = useState(false)
    const [showAction, setShowAction] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const readList = () => {
        readServerList().then((d) => {
            setServerList(d as ServerList)
        }).catch(_ => {
            setServerList([])
            setErrorMsg('暂无服务器')
        })
    }
    useEffect(() => readList(), [])

    const handleCreate = () => {
        navigate(`/server_create`)
    }

    const handleClipboardImport = async () => {
        try {
            const clipboardText = await readText()
            if (clipboardText) {
                await useServerImport(clipboardText, showSnackbar, null, readList)
            } else {
                showSnackbar('剪切板没有内容', 'error')
            }
        } catch (e) {
            showSnackbar('读取剪切板失败', 'error')
        }
    }

    const handleImport = () => {
        navigate(`/server_import`)
    }

    const handleExport = () => {
        const selectedKeys = getSelectedKeys()
        navigate(`/server_export`, {state: {selectedKeys}})
    }

    const getSelectedKeys = () => {
        const selectedKeys: number[] = []
        for (let index = 0; index < selectedServers.length; index++) {
            if (selectedServers[index]) selectedKeys.push(index)
        }
        return selectedKeys
    }

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [selectedKey, setSelectedKey] = useState<number>(-1)

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, key: number) => {
        setAnchorEl(event.currentTarget)
        setSelectedKey(key)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
        setSelectedKey(-1)
    }

    const handleUpdate = () => {
        navigate(`/server_update?key=${selectedKey}`)
    }

    // 必须放内部，否则不会读取最新配置文件
    let appDir: string
    let config: AppConfig
    let rayCommonConfig: RayCommonConfig
    let ruleConfig: RuleConfig
    let ruleDomain: RuleDomain
    let ruleModeList: RuleModeList
    const initConfig = async () => {
        if (!appDir) appDir = await getDrayAppDir()
        if (!config) config = await readAppConfig() || DEFAULT_APP_CONFIG
        if (!rayCommonConfig) rayCommonConfig = await readRayCommonConfig() || DEFAULT_RAY_COMMON_CONFIG

        if (!ruleConfig) ruleConfig = await readRuleConfig() || DEFAULT_RULE_CONFIG
        if (!ruleDomain) ruleDomain = await readRuleDomain() || DEFAULT_RULE_DOMAIN
        if (!ruleModeList) ruleModeList = await readRuleModeList() || DEFAULT_RULE_MODE_LIST
    }

    const setServerEnable = async (selectedKey: number) => {
        if (!serverList) return false
        const newServerList = serverList.map((server, index) => {
            server.on = index === selectedKey ? 1 : 0
            return server
        })
        const ok = await saveServerList(newServerList)
        if (!ok) {
            showSnackbar('设置启用失败', 'error')
        }
        updateServerList(newServerList)
        return ok
    }

    const getServerConf = async (callback: (conf: any) => void) => {
        await initConfig()
        if (serverList?.[selectedKey] && appDir && config && rayCommonConfig) {
            const conf = getConf(serverList[selectedKey], appDir, config, rayCommonConfig)
            if (conf) {
                const routing = ruleToConf(ruleConfig, ruleDomain, ruleModeList)
                callback({...conf, ...routing})
            } else {
                showSnackbar('生成 conf 失败', 'error')
            }
        } else {
            showSnackbar('获取配置信息失败', 'error')
        }
    }

    const handleEnable = async () => {
        if (serverList?.[selectedKey]?.on) {
            handleMenuClose()
            return
        }

        await getServerConf(async (conf) => {
            const ok = await saveRayConfig(conf)
            if (ok) {
                const setOk = await setServerEnable(selectedKey)
                setOk && restartRay()
            }
        })
        handleMenuClose()
    }

    const [openDrawer, setOpenDrawer] = useState(false)
    const [rayConfigJson, setRayConfigJson] = useState('')
    const handleCloseDrawer = () => setOpenDrawer(false)
    const handleViewConfig = async () => {
        setOpenDrawer(true)
        await getServerConf(async (conf) => {
            setRayConfigJson(JSON.stringify(conf, null, 2))
        })
        handleMenuClose()
    }

    const [jsonCopied, setJsonCopied] = useState('')
    const handleCopyJson = async () => {
        await navigator.clipboard.writeText(rayConfigJson)
        setJsonCopied('已复制')
        setTimeout(() => setJsonCopied(''), 1000)
    }

    const handleDelete = () => {
        confirm('确认删除', `确定要删除这个服务器吗？`, async () => {
            const newServerList = serverList?.filter((_, index) => index !== selectedKey) || []
            const ok = await saveServerList(newServerList)
            if (!ok) {
                showSnackbar('删除失败', 'error')
            } else {
                updateServerList(newServerList)
            }
            handleMenuClose()
        })
    }

    const handleBatchDelete = () => {
        const selectedKeys = selectedServers.map((selected, index) => selected ? index : -1).filter(key => key !== -1)
        if (selectedKeys.length > 0) {
            confirm('确认删除', `确定要删除这 ${selectedKeys.length} 个服务器吗？`, async () => {
                const newServerList = serverList?.filter((_, index) => !selectedKeys.includes(index)) || []
                const ok = await saveServerList(newServerList)
                if (!ok) {
                    showSnackbar('删除失败', 'error')
                } else {
                    updateServerList(newServerList)
                }
            })
        }
    }

    useEffect(() => {
        if (serverList) setSelectedServers(new Array(serverList.length).fill(false))
    }, [serverList])

    const handleSelectAll = (checked: boolean) => {
        setSelectedServers(new Array(serverList?.length).fill(checked))
        setSelectedAll(checked)
        setShowAction(checked)
    }

    const handleSelectServer = (index: number, checked: boolean) => {
        const newSelected = [...selectedServers]
        newSelected[index] = checked
        setSelectedServers(newSelected)
        setSelectedAll(newSelected.every(Boolean))
        setShowAction(newSelected.some(Boolean))
    }

    const updateServerList = (newServerList: ServerList) => {
        setServerList(newServerList)
        setSelectedServers(new Array(newServerList.length).fill(false))
        setSelectedAll(false)
        setShowAction(false)
    }

    const [enableDragSort, setEnableDragSort] = useState(false)
    const [dragIndex, setDragIndex] = useState<number>(-1)
    const [dragIsChange, setDragIsChange] = useState(false)
    const handleSaveServerList = useDebounce(async (dragIsChange: boolean, serverList: ServerList) => {
        if (dragIsChange && serverList && serverList.length > 0) {
            setDragIsChange(false)
            const ok = await saveServerList(serverList)
            if (!ok) showSnackbar('保存失败', 'error')
            // console.log('save ok')
        }
    }, 300)

    useEffect(() => {
        const handleMouseUp = () => {
            setDragIndex(-1)
            setDragIsChange(prevIsChange => {
                setServerList(prevServerList => {
                    handleSaveServerList(prevIsChange, prevServerList)
                    return prevServerList
                })
                return prevIsChange
            })
        }
        window.addEventListener('mouseup', handleMouseUp)
        return () => {
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [])

    const handleMouseStart = (key: number) => {
        if (!enableDragSort) return
        setDragIndex(key)
    }

    const handleMouseEnd = (e: React.MouseEvent) => {
        if (!enableDragSort) return
        e.stopPropagation()
        setDragIndex(-1)
        handleSaveServerList(dragIsChange, serverList)
    }

    const handleMouseEnter = (key: number) => {
        if (!enableDragSort) return
        if (dragIndex > -1 && dragIndex !== key && serverList) {
            const newServerList = [...serverList]
            const [draggedItem] = newServerList.splice(dragIndex, 1)
            newServerList.splice(key, 0, draggedItem)
            setServerList(newServerList)
            setDragIndex(key)
            setDragIsChange(true)
        }
    }

    const {SnackbarComponent, showSnackbar} = useSnackbar()
    const {DialogComponent, confirm} = useDialog()
    const height = 'calc(100vh - 70px)'
    return (<>
        <SnackbarComponent/>
        <DialogComponent/>
        <Stack direction="row" sx={{mb: 1, minHeight: '42px', justifyContent: "space-between", alignItems: "center"}}>
            <Stack direction="row" spacing={1}>
                <Button variant="contained" color="secondary" onClick={handleCreate}>添加</Button>
                <Button variant="contained" color="success" onClick={handleClipboardImport}>剪切板导入</Button>
                <Button variant="contained" color="warning" onClick={handleImport}>导入</Button>
                {showAction && (<>
                    <Button variant="contained" color="info" onClick={handleExport}>导出</Button>
                    <Button variant="contained" color="error" onClick={handleBatchDelete}>批量删除</Button>
                </>)}
            </Stack>
            {Array.isArray(serverList) && serverList.length > 0 && (
                <FormControlLabel label="拖拽排序" control={<Checkbox
                    checked={enableDragSort}
                    onChange={(e) => setEnableDragSort(e.target.checked)}/>
                }/>
            )}
        </Stack>
        {!serverList ? (
            <LoadingCard height={height}/>
        ) : serverList.length === 0 ? (
            <ErrorCard errorMsg={errorMsg} height={height}/>
        ) : (
            <TableContainer component={Card}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox checked={selectedAll}
                                          onChange={(e) => handleSelectAll(e.target.checked)}/>
                            </TableCell>
                            <TableCell>服务器名称</TableCell>
                            <TableCell sx={{width: '280px'}}>服务器地址</TableCell>
                            {!isMediumScreen && (<><TableCell sx={{width: '100px'}}>协议类型</TableCell><TableCell sx={{width: '200px'}}>安全类型</TableCell></>)}
                            <TableCell padding="checkbox"/>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {serverList.map((row, key) => (
                            <TableRow
                                key={key} hover
                                sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                className={enableDragSort ? (dragIndex === key ? 'drag-grabbing' : 'drag-grab') : ''}
                                onMouseDown={() => handleMouseStart(key)}
                                onMouseUp={(e) => handleMouseEnd(e)}
                                onMouseEnter={() => handleMouseEnter(key)}
                            >
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selectedServers[key] ?? false}
                                        onChange={(e) => handleSelectServer(key, e.target.checked)}/>
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    {row.ps}
                                    {isMediumScreen && (
                                        <Typography color="secondary">{row.type}<Typography color="info" component="span" ml={1}>{row.scy}</Typography></Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex-between">
                                        {row.host}
                                        {Boolean(row.on) && (<Chip label="启用" color="success" size="small"/>)}
                                    </div>
                                </TableCell>
                                {!isMediumScreen && (<><TableCell>{row.type}</TableCell><TableCell>{row.scy}</TableCell></>)}
                                <TableCell padding="checkbox">
                                    <IconButton onClick={(e) => handleMenuClick(e, key)}><MoreVertIcon/></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        )}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleEnable}><DoneOutlineIcon sx={{mr: 1}} fontSize="small"/>启用</MenuItem>
            <Divider/>
            <MenuItem onClick={handleUpdate}><EditIcon sx={{mr: 1}} fontSize="small"/>编辑</MenuItem>
            <MenuItem onClick={handleViewConfig}><VisibilityIcon sx={{mr: 1}} fontSize="small"/>配置</MenuItem>
            <MenuItem onClick={handleDelete}><DeleteIcon sx={{mr: 1}} fontSize="small"/>删除</MenuItem>
        </Menu>
        <Drawer open={openDrawer} anchor="right" onClose={handleCloseDrawer}>
            <Stack sx={{p: 1, width: 660}} spacing={2}>
                <div className="flex-between">
                    <IconButton onClick={handleCloseDrawer}><DoubleArrowIcon/></IconButton>
                    <Tooltip title={jsonCopied || '点击复制'}>
                        <IconButton onClick={handleCopyJson}><ContentCopyIcon/></IconButton>
                    </Tooltip>
                </div>
                <TextField variant="outlined" label="配置详情" value={rayConfigJson} fullWidth multiline disabled/>
            </Stack>
        </Drawer>
    </>)
}

export default Server
