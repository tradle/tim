#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    h: 'help',
    t: 'trace'
  }
})

if (argv.help || !argv.trace) {
  printUsage()
  process.exit(1)
}

var SourceMapConsumer = require('source-map').SourceMapConsumer
var smcs = {}
const cwd = process.cwd()
var trace = fs.readFileSync(path.resolve(argv.trace), { encoding: 'utf8'})
  .split('\n')
  .filter(s => s)
  .map(line => line.match(/([^/:()]+\.js):(\d+):(\d+)/).slice(1))
  .map(parts => {
    const column = Number(parts.pop())
    const line = Number(parts.pop())
    const file = path.resolve(`web/dist/${parts.pop()}`)
    if (!smcs[file]) {
      const minifiedJS = fs.readFileSync(file, 'utf8')
      const rawSourceMap = JSON.parse(fs.readFileSync(file + '.map'))
      rawSourceMap.sourcesContent = [minifiedJS]
      smcs[file] = new SourceMapConsumer(rawSourceMap)
    }

    const smc = smcs[file]
    const originalPos = smc.originalPositionFor({ line, column })
    let relPath = originalPos.source
    if (!relPath) return

    const idx = relPath.indexOf(cwd)
    if (idx !== -1) {
      relPath = relPath.slice(idx + cwd.length + 1)
    }

    if (relPath.startsWith('webpack:///')) {
      relPath = relPath.slice(11)
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
