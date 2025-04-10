import { useState, useEffect } from 'react'
import {
    Box, Card, Drawer, Stack, TextField, MenuItem, Button, Typography,
    TableContainer, Table, TableBody, TableRow, TableCell, IconButton,
    BottomNavigation, BottomNavigationAction
} from '@mui/material'
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow'
import ForkRightIcon from '@mui/icons-material/ForkRight'
import ModeIcon from '@mui/icons-material/Tune'
import AddIcon from '@mui/icons-material/Add'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import { RuleModeEditor } from "./RuleModeEditor.tsx"
import { readRuleModeList } from "../util/invoke.ts"
import { DEFAULT_RULE_MODE_LIST } from "../util/config.ts"

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
            setRuleModeList(d as RuleModeList)
        }).catch(_ => 0)
    }, [])

    const handleClose = () => {
        setOpen(false)
    }

    const handleDomainStrategy = (e: any) => {
        setRuleConfig(prev => ({...prev, domainStrategy: e.target.value}))
    }

    const handleUnmatchedStrategy = (e: any) => {
        setRuleConfig(prev => ({...prev, unmatchedStrategy: e.target.value}))
    }

    const handleMode = (e: any) => {
        setRuleConfig(prev => ({...prev, mode: e.target.value}))
    }

    const handleRuleModeUpdate = (key: number) => {
        setRuleModeKey(key)
    }

    const handleRuleModeDelete = (key: number) => {
        console.log('handleRuleModeDelete:', key)
    }

    return (
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
                    {tab === 0 && (<>
                        <div className="flex-between">
                            <TextField
                                select fullWidth size="small"
                                label="域名匹配"
                                value={ruleConfig.domainStrategy}
                                onChange={handleDomainStrategy}>
                                <MenuItem value="AsIs">仅域名匹配</MenuItem>
                                <MenuItem value="IPIfNonMatch">优先域名匹配，未匹配上则解析为IP再次匹配</MenuItem>
                                <MenuItem value="IPOnDemand">优先解析为IP匹配</MenuItem>
                            </TextField>
                        </div>
                        <TextField
                            select fullWidth size="small"
                            label="未匹配上的域名"
                            value={ruleConfig.unmatchedStrategy}
                            onChange={handleUnmatchedStrategy}>
                            <MenuItem value="direct">直接访问</MenuItem>
                            <MenuItem value="proxy">代理访问</MenuItem>
                        </TextField>
                        <TextField
                            select fullWidth size="small"
                            label="采用模式"
                            value={ruleConfig.mode}
                            onChange={handleMode}>
                            {ruleModeList.map((item, index) => (
                                <MenuItem key={index} value={index}>{item.name}</MenuItem>
                            ))}
                        </TextField>
                        <Button variant="contained" color="info">确认</Button>
                    </>)}

                    {tab === 1 && (<>
                        {ruleModeKey > -1 ? (<>
                            <RuleModeEditor ruleModeList={ruleModeList} setRuleModeList={setRuleModeList} ruleModeKey={ruleModeKey} setRuleModeKey={setRuleModeKey}/>
                        </>) : (<>
                            <Stack direction="row" spacing={1}>
                                <Button variant="contained" color="secondary" startIcon={<AddIcon/>}>添加</Button>
                                <Button variant="contained" color="success" startIcon={<FileUploadIcon/>}>导入</Button>
                                <Button variant="contained" color="warning" startIcon={<FileDownloadIcon/>}>导出</Button>
                            </Stack>
                            <TableContainer component={Card}>
                                <Table>
                                    <TableBody>
                                        {ruleModeList.map((row, key) => (
                                            <TableRow key={key} sx={{'&:last-child td, &:last-child th': {border: 0}}}>
                                                <TableCell component="th" scope="row">
                                                    <Typography gutterBottom variant="h6" component="div">{row.name}</Typography>
                                                    <Typography variant="body2" sx={{color: 'text.secondary'}}>{row.note}</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton color="primary" title="编辑" onClick={() => handleRuleModeUpdate(key)}><EditIcon/></IconButton>
                                                    <IconButton color="error" title="删除" onClick={() => handleRuleModeDelete(key)}><DeleteIcon/></IconButton>
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
    )
}
