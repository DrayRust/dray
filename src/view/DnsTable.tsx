import { useState, useEffect } from 'react'
import {
    Card, Stack, Typography, TextField, Button, Tooltip, IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import EditSquareIcon from '@mui/icons-material/EditSquare'
import OpenWithIcon from '@mui/icons-material/OpenWith'
import DeleteIcon from '@mui/icons-material/Delete'

import { useAlertDialog } from "../component/useAlertDialog.tsx"
import { useDialog } from "../component/useDialog.tsx"
import { ErrorCard, LoadingCard } from "../component/useCard.tsx"
import { readDnsTableList, saveDnsTableList } from "../util/invoke.ts"
import { processIP } from "../util/util.ts"

const DEFAULT_DNS_TABLE: DnsTable = {
    name: '',
    note: '',
    hash: '',
    IPv4: '',
    IPv6: '',
    DoH: '',
    DoT: '',
}

export const DnsTable = () => {
    const [loading, setLoading] = useState(true)
    const [dnsTableList, setDnsTableList] = useState<DnsTableList>([])
    useEffect(() => {
        (async () => {
            const tableList = await readDnsTableList() as DnsTableList
            if (tableList) setDnsTableList(tableList)
            setTimeout(() => setLoading(false), 200)
        })()
    }, [])

    const [action, setAction] = useState('')
    const [row, setRow] = useState<DnsTable>(DEFAULT_DNS_TABLE)
    const [nameError, setNameError] = useState(false)
    const [updateKey, setUpdateKey] = useState(-1)

    const handleRowChange = (type: keyof DnsTable) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setRow(prev => {
            const value = e.target.value
            type === 'name' && setNameError(value === '')
            return {...prev, [type]: value}
        })
    }

    const handleCreate = () => {
        setAction('create')
        setUpdateKey(-1)
        setRow(DEFAULT_DNS_TABLE)
    }

    const handleImport = () => {

    }

    const handleExport = () => {

    }

    const handleSubmit = async () => {
        let item: DnsTable = {...row}

        item.name = item.name.trim()
        const isEmpty = item.name === ''
        setNameError(isEmpty)
        if (isEmpty) return

        item.note = item.note.trim()
        item.IPv4 = processIP(item.IPv4)
        item.IPv6 = processIP(item.IPv6)
        item.DoH = item.DoH.trim()
        item.DoT = item.DoT.trim()

        updateKey === -1 ? dnsTableList.push(item) : dnsTableList[updateKey] = item
        const ok = await saveDnsTableList(dnsTableList)
        if (!ok) {
            showAlertDialog('保存失败')
            return
        }
        setDnsTableList([...dnsTableList])
        handleBack()
    }

    const [sortKey, setSortKey] = useState(-1)
    const handleSortStart = (e: React.MouseEvent, key: number) => {
        e.stopPropagation()
        if (sortKey === -1) {
            setSortKey(key)
        } else if (sortKey === key) {
            setSortKey(-1)
        } else {
            handleSortEnd(key).catch(_ => 0)
        }
    }

    const handleSortEnd = async (key: number) => {
        if (sortKey === -1) return
        if (sortKey === key) {
            setSortKey(-1)
            return
        }

        let newList = [...dnsTableList]
        let [temp] = newList.splice(sortKey, 1)
        newList.splice(key, 0, temp)
        setSortKey(-1)

        const ok = await saveDnsTableList(newList)
        if (!ok) {
            showAlertDialog('保存排序失败', 'error')
        } else {
            setDnsTableList([...newList])
        }
    }

    const handleUpdate = (key: number) => {
        setAction('update')
        setUpdateKey(key)
        const row = dnsTableList[key]
        if (row) setRow(row)
    }

    const handleDelete = (key: number) => {
        confirm('确认删除', `确定要删除这条数据吗？`, async () => {
            const newList = dnsTableList.filter((_, index) => index !== key) || []
            const ok = await saveDnsTableList(newList)
            if (!ok) {
                showAlertDialog('删除失败')
            } else {
                setDnsTableList([...newList])
            }
        })
    }

    const handleBack = () => {
        setAction('')
    }

    const {AlertDialogComponent, showAlertDialog} = useAlertDialog()
    const {DialogComponent, confirm} = useDialog()
    return (<>
        <AlertDialogComponent/>
        <DialogComponent/>
        {action === 'create' || action === 'update' ? <>
            <TextField fullWidth size="small" label="DNS 服务商名称"
                       error={nameError} helperText={nameError ? "名称不能为空" : ""}
                       value={row.name} onChange={handleRowChange('name')}/>
            <TextField fullWidth size="small" label="DNS 服务商描述" value={row.note} multiline rows={2} onChange={handleRowChange('note')}/>
            <TextField fullWidth size="small" label="IPv4 地址 (每行一个)" value={row.IPv4} multiline rows={2} onChange={handleRowChange('IPv4')}/>
            <TextField fullWidth size="small" label="IPv6 地址 (每行一个)" value={row.IPv6} multiline rows={2} onChange={handleRowChange('IPv6')}/>
            <TextField fullWidth size="small" label="DoH (DNS over HTTPS)" value={row.DoH} onChange={handleRowChange('DoH')}/>
            <TextField fullWidth size="small" label="DoT (DNS over TLS)" value={row.DoT} onChange={handleRowChange('DoT')}/>
            <div className="flex-between">
                <Button variant="contained" color="info" onClick={handleSubmit}>确定</Button>
                <Button variant="contained" onClick={handleBack}>取消</Button>
            </div>
        </> : <>
            <Stack direction="row" spacing={1}>
                <Button variant="contained" color="secondary" startIcon={<AddIcon/>} onClick={handleCreate}>添加</Button>
                <Button variant="contained" color="success" startIcon={<FileUploadIcon/>} onClick={handleImport}>导入</Button>
                <Button variant="contained" color="warning" startIcon={<FileDownloadIcon/>} onClick={handleExport}>导出</Button>
            </Stack>
            <Stack spacing={1}>
                {loading ? (
                    <LoadingCard height="160px"/>
                ) : dnsTableList.length === 0 ? (
                    <ErrorCard errorMsg="暂无内容" height="160px"/>
                ) : dnsTableList.map((row, key) => (<>
                    <Card
                        elevation={5} key={key} sx={{p: 1}}
                        className={sortKey > -1 ? (sortKey === key ? 'sort-current' : 'sort-target') : ''}
                        onClick={() => handleSortEnd(key)}
                    >
                        <div className="flex-between">
                            <Typography variant="h6">{row.name}</Typography>
                            <div>
                                <Tooltip title="排序" arrow placement="top">
                                    <IconButton color="info" onClick={e => handleSortStart(e, key)}><OpenWithIcon/></IconButton>
                                </Tooltip>
                                <Tooltip title="修改" arrow placement="top">
                                    <IconButton color="primary" onClick={() => handleUpdate(key)}><EditSquareIcon/></IconButton>
                                </Tooltip>
                                <Tooltip title="删除" arrow placement="top">
                                    <IconButton color="error" onClick={() => handleDelete(key)}><DeleteIcon/></IconButton>
                                </Tooltip>
                            </div>
                        </div>
                        <Typography variant="body2" sx={{color: 'text.secondary', pl: '3px', pb: 2}}>{row.note}</Typography>
                        <Stack spacing={2}>
                            {row.IPv4 && <TextField fullWidth size="small" label="IPv4 地址" value={row.IPv4} multiline/>}
                            {row.IPv6 && <TextField fullWidth size="small" label="IPv6 地址" value={row.IPv6} multiline/>}
                            {row.DoH && <TextField fullWidth size="small" label="DoH (DNS over HTTPS)" value={row.DoH} multiline/>}
                            {row.DoT && <TextField fullWidth size="small" label="DoT (DNS over TLS)" value={row.DoT} multiline/>}
                        </Stack>
                    </Card>
                </>))}
            </Stack>
        </>}
    </>)
}
