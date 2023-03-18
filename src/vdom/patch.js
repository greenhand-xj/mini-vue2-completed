import { isSameVnode } from '.'

export function patch(oldVNode, vnode) {
  const isRealElement = oldVNode.nodeType
  if (isRealElement) {
    const elm = oldVNode
    const parentElm = elm.parentNode
    let newElm = createElm(vnode)
    parentElm.insertBefore(newElm, elm.nextSibling)
    parentElm.removeChild(elm)

    return newElm
  } else {
    //dff算法
    // console.log(oldVNode, vnode)
    //两个节点不是同一个节点，直接删除老的删除新的（没有对比了）

    return patchVnode(oldVNode, vnode)
  }
}

function patchVnode(oldVNode, vnode) {
  if (!isSameVnode(oldVNode, vnode)) {
    let el = createElm(vnode)
    oldVNode.el.parentNode.replaceChild(el, oldVNode.el)
    return el
  }
  //文本的情况
  let el = (vnode.el = oldVNode.el) //复用老节点的元素
  if (!oldVNode.tag) {
    if (oldVNode.text !== vnode.text) {
      oldVNode.el.textContent = vnode.text
    }
  }
  //是标签 比属性
  patchProps(el, oldVNode.data, vnode.data)

  //比较儿子节点，比较的时候，一方有儿子，一方没儿子
  // 两放都有儿子
  let oldChildren = oldVNode.children || []
  let newChildren = vnode.children || []
  if (oldChildren.length > 0 && newChildren.length > 0) {
    // 完整的diff算法 需要比较两个人的儿子
    updateChildren(el, oldChildren, newChildren)
  } else if (newChildren.length > 0) {
    //没有老的，有新的
    mountChildren(el, newChildren)
  } else if (oldChildren.length > 0) {
    //新的没有 老的有 要删除
    unmountChildren(el, oldChildren)
  }

  return el
}
function updateChildren(el, oldChildren, newChildren) {
  // 双指针
  let oldStartIndex = 0
  let newStartIndex = 0
  let oldEndIndex = oldChildren.length - 1
  let newEndIndex = newChildren.length - 1

  let oldStartVnode = oldChildren[0]
  let newStartVnode = newChildren[0]

  let oldEndVnode = oldChildren[oldEndIndex]
  let newEndVnode = newChildren[newEndIndex]

  function makeIndexByKey(children) {
    let map = {}
    children.forEach((child, i) => {
      map[child.key] = i
    })
    return map
  }
  let map = makeIndexByKey(oldChildren)
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (!oldStartVnode) {
      oldStartVnode = oldChildren[++oldStartIndex]
    } else if (!oldEndVnode) {
      oldEndVnode = oldChildren[--oldEndIndex]
    } else if (isSameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode) // 如果是相同节点，则递归比较子节点
      oldStartVnode = oldChildren[++oldStartIndex]
      newStartVnode = newChildren[++newStartIndex]
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode) // 如果是相同节点，则递归比较子节点
      oldEndVnode = oldChildren[--oldEndIndex]
      newEndVnode = newChildren[--newEndIndex]
    } else if (isSameVnode(oldEndVnode, newStartVnode)) {
      //交叉比对
      patchVnode(oldEndVnode, newStartVnode)
      el.insertBefore(oldEndVnode.el, oldStartVnode.el)
      oldEndVnode = oldChildren[--oldEndIndex]
      newStartVnode = newChildren[++newStartIndex]
    } else if (isSameVnode(oldStartVnode, newEndVnode)) {
      //交叉比对
      patchVnode(oldStartVnode, newEndVnode)
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
      oldStartVnode = oldChildren[++oldStartIndex]
      newEndVnode = newChildren[--newEndIndex]
    } else {
      // 乱序比对
      // 根据老的列表做一个映射关系，用新的去找，找到则移动，找不到则添加，最后多余的就删除
      let moveIndex = map[newStartVnode.key]
      if (moveIndex !== undefined) {
        let moveVnode = oldChildren[moveIndex]
        el.insertBefore(moveVnode.el, oldStartVnode.el)
        oldChildren[moveIndex] = undefined
        patchVnode(moveVnode, newStartVnode)
      } else {
        el.insertBefore(createElm(newStartVnode), oldStartVnode.el)
      }
      newStartVnode = newChildren[++newStartIndex]
    }
  }
  // 新节点比旧节点多，需要插入到尾部
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      let childEl = createElm(newChildren[i])
      // 这里可能是向后/向前追加
      let anchor = newChildren[newEndIndex + 1]
        ? newChildren[newEndIndex + 1].el // 获取下个元素
        : null
      el.insertBefore(childEl, anchor) // anchor为null的时候会是appendChild
    }
  }
  // 新节点比旧节点少，需要删除
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      if (oldChildren[i]) {
        let childEl = oldChildren[i].el
        el.removeChild(childEl)
      }
    }
  }
}

function mountChildren(el, newChildren) {
  for (let i = 0; i < newChildren.length; i++) {
    let child = newChildren[i]
    el.appendChild(createElm(child))
  }
}
function unmountChildren(el, oldChildren) {
  el.innerHTML = ''
}

export function createElm(vnode) {
  let { tag, data, children, text } = vnode
  if (typeof tag === 'string') {
    vnode.el = document.createElement(tag)

    patchProps(vnode.el, {}, data)

    children.forEach((child) => {
      vnode.el.appendChild(createElm(child))
    })
  } else {
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}

function patchProps(el, oldProps = {}, props = {}) {
  // 老的属性中有，新的没有，删除老的
  let oldStyles = oldProps.style || {}
  let newStyles = props.style || {}
  for (let key in oldStyles) {
    if (!newStyles[key]) {
      el.style[key] = ''
    }
  }
  //删除
  for (let key in oldProps) {
    if (!props[key]) {
      el.removeAttribute(key)
    }
  }

  for (const key in props) {
    if (Object.hasOwnProperty.call(props, key)) {
      if (key == 'style') {
        for (let styleName in props['style']) {
          el.style[styleName] = props['style'][styleName]
        }
      } else {
        const value = props[key]
        el.setAttribute(key, value)
      }
    }
  }
}
