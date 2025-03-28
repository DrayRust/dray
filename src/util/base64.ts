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
