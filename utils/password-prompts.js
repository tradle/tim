if (__DEV__) console.log('requiring password-prompts.js')

import {
  Platform
} from 'react-native'

import ENV from './env'

// maps to strings_en.json
const TEXT_PASSWORD_PROMPTS = {
  promptSet: 'setPassword',
  promptSetChange: 'setNewPassword',
  promptRetrySet: 'passwordsDontMatch',
  promptCheck: 'enterPassword',
  promptCheckCurrent: 'enterCurrentPassword',
  promptInvalid: ENV.lenientPassword ? 'lenientTextPasswordLimitations' : 'textPasswordLimitations',
  // duplicate, for backwords compat
  promptInvalidSet: ENV.lenientPassword ? 'lenientTextPasswordLimitations' : 'textPasswordLimitations',
  promptRetryCheck: 'wrongPassword',
  successMsg: 'correctPassword',
  failMsg: 'tooManyPasswordAttempts'
}

const GESTURE_PASSWORD_PROMPTS = {
  promptSet: 'pleaseDrawPassword',
  promptSetChange: 'drawYourNewPassword',
  promptRetrySet: 'patternNotMatching',
  promptCheck: 'drawYourPassword',
  promptCheckCurrent: 'drawYourOldPassword',
  promptReenter: 'drawYourPasswordAgain',
  promptReenterChange: 'drawYourNewPasswordAgain',
  promptRetryCheck: 'gestureNotRecognized',
  promptInvalid: 'passwordLimitations',
  // duplicate, for backwords compat
  promptInvalidSet: 'passwordLimitations',
  successMsg: 'correctGesture',
  failMsg: 'authenticationFailed'
}

module.exports = {
  text: TEXT_PASSWORD_PROMPTS,
  gesture: GESTURE_PASSWORD_PROMPTS
}
