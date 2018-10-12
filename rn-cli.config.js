// https://github.com/facebook/react-native/pull/17672
// const blacklist = require('metro/src/blacklist')
const blacklist = require('metro-config/src/defaults/blacklist')
module.exports = {
  // watchFolders: alternateRoots,
  resolver: {
    blacklistRE: blacklist([/react-native\/local-cli\/core\/__fixtures__.*/])
  },
  // transformer: {
  //   babelTransformerPath: require.resolve('./scripts/transformer.js'),
  // },
}
