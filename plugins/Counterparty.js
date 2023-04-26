import { TYPE } from '@tradle/constants'
import { getMe, getModel, getPropertiesWithAnnotation, getRootHash, getPropertiesWithRef } from '../utils/utils'

const COUNTERPARTY = 'tradle.Counterparty'

module.exports = function Counterparty ({ models }) {
  return {
    validateForm: async function validateForm ({
      application,
      form
    }) {
      let me = getMe()
      if (!me.isEmployee ||  !me.counterparty) return

      let model = getModel(form[TYPE])

      let props = getPropertiesWithRef(COUNTERPARTY, model)
      if (props && props.length)
        form[props[0].name] = me.counterparty
    }
  }
}
