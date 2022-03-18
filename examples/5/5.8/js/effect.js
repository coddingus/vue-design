let activeEffect
const effectStack = []
function effect(fn, options = {}) {
    function effectFn() {
        cleanup(effectFn)
        activeEffect = effectFn
        effectStack.push(effectFn)
        const res = fn()
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
        return res
    }
    effectFn.options = options
    effectFn.deps = []
    if (!options.lazy) {
        effectFn()
    }
    return effectFn
}

function cleanup(effectFn) {
    for (let i = 0; i < effectFn.deps.length; i++) {
        const deps = effectFn.deps[i]
        deps.delete(effectFn)
    }
    // 重置数组
    effectFn.deps.length = 0
}

function computed(getter) {
    let value
    let dirty = true
    const effectFn = effect(getter, {
        lazy: true,
        scheduler(fn) {
            dirty = true
            trigger(obj, 'value')
        }
    })

    const obj = {
        get value() {
            if (dirty) {
                value = effectFn()
                dirty = false
            }
            track(obj, 'value')
            return value
        }
    }
    return obj
}

function traverse(value, seen = new Set()) {
    if (typeof value !== 'object' || value === null && seen.has(value)) return
    seen.add(value)
    for (const k in value) {
        traverse(value[k], seen)
    }
    return value
}
function watch(source, cb, options = {}) {
    let getter
    let oldVal
    if (typeof source === 'function') {
        getter = source
    } else {
        getter = () => traverse(source)
    }
    let cleanup
    function onInvalidate(fn) {
        cleanup = fn
    }
    function job() {
        let newVal = effectFn()

        if (cleanup) {
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