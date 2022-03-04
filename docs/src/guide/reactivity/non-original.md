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
之前我们并没有使用 Reflect ，我们先看下面代码，看看之前的实现存在的问题
```js
const obj = {
    foo: 1,
    get bar(){
        return this.foo
    }
}
const p = proxy(obj)
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
function proxy(data) {
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
function proxy(data) {
    return new Proxy(data, {
        get(target, key, receiver) {
            track(target, key)
            return Reflect.get(target, key, receiver)
        },
        set(target, key, newVal) {
            target[key] = newVal
            trigger(target, key)
            return true
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
引擎内部会调用 [[Get]] 这个内部方法来读取属性值。在 ECMAScript 规范中使用 [[xxx]] 来代表内部方法或内部槽

如果一个对象作为函数调用，那么这个对象内部必须部署内部方法 [[Call]]

代理对象和普通对象没有太大区别，区别在于内部方法 [[Get]] 的实现。如果在创建代理对象时，没有指定对应的拦截函数，内部 [[Get]] 方法就会调用原始对象来获取属性值