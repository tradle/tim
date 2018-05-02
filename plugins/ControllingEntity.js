import { TYPE } from '@tradle/constants'

const LEGAL_ENTITY_PRODUCT = 'tradle.legal.LegalEntityProduct'
const CONTROLLING_ENTITY = 'tradle.legal.LegalEntityControllingPerson'
const OWNERSHIP = 'tradle.legal.Ownership'

module.exports = function LegalEntity ({ models }) {
  return {
    validateForm: function validateForm ({
      application,
      form
    }) {
      if (application.requestFor !== LEGAL_ENTITY_PRODUCT)
        return
      const type = form[TYPE]
      switch (type) {
      case CONTROLLING_ENTITY:
        return getPropsForControllingEntity(form)
      case OWNERSHIP:
        return getPropsForOwnership(form)
      }
    }
  }
}
function getPropsForControllingEntity(form) {
  let typeOfControllingEntity = form.typeOfControllingEntity
  if (!typeOfControllingEntity)
    return {}
  let requestedProperties
  let id = typeOfControllingEntity.id.split('_')[1]
  switch (id) {
  case 'person':
    return {
      requestedProperties: [
        {name: 'typeOfControllingPerson'},
        {name: 'controllingPerson'},
        {name: 'legalEntity'}
      ]
    }
  case 'legalEntity':
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
    return {}
  let requestedProperties
  let id = typeOfLegalEntity.id.split('_')[1]
  switch (id) {
  case 'subsidiary':
    return {
      requestedProperties: [
        'percentageOfOwnership',
        'owns',
        'ownedBy'
      ]
    }
  case 'branch':
    form.percentageOfOwnership = 100
    return {
      requestedProperties: [
        'owns',
        'ownedBy'
      ]
    }
  }
}