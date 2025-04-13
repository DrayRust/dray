import { useState, useEffect } from 'react'
import {
    Box, Card, Checkbox, Drawer, Stack, TextField, MenuItem, Button, Typography,
    TableContainer, Table, TableBody, TableRow, TableCell, IconButton,
    BottomNavigation, BottomNavigationAction
} from '@mui/material'
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow'
import ForkRightIcon from '@mui/icons-material/ForkRight'
import ModeIcon from '@mui/icons-material/Tune'
import AddIcon from '@mui/icons-material/Add'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'

import { useAlertDialog } from "../component/useAlertDialog.tsx"
import { useDialog } from "../component/useDialog.tsx"
import { useChip } from "../component/useChip.tsx"
import { RuleModeEditor } from "./RuleModeEditor.tsx"
import { saveRuleConfig, readRuleModeList, saveRuleModeList } from "../util/invoke.ts"
import { DEFAULT_RULE_MODE_LIST } from "../util/config.ts"
import { useDebounce } from "../hook/useDebounce.ts"
import { decodeBase64, encodeBase64, hashJson, safeJsonParse } from "../util/crypto.ts"
import { processLines } from "../util/util.ts"

const DEFAULT_RULE_MODE_ROW: RuleModeRow = {
    name: '',
    note: '',
    hash: '',
    rules: []
}

export const RuleAdvanced = ({open, setOpen, ruleConfig, setRuleConfig}: {
    open: boolean,
    setOpen: (open: boolean) => void,
    ruleConfig: RuleConfig,
    setRuleConfig: React.Dispatch<React.SetStateAction<RuleConfig>>
}) => {
    const [tab, setTab] = useState(0)
    const [ruleModeList, setRuleModeList] = useState<RuleModeList>(DEFAULT_RULE_MODE_LIST)
    const [ruleModeKey, setRuleModeKey] = useState(-1)

    useEffect(() => {
        readRuleModeList().then((d) => {
            const mergedList = (d as RuleModeList).map(item => ({
                ...DEFAULT_RULE_MODE_ROW,
                ...item
            }))
            setRuleModeList(mergedList)
        }).catch(_ => 0)
    }, [])

    const handleClose = () => {
        setOpen(false)
    }

    const handleRuleConfigChange = (name: keyof RuleConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setRuleConfig(prev => ({...prev, [name]: e.target.value}))
    }

    const handleSubmit = async () => {
        const ok = await saveRuleConfig(ruleConfig)
        if (!ok) {
            showChip('设置失败', 'error')
            return
        }
        showChip('设置成功', 'success')
    }

    const [action, setAction] = useState('')
    const [ruleModeImportData, setRuleModeImportData] = useState('')
    const [ruleModeExportData, setRuleModeExportData] = useState('')
    const [errorName, setErrorName] = useState(false)
    const [ruleModeChecked, setRuleModeChecked] = useState<number[]>([])
    const [ruleModeRow, setRuleModeRow] = useState<RuleModeRow>(DEFAULT_RULE_MODE_ROW)
    const handleRuleModeChange = (type: keyof RuleModeRow) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setRuleModeRow(prev => {
            const value = e.target.value
            if (type === 'name') setErrorName(value === '')
            return {...prev, [type]: value}
        })
    }

    const handleRuleModeCheckedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRuleModeChecked(prev => {
            const value = Number(e.target.value)
            if (e.target.checked) {
                return [...prev, value]
            } else {
                return prev.filter(item => item !== value)
            }
        })
    }

    const handleRuleModeSubmit = useDebounce(async () => {
        const newRuleModeRow = {...ruleModeRow}
        newRuleModeRow.name = newRuleModeRow.name.trim()
        if (newRuleModeRow.name === '') {
            setErrorName(true)
            return
        }
        setErrorName(false)

        newRuleModeRow.note = newRuleModeRow.note.trim()
        newRuleModeRow.hash = await hashJson(newRuleModeRow.rules)

        const newRuleModeList = [...ruleModeList]
        newRuleModeList.push(newRuleModeRow)
        const ok = await saveRuleModeList(newRuleModeList)
        if (!ok) {
            showAlertDialog('添加失败')
            return
        }
        setRuleModeList(newRuleModeList)
        setAction('')
    }, 50)

    const handleRuleModeCancel = () => {
        setAction('')
        setRuleModeImportData('')
        setRuleModeExportData('')
        setRuleModeChecked([])
    }

    const handleRuleModeCreate = () => {
        setAction('create')
        setRuleModeRow(DEFAULT_RULE_MODE_ROW)
    }

    const handleRuleModeImport = () => {
        setAction('import')
    }

    const [errorImportData, setErrorImportData] = useState(false)
    const handleRuleModeImportDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value
        setRuleModeImportData(value)
        setErrorImportData(value === '')
    }

    const handleRuleModeImportSubmit = async () => {
        let s = ruleModeImportData.trim()
        if (!s) {
            setErrorImportData(true)
            return
        }
        setErrorImportData(false)

        const newRuleModeList = [...ruleModeList]
        let okNum = 0
        let repeatNum = 0
        let errNum = 0
        let errMsg = ''
        const arr = s.split('\n')
        for (let v of arr) {
            v = v.trim()
            if (v.length === 0) continue

            if (v.startsWith('drayRule://')) {
                const decoded = decodeBase64(v.substring(11))
                const ruleMode = safeJsonParse(decoded)
                if (ruleMode && typeof ruleMode === 'object' && 'hash' in ruleMode) {
                    if (newRuleModeList.some(item => item.hash === ruleMode.hash)) {
                        repeatNum++ // 存在重复
                    } else {
                        newRuleModeList.push(ruleMode)
                        okNum++
                    }
                } else {
                    errNum++
                    errMsg = '解析失败，或数据不正确'
                }
            } else {
                errNum++
                errMsg = '格式不正确，前缀非 drayRule:// 开头'
            }
        }

        if (okNum > 0) {
            const ok = await saveRuleModeList(newRuleModeList)
            if (!ok) {
                showAlertDialog('导入保存失败')
                return
            }

            setRuleModeList(newRuleModeList)
            setRuleModeImportData('')
            setAction('')
        }

        if (okNum === 0 && errMsg) {
            showAlertDialog(errMsg, 'error')
        } else if (errNum > 0 || repeatNum > 0) {
            showAlertDialog(`导入成功 ${okNum} 条，重复 ${repeatNum} 条，失败 ${errNum} 条`, 'warning')
        }
    }

    const handleRuleModeExport = () => {
        setAction('export')

        let arr = []
        for (let i = 0; i < ruleModeChecked.length; i++) {
            const ruleMode = ruleModeList[i]
            if (ruleMode) arr.push('drayRule://' + encodeBase64(JSON.stringify(ruleMode)))
        }
        setRuleModeExportData(arr.join('\n'))
    }

    const handleRuleModeCopy = (content: string) => {
        navigator.clipboard.writeText(content).then(() => {
            showAlertDialog('复制成功', 'warning', 2000)
        }).catch(() => {
            showAlertDialog('复制失败', 'error')
        })
    }

    const handleRuleModeUpdate = (key: number) => {
        setRuleModeKey(key)
    }

    const [ruleModeConf, setRuleModeConf] = useState('')
    const handleRuleModeViewConf = (key: number) => {
        setAction('viewConf')
        const ruleMode = ruleModeList[key]
        if (ruleMode && Array.isArray(ruleMode.rules) && ruleMode.rules.length > 0) {
            let rules = []
            for (let i = 0; i < ruleMode.rules.length; i++) {
                const v = ruleMode.rules[i]
                let rule: any = {
                    type: 'field',
                    ruleTag: `${i}-dray-${v.outboundTag}`,
                    outboundTag: v.outboundTag
                }
                if (v.ruleType === 'domain') {
                    rules.push({...rule, domain: processLines(v.domain)})
                } else if (v.ruleType === 'ip') {
                    rules.push({...rule, ip: processLines(v.ip)})
                } else if (v.ruleType === 'multi') {
                    if (v.domain) rule.domain = processLines(v.domain)
                    if (v.ip) rule.ip = processLines(v.ip)
                    if (v.port) rule.port = processLines(v.port)
                    if (v.sourcePort) rule.sourcePort = processLines(v.sourcePort)
                    if (v.network) rule.network = v.network
                    if (v.protocol) rule.protocol = processLines(v.protocol, ',')
                    rules.push(rule)
                }
            }
            setRuleModeConf(JSON.stringify(rules, null, 2))
        } else {
            showAlertDialog('该模式下无规则')
            return
        }
    }

    const handleRuleModeDelete = async (key: number, name: string) => {
        confirm('确认删除', `确定要删除 “${name}” 吗？`, async () => {
            if (ruleConfig.mode === key) {
                showAlertDialog('不允许删除正在使用的模式')
                return
            }

            if (ruleModeList.length < 2) {
                showAlertDialog('不允许删除所有模式，至少保留一个')
                return
            }

            const newRuleModeList = [...ruleModeList]
            newRuleModeList.splice(key, 1)
            const ok = await saveRuleModeList(newRuleModeList)
            if (!ok) {
                showAlertDialog('删除失败')
                return
            }
            setRuleModeList(newRuleModeList)
            setRuleModeChecked([])
        })
    }

    const {AlertDialogComponent, showAlertDialog} = useAlertDialog()
    const {DialogComponent, confirm} = useDialog()
    const {ChipComponent, showChip} = useChip()
    return (<>
        <AlertDialogComponent/>
        <DialogComponent/>
        <Drawer anchor="right" open={open} onClose={handleClose}>
            <Box sx={{p: 2}}>
                <Stack spacing={2} sx={{minWidth: '650px'}}>
                    <DoubleArrowIcon onClick={handleClose}/>
                    <BottomNavigation
                        sx={{mb: 2, mt: 1}}
                        component={Card}
                        showLabels value={tab}
                        onChange={(_, v) => setTab(v)}>
                        <BottomNavigationAction label="访问策略" icon={<ForkRightIcon/>}/>
                        <BottomNavigationAction label="模式管理" icon={<ModeIcon/>}/>
                    </BottomNavigation>
                    {tab === 0 ? (<>
                        <div className="flex-between">
                            <TextField
                                select fullWidth size="small"
                                label="域名匹配"
                                value={ruleConfig.domainStrategy}
                                onChange={handleRuleConfigChange('domainStrategy')}>
                                <MenuItem value="AsIs">仅域名匹配</MenuItem>
                                <MenuItem value="IPIfNonMatch">优先域名匹配，未匹配上则解析为IP再次匹配</MenuItem>
                                <MenuItem value="IPOnDemand">优先解析为IP匹配</MenuItem>
                            </TextField>
                        </div>
                        <TextField
                            select fullWidth size="small"
                            label="未匹配上的域名"
                            value={ruleConfig.unmatchedStrategy}
                            onChange={handleRuleConfigChange('unmatchedStrategy')}>
                            <MenuItem value="direct">直接访问</MenuItem>
                            <MenuItem value="proxy">代理访问</MenuItem>
                        </TextField>
                        <TextField
                            select fullWidth size="small"
                            label="采用模式"
                            value={ruleConfig.mode}
                            onChange={handleRuleConfigChange('mode')}>
                            {ruleModeList.map((item, index) => (
                                <MenuItem key={index} value={index}>{item.name}</MenuItem>
                            ))}
                        </TextField>
                        <Stack direction="row" spacing={2} sx={{justifyContent: "flex-start", alignItems: "center"}}>
                            <Button variant="contained" color="info" onClick={handleSubmit}>确认</Button>
                            <ChipComponent/>
                        </Stack>
                    </>) : tab === 1 && (<>
                        {ruleModeKey > -1 ? (<>
                            <RuleModeEditor ruleModeList={ruleModeList} setRuleModeList={setRuleModeList} ruleModeKey={ruleModeKey} setRuleModeKey={setRuleModeKey}/>
                        </>) : action === 'viewConf' ? (<>
                            <Stack spacing={2} component={Card} sx={{p: 1, pt: 2}}>
                                <TextField size="small" multiline disabled rows={10} label="规则配置" value={ruleModeConf}/>
                            </Stack>
                            <Stack direction="row" spacing={1}>
                                <Button variant="contained" color="info" onClick={() => handleRuleModeCopy(ruleModeConf)}>复制</Button>
                                <Button variant="contained" onClick={handleRuleModeCancel}>取消</Button>
                            </Stack>
                        </>) : action === 'create' ? (<>
                            <Stack spacing={2} component={Card} sx={{p: 1, pt: 2}}>
                                <TextField
                                    size="small"
                                    label="模式名称"
                                    error={errorName} helperText={errorName ? '模式名称不能为空' : ''}
                                    value={ruleModeRow.name}
                                    onChange={handleRuleModeChange('name')}
                                />
                                <TextField size="small" label="模式描述" value={ruleModeRow.note} onChange={handleRuleModeChange('note')} multiline rows={2}/>
                            </Stack>
                            <Stack direction="row" spacing={1}>
                                <Button variant="contained" color="info" onClick={handleRuleModeSubmit}>添加</Button>
                                <Button variant="contained" onClick={handleRuleModeCancel}>取消</Button>
                            </Stack>
                        </>) : action === 'import' ? (<>
                            <Stack spacing={2} component={Card} sx={{p: 1, pt: 2}}>
                                <TextField
                                    size="small" multiline rows={10}
                                    label="导入内容（URI）"
                                    placeholder="每行一条，例如：drayRule://xxxxxx"
                                    error={errorImportData} helperText={errorImportData ? '导入内容不能为空' : ''}
                                    value={ruleModeImportData}
                                    onChange={handleRuleModeImportDataChange}
                                />
                            </Stack>
                            <Stack direction="row" spacing={1}>
                                <Button variant="contained" color="info" onClick={handleRuleModeImportSubmit}>确定</Button>
                                <Button variant="contained" onClick={handleRuleModeCancel}>取消</Button>
                            </Stack>
                        </>) : action === 'export' ? (<>
                            <Stack spacing={2} component={Card} sx={{p: 1, pt: 2}}>
                                <TextField size="small" multiline disabled rows={10} label="导出内容（URI）" value={ruleModeExportData}/>
                            </Stack>
                            <Stack direction="row" spacing={1}>
                                <Button variant="contained" color="info" onClick={() => handleRuleModeCopy(ruleModeExportData)}>复制</Button>
                                <Button variant="contained" onClick={handleRuleModeCancel}>取消</Button>
                            </Stack>
                        </>) : (<>
                            <Stack direction="row" spacing={1}>
                                <Button variant="contained" color="secondary" startIcon={<AddIcon/>} onClick={handleRuleModeCreate}>添加</Button>
                                <Button variant="contained" color="success" startIcon={<FileUploadIcon/>} onClick={handleRuleModeImport}>导入</Button>
                                {ruleModeChecked.length > 0 && (
                                    <Button variant="contained" color="warning" startIcon={<FileDownloadIcon/>} onClick={handleRuleModeExport}>导出</Button>
                                )}
                            </Stack>
                            <TableContainer component={Card}>
                                <Table>
                                    <TableBody>
                                        {ruleModeList.map((row, key) => (
                                            <TableRow key={key} sx={{'&:last-child td, &:last-child th': {border: 0}}}>
                                                <TableCell padding="checkbox">
                                                    <Checkbox value={key} checked={ruleModeChecked.includes(key)} onChange={handleRuleModeCheckedChange}/>
                                                </TableCell>
                                                <TableCell component="th" scope="row">
                                                    <Typography gutterBottom variant="h6" component="div">{row.name}</Typography>
                                                    <Typography variant="body2" sx={{color: 'text.secondary'}}>{row.note}</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton color="primary" onClick={() => handleRuleModeUpdate(key)}><SettingsSuggestIcon/></IconButton>
                                                    <IconButton color="info" onClick={() => handleRuleModeViewConf(key)}><VisibilityIcon/></IconButton>
                                                    <IconButton color="error" onClick={() => handleRuleModeDelete(key, row.name)}><DeleteIcon/></IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>)}
                    </>)}
                </Stack>
            </Box>
        </Drawer>
    </>)
}
