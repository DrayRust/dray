import { processLines } from "./util.ts"

export function modeRulesToConf(modeRules: RuleRow[]) {
    let rules = []
    for (let i = 0; i < modeRules.length; i++) {
        const v = modeRules[i]
        let rule: any = {
            type: 'field',
            ruleTag: `${i}-dray-${v.outboundTag}`,
            outboundTag: v.outboundTag
        }
        if (v.ruleType === 'domain') {
            rules.push({...rule, domain: processLines(v.domain)})
        } else if (v.ruleType === 'ip') {
            rules.push({...rule, ip: processLines(v.ip)})
        } else if (v.ruleType === 'multi') {
            if (v.domain) rule.domain = processLines(v.domain)
            if (v.ip) rule.ip = processLines(v.ip)
            if (v.port) rule.port = processLines(v.port)
            if (v.sourcePort) rule.sourcePort = processLines(v.sourcePort)
            if (v.network) rule.network = v.network
            if (v.protocol) rule.protocol = processLines(v.protocol, ',')
            rules.push(rule)
        }
    }
    return rules
}
