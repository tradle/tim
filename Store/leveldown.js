
import Q from 'q'
import { Platform } from 'react-native'

var async = require('async')
var asyncstorageDown = require('asyncstorage-down')
var levelup = require('levelup')
// var updown = require('level-updown')
var leveldown
if (Platform.OS === 'web') {
  var dbs = []
  var leveljs = require('level-js')
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
else {
  leveldown = require('cachedown')
  leveldown.setLeveldown(asyncstorageDown)
}

module.exports = leveldown
