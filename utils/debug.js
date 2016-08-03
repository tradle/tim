
const debug = require('debug')
if (__DEV__) {
  console.ignoredYellowBox = ['jsSchedulingOverhead']
  debug.enable([
    'tradle:*'
  ].join(','))
} else {
  debug.disable()
}

module.exports = debug
