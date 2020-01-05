import _ from 'lodash'
import { TYPES } from '@tradle/constants'
const { FORM } = TYPES

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

let formBacklinks = []
let formProps = models[FORM].properties
for (let p in formProps) {
  let prop = formProps[p]
  if (prop.items && prop.items.backlink) formBacklinks.push({[p]: prop})
}
for (let m in models) {
  if (exclude.includes(m)) continue
  let model = models[m]
  if (model.abstract  ||  !model.subClassOf)
    continue
  let sub = model
  while (sub.subClassOf  &&  sub.subClassOf !== FORM)
    sub = models[sub.subClassOf]

  if (sub.subClassOf) {
    formBacklinks.forEach(bl => {
      let p = Object.keys(bl)[0]
      if (!model.properties[p])
       _.extend(model.properties, {
          [p]: bl[p]
        })
    })
  }
}

module.exports = models