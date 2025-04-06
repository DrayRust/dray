import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Card, Box, Button, Link,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

import { clearLogAll, readLogList } from "../util/invoke.ts"
import { sizeToUnit, formatLogName } from "../util/util.ts"
import { LoadingCard, ErrorCard } from "../component/useCard.tsx"
import { useDialog } from "../component/useDialog.tsx"

const Log: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(4), [setNavState])
    const navigate = useNavigate()

    const [logList, setLogList] = useState<LogList>()
    const [errorMsg, setErrorMsg] = useState('')
    const readList = () => {
        readLogList().then((d) => {
            setLogList(d as LogList)
        }).catch(_ => {
            setLogList([])
            setErrorMsg('暂无日志')
        })
    }
    useEffect(() => readList(), [])

    const handleClearLogs = () => {
        confirm('确认清空', `确定要清空所有日志吗？`, async () => {
            const ok = await clearLogAll()
            ok && readList()
        })
    }

    const {DialogComponent, confirm} = useDialog()
    return (<>
        <DialogComponent/>
        {!logList ? (
            <LoadingCard/>
        ) : errorMsg ? (
            <ErrorCard errorMsg={errorMsg}/>
        ) : (<>
            <Box sx={{mb: 1}}>
                <Button variant="contained" onClick={handleClearLogs} startIcon={<DeleteIcon/>}>清空日志</Button>
            </Box>
            <TableContainer component={Card}>
                <Table sx={{minWidth: 650}}>
                    <TableHead>
                        <TableRow>
                            <TableCell>日志名称</TableCell>
                            <TableCell align="right" sx={{width: '120px'}}>日志大小</TableCell>
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
