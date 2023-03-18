const unicodeRegExp =
  /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const dynamicArgAttribute =
  /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)

export const ELEMENT_TYPE = 1
export const TEXT_TYPE = 3
export function parse(html) {
  const stack = []
  let currentParent
  let root

  function createASTElement(tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null,
    }
  }

  function start(tag, attrs) {
    let node = createASTElement(tag, attrs)
    if (!root) {
      root = node
    }
    if (currentParent) {
      node.parent = currentParent
      currentParent.children.push(node)
    }
    stack.push(node)
    currentParent = node
  }
  function chars(text) {
    text = text.trim()
    text &&
      currentParent.children.push({
        type: TEXT_TYPE,
        text,
        parent: currentParent,
      })
  }

  function end(tag) {
    stack.pop()
    currentParent = stack[stack.length - 1]
  }

  while (html) {
    let textEnd = html.indexOf('<') //如果是0的话，则说明是个标签
    if (textEnd == 0) {
      const startTagMatch = parseStartTag()
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue
      }
      let endTagMatch = html.match(endTag)
      if (endTagMatch) {
        advance(endTagMatch[0].length)
        end(endTagMatch[1])
        continue
      }
    }
    let text
    if (textEnd >= 0) {
      text = html.substring(0, textEnd) //文本内容
      if (text) {
        chars(text)
        advance(text.length)
      }
    }
  }
  return root
  function advance(n) {
    html = html.substring(n)
  }

  function parseStartTag() {
    const start = html.match(startTagOpen)
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
      }
      advance(start[0].length)
      let attr, end
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        advance(attr[0].length)
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] || true,
        })
      }
      if (end) {
        advance(end[0].length)
        return match
      }
      // console.log('match', match)
      // console.log('html', html)
    }
    return false //不是开始标签
  }
}
