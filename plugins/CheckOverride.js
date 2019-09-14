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
      let m = getModel(form[TYPE])
      if (m.subClassOf !== CHECK_OVERRIDE)
        return

      const { status, check } = form
      if (!status) {
        return {
          requestedProperties: [
            { name: 'status' }
          ]
        }
      }
      const reasonSkip = status.title === 'Pass'  &&  'reasonsToFail' || 'reasonsToPass'
      const reasonShow = status.title === 'Pass'  &&  'reasonsToPass' || 'reasonsToFail'
      let requestedProperties = [
          { name: 'status' },
          { name: reasonShow }
        ]

      let props = m.properties
      for (let p in props) {
        if (p === reasonSkip  ||  p === 'status'  ||  p === reasonShow)
          continue
        if (p.charAt(0) === '_')
          continue
        if (props[p].readOnly  ||  props[p].hidden)
          continue
        requestedProperties.push({name: p})
      }
      return {requestedProperties}
    }
  }
}
