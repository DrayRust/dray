import { useState, useEffect } from 'react'
import {
    Button, Card, Stack,
    TableContainer, Table, TableRow, TableCell, TableBody, Tooltip, IconButton,
    Typography, Switch, TextField, MenuItem,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditSquareIcon from '@mui/icons-material/EditSquare'
import OpenWithIcon from '@mui/icons-material/OpenWith'
import DeleteIcon from '@mui/icons-material/Delete'

import { DEFAULT_DNS_MODE_ROW } from "../util/config.ts"
import { ErrorCard, LoadingCard } from "../component/useCard.tsx"

const DEFAULT_DNS_HOST_ROW: DnsHostRow = {
    name: '',
    note: '',
    domain: '',
    host: '',
}

const DEFAULT_DNS_SERVER_ROW: DnsServerRow = {
    name: '',
    note: '',
    tag: '',
    address: '',
    port: '',
    domains: '',
    expectIPs: '',
    clientIP: '',
    queryStrategy: '',
    timeoutMs: 4000,
    skipFallback: false,
    allowUnexpectedIPs: false,
}

export const DnsModeEditor = ({dnsModeRow, handleUpdateSubmit, handleBack}: {
    dnsModeRow: DnsModeRow;
    handleUpdateSubmit: (row: DnsModeRow) => void;
    handleBack: () => void;
}) => {
    const [loading, setLoading] = useState(true)
    const [action, setAction] = useState('')
    const [row, setRow] = useState<DnsModeRow>(DEFAULT_DNS_MODE_ROW)
    useEffect(() => {
        setRow(dnsModeRow)
        setLoading(false)
    }, [dnsModeRow])

    const handleRowChange = (type: keyof DnsModeRow) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setRow({...row, [type]: e.target.value})
    }

    const handleSubmit = () => {
        let item: DnsModeRow = {...row}

        item.name = item.name.trim()
        const isNameEmpty = item.name === ''
        if (isNameEmpty) return

        item.note = item.note.trim()

        handleUpdateSubmit(item)
    }

    const handleCancel = () => {
        setAction('')
    }

    const [dnsHostRow, setDnsHostRow] = useState<DnsHostRow>(DEFAULT_DNS_HOST_ROW)
    const handleHostCreate = () => {
        setAction('host')
        setDnsHostRow(DEFAULT_DNS_HOST_ROW)
    }

    const [dnsServerRow, setDnsServerRow] = useState<DnsServerRow>(DEFAULT_DNS_SERVER_ROW)
    const handleServerCreate = () => {
        setAction('server')
        setDnsServerRow(DEFAULT_DNS_SERVER_ROW)
    }

    const [hostSortKey, setHostSortKey] = useState(-1)
    const handleHostSortStart = (e: React.MouseEvent, key: number) => {
        e.stopPropagation()
        if (hostSortKey === -1) {
            setHostSortKey(key)
        } else if (hostSortKey === key) {
            setHostSortKey(-1)
        } else {
            handleHostSortEnd(key)
        }
    }

    const handleHostSortEnd = (key: number) => {
    }

    const handleHostUpdate = (key: number) => {
    }

    const handleHostDelete = (key: number, name: string) => {
    }

    const [serverSortKey, setServerSortKey] = useState(-1)
    const handleServerSortStart = (e: React.MouseEvent, key: number) => {
        e.stopPropagation()
        if (hostSortKey === -1) {
            setServerSortKey(key)
        } else if (hostSortKey === key) {
            setServerSortKey(-1)
        } else {
            handleServerSortEnd(key)
        }
    }

    const handleServerSortEnd = (key: number) => {
    }

    const handleServerUpdate = (key: number) => {
    }

    const handleServerDelete = (key: number, name: string) => {
    }

    return (<>
        {action === 'host' ? (<>
            <Stack spacing={2} component={Card} sx={{p: 1, pt: 2}}>
                <TextField size="small" label="名称" value={dnsHostRow.name} onChange={handleRowChange('name')}/>
                <TextField size="small" label="描述" value={dnsHostRow.note} onChange={handleRowChange('note')} multiline rows={2}/>
                <TextField size="small" label="DNS 域名" value={dnsHostRow.domain} onChange={handleRowChange('note')}/>
                <TextField size="small" label="DNS 地址（每行一条）" value={dnsHostRow.host} onChange={handleRowChange('note')} multiline rows={2}/>
            </Stack>

            <div className="flex-between">
                <Button variant="contained" color="info" onClick={handleSubmit}>添加</Button>
                <Button variant="contained" onClick={handleCancel}>返回</Button>
            </div>
        </>) : action === 'server' ? (<>

        </>) : loading ? (
            <LoadingCard height="160px"/>
        ) : (<>
            <Stack spacing={2} component={Card} sx={{p: 1, pt: 2}}>
                <TextField size="small" label="模式名称" value={row.name} onChange={handleRowChange('name')}/>
                <TextField size="small" label="模式描述" value={row.note} onChange={handleRowChange('note')} multiline rows={2}/>
            </Stack>

            <Stack direction="row" spacing={2}>
                <Button variant="contained" color="secondary" startIcon={<AddIcon/>} onClick={handleHostCreate}>添加 DNS 静态地址</Button>
                <Button variant="contained" color="success" startIcon={<AddIcon/>} onClick={handleServerCreate}>添加 DNS 服务器</Button>
            </Stack>

            {row.hosts.length === 0 && row.servers.length === 0 ? (
                <ErrorCard errorMsg="暂无内容" height="160px"/>
            ) : (<>
                {row.hosts.length > 0 && (
                    <TableContainer component={Card}>
                        <Table size="small">
                            <TableBody>
                                {row.hosts.map((row, key) => (
                                    <TableRow
                                        key={key} sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                        className={hostSortKey > -1 ? (hostSortKey === key ? 'sort-current' : 'sort-target') : ''}
                                        onClick={() => handleHostSortEnd(key)}>
                                        <TableCell sx={{p: '6px 12px'}} component="th" scope="row">
                                            <Typography variant="body1" component="div">{row.name}</Typography>
                                            <Typography variant="body2" sx={{color: 'text.secondary'}}>{row.note}</Typography>
                                        </TableCell>
                                        <TableCell sx={{p: '4px 8px'}} align="right">
                                            <Tooltip title="排序" arrow placement="top">
                                                <IconButton color="info" onClick={e => handleHostSortStart(e, key)}><OpenWithIcon/></IconButton>
                                            </Tooltip>
                                            <Tooltip title="修改" arrow placement="top">
                                                <IconButton color="primary" onClick={() => handleHostUpdate(key)}><EditSquareIcon/></IconButton>
                                            </Tooltip>
                                            <Tooltip title="删除" arrow placement="top">
                                                <IconButton color="error" onClick={() => handleHostDelete(key, row.name)}><DeleteIcon/></IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {row.servers.length > 0 && (
                    <TableContainer component={Card}>
                        <Table size="small">
                            <TableBody>
                                {row.servers.map((row, key) => (
                                    <TableRow
                                        key={key} sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                        className={serverSortKey > -1 ? (serverSortKey === key ? 'sort-current' : 'sort-target') : ''}
                                        onClick={() => handleServerSortEnd(key)}>
                                        <TableCell sx={{p: '6px 12px'}} component="th" scope="row">
                                            <Typography variant="body1" component="div">{row.name}</Typography>
                                            <Typography variant="body2" sx={{color: 'text.secondary'}}>{row.note}</Typography>
                                        </TableCell>
                                        <TableCell sx={{p: '4px 8px'}} align="right">
                                            <Tooltip title="排序" arrow placement="top">
                                                <IconButton color="info" onClick={e => handleServerSortStart(e, key)}><OpenWithIcon/></IconButton>
                                            </Tooltip>
                                            <Tooltip title="修改" arrow placement="top">
                                                <IconButton color="primary" onClick={() => handleServerUpdate(key)}><EditSquareIcon/></IconButton>
                                            </Tooltip>
                                            <Tooltip title="删除" arrow placement="top">
                                                <IconButton color="error" onClick={() => handleServerDelete(key, row.name)}><DeleteIcon/></IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </>)}

            <div className="flex-between">
                <Button variant="contained" color="info" onClick={handleSubmit}>修改</Button>
                <Button variant="contained" onClick={handleBack}>取消</Button>
            </div>
        </>)}
    </>)
}
