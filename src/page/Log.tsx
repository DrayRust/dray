import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Paper, Box, Button, Skeleton, Link,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material'

import { clearAllLogFiles, readLogsAllList } from "../util/invoke.ts"
import { sizeToUnit } from "../util/util.ts"

const Log: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(4), [setNavState])
    const navigate = useNavigate()

    const readList = () => {
        readLogsAllList().then((d) => {
            setLogsList(d as LogsList)
        }).catch(_ => 0)
    }

    const [logsList, setLogsList] = useState<LogsList>()
    useEffect(() => readList(), [])

    const logNameMap: Record<string, string> = {
        'dray.log': 'Dray 运行日志',
        'web_interface.log': 'Dray 交互日志',
        'web_server.log': 'Web 访问日志',
        'ray_server.log': 'Xray 启动日志',
        'xray_access.log': 'Xray 请求日志',
        'xray_error.log': 'Xray 运行日志',
    }

    const formatLogName = (filename: string) => {
        return logNameMap[filename] || filename
    }

    const handleClearLogs = async () => {
        const ok = await clearAllLogFiles()
        ok && readList()
    }

    return (<>
        <Box sx={{mb: 1, display: 'flex', justifyContent: 'flex-end'}}>
            <Button variant="contained" onClick={handleClearLogs}>清空日志</Button>
        </Box>
        <TableContainer component={Paper}>
            {!logsList ? (
                <Skeleton variant="rounded" animation="wave" height={60}/>
            ) : (
                <Table sx={{minWidth: 650}}>
                    <TableHead>
                        <TableRow>
                            <TableCell>日志名称</TableCell>
                            <TableCell align="right" sx={{width: '100px'}}>日志大小</TableCell>
                            <TableCell align="right" sx={{width: '180px'}}>最近更新</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logsList.map((row) => (
                            <TableRow key={row.filename} sx={{'&:last-child td, &:last-child th': {border: 0}}}>
                                <TableCell component="th" scope="row" sx={{cursor: 'pointer'}}>
                                    <Link underline="hover" onClick={() => navigate(`/log_detail?filename=${row.filename}`)}>
                                        {formatLogName(row.filename)}
                                    </Link>
                                </TableCell>
                                <TableCell align="right">{sizeToUnit(row.size)}</TableCell>
                                <TableCell align="right">{row.last_modified}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </TableContainer>
    </>)
}

export default Log
