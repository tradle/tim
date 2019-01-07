// source: https://facebook.github.io/react-native/docs/performance

const { resolve } = require('path')
const fs = require('fs')
const modulePaths = require('./module-paths')

const config = {
  transformer: {
    getTransformOptions: () => {
      const preloadedModules = {}
      modulePaths.forEach(path => {
        if (fs.existsSync(path)) {
          preloadedModules[resolve(path)] = true
        }
      })

      return {
        preloadedModules,
        transform: { inlineRequires: { blacklist: preloadedModules } },
      }
    },
  },
}

module.exports = config
