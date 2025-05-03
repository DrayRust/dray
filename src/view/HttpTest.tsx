import { useState } from 'react'
import { Button, Stack, TextField } from '@mui/material'

import { AutoCompleteField } from "../component/AutoCompleteField.tsx"
import { fetchGet, fetchResponseHeaders } from "../util/invoke.ts"

const urlList = [
    'https://www.google.com',
    'https://www.youtube.com',
    'https://www.facebook.com',
    'https://www.instagram.com',
    'https://www.x.com',
    'https://www.chatgpt.com',
    'https://www.whatsapp.com',
    'https://www.wikipedia.org',
    'https://www.reddit.com',
    'https://www.yahoo.co.jp',
    'https://www.yahoo.com',
    'https://www.yandex.ru',
    'https://www.amazon.com',
    'https://www.tiktok.com',
    'https://www.baidu.com',
    'https://www.linkedin.com',
    'https://www.netflix.com',
    'https://www.pornhub.com',
    'https://www.naver.com',
    'https://www.live.com',
    'https://www.office.com',
    'https://www.dzen.ru',
    'https://www.bing.com',
    'https://www.pinterest.com',
    'https://www.temu.com',
    'https://www.bilibili.com',
    'https://www.microsoft.com',
    'https://www.xvideos.com',
    'https://www.twitch.tv',
    'https://www.xhamster.com',
    'https://www.vk.com',
    'https://www.mail.ru',
    'https://www.sharepoint.com',
    'https://www.discord.com',
    'https://www.roblox.com',
    'https://www.zoom.us',
    'https://www.qq.com',
    'https://www.msn.com',
    'https://www.cloudflare.com',
    'https://www.chess.com',
    'https://www.espn.com',
    'https://www.cnn.com',
    'https://www.nytimes.com',
    'https://www.medium.com',
    'https://www.apple.com',
    'https://www.paypal.com',
    'https://www.ebay.com',
    'https://www.aliexpress.com',
    'https://www.canva.com',
]

const userAgent = navigator.userAgent

export const HttpTest = () => {
    const [urlValue, setUrlValue] = useState(urlList[0] || '')
    const [headersValue, setHeadersValue] = useState('')
    const [htmlValue, setHtmlValue] = useState('')

    const urlValueChange = (value: string) => {
        setUrlValue(value)
        setHeadersValue('')
        setHtmlValue('')
    }

    const handleGetHtml = async () => {
        const result = await fetchGet(urlValue, true)
        if (result?.ok) {
            setHtmlValue(result.text || '')
        }
    }

    const handleGetHeaders = async () => {
        const proxyUrl = "socks5://127.0.0.1:1086"
        const result = await fetchResponseHeaders(urlValue, proxyUrl, userAgent)
        if (result?.ok) {
            setHeadersValue(JSON.stringify(result.headers, null, 2))
        }
    }

    return (<>
        <Stack spacing={1}>
            <AutoCompleteField label="请求链接" id="test-url" value={urlValue} options={urlList} onChange={(value) => urlValueChange(value)}/>

            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                <Button variant="contained" onClick={handleGetHeaders}>查看头信息</Button>
                <Button variant="contained" onClick={handleGetHtml}>查看源代码</Button>
            </Stack>

            {headersValue && <TextField className="scr-w2" multiline minRows={2} maxRows={20} size="small" label="请求回应信息" value={headersValue}/>}
            {htmlValue && <TextField className="scr-w2" multiline minRows={2} maxRows={20} size="small" label="HTML 源代码" value={htmlValue}/>}
        </Stack>
    </>)
}

export default HttpTest
