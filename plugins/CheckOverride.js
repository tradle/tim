import { TYPE } from '@tradle/constants'
import { getModel } from '../utils/utils'

const CHECK_OVERRIDE = 'tradle.CheckOverride'

module.exports = function CheckOverride ({ models }) {
  return {
    validateForm: function validateForm ({
      application,
      form
    }) {
      if (!application)
        return
      if (getModel(form[TYPE]).subClassOf !== CHECK_OVERRIDE)
        return

      const { status, check } = form
      if (!status) {
        return {
          requestedProperties: [
            { name: 'status' }
          ]
        }
      }
      const reasons = status.title === 'Pass'  &&  'reasonsToPass' || 'reasonsToFail'
      return {
        requestedProperties: [
          { name: 'status' },
          { name: reasons }
        ]
      }
    }
  }
}
