
const debug = require('debug')('tim:local-auth')
import { Alert, Platform } from 'react-native'
import LocalAuth from 'react-native-local-auth'
import Errors from 'react-native-local-auth/data/errors'

import Q from 'q'

// const SETUP_MSG = 'Please set up Touch ID first, so the app can better protect your data.'
const AUTH_FAILED_MSG = 'Authentication failed'
const DEFAULT_OPTS = {
  reason: 'unlock Tradle to proceed',
  fallbackToPasscode: false,
  suppressEnterPassword: false
}

let pendingAuth

exports.Errors = require('react-native-local-auth/data/errors')

export function hasTouchID () {
  return LocalAuth.hasTouchID()
    .then(() => true, err => false)
}

export function authenticateUser (opts) {
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

import Keychain from 'react-native-keychain'
var utils = require('../utils/utils')
var translate = utils.translate
import PasswordCheck from '../Components/PasswordCheck'
var TouchIDOptIn = require('../Components/TouchIDOptIn')
var Actions = require('../Actions/Actions');

const PASSWORD_ITEM_KEY = 'app-password'

const isAndroid = Platform.OS === 'android'

export function signIn(cb, navigator, newMe) {
  let me = utils.getMe()
  // if (!me)
  //   return register(cb)
  if (me.isAuthenticated  &&  !newMe)
    return cb()

  let doneWaiting
  let authPromise
  if (me.useTouchId  &&  me.useGesturePassword) {
    if (newMe) {
      if (!newMe.useTouchId)
        authPromise = touchIDWithFallback(cb, navigator)
      else
        authPromise = passwordAuth(cb, navigator)
    }
    else
      authPromise = touchIDAndPasswordAuth(cb, navigator)
  }
  else if (me.useTouchId)
    authPromise = touchIDWithFallback(cb, navigator)
  else
    authPromise = passwordAuth(cb, navigator)
  return authPromise
    .then(() => {
      Actions.setAuthenticated(true)
      cb()
    })
    .catch(err => {
      if (err.name == 'LAErrorUserCancel' || err.name === 'LAErrorSystemCancel') {
        navigator.popToTop()
      } else {
        lockUp(cb, err.message || 'Authentication failed')
      }
    })

}
function touchIDAndPasswordAuth(cb, navigator) {
  if (isAndroid) return passwordAuth(cb, navigator)

  return authenticateUser()
  .then(() => {
    return passwordAuth(cb, navigator)
  })
  .catch((err) => {
    debugger
    throw err
  })
}

function touchIDWithFallback(cb, navigator) {
  if (isAndroid) return passwordAuth(cb, navigator)

  return authenticateUser()
  .catch((err) => {
    if (err.name === 'LAErrorUserFallback' || err.name.indexOf('TouchID') !== -1)
      return passwordAuth(cb, navigator)

    throw err
  })
}

function passwordAuth (cb, navigator) {
  return Keychain.getGenericPassword(PASSWORD_ITEM_KEY)
    .then(
      () =>  Q.nfcall(checkPassword, cb, navigator),
      // registration must have been aborted.
      // ask user to set a password
      (err) => Q.nfcall(setPassword, cb, navigator)
    )
}

function lockUp (cb, err) {
  // self.setState({isModalOpen: true})
  loopAlert(err)
  setTimeout(() => {
    let doneWaiting = true
    // let the user try again
    signIn(cb)
  }, __DEV__ ? 5000 : 5 * 60 * 1000)
}

function loopAlert (err) {
  Alert.alert(err, null, [
    {
      text: 'OK',
      onPress: () => !doneWaiting && loopAlert(err)
    }
  ])
}
export function setPassword(cb, navigator) {
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
        Keychain.setGenericPassword(PASSWORD_ITEM_KEY, utils.hashPassword(pass))
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
                  cb()
                }
              },
              onRightButtonPress: cb.bind(this)
            })
          }

          cb()
        })
        .catch(err => {
          debugger
        })
      },
      onFail: () => {
        debugger
        Alert.alert('Oops!')
      }
    }
  })
}
function checkPassword(cb, navigator) {
  // HACK
  let routes = navigator.getCurrentRoutes()
  if (routes[routes.length - 1].id === 20)
    return

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
        return Keychain.getGenericPassword(PASSWORD_ITEM_KEY)
          .then((stored) => {
            return stored === utils.hashPassword(pass)
          })
          .catch(err => {
            return false
          })
      },
      onSuccess: () => {
        cb()
      },
      onFail: (err) => {
        cb(err || new Error('For the safety of your data, ' +
          'this application has been temporarily locked. ' +
          'Please try in 5 minutes.'))
        // lock up the app for 10 mins? idk
      }
    }
  }

  navigator.push(route)
}


