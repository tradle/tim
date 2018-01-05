const _ = require('lodash')
const base = require('@tradle/models').models
const custom = require('@tradle/custom-models')
const corp = require('@tradle/models-corporate-onboarding')
const nz = require('@tradle/models-nz')

module.exports = _.cloneDeep({
  ...base,
  ...custom,
  ...corp,
  ...nz
})
