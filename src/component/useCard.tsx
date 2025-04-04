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

interface ErrorCardProps {
    errorMsg: string
}

export const ErrorCard = ({errorMsg}: ErrorCardProps) => {
    return (
        <Card sx={centerSx}>
            <FmdBadIcon sx={{fontSize: '5rem', mb: 2}}/>
            <div>{errorMsg}</div>
        </Card>
    )
}

export const LoadingCard = () => {
    return (
        <Card sx={centerSx}>
            <CircularProgress/>
        </Card>
    )
}
