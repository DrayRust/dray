import React from 'react'
import { Stack, Card, Typography } from '@mui/material'
import { GaugeContainer, GaugeValueArc, GaugeReferenceArc, useGaugeState } from '@mui/x-charts/Gauge'

interface SpeedGaugeProps {
    title: string;
    percent: number;
    value: string;
}

function GaugePointer() {
    const {valueAngle, outerRadius, cx, cy} = useGaugeState()
    if (valueAngle === null) return null

    const target = {
        x: cx + outerRadius * Math.sin(valueAngle),
        y: cy - outerRadius * Math.cos(valueAngle),
    }
    return (
        <g>
            <circle cx={cx} cy={cy} r={5} fill="red"/>
            <path
                d={`M ${cx} ${cy} L ${target.x} ${target.y}`}
                stroke="red"
                strokeWidth={3}
            />
        </g>
    )
}

export const SpeedGauge: React.FC<SpeedGaugeProps> = ({title, percent, value}) => {
    return (
        <Stack component={Card} elevation={3} sx={{p: 2, alignItems: 'center'}}>
            <Typography variant="h6">{title}</Typography>
            <GaugeContainer width={300} height={200} startAngle={-110} endAngle={110} value={percent}>
                <GaugeReferenceArc/>
                <GaugeValueArc/>
                <GaugePointer/>
            </GaugeContainer>
            <Typography variant="body1">{value}</Typography>
        </Stack>
    )
}
