import { checkPortAvailable, fetchProxyGet, log, saveTestConf, SpeedTestRay } from "./invoke.ts"
import { getRandomNumber, sleep } from "./util.ts"
import { getSpeedTestConf } from "./serverConf.ts"

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

export async function serverSpeedTest(server: ServerRow, appDir: string, port: number) {
    const filename = server.host.replace(/[^\d.]/g, '_') + `-${server.id}.json`
    const conf = getSpeedTestConf(server, appDir, port)
    await saveTestConf(filename, conf)
    await SpeedTestRay(filename)

    await sleep(500)
    const startTime = Date.now()

    // https://www.gstatic.com/generate_204
    // https://www.google.com/generate_204
    // https://cp.cloudflare.com/generate_204
    // https://www.msftconnecttest.com/connecttest.txt
    // https://captive.apple.com/hotspot-detect.htm
    await fetchProxyGet("https://www.gstatic.com/generate_204", `socks5://127.0.0.1:${port}`)

    return Date.now() - startTime
}
