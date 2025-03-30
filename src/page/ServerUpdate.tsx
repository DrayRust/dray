import { useEffect } from 'react'
import { Card } from '@mui/material'
import { useAppBar } from "../component/useAppBar.tsx"

const ServerUpdate: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(1), [setNavState])

    const {AppBarComponent} = useAppBar('/server', '修改')
    return <>
        <AppBarComponent/>
        <Card sx={{p: 2, mt: 1}}>

        </Card>
    </>
}

export default ServerUpdate
