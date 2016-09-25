// will not be necessary when we switch to redux and save all state including history
// and restore from url
if (window.history) {
  if (history.length > 2) {
    history.go(-(history.length - 2))
  }
}

require('./web/shims/deviceEventEmitter')
require('./web/shims/orientation')
require('./index.common')
