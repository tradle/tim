
import { constants } from '@tradle/engine'
const { TYPE } = constants

module.exports = {
  preparseModel
}

function preparseModel (model) {
  if (model.id === 'tradle.IDCardType') {
    model.enum
      .find(value => /passport/i.test(value.title))
      .title = 'Valid UK Passport'

    model.enum
      .find(value => /licen[sc]e/i.test(value.title))
      .title = 'Valid UK Driving Licence'
  }
}
