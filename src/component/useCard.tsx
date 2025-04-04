import { Card, CircularProgress } from '@mui/material'
import FmdBadIcon from '@mui/icons-material/FmdBad'

const centerSx = {
    p: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'calc(100vh - 20px)',
    textAlign: 'center'
}

export const ErrorCard = ({errorMsg, height}: {
    errorMsg: string
    height?: string
}) => {
    return (
        <Card sx={height ? {...centerSx, height} : centerSx}>
            <FmdBadIcon sx={{fontSize: '5rem', mb: 2}}/>
            <div>{errorMsg}</div>
        </Card>
    )
}

export const LoadingCard = ({height}: { height?: string }) => {
    return (
        <Card sx={height ? {...centerSx, height} : centerSx}>
            <CircularProgress/>
        </Card>
    )
}
