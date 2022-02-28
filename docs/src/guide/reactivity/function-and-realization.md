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
然后我们再对上面代码进行测试，当我们访问一个不存在的属性时
```js
effect(() => {
    console.log('effect run')
    document.body.innerText = obj.text
})
setTimeout(() => {
    obj.notExist = 'hello vue3'
})
```
运行上面代码时，我们会发现控制台打印了两次 `effect run` ，而我们 obj.text 的值并未发生修改，而我们是希望仅当 text 值发生改变是，才会重新触发匿名函数的执行。导致该问题的原因是没有在副作用函数和被操作的字段之间建立明确的联系，解决方法很简单，只需要在副作用函数与被操作的字段建立联系即可。

我们再来看下面代码
```js
effect(function effectFn() {
    document.body.innerText = obj.text
})
```
代码中存在三个角色
* 被操作的代理对象 obj
* 被操作的字段 text
* 使用 effect 函数注册的副作用函数 effectFn

如果用 target 来表示代理对象所代理的原始值，用 key 字段来表示被操作的字段名，用 effectFn 来表示被注册的副作用函数，那么可以为这三个角色建立如下关系
```
target
  └── key
       └── effectFn
```
有两个副作用函数读取同一个对象
```js
effect(function effectFn1() {
    document.body.innerText = obj.text
})
effect(function effectFn2() {
    console.log(obj.text)
})
```
那么对应关系就是:
```
target
  └── text
       ├── effectFn1
       └── effectFn2
```
一个副作用函数读取了同一对象上的两个属性
```js
effect(function effectFn() {
    console.log(obj.text1)
    console.log(obj.text2)
})
```
那么对应关系就是:
```
target
  └── text1
      └──  effectFn
  └── text2
      └──  effectFn
```
实现思路如下
* 首先使用 bucket 来存储副作用函数， bucket 使用 WeakMap
* 当触发代理对象的 get 方法时，我们可以获取到 target 、key
  * 将 target 作为 key 存储到 bucket 上, 值为 depsMap，数据结构是 Map 
  * 将 key 作为 key ，deps 为值depsMap 中
  * 将副作用函数添加到 deps 中 

![](/04/reactivity.png)


实现代码如下：
```js
const bucket = new WeakMap()
const obj = new Proxy(data, {
    get(target, key) {
        if (activeEffect) {
            let depsMap = bucket.get(target)
            if (!depsMap) {
                bucket.set(target, (depsMap = new Map()))
            }
            let deps = depsMap.get(key)
            if (!deps) {
                depsMap.set(key, (deps = new Set()))
            }
            deps.add(activeEffect)
        }
        return target[key]
    },
    set(target, key, newVal) {
        target[key] = newVal
        const depsMap = bucket.get(target)
        if (!depsMap) return
        const deps = depsMap.get(key)
        deps && deps.forEach(fn => fn())
        return true
    }
})
```
接下来，再对上面代码进行封装。我们把拦截的逻辑都写在了 get 和 set 方法中，但更好的做法是吧这部分逻辑封装到一个函数中。
```js
 // get 拦截函数内调用 track 函数触发追踪变化
function track(target, key) {
    if (!activeEffect) return
    let depsMap = bucket.get(target)
    if (!depsMap) {
        bucket.set(target, (depsMap = new Map()))
    }
    let deps = depsMap.get(key)
    if (!deps) {
        depsMap.set(key, (deps = new Set()))
    }
    deps.add(activeEffect)
}

// set 拦截函数内调用 trigger 函数触发变化
function trigger(target, key) {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const deps = depsMap.get(key)
    deps && deps.forEach(fn => fn())
}

const obj = new Proxy(data, {
    get(target, key) {
        track(target, key)
        return target[key]
    },
    set(target, key, newVal) {
        target[key] = newVal
        trigger(target, key)
        return true
    }
})
```
这样我们就将追踪变化函数封装到 track 中，触发逻辑封装到 trigger 函数中

接下来说下为什么 bucket 要使用 [WeakMap](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) ，先看下面代码
```js
const map = new Map()
const weakmap = new WeakMap()
function fn() {
    const foo = {name: 'foo'}
    const bar = {name: 'bar'}
    map.set(foo, 1)
    weakmap.set(bar, 2)
}
fn()
console.log(map)
console.log(weakmap)
```
当函数 fn 执行完毕后，对于 foo 对象来说，它依然作为 map 的 key 被引用着，因此垃圾回收器不会把它从内存中移除，我们依然可以在控制台看到 map 中存在 key 为 foo 对象的属性；由于 WeakMap 是弱类型引用，他不会影响垃圾回收器的工作，所以一旦函数 fn 执行完毕，就会把 bar 对象从内存中移除，并且 weakmap 中也不会存在 bar 对象这个属性 
## 分支切换与 cleanup
### 分支切换
首先需要了解下什么是分支切换
```js
const data = {
    ok: true,
    text: 'hello world'
}
const obj = new Proxy(data, {/*...*/})

effect(() => {
    console.log('effect')
    document.body.innerHTML = obj.ok ? obj.text: 'not'
})
```
副作用函数内部存在一个三元表达式，根据 obj.ok 值的不同会执行不同的代码分支。当 obj.ok 的值发生改变时，代码执行的分支就会发生改变，这就是所谓的分支切换。
### 建立关联
分支切换会产生遗留的副作用函数。执行上面的代码，obj.ok 为 true，此时就会触发 obj.ok 和 obj.text 这两个属性的读取操作，此时的副作用函数 effectFn 与响应式数据的关系如下
```
data
  └── ok
      └──  effectFn
  └── text
      └──  effectFn
```
当修改 obj.ok 的值为 false 时，会触发副作用函数重新执行，由于此时 obj.text 不会被读取，只会触发 obj.ok 的读取操作，所以理想情况下此时 effectFn 与响应式的数据如下
```
data
  └── ok
      └──  effectFn
```
很明显，按照之前写的，还实现不了这一点。

解决这个问题思路也很简单，我们每次执行副作用函数时，删除掉之前的依赖关系，重新建立依赖关系就可以了。

首先，要将一个副作用函数从所有与之关联的依赖集合中移除，就需要明确知道哪些依赖集合中是否包含它，所以需要副作用函数与依赖集合间建立联系
```js
let activeEffect
// 将副作用函数添加一个 deps 数组，用来存储与该副作用函数相关的依赖集合
function effect(fn) {
    function effectFn() {
        activeEffect = effectFn
        fn()
    }
    effectFn.deps = []
    effectFn()
}
```
在 track 函数执行时，可以把当前依赖集合添加到当前副作用函数的 deps 数组中，这样联系就建立起来了
```diff
function track(target, key) {
    if (!activeEffect) return
    let depsMap = bucket.get(target)
    if (!depsMap) {
        bucket.set(target, (depsMap = new Map()))
    }
    let deps = depsMap.get(key)
    if (!deps) {
        depsMap.set(key, (deps = new Set()))
    }
    // 把当前激活的副作用函数添加到依赖集合 deps 中
    deps.add(activeEffect)
+    // 将当前的依赖集合添加到 deps数组中
+    activeEffect.deps.push(deps)
}
```
### cleanup
建立联系后，每次执行副作用函数时， 根据副作用函数的 deps 数组中删除掉所有相关联的集合。

我们将清除工作放到 cleanup 函数中
```diff
let activeEffect
// 将副作用函数添加一个 deps 数组，用来存储与该副作用函数相关的依赖集合
function effect(fn) {
    function effectFn() {
        activeEffect = effectFn
        // 清除工作
+        cleanup(activeEffect)
        fn()
    }
    effectFn.deps = []
    effectFn()
}
```
下面是 cleanup 函数的实现
```js
function cleanup(effectFn){
    for(let i = 0; i < effectFn.deps.length; i++){
        const deps = effectFn.deps[i]
        // 把 effectFn 从依赖集合中删除
        deps.delete(effectFn)
    }
    // 重置数组
    effectFn.deps.length = 0
}
```

然后执行代码，我们会发现，会发现会导致无限循环，会出现下面报错信息
```
Uncaught RangeError: Maximum call stack size exceeded
```
出现的原因就在我们写的 trigger 函数中
```js
function trigger(target, key) {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const deps = depsMap.get(key)
    // 问题出现在这里
    deps && deps.forEach(fn => fn())
}
```
我们遍历 deps 集合，会执行下面几个步骤
1. 执行集合中存储的副作用函数 effectFn
2. 副作用函数执行过程中，会调用 cleanup 清除相关依赖
3. 然后在调用我们传入的副作用函数 fn
4. 执行我们传入的副作用函数 fn 时，会导致重新被收集到依赖中

实际上执行过程就跟下面的类似
```js
const set = new Set([1])
set.forEach(() => {
    set.delete(1)
    set.add(1)
    console.log('遍历中')
}) 
```
执行代码后，我们发现一直无限打印 '遍历中'

::: tip 语言规范说明
在调用 forEach 遍历 Set 集合时，如果一个值已经被访问过了，但该值被删除并重新添加到集合中，如果此时遍历没有结束，那么该值会被重新访问
:::

解决办法很简单，可以另外构造一个 Set 集合并遍历它
```js
function trigger(target, key) {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const deps = depsMap.get(key)
    const effectsToRun = new Set(deps)
    effectsToRun && effectsToRun.forEach(fn => fn())
}
```
执行过程中，依赖删除和增加是不会影响到 effectsToRun 的，所以就不会出现无限循环了
## 嵌套的 effect 与 effect 栈