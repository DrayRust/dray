import { Stack, Card, Typography } from '@mui/material'
import { LineChart } from '@mui/x-charts/LineChart'

export const SpeedLineChart = ({title, series}: { title: string, series: any[] }) => {
    return (
        <Stack component={Card} elevation={3} sx={{p: 2, flex: 1}}>
            <Typography variant="h6">{title}</Typography>
            <LineChart
                series={series}
                height={200}
            />
        </Stack>
    )
}
