import { writeText, readText, readImage } from '@tauri-apps/plugin-clipboard-manager'
import { enable, isEnabled, disable } from '@tauri-apps/plugin-autostart'
import { revealItemInDir, openUrl as openUrlTauri } from '@tauri-apps/plugin-opener'
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

export async function clipboardReadImage() {
    return await readImage()
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

export async function openDir(path: string) {
    if (!IS_TAURI) return false
    try {
        revealItemInDir(path)
        return true
    } catch (err) {
        log.error('Failed to revealItemInDir:', err)
        return false
    }
}

export async function openUrl(path: string) {
    if (!IS_TAURI) return false
    try {
        openUrlTauri(path)
        return true
    } catch (err) {
        log.error('Failed to openUrl:', err)
        return false
    }
}
