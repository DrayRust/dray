import { writeText, readText } from '@tauri-apps/plugin-clipboard-manager'
import { enable, isEnabled, disable } from '@tauri-apps/plugin-autostart'
import { IS_TAURI, log } from "./invoke.ts"

export async function clipboardWriteText(text: string) {
    if (!IS_TAURI) return false
    try {
        await writeText(text)
        return true
    } catch (err) {
        return false
    }
}

export async function clipboardReadText() {
    return await readText()
}

export async function isAutoStartEnabled() {
    if (!IS_TAURI) return false
    try {
        return await isEnabled()
    } catch (err) {
        log.error('Failed to isAutoStartEnabled:', err)
        return false
    }
}

export async function saveAutoStart(value: boolean) {
    if (!IS_TAURI) return false
    try {
        value ? await enable() : await disable()
        return true
    } catch (err) {
        log.error('Failed to setAutoStart:', err)
        return false
    }
}
