
import Q from 'q'
import { Platform } from 'react-native'
import browser from '../utils/browser'

var async = require('async')
var leveldown
var levelup = require('levelup')
// var updown = require('level-updown')
if (Platform.OS === 'web') {
  console.log('browser', browser)
  if (browser.isIE) {
    leveldown = require('localstorage-down')
  } else {
    var leveljs = require('level-js')
    var dbs = []
    leveldown = function () {
      var result = leveljs.apply(this, arguments)
      dbs.push(result)
      return result
    }

    leveldown.destroyAll = function () {
      return Q.allSettled(dbs.map(db => Q.ninvoke(db, 'close')))
        .then(() => {
          return Q.all(dbs.map(db => Q.ninvoke(leveljs, 'destroy', db)))
        })
    }
  }
}
else {
  var asyncstorageDown = require('asyncstorage-down')
  leveldown = require('cachedown')
  leveldown.setLeveldown(asyncstorageDown)
}

module.exports = leveldown
