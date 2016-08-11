
import { AsyncStorage } from 'react-native'

const prefix = '~keychain'

module.exports = {
  setGenericPassword: function (username, password, service) {
    return AsyncStorage.setItem(prefix + service + '.' + username, password)
  },
  getGenericPassword: function (username, service) {
    return AsyncStorage.getItem(prefix + service + '.' + username)
  },
  resetGenericPassword: function (username, service) {
    return AsyncStorage.removeItem(prefix + service + '.' + username)
  },
  resetGenericPasswords: function (username, service) {
    return AsyncStorage.getAllKeys()
      .then(keys => keys.filter(k => k.indexOf(prefix) === 0))
      .then(keys => AsyncStorage.multiRemove(keys))
  }
}
