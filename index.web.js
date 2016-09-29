// will not be necessary when we switch to redux and save all state including history
// and restore from url
if (window.history && !localStorage._tradleTimeTraveled) {
  if (history.length > 2) {
    localStorage.setItem('_tradleTimeTraveled', 'y')
    history.go(-(history.length - 2))
  }
}

localStorage.removeItem('_tradleTimeTraveled')
import './web/public/css/ionicons.css'
import './web/public/css/styles.css'
require('./web/shims/deviceEventEmitter')
require('./web/shims/orientation')
require('./index.common')
