
import { Platform } from 'react-native'

var asyncstorageDown = require('asyncstorage-down')
var levelup = require('levelup')
// var updown = require('level-updown')
var leveldown
if (Platform.OS === 'web') {
  leveldown = require('level-js')
}

else {
  leveldown = require('cachedown')
  leveldown.setLeveldown(asyncstorageDown)
}

module.exports = leveldown
