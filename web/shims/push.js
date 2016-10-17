
// TODO:
//   https://github.com/mozilla/serviceworker-cookbook/tree/master/push-get-payload
//   https://github.com/markdalgleish/serviceworker-loader

module.exports = 'serviceWorker' in global.navigator && 'PushManager' in global
  ? require('./web-push')
  : require('./no-push')
