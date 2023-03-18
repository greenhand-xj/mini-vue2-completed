let id = 0
export default class Dep {
  // static关键词代表target全局只有一个
  static target
  constructor() {
    this.id = id++
    this.subs = []
  }

  depend() {
    if (Dep.target) {
      // 不能放重复的watcher
      // this.subs.push(Dep.target)
      Dep.target.addDep(this) //让watcher记住dep dep和watch循环引用
    }
  }
  addSub(watcher) {
    this.subs.push(watcher)
  }
  notify() {
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}
Dep.target = null

let stack = []
export function pushTarget(target) {
  stack.push(target)
  Dep.target = target
}
export function popTarget() {
  stack.pop()
  Dep.target = stack[stack.length - 1]
}
