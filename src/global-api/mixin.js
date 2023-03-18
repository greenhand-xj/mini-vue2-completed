import { LIFECYCLE_HOOKS } from '../shared/constants'

const strats = {}
LIFECYCLE_HOOKS.forEach((hook) => {
  strats[hook] = mergeLifecycleHook
})
function mergeLifecycleHook(p, c) {
  if (c) {
    if (p) {
      return p.concat(c)
    } else {
      return [c]
    }
  } else {
    return p
  }
}

export function mergeOptions(parent, child) {
  const options = {}
  //循环老的
  for (let key in parent) {
    mergeField(key)
  }
  for (let key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key)
    }
  }

  function mergeField(key) {
    // 策略模式
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key])
    } else {
      options[key] = child[key] || parent[key]
    }
  }
  return options
}
