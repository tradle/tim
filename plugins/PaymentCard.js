import { TYPE } from '@tradle/constants'
import utils, { translate } from '../utils/utils'
const PAYMENT_CARD = 'tradle.CreditCard'

module.exports = function PaymentCard ({ models }) {
  return {
    validateForm: async function validateForm ({
      application,
      form,
      currentResource
    }) {
      if (form[TYPE] !== PAYMENT_CARD)
        return

      let requestedProperties = []
      let model = models[PAYMENT_CARD]
      let properties = model.properties
      if (utils.isWeb()) {
        for (let p in properties) {
          if (p.charAt(0) !== '_'  &&  !properties[p].scanner)
            requestedProperties.push({name: p})
        }
        return { requestedProperties }
      }

      let scanned = form.scanJson
      if (!scanned)
        return

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

