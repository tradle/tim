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
        if (m.editCols) {
          return {
            requestedProperties: m.editCols.map(p => {name: p})
          }
        }
        return {
          requestedProperties: [
            { name: 'status' },
            { name: 'explanationForOverride' }
          ]
        }
      }
      let requestedProperties
      if (m.editCols) {
        if (m.editCols) {
          requestedProperties = {
            requestedProperties: m.editCols.map(p => {name: p})
          }
        }
      }
      else
        requestedProperties = [
            { name: 'status' },
            { name: 'explanationForOverride' }
          ]

      let props = m.properties
      if (!props.reasonToFail  ||  !props.reasonToPass)
        return { requestedProperties }

      const reasonSkip = status.title === 'Pass'  &&  'reasonsToFail' || 'reasonsToPass'
      const reasonShow = status.title === 'Pass'  &&  'reasonsToPass' || 'reasonsToFail'
      requestedProperties.push({ name: reasonShow })
      for (let p in props) {
        if (p === reasonSkip  ||  p === 'status'  ||  p === reasonShow)
          continue
        if (p.charAt(0) === '_')
          continue
        if (props[p].readOnly  ||  props[p].hidden)
          continue
        requestedProperties.push({name: p})
      }
      return { requestedProperties }
    }
  }
}
