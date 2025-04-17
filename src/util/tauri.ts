import { writeText, readText } from '@tauri-apps/plugin-clipboard-manager'

export async function clipboardWriteText(text: string) {
    return await writeText(text)
}

export async function clipboardReadText() {
    return await readText()
}
