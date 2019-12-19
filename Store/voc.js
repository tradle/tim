import _ from 'lodash'

let models = _.cloneDeep(_.extend(
  {},
  require('@tradle/models').models,
  require('@tradle/custom-models').models,
  require('@tradle/models-corporate-onboarding').models,
  require('@tradle/models-products-bot'),
  require('@tradle/models-onfido'),
  require('@tradle/models-cloud')
))

const exclude = ['tradle.AssignRelationshipManager', 'tradle.ProductRequest']
for (let m in models) {
  if (exclude.includes(m)) continue
  let model = models[m]
  if (model.subClassOf !== 'tradle.Form' ||
      model.properties.modificationHistory) continue
  _.extend(model.properties, {
    modificationHistory: {
      type: 'array',
      internalUse: true,
      readOnly: true,
      title: 'Data Lineage',
      icon: 'md-list',
      items: {
        ref: 'tradle.Modification',
        backlink: 'form'
      }
    }
  })
}

module.exports = models