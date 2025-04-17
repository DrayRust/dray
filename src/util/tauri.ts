import { writeText, readText } from '@tauri-apps/plugin-clipboard-manager'

export async function clipboardWriteText(text: string) {
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
