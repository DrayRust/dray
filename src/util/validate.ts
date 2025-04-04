export function validateServerRow(
    data: VmessRow | VlessRow | SsRow | TrojanRow | null,
    ps: string,
    setPsError: (error: boolean) => void,
    setAddError: (error: boolean) => void,
    setPortError: (error: boolean) => void,
    setIdError: (error: boolean) => void,
    setPwdError: (error: boolean) => void
): boolean {
    if (!data) return false

    let err = false
    if (!ps) {
        setPsError(true)
        err = true
    }
    if ("add" in data && !data.add) {
        setAddError(true)
        err = true
    }
    if ("port" in data && !data.port) {
        setPortError(true)
        err = true
    }
    if ("id" in data && !data.id) {
        setIdError(true)
        err = true
    }
    if ("pwd" in data && !data.pwd) {
        setPwdError(true)
        err = true
    }

    return !err
}
