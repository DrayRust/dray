import { useEffect } from 'react'
import { Card } from '@mui/material'
import { useAppBar } from "../component/useAppBar.tsx"

const ServerExport: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(1), [setNavState])

    const {AppBarComponent} = useAppBar('导出')
    return <>
        <AppBarComponent/>
        <Card sx={{p: 2, mt: 1}}>

        </Card>
    </>
}

export default ServerExport
