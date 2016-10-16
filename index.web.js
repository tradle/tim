// if (window.history && !localStorage._tradleTimeTraveled) {
//   if (history.length > 2) {
//     localStorage.setItem('_tradleTimeTraveled', 'y')
//     history.go(-(history.length - 2))
//   }
// }

// localStorage.removeItem('_tradleTimeTraveled')

// if we wake up on a non-zero route, go back to route 0
//
// will not be necessary when we switch to redux and save all state including history
// and get our bearings from the url
const historyIndex = parseInt(location.hash.replace('#/scene_', ''))
if (historyIndex) {
  history.go(-historyIndex)
}

import './css/customicons.css'
import './css/ionicons.min.css'
import './css/styles.css'
import 'whatwg-fetch'

if (!console.table) console.table = console.log

require('./web/shims/deviceEventEmitter')
require('./web/shims/orientation')
require('./index.common')

const AppRegistry = require('react-native').AppRegistry

const app = document.createElement('div')
document.body.appendChild(app)
AppRegistry.runApplication('Tradle', {
  rootTag: app
})
