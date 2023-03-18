export function isFunction(value) {
  return typeof value === 'function'
}
export function isObject(obj) {
  return obj !== null && typeof obj === 'object'
}

export function hasChanged(x, y) {
  if (x === y) {
    return x === 0 && 1 / x !== 1 / y
  } else {
    return x === x || y === y
  }
}

export const isArray = Array.isArray

export function isNative(Ctor) {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

const _toString = Object.prototype.toString

export const inBrowser = typeof window !== 'undefined'
export const UA = inBrowser && window.navigator.userAgent.toLowerCase()
export const isIE = UA && /msie|trident/.test(UA)
export function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]'
}
