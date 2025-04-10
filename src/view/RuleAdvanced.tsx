import { useState, useEffect } from 'react'
import {
    Box, Card, Drawer, Stack, TextField, MenuItem, Button,
    BottomNavigation, BottomNavigationAction
} from '@mui/material'
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow'
import ForkRightIcon from '@mui/icons-material/ForkRight'
import ModeIcon from '@mui/icons-material/Tune'
import { readRuleModeList } from "../util/invoke.ts"

export const RuleAdvanced = ({open, setOpen, ruleConfig, setRuleConfig}: {
    open: boolean,
    setOpen: (open: boolean) => void,
    ruleConfig: RuleConfig,
    setRuleConfig: React.Dispatch<React.SetStateAction<RuleConfig>>
}) => {
    const [tab, setTab] = useState(0)
    const [ruleModeList, setRuleModeList] = useState<RuleModeList>([])

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

    return (
        <Drawer anchor="right" open={open} onClose={handleClose}>
            <Box sx={{p: 2}}>
                <Stack spacing={2} sx={{minWidth: '600px'}}>
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
                        <TextField
                            select fullWidth size="small"
                            label="采用模式"
                            value={ruleConfig.mode}
                            onChange={handleMode}>
                            {ruleModeList.map((item, index) => (
                                <MenuItem key={index} value={index}>{item.name}</MenuItem>
                            ))}
                        </TextField>
                    </>)}
                </Stack>
            </Box>
        </Drawer>
    )
}
