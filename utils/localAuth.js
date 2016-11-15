
const debug = require('debug')('tradle:app:local-auth')
import { Alert, Platform } from 'react-native'
const LocalAuth = Platform.OS !== 'web' && require('react-native-local-auth')
import Errors from 'react-native-local-auth/data/errors'

import Q from 'q'
import Keychain from 'react-native-keychain'
import PasswordCheck from '../Components/PasswordCheck'
import LockScreen from '../Components/LockScreen'
import ENV from '../utils/env'

// hack!
// hasTouchID().then(ENV.setHasTouchID)

var utils = require('../utils/utils')
var translate = utils.translate
// var TouchIDOptIn = require('../Components/TouchIDOptIn')
var Actions = require('../Actions/Actions');

const PASSWORD_ITEM_KEY = 'app-password'

const isWeb = Platform.OS === 'web'
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
  reason: 'unlock Tradle to proceed',
  fallbackToPasscode: ENV.autoOptInTouchId,
  suppressEnterPassword: ENV.autoOptInTouchId
}

const PROMPTS = require('./password-prompts')
const PASSWORD_PROMPTS = getPasswordPrompts()
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{10,}$/
const BS_PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{2,}$/

let pendingAuth
let pendingEnrollRequest
let TIMEOUT = __DEV__ ? 5000 : 1 * 60 * 1000

module.exports = {
  TIMEOUT,
  Errors,
  setPassword,
  signIn,
  hasTouchID,
  authenticateUser
}

function hasTouchID () {
  if (!LocalAuth) return Promise.resolve(false)

  return LocalAuth.hasTouchID()
    .then(() => true, err => false)
}

/**
 * Native authentication, e.g. TouchID or PIN
 * @param  {Object=DEFAULT_OPTS} opts
 * @return {Promise}
 */
function authenticateUser (opts) {
  // prevent two authentication requests from
  // going in concurrently and causing problems
  if (pendingAuth) return pendingAuth

  opts = typeof opts === 'string' ? { reason: opts} : opts || {}
  opts = { ...DEFAULT_OPTS, ...opts }
  return pendingAuth = LocalAuth.authenticate(opts)
    .then(() => {
      pendingAuth = undefined
    })
    .catch((err) => {
      pendingAuth = undefined

      if (__DEV__ && !(err.name in Errors)) {
        let message = `error: ${err.message}, stack: ${err.stack}`
        debug(JSON.stringify(err))
        Alert.alert(message)
      }

      throw err
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
  if (isWeb) return passwordAuth(navigator, isChangePassword)

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
  debug('passwordAuth')
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
  if (utils.isWeb()) {
    try {
      Alert.alert(err)
    } catch (err) {}
  } else {
    loopAlert(err)
  }

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
  const passwordSpec = utils.isWeb()
    ? translate('textPasswordLimitations')
    : translate('passwordLimitations')

  const validate = utils.isWeb()
    ? validateTextPassword
    : validateGesturePassword

  debug('setPassword')
  return Q.Promise((resolve, reject) => {
    let routes = navigator.getCurrentRoutes().length
    let method = isChangePassword || routes === 1 ? 'push' : 'replace'
    navigator[method]({
      component: PasswordCheck,
      id: 20,
      noLeftButton: true,
      passProps: {
        ...PASSWORD_PROMPTS,
        mode: PasswordCheck.Modes.set,
        validate: validate,
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
  debug('checkPassword')
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

/*
  ^                         Start anchor
  (?=.*[A-Z])               Ensure string has an uppercase letter.
  (?=.*[!@#$&*])            Ensure string has a special case letter.
  (?=.*[0-9])               Ensure string has a digit.
  (?=.*[a-z])               Ensure string has a lowercase letter
  .{10,}                    Ensure string is of > length 10.
  $                         End anchor.
 */
function validateTextPassword (pass) {
  if (__DEV__) return pass.length > 1

  return BS_PASSWORD_REGEX.test(pass)
}

function validateGesturePassword (pass) {
  return pass.length > 4
}

function getPasswordPrompts () {
  const prompts = PROMPTS[utils.isWeb() ? 'text' : 'gesture']
  const translated = {}
  for (var p in prompts) {
    translated[p] = utils.translate(prompts[p])
  }

  return translated
}
