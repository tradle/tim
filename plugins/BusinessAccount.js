import omit from 'lodash/omit'

import { TYPE } from '@tradle/constants'

import { getModel, getPropertiesWithAnnotation, isNew } from '../utils/utils'

const CONTROLLING_ENTITY = 'tradle.legal.LegalEntityControllingPerson'
const OWNERSHIP = 'tradle.legal.Ownership'
const LEGAL_ENTITY = 'tradle.legal.LegalEntity'
const LEGAL_DOCUMENT_INTERSECTION = 'tradle.legal.LegalEntityLegalDocument'
const LEGAL_DOCUMENT = 'tradle.legal.LegalDocument'
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
  // const { country, uploadHierarchy} = form
  // if (isNew(form)  &&  !form.hasOwnProperty('uploadHierarchy')  &&  !country) {
  //   return {
  //     requestedProperties: [
  //       // { name: 'country' },
  //       { name: 'uploadHierarchy' },
  //       { name: 'companyHierarchyFile'  }
  //     ]
  //   }
  // }
  // else if (uploadHierarchy  &&  !country) {
  //   return {
  //     requestedProperties: [
  //       // { name: 'country' },
  //       { name: 'uploadHierarchy' },
  //       { name: 'companyHierarchyFile'  }
  //     ]
  //   }
  // }

  if (isNew(form)) {
    let requestedProperties = [
        { name: 'companyName', required: true  },
        { name: 'registrationNumber', required: true },
      ]

    let { streetAddress, city, postalCode, country } = form
    if (streetAddress)
      requestedProperties.push({name: 'streetAddress'})
    if (city)
      requestedProperties.push({name: 'city'})
    if (postalCode)
      requestedProperties.push({name: 'postalCode'})
    if (country  &&  country.id.split('_')[1] === 'US')
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
  return {
      requestedProperties: [
        { name: 'info_group' },
        { name: 'registrationDate', required: true },
        { name: 'companyType'},
        { name: 'companyEmail', required: true },
        { name: 'address_group'},
        { name: 'taxIdNumber', required: false },
        { name: 'companyFax', required: false },
        { name: 'companyPhone', required: false },
        { name: 'DBAName', required: false },
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
    let retProps = {
      requestedProperties: [
        {name: 'typeOfControllingPerson', required: true},
        // {name: 'controllingPerson', required: false},
        {name: 'natureOfControl', required: false},
        {name: 'emailAddress', required: true},
        {name: 'phone', required: false},
      ]
    }
    if (form.name) {
      retProps.requestedProperties = retProps.requestedProperties.concat([
        {name: 'name', required: false},
        // {name: 'dateOfBirth'},
        {name: 'startDate', required: false},
        {name: 'endDate', required: false},
        {name: 'occupation', required: false},
        {name: 'controllingEntityCountry'},
        {name: 'inactive', required: false},
      ])
    }
    retProps.requestedProperties.push({name: 'legalEntity', required: true})
    return retProps
  case 'legalentity':
    return {
      requestedProperties: [
        // {name: 'controllingLegalEntity'},
        {name: 'name'},
        {name: 'emailAddress', required: true},
        {name: 'controllingEntityCompanyNumber'},
        {name: 'companyType'},
        {name: 'controllingEntityStreetAddress'},
        {name: 'controllingEntityRegion'},
        {name: 'controllingEntityPostalCode'},
        {name: 'controllingEntityCountry'},
        {name: 'natureOfControl'},
        {name: 'phone'},
        {name: 'legalEntity'},
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
