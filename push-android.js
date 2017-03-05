#!/usr/bin/env node

const proc = require('child_process')
const fs = require('fs')
const build = fs.readFileSync('./android/app/build.gradle', { encoding: 'utf8' })
const version = build.match(/versionName \"([^\""]+)\"/)[1]
if (!version) throw new Error('unable to parse version from build.gradle')

const gitHash = require('./version').commit.slice(0, 6)
const releases = fs.readdirSync('./release/android')
const releaseDir = releases.find(r => r.indexOf(gitHash) === 0)
if (!releaseDir) throw new Error('release dir not found, run bundle.sh first')

const pushLine = `code-push release aviva-android ./release/android/${releaseDir}/ ${version} -d Production`
console.log(`running: ${pushLine}`)

if (process.argv.indexOf('--dry-run') === -1) {
  proc.execSync(pushLine, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit'
  })
}
