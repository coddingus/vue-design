# 框架的设计要素
## 提升用户的开发体验
衡量一个框架是否足够优秀的指标之一就是看它的开发体验如何，那 Vue 举个例子
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

当然Vue也提供了非常友好的输出信息，我们可以打印查看count的信息。在Vue3的源码中，名为 `initCustomFormatter`这个函数，该函数就是用来在浏览器开发环境初始化为自定义的formatter的。我们需要在浏览器控制台设置 -> 启用自定义格式设置工具。然后重启控制台刷新页面就可以了
```
Ref<0>
```
我们会看到输出的内容非常直观
## 控制代码的体积
## 框架要做到良好的Tree-Shaking