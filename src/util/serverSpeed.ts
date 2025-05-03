import { checkPortAvailable, fetchTextContent, log, saveSpeedTestConf, startSpeedTestServer, stopSpeedTestServer } from "./invoke.ts"
import { getRandom, sleep } from "./util.ts"
import { getSpeedTestConf } from "./serverConf.ts"

export async function generateServersPort(serverList: ServerList) {
    let port = getRandom(25000, 35000)
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

export async function serverSpeedTest(server: ServerRow, appDir: string, rayConfig: RayCommonConfig, port: number) {
    const filename = server.host.replace(/[^\w.]/g, '_') + `-${server.id}.json`
    const conf = getSpeedTestConf(server, appDir, rayConfig, port)
    await saveSpeedTestConf(filename, conf)
    await startSpeedTestServer(port, filename)
    await sleep(500)

    // 目前测试 http 比 https 快 100-500ms
    // https://www.gstatic.com/generate_204
    // https://www.google.com/generate_204
    // https://cp.cloudflare.com/generate_204
    // https://captive.apple.com/hotspot-detect.htm
    // http://www.msftconnecttest.com/connecttest.txt
    const startTime = performance.now()
    const result = await fetchTextContent('http://www.gstatic.com/generate_204', `socks5://127.0.0.1:${port}`)
    const elapsed = Math.floor(performance.now() - startTime)

    await stopSpeedTestServer(port)
    return {result, elapsed}
}
