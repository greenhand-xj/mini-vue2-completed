import { hasChanged, isArray, isObject } from '../shared/util'
import { arrayMethods } from './array'
import Dep from './dep'

export class Observer {
  constructor(value) {
    // 给每个对象都增加收集功能
    this.dep = new Dep()

    Object.defineProperty(value, '__ob__', {
      enumerable: false,
      value: this,
    })
    if (isArray(value)) {
      value.__proto__ = arrayMethods
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }
  walk(value) {
    const keys = Object.keys(value)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      defineReactivity(value, key, value[key])
    }
  }
  observeArray(value) {
    for (let i = 0, l = value.length; i < l; i++) {
      observe(value[i])
    }
  }
}

export function observe(data) {
  if (!isObject(data)) return
  if (data.__ob__ instanceof Observer) return data.__ob__
  //对象的形式
  return new Observer(data)
}

export function defineReactivity(obj, key, value) {
  let childOb = observe(value)
  let dep = new Dep() //每个属性都有一个dep
  Object.defineProperty(obj, key, {
    get() {
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend() // 让数组和对象本身也实现依赖收集
          if (isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set(newValue) {
      if (!hasChanged(value, newValue)) return
      value = newValue
      observe(newValue)
      dep.notify()
    },
  })
}

function dependArray(value) {
  for (let i = 0, e, l = value.length; i < l; i++) {
    e = value[i]
    if (e && e.__ob__) {
      e.__ob__.dep.depend()
    }
    if (isArray(e)) {
      dependArray(e)
    }
  }
}
