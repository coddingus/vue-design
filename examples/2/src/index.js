import { foo, bar, registerErrorHandler } from './utils'

/*#__PURE__*/ foo()
registerErrorHandler(function(e){
    console.log('捕获到异常：', e)
})
bar(() => {
    notExitObj.count = 100
})