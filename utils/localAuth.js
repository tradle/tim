
const debug = require('debug')('tim:local-auth')
import { Alert, Platform } from 'react-native'
const LocalAuth = Platform.OS !== 'web' && require('react-native-local-auth')
import Errors from 'react-native-local-auth/data/errors'

import Q from 'q'
import Keychain from 'react-native-keychain'
import PasswordCheck from '../Components/PasswordCheck'

const ENV = require('../utils/env')

// hack!
hasTouchID().then(ENV.setHasTouchID)

var utils = require('../utils/utils')
var translate = utils.translate
var TouchIDOptIn = require('../Components/TouchIDOptIn')
var Actions = require('../Actions/Actions');

const PASSWORD_ITEM_KEY = 'app-password'

const isAndroid = Platform.OS === 'android'
const ForgivableTouchIDErrors = [
  'LAErrorTouchIDNotAvailable',
  'LAErrorTouchIDNotSupported',
  'RCTTouchIDNotSupported'
]

const FallbackToPasswordErrors = [
  'LAErrorUserCancel',
  'LAErrorSystemCancel'
]

const LOCK_UP_MESSAGE = 'For the safety of your data, ' +
                        'this application has been temporarily locked. ' +
                        'Please try in 5 minutes.'

const LOCK_TIME = __DEV__ ? 5000 : 5 * 60 * 1000

// const SETUP_MSG = 'Please set up Touch ID first, so the app can better protect your data.'
const AUTH_FAILED_MSG = 'Authentication failed'
const DEFAULT_OPTS = {
  reason: 'unlock Tradle to proceed',
  fallbackToPasscode: true,
  suppressEnterPassword: false
}

let pendingAuth
let pendingEnrollRequest
let TIMEOUT = __DEV__ ? 1000 : 10 * 60 * 1000
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{10,}$/

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
  if (isAndroid) return passwordAuth(navigator, isChangePassword)

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
  return utils.getHashedPassword(PASSWORD_ITEM_KEY)
    .then(
      () => checkPassword(navigator, isChangePassword),
      // registration must have been aborted.
      // ask user to set a password
      err => setPassword(navigator, isChangePassword)
    )
}

function lockUp (err) {
  // self.setState({isModalOpen: true})
  if (utils.isWeb()) {
    try {
      Alert.alert(err)
    } catch (err) {}
  } else {
    loopAlert(err)
  }

  let doneWaiting
  return utils.promiseDelay(LOCK_TIME)
    .then(() => doneWaiting = true)

  function loopAlert (err) {
    Alert.alert(err, null, [
      {
        text: 'OK',
        onPress: () => !doneWaiting && loopAlert(err)
      }
    ])
  }
}

function setPassword (navigator, isChangePassword) {
  const passwordSpec = utils.isWeb()
    ? translate('textPasswordLimitations')
    : translate('passwordLimitations')

  const validate = utils.isWeb()
    ? validateTextPassword
    : validateGesturePassword

  return Q.Promise((resolve, reject) => {
    navigator.push({
      component: PasswordCheck,
      id: 20,
      noLeftButton: true,
      passProps: {
        mode: PasswordCheck.Modes.set,
        validate: validate,
        isChange: isChangePassword,
        promptInvalidSet: passwordSpec,
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
  // HACK
  let routes = navigator.getCurrentRoutes()
  let currentRoute = routes[routes.length - 1]
  let push = currentRoute.component.displayName !== PasswordCheck.displayName
  let defer = Q.defer()
  let route = {
    component: PasswordCheck,
    id: 20,
    noLeftButton: true,
    passProps: {
      mode: PasswordCheck.Modes.check,
      maxAttempts: 3,
      isChange: isChangePassword,
      isCorrect: (pass) => {
        return utils.checkHashedPassword(PASSWORD_ITEM_KEY, pass)
      },
      onSuccess: () => defer.resolve(),
      onFail: (err) => {
        lockUp(LOCK_UP_MESSAGE)
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
  return PASSWORD_REGEX.test(pass)
}

function validateGesturePassword (pass) {
  return pass.length > 4
}
