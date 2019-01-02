#!/usr/bin/env node

// bluebird - 5k lines

const path = require('path')
const fs = require('fs')
const _ = require('lodash')
const bundle = fs.readFileSync(path.resolve(process.cwd(), process.argv[2]), 'utf8')
const MODULE_START = '__d('

const analyze = bundle => {
  let idx = -1
  let raw = []
  const lines = bundle.split('\n')
  lines.forEach((line, i) => {
    if (line.startsWith(MODULE_START)) {
      raw.push({ start: i })
    }
  })

  raw.forEach((node, i) => {
    node.end = i === raw.length - 1
      ? lines.length - 1
      : raw[i + 1].start - 1

    node.lines = node.end - node.start + 1
    const lastLine = lines[node.end]
    const nameMatch = lastLine.match(/\"(.*)\"/)
    if (!nameMatch) {
      console.log(`UNKNOWN MODULE WITH ${node.lines} LINES: ${JSON.stringify(node)}`)
      return
    }

    node.name = nameMatch[1]
    const filePath = path.resolve(process.cwd(), node.name)
    if (filePath.endsWith('.json')) {
      node.chars = JSON.stringify(require(filePath)).length
    } else if (fs.existsSync(filePath)) {
      node.chars = fs.lstatSync(filePath).size
    }
  })

  raw = raw.filter(r => r.name)

  const _grouped = _.groupBy(raw, ({ name }) => {
    const idx = name.lastIndexOf('node_modules/')
    if (idx === -1) {
      return 'project'
    }

    const dotIndex = name.indexOf('.', idx)
    return name.slice(0, idx + name.slice(0, dotIndex).lastIndexOf('/'))
  })

  const grouped = []
  for (let path in _grouped) {
    let items = _grouped[path]
    grouped.push({
      path,
      // items,
      lines: _.sum(items.map(i => i.lines)),
    })
  }

  return {
    raw,
    grouped,
  }
}

const { raw, grouped } = analyze(bundle)
// console.log(_.sortBy(grouped, 'lines').reverse())
console.log(_.sortBy(raw.filter(r => r.chars), 'chars').reverse().map(info => _.pick(info, ['name', 'lines', 'chars'])))
// const sorted = _.sortBy(raw, 'lines').reverse()
// console.log(JSON.stringify(sorted, null, 2))
