import { useState } from 'react'
import {
    Button, Stack, TextField, Typography, CircularProgress
} from '@mui/material'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { startScanPorts } from "../util/invoke.ts"

export const ScanPorts = () => {
    const [host, setHost] = useState('127.0.0.1')
    const [startPort, setStartPort] = useState(1)
    const [endPort, setEndPort] = useState(2000)
    const [maxThreads, setMaxThreads] = useState(50)
    const [timeout, setTimeout] = useState(500)

    const [result, setResult] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleScan = async () => {
        setLoading(true)
        setError('')
        setResult('')
        const res = await startScanPorts(host, startPort, endPort, maxThreads, timeout)
        if (res.ok) {
            setResult(JSON.stringify(res, null, 2))
        } else {
            setError('扫描失败')
        }
        setLoading(false)
    }

    return (
        <Stack spacing={2} sx={{pt: 2}}>
            <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                    size="small"
                    label="目标 IP / 域名"
                    value={host}
                    onChange={e => setHost(e.target.value)}
                    fullWidth
                />
                <TextField
                    size="small"
                    label="起始端口"
                    type="number"
                    value={startPort}
                    onChange={e => setStartPort(Number(e.target.value))}
                    sx={{width: 140}}
                />
                <TextField
                    size="small"
                    label="结束端口"
                    type="number"
                    value={endPort}
                    onChange={e => setEndPort(Number(e.target.value))}
                    sx={{width: 140}}
                />
                <Button
                    variant="contained"
                    disabled={loading}
                    onClick={handleScan}
                    sx={{width: 130}}
                >
                    {loading ? <CircularProgress size={20}/> : '开始扫描'}
                </Button>
            </Stack>

            <Stack direction="row" spacing={2}>
                <TextField
                    size="small"
                    label="最大线程数"
                    type="number"
                    value={maxThreads}
                    onChange={e => setMaxThreads(Number(e.target.value))}
                />
                <TextField
                    size="small"
                    label="超时时间 (ms)"
                    type="number"
                    value={timeout}
                    onChange={e => setTimeout(Number(e.target.value))}
                />
            </Stack>

            {error && <Typography color="error">错误：{error}</Typography>}

            {result && (
                <CodeMirror
                    value={result}
                    extensions={[json()]}
                    theme="dark"
                    basicSetup={{lineNumbers: true}}
                />
            )}
        </Stack>
    )
}

export default ScanPorts
