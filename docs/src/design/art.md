# 权衡的艺术
## 命令式和声明式
视图层框架通常分为命令式和声明式

### 命令式
命令式的一大特点就是**关注过程**。早年间流行的  [jQuery](https://jquery.com/) 就是典型的命令式框架

将下面这段话翻译成代码
*  `id` 为 `app` 的元素
* 把它的文本内容为 `hello world`
* 为其绑定点击事件
* 点击时弹出提示: `ok`

使用 `Jquery`  的对应代码
```js
$('#app')
    .text('hello world')
    .on(click, function () {
        alert('ok')
    })
```
下面使用原生的JavaScript代码实现同样的功能
```js
const el = document.querySelector('#app')
el.innerText = 'hello world'
el.addEventListener('click', function () {
    alert('ok')
})
```
我们可以看到，这两种方式的过程都没有什么区别，代码本身就是“做事的过程”

### 声明式
声明式框架更加**关注结果**

使用声明式实现上面的功能
```html
<div id="app" @click="alert('ok')">hello world</div>
```

上面的这种写法是基于 Vue 模板实现的。 Vue.js 帮我们封装了过程，它的内部是**命令式**的，但暴露给我们使用的是**声明式**的

## 性能与可维护性的权衡
命令式和生命式各有优点，在框架设计方面，则体现在性能与可维护性的权衡。 书中直接先给了个结论， **生命式代码性能不优于命令式代码的性能**

我们如果要修改div的内容为 `hello vue3`， 实现的代码很简单
```js
div.textContent = 'hello vue3'
```
有没有比这段代码更优的性能呢？ 答案是：没有。我们可以看到，命令式代码可以做到极致的性能优化，因为已经确定了哪里需要修改，直接修改就可以了

对于框架而言，为了实现最优性能，需要先寻找差异，并只更新变化的地方（比如我们使用的 Vue.js）,但是最后执行更新的肯定会执行上面的代码

声明式比命令式多了个**寻找差异的过程**，所以声明式代码在性能上肯定是无法超越命令式代码的
* 命令式：更新 DOM 性能
* 声明式：寻找差异性能 + 更新 DOM 性能

那么为什么还要使用声明式的设计方案呢？答案肯定是声明式代码的**可维护性强**。采用命令式代码时，我们需要维护整个过程，而声明式代码展示的就是我们想要的结果，我们不需要关心是怎么实现的。

例如我们要实现一个 DOM 元素，展示两秒后以移除元素。下面是命令式声明的写法
```js
setTimeout(() => {
    el.removeEventListener('click', fn)
    el.parentNode.removeChild(el)
}, 2000)
```
下面是使用声明式的代码
```js
setTimeout(() => {
    app.showEl = false
}, 2000)
```
我们可以看到，使用声明式我们不需要关注过程，vue 内部已经帮我们封装好了（比如移除 DOM 事件、移除 DOM）
## 虚拟DOM的性能到底如何
如果能够最小化的找出寻找差异的性能消耗，那么声明式代码的性能就可以无限接近命令式代码的性能

原生的 JavaScript 实际上指的是像 `document.createElement` 之类的DOM 操作方法，并不包含 `innerHTML`

`innerHTML` 和 `document.createElement` 有何差异呢?

下面是一段 html 字符串
```js
const html = `<div><span>...</span></div>`
```
给 DOM 元素添加 `innerHTML` 属性
```js
el.innerHTML = html
```
这段话看上去是不是很简单？ 然而，其实并不简单。为了渲染页面，需要把字符串解析成 DOM 树，这是一个 DOM 层面的运算。我们知道，设计 DOM 的运算要**远比** `JavaScript` 层面的计算性能差

虚拟 `DOM` 创建页面的性能，分为两步
1. 创建 `JavaScript`对象
2. 递归遍历这个对象并创建真实 `DOM` 元素

下面比较下虚拟 `DOM` 和 `innerHTML` 在创建页面时性能
|| 虚拟 DOM | innerHTML|
|--|--|--|
| 纯 `JavaScript` 运算 | 创建 `JavaScript`对象（VNode） | 渲染 `innerHTML` 字符串 |
| DOM 运算 | 创建所有 `DOM` 对象 | 新建所有 `DOM` 元素 |

从上面可以看到，两者的差距不大。虚拟 `DOM` 没有任何优势，那么我们先看看页面更新时的性能比较
|| 虚拟 DOM | innerHTML|
|--|--|--|
| 纯 `JavaScript` 运算 | 创建 新`JavaScript`对象（VNode） + 比较（Diff） | 渲染 `innerHTML` 字符串 |
| DOM 运算 | 更新必要 `DOM` | 删除所有 `DOM` 元素 <br> 新建所有的 `DOM` |
| 性能原因 | 与变化数量有关 | 与模板大小有关

我们可以看出，虚拟 `DOM` 多了个 Diff 过程的性能消耗，但它是 JavaScript 层面的运算，所以不会产生数量级的差异。在DOM方面的运算，虚拟 DOM 只会更新必要的 DOM 元素，优势就体现出来了

命令式声明虽然性能最优，但心智负担和可维护性较差， 我们思考下如何既做到声明式描述UI，又具备原生 JavaScript 的性能呢？

## 运行时和编译时
设计一个框架时，有三种选择
* 纯运行时
* 运行时 + 编译时
* 纯编译时

### 纯运行时
假设我们设计了一个框架，提供了一个 render 函数, 会根据改对象渲染成 DOM 元素
```js
const vdom = {
    tag: 'div',
    children: [{
        tag: 'span',
        children: 'hello world'
    }]
}
```
每个对象有两个属性，tag 代码标签， children 既可以是一个数组（代表子节点），也可以是一个字符串（代表文本）
```js
function render(vdom, root) {
    const el = document.createElement(vdom.tag)
    if (typeof vdom.children === 'string') {
        const text = document.createTextNode(vdom.children)
        el.appendChild(text)
    } else if (vdom.children) {
        vdom.children.forEach(child => render(child, el))
    }
    root.appendChild(el)
}
```
使用它
```js
const vdom = {
    tag: 'div',
    children: [{
        tag: 'span',
        children: 'hello world'
    }]
}
render(vdom, document.querySelector('#app'))
```
上面的代码提供的就是一个纯运行时。但这种写法它麻烦了，我们最好能提供 html 代码片段的写法。这就是我们说的 运行时 + 编译时

### 运行时 + 编译时

```html
<div><span>hello world</span></div>
```
为了能够将上面的代码编译成下面, 我们需要实现一个编译函数
```js
const vdom = {
    tag: 'div',
    children: [{
        tag: 'span',
        children: 'hello world'
    }]
}
```
使用时，只需要调用
```js
// 将html模板编译成对象
const obj = compiler(html)
render(obj, document.querySelector('#app'))
```
这样就变成了 运行时 + 编译时 ，不过上面的代码存在一定的性能开销，因为编译时代码执行后才开始编译。因此我们可以在构建的时候执行compiler编译好。等到运行时就不需要编译了

### 纯编译时
既然编译器可以吧html 字符串解析成数据对象，能不能直接编译成命令式代码呢？
```html
<div><span>hello world</span></div>
```
编译成
```js
const el = document.createElement('div')
const span = document.createElement('span')
span.innerText = 'hello world'
el.appendChild(span)
document.querySelector('#app').appendChild(el)
```
 这样就变成了纯编译时的框架，不支持任何运行时的内容，用户的代码只有编译后才能运行。这种性能会比较好，但确实了灵活性
[Svelte](https://www.sveltejs.cn) 就是纯编译时的框架，但是它的真实性能可能达不到理论高度
