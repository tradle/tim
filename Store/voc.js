const _ = require('lodash')

module.exports = _.extend(
  {},
  require('@tradle/models').models,
  require('@tradle/custom-models'),
  require('@tradle/models-corporate-onboarding'),
  require('@tradle/models-products-bot'),
  require('@tradle/models-onfido'),
  require('@tradle/models-nz')
)
