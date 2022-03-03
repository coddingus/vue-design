# 响应系统的作用与实现
响应式是 Vue.js 的重要组成部分
## 响应式数据与副作用函数
副作用就是会产生副作用的函数（就是一个函数的执行会对外部产生影响），如下面代码所示
```js
function effect() {
    document.body.innerText = 'hello vue3'
}
```
副作用很容易产生，例如一个函数修改了全局变量等

下面再来说下什么是响应式数据
```js
const obj = { text: 'hello world' }
function effect() {
    document.body.innerText = obj.text
}
```
例如我修改 obj.text 值，我们希望 effect 函数重新执行。如果实现了这个效果，那么 obj 就是一个响应式数据
```js
obj.text = 'hello vue3'
```
很明显，上面的代码做不到这一点，因为 obj 是一个普通对象，修改值时不会有其他反应

## 响应式数据的基本实现
怎么才能使上面的 obj 变成响应式数据呢？我们能发现两个线索
* 当副作用函数执行时，会触发字段 obj.text 的读取操作
* 当修改 obj.text 的值时，会触发 obj.text 的设置操作

那么如果我们我在读取和设置的时候进行拦截不就可以了吗

接下来我们就使用 [Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 来实现对 obj 属性的拦截。具体代码如下：
```js
const data = {
    text: 'hello world'
}
function effect() {
    document.body.innerText = obj.text
}

const bucket = new Set()
const obj = new Proxy(data, {
    // 读取操作拦截
    get(target, key) {
        bucket.add(effect)
        return target[key]
    },
    // 设置操作拦截
    set(target, key, newVal) {
        target[key] = newVal
        bucket.forEach(fn => fn())
        return true
    }
})
```
使用代码测试下
```js
effect()
setTimeout(() => {
    obj.text = 'hello vue3'
}, 1000)
```
在浏览器运行，我们就会看到 1 秒后文字发生了改变，达到了我们想要的效果

但我们会发现，我们的拦截读取操作时，直接把副作用函数给写进去了，明显不够灵活。如果副作用函数能够自动添加进入就好了。比如我们修改函数名为 myEffect 甚至是匿名函数
## 设计一个完善的响应系统
为了解决上面的问题，我们首先需要一个用来注册副作用函数的机制
```js
// 用于存储被注册的全局副作用函数
let activeEffect

// 用于注册副作用函数
function effect(fn) {
    activeEffect = fn
    // 执行副作用函数
    activeEffect()
}
```
effect 函数调用时，会传递一个函数，这个函数可以为任意函数。当调用 effect 函数时，这个activeEffect 值就会赋值Wie当前的 effect 函数传递的函数并执行传递的函数。
```js
effect(() => {
    document.body.innerText = obj.text
})
```
当传递的这个函数执行时，如果读取了 obj 对象，那么它就会触发 get 拦截，我们在拦截过程中将 activeEffect 添加到 bucket 队列中就可以了
```js
const bucket = new Set()
const obj = new Proxy(data, {
    get(target, key) {
        if (activeEffect) {
            bucket.add(activeEffect)
        }
        return target[key]
    },
    set(target, key, newVal) {
        target[key] = newVal
        bucket.forEach(fn => fn())
        return true
    }
})
```