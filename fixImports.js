#!/usr/bin/env node

// only needed until react-native is upgraded to 0.14+
// https://github.com/facebook/react-native/issues/1939

var fs = require('fs')
var find = require('findit')
var finder = find('./node_modules/@exponent/react-native-navigator')
var IMPORT_RE = /(\bimport\s+(?:[^'"]+\s+from\s+)??)(['"])([^'"]+)(\2)/g

finder.on('file', function (file) {
  if (/\.js$/.test(file)) {
    fixImports(file)
  }
})

function fixImports (file) {
  fs.readFile(file, { encoding: 'utf8' }, function (err, str) {
    if (err) throw err

    var match = str.match(IMPORT_RE)
    if (!match) return

    match = match[0]
    if (match.indexOf('\n') === -1) return

    var hacked = str.replace(match, match.replace(/\n/g, ' '))
    console.log('hacked', file)
    fs.writeFile(file, hacked)
  })
}
