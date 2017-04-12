import ENV from '../../utils/env'

const debug = require('debug')('tradle:app:analytics')

const noop = function () {}
const ga = global.ga || noop

module.exports = {
  logEvent,
  setUserId,
  setUserProperty,
  setEnabled
}

function logEvent (action, data) {
  const {
    category,
    label,
    value,
  } = data

  ga('send', {
    hitType: 'event',
    eventCategory: category,
    eventAction: action,
    eventLabel: label,
    eventValue: value
  })
}

function setUserId (userId) {
  ga('set', 'userId', userId)
}

function setUserProperty (key, value) {
  debug('setUserProperty not implemented')
}

function setEnabled (bool) {
  debug('setEnabled not implemented')
}
