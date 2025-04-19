import { useState, useEffect } from 'react'

import {
    Button, Checkbox, Card, Dialog, Stack, Typography, TextField,
    TableContainer, Table, TableBody, TableRow, TableCell, IconButton, Tooltip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest'
import DeleteIcon from '@mui/icons-material/Delete'

import { ErrorCard, LoadingCard } from "../component/useCard.tsx"
import { readSubscriptionList, saveSubscriptionList } from "../util/invoke.ts"
import { useAlertDialog } from "../component/useAlertDialog.tsx"
import { useDialog } from "../component/useDialog.tsx"

const DEFAULT_SUBSCRIPTION_ROW: SubscriptionRow = {
    name: '',
    note: '',
    url: '',
    isProxy: false,
    isHtml: false
}

const Subscription: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(2), [setNavState])

    const [loading, setLoading] = useState(true)
    const [subscriptionList, setSubscriptionList] = useState<SubscriptionList>([])
    const [subscriptionChecked, setSubscriptionChecked] = useState<number[]>([])
    useEffect(() => {
        (async () => {
            const tableList = await readSubscriptionList() as SubscriptionList
            if (tableList) setSubscriptionList(tableList)
            setLoading(false)
        })()
    }, [])

    const [action, setAction] = useState('')
    const [row, setRow] = useState<SubscriptionRow>(DEFAULT_SUBSCRIPTION_ROW)
    const [nameError, setNameError] = useState(false)
    const [updateKey, setUpdateKey] = useState(-1)

    const handleBack = () => {
        setAction('')
        setUpdateKey(-1)
        setSubscriptionChecked([])
    }

    const handleRowChange = (type: keyof SubscriptionRow) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setRow(prev => {
            const value = e.target.value
            type === 'name' && setNameError(value === '')
            return {...prev, [type]: value}
        })
    }

    const handleCreate = () => {
        setAction('create')
        setRow(DEFAULT_SUBSCRIPTION_ROW)
    }

    const handleUpdate = (key: number) => {
        setAction('update')
        setUpdateKey(key)
        setRow(subscriptionList[key] || DEFAULT_SUBSCRIPTION_ROW)
    }

    const handleSubmit = async () => {
        let item: SubscriptionRow = {...row}

        item.name = item.name.trim()
        const isEmpty = item.name === ''
        setNameError(isEmpty)
        if (isEmpty) return

        item.note = item.note.trim()
        item.url = item.url.trim()

        updateKey === -1 ? subscriptionList.push(item) : subscriptionList[updateKey] = item
        const ok = await saveSubscriptionList(subscriptionList)
        if (!ok) {
            showAlertDialog('保存失败')
            return
        }
        setSubscriptionList([...subscriptionList])
        handleBack()
    }

    const handleCheckedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSubscriptionChecked(prev => {
            const value = Number(e.target.value)
            return e.target.checked ? [...prev, value] : prev.filter(item => item !== value)
        })
    }

    const handleDelete = (key: number, name: string) => {
        dialogConfirm('确认删除', `确定要删除 "${name}" 吗？`, async () => {
            const newList = subscriptionList.filter((_, index) => index !== key) || []
            const ok = await saveSubscriptionList(newList)
            if (!ok) {
                showAlertDialog('删除失败')
            } else {
                setSubscriptionList([...newList])
                handleBack()
            }
        })
    }

    const handleBatchDelete = () => {
        if (subscriptionChecked.length > 0) {
            dialogConfirm('确认删除', `确定要删除这 ${subscriptionChecked.length} 个服务器吗？`, async () => {
                const newList = subscriptionList.filter((_, index) => !subscriptionChecked.includes(index)) || []
                const ok = await saveSubscriptionList(newList)
                if (!ok) {
                    showAlertDialog('删除失败', 'error')
                } else {
                    setSubscriptionList([...newList])
                    handleBack()
                }
            })
        }
    }

    const height = 'calc(100vh - 70px)'

    const {AlertDialogComponent, showAlertDialog} = useAlertDialog()
    const {DialogComponent, dialogConfirm} = useDialog()
    return <>
        <AlertDialogComponent/>
        <DialogComponent/>
        <Dialog open={action !== ''}>
            <Stack spacing={2} sx={{p: 2, minWidth: 580}}>
                <Stack spacing={2} component={Card} elevation={5} sx={{p: 1}}>
                    <TextField fullWidth size="small" label="订阅名称"
                               error={nameError} helperText={nameError ? "订阅名称不能为空" : ""}
                               value={row.name} onChange={handleRowChange('name')}/>
                    <TextField fullWidth size="small" label="订阅描述" value={row.note} multiline minRows={2} maxRows={6} onChange={handleRowChange('note')}/>
                    <TextField fullWidth size="small" label="订阅 URL" value={row.url} multiline onChange={handleRowChange('url')}/>
                </Stack>
                <div className="flex-between">
                    <Button variant="contained" color="info" onClick={handleSubmit}>{action === 'create' ? '添加' : '修改'}</Button>
                    <Button variant="contained" onClick={handleBack}>取消</Button>
                </div>
            </Stack>
        </Dialog>

        <Stack direction="row" spacing={1} sx={{mb: 1.5}}>
            <Button variant="contained" color="secondary" startIcon={<AddIcon/>} onClick={handleCreate}>添加</Button>
            {subscriptionChecked.length > 0 && (<>
                <Button variant="contained" color="error" onClick={handleBatchDelete}>批量删除</Button>
            </>)}
        </Stack>
        <Stack spacing={1}>
            {loading ? (
                <LoadingCard height={height}/>
            ) : subscriptionList.length === 0 ? (
                <ErrorCard errorMsg="暂无订阅" height={height}/>
            ) : (
                <TableContainer component={Card}>
                    <Table>
                        <TableBody>
                            {subscriptionList.map((row, key) => (
                                <TableRow key={key} sx={{'&:last-child td, &:last-child th': {border: 0}}}>
                                    <TableCell padding="checkbox">
                                        <Checkbox value={key} checked={subscriptionChecked.includes(key)} onChange={handleCheckedChange}/>
                                    </TableCell>
                                    <TableCell component="th" scope="row">
                                        <Typography variant="h6" component="div">{row.name}</Typography>
                                        <Typography variant="body2" sx={{color: 'text.secondary'}}>{row.note}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="设置" arrow placement="top">
                                            <IconButton color="primary" onClick={() => handleUpdate(key)}><SettingsSuggestIcon/></IconButton>
                                        </Tooltip>
                                        <Tooltip title="删除" arrow placement="top">
                                            <IconButton color="error" onClick={() => handleDelete(key, row.name)}><DeleteIcon/></IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Stack>
    </>
}

export default Subscription
