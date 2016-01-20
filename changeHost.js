#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var hostname = process.argv[2] || 'rnhost'

;[
  path.resolve('./node_modules/react-native/Libraries/WebSocket/RCTWebSocketExecutor.m'),
  path.resolve('./iOS/Tradle/AppDelegate.m')
].forEach(function (file) {
  fs.readFile(file, { encoding: 'utf8' }, function (err, contents) {
    if (err) {
      if (err.code === 'ENOENT') {
        return console.log('file not found:', file)
      } else {
        throw err
      }
    }

    var hacked = contents.replace(
      /((?:URLWithString|stringWithFormat)\:\@\"http\:\/\/)[^:]+/g,
      '$1' + hostname
    )

    if (hacked !== contents) {
      fs.writeFile(file, hacked, function (err) {
        if (err) throw err
      })
    }
  })
})

var storePath = path.resolve('Store/Store.js')
fs.readFile(storePath, { encoding: 'utf8' }, function (err, contents) {
  if (err) throw err

  var hacked = contents.replace(
    /(SERVICE_PROVIDERS_BASE_URL_DEFAULT\s+=\s+__DEV__\s+\?\s+\'http\:\/\/)[^:]+(\:\d+\'\s+\:\s+TOP_LEVEL_PROVIDER\.baseUrl)/,
    '$1' + hostname + '$2'
  )

  if (hacked !== contents) {
    fs.writeFile(storePath, hacked, function (err) {
      if (err) throw err
    })
  }
})
