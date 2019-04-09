import _ from 'lodash'

module.exports = _.cloneDeep(_.extend(
  {},
  require('@tradle/models').models,
  require('@tradle/custom-models').models,
  require('@tradle/models-corporate-onboarding').models,
  require('@tradle/models-products-bot'),
  require('@tradle/models-onfido'),
  require('@tradle/models-nz'),
  require('@tradle/models-cloud').models
))
