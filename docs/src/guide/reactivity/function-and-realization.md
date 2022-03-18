---
outline: deep
---
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
effect 是可以发生嵌套的，例如
```js
effect(function effectFn1() {
    /*... */
    effect(function effectFn2() {
        /*... */
    })
})
```
什么场景会发生 effect 嵌套呢？实际上 Vue.js 的渲染函数就是在 effect 中执行的
```js
const Foo = {
    render() {
        return /* ... */
    }
}
```
在一个 effect 函数中执行 Foo 组件的渲染函数
```js
effect(() => {
    Foo.render()
})
```
当组件发生嵌套时
```js
const Bar = {
    render() {
        return /* .... */
    }
}

const Foo = {
    render() {
        return <Bar/>
    }
}
```
此时将相当于
```js
effect(() => {
    // 嵌套
    effect(() => {
        Bar.render()
    })
})
```
所以 effect 函数应该设计成可嵌套的

```js
const data = {
    foo: 'foo',
    bar: 'bar'
}
const obj = new Proxy(data, {/*...*/})
effect(function effectFn1() {
    console.log('effectFn1 执行')
    effect(function effectFn2() {
        console.log('effectFn2 执行')
        document.querySelector('#bar').innerHTML =  obj.bar
    })
    document.querySelector('#foo').innerHTML = obj.foo
})
```
理想情况下，我们希望的副作用函数与对象属性间的联系
```js
data
  └── foo
       └──  effectFn1
  └── bar
       └──  effectFn2
```
当修改 obj.bar 时，会打印：
```
effectFn2 执行
```
很明显，不符合我们的预期，问题就出在 effect 函数 和 activeEffect 上，当我们使用 activeEffect 来存储副作用函数时，意味着同时只能有一个副作用函数，当副作用嵌套时，内层副作用函数就会覆盖外层 activeEffect 的值
```js
let activeEffect
function effect(fn) {

    function effectFn() {
        activeEffect = effectFn
        cleanup(effectFn)
        fn()
    }
    effectFn.deps = []
    effectFn()
}
```
为了解决这个问题，我们需要一个副作用函数栈，当副作用函数执行时，就会将 activeEffect 压入栈中，执行完毕后，在把 activeEffect 从栈中弹出

![](/04/effect-stack.png)

## 避免无限递归循环
当我们执行下面代码时:
```js
effect(() => {
    obj.foo++
})
```
控制台会抛出异常
```
Uncaught RangeError: Maximum call stack size exceeded
```
上面的代码中我们既会读取 foo 的值，也会设置 foo 的值
1. 执行副作用函数，首先读取 foo 的值，会触发 track 操作
2. 设置 foo 的值，会触发 trigger 操作
3. 这时该副作用函数还没有执行完毕， trigger 函数中执行过程中会再次触发执行副作用函数。
4. 执行副作用函数又回到了第 1 步，导致无限调用自己

对此，我们可以对 trigger 函数增加守卫条件： 如果 trigger 函数触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行该副作用函数
```js
function trigger(target, key) {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const deps = depsMap.get(key)
    const effectsToRun = new Set()
    // 遍历往 effectsToRun 上添加副作用函数
    deps && deps.forEach(effectFn => {
        // 如果当前执行的副作用函数 activeEffect 与当前
        // 遍历到的副作用函数effectFn 相同，就不添加
        if (activeEffect !== effectFn) {
            effectsToRun.add(effectFn)
        }
    })
    effectsToRun.forEach(effectFn => effectFn())
}
```
这样就解决了无限递归循环的问题
## 调度执行
可调度性是响应式系统的非常重要的一个特性。
:::tip 什么是可调度
就是当 trigger 动作触发副作用函数执行时，有能力决定副作用函数的时机、次数以及方式。
:::
为了调用方便，我们把代理对象给封装到一个函数中
```js
function proxy(data) {
    return new Proxy(data, {
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
}
```
看下面代码
```js
const data = {
    foo: 1
}
const obj = proxy(data)
effect(() => {
    console.log(obj.foo)
})
obj.foo++
console.log('结束啦')
```
执行结果是
```
1
2
结束啦
```
假设需求有变，输出的顺序需要调整为
```
1
结束啦
2
```

我们可能会修改代码的顺序，但是有什么办法可以不修改代码就能拿实现上面的需求呢？这时就需要我们设计的响应式系统支持可调度

我们可以为我们的 effect 函数设计一个选项参数 options ，允许用户指定调度器
```js
effect(
    () => {
        console.log(obj.foo)
    },
    // options
    {
        // 调度器 scheduler 是一个函数
        scheduler(fn) {

        }
    }
)
```
同时，effect 函数需要支持第二个参数的传递，并将 options 选项挂载到副作用函数 effetcFn
```js
let activeEffect
const effectStack = []
function effect(fn, options = {}) {
    function effectFn() {
        cleanup(effectFn)
        activeEffect = effectFn
        effectStack.push(effectFn)
        fn()
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
    }
    // 将 options 挂载到 effectFn 上
    effectFn.options = options
    effectFn.deps = []
    effectFn()
}
```
我们在trigger 函数中执行副作用函数时，就可以拿到 options.scheduler 选项
```js
function trigger(target, key) {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const deps = depsMap.get(key)
    const effectsToRun = new Set()
    deps && deps.forEach(effectFn => {
        if (activeEffect !== effectFn) {
            effectsToRun.add(effectFn)
        }
    })
    effectsToRun.forEach(effectFn => {
        // 存在调度器，就调用调度器，并把副作用函数作为参数传递
        // 否则，就直接执行副作用函数
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })
}
```
我们再来实现之前的需求
```js
const data = {
    foo: 1
}
const obj = proxy(data)
effect(
    () => {
        console.log(obj.foo)
    },
    // options
    {
        // 调度器 scheduler 是一个函数
        scheduler(fn) {
            setTimeout(fn)
        }
    }
)
obj.foo++
console.log('结束啦')
```
执行后
```
1
结束啦
2
```
同样，通过调度器还可以控制它的执行次数，例如下面代码
```js
const data = {
    foo: 1
}
const obj = proxy(data)
effect(
    () => {
        console.log(obj.foo)
    }
)
obj.foo++
obj.foo++
```
如果我们只关心结果，不关心过程，我们期望打印结果为
```
1
3
```
我们自己设计一个任务队列函数
```js
const jobQueue = new Set()
const p = Promise.resolve()
let isFlushing = false
function flushJob() {
    if (isFlushing) return
    isFlushing = true
    p.then(() => {
        jobQueue.forEach(job => {
            job()
        })
    }).finally(() => {
        {
            isFlushing = false
        }
    })
}
const data = {
    foo: 1
}
const obj = proxy(data)
effect(
    () => {
        console.log(obj.foo)
    },
    {
        scheduler(effectFn){
            jobQueue.add(effectFn)
            flushJob()
        }
    }
)
obj.foo++
obj.foo++
```
当我们修改 foo 的值时
* 会触发 scheduler 函数， 会将副作用函数添加到任务队列 flushJob 上，最终会遍历执行 flushJob 上的副作用函数
* 再次修改 foo 的值时，调用 flushJob 时，isFlushing 为 true，所以不会触发执行副作用函数
* 所以 flushJob 上值只存在一个副作用函数
* 由于 flushJob 的执行是异步的，所以，在执行副作用时， foo 的值就已经是 3 了

所以控制台会打印
```
1
3
```
## 计算属性 computed 与 lazy
在之前我们设计的 effect 函数，调用effect 函数便会执行我们传递的副作用函数
```js
effect(() => {
    console.log(obj.foo)
})
```
在有些场景下，我们不希望在调用 effect 函数时执行传递的副作用函数，而是在需要它执行的时候再执行，这就是懒执行的 effect 。例如我们希望我们指定 options.lazy 为 true 时需要懒执行的 effect
```js
effect(() => {
    console.log(obj.foo)
}, {
    lazy: true
})
```
下面修改 effect 函数
```js
let activeEffect
const effectStack = []
function effect(fn, options = {}) {
    function effectFn() {
        cleanup(effectFn)
        activeEffect = effectFn
        effectStack.push(effectFn)
        fn()
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
    }
    effectFn.options = options
    effectFn.deps = []
    // 非lazy才执行副作用函数
    if (!options.lazy) {
        effectFn()
    }
    return effectFn
}
```
这样就实现手动调用 effect 函数了
```js
const effectFn = effect(() => {
    console.log(obj.foo)
}, {
    lazy: true
})

setTimeout(() => {
    effectFn()
}, 1000)
```
但是，如果仅仅可以手动执行 effect 函数，意义不大，如果我们传递给 effect 函数看做一个 getter , 那么 getter 函数可以返回任何值
```js
const data = {
    foo: 1
}
const obj = proxy(data)
const effectFn = effect(() => {
    console.log(obj.foo)
}, {
    lazy: true
})


setTimeout(() => {
    // value 就是getter 的返回值
    const value = effectFn()
    console.log(value)
}, 1000)
```
我们需要对 effect 进行修改
```diff
 let activeEffect
 const effectStack = []
 function effect(fn, options = {}) {
     function effectFn() {
         cleanup(effectFn)
         activeEffect = effectFn
         effectStack.push(effectFn)
+        const res = fn()
         effectStack.pop()
         activeEffect = effectStack[effectStack.length - 1]
+        // 返回副作用函数执行的结果
+        return res
     }
     effectFn.options = options
     effectFn.deps = []
     if (!options.lazy) {
         effectFn()
     }
     return effectFn
 }
```
这样我们就拿到了传递给 effect 的富作用函数的返回值了

执行下面代码
```js
const data = {
    a: 1,
    b: 2
}
const obj = proxy(data)
const effectFn = effect(() => {
    return {
        value: obj.a + obj.b
    }
}, {
    lazy: true
})


setTimeout(() => {
    // value 就是getter 的返回值
    const value = effectFn()
    console.log(value)
}, 1000)
```
如果我们将上面代码，稍加改造，就成了我们熟悉使用的计算属性 computed 了
```js
function computed(getter){
    const effectFn = effect(getter, {
        lazy: true
    })
    const obj = {
        get vale(){
            return effectFn()
        }
    }
    return obj
}
```
运行下面代码
```js
const data = {
    a: 1,
    b: 2
}
const obj = proxy(data)
const data = {
    a: 1,
    b: 2
}
const obj = proxy(data)
const count = computed(() =>{
    return obj.a + obj.b
})
console.log(count.value) // 3
```
就这样，计算属性的功能就实现了。不过现在计算属性的值只做到了懒加载（当调用 count.value 的是时候才会去执行计算），并没有做到对值进行缓存。我们多次进行访问，它就会进行多次计算
```js
console.log(count.value) // 3
console.log(count.value) // 3
console.log(count.value) // 3
```
下面对 computed 函数进行修改
```js
function computed(getter) {
    const effectFn = effect(getter, {
        lazy: true
    })
    let value
    let dirty = true
    const obj = {
        get value() {
            if(dirty){
                value = effectFn()
                dirty = false
            }
            return value
        }
    }
    return obj
}
```
修改完后，我们发现再次修改 obj.foo 或 obj.bar 的值时，返回值没有发生变化
```js
console.log(count.value) // 3
obj.a++
console.log(count.value)// 3
```
这是因为第一次访问 count.value 的值后，dirty 变成了 false ，只有当 dirty 为 true 时，才会重新计算

我们需要，但我们修改 obj.foo 或 obj.bar 的值发生变化时，dirty 重新变为 true
```js
function computed(getter) {
    let value
    let dirty = true
    const effectFn = effect(getter, {
        lazy: true,
        scheduler(fn) {
            dirty = true
        }
    })

    const obj = {
        get value() {
            if (dirty) {
                value = effectFn()
                dirty = false
            }
            return value
        }
    }
    return obj
}
```
这样，就实现了我们想要的效果，但还存在一个缺陷，看下面代码
```js
const data = {
    a: 1,
    b: 2
}
const obj = proxy(data)
    
const count = computed(() => {
    return obj.a + obj.b
})
effect(() => {
    console.log(count.value)
})
obj.a = 10
```
上面代码我们期望的执行结果是
```
3
12
```
但实际执行结果确实
```
12
```
很明显，当我们修改 obj.a 的值时，effect 函数并没有重新执行。
```js
effect(() => {
    console.log(count.value)
})
```
分析原因，上面代码相当于是一个 effect 函数嵌套。计算属性 count 拥有它自己的 effect ，并且是懒执行的，只有读取计算属性的值时才会执行。在获取 count.value 的时候，会触发 computed 内部的 effectFn，而 getter 只会收集计算属性内部的依赖收集。执行完毕后，并没有把外层的 effct 收集进来。所以当 obj.a 修改时，并不会触发外层 effect 函数的执行

解决办法很简单，只需要在访问计算属性的时候，把外层的副作用函数给添加到依赖中，当修改计算属性内部的依赖（如上面的 obj.a 、 obj.b）时，触发副作用函数的执行即可
```js
function computed(getter) {
    let value
    let dirty = true
    const effectFn = effect(getter, {
        lazy: true,
        scheduler(fn) {
            dirty = true
            // 计算属性值发生改变，触发变化，执行外层的副作用函数
            trigger(obj, 'value')
        }
    })

    const obj = {
        get value() {
            if (dirty) {
                value = effectFn()
                dirty = false
            }
            // 访问时，收集外层的副作用函数
            track(obj, 'value')
            return value
        }
    }
    return obj
}
```
它会建立这样的联系
```
computed
  └── value
       └── effectFn
```
## watch 
### watch的实现原理
watch 就是监听一个响应式数据的变化，当数据发生变化时，通知并执行相应的回调
```js
watch(obj, () => {
    console.log('obj 发生变化了')
})
obj.foo++
```
watch 方法本质上就是利用了 effect 以及 options.scheduler
```js
effect(() => {
    console.log(obj.foo)
}, {
    scheduler() {
        
    }
})
```
下面实现一个最简单的 watch 方法
```js
function watch(obj, cb) {
    effect(() => obj.foo, {
        scheduler() {
            cb()
        }
    })
}
```
使用上面实现的 watch 函数
```js
const data = {
    foo: 1
}
const obj = proxy(data)
function watch(obj, cb) {
    effect(() => obj.foo, {
        scheduler() {
            cb()
        }
    })
}
watch(obj, () => {
    console.log('obj 发生了变化')
})
setTimeout(() => {
    obj.foo = 10
}, 1000)
```
运行上面代码，可以正常工作，但我们在watch 时，写死了 obj.foo 的读取操作，所以，现在还无法监听到 obj 上其他属性的变化

为了监听到 obj 所有属性的变化，我们需要封装一个通用的方法，读取 obj 上所有的属性，这样就能够监听到所有属性的变化了
```js
function traverse(value, seen = new Set()){
    // seen.has(value)) 的作用是判断是否读取过了，避免产生死循环
    if(typeof value !== 'object' || value === null && seen.has(value)) return
    seen.add(value)
    // 读取每个属性，递归调用 traverse 
    for(const k in value){
        traverse(value[k], seen)
    }
    return value
}
function watch(obj, cb) {
    effect(() => traverse(obj), {
        scheduler() {
            cb()
        }
    })
}
```
watch 方法除了能够观测响应式数据，还可以接收一个 getter 函数，在 getter 函数内部指定依赖项
```js
watch(() => obj.foo, () => {
    console.log('obj.foo 的值发生了变化')
})
```
实现代码：
```js
function watch(source, cb) {
    let getter
    // 如果是函数，说明用户传递的是 getter  有点类似我们第一次实现的 watch 方法
    if (typeof source === 'function') {
        getter = source
    } else {
        getter = () => traverse(source)
    }
    effect(getter, {
        scheduler() {
            cb()
        }
    })
}
```
在 Vue 中，使用 watch 方法还可以获取到对应属性的新值和旧值
```js
watch(() => obj.foo, (newVal, oldVal) => {
    console.log(newVal, oldVal)
})
```
实现代码很简单
```js
function watch(source, cb) {
    let getter
    if (typeof source === 'function') {
        getter = source
    } else {
        getter = () => traverse(source)
    }
    let oldVal
    let effectFn = effect(getter, {
        lazy: true,
        scheduler() {
            let newVal = effectFn()
            cb(oldVal, newVal)
            oldVal = newVal
        }
    })
    //  第一次执行， oldVal就是副作用函数的返回值
    oldVal = effectFn()
}
```
这里个人认为加 lazy 的目的是为了让 getter 延迟执行，如果不加，虽然不会影响结果，但是 effectFn 会执行多次
### 立即执行的 watch 与回调执行时机
watch 函数的两个特性
* 立即执行的回调函数
* 回调函数的执行时机

立即执行的回调函数，默认情况下，一个回到函数只有在响应式的数据发生变化时才执行
```js
// 只有 obj 发生变化时才会执行回调函数
watch(() => obj.foo, () => {
    console.log('obj 变化了')
})
```
在 Vue.js 中，可以通过选项 immediate 来指定回调函数是否需要立即执行
```js
watch(() => obj.foo, () => {
    console.log('obj 变化了')
}, {
    immediate: true
})
```
当 immediate 选项为 true 时，回调函数就会在 watch 创建时立即执行一次，跟后续执行没有区别。我们将 scheduler 调度函数封装起来， 当我们传递 immediate 选项时，直接调用它就行了。
```js
function watch(source, cb, options) {
    let getter
    let oldVal
    if (typeof source === 'function') {
        getter = source
    } else {
        getter = () => traverse(source)
    }
    function job() {
        let newVal = effectFn()
        cb(oldVal, newVal)
        oldVal = newVal
    }
    let effectFn = effect(getter, {
        lazy: true,
        scheduler: job
    })
    if (options.immediate) {
        job()
    } else {
        oldVal = effectFn()
    }
}
```
执行代码后，第一次执行回调的 oldValue 是 undefined 因为第一次执行没有所谓的旧值，所以这符合我们的预期

Vue 中还可以指定其他选项来指定回调的执行时机，例如在 Vue 中使用 flush 选项
```js
watch(() => obj.foo, (newVal, old) => {
    console.log('obj.foo 的值发生了变化')
    console.log(newVal, old)
}, {
    flush: 'pre' // 还可指定为 'post' 和 'sync'
})
```
flush 是用来指定调度函数的执行时机。 flush 的值为 'post' 时，代表调度函数需要将副作用函数放到一个微任务队列中
```js
function watch(source, cb, options) {
    let getter
    let oldVal
    if (typeof source === 'function') {
        getter = source
    } else {
        getter = () => traverse(source)
    }
    function job() {
        let newVal = effectFn()
        cb(oldVal, newVal)
        oldVal = newVal
    }
    let effectFn = effect(getter, {
        lazy: true,
        scheduler() {
            // flush 值为 post ，将调度函数放到异步队列中
            if (options.flush === 'post') {
                const p = Promise.then()
                p.then(job)
            } else {
                job()
            }
        }
    })
    if (options.immediate) {
        job()
    } else {
        oldVal = effectFn()
    }
}
```
如上面代码所示， 修改了 scheduler 的实现方式，如果指定 flush 值为 post ，将将 job 函数放到异步队列中，从而实现延迟执行；否则直接执行 job 函数， 这本质上就相当于是 sync 的实现机制（同步）。对于 flush 的值为 'pre'，因为涉及组件的更新机制，这里现在还没办法模拟
### 过期的副作用
在工作可能会遇到这样的场景
```js
watch(obj, async () => {
    const res = await fetch('xxx')
    finalData = res
})
```
当我们修改 obj.a 的值时，会发送一次请求，再修改 obj.b  的值时，会再发送一次请求，但是我们先发送的请求可能会后接收到。例如修改obj.b 发送的请求先返回，这就导致 obj.a 会返回的数据会覆盖掉 obj.b 返回的数据

在 Vue.js 中， watch 函数可以指定接收第三个参数 onInvalidate ,它是一个函数，类似于监听器，我们可以使用 onInvalidate 函数注册一个回调，这个回调函数就会在当前副作用函数过期时执行
```js
let finaldata
watch(obj, async (newValue, oldValue, onInvalidate) => {
    let expired = false
    onInvalidate(() => {
        expired = true
    })
    const res = await getData(newValue.count)
    if (!expired) {
        finaldata = res
    }
    console.log(finaldate)
})
```
实现思路就是我们用户调用 onInvalidate 后，我们将 onInvalidate 的回调给保存起来，当数据再次发生的改变时，就会调用该回调函数（即执行过期回调）
```js
function watch(source, cb, options = {}) {
    let getter
    let oldVal
    if (typeof source === 'function') {
        getter = source
    } else {
        getter = () => traverse(source)
    }
    // 用来保存调用 onInvalidate 传递的回调 即过期回调
    let cleanup
    function onInvalidate(fn) {
        cleanup = fn
    }
    function job() {
        let newVal = effectFn()

        // 调用上次传递的回调即过期回调
        if(cleanup){
            cleanup()
        }
        cb(oldVal, newVal, onInvalidate)
        oldVal = newVal
    }
    let effectFn = effect(getter, {
        lazy: true,
        scheduler() {
            if (options.flush === 'post') {
                const p = Promise.then()
                p.then(job)
            } else {
                job()
            }
        }
    })
    if (options.immediate) {
        job()
    } else {
        oldVal = effectFn()
    }
}
```