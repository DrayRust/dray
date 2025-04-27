import { useState, useEffect, useRef } from 'react'
import { FixedSizeList as List } from 'react-window'
import {
    Box, Button, Card, IconButton, TextField, InputAdornment, MenuItem, Stack,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'

import { ErrorCard, LoadingCard } from "../component/useCard.tsx"
import { useDebounce } from "../hook/useDebounce.ts"
import { useVisibility } from "../hook/useVisibility.ts"
import { useFullHeight } from "../hook/useFullHeight.ts"
import { getProcessesJson, killProcessByPid } from "../util/invoke.ts"
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
        setSelectedPid(-1)
        let ok = await killProcessByPid(selectedPid)
        if (ok) loadData(searchText, sortField)
    }

    const ROW_HEIGHT = 30
    const fullHeight = useFullHeight()
    const [listHeight, setListHeight] = useState(0)
    useEffect(() => {
        setListHeight(fullHeight - 75 - 30)
    }, [fullHeight])

    const openSx = {mr: 0.6, transform: 'scale(.9)', '&:hover': {cursor: 'pointer', opacity: 0.6, transform: 'scale(1)'}}
    const maxHeight = 'calc(100vh - 75px)'

    const Row = ({index, style}: { index: number, style: any }) => {
        const row = processes[index]
        return (<>
            <div className="process-row"
                 style={{...style, backgroundColor: row.pid === selectedPid ? 'ActiveBorder' : 'inherit'}}
                 onClick={() => handleRowClick(row.pid)}
            >
                <div>{row.pid}</div>
                <div>{row.user}</div>
                <div>{row.status}</div>
                <div>{sizeToUnit(row.memory)}</div>
                <div>{formatFloat(row.cpu_usage, 1)}%</div>
                <div>{formatTimestamp(row.start_time)}</div>
                <div>{row.name}</div>
                <div>
                    <Stack direction="row" alignItems="center">
                        <FolderOpenIcon onClick={(e) => handleOpenDir(e, row.exe)} sx={openSx}/>
                        {row.exe}
                    </Stack>
                </div>
            </div>
        </>)
    }

    return (<>
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

            <TextField disabled size="small" label="总进程数" value={processes.length} sx={{width: '90px', ml: 1}}></TextField>

            {selectedPid > -1 && <Button variant="contained" color="error" onClick={handleKillPid} sx={{ml: 1}}>结束进程</Button>}

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
                    <div className="process-row">
                        <div>PID</div>
                        <div>用户</div>
                        <div>状态</div>
                        <div>内存</div>
                        <div>CPU</div>
                        <div>运行时间</div>
                        <div>进程名称</div>
                        <div>程序路径</div>
                    </div>
                    <List height={listHeight} itemCount={processes.length} itemSize={ROW_HEIGHT} width="100%">{Row}</List>
                </Card>
            )}
        </Box>
    </>)
}

export default Process
