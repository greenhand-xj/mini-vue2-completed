import { compileToFunctions } from './compiler/index.js'
import { mergeOptions } from './global-api/mixin.js'
import { callHook, mountComponent } from './lifecycle.js'
import { initState } from './state'

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this
    // 定义的的全局指令和方法... ，都会挂载在实例上
    vm.$options = mergeOptions(vm.constructor.options, options)
    // console.log('vm.$options', vm.$options)
    callHook(vm, 'beforeCreate')
    //初始化状态
    initState(vm)
    callHook(vm, 'created')

    //模块编译
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
  Vue.prototype.$mount = function (el) {
    const vm = this
    el = document.querySelector(el)
    const options = vm.$options
    if (!options.render) {
      let template = options.template
      if (template) {
        // 有template模块
      } else if (el) {
        // 获取html
        template = el.outerHTML
      }
      if (template) {
        let render = compileToFunctions(template)
        options.render = render
      }
    }
    mountComponent(vm, el)
  }
}
