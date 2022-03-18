---
outline: deep
---
# 非原始值的响应式方案
前面介绍了响应式数据的基本原理，这节把焦点放在响应式数据本身。实现响应式数据远比我们想象的难很多，不想我们前面讲的那样。比如如何拦截 for...in 循环？ track 函数如何追踪拦截 for...in 循环？ 类似的问题还有很多。除此之外，还应考虑如何对数组进行代理，Vue.js 还支持集合类型（如 Map 、WeakMap 、 Set 、WeakSet 等），如何对集合类型进行代理。

要实现完善的响应式数据，还需要深入了解语言规范

## 理解 Proxy 和 Reflect
 Vue.js 3 的响应式数据时基于 [Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 实现的，所以有必要了解 [Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 以及与之关联的 [Reflect](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect)

 学习 Proxy 和 Reflect 可以参考阮一峰老师的 [《ES6 入门教程》](https://es6.ruanyifeng.com/)。
 *  Proxy 链接 https://es6.ruanyifeng.com/#docs/proxy
 *  Reflect 链接 https://es6.ruanyifeng.com/#docs/reflect

### Proxy
什么是 Proxy ? 简单地说，使用 Proxy 可以创建一个代理对象，它可以代理**其他对象**，注意的是**其他对象**，并且只能代理对象，无法代理对象值（例如字符串、布尔值等）。所谓代理，指的是对一个对象的**基本语义**的代理，它允许我们**拦截**并**重新定义**一个对象的操作

什么是基本语义？ 例如给出一个对象 obj ，可以对它进行一些操作，如读取属性值、设置属性值。类似的这种读取、设置属性值的操作就属于基本语义的操作。

使用 Proxy 拦截一个对象
```js
const p = new Proxy(obj, {
    /*拦截读取属性*/
    get() {
    },
    /*拦截设置属性*/
    set() {
    }
})
```
函数也是一个对象，所以可以也使用 Proxy 对函数简写拦截
```js
function fn(name) {
    console.log('我是：', name)
}
const p2 = new Proxy(fn, {
    apply(target, thisArg, argArray) {
        console.log('拦截了')
        target.call(thisArg, ...argArray)
    }
})
p2('shibin') //输出 我是：shibin
```
上面两个例子说明了什么是基本操作。那什么是非基本操作呢？其实调用对象下的方法就是典型的非基本操作，我们叫它**复合类型**
```js
obj.fn()
```
调用函数的方法，由两个基本语义组成
* get ，即通过 get 操作得到 obj.fn 属性
* 函数调用，即通过 get 得到 obj.fn 的值后再调用它

### Reflect
任何在 Proxy 的拦截器中能找到的方法，都能够在 Reflect 

Reflect.get 就是提供了一个访问对象属性的默认功能。下面两种操作时等价的
```js
// 直接读取
console.log(obj.foo) // 1
// 使用 Reflect.get 获取
console.log(Reflect.get(obj, 'foo'))  // 1
```
既然操作等价，它存在的意义是什么呢？实际上， Reflect.get 还可以接收第三个参数，即指定接受者 receiver ，可以理解为函数调用过程中的 this 。
```js
const obj = {
    get foo() {
        return this.foo
    }
}
console.log(Reflect.get(obj, 'foo', { foo: 2 }))  // 2
```
看下我们之前实现的代码
```js
function reactive(data) {
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
之前我们并没有使用 Reflect ，我们先看下面代码，看看之前的实现存在的问题
```js
const obj = {
    foo: 1,
    get bar(){
        return this.foo
    }
}
const p = reactive(obj)
effect(() => {
    console.log(p.bar) // 1
})

```
运行下面代码
```js
obj.foo++
```
我们发现并没有触发 effect 传递的副作用函数

我们在 get 函数中，通过 target[key] ，此时的 target 就是 obj ，target[key] 就相当于是 obj.bar ，最终访问的是 obj.foo
```js
function reactive(data) {
    return new Proxy(data, {
        get(target, key) {
            track(target, key)
            // 这里 target 指的是 obj,
            // 此时的 target[key] 就相当于是 obj.bar
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
这就等价于
```js
effect(() => {
    console.log(obj.foo)
})
```
在副作用函数内没有访问它的代理对象，所以不会建立响应联系

这时候， Reflect.get 就派上用场了， Reflect.get 的第三个参数，它代表读取谁的属性
```js
function reactive(data) {
    return new Proxy(data, {
        get(target, key, receiver) {
            track(target, key)
            return Reflect.get(target, key, receiver)
        },
        set(target, key, newVal) {
            const res = Reflect.set(target, key, newVal, receiver)
            trigger(target, key)
            return res
        }
    })
}
```
此时我们使用 Reflect.get 获取代理对象的 bar 属性，最终会访问代理对象的foo ，代理对象 foo 就会与副作用函数建立响应联系
```js
代理对象 p {
    foo: 1,
    get bar(){
        // this 指向的是代理对象
        return this.foo
    }
}
```
## JavaScript 对象及 Proxy 的工作原理
如何区分一个对象是普通对象还是函数？在 JavaScript 中，对象的实际语义是由对象的内部方法指定的。所谓内部方法，指的就是我们对一个对象操作时在引擎内部调用的方法，对于使用者来说是不可见的。

例如，当我们访问对象属性时：
```js
obj.foo
```
引擎内部会调用 `[[Get]]` 这个内部方法来读取属性值。在 ECMAScript 规范中使用 `[[xxx]]` 来代表内部方法或内部槽

如果一个对象作为函数调用，那么这个对象内部必须部署内部方法 `[[Call]]`

一个对象不仅部署了 `[[Get]]` 这个内部方法，还有很多其他的内部方法。[相关链接](https://tc39.es/ecma262/#sec-invariants-of-the-essential-internal-methods)

代理对象和普通对象没有太大区别，区别在于内部方法 `[[Get]]` 的实现。如果在创建代理对象时，没有指定对应的拦截函数，内部 `[[Get]]` 方法就会调用原始对象来获取属性值

Proxy 对象部署的所有内部方法
|内部方法| 处理器函数（拦截函数）
|-|-|
| `[[GetPrototypeOf]]` | getPrototypeOf |
| `[[SetPrototypeOf]]` | setPrototypeOf |
| `[[IsExtensible]]` | isExtensible |
| `[[PreventExtensions]]` | preventExtensions |
| `[[GetOwnProperty]]` | getOwnPropertyDescriptor |
| `[[DefineOwnProperty]]` | defineProperty |
| `[[HasProperty]]` | has |
| `[[Get]]` | get |
| `[[Set]]` | set |
| `[[Delete]]` | deleteProperty |
| `[[OwnPropertyKeys]]` | ownKeys |
| `[[Call]]` | apply |
| `[[Construct]]` | construct |

其中，`[[Call]]` 和 `[[Construct]]` 这两个内部方法，只有当被代理的对象是函数和构造函数时才会部署。

由上面的表中，我们可以知道拦截删除属性操作时，可以使用 deleteProperty 拦截函数实现
```js
const p = new Proxy(obj, {
    deleteProperty(target, key) {
        return Reflect.deleteProperty(target, key)
    }
})
```
## 如何代理 Object
前面我们使用在 get 拦截函数去拦截对属性读取的操作。在响应式系统中，读取是一个很宽泛的改了，例如使用 in 操作检查对象上是否具有给定 key 也属于读取操作
```js
effect(() => {
    'foo' in obj
})
```
响应系统应该拦截一切读取操作，以便当数据发生变化能触发正确的响应。对一个对象的所有可能的读取操作有下面几种
* 访问属性 obj.foo
* 判断对象或原型上是否存在给定的 key： key in obj
* 使用 for...in 循环遍历对象：for(const key in obj) {}

### in 操作符拦截
对于 in 操作符，并没有在表中找到相关操作的内容，怎么办呢？这时，就需要我们查看 in 操作符的相关规范

在 [ECMA-262](https://tc39.es/ecma262/) 规范的 [13.10.1](https://tc39.es/ecma262/#sec-relational-operators-runtime-semantics-evaluation)，明确定义了 in 操作符的运行逻辑
1. Let lref be the result of evaluating RelationalExpression.
2. Let lval be ? GetValue(lref).
3. Let rref be the result of evaluating ShiftExpression.
4. Let rval be ? GetValue(rref).
5. If Type(rval) is not Object, throw a TypeError exception.
6. Return ? HasProperty(rval, ? ToPropertyKey(lval)).

关键在第 6 步，in 操作符的运算结果是 HasProperty 对象返回的，我们在找到 [HasProperty](https://tc39.es/ecma262/#sec-hasproperty) 的操作
1. Return ? O.`[[HasProperty]]`(P)

可以看到 HasProperty 的结果是调用内部的 `[[HasProperty]]` 方法得到的，`[[HasProperty]]` 对应的拦截方法是 has

因此，我们可以通过 has 拦截函数实现对 in 操作符的代理
```js
const p = new Proxy(obj, {
    has(target, obj) {
        track(target, key)
        return Reflect.has(target, key)
    }
})
```
当我们在副作用函数中使用 in 操作响应数据时，就能建立依赖关系
```js
effect(() => {
    'foo' in p
})
```
### for...in 拦截
[关于 for...in 执行规范](https://tc39.es/ecma262/#sec-runtime-semantics-forinofheadevaluation)

在第 6 步的 c 子步骤

c. Let iterator be EnumerateObjectProperties(obj).

关键点在 EnumerateObjectProperties(obj)。 EnumerateObjectProperties 是一个抽象方法，该方法返回一个迭代器对象，在 [14.7.9](https://tc39.es/ecma262/#sec-enumerate-object-properties) 给出了满足该抽象方法实例的实现

```js {3}
function* EnumerateObjectProperties(obj) {
  const visited = new Set();
  for (const key of Reflect.ownKeys(obj)) {
    if (typeof key === "symbol") continue;
    const desc = Reflect.getOwnPropertyDescriptor(obj, key);
    if (desc) {
      visited.add(key);
      if (desc.enumerable) yield key;
    }
  }
  const proto = Reflect.getPrototypeOf(obj);
  if (proto === null) return;
  for (const protoKey of EnumerateObjectProperties(proto)) {
    if (!visited.has(protoKey)) yield protoKey;
  }
}
```
第三行使用了 Reflect.ownKeys 来获取只属于对象自身拥有的键。通过这个，我们就知道可以使用 ownKeys 拦截函数来拦截 Reflect.ownKeys 操作
```js
const ITERATE_KEY = Symbol()
function reactive(data) {
    return new Proxy(data, {
        ownKeys(target) {
            track(target, ITERATE_KEY)
            return Reflect.ownKeys(target)
        }
    })
}
```
上面代码中，为什么要使用 ITERATE_KEY 作为追踪的 key？
* 因为 ownKeys 拦截函数中，我们只能拿到目标对象 target
* ownKeys 用来获取所有属于自己的属性，所以这个操作明显不予任何键进行绑定，只能构造一个唯一的 key 作为标识。
  
那么在触发响应的时候也应该触发，那在什么时候触发响应呢？先看下面代码
```js
const obj = {
    foo: 1
}
const p = reactive(obj)
effect(() => {
    for(const k in p){
        console.log(k)
    }
})
p.bar = 'bar'
```
对象 p 上本来不存在 bar 属性，effect 内部的副作用函数 for...in 会循环一次，当给对象添加属性 bar 时，需要触发副作用函数重新执行才可以
```js {7,15-20}
function trigger(target, key) {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    // 取得所有与 key 关联的副作用函数
    const deps = depsMap.get(key)
    // 取得所有与 ITERATE_KEY 关联的副作用函数
    const iterateEffects = depsMap.get(ITERATE_KEY)
    const effectsToRun = new Set()
    deps && deps.forEach(effectFn => {
        if (activeEffect !== effectFn) {
            effectsToRun.add(effectFn)
        }
    })
    // ITERATE_KEY 关联的副作用函数 添加到 effectsToRun 中
    iterateEffects && iterateEffects.forEach(effectFn => {
        if (activeEffect !== effectFn) {
            effectsToRun.add(effectFn)
        }
    })

    effectsToRun.forEach(effectFn => {
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })
}
```
这么做还会有一个问题，当我们设置属性时，也会触发 ITERATE_KEY 关联的副作用函数执行
```js
const obj = {
    foo: 1
}
const p = reactive(obj)
effect(() => {
    for(const k in p){
        console.log(k)
    }
})
p.foo++
```
按理说，设置属性不会对for...in 循环产生影响，不应该更新，因为无论怎么修改，for...in 循环执行都只会执行一次

为了解决上面的问题，我们可以在设置属性时，在 set 拦截函数中先判断对象是否存在这个属性
```js
function reactive(data) {
    return new Proxy(data, {
        set(target, key, newVal, receiver) {
            // 属性存在，就是设置
            // 不存在就是添加
            const type = Object.prototype.hasOwnProperty.call(target, key)? 'SET': 'ADD'
            const res = Reflect.set(target, key, newVal, receiver)
            trigger(target, key, type)
            return res
        }
    })
}
```
上面代码中我们判断对象是否需存在这个属性，存在就是 SET 类型，不存在就是 ADD 类型

在 trigger 函数内部， 根据类型 决定是否需要触发 ITERATE_KEY 关联的副作用函数
```js
function trigger(target, key, type) {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const deps = depsMap.get(key)
    const iterateEffects = depsMap.get(ITERATE_KEY)
    const effectsToRun = new Set()
    deps && deps.forEach(effectFn => {
        if (activeEffect !== effectFn) {
            effectsToRun.add(effectFn)
        }
    })
    // 只有 type 为 ADD 时，才触发与 ITERATE_KEY 关联的副作用函数
    type === 'ADD' && iterateEffects && iterateEffects.forEach(effectFn => {
        if (activeEffect !== effectFn) {
            effectsToRun.add(effectFn)
        }
    })
    effectsToRun.forEach(effectFn => {
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })
}
```
为了方便后期代码维护，需要将操作类型封装为一个枚举值
```js
const TriggerType = {
    SET: 'SET',
    ADD: 'ADD'
}
```
### delete 拦截
```js
delete p.foo
```
如何代理 delete 操作符，需要查看 [delete 规范](https://tc39.es/ecma262/#sec-delete-operator-runtime-semantics-evaluation) 。

第 5 步的内容如下
```
5. If IsPropertyReference(ref) is true, then
  a. Assert: IsPrivateReference(ref) is false.
  b. If IsSuperReference(ref) is true, throw a ReferenceError exception.
  c. Let baseObj be ? ToObject(ref.`[[Base]]`).
  d. Let deleteStatus be ? baseObj.`[[Delete]]`(ref.`[[ReferencedName]]`).
  e. If deleteStatus is false and ref.`[[Strict]]` is true, throw a TypeError exception.
  f. Return deleteStatus.
```

在第 5 步的 d 子步骤可知， delete 操作的行为依赖 `[[Delete]]` 内部方法，该内部方法对应的拦截函数为 deleteProperty

所以可以使用 deleteProperty 对删除属性进行拦截
```js
const TriggerType = {
    SET: 'SET',
    ADD: 'ADD',
    DEL: 'DEL'
}
function reactive(data) {
    return new Proxy(data, {
        deleteProperty(target, key) {
            const hadKey = Object.prototype.hasOwnProperty.call(target, key)
            const res = Reflect.deleteProperty(target, key)
            // 只有删除成功且删除的属性是自己的属性时才触发更新
            if (res && hadKey) {
                trigger(target, key, TriggerType.DEL)
            }
        }
    })
}
```

```js
function trigger(target, key, type) {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    // 取得所有与 key 关联的副作用函数
    const deps = depsMap.get(key)
    // 取得所有与 ITERATE_KEY 关联的副作用函数
    const iterateEffects = depsMap.get(ITERATE_KEY)

    const effectsToRun = new Set()
    deps && deps.forEach(effectFn => {
        if (activeEffect !== effectFn) {
            effectsToRun.add(effectFn)
        }
    })

    // 删除和添加属性时，需要触发 ITERATE_KEY 相关的副作用函数
    if (type === TriggerType.ADD || type === TriggerType.DEL) {
        iterateEffects && iterateEffects.forEach(effectFn => {
            if (activeEffect !== effectFn) {
                effectsToRun.add(effectFn)
            }
        })
    }

    effectsToRun.forEach(effectFn => {
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })
}
```
## 合理的触发响应
### 新旧值处理
```js
const obj = {
    foo: 1
}
const p = reactive(obj)
effect(() => {
    console.log(p.foo)
})
setTimeout(() => {
    p.foo = 1
}, 1000)
```
上面代码中，p.foo 的值并没有发生变化，但是还是会再次触发副作用函数的执行。因此，当我们在调用 trigger 函数时，还需要判断新旧两个值是否相等
```js
function reactive(data) {
    return new Proxy(data, {
        set(target, key, newVal, receiver) {
            const oldVal = target[key]
            const type = Object.prototype.hasOwnProperty.call(target, key) ? TriggerType.SET : TriggerType.ADD
            const res = Reflect.set(target, key, newVal, receiver)
            if (oldVal !== newVal) {
                trigger(target, key, type)
            }
            return res
        }
    })
}
```
但是，上面代码存在缺陷，当原来的值时 NaN 时，我们再次设置的值还是 NaN ，使用全等比较总是为返回 false
```js
NaN === NaN // false
NaN !== NaN // true
```
为了解决这个问题，我们需要在判断上加一个条件
```js
// 当新旧值不相等且 新值和旧值不都是 NaN 的时候才触发更新
if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
    trigger(target, key, type)
}
```
### 原型继承处理
```js
const obj = {}
const proto = {
    bar: 1
}
const child = reactive(obj)
const parent = reactive(proto)
// 使用 parent 作为 child 的原型
Object.setPrototypeOf(child, parent)
effect(() => {
    console.log(child.bar)
})
// 修改 child.bar 的值，副作用函数会重新执行
child.bar = 2
```
执行上面代码，当我们修改 child.bar 的值时，我们发现副作用函数执行了两次

分析原因
* 当我们访问 child.bar 时，会将副作用函数添加到依赖中（child.bar）
* 由于 child 并不存在 bar 属性，所以会从原型上获取
* 访问原型的属性时，由于 parent 也是响应式的，所以会再次被添加到依赖中（parent.bar）
* 当设置 child.bar 的值时，会触发 child 的 set 拦截函数，使用 Reflect.set 会调用 obj对象上内部的 `[[set]]` 方法
* 如果设置的属性在对象上不存在，就会取得原型并调用原型的 set 方法，这就会导致，虽然我们设置的是 child.bar ，但还是会执行 parent.bar 的拦截函数被执行

解决的办法就是屏蔽 parent.bar 触发的副作用函数给屏蔽就可以了。两次更新是由于 parent.bar 触发的副作用函数

child 的 set 拦截函数
```js
set(target, key, newVal, receiver) {
    // target 是原始对象 obj
    // receiver 是代理对象 child
}
```
parent 的 set 拦截函数
```js
set(target, key, newVal, receiver) {
    // target 是原始对象 proto
    // receiver 仍是代理对象 child
}
```
我们发现，两次 set 拦截函数中，target 是变化的，reveiver 都是 child ，根据这个区别，我们只需要判断receiver 是不是 target 的代理对象就可以了

首先我们需要给 get 拦截函数添加一个能力
```js
function reactive(data) {
    return new Proxy(data, {
        get(target, key, receiver) {
            // 代理对象可以通过 raw 属性访问原始数据
            if(key === 'raw'){
                return target
            }
            track(target, key)
            return Reflect.get(target, key, receiver)
        }
    })
}
```
这时，代理对象就可以通过访问 raw 属性访问原始的数据对象
```js
child.raw === obj // true
parent.raw === proto // true
```
我们就可以在 set 拦截函数中判断 receiver 是不是 target 的代理对象了
```js
function reactive(data) {
    return new Proxy(data, {
        set(target, key, newVal, receiver) {
            const oldVal = target[key]
            const type = Object.prototype.hasOwnProperty.call(target, key) ? TriggerType.SET : TriggerType.ADD
            // 由于 key 不存在，所以会调用这里会触发原型上（parent）的 set 拦截
            const res = Reflect.set(target, key, newVal, receiver)
            // receiver 是 target 的代理对象
            if (target === receiver.raw) {
                if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
                    trigger(target, key, type)
                }
            }
            return res
        }
    })
}
```
## 浅响应与深响应
### 深响应
在之前，我们实现的响应式都是浅响应的，例如下面代码
```js
const p = reactive({
    foo: {
        bar: 1
    }
})
effect(() => {
    console.log(p.foo.bar)
})
setTimeout(() => {
    // 修改 bar 的值，并不能触发响应
    p.foo.bar++
}, 1000)
```
修改 p.foo.bar 的值，并不能触发响应，什么原因呢？
```js
function reactive(data) {
    return new Proxy(data, {
        get(target, key, receiver) {
            // 代理对象可以通过 raw 属性访问原始数据
            if (key === 'raw') {
                return target
            }
            track(target, key)
            return Reflect.get(target, key, receiver)
        }
    })
}
```
从上面代码，我们可以看到，当访问 p.foo.bar 时，首先要读取 p.foo，这里我们直接返回了 Reflect.get 得到的 p.foo 这个结果，由于这个结果是一个普通对象（{bar: 1}），所以它并不是一个响应式的。要解决这个问题，我们需要对 Reflect 做一个包装
```js
 function reactive(data) {
    return new Proxy(data, {
        get(target, key, receiver) {
            // 代理对象可以通过 raw 属性访问原始数据
            if (key === 'raw') {
                return target
            }
            track(target, key)
            // 得到原始值结果
            const res = Reflect.get(target, key, receiver)
            if (typeof res === 'object' && res !== null) {
                // 将结果包装成响应式的返回
                return reactive(res)
            }
            return res
        }
    })
 }
```
### 浅响应
有的时候我们希望我们的数据是浅响应的（shallowReactive），就是只有第一层属性是响应的，这时我们只需要在我们原来的代码中稍加修改就可以了
```js
 function createReactive(data, isShallow = false) {
    return new Proxy(data, {
        get(target, key, receiver) {
            // 代理对象可以通过 raw 属性访问原始数据
            if (key === 'raw') {
                return target
            }
            track(target, key)
            // 得到原始值结果
            const res = Reflect.get(target, key, receiver)
            if (isShallow) return res
            if (typeof res === 'object' && res !== null) {
                // 将结果包装成响应式的返回
                return reactive(res)
            }
            return res
        }
    })
 }
//  浅响应
function shallowReactive(data) {
    return createReactive(data, true)
}
// 深响应
function reactive(data) {
    return createReactive(data)
}
```
## 只读和浅只读
有时候我们希望我们的数据时只读的，当用户修改数据时，会给用户一个警告。例如组件接收的 props。
```js
const obj = readonly({foo: 1})
// 尝试修改数据，会给出一条警告
obj.foo = 2
```
为 createReactive 函数增加第三个参数 isReadonly
```js
function reactive(data, isShallow = false, isReadonly = false) {
    return new Proxy(data, {
        set(target, key, newVal, receiver) {
            // 如果属性是只读的，就打印信息并返回
            if (isReadonly) {
                console.warn(`属性 ${key} 是只读的`)
                return
            }
            const oldVal = target[key]
            const type = Object.prototype.hasOwnProperty.call(target, key) ? TriggerType.SET : TriggerType.ADD
            const res = Reflect.set(target, key, newVal, receiver)
            if (target === receiver.raw) {
                if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
                    trigger(target, key, type)
                }
            }
            return res
        },
        deleteProperty(target, key) {
            // 如果属性是只读的，就打印信息并返回
            if (isReadonly) {
                console.warn(`属性 ${key} 是只读的`)
                return
            }
            const hadKey = Object.prototype.hasOwnProperty.call(target, key)
            const res = Reflect.deleteProperty(target, key)
            if (res && hadKey) {
                trigger(target, key, TriggerType.DEL)
            }
        }
    })
}
```
修改操作可以在 set 和 deleteProperty 拦截函数进行拦截，如果数据时**只读**的，那么就**无法修改**它。所以也**没必要为只读数据建立响应联系**
```js
function reactive(data, isShallow = false, isReadonly = false) {
    return new Proxy(data, {
        get(target, key, receiver) {
            // 代理对象可以通过 raw 属性访问原始数据
            if (key === 'raw') {
                return target
            }
            // 非只读才需要建立响应联系
            if (!isReadonly) {
                track(target, key)
            }
            
            const res = Reflect.get(target, key, receiver)
            if (isShallow) return res
            if (typeof res === 'object' && res !== null) {
                return reactive(res)
            }
            return res
        }
    })
}
function readonly(data) {
    return reactive(data, false, true)
}
```
上面代码中实现的是浅只读的
```js
function reactive(data, isShallow = false, isReadonly = false) {
    return new Proxy(data, {
        get(target, key, receiver) {
            // 代理对象可以通过 raw 属性访问原始数据
            if (key === 'raw') {
                return target
            }
            // 非只读才需要建立响应联系
            if (!isReadonly) {
                track(target, key)
            }
            
            const res = Reflect.get(target, key, receiver)
            // 浅只读它的属性不是相应式的
            if (isShallow) return res
            if (typeof res === 'object' && res !== null) {
                // 如果是只读，调用 readonly 进行包装
                return isReadonly ? readonly(res) : reactive(res)
            }
            return res
        }
    })
}
```
对于深只读，我们需要把它的属性值也调用 readonly 函数进行包装
```js
function readonly(data) {
    return reactive(data, false, true)
}
function shallowReadonly(data) {
    return reactive(data, true, true)
}
```
对于浅只读，只需要修改第二个参数 isShallow 为 true 就可以了（既是浅只读，也是浅相应）。
## 代理数组
在 JavaScript 中，数组只是一个普通的对象，对数组的代理需要了解它与普通对象有什么区别。数组是一个异质对象，因为数组内部的 `[[DefineOwnProperty]]` 这个内置方法与常规对象不同。除了 `[[DefineOwnProperty]]` 这个内部方法外，其他内部方法逻辑都与常规相同。所以，实现数组对象的代理，代理普通对象的绝大部分代码可以继续使用
```js
const arr = reactive([1, 2, 3])
effect(() => {
    console.log(arr[1]) 
})
// 可以触发响应
arr[1] = 3
```
数组与普通对象的操作有所不同，下面列举了所有数组元素的读取操作
* 通过索引访问数组的元素值
* 访问数组的长度
* 把数组作为对象，使用 for...in 循环遍历
* 使用 for...of 迭代遍历数组
* 数组的原型方法。（如 concat 、join 、 every 、 some 、 find 、 findIndex 、 includes 等）

对数组的设置操作
* 通过索引修改数组的元素值
* 修改数组的长度
* 数组的栈方法 （如push 、 pop 、 shift 、 unshift）
* 修改原数组的原型方法 （如splice 、fill 、sort）

### 数组的索引与 length
当我们通过索引修改数组元素的值时，会执行数组内部所部署的内部方法 `[[Set]]` ，`[[Set]]` 方法依赖于 `[[DefineOwnProperty]]`。[相关链接](https://tc39.es/ecma262/#sec-array-exotic-objects-defineownproperty-p-desc)

由规范可知，如果设置数组的索引大于数组的长度，那么要更新数组的 length 属性，在触发响应时，也应该触发与 length 相关的副作用函数，我们需要修改 set 拦截函数
```js
function reactive(data, isShallow = false, isReadonly = false) {
    return new Proxy(data, {
        set(target, key, newVal, receiver) {
            if (isReadonly) {
                console.warn(`属性 ${key} 是只读的`)
                return
            }
            const oldVal = target[key]

            const type = Array.isArray(target)
                // 数组对象 设置的索引值 < 数组的长度，就是 SET 否则是 ADD
                ? Number(key) < target.length ? TriggerType.SET : TriggerType.ADD
                // 普通对象
                : Object.prototype.hasOwnProperty.call(target, key) ? TriggerType.SET : TriggerType.ADD

            const res = Reflect.set(target, key, newVal, receiver)
            // receiver 是 target 的代理对象
            if (target === receiver.raw) {
                if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
                    trigger(target, key, type)
                }
            }
            return res
        },
    })
}
```
在 set 拦截函数中，如果目标对象是数组
* 索引值 < 数组长度 ， type 就是 SET
* 否则 type 就是 ADD

有了类型 type 之后，就可以在 trigger 函数中正确的触发响应
```js
function trigger(target, key, type) {
    ...
    // 操作类型是 ADD 且 是数组时，应执行所有与 length 相关的副作用函数
    if(type === TriggerType.ADD && Array.isArray(target)){
        const lengthEffects = depsMap.get('length')
        lengthEffects && lengthEffects.forEach(effectFn => {
            if (activeEffect !== effectFn) {
                effectsToRun.add(effectFn)
            }
        })
    }
    ...
}
```
反过来，当修改数组的 length 属性也会隐式地影响数组元素。例如
```js
const arr = reactive([1, 2, 3])

// 会受到影响
effect(() => {
    console.log(arr[2])
})

// 不会受到影响
effect(() => {
    console.log(arr[0])
})
arr.length = 1
```
当设置的 length 的值比访问的索引值小时，会触发响应。这就需要我们把新设置的属性值传递给 trigger 函数
```js
function reactive(data, isShallow = false, isReadonly = false) {
    return new Proxy(data, {
        set(target, key, newVal, receiver) {
            if (isReadonly) {
                console.warn(`属性 ${key} 是只读的`)
                return
            }
            const oldVal = target[key]

            const type = Array.isArray(target)
                ? Number(key) < target.length
                    ? TriggerType.SET : TriggerType.ADD
                : Object.prototype.hasOwnProperty.call(target, key)
                    ? TriggerType.SET : TriggerType.ADD

            const res = Reflect.set(target, key, newVal, receiver)
            if (target === receiver.raw) {
                if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
                    // 将新的属性值传递给 trigger 函数
                    trigger(target, key, type, newVal)
                }
            }
            return res
        }
    })
}
```
```js
function trigger(target, key, type, newVal) {
    ...
    //  是数组时
    if (Array.isArray(target)) {
        // 操作类型是 ADD  应执行所有与 length 相关的副作用函数
        if (type === TriggerType.ADD) {
            const lengthEffects = depsMap.get('length')
            lengthEffects && lengthEffects.forEach(effectFn => {
                if (activeEffect !== effectFn) {
                    effectsToRun.add(effectFn)
                }
            })
        }
        // 修改数组的长度
        if (key === 'length') {
            depsMap.forEach((effects, key) => {
                // 当前索引 >= 新设置的数组的长度时，需要执行副作用函数
                if (key >= newVal) {
                    effects.forEach(effectFn => {
                        if (activeEffect !== effectFn) {
                            effectsToRun.add(effectFn)
                        }
                    })
                }
            })
        }
    }
    ...
}
```
### for...in
我们应该**尽量避免**使用 for...in 循环遍历数组。语法上可以使用，所以也应该考虑这种情况
```js
const arr = reactive([1, 2, 3])
effect(() => {
    for(let k in arr){
        console.log(k)
    }
})
```
数组对象的 for...in 循环与遍历的常规对象并无差异，因此可以使用 ownKeys 拦截函数进行拦截。

之前实现的拦截函数
```js
function reactive(data, isShallow = false, isReadonly = false) {
        return new Proxy(data, {
            ownKeys(target, key) {
                track(target, ITERATE_KEY)
                return Reflect.ownKeys(target)
            }
        })
    }
```
对于普通对象，只有添加或删除属性时，会影响 for...in 遍历的结果，但数组有所不同
* 添加新元素， arr[100] = 100
* 修改数组元素，arr.length = 0

无论为数组添加新元素，还是直接修改数组的长度，本质上都修改了数组的长度。都会影响 for...in 遍历的结果，所以在 ownKeys 拦截函数中，我们可以使用 length 作为 key 去作为响应联系
```js
function reactive(data, isShallow = false, isReadonly = false) {
    return new Proxy(data, {
        ownKeys(target, key) {
            // 如果是数组，就使用 length 属性作为 key
            Array.isArray(target) ? track(target, 'length') : track(target, ITERATE_KEY)
            return Reflect.ownKeys(target)
        }
    })
}
```
* 添加新元素， arr[100] = 100 
  *  trigger 函数中会根据类型是 ADD，触发跟 length 相关的副作用函数， for...in 就会触发
* 修改数组元素，arr.length = 0 
  * trigger 函数会判断  当前索引 >= 新设置的数组的长度时，需要执行副作用函数
  
### for...of
for...of 用来遍历**可迭代对象**的。ES2015 为 JavaScript 定义了[迭代协议](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols)，它不是新的语法，而是一种协议。一个对象能否被迭代，取决于该对象或该对象的原型是否实现了 @@iterator 方法。
::: tip 提示
这里的 @@[name] 标志在 ESMAScript 规范里用来代指 JavaScript 内建的 symbols 值，@@iterator 指的就是 Symbol.iterator
:::

如果一个对象实现了 Symbol.iterator 方法， 那么这个对象就是可迭代的。例如
```js
const obj = {
    val: 0,
    [Symbol.iterator]() {
        return {
            next() {
                return {
                    value: obj.val++,
                    done: obj.val > 10 ? true : false
                }
            }
        }
    }
}
for(const value of obj){
    console.log(value) // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
}
```
对象 obj 实现了 Symbol.iterator 方法，因此可以使用 for...of 循环遍历它

数组内建了 Symbol.iterator 方法的实现
```js
const arr = [1, 2, 3, 4, 5]

const itr = arr[Symbol.iterator]()

console.log(itr.next()) // {value: 1, done: false}
console.log(itr.next()) // {value: 2, done: false}
console.log(itr.next()) // {value: 3, done: false}
console.log(itr.next()) // {value: 4, done: false}
console.log(itr.next()) // {value: 5, done: false}
console.log(itr.next()) // {value: undefined, done: true}

for (let val of arr) {
    console.log(val) // 1, 2, 3, 4, 5
}
```

根据 ECMA 规范，数组迭代器质性会读取数组的 length 属性，如果迭代的是数组的元素值，还会读取数组的索引。下面是模拟数组迭代器的实现
```js
arr[Symbol.iterator] = function () {
    const target = this
    const len = target.length
    let index = 0
    return {
        next() {
            return {
                value: index < len ? target[index] : undefined,
                done: index++ > len
            }
        }
    }
}
```
所以，在不增加任何代码的情况下，我们的数组迭代方法也可以正确的触发响应
```js
const p = reactive([1, 2, 3, 4, 5])
effect(() => {
    for (const val of p) {
        console.log(val)
    }
})
// 能够触发响应
p[1] = 22
```
数组的 values 方法的返回值实际上就是数组内建的迭代器
```js
console.log(Array.prototype.values === Array.prototype[Symbol.iterator]) // true
```
```js
const p1 = reactive([1, 2, 3, 4, 5])
effect(() => {
    for (const val of p1.values()) {
        console.log(val)
    }
})
// 能够触发响应
p1[1] = 22
```
无论是调用 for...of 循环，还是调用 values 方法等，他们都会读取 Symbol.iterator 属性，该属性是一个 symbol 值，为了避免发生意外以及性能上的考虑，不应该让副作用函数与 Symbol.iterator 这类 symbol 值之间建立响应联系。

修改 get 拦截函数
```js
function reactive(data, isShallow = false, isReadonly = false) {
    return new Proxy(data, {
        get(target, key, receiver) {
            if (key === 'raw') {
                return target
            }
            // key 是 symbol 则不追踪
            if (!isReadonly && typeof key !== 'symbol') {
                track(target, key)
            }

            const res = Reflect.get(target, key, receiver)
            if (isShallow) return res
            if (typeof res === 'object' && res !== null) {
                return isReadonly ? readonly(res) : reactive(res)
            }
            return res
        }
    })
} 
```
### 数组的查找方法
数组的内部方法都依赖了对象的基本语义，所以大多数情况下，我们无须做特殊处理即可达到预期
```js
const arr = reactive([1, 2])
effect(() => {
    console.log(arr[1])
})
arr[1] = 100 // 会触发副作用打印 false
```
这是因为 includes 方法为了找到给定的值，会访问数组的 length 属性以及数组的索引

然而 incluses 方法并不总是能够达到预期
```js
const obj = {}
const arr = reactive([obj])
console.log(arr.includes(arr[0])) // false
```
当我们访问 includes 方法，内部方法会通过索引获取数组元素的值 ，会访问到 arr[0]，触发 get 方法拦截
```js
function reactive(data, isShallow = false, isReadonly = false) {
    return new Proxy(data, {
        get(target, key, receiver) {
            if (typeof res === 'object' && res !== null) {
                // 如果值时对象，就会调用 reactive 返回一个新的代理对象
                return isReadonly ? readonly(res) : reactive(res)
            }
        }
    })
}
```
我们可以看到每次触发 get 方法，由于数组元素的值时对象，所以每次返回的都是一个新的代理对象，所以就导致 arr[0]!==arr[0]
```js
console.log(console.log(arr[0] === arr[0])) // false
```
所以，要解决这个问题，就要将我们代理过的对象保存下来，再次访问时不需要再重新创建

先将原来的 reactive 函数名修改为 createReactive
```js
function createReactive(data, isShallow = false, isReadonly = false) {
    return new Proxy(data, {
        get(target, key, receiver) {
            if (key === 'raw') {
                return target
            }
            if (!isReadonly && typeof key !== 'symbol') {
                track(target, key)
            }
            const res = Reflect.get(target, key, receiver)
            if (isShallow) return res
            if (typeof res === 'object' && res !== null) {
                return isReadonly ? readonly(res) : reactive(res)
            }
            return res
        }
    })
}
```
在 reactive 函数中，我们使用一个 Map 用来存在代理对象的映射
```js
const reactiveMap = new Map()
function reactive(data, isShallow = false, isReadonly = false) {
    const exitProxyMap = reactiveMap.get(data)
    if(exitProxyMap) return exitProxyMap
    const proxy = createReactive(data, isShallow, isReadonly)
    reactiveMap.set(data, proxy)
    return proxy
}
```
运行下面代码，发现符合预期
```js
console.log(arr.includes(arr[0])) // true
```
再看下面代码
```js
const obj = {}
const arr = reactive([obj])
console.log(arr.includes(obj)) // false
```
这个比较符合用户的习惯，我们知道，obj是原始对象，arr.includes 方法指向的是内部的代理对象，所以肯定查找不到

所以，我们需要重写数组的 includes 方法并实现自定义行为
```js {1-4,12-15}
const arrayInstrumentations = {
    includes() {
    }
}
function createReactive(data, isShallow = false, isReadonly = false) {
    return new Proxy(data, {
        get(target, key, receiver) {
            if (key === 'raw') {
                return target
            }
            // 如果是数组并且 key 存在于 arrayInstrumentations 上 如 includes
            if(Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)){
                return Reflect.get(arrayInstrumentations, key, receiver)
            }
            if (!isReadonly && typeof key !== 'symbol') {
                track(target, key)
            }

            const res = Reflect.get(target, key, receiver)
            if (isShallow) return res
            if (typeof res === 'object' && res !== null) {
                return isReadonly ? readonly(res) : reactive(res)
            }
            return res
        }
    })
}
```
执行 arr.includes 方法就相当于执行 arrayInstrumentations.includes 方法
```js
const originMethod = Array.prototype.includes
const arrayInstrumentations = {
    includes(...args) {
        // 这里的 this 指向代理对象 
        // 首先调用 代理对象的 includes 方法
        let res = originMethod.apply(this, args)
        if (res === false) {
            // 调用原始对象的 includes 方法
            res = originMethod.apply(this.raw, args)
        }
        return res
    }
}
```
执行过程中先调用代理对象的 includes 方法进行查找，如果查找不到，就调用原始对象的 includes 方法进行查找

需要做类似的处理方法还有 indexOf 、lastIndexOf
```js
const arrayInstrumentations = {}
;['includes', 'indexOf', 'lastIndexOf'].forEach(method => {
    const originMethod = Array.prototype[method]
    arrayInstrumentations[method] = function (...args) {
        // 这里的 this 指向代理对象 
        // 首先调用 代理对象的方法
        let res = originMethod.apply(this, args)
        if (res === false) {
            // 调用原始对象的方法
            res = originMethod.apply(this.raw, args)
        }
        return resv
    }
})
```
### 隐式修改数组长度的原型方法
隐式修改数组长度的方法主要是栈方法，例如 push 、pop 、 shift 、 unshift 、 splice

以 push 方法为例，从[push 方法的执行流程](https://tc39.es/ecma262/#sec-array.prototype.push)中，第 2 步 和第 6 步可知，当调用数组的 push 方法时，既会读取数组的 length 属性，也会设置数组的 length 属性，这会导致两个独立的副作用函数相互影响。

例如下面代码
```js
const arr = reactive([])
effect(() => {
    arr.push(1)
})
effect(() => {
    arr.push(2)
})
```
运行后会得到栈移除的错误
```
Uncaught RangeError: Maximum call stack size exceeded
```
问题的原因就是 push 方法会间接读取 length 的属性，所以需要屏蔽对length 属性的读取即可，从而避免它与副作用函数之间建立响应联系。因为数组的 push 方法在语义上是修改操作，而非读取操作。
```js
let shouldTrack = true
;['push'].forEach(method => {
    const originMethod = Array.prototype[method]
    arrayInstrumentations[method] = function (...args) {
        shouldTrack = false
        let res = originMethod.apply(this, args)
        shouldTrack = true
        return res
    }
})
```
使用 shouldTrack 做标记，当我们调用 push 时， shouldTrack 赋值为 false ，执行原始的 push 方法会执行 track 函数，在track 函数中根据 shouldTrack 来判断它是否需要追踪，shouldTrack 是 false ，就直接返回。执行完原始的 push 方法后，就将 shouldTrack 值还原为 true
```js
function track(target, key) {
    // shouldTrack 为 false 直接返回
    if (!activeEffect || !shouldTrack) return
    ...
}
```
再执行之前的测试代码，能够正常运行

除了 push ，pop 、 shift 、 unshift 、 splice 都需要类似的处理
```js
let shouldTrack = true
;['push', 'pop', 'shift', 'unshift'].forEach(method => {
    const originMethod = Array.prototype[method]
    arrayInstrumentations[method] = function (...args) {
        shouldTrack = false
        let res = originMethod.apply(this, args)
        shouldTrack = true
        return res
    }
})
```
## 代理集合类型
集合类型包括 Map/Set 以及 WeakMap/WeakSet。

使用 Proxy 代理集合类型的数据与代理普通对象不同，因为集合类型的操作与普通对象存在很大的不同

* [Set 相关介绍](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set)
*  [Map 相关介绍](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map)

[Set](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set) 和 [Map](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map)  这两种数据类型的操作方法类似，它们之间最大的不同在于 Set 类型使用 add(value) 添加元素， 而 Map 类型使用 set(key, value) 方法设置键值对，并且 Map 类型可以使用 get(key) 方法读取相应的值。所以，大多数情况下我们可以使用相同的方法来处理 Set 和 Map 。
### 如何代理 Set 和 Map
执行下面代码，我们希望修改后能正常触发响应
```js
const p = reactive(new Map([['key', '1']]))
effect(() => {
    console.log(p.get('key'))
})
p.set('key', 2) // 能触发响应
```
但实际上会报错
```
Uncaught TypeError: Method Map.prototype.get called on incompatible receiver 
```
同样运行下面代码也会报错
```js
const s = reactive(new Set([1, 2, 3]))
console.log(s.size)
```
[查看 Set.prototype.set 的执行过程](https://tc39.es/ecma262/#sec-get-set.prototype.size)，关键在第 1 步和第 2 步，第 1 步中，this 指向代理对象（因为是通过代理对象访问的），第 2 步，调用抽象方法 `RequireInternalSlot(M, [[SetData]])` 来检查代理对象 M 是否存在内部槽 `[[MapData]]`，代理对象中不存在 `[[SetData]]` ，所以执行后就会抛出错误

为了解决这个问题，我们需要修正访问器的 getter 函数执行时 this 的指向
```js
// 为了简洁，这里只做 map set 的处理
function createReactive(data) {
    return new Proxy(data, {
        get(target, key, receiver) {
            // 如果是 size 属性，
            // 指定 receiver 为原始对象 target 从而修复问题
            if (key === 'size') {
                return Reflect.get(target, key, target)
            }
            return Reflect.get(target, key, receiver)
        }
    })
}
```
再次运行，发现运行后结果正常
```js
const s = reactive(new Set([1, 2, 3]))
console.log(s.size) // 3
```
在之前，我们看到调用 map.get 同样会报错，s.size 与 p.get 不同，当访问 p.get 时（访问时 p.get 方法并没有执行），无论怎么修改 receiver ，执行 get 方法时的 this 指向都是代理对象，我们可以在 getter 方法中把 get 方法与原始数据绑定在一起即可
```js
function createReactive(data) {
    return new Proxy(data, {
        get(target, key, receiver) {
            if (key === 'size') {
                return Reflect.get(target, key, target)
            }
            // 改变执行方法时的 this 指向
            return target[key].bind(target)
        }
    })
}
```
运行后，代码正常工作
```js
const p = reactive(new Map([['key', '1']]))
effect(() => {
    console.log(p.get('key')) // 1
})
```
### 建立响应联系
之前实现了数据的代理并没有实现响应，下面来实现 Set 类型的响应方案，以下面代码为例
```js
const s = reactive(new Set([1, 2, 3]))
effect(() => {
    console.log(s.size)
})
s.add(4) // 触发响应
```
为了能够正常触发响应，我们需要在访问 size 属性时，调用 track 函数进行依赖追踪
```js
function createReactive(data) {
    return new Proxy(data, {
        get(target, key, receiver) {
            if (key === 'size') {
                // 调用 track 函数，建立响应联系
                track(target, ITERATE_KEY)
                return Reflect.get(target, key, target)
            }
            return target[key].bind(target)
        }
    })
}
```
需要注意的是，响应联系需要建立在 ITERATE_KEY 与副作用函数间，因为任何新增、删除的操作都会影响到 size 属性。

当调用 add 方法向集合中添加新元素时，需要实现一个自定义的 add 方法
```js
// 定义一个对象，将自定义方法 add 添加到该对象下
const mutableInstrumentations = {
    add(key) {
        // key  就是我们调用代理对象的 add 方法传递进来的
        // 例如 s.add(4) key 就是 4 ，此时的 this 就是代理对象 s
    }
}
function createReactive(data) {
    return new Proxy(data, {
        get(target, key, receiver) {
            // 通过 raw 属性 可以访问到 target
            if(key === 'raw') return target

            if (key === 'size') {
                // 调用 track 函数，建立响应联系
                track(target, ITERATE_KEY)
                return Reflect.get(target, key, target)
            }
            // 返回定义在 mutableInstrumentations 对象下的方法
            return mutableInstrumentations[key]
        }
    })
}
```
下面实现自定义 add 方法
```js
const mutableInstrumentations = {
    add(key) {
        const target = this.raw
        // 此时不需要 bind,因为是通过原始对象 target 调用的
        const res = target.add(key)
        trigger(target, key, TriggerType.ADD)
        return res
    }
}
```
这里可以回顾下前面 trigger 函数的实现
```js
function trigger(target, key, type, newVal) {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    // 取得所有与 key 关联的副作用函数
    const deps = depsMap.get(key)
    // 取得所有与 ITERATE_KEY 关联的副作用函数
    const iterateEffects = depsMap.get(ITERATE_KEY)

    const effectsToRun = new Set()
    deps && deps.forEach(effectFn => {
        if (activeEffect !== effectFn) {
            effectsToRun.add(effectFn)
        }
    })
    //  是数组时，
    if (Array.isArray(target)) {
        ...
    }
    // type 为 ADD 或 DEL 时，执行所有跟 ITERATE_KEY 关联的副作用函数
    if (type === TriggerType.ADD || type === TriggerType.DEL) {
        iterateEffects && iterateEffects.forEach(effectFn => {
            if (activeEffect !== effectFn) {
                effectsToRun.add(effectFn)
            }
        })
    }

    effectsToRun.forEach(effectFn => {
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })
}
```
当 type 为 DEL 或 ADD 时，就会执行所有跟 ITERATE_KEY 相关联的副作用函数，这样就可以触发 size 属性所收集的副作用函数来执行了

运行下面代码，可以正常触发响应
```js
const s = reactive(new Set([1, 2, 3]))
effect(() => {
    console.log(s.size)
})
s.add(4) // 触发响应
```
但是如果多次添加相同的值，还是能触发响应。
```js
s.add(4) 
s.add(4)
```
因为 Set 中的元素是唯一的，所以当我们向 Set 集合中添加已存在的元素时，不应该触发响应，所以需要进行下面优化
```js
const mutableInstrumentations = {
    add(key) {
        const target = this.raw
        const hadKey = target.has(key)
        const res = target.add(key)
        // 不存在时，才需要触发响应
        if (!hadKey) {
            trigger(target, key, TriggerType.ADD)
        }
        return res
    }
}
```
在上面的基础上，可以使用类似的方法实现 delete 方法
```js
const mutableInstrumentations = {
    delete(key){
        const target = this.raw
        const hadKey = target.has(key)
        const res = target.delete(key)
        if(hadKey) {
            trigger(target, key, TriggerType.DEL)
        }
        return res
    }
}
```