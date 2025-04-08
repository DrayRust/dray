import { useState, useEffect } from 'react'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import SendIcon from '@mui/icons-material/Send'
import FlightIcon from '@mui/icons-material/Flight'
import BlockIcon from '@mui/icons-material/Block'

const Rule: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => {
        setNavState(3)
    }, [setNavState])

    const [ruleType, setRuleType] = useState(0)
    return <>
        <BottomNavigation
            showLabels value={ruleType}
            onChange={(_, v) => setRuleType(v)}>
            <BottomNavigationAction label="代理" icon={<SendIcon/>}/>
            <BottomNavigationAction label="直连" icon={<FlightIcon/>}/>
            <BottomNavigationAction label="拒绝" icon={<BlockIcon/>}/>
        </BottomNavigation>
    </>
}

export default Rule
