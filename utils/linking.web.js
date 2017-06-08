import { EventEmitter } from 'events'

const initialURL = (function () {
  const hash = window.location.hash || ''
  return hash.slice(1)
}())

const instance = new EventEmitter()
instance.getInitialURL = () => Promise.resolve(initialURL)
instance.addEventListener = instance.on
instance.removeEventListener = instance.removeListener

export default instance
