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
      let { subClassOf, properties } = m
      if (subClassOf !== CHECK_OVERRIDE)
        return

      const { status, check } = form

      let requestedProperties
      if (m.editCols)
        requestedProperties = m.editCols.map(p => ({name: p}))
      else {
        let notes = properties.explanationForOverride || properties.reviewNotes || properties.notes
        requestedProperties = [
          { name: 'status' },
          { name: notes.name }
        ]
      }

      if (!status || !properties.reasonsToFail  ||  !properties.reasonsToPass)
        return { requestedProperties }

      const reasonSkip = status.title === 'Pass'  &&  'reasonsToFail' || 'reasonsToPass'
      const reasonShow = status.title === 'Pass'  &&  'reasonsToPass' || 'reasonsToFail'
      requestedProperties.push({ name: reasonShow })
      for (let p in properties) {
        if (p === reasonSkip  ||  p === 'status'  ||  p === reasonShow)
          continue
        if (p.charAt(0) === '_')
          continue
        if (properties[p].readOnly  ||  properties[p].hidden)
          continue
        requestedProperties.push({name: p})
      }
      return { requestedProperties }
    }
  }
}
