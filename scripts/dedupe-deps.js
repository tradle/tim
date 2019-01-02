#!/usr/bin/env node

const path = require('path')
const findFiles = require('findit')
const Promise = require('bluebird')
const fs = require('pify')(require('fs'))
const sortBy = require('lodash/sortBy')
const isEmpty = require('lodash/isEmpty')

const log = (...args) => console.log(...args)
const readJson = async file => JSON.parse(await fs.readFile(file))
const getModuleNameFromPackageJsonPath = file => file.slice(
  file.lastIndexOf('node_modules') + 'node_modules/'.length,
  file.length - '/package.json'.length
)

const mapNodeModules = async ({ dir }) => {
  const finder = findFiles(dir)
  const pending = {}
  const moduleMap = {}
  const addPackageJson = async file => {
    const moduleName = getModuleNameFromPackageJsonPath(file)
    if (!moduleMap[moduleName]) {
      moduleMap[moduleName] = {}
    }

    const mapForModule = moduleMap[moduleName]
    const pkg = await readJson(file, 'utf8')
    if (!mapForModule[pkg.version]) {
      mapForModule[pkg.version] = []
    }

    const mapForModuleVersion = mapForModule[pkg.version]
    mapForModuleVersion.push({
      path: `.${path.sep}node_modules${path.sep}${path.relative(dir, file)}`,
      pkg,
    })
  }

  return new Promise((resolve, reject) => {
    finder.on('error', reject)
    finder.on('file', file => {
      if (file.endsWith('/package.json')) {
        pending[file] = addPackageJson(file)
      }
    })

    finder.on('end', async () => {
      try {
        await Promise.props(pending)
      } catch (err) {
        reject(err)
        return
      }

      for (let name in moduleMap) {
        for (let version in moduleMap[name]) {
          moduleMap[name][version] = sortBy(moduleMap[name][version], 'path')
        }
      }

      resolve(moduleMap)
    })
  })
}

const pruneNonDuplicates = ({ moduleMap }) => {
  Object.keys(moduleMap).forEach(name => {
    const versions = moduleMap[name]
    Object.keys(versions).forEach(version => {
      if (versions[version].length === 1) {
        delete versions[version]
      }
    })

    if (isEmpty(versions)) {
      delete moduleMap[name]
    }
  })
}

const replaceWithCanonical = async ({ name, canonical, duplicate }) => {
  const { pkg } = canonical
  const dupPkg = duplicate.pkg
  const canDir = path.dirname(canonical.path)
  const dupDir = path.dirname(duplicate.path)
  const remapPath = relDupPath => {
    const dupFileParentDir = path.join(dupDir, path.dirname(relDupPath))
    return path.join(path.relative(dupFileParentDir, canDir), relDupPath)
  }

  const findFilesWithExtensions = (dupDir, extensions) => {
    const finder = findFiles(dupDir)
    const toRemap = []
    finder.on('file', file => {
      const ext = path.extname(file)
      if (!extensions.includes(ext)) return

      const rel = path.relative(dupDir, file)
      if (rel.includes('/node_modules/')) return

      toRemap.push(rel)
    })

    return new Promise((resolve, reject) => {
      finder.on('end', () => resolve(toRemap))
      finder.on('error', reject)
    })
  }

  const findJsFiles = dir => findFilesWithExtensions(dir, ['.js'])

  const remapFile = async relDupPath => {
    const absDupPath = path.resolve(dupDir, relDupPath)
    const canPath = remapPath(relDupPath)

    log(`deduping module ${name}, file ${relDupPath}`)

    return fs.writeFile(absDupPath, `module.exports = require('${canPath}')`)
  }

  const jsFiles = await findJsFiles(dupDir)
  await Promise.map(jsFiles, remapFile, {
    concurrency: 100
  })
}

const dedupeNodeModules = async ({ dir }) => {
  const moduleMap = await mapNodeModules({ dir })
  pruneNonDuplicates({ moduleMap })
  await Promise.all(Object.keys(moduleMap).map(name => {
    const versions = moduleMap[name]
    return Promise.all(Object.keys(versions).map(version => {
      const [canonical, ...duplicates] = versions[version]
      return Promise.all(duplicates.map(duplicate => {
        const { path } = duplicate
        return replaceWithCanonical({ name, canonical, duplicate })
      }))
    }))
  }))
}

dedupeNodeModules({
  dir: path.resolve(__dirname, '../node_modules')
})
.catch(err => {
  process.exitCode = 1
  console.error(err.stack)
})
