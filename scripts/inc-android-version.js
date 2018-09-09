#!/usr/bin/env node

const VERSION_PARTS = ['major', 'minor', 'patch', 'build']
const prop = process.argv[2]
if (!VERSION_PARTS.includes(prop)) {
  throw new Error(`expected 1 argument: ${VERSION_PARTS.join(', ')}`)
}

const path = require('path')
const fs = require('fs')
const G_PROPS_PATH = path.resolve(__dirname, '../android/gradle.properties')
const text = fs.readFileSync(G_PROPS_PATH, { encoding: 'utf-8' })
const props = text
  .split('\n')
  .filter(line => line.startsWith('VERSION_'))
  .map(line => line.replace(/#.*$/, '').trim().split('='))
  .reduce((kv, [k, v]) => {
    kv[k] = parseInt(v)
    return kv
  }, {})

const build = props.VERSION_BUILD
if (prop === 'major') {
  props.VERSION_MINOR = 0
  props.VERSION_PATCH = 0
} else if (prop === 'minor') {
  props.VERSION_PATCH = 0
}

props[`VERSION_${prop.toUpperCase()}`]++
// build # always increases
props.VERSION_BUILD = build + 1

const newText = Object.keys(props).reduce((newText, key) => {
  return newText.replace(new RegExp(`${key}=\\d+`), `${key}=${props[key]}`)
}, text)

fs.writeFileSync(G_PROPS_PATH, newText)

process.stdout.write(`${props.VERSION_MAJOR}.${props.VERSION_MINOR}.${props.VERSION_PATCH}.${props.VERSION_BUILD}`)
