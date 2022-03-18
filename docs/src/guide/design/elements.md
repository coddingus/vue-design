---
outline: deep
---
# 框架的设计要素
## 提升用户的开发体验
衡量一个框架是否足够优秀的指标之一就是看它的开发体验如何，拿 Vue 举个例子
```js
createApp(App).mount('#not-exist')
```
这里我们挂载页面上一个根本不存在的节点，浏览器控制台就会输出一条错误信息
```
Failed to mount app: mount target selector "#not-exits" returned null.
```
根据这条提示信息我们就能很快定位问题的存在。如果没有这些提示信息，我们很难找到问题出在哪里，这还只是几行代码，如果代码有很多，会特别难找

vue.js 源码中,我们经常看到 warn 函数的调用
```
warn(`Failed to mount app: mount target selector "${container}" returned null.`);
```
对于warn 函数，需要尽可能提供有用的信息，因此，它需要收集当前发生错误的组件栈信息

处理提供必要的警告信息外，还有很多其他方面可以作为切入口

例如在 Vue3 中，当我们在控制台打印一个 ref 数据
```js
const count = ref(0)
console.log(count)
```
打开控制台查看输出
```
RefImpl {__v_isShallow: false, dep: undefined, __v_isRef: true, _rawValue: 0, _value: 0}dep: undefined__v_isRef: true__v_isShallow: false_rawValue: 0_value: 0value: （…）[[Prototype]]: Object
```
这样的打印结果非常不直观，我们可以选择打印 count.value ,这样就只会输出 0 。

当然 Vue 也提供了非常友好的输出信息，我们可以打印查看 count 的信息。在Vue3的源码中，名为 `initCustomFormatter`这个函数，该函数就是用来在浏览器开发环境初始化为自定义的 formatter 的。我们需要在浏览器控制台设置 -> 启用自定义格式设置工具。然后重启控制台刷新页面就可以了
```
Ref<0>
```
我们会看到输出的内容非常直观
## 控制代码的体积
框架代码的体积也是衡量框架的标准之一。相同功能下，代码肯定是体积越小越好（因为体积越小，浏览器加载资源的时间就会变少）。

提供完善的开发警告、错误提示信息等意味着需要编写更多的代码，这个与控制代码体积相悖吗？是的，但是我们可以在开发环境下提供完整的代码，在生产环境下只需要提供必要的代码就可以了

现在的 [webpack](https://webpack.js.org) 、[rollup](https://rollupjs.org) 都自带 [Tree-Shaking](https://developer.mozilla.org/zh-CN/docs/Glossary/Tree_shaking) 功能， 如果我们去看 Vue.js 3 的代码（Vue.js 2 也是），就会发现很多警告信息都会有一个判断条件

```js
if(__DEV__ && res) {
    warn(`Failed to mount app: mount target selector "${container}" returned null.`);
}
```
要打印这些信息，需要 `__DEV__` 一定是 true。（`__DEV__` 相当于是个环境变量，生产环境是个常量 false ，开发环境是个常量 true ）

Vue 使用的是 rollup 就行打包，通常任何版本都会有一个开发版（如 vue.global.js ）和生产版本（如 vue.global.prod.js ），打包时会根据环境变量打包出不同的版本

开发环境，`__DEV__` 一定是 true ，所以上面代码就等价于
```js
if(true && res) {
    warn(`Failed to mount app: mount target selector "${container}" returned null.`);
}
```
生产环境，`__DEV__` 一定是 false
```js
if(false && res) {
    warn(`Failed to mount app: mount target selector "${container}" returned null.`);
}
```
`__DEV__` 是 false ， 这段代码永远不会执行，rollup 在打包时就会将这段代码给移除掉

这样就做到了，开发环境下可以提供友好的信息提示辅助我们开发；在生产环境，又不会增大代码的体积
## 框架要做到良好的 Tree-Shaking
上面我们说了可以通过预设常量 `__DEV__`  ，通过工具打包就可以使生产版本不包含打印开发提示信息的代码。但这样做其实还不够，一个框架通常会提供很多方法，而大多数情况下我们肯定用不了那么多方法，而且框架后续还会新增很多方法，这些代码在生产资源包里我们肯定是不需要的。如何去除这些代码呢？那就是 Tree-Shaking

我们都知道，要满足 Tree-Shaking 的条件，模块必须是 ESM(ES Module) ，因为 Tree-Shaking 依赖 ESM 的静态结构

我们创建下面一个代码目录
```
demo
|  src
|   |——— index.js
|   |——— utils.js
package.json
```
安装 rollup
```
pnpm i rollup -D 
```
设置打包命令
```json
{
  ...
  "scripts": {
    "build": "rollup src/index.js -o dist/bundle.js -f esm"
  },
  ...
}
```
分别编写两个文件里的代码
```js
// src/utils.js
export function foo(obj){
    return obj && obj.foo
}
export function bar(obj){
    return obj && obj.bar
}
```
```js
// src/index.js
import { foo } from './utils'

foo()
```
然后执行打包命令
```bash
npm run build
```
查看输出文件 bundle.js 的内容
```js
// dist/bundle.js
function foo(obj){
    return obj && obj.foo
}

foo();
```
我们看到输出文件中并不包含 bar 函数，说明 Tree-Shaking 起了作用。但我们会发现 foo 函数也没有什么意义，仅仅只是读取了属性的值，它执行没有什么必要。删除对我们也不会有影响，为什么没有被作为 dead code 删除呢？

这里就涉及 Tree-Shaking 的第二个关键点 —— 副作用。如果一个函数执行会产生副作用，那么他就不会执行。副作用就是函数执行时，会对外部产生影响如修改了外部的变量。但在这里我们没有修改变量，怎么可能会产生副作用了？

其实是可能的。如果我们的obj 对象是通过 Proxy 创建的代理对象，那么当我们读取属性是，就会触发get 钩子（如果我们在get钩子函数中修改了全局变量，就会产生副作用）。所以我们的代码到底会不会产生副作用，得运行的时候才知道，JavaScript 本身是动态语言，因此想要静态分析那些代码是 dead code 很有难度。
```js
import { foo } from './utils'
let count = 0
const obj = new Proxy({
    foo: 'foo',
    bar: 'bar'
}, {
    get() {
        count++
    }
})
foo(obj)
foo(obj)
foo(obj)
console.log(count) // 3
```
但 rollup 这类工具都会提供一个机制，可以明确的告诉 rollup ，这段代码不会产生副作用
```js
import { foo } from './utils'

/*#__PURE__*/ foo()
```
这里的注释代码 `/*#__PURE__*/` 的作用就是告诉 rollup，foo 函数不会产生副作用，可以对其进行 Tree-Shaking ,再次打包后，就会得到一个空文件。

所以，在编写框架代码时，要合理地使用 `/*#__PURE__*/` 注释。Vue3 中就有大量这样的注释。
```js
export const isHTMLTag = /*#__PURE__*/ makeMap(HTML_TAGS)
```

这样编写代码会不会产生很大的心智负担呢？其实不会，通常产生副作用的代码都是在模块内函数的顶级调用
```js
// 顶级调用
foo()

function bar(){
  // 函数内调用
  foo()
}
```
对于顶级调用来说，是可能产生副作用的，但对于函数内调用来说，只要函数 bar 没有调用，那么 foo 函数的调用就不会产生副作用。因此在 Vue.js 3 的源码中，就奔都是一些顶级调用的函数使用 `/*#__PURE__*/` 注释。

`/*#__PURE__*/` 注释不仅可以作用于函数，可以作用于任何语句中。不只 rollup 可以识别它，webpack 以及压缩工具（如 terser ）也可以识别
## 框架应该输出怎样的构建产物
之前我们说了Vue.js 会给我们提供开发环境和生产环境两个不同的包。实际上，Vue.js 的构建产物除了这两个之外，还会根据不同的使用场景输出其他的产物
### IIFE（立即执行函数表达式）


例如我们想让用户通过 `<script>` 标签引入 Vue.js 后直接直接就可以使用。
```html
<!DOCTYPE html>
<html>
<body>
    <div id="app">
        {{content}}
    </div>
</body>
<script src="/js/vue.global.js"></script>
<script>
    const { ref } = Vue
    const app = Vue.createApp({
        data() {
            return {
                content: 'hello world'
            }
        }
    })
    app.mount('#app')
</script>
</html>
```
为了实现这个需求，我们需要输出一个 IIFE（立即执行函数表达式） 格式的资源
```js
(function(){

}())
```
### ESM
随着浏览器对 ESM 支持，我们还可以让用户可以直接引入 ESM 的资源。Vue.js 3 打包时输出的 ESM 资源有 `vue.esm-browser.js`
```html
<script type="module">
    import { createApp } from './js/vue.esm-browser.js'
    const app = createApp({
        data() {
            return {
                content: 'hello world'
            }
        }
    })
    app.mount('#app')
</script>
```
为什么 `vue.esm-browser.js` 会有 `-browser` 字样呢？其实 Vue.js 3 还会输出 `vue.esm-bundler.js`。`-browser` 变成了 `-bundler`。为啥还有这个呢？？？

其实我们在使用 webpack、rollup 等工具开发时，当我们在代码里面导入 vue 的使用，它们在寻找资源时会先寻找 `package.json` 中 module 字段，module字段指向的资源优先于 main 字段指向的资源

我们打开 Vue.js 源码中 `package/vue/package.json` 文件
```json
{
   "main": "index.js",
   "module": "dist/vue.runtime.esm-bundler.js",
}
```
我们看到 module 字段指向的是 `vue.runtime.esm-bundler.js` 。也就是说，带有 -bundler 字样的 ESM 资源是给 webpack、rollup 这类工具使用的，而带有 -browser 字样的是直接给在浏览器中导入使用的。

那么他们有什么区别呢？ 比如我们使用的 `__DEV__` 常量

当我们通过`<script type="module">`直接导入使用 ESM 资源时
  * 开发环境 `__DEV__` 就是 true 
  * 生产环境 `__DEV__` 就是 false ，从而移除掉生产环境不需要的代码
```js
if(__DEV__){
    ...
}
```
当我们使用 webpack 、 rollup 等工具时，资源就会变成这样
```js
if(process.env.NODE_ENV !== 'production'){
...
}
```
这样做的好处就是在我们开发的时候可以手动设置目标环境
### CommonJS
除了在浏览器中使用，我们还希望用户可以在 Node.js 环境中使用

为什么会有这样的需求？因为需要服务端渲染。服务端渲染时，我们的 Vue.js 代码是在Node.js 环境下运行的，所以还需要输出 Common.js 的文件资源

## 特性开关
在设计框架时，框架会提供给用户诸多特性（或功能），同时也会给用户提供对应特性的开关
* 对于用户关闭的特性，可以通过 Tree-Shaking 让其不打包到最终的资源中
* 同时也可以为框架带来更多的灵活性，可以通过特性开关任意为框架增加新特性，而不必担心资源体积变大。同时框架升级时，也可以通过特性开关来支持遗留的 API ，从而使打包的体积最小化

怎么设置这些特性开关呢？其实很简单，跟 `__DEV__` 一样。拿 Vue.js 3 的一段 rollup.js 代码
```js
// rollup.config.js
__FEATURE_OPTIONS_API__: isBundlerESMBuild ? `__VUE_OPTIONS_API__` : true,
```
在Vue.js 的代码中，可以找到很多类似于下面代码的分支判断
```js
if(__FEATURE_OPTIONS_API__){
    ...
}
```
`__FEATURE_OPTIONS_API__` 是一个特性开关，我们使用工具打包时可以设置它
```js
// 
new webpack.DefinePlugin({
    __FEATURE_OPTIONS_API__: JSON.stringify(true) //开启特性
})
```
            
最后解释下 `__FEATURE_OPTIONS_API__` 的作用，我们使用Vue2 编写的组件叫做 Option API，但是在 Vue.js 3 中推荐使用 Composition API 来编写代码。但为了兼容 Vue.js 2 ，在Vue.js 3 中依然可以使用Composition API 。如果我们确定不使用 Composition API ，就可以将该特性关闭，从而减少最终倒闭的代码体积。
## 错误处理
错误处理是框架开发最重要的环节。框架的错误处理机制直接决定了用户应用程序的健壮性，减少用户的心智负担。

加入我们开发了下面的代码
```js
// utils.js
export function bar(fn) {
    fn && fn()
}
export function foo(fn) {
    fn && fn()
}
```
使用
```js
import { bar } from './uitls'
bar(() => {
    ...
})
```
当我们执行上面代码时， 如果出现了错误，我们该怎么办？ 

自行处理，自己手写 try...catch
使用
```js
import { bar } from './uitls'
bar(() => {
    try {
        ...
    } catch(e){
        ...
    }
})
```
框架内置统一处理
```js
// utils.js
export function bar(fn) {
    try {
        fn && fn()
    } catch(e) {
        ...
    }
}
export function foo(fn) {
    try {
        fn && fn()
    } catch(e) {
        ...
    }
}
```
实际上，我们可以将错误处理同一封装成一个函数
```js
export function bar(fn) {
    callWithErrorHandling(fn)
}

export function foo(fn) {
    callWithErrorHandling(fn)
}

function callWithErrorHandling(fn) {
    try {
        fn && fn()
    } catch (e) {
        console.log(e)
    }
}
```
代码变得简洁了，但我们真正要做的是提供统一处理错误的接口
```js
// utils.js
let handleError = null

export function bar(fn) {
    callWithErrorHandling(fn)
}

export function foo(fn) {
    callWithErrorHandling(fn)
}

export function registerErrorHandler(fn){
    handleError = fn
}

function callWithErrorHandling(fn) {
    try {
        fn && fn()
    } catch (e) {
        handlerError && handleError(e)
    }
}
```
这样用户如果想自己处理异常，就可以调用 registerErrorHandler 函数就可以了
```js
import { foo, bar, registerErrorHandler } from './utils'

registerErrorHandler(function(e){
    console.log('捕获到异常：', e)
})
bar(() => {
    notExitObj.count = 100
})
...
```
这样做的好处就是用户完全有能力控制错误处理

Vue.js 的错误处理能力也一样，可以在源码中搜索 callWithErrorHandling 函数。另外在 Vue.js 中，我们也可以同一注册错误处理函数
```js
import { createApp } from 'vue'
import App from './App'

const app = createApp(App)

app.mount('#app')
app.config.errorHandler = () =>{
    // 错误处理代码
}
```
## 良好的 TypeScript 支持
现在越来越多的开发者和团队开始使用 [TypeScript](https://www.tslang.cn) 开进行开发。使用 TS 的好处很多，比如代码即文档、编辑器自动提示、一定出程度上能避免低级 bug 、代码的可维护性强等等。因此，对 TS 类型支持是否完善也是评价一个框架的重要指标。

如何衡量一个框架对 TS 类型支持的水平呢？ 这里有一个常见的误区，并不是我们认为的使用 TS 编写的就是对 TS 类型友好，其实是两码事。例如下面代码
```ts
function fn(val: any){
    return val
}
const res = fn('str')
```
如果我们调用fn 函数，按理说我们传入什么类型，就应该返回什么类型，但是当我们把鼠标放在调用 fn 函数的地方，发现 TS 的提示并不是

![](/public/01/ts-01.jpg)

如上图所示，并没有达到我们想要的效果

为了达到理想状态，我没需要这样修改
```ts
function fn<T extends any>(val: T): T{
    return val
}

const res = fn('str')
```
修改完后，我们就会看都 res 的类型是字符串字面量 `"str"` 而不是 `any` 了

![](/public/01/ts-02.jpg)

所以 TS 编写代码和对 TS 是否友好是两码事。在编写大型框架时，要做到完善的 TS 支持并不容易，大家可以看下 `runtime-core/src/apiDefineComponents.ts` 文件， 整个文件在浏览器运行只有 3 行，但是全部代码却接近 200 行，其实这些代码都是在为类型服务。

由此可见，框架要做到完善的类型支持，需要付出相当大的努力
