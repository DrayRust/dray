import { readServerList, saveServerList } from "../util/invoke.ts"
import { uriToServerRow } from "../util/server.ts"

export const useServerImport = async (
    inputValue: string,
    showSnackbar: (msg: string, severity?: 'success' | 'info' | 'warning' | 'error') => void,
    setError?: ((value: boolean) => void) | null,
    onSuccess?: () => void,
) => {
    const s = inputValue.trim()
    if (!s) return

    let errNum = 0
    let newNum = 0
    let existNum = 0
    let newServerList: ServerList = []
    let serverList = await readServerList() || []
    const arr = s.split('\n')
    for (let uri of arr) {
        uri = uri.trim()
        if (!uri) continue

        const row = await uriToServerRow(uri)
        if (!row) {
            errNum++
            continue
        }

        let isExist = serverList.some(server => server.hash === row.hash)
        if (isExist) {
            existNum++
            continue
        }

        isExist = newServerList.some(server => server.hash === row.hash)
        if (isExist) {
            existNum++
            continue
        }

        newNum++
        newServerList.push(row)
    }

    const errMsg = `解析链接（URI）错误: ${errNum} 条`
    const okMsg = `导入成功: ${newNum} 条`
    const existMsg = `已存在: ${existNum} 条`
    setError && setError(existNum > 0)
    if (newNum) {
        serverList = [...newServerList, ...serverList]
        const ok = await saveServerList(serverList)
        if (!ok) {
            showSnackbar('导入失败', 'error')
        } else {
            if (errNum) {
                showSnackbar(`${errMsg}，${okMsg}，${existMsg}`, 'error')
            } else if (existNum) {
                showSnackbar(`${existMsg}，${okMsg}`, 'warning')
            } else {
                showSnackbar(okMsg)
            }
            onSuccess && onSuccess()
        }
    } else if (existNum) {
        if (errNum) {
            showSnackbar(`${existMsg}，${errMsg}，${okMsg}`, 'error')
        } else if (existNum) {
            showSnackbar(`${existMsg}，${okMsg}`, 'warning')
        }
    } else {
        showSnackbar(errMsg, 'error')
    }
}
