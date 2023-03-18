import { isIE, isNative } from '../shared/util'

const queue = []
const has = {}
let pending = false // 防抖
export function queueWatcher(watcher) {
  const id = watcher.id
  if (!has[id]) {
    queue.push(watcher)
    has[id] = true
    // 不管update走多少次，但是最终值执行一轮刷新操作,时间循环
    if (!pending) {
      nextTick(flushSchedulerQueue)
      pending = true
    }
  }
}

function flushSchedulerQueue() {
  let flushQueue = queue.slice(0)
  let watcher, id
  queue.length = 0
  pending = false
  for (let index = 0; index < flushQueue.length; index++) {
    watcher = flushQueue[index]
    watcher.run()
    id = watcher.id
    has[id] = null
  }
}

let callbacks = []
let waiting = false
let timerFunc

//优雅降级
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  timerFunc = () => {
    Promise.resolve().then(flushCallbacks)
  }
} else if (
  !isIE &&
  typeof MutationObserver !== 'undefined' &&
  (isNative(MutationObserver) ||
    // PhantomJS and iOS 7.x
    MutationObserver.toString() === '[object MutationObserverConstructor]')
) {
  let observer = new MutationObserver(flushCallbacks)
  let textNode = document.createTextNode(String(1))
  observer.observe(textNode, {
    characterData: true,
  })
  timerFunc = () => {
    textNode.textContent = 2
  }
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

export function nextTick(cb) {
  callbacks.push(cb) // nextTick中的callback方法
  if (!waiting) {
    timerFunc()
    waiting = true
  }
}
function flushCallbacks() {
  waiting = false
  let cbs = callbacks.slice(0)
  callbacks = []
  cbs.forEach((cb) => cb())
}
