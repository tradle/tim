
// var ENV = require('react-native-env')
// var TOP_LEVEL_PROVIDER = ENV.topLevelProvider
// var ALL_SERVICE_PROVIDERS = require('../data/serviceProviders')
// var SERVICE_PROVIDERS = ALL_SERVICE_PROVIDERS.topLevelProvider[TOP_LEVEL_PROVIDER.name.toLowerCase()] //ENV.providers
var styles = {
  easy: require('./easy'),
  europi: require('./europi'),
}

// SERVICE_PROVIDERS.forEach(function(name) {
//   // var bank = ALL_SERVICE_PROVIDERS.providers[name]
//   styles[name] = require('./' + name)
// })

module.exports = styles
