import Actions from '../Actions/Actions'

const noop = () => {}
const wait = millis => new Promise(resolve => setTimeout(resolve, millis))
const isPromise = obj => obj && typeof obj.then === 'function' && typeof obj.catch === 'function'

export const createInterceptor = ({ before=noop, onError=noop, after=noop }) => (obj, methods) => {
  methods.forEach(method => {
    const fn = obj[method]
    obj[method] = async function (...args) {
      const props = { method, args }
      const beforeRet = before(props)
      if (isPromise(beforeRet)) await beforeRet
      try {
        props.result = await fn.apply(this, args)
        return props.result
      } catch (err) {
        props.error = err
        const onErrorRet = onError(props)
        if (isPromise(onErrorRet)) await onErrorRet
      } finally {
        const afterRet = after(props)
        if (isPromise(afterRet)) await afterRet
      }
    }
  })

  return obj
}

export const createBusyInterceptor = mappings => {
  const intercept = createInterceptor({
    before: ({ method }) => Actions.busyWith(mappings[method]),
    after: ({ method }) => Actions.notBusyWith(mappings[method]),
  })

  const methods = Object.keys(mappings)
  return obj => intercept(obj, methods)
}

export const createDelayInterceptor = (mappings, { before, after }) => {
  const delayer = ({ method }) => {
    const delay = mappings[method] || 0
    console.log(`INJECTING DELAY: ${delay}ms, ${method}`)
    return wait(delay)
  }

  const intercept = createInterceptor({
    before: before && delayer,
    after: after && delayer,
  })

  const methods = Object.keys(mappings)
  return obj => intercept(obj, methods)
}

export const injectDelay = (obj, mappings, opts) => createDelayInterceptor(mappings, opts)(obj)
export const injectBusy = (obj, mappings) => createBusyInterceptor(mappings)(obj)
