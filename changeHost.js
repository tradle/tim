#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var myLocalIP = process.argv[2] ? process.argv[2].replace(/^\"(.*)\"$/, '$1') : 'localhost'
var hostname = myLocalIP.replace(/^\"(.*)\"$/, '$1')

updateLocalIP()

function updateLocalIP () {
  const localIP = path.resolve('utils/localIP.json')
  const json = JSON.stringify(hostname)
  fs.writeFile(localIP, json, function (err) {
    if (err) throw err
  })
}
