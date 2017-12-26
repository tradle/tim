console.log('requiring aviva.js')

import { constants } from '@tradle/engine'
import ENV from './env'
const { TYPE } = constants
const isAviva = /aviva/i.test(ENV.appName)
const noop = () => {}

module.exports = {
  preparseModel: isAviva ? preparseModel : noop
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
