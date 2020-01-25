import omit from 'lodash/omit'

import { TYPE } from '@tradle/constants'

import validateResource from '@tradle/validate-resource'

import { getModel, getPropertiesWithAnnotation, isNew, getEnumValueId } from '../utils/utils'

const CONTROLLING_ENTITY = 'tradle.legal.LegalEntityControllingPerson'
const OWNERSHIP = 'tradle.legal.Ownership'
const LEGAL_ENTITY = 'tradle.legal.LegalEntity'
const LEGAL_DOCUMENT_INTERSECTION = 'tradle.legal.LegalEntityLegalDocument'
const LEGAL_DOCUMENT = 'tradle.legal.LegalDocument'
const TYPE_OF_OWNERSHIP = 'tradle.legal.TypeOfOwnership'
const COUNTRY = 'tradle.Country'

module.exports = function LegalEntity ({ models }) {
  return {
    validateForm: function validateForm ({
      application,
      form
    }) {
      if (!application) return

      const type = form[TYPE]
      switch (type) {
      case CONTROLLING_ENTITY:
        return getPropsForControllingEntity(form)
      case OWNERSHIP:
        return getPropsForOwnership(form)
      case LEGAL_ENTITY:
        return getPropsForLegalEntity(form)
      case LEGAL_DOCUMENT_INTERSECTION:
        return getPropsForLegalDocumentI(form)
      default:
        if (getModel(type).subClassOf === LEGAL_DOCUMENT)
          return getPropsForLegalDocument(form)
      }
    }
  }
}
function getPropsForLegalDocumentI(form) {
  if (form.documentType) {
    return {
      requestedProperties: [
        { name: 'documentType' },
        { name: 'document' },
      ]
    }
  }
  else
    return {
      requestedProperties: [
        { name: 'documentType' },
      ]
    }
}
function getPropsForLegalDocument(form) {
  const props = getModel(form[TYPE]).properties
  let countryProp
  let docProp
  for (let p in props) {
    const prop = props[p]
    if (prop.ref === COUNTRY)
      countryProp = prop.name
    else if (prop.range === 'document')
      docProp = prop.name
  }
  if (!countryProp  ||  !docProp)
    return
  // let regionProp = subProps.find(p => p.subPropertyOf === 'region')
  // const { document, country, registrationNumber, region } = form
  const country = form[countryProp]
  const region = form.region
  if (!country) {
    return {
      requestedProperties: [
        { name: countryProp },
        { name: docProp },
      ]
    }
  }
  if (!form.registrationNumber) {
    if (country  &&  country.id.split('_')[1] === 'US') {
      return {
        requestedProperties: [
          { name: countryProp },
          { name: 'region' },
          { name: docProp },
        ]
      }
    }
    return {
      requestedProperties: [
        { name: countryProp },
        { name: docProp },
      ]
    }
  }
  let ret = {
    requestedProperties: [
    ]
  }
  for (let p in props) {
    ret.requestedProperties.push({name: p})
  }
  return ret
}
function getPropsForLegalEntity(form) {
  let { streetAddress, city, postalCode, country } = form
  let addRegion = country  &&  country.id.split('_')[1] === 'US'

  if (isNew(form)) {
    let requestedProperties = [
        { name: 'companyName', required: true  },
        { name: 'registrationNumber', required: true },
        { name: 'DBAName' },
        { name: 'formerlyKnownAs'}
      ]

    if (streetAddress)
      requestedProperties.push({name: 'streetAddress'})
    if (city)
      requestedProperties.push({name: 'city'})
    if (postalCode)
      requestedProperties.push({name: 'postalCode'})
    if (addRegion)
      requestedProperties.push({name: 'region', required: true})

    requestedProperties.push({ name: 'country', required: true })

    let omitArr = ['companyName', 'registrationNumber', 'country', 'city', 'streetAddress', 'postalCode', 'region']
    let props = getModel(form[TYPE]).properties
    let moreProps = omit(form, omitArr)
    for (let p in moreProps)  {
      if (p.charAt(0) !== '_'  &&  props[p])
        requestedProperties.push({name: p})
    }
    return { requestedProperties }
  }
  let reqProps = {
    requestedProperties: [
      { name: 'info_group' },
      { name: 'registrationDate', required: true },
      { name: 'typeOfOwnership', required: true },
      { name: 'companyType'},
      { name: 'companyEmail', required: true },
      { name: 'companyWebsite', required: true },
      { name: 'address_group'},
      { name: 'region', hide: !addRegion, required: addRegion },
      { name: 'taxIdNumber', required: false },
      { name: 'companyFax', required: false },
      { name: 'companyPhone', required: false },
      { name: 'DBAName', required: false },
      { name: 'formerlyKnownAs'},
      { name: 'alsoKnownAs' }
    ]
  }
  if (form.typeOfOwnership  &&  form.typeOfOwnership.id.endsWith('_publiclyTraded'))
    reqProps.requestedProperties.splice(3, 0, {name: 'tradedOnExchange', required: true})
  return reqProps
}
function isNewResource(stub) {
  const parts = stub.id.split('_')
  return parts[1] === parts[2]
}

function getPropsForControllingEntity(form) {
  let typeOfControllingEntity = form.typeOfControllingEntity
  if (!typeOfControllingEntity)
    return {
      requestedProperties: [
        {name: 'typeOfControllingEntity'},
      ]
    }

  let typeOfOwnership = form.ownsTypeOfOwnership  &&  getEnumValueId({model: getModel(TYPE_OF_OWNERSHIP), value: form.ownsTypeOfOwnership})
  let isTrustee = typeOfOwnership && typeOfOwnership.startsWith('trustee')
  let id = typeOfControllingEntity.id.split('_')[1].toLowerCase()
  switch (id) {
  case 'person':
    let retProps = {
      requestedProperties: [
        {name: 'name', required: true},
        {name: 'typeOfControllingPerson', required: true},
        {name: 'natureOfControl'},
        {name: 'percentageOfOwnership'},
        {name: 'inactive'},
      ]
    }
    retProps.requestedProperties.push({name: 'emailAddress', required: true})
    if (form.notificationMethod  &&  form.notificationMethod.id.endsWith('_sms'))
      retProps.requestedProperties.push({name: 'phone', required: true})

    if (!form.inactive) {
      retProps.requestedProperties.push({name: 'personal_group', required: true})
      retProps.requestedProperties.push({name: 'middleName', required: false})
      if (form.controllingEntityCountryOfResidence  &&  getEnumValueId({model: getModel(COUNTRY), value: form.controllingEntityCountryOfResidence}) == 'DE')
        retProps.requestedProperties.push({name: 'controllingEntityPlaceOfBirth', required: false})
    }

    // retProps.requestedProperties.push({name: 'notificationMethod'})
    retProps.requestedProperties.push({name: 'isSeniorManager'})
    if (form.isSeniorManager)
      retProps.requestedProperties.push({name: 'seniorManagerPosition', required: true})

    retProps.requestedProperties.push({name: 'typeOfOwnership'})

    if (isTrustee) {
      // debugger
      retProps.requestedProperties.push({name: 'roleInTrust', required: true})
    }
    if (typeOfOwnership === 'vcFirmFundPE') {
      retProps.requestedProperties.push({name: 'isGeneralPartner'})
      retProps.requestedProperties.push({name: 'isLimitedPartner'})
      if (form.isLimitedPartner)
        retProps.requestedProperties.push({name: 'sourceOfFunds', required: true})
    }

    if (form.name) {
      retProps.requestedProperties = retProps.requestedProperties.concat([
        // {name: 'dateOfBirth'},
        {name: 'startDate'},
        {name: 'endDate'},
        {name: 'occupation'},
        {name: 'doNotReachOut'},
      ])
    }
    retProps.requestedProperties.push({name: 'legalEntity', required: true})

    return retProps
  case 'legalentity':
    let requestedProps = {
      requestedProperties: [
        // {name: 'controllingLegalEntity'},
        {name: 'name'},
        {name: 'emailAddress', required: true},
        {name: 'controllingEntityCompanyNumber', required: true},
        {name: 'controllingEntityRegistrationDate', required: true},
        {name: 'typeOfOwnership', required: true},
        {name: 'companyType'},
        {name: 'controllingEntityStreetAddress'},
        {name: 'controllingEntityRegion'},
        {name: 'controllingEntityPostalCode'},
        {name: 'controllingEntityCountry', required: true},
        {name: 'natureOfControl'},
        {name: 'percentageOfOwnership'},
        {name: 'phone'},
        {name: 'legalEntity'},
        {name: 'doNotReachOutToMembers'},
      ]
    }
    let idx = requestedProps.requestedProperties.findIndex(p => p.name === 'typeOfOwnership')
    if (isTrustee)
      requestedProps.requestedProperties.splice(idx++, 0, {name: 'roleInTrust', required: true})
    if (form.typeOfOwnership  &&  form.typeOfOwnership.id.endsWith('_publiclyTraded'))
      requestedProps.requestedProperties.splice(idx++, 0, {name: 'tradedOnExchange', required: true})

    if (form.typeOfOwnership) {
      if (getEnumValueId({model: getModel(TYPE_OF_OWNERSHIP), value: form.ownsTypeOfOwnership}) === 'vcFirmFundPE')
        requestedProps.requestedProperties.splice(idx, 0, {name: 'limitedPartnershipAgreement', required: true})
    }
    if (typeOfOwnership === 'vcFirmFundPE') {
      requestedProps.requestedProperties.push({name: 'isLimitedPartner'})
      if (form.isLimitedPartner)
        requestedProps.requestedProperties.push({name: 'sourceOfFunds', required: true})
    }
    return requestedProps
  }
}
function getPropsForOwnership(form) {
  let typeOfLegalEntity = form.typeOfEntity
  if (!typeOfLegalEntity)
    return {
      requestedProperties: [{name: 'typeOfEntity'}]
    }
  let id = typeOfLegalEntity.id.split('_')[1].toLowerCase()
  switch (id) {
  case 'subsidiary':
    return {
      requestedProperties: [
        {name: 'percentageOfOwnership'},
        {name: 'owns'},
        {name: 'ownedBy'}
      ]
    }
  case 'branch':
    form.percentageOfOwnership = 100
    return {
      requestedProperties: [
        {name: 'owns'},
        {name: 'ownedBy'}
      ]
    }
  }
}
