import omit from 'lodash/omit'

import { TYPE } from '@tradle/constants'

import validateResource from '@tradle/validate-resource'

import { getModel, getLensedModel, getPropertiesWithAnnotation, isNew, getEnumValueId } from '../utils/utils'

const CONTROLLING_ENTITY = 'tradle.legal.LegalEntityControllingPerson'
const OWNERSHIP = 'tradle.legal.Ownership'
const LEGAL_ENTITY = 'tradle.legal.LegalEntity'
const LEGAL_DOCUMENT_INTERSECTION = 'tradle.legal.LegalEntityLegalDocument'
const LEGAL_DOCUMENT = 'tradle.legal.LegalDocument'
const TYPE_OF_OWNERSHIP = 'tradle.legal.TypeOfOwnership'
const NOTIFICATION_METHOD = 'tradle.NotificationMethod'
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
        return getPropsForControllingEntity(form, this.models)
      case OWNERSHIP:
        return getPropsForOwnership(form)
      case LEGAL_ENTITY:
        return getPropsForLegalEntity(form, this.models)
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
function getPropsForLegalEntity(form, models) {
  let { streetAddress, city, postalCode, country } = form
  let countryCode = country  &&  country.id.split('_')[1]

  let props = getModel(form[TYPE]).properties
  let addRegion
  if (props.region.showIf) {
    if (props.region.showIf.indexOf (` == '${countryCode}'`) !== -1)
      addRegion = true
  }
  // let addRegion = countryCode && country.id.split('_')[1] === 'US'

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
  let requestedProperties = [
    { name: 'info_group' },
    { name: 'registrationDate', required: true },
    { name: 'typeOfOwnership', required: true },
    { name: 'numberOfEmployees'},
    // { name: 'companyType'},
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
  let { typeOfOwnership } = form
  if (typeOfOwnership  &&  getEnumValueId({ model: getModel(TYPE_OF_OWNERSHIP), value: typeOfOwnership}) === 'publiclyTraded')
    requestedProperties.splice(3, 0, {name: 'tradedOnExchange', required: true})
  const { hidden } = models[form[TYPE]]
  if (hidden  &&  hidden.length) {
    let rp = requestedProperties.filter(p => hidden.indexOf(p.name) === -1)
    requestedProperties = rp
  }
  return { requestedProperties }
}
function isNewResource(stub) {
  const parts = stub.id.split('_')
  return parts[1] === parts[2]
}

function getPropsForControllingEntity(form, models) {
  let m = models[form[TYPE]]
  if (m.lens  &&  m.editCols) {
    let requestedProperties = []
    m.editCols.forEach(p => requestedProperties.push({name: p}))
    return { requestedProperties }
  }

  let typeOfControllingEntity = form.typeOfControllingEntity
  if (!typeOfControllingEntity)
    return {
      requestedProperties: [
        {name: 'typeOfControllingEntity'},
      ]
    }

  let { isSeniorManager,
        controllingEntityCountryOfResidence,
        isLimitedPartner,
        inactive,
        notificationMethod,
        typeOfOwnership,
        ownsTypeOfOwnership } = form

  ownsTypeOfOwnership = ownsTypeOfOwnership  &&  getEnumValueId({model: getModel(TYPE_OF_OWNERSHIP), value: ownsTypeOfOwnership})
  typeOfOwnership = typeOfOwnership  &&  getEnumValueId({model: getModel(TYPE_OF_OWNERSHIP), value: typeOfOwnership})

  let isTrustee = ownsTypeOfOwnership && ownsTypeOfOwnership.startsWith('trustee')
  let isFund = ownsTypeOfOwnership === 'vcFirmFundPE'
  let id = typeOfControllingEntity.id.split('_')[1].toLowerCase()
  let requestedProperties
  switch (id) {
  case 'person':
    requestedProperties = [
      {name: 'name', required: true},
      // {name: 'typeOfControllingPerson', required: true},
      {name: 'natureOfControl'},
      {name: 'percentageOfOwnership'},
      {name: 'sourceOfWealth', required: isFund  &&  isLimitedPartner},
      {name: 'evidenceOfSourceOfWealth', required: isFund && isLimitedPartner},
      {name: 'inactive'},
      {name: 'previousAddresses'},
      {name: 'controllingEntityStreetAddress'},
      {name: 'controllingEntityRegion'},
      {name: 'controllingEntityPostalCode'},
      {name: 'controllingEntityCountry', required: true},
    ]

    requestedProperties.push({name: 'emailAddress', required: true})
    if (notificationMethod  &&  getEnumValueId({model: getModel(NOTIFICATION_METHOD), value: notificationMethod}) === 'sms')
      requestedProperties.push({name: 'phone', required: true})

    if (!inactive) {
      requestedProperties.push({name: 'personal_group', required: true})
      requestedProperties.push({name: 'middleName', required: false})
      if (controllingEntityCountryOfResidence  &&  getEnumValueId({model: getModel(COUNTRY), value: controllingEntityCountryOfResidence}) == 'DE')
        requestedProperties.push({name: 'controllingEntityPlaceOfBirth', required: false})
      requestedProperties.push({name: 'nationality'})
    }

    // requestedProperties.push({name: 'notificationMethod'})
    requestedProperties.push({name: 'isSeniorManager'})
    if (isSeniorManager)
      requestedProperties.push({name: 'seniorManagerPosition', required: true})

    requestedProperties.push({name: 'typeOfOwnership'})

    if (isTrustee) {
      // debugger
      requestedProperties.push({name: 'roleInTrust', required: true})
    }
    if (isFund) {
      requestedProperties.push({name: 'isGeneralPartner'})
      requestedProperties.push({name: 'isLimitedPartner'})
    }

    if (form.name) {
      requestedProperties = requestedProperties.concat([
        // {name: 'dateOfBirth'},
        {name: 'startDate'},
        {name: 'endDate'},
        {name: 'occupation'},
        {name: 'doNotReachOut'},
      ])
    }
    requestedProperties.push({name: 'legalEntity', required: true})
    break
  case 'legalentity':
    requestedProperties = [
      // {name: 'controllingLegalEntity'},
      {name: 'name', required: true},
      {name: 'emailAddress', required: true},
      {name: 'controllingEntityCompanyNumber', required: true},
      {name: 'controllingEntityRegistrationDate', required: true},
      {name: 'typeOfOwnership', required: true},
      // {name: 'companyType'},
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
    let idx = requestedProperties.findIndex(p => p.name === 'typeOfOwnership')
    if (isTrustee)
      requestedProperties.splice(idx++, 0, {name: 'roleInTrust', required: true})
    if (typeOfOwnership === 'publiclyTraded')
      requestedProperties.splice(idx++, 0, {name: 'tradedOnExchange', required: true})

    if (typeOfOwnership === 'vcFirmFundPE')
      requestedProperties.splice(idx, 0, {name: 'limitedPartnershipAgreement', required: true})
    if (ownsTypeOfOwnership === 'vcFirmFundPE') {
      requestedProperties.push({name: 'isLimitedPartner'})
      if (isLimitedPartner)
        requestedProperties.push({name: 'sourceOfFunds', required: true})
    }
    break
  }
  const { hidden } = models[form[TYPE]]
  if (hidden  &&  hidden.length) {
    let rp = requestedProperties.filter(p => hidden.indexOf(p.name) === -1)
    requestedProperties = rp
  }
  return { requestedProperties }
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
