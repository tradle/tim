import _ from 'lodash'

const dictionariesM = require('@tradle/models').dictionaries
const dictionariesCM = require('@tradle/custom-models').dictionaries
const dictionariesMCO = require('@tradle/models-corporate-onboarding').dictionaries
const MODEL = 'model'
const PROPERTY_NAME = 'propertyName'

function dictionaries(lang) {
  let d = {models: {}, properties: {}, enums: {}}
  let dM = dictionariesM  &&  dictionariesM[lang]  &&  genDictionary(dictionariesM[lang], lang, d.enums)
  if (dM)
    _.extend(d, dM)
// debugger
  let dCM = dictionariesCM  &&  dictionariesCM[lang]  &&  genDictionary(dictionariesCM[lang], lang, d.enums)
  _.merge(d, dCM)
  let dMCO = dictionariesMCO  &&  dictionariesMCO[lang]  &&  genDictionary(dictionariesMCO[lang], lang, d.enums)
  _.merge(d, dMCO)


  return d
}
function genDictionary(dictionary, lang, enums) {
  let groups = _.groupBy(dictionary, 'type')
  let models = groups[MODEL]
  let properties = groups[PROPERTY_NAME]
  let dmodels = {}
  models.forEach(m => {
    dmodels[m.name] = m[lang]
    if (m.enum)
      enums[m.name] = _.clone(m.enum)
  })
  let dprops = {}
  properties.forEach(p => {
    if (!dprops[p.name])
      dprops[p.name] = {}
    dprops[p.name][p.model] = p[lang]
  })
  return {
    models: dmodels,
    properties: dprops
  }
}
module.exports = dictionaries
