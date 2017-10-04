import constants from '@tradle/constants'

module.exports = {
  ...constants,
  TYPES: {
    ...constants.TYPES,
    MESSAGE: 'tradle.ChatItem',
    ENVELOPE: 'tradle.Message'
  }
}
