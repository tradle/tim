// https://github.com/facebook/react-native/pull/17672
const blacklist = require('metro-config/src/defaults/blacklist')
module.exports = {
  getBlacklistRE () {
    return blacklist([/react-native\/local-cli\/core\/__fixtures__.*/])
  },
}
