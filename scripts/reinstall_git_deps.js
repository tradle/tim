#!/usr/bin/env node

var proc = require('child_process')
var pkg = require('../package.json')
var modules = process.argv.slice(2)

var gitDeps = Object.keys(pkg.dependencies)
  .filter(p => !modules.length || modules.indexOf(p) !== -1)
  .map(p => pkg.dependencies[p])
  .filter(dep =>  /^[^\d~^]+/.test(dep))

if (!gitDeps.length) {
  throw new Error('nothing to install')
}

const installLine = `npm i --save ${gitDeps.join(' ')} && ./reshrink.sh`
console.log(`running: ${installLine}`)

proc.execSync(installLine, {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit'
})

proc.execSync(`./web.sh`, {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit'
})
