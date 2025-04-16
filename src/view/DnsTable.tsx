import { useState, useEffect } from 'react'
import {
    Card, Stack, Typography, TextField, Button, Tooltip, IconButton,
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
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
import { decodeBase64, encodeBase64, hashJson, safeJsonParse } from "../util/crypto.ts"

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
    const [dnsTableImportData, setDnsTableImportData] = useState('')
    const [dnsTableExportData, setDnsTableExportData] = useState('')

    const handleRowChange = (type: keyof DnsTable) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setRow(prev => {
            const value = e.target.value
            type === 'name' && setNameError(value === '')
            return {...prev, [type]: value}
        })
    }

    const handleBack = () => {
        setAction('')
        setDnsTableImportData('')
        setDnsTableExportData('')
        setUpdateKey(-1)
    }

    const handleCreate = () => {
        setAction('create')
        setUpdateKey(-1)
        setRow(DEFAULT_DNS_TABLE)
    }

    const handleImport = () => {
        setAction('import')
    }

    const [errorImportData, setErrorImportData] = useState(false)
    const handleDnsTableImportDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value
        setDnsTableImportData(value)
        setErrorImportData(value === '')
    }

    const handleDnsTableImportSubmit = async () => {
        let s = dnsTableImportData.trim()
        setErrorImportData(!s)
        if (!s) return

        const newDnsTableList = [...dnsTableList]
        let okNum = 0
        let repeatNum = 0
        let errNum = 0
        let errMsg = ''
        const arr = s.split('\n')
        for (let v of arr) {
            v = v.trim()
            if (v.length === 0) continue

            if (v.startsWith('drayPublicDns://')) {
                const base64 = v.substring(16).replace(/#.*$/, '')
                const decoded = decodeBase64(base64)
                const ruleMode = safeJsonParse(decoded)
                if (ruleMode && typeof ruleMode === 'object' && 'hash' in ruleMode) {
                    if (newDnsTableList.some(item => item.hash === ruleMode.hash)) {
                        repeatNum++
                    } else {
                        newDnsTableList.push(ruleMode)
                        okNum++
                    }
                } else {
                    errNum++
                    errMsg = '解析失败，或数据不正确'
                }
            } else {
                errNum++
                errMsg = '格式不正确，前缀非 drayPublicDns:// 开头'
            }
        }

        if (okNum > 0) {
            const ok = await saveDnsTableList(newDnsTableList)
            if (!ok) {
                showAlertDialog('导入保存失败')
                return
            }

            if (errNum > 0 || repeatNum > 0) {
                showAlertDialog(`导入成功 ${okNum} 条，重复 ${repeatNum} 条，失败 ${errNum} 条`, 'warning')
            } else {
                showAlertDialog(`导入成功 ${okNum} 条`, 'success')
            }
            setDnsTableList(newDnsTableList)
            handleBack()
        }

        if (okNum === 0 && errMsg) {
            showAlertDialog(errMsg, 'error')
        } else if (errNum > 0 || repeatNum > 0) {
            showAlertDialog(`导入成功 ${okNum} 条，重复 ${repeatNum} 条，失败 ${errNum} 条`, 'warning')
        }
    }

    const handleExport = () => {
        setAction('export')

        let arr = []
        for (let k = 0; k < dnsTableList.length; k++) {
            const v = dnsTableList[k]
            const encoded = 'drayPublicDns://' + encodeBase64(JSON.stringify(v)) + '#' + v.name
            arr.push(encoded)
        }
        setDnsTableExportData(arr.join('\n'))
    }

    const handleSubmit = async () => {
        let item: DnsTable = {...row}

        item.name = item.name.trim()
        const isEmpty = item.name === ''
        setNameError(isEmpty)
        if (isEmpty) return

        item.note = item.note.trim()
        item.hash = ''
        item.IPv4 = processIP(item.IPv4)
        item.IPv6 = processIP(item.IPv6)
        item.DoH = item.DoH.trim()
        item.DoT = item.DoT.trim()
        item.hash = await hashJson(item)

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

    const [contentCopied, setContentCopied] = useState('')
    const handleRuleModeCopy = (content: string) => {
        navigator.clipboard.writeText(content).then(() => {
            setContentCopied('复制成功')
            setTimeout(() => setContentCopied(''), 2000)
        }).catch(() => {
            setContentCopied('复制失败')
        })
    }

    const {AlertDialogComponent, showAlertDialog} = useAlertDialog()
    const {DialogComponent, confirm} = useDialog()
    return (<>
        <AlertDialogComponent/>
        <DialogComponent/>
        {action === 'create' || action === 'update' ? <>
            <Stack spacing={2} component={Card} elevation={5} sx={{p: 1}}>
                <TextField fullWidth size="small" label="公共 DNS 服务商名称"
                           error={nameError} helperText={nameError ? "名称不能为空" : ""}
                           value={row.name} onChange={handleRowChange('name')}/>
                <TextField fullWidth size="small" label="公共 DNS 服务商描述" value={row.note} multiline rows={2} onChange={handleRowChange('note')}/>
                <TextField fullWidth size="small" label="IPv4 地址 (每行一个)" value={row.IPv4} multiline rows={2} onChange={handleRowChange('IPv4')}/>
                <TextField fullWidth size="small" label="IPv6 地址 (每行一个)" value={row.IPv6} multiline rows={2} onChange={handleRowChange('IPv6')}/>
                <TextField fullWidth size="small" label="DoH (DNS over HTTPS)" value={row.DoH} onChange={handleRowChange('DoH')}/>
                <TextField fullWidth size="small" label="DoT (DNS over TLS)" value={row.DoT} onChange={handleRowChange('DoT')}/>
            </Stack>
            <div className="flex-between">
                <Button variant="contained" color="info" onClick={handleSubmit}>{action === 'create' ? '添加' : '修改'}</Button>
                <Button variant="contained" onClick={handleBack}>取消</Button>
            </div>
        </> : action === 'import' ? <>
            <Stack spacing={2} component={Card} elevation={5} sx={{p: 1, pt: 2}}>
                <TextField
                    size="small" multiline rows={10}
                    label="导入内容（URI）"
                    placeholder="每行一条，例如：drayPublicDns://xxxxxx"
                    error={errorImportData} helperText={errorImportData ? '导入内容不能为空' : ''}
                    value={dnsTableImportData}
                    onChange={handleDnsTableImportDataChange}
                />
            </Stack>
            <div className="flex-between">
                <Button variant="contained" color="info" onClick={handleDnsTableImportSubmit}>确定</Button>
                <Button variant="contained" onClick={handleBack}>取消</Button>
            </div>
        </> : action === 'export' ? <>
            <div className="flex-between">
                <Button variant="contained" startIcon={<ChevronLeftIcon/>} onClick={handleBack}>返回</Button>
                <Tooltip placement="left" arrow title={contentCopied || '复制导出内容'}>
                    <IconButton size="small" onClick={() => handleRuleModeCopy(dnsTableExportData)}><ContentCopyIcon/></IconButton>
                </Tooltip>
            </div>
            <Stack spacing={2} component={Card} elevation={5} sx={{p: 1, pt: 2}}>
                <TextField size="small" multiline disabled minRows={10} maxRows={20} label="导出内容（URI）" value={dnsTableExportData}/>
            </Stack>
        </> : <>
            <Stack direction="row" spacing={1}>
                <Button variant="contained" color="secondary" startIcon={<AddIcon/>} onClick={handleCreate}>添加</Button>
                <Button variant="contained" color="success" startIcon={<FileUploadIcon/>} onClick={handleImport}>导入</Button>
                <Button variant="contained" color="warning" startIcon={<FileDownloadIcon/>} onClick={handleExport}>导出</Button>
            </Stack>
            <Stack spacing={1}>
                {loading ? (
                    <LoadingCard height="160px" elevation={5}/>
                ) : dnsTableList.length === 0 ? (
                    <ErrorCard errorMsg="暂无内容" height="160px" elevation={5}/>
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
                            {row.DoH && <TextField fullWidth size="small" label="DoH (DNS over HTTPS)" value={row.DoH}/>}
                            {row.DoT && <TextField fullWidth size="small" label="DoT (DNS over TLS)" value={row.DoT}/>}
                        </Stack>
                    </Card>
                </>))}
            </Stack>
        </>}
    </>)
}
