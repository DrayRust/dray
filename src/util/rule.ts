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

export function RuleDomainToConf(ruleDomain: RuleDomain) {
    let rules = []

    if (ruleDomain.proxy) {
        rules.push({
            type: 'field',
            ruleTag: 'dray-proxy-domain',
            outboundTag: 'proxy',
            domain: processLines(ruleDomain.proxy),
        })
    }

    if (ruleDomain.direct) {
        rules.push({
            type: 'field',
            ruleTag: 'dray-direct-domain',
            outboundTag: 'direct',
            domain: processLines(ruleDomain.direct),
        })
    }

    if (ruleDomain.block) {
        rules.push({
            type: 'field',
            ruleTag: 'dray-block-domain',
            outboundTag: 'block',
            domain: processLines(ruleDomain.block),
        })
    }

    return rules
}
