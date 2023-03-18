import Watcher from './observer/watcher'
import { isObject } from './shared/util'
import { createElementVNode, createTextVNode } from './vdom'
import { patch } from './vdom/patch'

export function initLifecycle(Vue) {
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments)
  }

  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments)
  }

  Vue.prototype._s = function (value) {
    if (!isObject(value)) return value
    return JSON.stringify(value)
  }

  Vue.prototype._update = function (vnode) {
    const vm = this
    const el = vm.$el
    vm.$el = patch(el, vnode)
  }

  Vue.prototype._render = function () {
    const vm = this
    const vnode = vm.$options.render.call(vm)
    return vnode
  }
}

export function mountComponent(vm, el) {
  vm.$el = el
  const updateComponent = () => {
    vm._update(vm._render())
  }
  const watcher = new Watcher(vm, updateComponent, { isRenderWatcher: true })
}

export function callHook(vm, hook) {
  const handlers = vm.$options[hook]
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      handlers[i].call(vm)
    }
  }
}
