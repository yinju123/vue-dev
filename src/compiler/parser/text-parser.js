/* @flow */

import { cached } from 'shared/util'
import { parseFilters } from './filter-parser'

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g

const buildRegex = cached(delimiters => {
  const open = delimiters[0].replace(regexEscapeRE, '\\$&')
  const close = delimiters[1].replace(regexEscapeRE, '\\$&')
  return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
})

type TextParseResult = {
  expression: string,
  tokens: Array<string | { '@binding': string }>
}

// 文本内容解析,或者属性值
export function parseText(
  text: string,
  delimiters?: [string, string]
): TextParseResult | void {
  const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE
  // 判断是否使用data里面的数据
  // console.log('text', text)
  // 没有使用data里面的数据
  if (!tagRE.test(text)) {
    return
  }

  const tokens = []
  const rawTokens = []
  // lastIndex 规定下次匹配的起始位置。  上次匹配的结果是由方法 RegExp.exec() 和 RegExp.test() 找到的。exec test 是正则的方法
  let lastIndex = tagRE.lastIndex = 0
  let match, index, tokenValue
  // 存在{{}}时执行
  while ((match = tagRE.exec(text))) {
    index = match.index
    console.log('match', match, lastIndex, index)
    // push text token
    // 两个表达式之间有内容
    // <div v-if="">{{a/b}}sdf d{{a}}</div>
    if (index > lastIndex) {
      rawTokens.push(tokenValue = text.slice(lastIndex, index))
      tokens.push(JSON.stringify(tokenValue))
    }
    // tag token
    // console.log('match', match)
    // 过滤器获取
    const exp = parseFilters(match[1].trim())
    tokens.push(`_s(${exp})`)
    rawTokens.push({ '@binding': exp })
    lastIndex = index + match[0].length
  }
  // 剩余的内容，文案
  if (lastIndex < text.length) {
    rawTokens.push(tokenValue = text.slice(lastIndex))
    tokens.push(JSON.stringify(tokenValue))
  }
  return {
    expression: tokens.join('+'),
    tokens: rawTokens
  }
}
