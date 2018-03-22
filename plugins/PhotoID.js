import dateformat from 'dateformat'

import { TYPE } from '@tradle/constants'
import { translate } from '../utils/utils'

module.exports = function PhotoID ({ models }) {
  return {
    validateForm: function validateForm ({
      application,
      form
    }) {
      if (form[TYPE] !== 'tradle.PhotoID')
        return
      if (!form.documentType  ||  !form.scanJson)
        return

      const type = form[TYPE]
      const model = models[type]

      const ret = {}
      console.log('PhotoID: requesting additional properties for Driver Licence')

      let scan = form.scanJson
      prefillValues(form, scan, model)
      // for (let p in originalModel.properties) {
      //   if (scan[p])
      //     form[p] = scan[p]
      // }
      let requestedProperties
      if (form.documentType.title.indexOf('Passport') !== -1) {
        requestedProperties = [
          {name: 'personalPassport_group'},
          {name: 'documentPassport_group'}
        ]
      }
      else {
        requestedProperties = [
          {name: 'personal_group'},
          {name: 'address_group'},
          {name: 'document_group'}
        ]
      }

      return {
        message: translate('reviewScannedProperties'),
        requestedProperties
      }
    }
  }
}
function prefillValues(form, values, model) {
  let props = model.properties
  let dateProps = ['dateOfExpiry', 'dateOfBirth', 'dateOfIssue', 'birthData']
  for (let p in values) {
    if (typeof values[p] === 'object')
      prefillValues(form, values[p], model)
    else if (dateProps.includes(p)) {//props[p].type === 'date') {
      // form[p] = Number(values[p])
      form[p] = formatDate(values[p], 'yyyy-mm-dd')
      values[p] = formatDate(values[p], 'mmm dS, yyyy')
    }
    else {
      if (!props[p])
        continue
      form[p] = values[p]
    }
  }
}
function formatDate (date, format) {
  if (typeof date === 'string')
    return dateformat(date, format)
  return dateformat(new Date(date), 'UTC:' + format)
}

