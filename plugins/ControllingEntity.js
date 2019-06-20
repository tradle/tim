import { TYPE } from '@tradle/constants'
import { getModel, getPropertiesWithAnnotation } from '../utils/utils'

const CONTROLLING_ENTITY = 'tradle.legal.LegalEntityControllingPerson'
const OWNERSHIP = 'tradle.legal.Ownership'
const LEGAL_ENTITY = 'tradle.legal.LegalEntity'
const LEGAL_DOCUMENT_INTERSECTION = 'tradle.legal.LegalEntityLegalDocument'
const LEGAL_DOCUMENT = 'tradle.legal.LegalDocument'
const COUNTRY = 'tradle.Country'
const PHOTO = 'tradle.Photo'

module.exports = function LegalEntity ({ models }) {
  return {
    validateForm: function validateForm ({
      application,
      form
    }) {
      if (!application) return

      // if (application.requestFor !== LEGAL_ENTITY_PRODUCT)
      //   return
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
  const { document, country, registrationNumber, region } = form
  // if (!country  ||  !document) {
  // if (!document  ||  isNewResource(document)) {
  //   return {
  //     requestedProperties: [
  //       // { name: 'country' },
  //       { name: 'document' },
  //     ]
  //   }
  // }
  return {
      requestedProperties: [
        { name: 'info_group' },
        { name: 'address_group'},
        { name: 'taxIdNumber', required: false },
        { name: 'companyEmail', required: false },
        { name: 'streetAddress', required: false },
        { name: 'postalCode', required: false },
        { name: 'city', required: false },
      ]
    }
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
  let id = typeOfControllingEntity.id.split('_')[1].toLowerCase()
  switch (id) {
  case 'person':
    return {
      requestedProperties: [
        {name: 'typeOfControllingPerson'},
        // {name: 'controllingPerson'},
        // {name: 'emailAddress'},
        // {name: 'phone'},
        // {name: 'legalEntity'}
      ]
    }
  case 'legalentity':
    return {
      requestedProperties: [
        {name: 'controllingLegalEntity'},
        {name: 'legalEntity'}
      ]
    }
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
