import { useState } from 'react'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import RestoreIcon from '@mui/icons-material/Restore'
import FavoriteIcon from '@mui/icons-material/Favorite'
import LocationOnIcon from '@mui/icons-material/LocationOn'

function Rule() {
    const [value, setValue] = useState(0)
    return <div>
        <BottomNavigation
            showLabels
            value={value}
            onChange={(_event, newValue) => {
                setValue(newValue)
            }}
        >
            <BottomNavigationAction label="Recents" icon={<RestoreIcon/>}/>
            <BottomNavigationAction label="Favorites" icon={<FavoriteIcon/>}/>
            <BottomNavigationAction label="Nearby" icon={<LocationOnIcon/>}/>
        </BottomNavigation>
    </div>
}

export default Rule
