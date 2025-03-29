import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Box, Divider, FormControlLabel, Checkbox, Stack, Button } from '@mui/material'
import { useAppBar } from "../component/useAppBar.tsx"
import { readServerList } from "../util/invoke.ts"

const ServerExport: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(1), [setNavState])
    const navigate = useNavigate()

    const [serverList, setServerList] = useState<ServerList>()
    const readList = () => {
        readServerList().then((d) => {
            setServerList(d as ServerList)
        }).catch(_ => 0)
    }
    useEffect(() => readList(), [])

    const [selectedAll, setSelectedAll] = useState(true)
    const [selectedServers, setSelectedServers] = useState<boolean[]>([])

    useEffect(() => {
        if (serverList) setSelectedServers(new Array(serverList.length).fill(true))
    }, [serverList])

    const handleSelectAll = (checked: boolean) => {
        setSelectedAll(checked)
        if (serverList) setSelectedServers(new Array(serverList.length).fill(checked))
    }

    const handleSelectServer = (index: number, checked: boolean) => {
        const newSelected = [...selectedServers]
        newSelected[index] = checked
        setSelectedServers(newSelected)
        setSelectedAll(newSelected.every(Boolean))
    }

    const handleSubmit = () => {
        const selected = serverList?.filter((_, index) => selectedServers[index])
        if (selected && selected.length > 0) {

        } else {
            alert(`请选择要导出的服务器`)
        }
    }

    const {AppBarComponent} = useAppBar('导出')
    return <>
        <AppBarComponent/>
        <Card sx={{mt: 1}}>
            <Box sx={{px: 2, py: 1}}>
                <FormControlLabel
                    control={<Checkbox
                        checked={selectedAll}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                    />}
                    label={`全选`}
                />
                <div>
                    {serverList?.map((server, index) => (
                        <FormControlLabel
                            key={index}
                            control={
                                <Checkbox
                                    checked={selectedServers[index] ?? false}
                                    onChange={(e) => handleSelectServer(index, e.target.checked)}
                                />
                            }
                            label={`${server.ps}`}
                        />
                    ))}
                </div>
            </Box>
            <Divider/>
            <Stack direction="row" spacing={1} sx={{p: 2}}>
                <Button variant="contained" color="secondary" onClick={handleSubmit}>导出二维码和链接</Button>
                <Button variant="contained" color="success" onClick={handleSubmit}>导出备份文件</Button>
                <Button variant="outlined" onClick={() => navigate(`/server`)}>返回</Button>
            </Stack>
        </Card>
    </>
}

export default ServerExport
