import mockery from 'mockery'
mockery.enable({
  warnOnReplace: false,
  warnOnUnregistered: false
})

mockery.registerSubstitute('q', 'bluebird-q')
module.exports = require('q')
