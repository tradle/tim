import dateformat from 'dateformat'

import { TYPE } from '@tradle/constants'
import utils, { translate, isWeb } from '../utils/utils'

module.exports = function PhotoID ({ models }) {
  return {
    validateForm: function validateForm ({
      application,
      form
    }) {
      if (form[TYPE] !== 'tradle.PhotoID')
        return
      if (!form.documentType)
        return
      if (!isWeb()  &&  !form.scanJson)
        return

      const type = form[TYPE]
      const model = models[type]

      const ret = {}
      console.log('PhotoID: requesting additional properties for Driver Licence')

      let scan = form.scanJson

      // cleanup the prefill from the previous scan if there was one
      let props = model.properties

      for (let p in props) {
        let prop = props[p]
        if (prop.list) { //p.indexOf('_group') !== -1) {
          prop.list.forEach((pName) => {
            if (pName.indexOf('_group') === -1)
              delete form[pName]
          })
        }
      }

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
  // let dateProps = ['dateOfExpiry', 'dateOfBirth', 'dateOfIssue']
  for (let p in values) {
    let val = values[p]
    if (typeof val === 'object')
      prefillValues(form, val, model)
    else if (props[p].type === 'date') { //dateProps.includes(p)) {//props[p].type === 'date') {
      // form[p] = Number(val)
      if (typeof val === 'string') {
        form[p] = formatDate(val, 'yyyy-mm-dd')
        val = formatDate(val, 'mmm dS, yyyy')
      }
    }
    else {
      if (!props[p])
        continue
      form[p] = val
    }
  }
  if (form.birthData) {
    let parts = form.birthData.split(' ')
    form.birthData = formatDate(parts[0], 'mmm dS, yyyy')
  }
}
function formatDate (date, format) {
  if (typeof date === 'string')
    return dateformat(date, format)
  return dateformat(new Date(date), 'UTC:' + format)
}

