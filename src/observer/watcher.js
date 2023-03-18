import { isFunction } from '../shared/util'
import Dep, { popTarget, pushTarget } from './dep'
import { queueWatcher } from './scheduler'

let id = 0
export default class Watcher {
  constructor(vm, expOrFn, options, cb) {
    this.id = id++
    this.vm = vm
    this.cb = cb
    this.renderWatcher = options.isRenderWatcher
    if (isFunction(expOrFn)) {
      this.getter = expOrFn
    } else {
      this.getter = function () {
        return vm[expOrFn]
      }
    }
    this.deps = []
    this.depsId = new Set()
    this.lazy = !!options.lazy // 判断是否是计算属性
    this.dirty = !!this.lazy // 判断是否是计算属性
    this.user = !!options.user // 判断是否是用户自己定义的watch
    this.value = this.lazy ? undefined : this.get()
  }

  get() {
    pushTarget(this)
    let value = this.getter.call(this.vm)
    popTarget()
    return value
  }
  addDep(dep) {
    //利用id和set去重
    let id = dep.id
    if (!this.depsId.has(id)) {
      this.deps.push(dep)
      this.depsId.add(id)
      dep.addSub(this)
    }
  }
  evaluate() {
    this.value = this.get() //获取到用户的返回值
    this.dirty = false
  }

  // 更新
  update() {
    if (this.lazy) {
      this.dirty = true
    } else {
      queueWatcher(this) //把当前的watcher暂存起来
    }
    // this.get() // 重新更新
  }
  depend() {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }

  run() {
    let oldValue = this.value
    let newValue = this.get()
    if (this.user) {
      this.cb.call(this.vm, newValue, oldValue)
    }
  }
}
