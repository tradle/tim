
const debug = require('debug')('tim:local-auth')
import { Alert, Platform } from 'react-native'
import LocalAuth from 'react-native-local-auth'
import Errors from 'react-native-local-auth/data/errors'

import Q from 'q'
import Keychain from 'react-native-keychain'
import PasswordCheck from '../Components/PasswordCheck'

var utils = require('../utils/utils')
var translate = utils.translate
var TouchIDOptIn = require('../Components/TouchIDOptIn')
var Actions = require('../Actions/Actions');

const PASSWORD_ITEM_KEY = 'app-password'

const isAndroid = Platform.OS === 'android'

// const SETUP_MSG = 'Please set up Touch ID first, so the app can better protect your data.'
const AUTH_FAILED_MSG = 'Authentication failed'
const DEFAULT_OPTS = {
  reason: 'unlock Tradle to proceed',
  fallbackToPasscode: false,
  suppressEnterPassword: false
}

let pendingAuth

module.exports = {
  TIMEOUT: __DEV__ ? 1000 : 10 * 60 * 1000,
  Errors,
  setPassword,
  signIn,
  hasTouchID,
  authenticateUser
}

export function hasTouchID () {
  return LocalAuth.hasTouchID()
    .then(() => true, err => false)
}

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

function signIn(navigator, newMe, isChangeGesturePassword) {
  let me = utils.getMe()
  // if (!me)
  //   return register(cb)
  if (me.isAuthenticated  &&  !newMe)
    return Q()

  let authPromise
  if (isChangeGesturePassword)
    authPromise = changePasswordAuth(navigator, newMe)
  else if (me.useTouchId  &&  me.useGesturePassword) {
    if (newMe) {
      if (!newMe.useTouchId)
        authPromise = touchIDWithFallback(navigator)
      else
        authPromise = passwordAuth(navigator)
    }
    else
      authPromise = touchIDAndPasswordAuth(navigator)
  }
  else if (me.useTouchId)
    authPromise = touchIDWithFallback(navigator)
  else
    authPromise = passwordAuth(navigator)

  return authPromise
    .then(() => {
      Actions.setAuthenticated(true)
    })
    .catch(err => {
      if (err.name === 'LAErrorUserCancel') {
        return passwordAuth(navigator)
      }

      if (err.name === 'LAErrorSystemCancel') {
        throw err
      }

      return lockUp(err.message || 'Authentication failed')
        .then(() => signIn(navigator, newMe))
    })

}

/**
 * Get touch ID, then get password
 * @param  {[type]} navigator [description]
 * @return {[type]}           [description]
 */
function touchIDAndPasswordAuth(navigator) {
  if (isAndroid) return passwordAuth(navigator)

  return authenticateUser()
    .then(
      () => passwordAuth(navigator),
      err => {
        if (err.name !== 'RCTTouchIDNotSupported') {
          throw err
        }

        // the user may have enabled touch id but then disabled it from
        // the Settings app
        //
        // there's not much we can do short of demanding that the user
        // turn touch id back on
        return passwordAuth(navigator)
      }
    )
  }
function changePasswordAuth(navigator) {
  return checkPassword(navigator)
  .then(() => {
    return setPassword(navigator)
  })
}

function touchIDWithFallback(navigator) {
  if (isAndroid) return passwordAuth(navigator)

  return authenticateUser()
    .catch((err) => {
      if (err.name === 'LAErrorUserFallback' || err.name.indexOf('TouchID') !== -1)
        return passwordAuth(navigator)

      throw err
    })
}

function passwordAuth (navigator) {
  // check if we have a password stored already
  return utils.getPassword(PASSWORD_ITEM_KEY)
    .then(
      () => checkPassword(navigator),
      // registration must have been aborted.
      // ask user to set a password
      err => setPassword(navigator)
    )
}

function lockUp (err) {
  // self.setState({isModalOpen: true})
  loopAlert(err)
  let doneWaiting
  return utils.promiseDelay(__DEV__ ? 5000 : 5 * 60 * 1000)
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

function setPassword(navigator) {
  return Q.Promise((resolve, reject) => {
    navigator.push({
      component: PasswordCheck,
      id: 20,
      noLeftButton: true,
      passProps: {
        mode: PasswordCheck.Modes.set,
        validate: (pass) => { return pass.length > 4 },
        promptSet: translate('pleaseDrawPassword'),
        promptInvalidSet: translate('passwordLimitations'),
        onSuccess: (pass) => {
          utils.setPassword(PASSWORD_ITEM_KEY, utils.hashPassword(pass))
          .then(() => {
            Actions.updateMe({ isRegistered: true, useGesturePassword: true })
            return hasTouchID()
          })
          .then((askTouchID) => {
            if (askTouchID) {
              return navigator.replace({
                component: TouchIDOptIn,
                id: 21,
                rightButtonTitle: 'Skip',
                passProps: {
                  optIn: () => {
                    Actions.updateMe({ useTouchId: true })
                    resolve()
                  }
                },
                onRightButtonPress: resolve
              })
            }

            resolve()
          })
          .catch(err => reject(err))
        }
      }
    })
  })
}

function checkPassword(navigator) {
  // HACK
  let routes = navigator.getCurrentRoutes()
  let push = routes[routes.length - 1].id !== 20
  let defer = Q.defer()
  let route = {
    component: PasswordCheck,
    id: 20,
    noLeftButton: true,
    passProps: {
      mode: PasswordCheck.Modes.check,
      maxAttempts: 3,
      promptCheck: translate('drawYourPassword'), //Draw your gesture password',
      promptRetryCheck: translate('gestureNotRecognized'), //Gesture not recognized, please try again',
      isCorrect: (pass) => {
        return utils.getPassword(PASSWORD_ITEM_KEY)
          .then((stored) => {
            return stored === utils.hashPassword(pass)
          })
          .catch(err => {
            return false
          })
      },
      onSuccess: () => defer.resolve(),
      onFail: (err) => {
        defer.reject(err || new Error('For the safety of your data, ' +
          'this application has been temporarily locked. ' +
          'Please try in 5 minutes.'))
        // lock up the app for 10 mins? idk
      }
    }
  }

  navigator[push ? 'push' : 'replace'](route)
  return defer.promise
}
