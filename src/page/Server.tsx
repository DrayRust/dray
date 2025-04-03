import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Card, Stack, Checkbox, FormControlLabel,
    Button, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import FmdBadIcon from '@mui/icons-material/FmdBad'

import { useDebounce } from '../hook/useDebounce.ts'
import { readServerList, saveServerList } from "../util/invoke.ts"
import { useDialog } from "../component/useDialog.tsx"
import { useSnackbar } from "../component/useSnackbar.tsx"

const Server: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(1), [setNavState])
    const navigate = useNavigate()

    const [serverList, setServerList] = useState<ServerList>()
    const [selectedServers, setSelectedServers] = useState<boolean[]>([])
    const [selectedAll, setSelectedAll] = useState(false)
    const [showDeleteBut, setShowDeleteBut] = useState(false)
    const readList = () => {
        readServerList().then((d) => {
            setServerList(d as ServerList)
        }).catch(_ => {
            setServerList([])
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

    const handleUpdate = (key: number) => {
        navigate(`/server_update?key=${key}`)
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

    const handleBatchDelete = () => {
        const selectedKeys = selectedServers.map((selected, index) => selected ? index : -1).filter(key => key !== -1)
        if (selectedKeys.length > 0) {
            confirm('确认删除', `确定要删除这 ${selectedKeys.length} 条记录吗？`, async () => {
                const newServerList = serverList?.filter((_, index) => !selectedKeys.includes(index)) || []
                const ok = await saveServerList(newServerList)
                if (!ok) {
                    showSnackbar('删除失败', 'error')
                } else {
                    setServerList(newServerList)
                    setSelectedServers(new Array(newServerList.length).fill(false))
                    setSelectedAll(false)
                    setShowDeleteBut(false)
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

    const {SnackbarComponent, showSnackbar} = useSnackbar(true)
    const {DialogComponent, confirm} = useDialog()
    const cardSx = {p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: `calc(100vh - 64px)`, textAlign: 'center'}
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
            <Card sx={cardSx}><CircularProgress/></Card>
        ) : serverList.length === 0 ? (
            <Card sx={cardSx}>
                <FmdBadIcon sx={{fontSize: '5rem', mb: 2}}/>
                <div>暂无服务器</div>
            </Card>
        ) : (
            <TableContainer component={Card}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{width: '60px'}}>
                                <Checkbox checked={selectedAll}
                                          onChange={(e) => handleSelectAll(e.target.checked)}/>
                            </TableCell>
                            <TableCell>服务器名称</TableCell>
                            <TableCell sx={{width: '200px'}}>服务器地址</TableCell>
                            <TableCell sx={{width: '150px'}}>协议类型</TableCell>
                            <TableCell sx={{width: '150px'}}>加密方式</TableCell>
                            <TableCell sx={{width: '120px'}}>操作</TableCell>
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
                                <TableCell>
                                    <Checkbox checked={selectedServers[key] ?? false}
                                              onChange={(e) => handleSelectServer(key, e.target.checked)}/>
                                </TableCell>
                                <TableCell component="th" scope="row">{row.ps}</TableCell>
                                <TableCell>{row.host}</TableCell>
                                <TableCell>{row.type}</TableCell>
                                <TableCell>{row.scy}</TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1}>
                                        <Button variant="contained" color="primary" startIcon={<EditIcon/>}
                                                onClick={() => handleUpdate(key)}>修改</Button>
                                    </Stack>
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
