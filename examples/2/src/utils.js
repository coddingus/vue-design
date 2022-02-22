export function foo(obj) {
    return obj && obj.foo
}
// export function bar(obj){
//     return obj && obj.bar
// }
let handlerError = null
export function bar(fn) {
    callWithErrorHandling(fn)
}
export function registerErrorHandler(fn){
    handlerError = fn
}
function callWithErrorHandling(fn) {
    try {
        fn && fn()
    } catch (e) {
        handlerError && handlerError(e)
    }
}