const fs = require('fs')
const path = require('path')
const commitHash = require('./version').commit

module.exports = {
  getVersion,
  getAndroidVersion,
  getIOSVersion,
  getReleaseDir,
  getIOSReleaseDir,
  getAndroidReleaseDir
}

function getShortCommitHash () {
  return commitHash.slice(0, 7)
}

function getReleaseDir ({
  platform,
  version,
  gitHash=getShortCommitHash()
}) {
  if (!version) version = getVersion({ platform })

  const releases = fs.readdirSync(path.resolve(__dirname, `release/${platform}/${version}`))
  const releaseDirname = releases.find(r => r.indexOf(gitHash) === 0)
  if (!releaseDirname) throw new Error('release dir not found, build a release first for this commit!')

  return path.resolve(__dirname, `release/${platform}/${version}/${releaseDirname}/`)
}

function getVersion ({ platform }) {
  return platform === 'ios' ? getIOSVersion() : getAndroidVersion()
}

function getIOSReleaseDir () {
  const version = getIOSVersion()
  if (!version) throw new Error('unable to get version')

  return getReleaseDir({
    platform: 'ios',
    version
  })
}

function getAndroidReleaseDir () {
  return getReleaseDir({
    platform: 'android',
    version: getAndroidVersion()
  })
}

function getIOSVersion () {
  const pListPath = path.resolve(__dirname, 'iOS/Tradle/Info.plist')
  const build = fs.readFileSync(pListPath, { encoding: 'utf8' })
  const match = build.match(/CFBundleVersion<\/key>\n\s+<string>([\d\.]+)/)
  return match[1]
}

function getAndroidVersion () {
  const props = {}
  const gPropsPath = path.resolve(__dirname, 'android/gradle.properties')
  fs.readFileSync(gPropsPath, { encoding: 'utf8' })
    .toString()
    .split('\n')
    .forEach(row => {
      const [key, val] = row.split('=')
      props[key] = val
    })

  const { VERSION_MAJOR, VERSION_MINOR, VERSION_PATCH /*, VERSION_BUILD*/ } = props
  const semver = `${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_PATCH}`
  return semver
}
