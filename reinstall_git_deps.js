#!/usr/bin/env node

var proc = require('child_process')
var pkg = require('./package.json')
var gitDeps = Object.keys(pkg.dependencies)
  .map(p => pkg.dependencies[p])
  .filter(dep =>  /^[^\d~^]+/.test(dep))
  .join(' ')

proc.execSync(`npm i --save ${gitDeps}`, {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit'
})
