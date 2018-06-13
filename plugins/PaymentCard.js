import { TYPE } from '@tradle/constants'
import { translate } from '../utils/utils'
const PAYMENT_CARD = 'tradle.CreditCard'

module.exports = function PaymentCard ({ models }) {
  return {
    validateForm: function validateForm ({
      application,
      form,
      currentResource
    }) {
      if (form[TYPE] !== PAYMENT_CARD)
        return

      let scanned = form.scanJson
      if (!scanned)
        return

      let model = models[PAYMENT_CARD]
      let properties = model.properties
      let requestedProperties = []
      for (let p in form) {
        if (properties[p])
          requestedProperties.push({name: p})
      }
      model.required.forEach(p => {
        if (!form[p]  &&  !properties[p].readOnly)
          requestedProperties.push({name: p})
      })

      let d = new Date()
      let currentYear = d.getFullYear()
      let msg
      if (currentYear > form.expiryYear)
        msg = 'The card has expired'
      else if (currentYear === form.expiryYear) {
        if (d.getMonth() > form.expiryMonth)
          msg = 'The card has expired'
      }
      return {
        message: msg  ||  translate('reviewScannedProperties'),
        requestedProperties
      }
    }
  }
}

