import { Card, CircularProgress } from '@mui/material'
import FmdBadIcon from '@mui/icons-material/FmdBad'

const centerSx = {
    p: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'calc(100vh - 20px)',
    mt: 0,
    textAlign: 'center'
}

export const ErrorCard = ({errorMsg, height, mt}: {
    errorMsg: string
    height?: string
    mt?: number
}) => {
    let sx = {...centerSx, ...(height ? {height} : {}), ...(mt ? {mt} : {})}
    return (
        <Card sx={sx}>
            <FmdBadIcon sx={{fontSize: '5rem', mb: 2}}/>
            <div>{errorMsg}</div>
        </Card>
    )
}

export const LoadingCard = ({height, mt}: { height?: string, mt?: number }) => {
    let sx = {...centerSx, ...(height ? {height} : {}), ...(mt ? {mt} : {})}
    return (
        <Card sx={sx}>
            <CircularProgress/>
        </Card>
    )
}
