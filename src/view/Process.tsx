import { useState, useEffect, useRef } from 'react'
import {
    Box, Button, Card, IconButton, styled, TextField, InputAdornment, MenuItem, Stack,
    TableContainer, Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'

import { ErrorCard, LoadingCard } from "../component/useCard.tsx"
import { useDialog } from "../component/useDialog.tsx"
import { useDebounce } from "../hook/useDebounce.ts"
import { getProcessesJson, killProcessByPid } from "../util/invoke.ts"
import { useVisibility } from "../hook/useVisibility.ts"
import { formatFloat, formatTimestamp, sizeToUnit } from "../util/util.ts"
import { openDir } from "../util/tauri.ts"

export const Process = ({handleClose}: { handleClose: () => void }) => {
    const [loading, setLoading] = useState(true)
    const [processes, setProcesses] = useState<any[]>([])
    const [searchText, setSearchText] = useState('')
    const [sortField, setSortField] = useState<string>('memory')

    const loadData = useDebounce(async (searchText: string, sortField: string) => {
        let arr = await getProcessesJson(searchText)
        if (arr) setProcesses(sortProcesses(arr, sortField))
        setLoading(false)
    }, 100)

    // 可见时，自动刷新数据
    const intervalRef = useRef<number>(0)
    const isVisibility = useVisibility()
    useEffect(() => {
        loadData(searchText, sortField)
        if (isVisibility) intervalRef.current = setInterval(() => loadData(searchText, sortField), 5000)
        return () => clearInterval(intervalRef.current)
    }, [isVisibility, searchText, sortField])

    const handleClear = () => {
        setSearchText('')
        setLoading(true)
    }

    const handleSearch = (searchText: string) => {
        searchText = searchText.toLowerCase()
        setSearchText(searchText)
    }

    const handleSortChange = (sortField: string) => {
        setSortField(sortField)
        setLoading(true)
    }

    const sortProcesses = (processes: any[], field: string): any[] => {
        return processes.sort((a, b) => {
            if (['pid', 'cpu_usage', 'memory', 'user', 'start_time'].includes(field)) {
                // 倒序
                if (a[field] < b[field]) return 1
                if (a[field] > b[field]) return -1
            } else {
                // 正序
                if (a[field] > b[field]) return 1
                if (a[field] < b[field]) return -1
            }
            return 0
        })
    }

    const handleOpenDir = async (e: any, path: string) => {
        e.stopPropagation()
        if (path) await openDir(path)
    }

    const [selectedPid, setSelectedPid] = useState<number>(-1)
    const handleRowClick = (pid: number) => {
        setSelectedPid(pid === selectedPid ? -1 : pid)
    }

    const handleKillPid = async () => {
        if (selectedPid < 0) return

        dialogConfirm('确认结束进程', `确定要结束这个进程吗？`, async () => {
            setSelectedPid(-1)
            let ok = await killProcessByPid(selectedPid)
            if (ok) loadData(searchText, sortField)
        })
    }

    const TableCellN = styled(TableCell)({
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    })

    const openSx = {mr: 0.6, transform: 'scale(.9)', '&:hover': {cursor: 'pointer', opacity: 0.6, transform: 'scale(1)'}}
    const maxHeight = 'calc(100vh - 72px)'

    const {DialogComponent, dialogConfirm} = useDialog()
    return (<>
        <DialogComponent/>
        <Box sx={{backgroundColor: 'background.paper', p: 1, display: 'flex', alignItems: 'center'}}>
            <TextField
                size="small" variant="outlined" placeholder="搜索..." sx={{width: 300}}
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start"><SearchIcon/></InputAdornment>
                        ),
                        endAdornment: searchText && (
                            <InputAdornment position="end"><IconButton onClick={handleClear} size="small"><CloseIcon/></IconButton></InputAdornment>
                        ),
                    },
                }}
            />

            <TextField
                select size="small" label="排序" value={sortField}
                onChange={(e) => handleSortChange(e.target.value)}
                sx={{width: '120px', ml: 1}}>
                <MenuItem value="pid">PID</MenuItem>
                <MenuItem value="cpu_usage">CPU</MenuItem>
                <MenuItem value="memory">内存</MenuItem>
                <MenuItem value="name">进程名称</MenuItem>
                <MenuItem value="exe">程序路径</MenuItem>
                <MenuItem value="user">用户</MenuItem>
                <MenuItem value="status">状态</MenuItem>
                <MenuItem value="start_time">运行时间</MenuItem>
            </TextField>

            {selectedPid > -1 && <Button variant="contained" onClick={handleKillPid} sx={{ml: 1}}>结束进程</Button>}

            <IconButton
                aria-label="close" onClick={handleClose}
                sx={{position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500]}}>
                <CloseIcon/>
            </IconButton>
        </Box>

        <Box sx={{p: 1}}>
            {loading ? (
                <LoadingCard height={maxHeight}/>
            ) : processes.length == 0 ? (
                <ErrorCard height={maxHeight} errorMsg="暂无相关进程"/>
            ) : (
                <Card elevation={2} sx={{overflow: 'hidden'}} className="scr-w2">
                    <TableContainer sx={{height: maxHeight}}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCellN>PID</TableCellN>
                                    <TableCellN>用户</TableCellN>
                                    <TableCellN>状态</TableCellN>
                                    <TableCellN>内存</TableCellN>
                                    <TableCellN>CPU</TableCellN>
                                    <TableCellN>运行时间</TableCellN>
                                    <TableCellN>进程名称</TableCellN>
                                    <TableCellN>程序路径</TableCellN>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {processes?.length > 0 && processes.map((row: any, key: number) => (
                                    <TableRow
                                        key={key}
                                        onClick={() => handleRowClick(row.pid)}
                                        sx={{
                                            '&:last-child td, &:last-child th': {border: 0},
                                            backgroundColor: row.pid === selectedPid ? 'ActiveBorder' : 'inherit',
                                        }}
                                    >
                                        <TableCellN>{row.pid}</TableCellN>
                                        <TableCellN>{row.user}</TableCellN>
                                        <TableCellN>{row.status}</TableCellN>
                                        <TableCellN>{sizeToUnit(row.memory)}</TableCellN>
                                        <TableCellN>{formatFloat(row.cpu_usage, 1)}%</TableCellN>
                                        <TableCellN>{formatTimestamp(row.start_time)}</TableCellN>
                                        <TableCellN>{row.name}</TableCellN>
                                        <TableCellN>
                                            <Stack direction="row" alignItems="center">
                                                <FolderOpenIcon onClick={(e) => handleOpenDir(e, row.exe)} sx={openSx}/>
                                                {row.exe}
                                            </Stack>
                                        </TableCellN>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            )}
        </Box>
    </>)
}

export default Process
