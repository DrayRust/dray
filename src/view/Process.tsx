import { useState, useEffect, useRef } from 'react'
import {
    Box, Card, IconButton, styled,
    TableContainer, Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useDebounce } from "../hook/useDebounce.ts"
import { getProcessesJson } from "../util/invoke.ts"
import { useVisibility } from "../hook/useVisibility.ts"
import { formatFloat, formatTimestamp, sizeToUnit } from "../util/util.ts"

export const Process = ({handleClose}: { handleClose: () => void }) => {
    const [processes, setProcesses] = useState<any>([])

    const loadData = useDebounce(async () => {
        let r = await getProcessesJson()
        if (r) setProcesses(r)
    }, 300)

    // 可见时，自动刷新数据
    const intervalRef = useRef<number>(0)
    const isVisibility = useVisibility()
    useEffect(() => {
        loadData()
        if (isVisibility) intervalRef.current = setInterval(loadData, 5000)
        return () => clearInterval(intervalRef.current)
    }, [isVisibility])

    const TableCellN = styled(TableCell)({
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    })

    return (
        <Box sx={{p: 1}}>
            <IconButton
                aria-label="close" onClick={handleClose}
                sx={{position: 'fixed', right: 8, top: 8, color: (theme) => theme.palette.grey[500]}}>
                <CloseIcon/>
            </IconButton>

            <TableContainer elevation={2} component={Card}>
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
