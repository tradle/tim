#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const findit = require('findit')
const finder = findit(path.resolve(process.cwd(), 'node_modules'))
const prettify = obj => JSON.stringify(obj, null, 2)
const rethrow = err => {
  if (err) throw err
}

const hackPeerDeps = file => {
  const pkgJson = require(file)
  const { peerDependencies={} } = pkgJson
  let changed
  if (peerDependencies['react-native']) {
    console.log(`removing "react-native" from ${file} peerDependencies`)
    delete peerDependencies['react-native']
    changed = true
  }

  if (peerDependencies.react && /(?:recompose|reflux)\/package.json$/.test(file)) {
    console.log(`removing "react" from ${file} peerDependencies`)
    delete peerDependencies.react
    changed = true
  }

  if (changed) {
    fs.writeFile(file, prettify(pkgJson), rethrow)
  }
}

finder.on('file', (file, stat) => {
  if (/package\.json$/.test(file)) {
    hackPeerDeps(file)
  }
})
