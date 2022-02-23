# Vue.js 3 的设计思路
::: tip 提示
框架设计讲究全局把控，一个项目就算再大，也是存在一条核心思路，并围绕它展开。
:::
## 声明式地描述 UI
Vue.js 3是一个声明式 UI 框架，意思就是用户在开发页面时是声明式地描述 UI 的。

设计一个声明式的 UI 框架，我该怎么设计呢？为了搞清这个问题，我们需要了解编写前端页面都涉及哪些内容。具体如下
|涉及内容|举例|Vue.js 3 的解决方案|
|-|-|-|
| `DOM` 元素 | 是 `div` 、`a` 还是 `span` 标签等 | 使用与 `HTML` 标签一致的的方式来描述 `DOM` 元素。例如描述一个 `div` 使用 `<div></div>`|
| 属性 | `a`标签的属性 `href`、`id`、`class` 等 | 使用与 `HTML` 标签一致的方式来描述 DOM 属性|
| 事件 | `click` 、`touchmove` 等 | 使用 `@` 或  `v-on` 来描述事件|
|元素的层级结构 |  `DOM` 树的层级结构，既有子节点，又有父节点  | 与 `HTML` 标签一致的方式来描述层级结构。例如 `span` 标签既有子节点又有父节点 <br>  `<div><span>aaa<span></div>`|

我们可以看到，哪怕是事件，都有与之对应的描述，用户不需要手写任何代码，这就是所谓的声明式地描述 UI

处理使用模板来声明式的描述 UI 之外，我们还可以使用 JavaScript 对象来描述
```js
const title = {
    tag: 'div',
    props: {
        onClick: handler
    },
    children: [
        {
            tag: 'span'
        }
    ]
}
```
对应到 Vue.js 模板的就是
```html
<div @click="handler"><span></span></div>
```
使用模板与 JavaScript 对象有什么不同呢？因为使用 JavaScript 对象更加灵活。

假设我们使用 h1~h6 这几个标签，如果使用 JavaScript 对象来描述，只需要一个变量来代表 h 标签即可
```js
let level = 3
const title = {
    tag: `h${level}`
}
```
如果我们使用模板，就不得不枚举
```html
<h1 v-if="level === 1"></h1>
<h2 v-else-if="level === 2"></h2>
<h3 v-else-if="level === 3"></h3>
<h4 v-else-if="level === 4"></h4>
<h5 v-else-if="level === 5"></h5>
<h6 v-else-if="level === 6 "></h6>
```
通过对比，我们就会看到模板远没有 JavaScript 对象灵活。使用 JavaScript 对象描述 UI 的方式，就是我们经常说的**虚拟 DOM** 。

Vue.js 不仅提供了使用模板描述 UI ，还支持使用虚拟 DOM 描述 UI 。例如我们手写渲染韩式就是使用虚拟 DOM 来描述 UI 的
```js
import { h } from 'vue'

export default {
    render() {
        return h('h1', {
            onClick: handler
        })
    }
}
```
上面的代码不是 JavaScript 对象啊，它只是调用了 h 函数，传的参数也不像是 JavaScript 对象啊。其实 h 函数返回的就是一个对象，如果我们把 h 函数调用的代码改成 JavaScript 对象，就需要写更多的内容
```js
export default {
    render() {
        return {
            tag: 'h1',
            props: {
                onClick: handler
            }
        }
    }
}
```
h 函数只是辅助我们更方便我们创建虚拟 DOM 对象而已。

::: tip 什么是组件渲染函数
一个组件的内容是通过渲染函数来描述的，就是 render 函数， Vue.js 就是根据 render 函数的返回值拿到虚拟 DOM ，然后就可以把组件的内容渲染处理了
:::
## 初识渲染器
我们已经了解了什么是虚拟 DOM ,其实就是使用 JavaScript 对象来描述真实的 DOM 结构。那么虚拟 DOM 是怎么渲染到页面上呢？这就是接下来要讲的渲染器。

![](/public/03/render.png)

假设我们有如下虚拟 DOM
```js
const vnode = {
    tag: 'div',
    props: {
        onClick: () => alert('hello'),
        class: 'hello'
    },
    children: 'click me'
}
```
* tag 用来描述标签名称
* props 表示一个对象，用来描述对象的属性、事件等内容
* children 用来描述子节点

实际上我们可以设计虚拟 DOM ，例如用tagName 代替 tag，因为它本身就是一个 JavaScript 对象

接下来我们编写一个渲染器
```js
function render(vnode, container) {
    // 根据标签名创建对应的 DOM 
    const el = document.createElement(vnode.tag)
    // 遍历 props 属性，将属性、事件添加到 DOM 上
    for (const key in vnode.props) {
        const props = vnode.props
        // 以 on 开头说明是事件
        if (/^on/.test(key)) {
            el.addEventListener(key.substr(2).toLocaleLowerCase(), props[key])
        } else {
            // 设置 DOM 属性
            el.setAttribute(key, props[key])
        }
    }
    const children = vnode.children
    // children 是字符串，说明是文本节点
    if (typeof children === 'string') {
        el.appendChild(document.createTextNode(children))
    } else if (Array.isArray(children)) {
        // 存在子节点，挂载子节点
        children.forEach(child => render(child, el))
    }
    // 将 DOM 添加到容器下
    container.appendChild(el)
}
```
渲染器的作用不仅仅是创建节点，其精髓都在更新节点阶段。对于渲染器来说，如果内容更改，就应该是更新需要变更的内容，不需要重新走一遍渲染流程。

例如将上面的 vnode 做一些小更改
```diff
const vnode = {
    tag: 'div',
    props: {
        onClick: function() {
            alert('click')
        },
        class: 'hello'
    },
-    children: 'click me again'
+    children: 'click me'
}
```
这里我们只需要更新对应的文本内容就可以了
## 组件的本质
其实虚拟 DOM 除了能够描述真实 DOM 外，还可以描述组件。**组件就是一组 DOM 元素的封装**，这组 DOM 元素就是组件要渲染的内容。

因此，我们可以定义一个函数来代表组件，而函数的返回值就能代表组件渲染的内容：
```js
const myComponent = function () {
    return {
        tag: 'div',
        props: {
            onClick: function () {
                alert('click')
            },
            class: 'hello'
        },
        children: 'click me'
    }
}
```
我们可以看到，组件的返回值就是虚拟 DOM ，它代表组件要渲染的内容。搞清了组件的本质，我们再来用虚拟 DOM 来描述组件了。

我们可以用虚拟 DOM 对象中的 tag 属性来存储组件函数
```js
const vnode = {
    tag: MyComponent
}
```
下面来编写渲染函数。实现思路就是根据 tag 属性来判断是不是组件
* 如果 tag 是 string 类型，说明 tag 表示是标签名称，直接调用渲染函数就行
* 如果是 function 类型，说明是个组件，需要将这个函数返回的结果传递给render函数就可以了

为了区分，我们可以写两个函数，用来区分是组件还是普通元素。普通元素调用 `mountElement`，组件渲染调用 `mountComponent` 实现
```js
function render(vnode, container) {
    const tag = vnode.tag
    if (typeof tag === 'string') {
        mountElement(vnode, container)
    } else if (typeof tag === 'function') {
        mountComponent(vnode, container)
    }
}
```
将原来的 render 函数修改为 `mountElement` （表示普通元素渲染），组件渲染用新增 `mountComponent` 方法实现
```js
function mountElement(vnode, container) {
    // 根据标签名创建对应的 DOM 
    const el = document.createElement(vnode.tag)
    // 遍历 props 属性，将属性、事件添加到 DOM 上
    for (const key in vnode.props) {
        const props = vnode.props
        // 以 on 开头说明是事件
        if (/^on/.test(key)) {
            el.addEventListener(key.substr(2).toLocaleLowerCase(), props[key])
        } else {
            // 设置 DOM 属性
            el.setAttribute(key, props[key])
        }
    }
    const children = vnode.children
    // children 是字符串，说明是文本节点
    if (typeof children === 'string') {
        el.appendChild(document.createTextNode(children))
    } else if (Array.isArray(children)) {
        // 存在子节点，挂载子节点
        children.forEach(child => render(child, el))
    }
    // 将 DOM 添加到容器下
    container.appendChild(el)
}
```
组件渲染函数实现。实现很简单，就是获取组件返回的虚拟 DOM，直接再次调用 render 函数就行了
```js
function mountComponent(vnode, container) {
    const subtree = vnode.tag()
    render(subtree, container)
}
```
组件一定是函数吗？肯定不是，例如我想使用class、对象等来表示组件。
```js
// 对象的render函数代码要渲染的内容
const objComponent = {
    render() {
        return {
            tag: 'div',
            props: {
                onClick: function () {
                    alert('click')
                },
                class: 'hello'
            },
            children: 'objComponent'
        }
    }
}
class ClassComponent {
    // render函数代码要渲染的内容
    render() {
        return {
            tag: 'div',
            props: {
                onClick: function () {
                    alert('click')
                },
                class: 'hello'
            },
            children: 'classComponent'
        }
    }
}
```
```js
function mountComponent(vnode, container) {
    const tag = vnode.tag
    let subtree
    if (typeof tag === 'function') {
        // 类组件
        if (/^class/.test(tag.toString() )) {
            let cor = new tag()
            subtree = cor.render()
        } else {
            // 函数组件
            subtree = tag()
        }

    } else if (typeof tag === 'object') {
        // 对象组件
        subtree = tag.render()
    }
    render(subtree, container)
}
```
## 模板的工作原理
我们都了解到，手写虚拟 DOM 还是使用模板，都是声明式地描述 UI 框架。上面了解了虚拟 DOM 是如何转化成真实DOM 的，那么模板是怎么转化的呢？这就是框架的另外一个组成部分： **编译器**

编译器的作用就是将模板编译成渲染函数

```html
<div @click="handler">click me</div>
```
编译后：就会生成与之对应的渲染函数
```js
render() {
    return h('div', {
        onClick: handler
    }, 'click me')
}
```
我们开发中的 .vue 文件其实就是一个组件
```vue
<script>
export default {
    methods: {
        handler() {
            alert('ok')
        }
    }
}
</script>
<template>
    <div @click="handler">click me</div>
</template>
```
最终在浏览器运行的代码就是：
```js
export default {
    methods: {
        handler() {
            alert('ok')
        }
    },
    render() {
        return h('div', {
            onClick: handler
        }, 'click me')
    }
}
```
一个组件无论是模板还是渲染函数，最终都是通过渲染函数产生的，然后将渲染函数产生的虚拟 DOM 转化为真实 DOM 对象。
## Vue.js 是各个模块组成的有机整体
前面我们了解了渲染器和编译器之间的关系，所以这些模块之间是相互关联、相互制约的，共同构成了一个有机的整体

假设我们有下面模板
```html
<div id="foo" :class="cls"></div>
```
编译器编译后
```js
render() {
    // 为了更直观这里没有使用 h 函数，直接返回 h 函数生产的虚拟 DOM 对象
    return {
        tag: 'div',
        props: {
            id: 'foo',
            class: cls
        }
    }
}
```
上面代码中，我们知道 cls 是一个变量，它会发生变化，渲染器的作用之一就是寻找并只更新变化的内容，所以当 cls 变量发生变化时，渲染器会自动寻找变更点。对于渲染器来说，这个 “寻找” 需要花费一些力气，。对于编译器，它能识别出哪些是动态的，哪些是静态的，在生成代码的时候完全可以附带这些信息
```js
render() {
    // 为了更直观这里没有使用 h 函数，直接返回 h 函数生产的虚拟 DOM 对象
    return {
        tag: 'div',
        props: {
            id: 'foo',
            class: cls
        },
        patchFlags: 1
    }
}
```
这里 patchFlags 属性，它的值为 1 代码 “class 是动态的” 。对于渲染器来说，它就省去了寻找变更点的工作流，性能就提升了。

所以，编译器、渲染器都是 Vue.js 的一部分，共同构成一个有机整体，不同模块间的相互配合，进一步提升框架性能