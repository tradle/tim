import { TYPE } from '@tradle/constants'
import { getModel, getPropertiesWithAnnotation, isSubclassOf } from '../utils/utils'

const COUNTRY = 'tradle.Country'
const FORM = 'tradle.Form'
const PROOF_OF_ADDRESS = 'tradle.ProofOfAddress'
const UTILITY_BILL = 'tradle.UtilityBill'

module.exports = function ProofOfAddress ({ models }) {
  return {
    validateForm: async function validateForm ({
      application,
      form
    }) {
      if (!application) return

      let model = getModel(form[TYPE])
      if (!isSubclassOf(model, PROOF_OF_ADDRESS))
        return
      return getPropsForProofOfAddress(form)
    }
  }
}
function getPropsForProofOfAddress(form) {
  // if (!form.document  ||  !form.country) {
  //   return {
  //     requestedProperties: [
  //       { name: 'country' },
  //       { name: 'document' }
  //     ]
  //   }
  // }
  let propsArr = [
    'accountName',
    'billDate',
    'issuer',
    'issuerPhoneNumber',
    'streetAddress',
    'city',
    'town',
    'postalCode',
    'country',
    'document',
    'referenceNo',
    'phoneNumber',
    'accountNumber'
  ]
  let setProps = propsArr.filter(p => form[p])
  if (setProps.length <= 2) {
    let requestedProperties = [
      { name: 'document' }
    ]

    if (form[TYPE] !== UTILITY_BILL)
      requestedProperties.push({ name: 'country' })

    return { requestedProperties }
  }

  // let props = getModel(form[TYPE]).properties
  // let requestedProperties = []
  // propsArr.forEach(p => {
  //   if (props[p])
  //     requestedProperties.push({ name: p })
  // })
  // return { requestedProperties }
}

