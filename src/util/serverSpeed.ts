import { checkPortAvailable, fetchGetGenerate, log, saveTestConf, TestSpeedRay } from "./invoke.ts"
import { getRandomNumber, sleep } from "./util.ts"
import { getTestSpeedConf } from "./serverConf.ts"

export async function generateServersPort(serverList: ServerList) {
    let port = getRandomNumber(25000, 35000)
    let errNum = 0
    let servers = []
    for (const server of serverList) {
        for (let i = 0; i < 100; i++) {
            const ok = await checkPortAvailable(port)
            if (ok) {
                break
            } else {
                errNum++
                port++
            }
        }
        servers.push({server, port})
        port++
    }
    if (errNum > 0) log.warn(`${errNum} ports are not available`)
    return servers
}

export async function serverTestSpeed(server: ServerRow, appDir: string, port: number) {
    const filename = server.host.replace(/[^\d.]/g, '_') + `-${server.id}.json`
    const conf = getTestSpeedConf(server, appDir, port)
    await saveTestConf(filename, conf)
    await TestSpeedRay(filename)

    await sleep(500)
    const startTime = Date.now()
    await fetchGetGenerate(port)
    return Date.now() - startTime
}
