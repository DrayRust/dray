import { useState, useEffect, useRef } from 'react'
import {
    Box, Card, IconButton, styled, TextField, InputAdornment, MenuItem,
    TableContainer, Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'

import { useDebounce } from "../hook/useDebounce.ts"
import { getProcessesJson } from "../util/invoke.ts"
import { useVisibility } from "../hook/useVisibility.ts"
import { formatFloat, formatTimestamp, sizeToUnit } from "../util/util.ts"

export const Process = ({handleClose}: { handleClose: () => void }) => {
    const [processes, setProcesses] = useState<any[]>([])
    const [searchText, setSearchText] = useState('')
    const [sortField, setSortField] = useState<string>('memory')

    const loadData = useDebounce(async (searchText: string, sortField: string) => {
        let arr = await getProcessesJson(searchText)
        if (arr) setProcesses(sortProcesses(arr, sortField))
    }, 300)

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
    }

    const handleSearch = (searchText: string) => {
        searchText = searchText.toLowerCase()
        setSearchText(searchText)
    }

    const handleSortFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const sortField = event.target.value as string
        setSortField(sortField)
    }

    const sortProcesses = (processes: any[], field: string): any[] => {
        return processes.sort((a, b) => {
            if (a[field] < b[field]) return 1
            if (a[field] > b[field]) return -1
            return 0
        })
    }

    const TableCellN = styled(TableCell)({
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    })

    return (
        <Box sx={{p: 1}}>
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    backgroundColor: 'background.paper',
                    boxShadow: 1,
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    placeholder="搜索..."
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon/>
                            </InputAdornment>
                        ),
                        endAdornment: searchText && (
                            <InputAdornment position="end">
                                <IconButton onClick={handleClear} size="small">
                                    <CloseIcon/>
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{maxWidth: 400}}
                />

                <TextField
                    select
                    size="small"
                    label="排序"
                    value={sortField}
                    onChange={handleSortFieldChange}
                    sx={{width: '120px', ml: 1}}
                >
                    <MenuItem value="pid">PID</MenuItem>
                    <MenuItem value="cpu_usage">CPU</MenuItem>
                    <MenuItem value="memory">内存</MenuItem>
                    <MenuItem value="name">进程名称</MenuItem>
                    <MenuItem value="exe">程序路径</MenuItem>
                    <MenuItem value="user">用户</MenuItem>
                    <MenuItem value="status">状态</MenuItem>
                    <MenuItem value="start_time">运行时间</MenuItem>
                </TextField>

                <IconButton
                    aria-label="close" onClick={handleClose}
                    sx={{position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500]}}>
                    <CloseIcon/>
                </IconButton>
            </Box>

            <TableContainer elevation={2} component={Card} sx={{mt: '56px'}}>
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
                            <TableRow key={key} sx={{'&:last-child td, &:last-child th': {border: 0}}}>
                                <TableCellN>{row.pid}</TableCellN>
                                <TableCellN>{row.user}</TableCellN>
                                <TableCellN>{row.status}</TableCellN>
                                <TableCellN>{sizeToUnit(row.memory)}</TableCellN>
                                <TableCellN>{formatFloat(row.cpu_usage, 1)}%</TableCellN>
                                <TableCellN>{formatTimestamp(row.start_time)}</TableCellN>
                                <TableCellN>{row.name}</TableCellN>
                                <TableCellN>{row.exe}</TableCellN>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}

export default Process
