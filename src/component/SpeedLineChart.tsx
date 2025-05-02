import { Stack, Card, Typography } from '@mui/material'
import { LineChart } from '@mui/x-charts/LineChart'

export const SpeedLineChart = ({title, value, series}: { title: string, value: string, series: any[] }) => {
    return (
        <Stack component={Card} elevation={3} sx={{p: 2, flex: 1}}>
            <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6">{title}</Typography>
                <Typography variant="body1">{value}</Typography>
            </Stack>
            <LineChart series={series} height={160}/>
        </Stack>
    )
}
