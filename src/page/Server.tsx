import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Card, Stack,
    Button, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import FmdBadIcon from '@mui/icons-material/FmdBad'

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

    const handleUpdate = (key: number) => {
        navigate(`/server_update?key=${key}`)
    }

    const handleDelete = (key: number) => {
        console.log(`Delete server: ${key}`)
    }

    const cardSx = {p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: `calc(100vh - 64px)`, textAlign: 'center'}
    return (<>
        <Stack direction="row" spacing={1} sx={{mb: 1}}>
            <Button variant="contained" color="secondary" onClick={handleCreate}>添加</Button>
            <Button variant="contained" color="warning" onClick={handleImport}>导入</Button>
            <Button variant="contained" color="info" onClick={handleExport}>导出</Button>
        </Stack>
        {!serverList ? (
            <Card sx={cardSx}><CircularProgress/></Card>
        ) : serverList.length === 0 ? (
            <Card sx={cardSx}>
                <FmdBadIcon sx={{fontSize: '5rem', mb: 2}}/>
                <div>暂无服务器</div>
            </Card>
        ) : (<>
            <TableContainer component={Card}>
                <Table sx={{minWidth: 650}}>
                    <TableHead>
                        <TableRow>
                            <TableCell>服务器名称</TableCell>
                            <TableCell sx={{width: '200px'}}>服务器地址</TableCell>
                            <TableCell sx={{width: '200px'}}>协议类型</TableCell>
                            <TableCell sx={{width: '200px'}}>加密方式</TableCell>
                            <TableCell sx={{width: '220px'}}>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {serverList.map((row, key) => (
                            <TableRow hover key={key} sx={{'&:last-child td, &:last-child th': {border: 0}}}>
                                <TableCell component="th" scope="row">{row.ps}</TableCell>
                                <TableCell>{row.host}</TableCell>
                                <TableCell>{row.type}</TableCell>
                                <TableCell>{row.scy}</TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1}>
                                        <Button variant="contained" color="primary" startIcon={<EditIcon/>}
                                                onClick={() => handleUpdate(key)}>修改</Button>
                                        <Button variant="contained" color="error" startIcon={<DeleteIcon/>}
                                                onClick={() => handleDelete(key)}>删除</Button>
                                    </Stack>
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
