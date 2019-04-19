#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    h: 'help',
    r: 'release',
    b: 'bundle',
    t: 'trace'
  }
})

if (argv.help || !(argv.release || argv.bundle) || !argv.trace) {
  printUsage()
  process.exit(1)
}

var SourceMapConsumer = require('source-map').SourceMapConsumer
var bundlePath = argv.bundle ? path.resolve(argv.bundle) : path.resolve(argv.release, 'main.jsbundle')
var minifiedJS = fs.readFileSync(bundlePath, 'utf8')
var rawSourceMap = JSON.parse(fs.readFileSync(bundlePath + '.map'))
rawSourceMap.sourcesContent = [minifiedJS]

var smc = new SourceMapConsumer(rawSourceMap)
const cwd = process.cwd()
var trace = fs.readFileSync(path.resolve(argv.trace), { encoding: 'utf8'})
  .split('\n')
  .map(line => line.split(/[@:]/))
  .map(parts => {
    const column = Number(parts.pop())
    const line = Number(parts.pop())
    if (isNaN(line) || isNaN(column)) return

    const originalPos = smc.originalPositionFor({ line, column })
    let relPath = originalPos.source
    if (!relPath) return

    const idx = relPath.indexOf(cwd)
    if (idx !== -1) {
      relPath = relPath.slice(idx + cwd.length + 1)
    }

    return `${relPath}:${originalPos.line}`
  })
  .filter(val => val)

console.log(trace.join('\n'))

// var originalPos = smc.originalPositionFor({
//   line: argv.line,
//   column: argv.column
// })

// var relPath = originalPos.source
// var idx = relPath.indexOf(process.cwd())
// if (idx !== -1) {
//   relPath = relPath.slice(idx + process.cwd().length + 1)
// }

// console.log('copy paste the following path into Sublime Text:\n')
// console.log(relPath + ':' + originalPos.line, '\n')

function printUsage () {
  console.log(`
  Usage:
      ./map-strack-trace.js -r /path/to/release/dir -t /path/to/stack-trace-from-min-js

  Options:
      -h, --help              print usage
      -r, --release           release directory (should contain main.jsbundle and main.jsbundle.map)
      -b, --bundle            path to js bundle file
      -t, --trace             path to stack trace file
  `)
  process.exit(0)
}
