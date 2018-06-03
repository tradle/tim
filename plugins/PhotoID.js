import dateformat from 'dateformat'

import { TYPE } from '@tradle/constants'
import utils, { translate, isWeb } from '../utils/utils'
const COUNTRY = 'tradle.Country'
const PHOTO_ID = 'tradle.PhotoID'

module.exports = function PhotoID ({ models }) {
  return {
    validateForm: function validateForm ({
      application,
      form,
      currentResource
    }) {
      if (form[TYPE] !== PHOTO_ID)
        return
      if (!form.documentType)
        return
      if (!isWeb()  &&  !form.scanJson)
        return
      let scan = form.scanJson
      const model = models[form[TYPE]]

      // Check if there is a need to clean the form
      if (currentResource) {
        if (currentResource.documentType.id !== form.documentType.id  ||
            currentResource.country.id !== form.country.id)
          return cleanupValues(form, scan, model)
      }

      console.log('PhotoID: requesting additional properties for Driver Licence')

      let isLicence = form.documentType.title.indexOf('Licence') !== -1

      let { document } = scan
      let countryCCA = document && (isLicence && document.country || document.issuer)
      if (countryCCA) {
        let countryModel = utils.getModel(COUNTRY)
        // let countryId = form.country.id.split('_')[1]
        let country = countryModel.enum.find(country => country.id === countryCCA || country.cca3 === countryCCA)
        if (country.id !== form.country.id.split('_')[1])
          cleanupValues(form, scan, model)
      }
      prefillValues(form, scan, model)

      let requestedProperties = []
      getRequestedProps(scan, model, isLicence, requestedProperties)

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
  // Check if this is a new scan
  let exclude = [ 'country' ]
  for (let p in values)
    if (form[p])
      exclude.push(p)
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
    else if (props[p].type === 'date'  &&  typeof val === 'string')
      form[p] = new Date(val).getTime() //formatDate(val, 'yyyy-mm-dd')
    else
      form[p] = val
  }
}
function getRequestedProps(values, model, isLicence, requestedProperties) {
  if (!values)
    return
  let props = model.properties

  for (let p in values) {
    let val = values[p]
    if (typeof val === 'object')
      getRequestedProps(val, model, isLicence, requestedProperties)
    else if (props[p])
      requestedProperties.push({name: p})
  }
  if (!isLicence  &&  !requestedProperties.find(p => p.name === 'dateOfIssue'))
    requestedProperties.push({name: 'dateOfIssue'})
  // if (!requestedProperties.find(p => p.name === 'dateOfBirth'))
  //   requestedProperties.push({name: 'dateOfBirth'})
}
function cleanupValues(form, values, model) {
  let props = model.properties
  let exclude = [ 'country' ]
  for (let p in values) {
    if (exclude.includes(p))
      continue
    let val = values[p]
    if (typeof val === 'object')
      cleanupValues(form, val, model)
    else if (!props[p]) {
      if (p === 'birthData')
        delete form[p]
    }
    else
      delete form[p]
  }
  return {
    message: translate('Please scan your document'),
    deleteProperties: ['scan', 'scanJson'],
    requestedProperties: []
  }
}
// function formatDate (date, format) {
//   if (typeof date === 'string')
//     return dateformat(date, format)
//   return dateformat(new Date(date), 'UTC:' + format)
// }

