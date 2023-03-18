import { compileToFunctions } from './compiler'
import { initGlobalAPI } from './global-api'
import { initMixin } from './init'
import { initLifecycle } from './lifecycle'
import { stateMixin } from './state'
import { createElm, patch } from './vdom/patch'

function Vue(options) {
  this._init(options)
}

initMixin(Vue) //扩展了init方法
stateMixin(Vue) // nextTick $watch
initLifecycle(Vue) // vm_update vm_render
initGlobalAPI(Vue) // 全局api的实现 mixin

let render1 = compileToFunctions(`<ul key="a" style="color:red">
  <li key="a">a</li>
  <li key="b">b</li>
  <li key="c">c</li>
  <li key="d">d</li>
</ul>`)
let vm1 = new Vue({ data: { name: 'xujie' } })
let preVnode = render1.call(vm1)
let el = createElm(preVnode)
document.body.appendChild(el)

let render2 = compileToFunctions(
  `<ul key="a" style="color:red;background:skyblue">
  <li key="b">b</li>
  <li key="m">m</li>
  <li key="a">a</li>
  <li key="p">p</li>
  <li key="c">c</li>
  <li key="q">q</li>
  </ul>`
)
let vm2 = new Vue({ data: { name: 'xujie' } })
let nextVnode = render2.call(vm2)

setTimeout(() => {
  patch(preVnode, nextVnode)
  // let newEl = createElm(nextVnode)
  // el.parentNode.replaceChild(newEl, el)
}, 1000)

export default Vue
