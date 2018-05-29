import dateformat from 'dateformat'

import { TYPE } from '@tradle/constants'
import utils, { translate, isWeb } from '../utils/utils'
const COUNTRY = 'tradle.Country'

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
      let isLicence = form.documentType.title.indexOf('Licence') !== -1

      if (isLicence) {
        let countryCCA = scan.document  &&  scan.document.country
        if (countryCCA) {
          let countryModel = utils.getModel(COUNTRY)
          // let countryId = form.country.id.split('_')[1]
          let country = countryModel.enum.find(country => country.id === countryCCA || country.cca3 === countryCCA)
          if (country.id !== form.country.id.split('_')[1]) {
            delete form.scanJson
            delete form.scan
            return {
              message: translate('Please scan your document'),
              requestedProperties: []
            }
          }
        }
      }
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
      if (isLicence) {
        requestedProperties = [
          {name: 'personal_group'},
          {name: 'address_group'},
          {name: 'document_group'}
        ]
      }
      else {
        requestedProperties = [
          {name: 'personalPassport_group'},
          {name: 'documentPassport_group'}
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
  let exclude = [ 'country' ]
  for (let p in values) {
    if (exclude.includes(p))
      continue
    let val = values[p]
    if (typeof val === 'object')
      prefillValues(form, val, model)
    else if (!props[p]) {
      if (p === 'birthData') {
        let parts = val.split(' ')
        form.dateOfBirth = new Date(parts[0]).getTime()
      }
    }
    else if (props[p].type === 'date') { //dateProps.includes(p)) {//props[p].type === 'date') {
      // form[p] = Number(val)
      if (typeof val === 'string') {
        form[p] = new Date(val).getTime() //formatDate(val, 'yyyy-mm-dd')
        val = formatDate(val, 'mmm dS, yyyy')
      }
    }
    else {
      if (!props[p])
        continue
      form[p] = val
    }
  }

  // if (form.birthData) {
  //   let parts = form.birthData.split(' ')
  //   form.birthData = formatDate(parts[0], 'mmm dS, yyyy')
  // }
}
function formatDate (date, format) {
  if (typeof date === 'string')
    return dateformat(date, format)
  return dateformat(new Date(date), 'UTC:' + format)
}

