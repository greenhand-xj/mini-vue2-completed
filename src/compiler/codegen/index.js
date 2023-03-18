import { ELEMENT_TYPE } from '../parse'
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

export function generate(ast) {
  let children = genChildren(ast.children)
  let code = `_c('${ast.tag}',${
    ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'
  }${ast.children.length ? `,${children}` : ''})`
  return code
}

function genProps(attrs) {
  let str = ''
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i]
    if (attr.name === 'style') {
      let obj = {}
      attr.value.split(';').forEach((item) => {
        let [key, value] = item.split(':')
        obj[key.trim()] = value.trim()
      })
      attr.value = obj
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`
  }
  return `{${str.slice(0, -1)}}`
}

function genChildren(children) {
  if (children) {
    return children.map((child) => gen(child)).join(',')
  }
}

function gen(node) {
  if (node.type === ELEMENT_TYPE) {
    return generate(node)
  } else {
    let text = node.text
    defaultTagRE.lastIndex = 0
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`
    } else {
      let tokens = [],
        match,
        lastIndex = 0
      defaultTagRE.lastIndex = 0
      while ((match = defaultTagRE.exec(text))) {
        let index = match.index
        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)))
        }
        tokens.push(`_s(${match[1].trim()})`)
        lastIndex = index + match[0].length
      }
      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)))
      }
      return `_v(${tokens.join('+')})`
    }
  }
}
