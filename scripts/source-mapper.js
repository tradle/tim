#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    h: 'help',
    r: 'release',
    b: 'bundle',
    l: 'line',
    c: 'column'
  }
})

if (argv.help || !(argv.release || argv.bundle) || isNaN(argv.line) || isNaN(argv.column)) {
  printUsage()
  process.exit(1)
}

var SourceMapConsumer = require('source-map').SourceMapConsumer
var bundlePath = argv.bundle ? path.resolve(argv.bundle) : path.resolve(argv.release, 'main.jsbundle')
var minifiedJS = fs.readFileSync(bundlePath, 'utf8')
var rawSourceMap = JSON.parse(fs.readFileSync(bundlePath + '.map'))
rawSourceMap.sourcesContent = [minifiedJS]

var smc = new SourceMapConsumer(rawSourceMap)
var originalPos = smc.originalPositionFor({
  line: argv.line,
  column: argv.column
})

var relPath = originalPos.source
var idx = relPath.indexOf(process.cwd())
if (idx !== -1) {
  relPath = relPath.slice(idx + process.cwd().length + 1)
}

console.log('copy paste the following path into Sublime Text:\n')
console.log(relPath + ':' + originalPos.line, '\n')

function printUsage () {
  console.log(function () {
  /*
  Usage:
      ./source-mapper.js -r /path/to/release/dir -l LINE -c COLUMN

  Options:
      -h, --help              print usage
      -r, --release           release directory (should contain main.jsbundle and main.jsbundle.map)
      -b, --bundle            path to js bundle file
      -l, --line              line number in minified source
      -c, --column            column number in minified source
  */
  }.toString().split(/\n/).slice(2, -2).join('\n'))
  process.exit(0)
}
