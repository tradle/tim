
const debug = require('debug')
if (__DEV__) {
  console.ignoredYellowBox = ['jsSchedulingOverhead']
  debug.enable([
    'tradle:*',
    'sendy*'
  ].join(','))
} else {
  debug.disable()
}

module.exports = debug
