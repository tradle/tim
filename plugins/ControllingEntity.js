import { TYPE } from '@tradle/constants'

const CONTROLLING_ENTITY = 'tradle.legal.LegalEntityControllingPerson'
const OWNERSHIP = 'tradle.legal.Ownership'
const LEGAL_ENTITY = 'tradle.legal.LegalEntity'

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
      }
    }
  }
}
function getPropsForLegalEntity(form) {
  const { photos, country, registrationNumber, region } = form
  if (!country) {
    return {
      requestedProperties: [
        { name: 'photos' },
        { name: 'country' },
      ]
    }
  }
  if (!registrationNumber) {
    if (country  &&  country.id.split('_')[1] === 'US'  &&  !region) {
      return {
        requestedProperties: [
          { name: 'photos' },
          { name: 'country' },
          { name: 'region' }
        ]
      }
    }
  }
  return {
      requestedProperties: [
        { name: 'info_group' },
        { name: 'address_group'},
        { name: 'taxIdNumber', required: false },
        { name: 'companyEmail', required: false },
        { name: 'streetAddress', required: false },
        { name: 'postalCode', required: false },
        { name: 'city', required: false },
        // { name: 'address_group' }
      ]
    }
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
