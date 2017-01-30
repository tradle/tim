
const debug = require('debug')('tradle:app:local-auth')
import { Alert, Platform } from 'react-native'
import LocalAuth from 'react-native-local-auth'
import Errors from 'react-native-local-auth/data/errors'

import Q from 'q'
import Keychain from 'react-native-keychain'
import PasswordCheck from '../Components/PasswordCheck'
import LockScreen from '../Components/LockScreen'
import ENV from '../utils/env'
import { coroutine as co } from 'bluebird'

// hack!
// hasTouchID().then(ENV.setHasTouchID)

var utils = require('../utils/utils')
var translate = utils.translate
// var TouchIDOptIn = require('../Components/TouchIDOptIn')
var Actions = require('../Actions/Actions');

const PASSWORD_ITEM_KEY = 'app-password'

const isAndroid = utils.isAndroid()
const isIOS = utils.isIOS()
const ForgivableTouchIDErrors = [
  'LAErrorTouchIDNotAvailable',
  'LAErrorTouchIDNotSupported',
  'RCTTouchIDNotSupported'
]

// const FallbackToPasswordErrors = [
//   'LAErrorUserCancel',
//   'LAErrorSystemCancel'
// ]

const LOCK_TIME = __DEV__ ? 5000 : 5 * 60 * 1000
const LOCK_TIME_STR = __DEV__ ? '5 seconds' : '5 minutes'

const LOCK_UP_MESSAGE = translate('temporarilyLocked', LOCK_TIME_STR)
const LOCK_SCREEN_BG = require('../img/bg.png')

// const SETUP_MSG = 'Please set up Touch ID first, so the app can better protect your data.'
const AUTH_FAILED_MSG = 'Authentication failed'
const DEFAULT_OPTS = {
  reason: translate('unlockDevice'),
  fallbackToPasscode: ENV.autoOptInTouchId,
  suppressEnterPassword: ENV.autoOptInTouchId
}

const PROMPTS = require('./password-prompts')
const PASSWORD_PROMPTS = getPasswordPrompts()
let pendingAuth
let pendingEnrollRequest
let TIMEOUT = __DEV__ ? 5000 : 1 * 60 * 1000

const hasTouchID = co(function* hasTouchID () {
  try {
    yield LocalAuth.hasTouchID()
    return true
  } catch (err) {
    return false
  }
})

module.exports = {
  TIMEOUT,
  Errors,
  setPassword,
  signIn,
  hasTouchID,
  authenticateUser
}

/**
 * Native authentication, e.g. TouchID or PIN
 * @param  {Object=DEFAULT_OPTS} opts
 * @return {Promise}
 */
const authenticateUser = co(function* (opts) {
  // prevent two authentication requests from
  // going in concurrently and causing problems
  if (__DEV__ && isAndroid) return

  debug('authenticating user, auth pending: ' + (!!pendingAuth))
  if (pendingAuth) return pendingAuth

  const requestEnablePasscodeAndReauth = co(function* () {
    debug('requesting to enable device passcode')
    yield requestEnablePasscode()
    pendingAuth = undefined
    debug('device passcode alert dismissed, reattempting authentication')
    return authenticateUser(opts)
  })

  if (!ENV.requireDeviceLocalAuth) {
    try {
      const isSecure = utils.isSimulator() ? true : yield LocalAuth.isDeviceSecure()
      debug('is device secure? ' + isSecure)
      if (!isSecure) {
        return pendingAuth = requestEnablePasscodeAndReauth()
      }

      return
    } catch (err) {
      debug('unable to determine whether device is secure, asking for auth', err)
    }
  }

  debug('requesting local auth')
  opts = typeof opts === 'string' ? { reason: opts} : opts || {}
  opts = { ...DEFAULT_OPTS, ...opts }
  try {
    return pendingAuth = LocalAuth.authenticate(opts)
  } catch (err) {
    if (__DEV__) {
      if (!(err.name in Errors)) {
        let message = `error: ${err.message}, stack: ${err.stack}`
        debug(JSON.stringify(err))
        Alert.alert(message)
      }
    } else {
      if (isAndroid && err.code === 'E_FAILED_TO_SHOW_AUTH') {
        return pendingAuth = requestEnablePasscodeAndReauth()
      }
    }

    throw err
  } finally {
    pendingAuth = undefined
  }
})

function requestEnablePasscode () {
  return new Promise(resolve => {
    Alert.alert(
      translate('youShallNotPass'),
      translate('enablePasscodeFirst'),
      [
        { text: 'OK', onPress: resolve }
      ]
    )
  })
}

function touchIDOrNothing () {
  return authenticateUser()
    .catch(requestEnrollTouchID)
}

function requestEnrollTouchID () {
  if (pendingEnrollRequest) return pendingEnrollRequest

  return pendingEnrollRequest = new Promise(resolve => {
    Alert.alert('Error', 'Please enable TouchID, then press OK', [
      {
        text: 'OK',
        onPress: function () {
          pendingEnrollRequest = null
          touchIDOrNothing().then(resolve)
        }
      }
    ])
  })
}

function signIn(navigator, newMe, isChangePassword) {
  let me = utils.getMe()
  // if (!me)
  //   return register(cb)
  if (me.isAuthenticated  &&  !newMe)
    return Q()

  let authPromise
  let requireTouchID = me.useTouchId
  if (me.useTouchId  &&  me.useGesturePassword)
    authPromise = touchIDAndPasswordAuth(navigator, isChangePassword)
  else if (me.useTouchId)
    authPromise = touchIDOrNothing()
  else
    authPromise = passwordAuth(navigator, isChangePassword)

  return authPromise
    .then(() => {
      Actions.setAuthenticated(true)
      if (isChangePassword) {
        return setPassword(navigator, isChangePassword)
      }
    })
}

/**
 * Get touch ID, then get password
 * @param  {[type]} navigator [description]
 * @return {[type]}           [description]
 */
function touchIDAndPasswordAuth(navigator, isChangePassword) {
  // if (isAndroid) return passwordAuth(navigator, isChangePassword)

  return authenticateUser()
    .then(
      () => passwordAuth(navigator, isChangePassword),
      err => {
        if (ForgivableTouchIDErrors.indexOf(err.name) === -1) {
          throw err
        }

        // the user may have enabled touch id but then disabled it from
        // the Settings app
        //
        // there's not much we can do short of demanding that the user
        // turn touch id back on
        return passwordAuth(navigator, isChangePassword)
      }
    )
}

// function changePasswordAuth(navigator) {
//   return checkPassword(navigator)
//   .then(() => {
//     return setPassword(navigator)
//   })
// }

// function touchIDWithFallback(navigator) {
//   if (isAndroid) return passwordAuth(navigator)

//   return authenticateUser()
//     .catch((err) => {
//       if (err.name === 'LAErrorUserFallback' || err.name.indexOf('TouchID') !== -1)
//         return passwordAuth(navigator)

//       throw err
//     })
// }

function passwordAuth (navigator, isChangePassword) {
  // check if we have a password stored already
  debug('checking for stored gesture password')
  return utils.getHashedPassword(PASSWORD_ITEM_KEY)
    .then(
      () => checkPassword(navigator, isChangePassword),
      // registration must have been aborted.
      // ask user to set a password
      err => setPassword(navigator, isChangePassword)
    )
}

function lockUp (nav, err) {
  // self.setState({isModalOpen: true})
  debug('lockUp')
  return new Promise(resolve => {
    nav.replace({
      component: LockScreen,
      id: 24,
      noLeftButton: true,
      passProps: {
        bg: LOCK_SCREEN_BG,
        // convert to seconds
        timer: LOCK_TIME / 1000,
        message: err,
        callback: resolve
      }
    })
  })
}

function setPassword (navigator, isChangePassword) {
  debug('requesting to choose a gesture password')
  return Q.Promise((resolve, reject) => {
    navigator.push({
      component: PasswordCheck,
      id: 20,
      noLeftButton: true,
      passProps: {
        ...PASSWORD_PROMPTS,
        mode: PasswordCheck.Modes.set,
        validate: validateGesturePassword,
        isChange: isChangePassword,
        // promptInvalidSet: translate('passwordLimitations'),
        onSuccess: (pass) => {
          utils.setHashedPassword(PASSWORD_ITEM_KEY, pass)
          .then(() => {
            Actions.updateMe({ isRegistered: true, useGesturePassword: true })
            resolve()
          })
          .catch(reject)
        }
      }
    })
  })
}

function checkPassword (navigator, isChangePassword) {
  debug('requesting to enter gesture password')
  // HACK
  let routes = navigator.getCurrentRoutes()
  let currentRoute = routes[routes.length - 1]
  const name = currentRoute.component.displayName
  let push = name !== PasswordCheck.displayName && name !== LockScreen.displayName
  let defer = Q.defer()
  let route = {
    component: PasswordCheck,
    id: 20,
    noLeftButton: true,
    passProps: {
      ...PASSWORD_PROMPTS,
      mode: PasswordCheck.Modes.check,
      maxAttempts: 3,
      isChange: isChangePassword,
      validate: validateGesturePassword,
      isCorrect: (pass) => {
        return utils.checkHashedPassword(PASSWORD_ITEM_KEY, pass)
      },
      onSuccess: () => defer.resolve(),
      onFail: (err) => {
        lockUp(navigator, LOCK_UP_MESSAGE)
          .then(() => checkPassword(navigator))
          .then(() => defer.resolve())
      }
    }
  }

  navigator[push ? 'push' : 'replace'](route)
  return defer.promise
}

function getPasswordPrompts () {
  const prompts = PROMPTS[utils.isWeb() ? 'text' : 'gesture']
  const translated = {}
  for (var p in prompts) {
    translated[p] = utils.translate(prompts[p])
  }

  return translated
}

function validateGesturePassword (pass) {
  return pass.length > 4
}
