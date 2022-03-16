const bucket = new WeakMap()

function track(target, key) {
    if (!activeEffect || !shouldTrack) return
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
    // 将当前的依赖集合添加到 deps数组中
    activeEffect.deps.push(deps)
}
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
const ITERATE_KEY = Symbol()
const reactiveMap = new Map()
function reactive(data, isShallow = false, isReadonly = false) {
    const exitProxyMap = reactiveMap.get(data)
    if (exitProxyMap) return exitProxyMap
    const proxy = createReactive(data, isShallow, isReadonly)
    reactiveMap.set(data, proxy)
    return proxy
}
const arrayInstrumentations = {}
    ;['includes', 'indexOf', 'lastIndexOf'].forEach(method => {
        const originMethod = Array.prototype[method]
        arrayInstrumentations[method] = function (...args) {
            // 这里的 this 指向代理对象 
            // 首先调用 代理对象的 includes 方法
            let res = originMethod.apply(this, args)
            if (res === false) {
                // 调用原始对象的 includes 方法
                res = originMethod.apply(this.raw, args)
            }
            return res
        }
    })
let shouldTrack = false
    ;['push', 'pop', 'shift', 'unshift'].forEach(method => {
        const originMethod = Array.prototype[method]
        arrayInstrumentations[method] = function (...args) {
            shouldTrack = false
            let res = originMethod.apply(this, args)
            shouldTrack = true
            return res
        }
    })

function createReactive(data) {
    return new Proxy(data, {
        get(target, key, receiver) {
            if (key === 'size') {
                return Reflect.get(target, key, target)
            }
            return target[key].bind(target)
        }
    })
}
function shallowReactive(data) {
    return reactive(data, true)
}
function readonly(data) {
    return reactive(data, false, true)
}
function shallowReadonly(data) {
    return reactive(data, true, true)
}
