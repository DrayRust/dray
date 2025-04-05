import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Card, Stack, Checkbox, FormControlLabel, Button, Typography, useMediaQuery,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Menu, MenuItem, IconButton, Divider,
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'

import { useDebounce } from '../hook/useDebounce.ts'
import { readServerList, saveServerList } from "../util/invoke.ts"
import { useDialog } from "../component/useDialog.tsx"
import { useSnackbar } from "../component/useSnackbar.tsx"
import { ErrorCard, LoadingCard } from "../component/useCard.tsx"

const Server: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(1), [setNavState])
    const navigate = useNavigate()
    const isMediumScreen = useMediaQuery('(max-width: 1100px)')

    const [serverList, setServerList] = useState<ServerList>()
    const [selectedServers, setSelectedServers] = useState<boolean[]>([])
    const [selectedAll, setSelectedAll] = useState(false)
    const [showDeleteBut, setShowDeleteBut] = useState(false)
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

    const handleImport = () => {
        navigate(`/server_import`)
    }

    const handleExport = () => {
        navigate(`/server_export`)
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

    const handleEnable = () => {
        handleMenuClose()
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

    useEffect(() => {
        if (serverList) setSelectedServers(new Array(serverList.length).fill(false))
    }, [serverList])

    const handleSelectAll = (checked: boolean) => {
        setSelectedServers(new Array(serverList?.length).fill(checked))
        setSelectedAll(checked)
        setShowDeleteBut(checked)
    }

    const handleSelectServer = (index: number, checked: boolean) => {
        const newSelected = [...selectedServers]
        newSelected[index] = checked
        setSelectedServers(newSelected)
        setSelectedAll(newSelected.every(Boolean))
        setShowDeleteBut(newSelected.some(Boolean))
    }

    const updateServerList = (newServerList: ServerList) => {
        setServerList(newServerList)
        setSelectedServers(new Array(newServerList.length).fill(false))
        setSelectedAll(false)
        setShowDeleteBut(false)
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

    const [enableDragSort, setEnableDragSort] = useState(false)
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
    const [dragIsChange, setDragIsChange] = useState(false)
    const handleSaveServerList = useDebounce(async (dragIsChange: boolean, serverList: ServerList) => {
        if (dragIsChange && serverList.length > 0) {
            setDragIsChange(false)
            const ok = await saveServerList(serverList)
            if (!ok) showSnackbar('保存失败', 'error')
            // console.log('save ok')
        }
    }, 300)
    useEffect(() => {
        const handleMouseUp = () => {
            setDraggingIndex(null)
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

    const {SnackbarComponent, showSnackbar} = useSnackbar()
    const {DialogComponent, confirm} = useDialog()
    const height = 'calc(100vh - 70px)'
    return (<>
        <SnackbarComponent/>
        <DialogComponent/>
        <Stack direction="row" sx={{mb: 1, minHeight: '42px', justifyContent: "space-between", alignItems: "center"}}>
            <Stack direction="row" spacing={1}>
                <Button variant="contained" color="secondary" onClick={handleCreate}>添加</Button>
                <Button variant="contained" color="warning" onClick={handleImport}>导入</Button>
                {Array.isArray(serverList) && serverList.length > 0 && (
                    <Button variant="contained" color="info" onClick={handleExport}>导出</Button>
                )}
                {showDeleteBut && (<Button variant="contained" color="error" onClick={handleBatchDelete}>批量删除</Button>)}
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
                            <TableCell sx={{width: '200px'}}>服务器地址</TableCell>
                            {!isMediumScreen && (<TableCell sx={{width: '100px'}}>协议类型</TableCell>)}
                            {!isMediumScreen && (<TableCell sx={{width: '200px'}}>安全类型</TableCell>)}
                            <TableCell padding="checkbox"/>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {serverList.map((row, key) => (
                            <TableRow
                                key={key}
                                hover
                                sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                className={enableDragSort ? (draggingIndex === key ? 'drag-grabbing' : 'drag-grab') : ''}
                                onMouseDown={() => {
                                    if (!enableDragSort) return
                                    setDraggingIndex(key)
                                }}
                                onMouseUp={(e) => {
                                    e.stopPropagation()
                                    if (!enableDragSort) return
                                    setDraggingIndex(null)
                                    handleSaveServerList(dragIsChange, serverList)
                                }}
                                onMouseEnter={() => {
                                    if (!enableDragSort) return
                                    if (draggingIndex !== null && draggingIndex !== key) {
                                        const newServerList = [...serverList]
                                        const [draggedItem] = newServerList.splice(draggingIndex, 1)
                                        newServerList.splice(key, 0, draggedItem)
                                        setServerList(newServerList)
                                        setDraggingIndex(key)
                                        setDragIsChange(true)
                                    }
                                }}
                            >
                                <TableCell padding="checkbox">
                                    <Checkbox checked={selectedServers[key] ?? false}
                                              onChange={(e) => handleSelectServer(key, e.target.checked)}/>
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    {row.ps}
                                    {isMediumScreen && (
                                        <Typography color="secondary">{row.type} <Typography color="info" component="span">{row.scy}</Typography></Typography>
                                    )}
                                </TableCell>
                                <TableCell>{row.host}</TableCell>
                                {!isMediumScreen && (<TableCell>{row.type}</TableCell>)}
                                {!isMediumScreen && (<TableCell>{row.scy}</TableCell>)}
                                <TableCell padding="checkbox">
                                    <IconButton onClick={(e) => handleMenuClick(e, key)}><MoreVertIcon/></IconButton>
                                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                                        <MenuItem onClick={handleEnable}>启用</MenuItem>
                                        <Divider/>
                                        <MenuItem onClick={handleUpdate}>编辑</MenuItem>
                                        <MenuItem onClick={handleDelete}>删除</MenuItem>
                                    </Menu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        )}
    </>)
}

export default Server
