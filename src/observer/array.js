// 重写数组原型方法
const arrayProto = Array.prototype

export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
]
methodsToPatch.forEach(function (method) {
  arrayMethods[method] = function (...args) {
    console.log('method', method)
    const result = arrayProto[method].apply(this, args)
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    const ob = this.__ob__
    if (inserted) {
      ob.observeArray(inserted)
    }
    ob.dep.notify() // 数组变化了，通知对应的watcher实现更新逻辑
    return result
  }
})
