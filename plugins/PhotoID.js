import { TYPE } from '@tradle/constants'
import utils, { translate, isWeb, isSimulator } from '../utils/utils'
const COUNTRY = 'tradle.Country'
const PHOTO_ID = 'tradle.PhotoID'

const sideToSnap = {
  US: {
    licence: 'back'
  },
  GB: {
    licence: 'back'
  },
  BD: {
    id: 'front'
  },
  NZ: {
    licence: 'back'
  }
}
module.exports = function PhotoID ({ models }) {
  return {
    validateForm: function validateForm ({
      application,
      form,
      currentResource
    }) {
      if (form[TYPE] !== PHOTO_ID)
        return
      if (!form.documentType  ||  Array.isArray(form.documentType))
        return

      if (!isWeb()  &&  !isSimulator()  &&  !form.scanJson)
        return

      if (isWeb())
        form.uploaded = true
      let scan = form.scanJson

      const model = models[form[TYPE]]
      // Check if there is a need to clean the form
      if (scan  &&  currentResource) {
        if ((currentResource.documentType  &&  currentResource.documentType.id !== form.documentType.id)  ||
            (currentResource.country  &&  currentResource.country.id !== form.country.id)) {
          let requestedProperties = cleanupValues(form, scan, model)
          if (!isWeb())
            return requestedProperties
          scan = null
        }
      }
      console.log('PhotoID: requesting additional properties for Driver Licence')

      let isLicence = form.documentType.title.indexOf('Licence') !== -1
      let isPassport = !isLicence  &&  form.documentType.title.indexOf('Passport') !== -1
      let countryId = form.country.id.split('_')[1]
      if (scan) {
        let { document } = scan
        let countryCCA
        if (document) {
          if (isLicence)
            countryCCA =  document.country
          else
            countryCCA = document.issuer
        }
        if (countryCCA) {
          let countryModel = utils.getModel(COUNTRY)
          let country = countryModel.enum.find(country => country.id === countryCCA || country.cca3 === countryCCA)
          if (!country  ||  country.id !== countryId) {
            cleanupValues(form, scan, model)
            scan = null
          }
        }
        if (scan)
          prefillValues(form, scan, model)
      }
      let requestedProperties = getRequestedProps({scan, model, form})
      if (form.dateOfExpiry) {
        if (form.dateOfExpiry < new Date().getTime()) {
          let ret = cleanupValues(form, scan, model)
          ret.message += '. The document has expired'
          return ret
        }
      }
      if (form.dateOfBirth) {
        let isLicence = form.documentType.title.indexOf('Licence') !== -1
        if (isLicence) {
          let age = new Date().getYear() - new Date(form.dateOfBirth).getYear()
          if (age < 18) {
            let ret = cleanupValues(form, scan, model)
            ret.message += '. The document has invalid date of birth'
            return ret
          }
        }
      }
      let message
      let prop = !isPassport  &&  (isLicence && 'licence' || 'id')
      let doOtherSide = prop  &&  sideToSnap[countryId]  &&  sideToSnap[countryId][prop]
      if (doOtherSide  &&  !form.otherSideScan)
        message = translate('reviewScannedPropertiesAndSecondSideSnapshot', sideToSnap[countryId][prop])
      else
        message = translate('reviewScannedProperties')
      if (doOtherSide)
        form.otherSideToScan = sideToSnap[countryId][prop]

      return {
        message,
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
    if (form[p])
      continue
    let val = values[p]
    if (typeof val === 'object')
      prefillValues(form, val, model)
    else if (!props[p]) {
      if (p === 'birthData'  &&  !form.dateOfBirth) {
        let parts = val.split(' ')
        form.dateOfBirth = new Date(parts[0]).getTime()
      }
    }
    else if (props[p].type === 'date'  &&  typeof val === 'string')
      form[p] = new Date(val).getTime() //formatDate(val, 'yyyy-mm-dd')
    else {
      let ref = props[p].ref
      // Need checking
      if (ref  &&  utils.isEnum(ref)) {
        if (ref === 'tradle.Sex') {
          let v = val.toLowerCase().charAt(0) === 'm'  &&  'Male'  ||  'Female'
          let enumValue = utils.getModel(ref).enum.find(r => r.id === v)

          form[p] = {
            id: ref + '_' + enumValue.id,
            title: enumValue.title
          }
        }
      }
      else
        form[p] = val
    }
  }
}
function getRequestedProps({scan, model, requestedProperties, form}) {
  if (!requestedProperties)
    requestedProperties = []
  let isLicence = form.documentType.title.indexOf('Licence') !== -1
  let isID = !isLicence  &&  form.documentType.title.indexOf('ID') !== -1
  if (!scan) {
    if (isLicence)
      requestedProperties = [{name: 'personal_group'}, {name: 'address_group'}, {name: 'document_group'}]
    else {
      if (isID)
        requestedProperties = [{name: 'personal_group'}, {name: 'nationality'}, {name: 'sex'}, {name: 'idCardDocument_group'}]
      else
        requestedProperties = [{name: 'personal_group'}, {name: 'nationality'}, {name: 'sex'}, {name: 'document_group'}]
    }
    return requestedProperties
  }
  let props = model.properties

  if (isID  ||  isLicence)
    requestedProperties.push({name: 'otherSideScan'})
  for (let p in scan) {
    let val = scan[p]
    if (typeof val === 'object')
      getRequestedProps({scan: val, model, requestedProperties, form})
    else if (props[p])
      requestedProperties.push({name: p})
  }
  // if (!isLicence  &&  !requestedProperties.find(p => p.name === 'dateOfIssue'))
  //   requestedProperties.push({name: 'dateOfIssue'})
  if (!requestedProperties.find(p => p.name === 'dateOfBirth')) {
    if (form.dateOfBirth) {
      requestedProperties.push({name: 'dateOfBirth'})
    }
  }
  if (!isID) {
    if (!requestedProperties.find(p => p.name === 'dateOfIssue')) {
      if (!form.dateOfIssue) {
        requestedProperties.push({name: 'dateOfIssue'})
      }
    }
    if (!requestedProperties.find(p => p.name === 'dateOfExpiry')) {
      if (!form.dateOfExpiry) {
        requestedProperties.push({name: 'dateOfExpiry'})
      }
    }
  }
  return requestedProperties
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
  delete form.scan
  delete form.scanJson
  let requestedProperties
  if (isWeb()  ||  isSimulator()) {
    let isLicence = form.documentType.title.indexOf('Licence') !== -1
    if (isLicence)
      requestedProperties = [{name: 'personal_group'}, {name: 'document_group'}, {name: 'address_group'}]
    else
      requestedProperties = [{name: 'personal_group'}, {name: 'nationality'}, {name: 'sex'}, {name: 'document_group'}]
  }
  else
    requestedProperties = []
  return {
    message: translate('Please scan your document'),
    // deleteProperties: ['scan', 'scanJson'],
    requestedProperties
  }
}
// function formatDate (date, format) {
//   if (typeof date === 'string')
//     return dateformat(date, format)
//   return dateformat(new Date(date), 'UTC:' + format)
// }

