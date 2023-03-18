import Dep from './observer/dep.js'
import { observe } from './observer/index.js'
import Watcher from './observer/watcher.js'
import { isArray, isFunction, isPlainObject } from './shared/util'
import { nextTick } from './observer/scheduler'

export function initState(vm) {
  const opts = vm.$options
  if (opts.props) initProps()
  if (opts.methods) initMethods()
  if (opts.data) {
    initData(vm)
  }
  if (opts.computed) initComputed(vm)
  if (opts.watch) initWatch(vm)
}
//vue2 对data初始化
function initData(vm) {
  // console.log('vm', vm)
  let data = vm.$options.data
  data = vm._data = isFunction(data) ? data.call(vm) : data
  observe(data)
  //data上的所以属性代理到实例上
  Object.keys(data).forEach((key) => {
    proxy(vm, '_data', key)
  })
}
function proxy(target, sourceKey, key) {
  Object.defineProperty(target, key, {
    get() {
      return target[sourceKey][key]
    },
    set(val) {
      target[sourceKey][key] = val
    },
  })
}

function initProps(vm) {}

function initMethods(vm) {}

function initComputed(vm) {
  const computed = vm.$options.computed
  const watchers = (vm._computedWatchers = {})
  for (let key in computed) {
    let userDef = computed[key]
    // console.log(getter)
    const getter = isFunction(userDef) ? userDef : userDef.get
    watchers[key] = new Watcher(vm, getter, {
      lazy: true,
    })
    defineComputed(vm, key, userDef)
  }
}
export function defineComputed(target, key, userDef) {
  const getter = isFunction(userDef) ? userDef : userDef.get
  const setter = userDef.set || (() => {})
  Object.defineProperty(target, key, {
    get: createComputedGetter(key),
    set: setter,
  })
}
function createComputedGetter(key) {
  return function () {
    const watcher = this._computedWatchers[key]
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate() //求值后 dirty变成了false,下次就不求值了
      }
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    }
  }
}

function initWatch(vm) {
  let watch = vm.$options.watch
  for (const key in watch) {
    const handler = watch[key]
    if (isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}

function createWatcher(vm, expOrFn, handler) {
  if (isPlainObject(handler)) {
    handler = handler.handler
  }
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  vm.$watch(expOrFn, handler)
}

export function stateMixin(Vue) {
  Vue.prototype.$watch = function (expOrFn, cb) {
    const vm = this
    const watcher = new Watcher(vm, expOrFn, { user: true }, cb)
  }
  Vue.prototype.$nextTick = nextTick
}
