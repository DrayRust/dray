import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Paper, Box, Button, CircularProgress, Link,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material'
import FmdBadIcon from '@mui/icons-material/FmdBad'

import { clearLogAll, readLogList } from "../util/invoke.ts"
import { sizeToUnit, formatLogName } from "../util/util.ts"

const Log: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(4), [setNavState])
    const navigate = useNavigate()

    const [logList, setLogList] = useState<LogList>()
    const readList = () => {
        readLogList().then((d) => {
            setLogList(d as LogList)
        }).catch(_ => 0)
    }
    useEffect(() => readList(), [])

    const handleClearLogs = async () => {
        const ok = await clearLogAll()
        ok && readList()
    }

    const paperSx = {p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: `calc(100vh - 20px)`, textAlign: 'center'}
    return (<>
        {!logList ? (
            <Paper sx={paperSx}><CircularProgress/></Paper>
        ) : logList.length === 0 ? (
            <Paper sx={paperSx}>
                <FmdBadIcon sx={{fontSize: '5rem', mb: 2}}/>
                <div>暂无日志</div>
            </Paper>
        ) : (<>
            <Box sx={{mb: 1}}>
                <Button variant="contained" onClick={handleClearLogs}>清空日志</Button>
            </Box>
            <TableContainer component={Paper}>
                <Table sx={{minWidth: 650}}>
                    <TableHead>
                        <TableRow>
                            <TableCell>日志名称</TableCell>
                            <TableCell align="right" sx={{width: '100px'}}>日志大小</TableCell>
                            <TableCell align="right" sx={{width: '180px'}}>最近更新</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logList.map((row) => (
                            <TableRow hover key={row.filename} sx={{'&:last-child td, &:last-child th': {border: 0}}}>
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
            </TableContainer>
        </>)}
    </>)
}

export default Log
