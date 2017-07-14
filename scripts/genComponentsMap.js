#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const componentsDir = path.resolve(__dirname, '../Components')
const MAP_FILE = 'index.js'
const components = fs.readdirSync(componentsDir).map(filename => {
  if (filename === MAP_FILE) return

  return filename.match(/(.*?)\.?(ios|web|android)?\.js$/)[1]
})
.filter(filename => filename)

const js =
`
function importHelper (Component) {
  return (!Component.prototype && Component.default)
    ? Component.default
    : Component
}

module.exports = {
  ${uniqueStrings(components).map(genGetter).join(',\n  ')}
}
`

fs.writeFileSync(path.join(componentsDir, MAP_FILE), js)

function genGetter (componentName) {
  return `get ${componentName}() { return importHelper(require('./${componentName}')) }`
}

function uniqueStrings (arr) {
  const obj = {}
  for (let str of arr) {
    obj[str] = true
  }

  return Object.keys(obj)
}
