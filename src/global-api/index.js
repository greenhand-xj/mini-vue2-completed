import { mergeOptions } from './mixin'

export function initGlobalAPI(Vue) {
  Vue.options = {}
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
