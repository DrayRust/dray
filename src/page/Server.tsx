import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Button, CircularProgress,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import { readServerList } from "../util/invoke.ts"

const Server: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(1), [setNavState])
    const navigate = useNavigate()

    const [serverList, setServerList] = useState<ServerList>()
    console.log(serverList)
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

    const handleEdit = (key: number) => {
        navigate(`/server_edit?key=${key}`)
    }

    const handleDelete = (key: number) => {
        console.log(`Delete server: ${key}`)
    }

    return (<>
        <Box sx={{mb: 1}}>
            <Button variant="contained" onClick={handleCreate}>添加</Button>
            <Button variant="contained" onClick={handleImport}>导入</Button>
            <Button variant="contained" onClick={handleExport}>导出</Button>
        </Box>
        {serverList === undefined ? (
            <Box sx={{p: 3, textAlign: 'center'}}><CircularProgress/></Box>
        ) : serverList.length === 0 ? (
            <Box sx={{p: 3, textAlign: 'center', color: 'text.secondary'}}>暂无服务器</Box>
        ) : (<>
            <TableContainer component={Paper}>
                <Table sx={{minWidth: 650}}>
                    <TableHead>
                        <TableRow>
                            <TableCell>服务器名称</TableCell>
                            <TableCell sx={{width: '200px'}}>服务器地址</TableCell>
                            <TableCell sx={{width: '100px'}}>协议类型</TableCell>
                            <TableCell sx={{width: '100px'}}>加密方式</TableCell>
                            <TableCell sx={{width: '100px'}}>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {serverList.map((row, key) => (
                            <TableRow hover key={key} sx={{'&:last-child td, &:last-child th': {border: 0}}}>
                                <TableCell component="th" scope="row">{row.ps}</TableCell>
                                <TableCell>{row.host}</TableCell>
                                <TableCell>{row.type}</TableCell>
                                <TableCell>{row.scy}</TableCell>
                                <TableCell align="right">
                                    <Button variant="contained" color="primary" startIcon={<EditIcon/>}
                                            onClick={() => handleEdit(key)}>修改</Button>
                                    <Button variant="contained" color="error" startIcon={<DeleteIcon/>}
                                            onClick={() => handleDelete(key)}>删除</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>)}
    </>)
}

export default Server
