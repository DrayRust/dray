import { useState, useEffect } from 'react'
import {
    Stack, Button, TextField, MenuItem, Typography, IconButton, Card,
    TableContainer, Table, TableBody, TableRow, TableCell,
    FormControl, FormLabel, FormControlLabel, RadioGroup, Radio, Checkbox,
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import HelpIcon from '@mui/icons-material/Help'
import { openUrl } from '@tauri-apps/plugin-opener'

const outboundTagList: Record<string, string> = {
    proxy: '代理访问',
    direct: '直接访问',
    block: '阻止访问'
}

const ruleTypeList: Record<string, string> = {
    domain: '域名',
    ip: 'IP 地址',
    multi: '多维规则',
}

// https://xtls.github.io/config/routing.html#ruleobject
// https://www.v2fly.org/config/routing.html#ruleobject
const DEFAULT_RULE: RuleRow = {
    name: '',
    note: '',
    outboundTag: 'proxy',
    ruleType: 'domain',
    domain: '',
    ip: '',
    port: '',
    sourcePort: '',
    network: '',
    protocol: '',
}

export const RuleModeEditor = ({ruleModeList, setRuleModeList, ruleModeKey, setRuleModeKey}: {
    ruleModeList: RuleModeList,
    setRuleModeList: React.Dispatch<React.SetStateAction<RuleModeList>>
    ruleModeKey: number,
    setRuleModeKey: (ruleModeKey: number) => void
}) => {
    const [ruleModeRow, setRuleModeRow] = useState<RuleModeRow>({
        name: '',
        note: '',
        hash: '',
        rules: []
    })

    useEffect(() => {
        const item = ruleModeList[ruleModeKey]
        if (item) setRuleModeRow(item)
    }, [])

    const handleRuleModeRowChange = (type: keyof RuleModeRow) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setRuleModeRow(prev => ({...prev, [type]: e.target.value}))
    }

    const [action, setAction] = useState('')
    const [ruleRow, setRuleRow] = useState<RuleRow>(DEFAULT_RULE)
    const handleRuleCreate = () => {
        setAction('create')
        setRuleRow(DEFAULT_RULE)
    }

    const handleRuleBack = () => {
        setAction('')
    }

    const handleRuleChange = (type: keyof RuleRow) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setRuleRow(prev => ({...prev, [type]: e.target.value}))
    }

    const handleSubmit = () => {
    }

    const handleRuleUpdate = (key: number) => {
        console.log('handleRuleUpdate', key)
    }

    const handleRuleDelete = (key: number) => {
        console.log('handleRuleDelete', key)
    }

    const handleBack = () => {
        setRuleModeKey(-1)
        setRuleModeList(prev => {
            prev[ruleModeKey] = ruleModeRow
            return prev
        })
    }

    return (<>
        <Stack direction="row" spacing={1}>
            <Button variant="contained" startIcon={<ChevronLeftIcon/>} onClick={handleBack}>返回</Button>
        </Stack>

        <Stack spacing={2} component={Card} sx={{p: 1, pt: 2}}>
            <TextField size="small" label="模式名称" value={ruleModeRow.name} onChange={handleRuleModeRowChange('name')}/>
            <TextField size="small" label="模式描述" value={ruleModeRow.note} onChange={handleRuleModeRowChange('note')} multiline rows={2}/>
        </Stack>

        {action ? (<>
            <TextField fullWidth size="small" label="规则名称" value={ruleRow.name} onChange={handleRuleChange('name')}/>
            <TextField fullWidth size="small" label="规则描述" value={ruleRow.note} multiline rows={2} onChange={handleRuleChange('note')}/>
            <TextField fullWidth size="small" label="访问方式" value={ruleRow.outboundTag} select onChange={handleRuleChange('outboundTag')}>
                {Object.entries(outboundTagList).map(([key, value]) => (
                    <MenuItem key={key} value={key}>{value}</MenuItem>
                ))}
            </TextField>
            <TextField fullWidth size="small" label="规则类型" value={ruleRow.ruleType} select onChange={handleRuleChange('ruleType')}>
                {Object.entries(ruleTypeList).map(([key, value]) => (
                    <MenuItem key={key} value={key}>{value}</MenuItem>
                ))}
            </TextField>
            {ruleRow.ruleType === 'domain' ? (
                <TextField fullWidth size="small" label="域名(每行一条)" multiline minRows={2} maxRows={6} value={ruleRow.domain} onChange={handleRuleChange('domain')}/>
            ) : ruleRow.ruleType === 'ip' ? (
                <TextField fullWidth size="small" label="IP 地址(每行一条)" multiline minRows={2} maxRows={6} value={ruleRow.ip} onChange={handleRuleChange('ip')}/>
            ) : ruleRow.ruleType === 'multi' && (<>
                <TextField fullWidth size="small" label="域名(每行一条)" multiline minRows={2} maxRows={6} value={ruleRow.domain} onChange={handleRuleChange('domain')}/>
                <TextField fullWidth size="small" label="IP 地址(每行一条)" multiline minRows={2} maxRows={6} value={ruleRow.ip} onChange={handleRuleChange('ip')}/>
                <TextField fullWidth size="small" label="目标端口(每行一条)" multiline minRows={2} maxRows={6} value={ruleRow.port} onChange={handleRuleChange('port')}/>
                <TextField fullWidth size="small" label="来源端口(每行一条)" multiline minRows={2} maxRows={6}
                           value={ruleRow.sourcePort} onChange={handleRuleChange('sourcePort')}/>

                <FormControl>
                    <FormLabel id="rule-network">传输协议(network)</FormLabel>
                    <RadioGroup row aria-labelledby="rule-network" value={ruleRow.network} onChange={handleRuleChange('network')}>
                        <FormControlLabel value="" control={<Radio/>} label="None"/>
                        <FormControlLabel value="tcp" control={<Radio/>} label="TCP"/>
                        <FormControlLabel value="udp" control={<Radio/>} label="UDP"/>
                        <FormControlLabel value="tcp,udp" control={<Radio/>} label="TCP, UDP"/>
                    </RadioGroup>
                </FormControl>

                <FormControl>
                    <FormLabel id="rule-protocol">请求协议(protocol)</FormLabel>
                    <RadioGroup row aria-labelledby="rule-protocol" value={ruleRow.protocol} onChange={handleRuleChange('protocol')}>
                        <FormControlLabel value="http" control={<Checkbox/>} label="HTTP 1.1"/>
                        <FormControlLabel value="tls" control={<Checkbox/>} label="TLS"/>
                        <FormControlLabel value="quic" control={<Checkbox/>} label="QUIC"/>
                        <FormControlLabel value="bittorrent" control={<Checkbox/>} label="BitTorrent"/>
                    </RadioGroup>
                </FormControl>
            </>)}

            <div className="flex-between">
                <Stack direction="row" spacing={1}>
                    <Button variant="contained" onClick={handleSubmit}>确定</Button>
                    <Button variant="contained" size="small" onClick={handleRuleBack}>取消</Button>
                </Stack>
                <HelpIcon fontSize="small" sx={{color: 'text.secondary'}}
                          onClick={() => openUrl("https://xtls.github.io/config/routing.html#ruleobject")}/>
            </div>
        </>) : (<>
            <Stack direction="row" spacing={1}>
                <Button variant="contained" size="small" color="success" onClick={handleRuleCreate}><AddIcon/></Button>
            </Stack>
            <TableContainer component={Card}>
                <Table>
                    <TableBody>
                        {ruleModeRow.rules.map((row, key) => (
                            <TableRow key={key} sx={{'&:last-child td, &:last-child th': {border: 0}}}>
                                <TableCell component="th" scope="row">
                                    <Typography gutterBottom variant="h6" component="div">{row.name}</Typography>
                                    <Typography variant="body2" sx={{color: 'text.secondary'}}>{row.note}</Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" title="编辑" onClick={() => handleRuleUpdate(key)}><EditIcon/></IconButton>
                                    <IconButton color="error" title="删除" onClick={() => handleRuleDelete(key)}><DeleteIcon/></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>)}
    </>)
}
