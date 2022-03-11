import { TYPE } from '@tradle/constants'
import { translate, isWeb, isSimulator, buildStubByEnumTitleOrId, isEnum, getModel } from '../utils/utils'
import ENV from '../utils/env'
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
    validateForm: async function validateForm ({
      application,
      form,
      currentResource
    }) {
      if (form[TYPE] !== PHOTO_ID)
        return

      const { documentType, scanJson, otherSideScan, otherSideToScan, dateOfExpiry, dateOfBirth, dateOfIssue } = form
      if (!documentType  ||  Array.isArray(documentType))
        return
      let isOther = form.documentType.id.indexOf('_other') !== -1
      if (!isWeb()  &&  !isSimulator()  &&  !scanJson  &&  !isOther)
        return

      if (isWeb()  ||  isOther)
        form.uploaded = true
      let scan = scanJson

      const model = models[form[TYPE]]
      // Check if there is a need to clean the form
      if (currentResource) {
        if ((currentResource.documentType  &&  currentResource.documentType.id !== form.documentType.id)  ||
            (currentResource.country  &&  currentResource.country.id !== form.country.id)) {
          let requestedProperties = scan  &&  cleanupValues(form, scan, model)
          form.scan = null
          if (!isWeb()  &&  !isOther) {
            cleanupValues(form, scan, model)
            return requestedProperties
          }

          scan = null
        }
      }

      console.log('PhotoID: requesting additional properties for Driver Licence')

      let message = ''

      let isLicence = documentType.title.indexOf('Licence') !== -1
      let isPassport = !isLicence  &&  documentType.title.indexOf('Passport') !== -1
      let countryId = form.country  &&  form.country.id.split('_')[1]
      let cleanedup
      if (scan) {
        let { document } = scan
        let countryCCA
        if (document) {
          countryCCA = document.country
          if (!countryCCA  && !isLicence)
            countryCCA = document.issuer
        }
        if (countryCCA) {
          let countryModel = getModel(COUNTRY)
          let country = countryModel.enum.find(country => country.id === countryCCA || country.cca3 === countryCCA)
          if (!country)
            message = translate('invalidCountry', countryCCA)

          if (!country  ||  country.id !== countryId) {
            // message = translate('invalidCountry', countryCCA)
            cleanedup = cleanupValues(form, scan, model)
            scan = null
          }
        }
        if (scan)
          prefillValues(form, scan, model)
      }
      let requestedProperties = getRequestedProps({scan, model, form, countryId})
      if (dateOfExpiry) {
        if (dateOfExpiry < new Date().getTime()) {
          if (!cleanedup)
            cleanedup = cleanupValues(form, scan, model)
          cleanedup.message = 'The document has expired. ' + message
          return cleanedup
        }
      }
      if (dateOfBirth) {
        let isLicence = documentType.title.indexOf('Licence') !== -1
        if (isLicence) {
          let age = new Date().getYear() - new Date(dateOfBirth).getYear()
          if (age < 18) {
            if (!cleanedup)
              cleanedup = cleanupValues(form, scan, model)
            cleanedup.message = 'The document has invalid date of birth. ' + message
            return cleanedup
          }
        }
      }
      if (dateOfIssue) {
        if (dateOfIssue > Date.now()) {
          if (message.length)
            message += ' '
          message += translate('dateInTheFutureError', translate(model.properties.dateOfIssue))
        }
      }
      let prop = !isPassport  &&  (isLicence && 'licence' || 'id')
      if (ENV.documentScanner === 'blinkid'  ||  isOther) {
        let doOtherSide = prop  &&  sideToSnap[countryId]  &&  sideToSnap[countryId][prop]
        if (doOtherSide  &&  !otherSideScan)
          message += ' ' + translate('reviewScannedPropertiesAndSecondSideSnapshot', sideToSnap[countryId][prop])
        else
          message += ' ' + translate('reviewScannedProperties')
        if (doOtherSide)
          form.otherSideToScan = sideToSnap[countryId][prop]
      }

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
  let countryModel = getModel(COUNTRY)
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
      if (ref  &&  isEnum(ref)) {
        if (ref === 'tradle.Sex') {
          let ch = val.toLowerCase().charAt(0)
          let docType = form.documentType.id.split('_')[1]
          let enumL = getModel(ref).enum
          let v
          // HACK
          if (docType === 'id') {
            if (form.country.title === 'Mexico') {
              if (ch === 'm')
                v = 'Female'
              else
                v = 'Male'
            }
          }
          if (!v)
            v = ch === 'm'  &&  'Male'  ||  'Female'

          let enumValue = enumL.find(r => r.id === v)

          form[p] = {
            id: ref + '_' + enumValue.id,
            title: enumValue.title
          }
        }
        else if (typeof val === 'string'  &&  ref === COUNTRY) {
          let country = countryModel.enum.find(country => country.id === val || country.cca3 === val)
          form[p] = country && buildStubByEnumTitleOrId(countryModel, country.id) || null
        }
      }
      else
        form[p] = val
    }
  }
}
function getRequestedProps({scan, model, requestedProperties, form, countryId}) {
  if (!requestedProperties)
    requestedProperties = []
  let { documentType } = form

  let isLicence = documentType.title.indexOf('Licence') !== -1
  let isOther = documentType.id.indexOf('_other') !== -1
  let isID = !isLicence  &&  documentType.title.indexOf('ID') !== -1
  let commonRP = [
    {name: 'documentType'},
    {name: 'scan'}
  ]
  if (isLicence) {
    switch (countryId) {
      case 'NZ':
        requestedProperties = [
          {name: 'otherSideScan'},
          {name: 'country'},
          {name: 'personal_group'},
          {name: 'middleName'},
          {name: 'address_group'},
          {name: 'city'},
          {name: 'document_group'},
          {name: 'documentVersion'}
        ]
        break
      case 'PH':
        requestedProperties = [
          {name: 'otherSideScan'},
          {name: 'country'},
          {name: 'personal_group'},
          {name: 'address_group'},
          {name: 'documentNumber'},
          {name: 'dateOfExpiry'}
          ]
        break
      default:
        requestedProperties = [
        {name: 'otherSideScan'},
        {name: 'country'},
        {name: 'personal_group'},
        {name: 'placeOfBirth', required: countryId === 'DE'},
        {name: 'address_group'},
        {name: 'document_group'},
        {name: 'issuer'}
        ]
        if (form.full)
          requestedProperties.splice(3, 0, {name: 'addressDetails_group', required: true})
    }
    // if (countryId === 'NZ')
    //   requestedProperties = [{name: 'otherSideScan'}, {name: 'personal_group'}, {name: 'middleName'}, {name: 'address_group'}, {name: 'city'}, {name: 'document_group'}, {name: 'documentVersion'}]
    // else if (countryId === 'PH')
    //   requestedProperties = [{name: 'otherSideScan'}, {name: 'personal_group'}, {name: 'address_group'}, {name: 'documentNumber'}, {name: 'dateOfExpiry'}, {name: 'documentVersion'}]
    // else
    //   requestedProperties.push({name: 'issuer'})
    // requestedProperties.splice(1, 0, {name: 'country'})
  }
  else if (isID) {
    requestedProperties = [
      {name: 'otherSideScan'},
      {name: 'personal_group'},
      {name: 'placeOfBirth', required: countryId === 'DE'},
      {name: 'nationality'},
      {name: 'sex'},
      {name: 'idCardDocument_group'},
      {name: 'dateOfIssue'},
      ]
    if (form.middleName)
      requestedProperties.splice(2, 0, {name: 'middleName'})
    requestedProperties.splice(1, 0, {name: 'country'})
  }
  else if (isOther) {
    requestedProperties = [
     {name: 'personal_group'},
     {name: 'placeOfBirth'},
     {name: 'nationality'},
     {name: 'sex'},
     {name: 'idCardDocument_group'}
     ]
  }
  else {
    requestedProperties = [
      {name: 'personal_group'},
      {name: 'placeOfBirth', required: countryId === 'DE'},
      {name: 'nationality'},
      {name: 'sex'},
      {name: 'lastNameAtBirth'},
      {name: 'document_group'},
      {name: 'issuer'}
      ]
  }
  requestedProperties.splice(0, 0, {name: 'country'})

  return commonRP.concat(requestedProperties)
}
function cleanupValues(form, values, model) {
  let props = model.properties
  let exclude = []
  for (let p in values) {
    if (exclude.includes(p))
      continue
    let val = values[p]
    if (typeof val === 'object')
      cleanupValues(form, val, model, exclude)
    else if (!props[p]) {
      if (p === 'birthData') {
        delete form[p]
        delete form['dateOfBirth']
      }
    }
    else
      delete form[p]
  }
  delete form.scan
  delete form.scanJson
  let requestedProperties
  if (isWeb()  ||  isSimulator()  ||  form.documentType.id.indexOf('_other') !== -1) {
    let isLicence = form.documentType.title.indexOf('Licence') !== -1
    let commonRP = [
      {name: 'documentType'},
      {name: 'country'},
      {name: 'scan'}
    ]
    if (isLicence) {
      requestedProperties = [
         {name: 'personal_group'},
         {name: 'document_group'},
         {name: 'address_group'}
         ]
    }
    else {
      requestedProperties = [
        {name: 'personal_group'},
        {name: 'nationality'},
        {name: 'sex'},
        {name: 'document_group'}]
    }
    requestedProperties = commonRP.concat(requestedProperties)
  }
  else
    requestedProperties = []
  return {
    message: translate('scanYourDocument'),
    // deleteProperties: ['scan', 'scanJson'],
    requestedProperties
  }
}
// function formatDate (date, format) {
//   if (typeof date === 'string')
//     return dateformat(date, format)
//   return dateformat(new Date(date), 'UTC:' + format)
// }

