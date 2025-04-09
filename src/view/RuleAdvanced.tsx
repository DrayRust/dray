import { useState } from 'react'
import {
    Box, Card, Drawer, Stack, TextField, MenuItem, Button,
    BottomNavigation, BottomNavigationAction
} from '@mui/material'
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow'
import ForkRightIcon from '@mui/icons-material/ForkRight'
import ModeIcon from '@mui/icons-material/Tune'

export const RuleAdvanced = ({open, setOpen}: {
    open: boolean,
    setOpen: (open: boolean) => void
}) => {
    const [tab, setTab] = useState(0)
    const [domainStrategy, setDomainStrategy] = useState('AsIs')
    const [unmatchedStrategy, setUnmatchedStrategy] = useState('direct')
    const [mode, setMode] = useState(0)

    const handleClose = () => {
        setOpen(!open)
    }

    const handleDomainStrategy = (e: any) => {
        setDomainStrategy(e.target.value)
    }

    const handleUnmatchedStrategy = (e: any) => {
        setUnmatchedStrategy(e.target.value)
    }

    const handleMode = (e: any) => {
        setMode(e.target.value)
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
                                value={domainStrategy}
                                onChange={handleDomainStrategy}>
                                <MenuItem value="AsIs">仅域名匹配</MenuItem>
                                <MenuItem value="IPIfNonMatch">优先域名匹配，未匹配上则解析为IP再次匹配</MenuItem>
                                <MenuItem value="IPOnDemand">优先解析为IP匹配</MenuItem>
                            </TextField>
                        </div>
                        <TextField
                            select fullWidth size="small"
                            label="未匹配上的域名"
                            value={unmatchedStrategy}
                            onChange={handleUnmatchedStrategy}>
                            <MenuItem value="direct">直接访问</MenuItem>
                            <MenuItem value="proxy">代理访问</MenuItem>
                        </TextField>
                        <TextField
                            select fullWidth size="small"
                            label="采用模式"
                            value={mode}
                            onChange={handleMode}>
                            <MenuItem value={0}>大陆模式</MenuItem>
                            <MenuItem value={1}>俄罗斯模式</MenuItem>
                            <MenuItem value={2}>伊朗模式</MenuItem>
                        </TextField>
                        <Button variant="contained" color="info">确认</Button>
                    </>)}

                    {tab === 1 && (<>
                        <TextField
                            select fullWidth size="small"
                            label="采用模式"
                            value={mode}
                            onChange={handleMode}>
                            <MenuItem value={0}>大陆模式</MenuItem>
                            <MenuItem value={1}>俄罗斯模式</MenuItem>
                            <MenuItem value={2}>伊朗模式</MenuItem>
                        </TextField>
                    </>)}
                </Stack>
            </Box>
        </Drawer>
    )
}
