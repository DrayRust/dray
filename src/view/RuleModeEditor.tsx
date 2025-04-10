import { useState, useEffect } from 'react'
import {
    Stack, Button, TextField, TableContainer, Table, TableBody, TableRow, TableCell, Typography, IconButton, Card
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

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

    const handleModeUpdate = (key: number) => {
        console.log('handleModeUpdate', key)
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
            <TextField
                size="small"
                label="模式名称"
                value={ruleModeRow.name}
                onChange={handleRuleModeRowChange('name')}
            />
            <TextField
                size="small"
                label="模式描述"
                value={ruleModeRow.note}
                onChange={handleRuleModeRowChange('note')}
                multiline
                rows={2}
            />
        </Stack>
        <Button variant="contained" color="secondary" startIcon={<AddIcon/>}></Button>
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
                                <IconButton color="primary" title="编辑" onClick={() => handleModeUpdate(key)}>
                                    <EditIcon/>
                                </IconButton>
                                <IconButton color="error" title="删除" onClick={() => console.log('删除')}>
                                    <DeleteIcon/>
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </>)
}
