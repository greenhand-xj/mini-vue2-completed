import { generate } from './codegen/index.js'
import { parse } from './parse/index.js'

export const compileToFunctions = function (template) {
  const ast = parse(template.trim())
  let code = generate(ast)
  code = `with(this){return ${code}}`
  const render = new Function(code)
  return render
}
