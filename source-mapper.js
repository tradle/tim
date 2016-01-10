#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    h: 'help',
    r: 'release',
    l: 'line',
    c: 'column'
  }
})

if (argv.help || !argv.release || isNaN(argv.line) || isNaN(argv.column)) {
  printUsage()
  process.exit(1)
}

var SourceMapConsumer = require('source-map').SourceMapConsumer
var minifiedJS = fs.readFileSync(path.resolve(argv.release, 'main.jsbundle'), 'utf8')
var rawSourceMap = JSON.parse(fs.readFileSync(path.resolve(argv.release, 'main.jsbundle.map')))
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
      -l, --line              line number in minified source
      -c, --column            column number in minified source
  */
  }.toString().split(/\n/).slice(2, -2).join('\n'))
  process.exit(0)
}
