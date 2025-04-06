import { log } from './invoke.ts'

export function encodeBase64(str: string): string {
    try {
        const encoder = new TextEncoder()
        const data = encoder.encode(str)
        return btoa(String.fromCharCode(...data))
    } catch (error) {
        log.error('Base64 encode error:', error)
        return ''
    }
}

export function decodeBase64(base64: string): string {
    try {
        const binaryString = atob(base64)
        const bytes = new Uint8Array([...binaryString].map(char => char.charCodeAt(0)))
        const decoder = new TextDecoder()
        return decoder.decode(bytes)
    } catch (error) {
        log.error('Base64 decode error:', error)
        return ''
    }
}

export function safeJsonParse(jsonString: string): any {
    try {
        return JSON.parse(jsonString)
    } catch (e) {
        log.error('JSON.parse failed:', e)
        return null
    }
}

export function safeJsonStringify(data: any): string {
    try {
        return JSON.stringify(data)
    } catch (e) {
        log.error('JSON.stringify failed:', e)
        return '{}'
    }
}

export function safeDecodeURI(encodedURI: string): string {
    try {
        return decodeURIComponent(encodedURI)
    } catch (e) {
        log.error('Failed to decode URI component:', e)
        return encodedURI || ''
    }
}

export function deepSafeDecodeURI(data: any): any {
    if (typeof data === 'string') {
        return safeDecodeURI(data)
    } else if (Array.isArray(data)) {
        return data.map(item => deepSafeDecodeURI(item))
    } else if (data && typeof data === 'object') {
        const result: any = {}
        for (const key in data) {
            result[key] = deepSafeDecodeURI(data[key])
        }
        return result
    }
    return data
}
