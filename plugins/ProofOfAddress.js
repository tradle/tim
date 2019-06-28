import { TYPE } from '@tradle/constants'
import { getModel, getPropertiesWithAnnotation, isSubclassOf } from '../utils/utils'

const COUNTRY = 'tradle.Country'
const FORM = 'tradle.Form'
const PHONE_BILL = 'tradle.PhoneBill'

module.exports = function LegalEntity ({ models }) {
  return {
    validateForm: function validateForm ({
      application,
      form
    }) {
      if (!application) return

      let model = getModel(form[TYPE])
      if (!isSubclassOf(model, FORM))
        return
      return getPropsForLegalDocumentI(form)
    }
  }
}
function getPropsForLegalDocumentI(form) {
  if (form.document) {
    let rp = {
        requestedProperties: [
          { name: 'accountName' },
          { name: 'billDate' },
          { name: 'issuedBy' },
          { name: 'streetAddress' },
          { name: 'city' },
          { name: 'town' },
          { name: 'postalCode' },
          { name: 'country' },
          { name: 'document' },
        ]
      }

    if (form[TYPE] === PHONE_BILL)
      rp.requestedProperties.push({ name: 'referenceNo' })
    return rp
  }
  else
    return {
      requestedProperties: [
        { name: 'country' },
        { name: 'document' }
      ]
    }
}

