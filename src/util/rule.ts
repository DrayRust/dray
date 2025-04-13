import { processLines } from "./util.ts"

export function RuleToConf(ruleConfig: RuleConfig, ruleDomain: RuleDomain, modeRules: RuleRow[]) {
    let rules: any[]
    if (ruleConfig.globalProxy) {
        rules = getGlobalProxyConf()
    } else {
        rules = [...RuleDomainToConf(ruleDomain)]

        if (modeRules.length > 0) {
            rules = [...rules, ...modeRulesToConf(modeRules)]
        }

        // 当未匹配策略为直连时，添加直连规则
        if (ruleConfig.unmatchedStrategy === 'direct') {
            rules.push({
                type: 'field',
                ruleTag: 'dray-unmatched',
                outboundTag: 'direct',
                // network: 'tcp,udp',
                port: '1-65535',
            })
        }
    }

    return {
        "routing": {
            "domainStrategy": ruleConfig.domainStrategy,
            "rules": rules
        }
    }
}

export function modeRulesToConf(modeRules: RuleRow[]): any[] {
    let rules = []
    for (let i = 0; i < modeRules.length; i++) {
        const v = modeRules[i]
        let rule: any = {
            type: 'field',
            ruleTag: `${i}-dray-mode-${v.outboundTag}`,
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

export function RuleDomainToConf(ruleDomain: RuleDomain): any[] {
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

// 获取全局代理配置
// 考虑用户体验，默认全局代理，排除代理服务器无法访问的 私有域名 和 私有IP
export function getGlobalProxyConf(): any[] {
    return [{
        type: 'field',
        ruleTag: 'dray-global-proxy',
        outboundTag: 'direct',
        domain: ['geosite:private'],
        ip: ['geoip:private'],
    }]
}
