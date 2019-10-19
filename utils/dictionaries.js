import _ from 'lodash'
import { fetchWithBackoff } from './utils'

const dictionariesM = require('@tradle/models').dictionaries
const dictionariesCM = require('@tradle/custom-models').dictionaries
const dictionariesMCO = require('@tradle/models-corporate-onboarding').dictionaries
const MODEL = 'model'
const PROPERTY_NAME = 'propertyName'
const URL = 'https://s3.eu-west-2.amazonaws.com/tradle.io/dictionaries/'

async function dictionaries({lang, dictionaryDomains, providerDictionaries}) {
  let headers = { cache: 'no-cache', 'content-type': 'application/json' }
  let fn = `dictionary_${lang}.json`
  const resM = await fetchWithBackoff(`${URL}models/${fn}`, { headers }, 5000)
  // debugger
  const dM = await resM.json()

  const resCM = await fetchWithBackoff(`${URL}custom-models/${fn}`, { headers }, 5000)
  const dCM = await resCM.json()

  const resMCO = await fetchWithBackoff(`${URL}models-corporate-onboarding/${fn}`, { headers }, 5000)
  const dMCO = await resMCO.json()

  let d = {models: {}, properties: {}, enums: {}}
  if (dM) {
    let dict = genDictionary(dM, lang, d.enums)
    _.extend(d, dict)
  }
  if (dCM) {
    let dict = genDictionary(dCM, lang, d.enums)
    _.merge(d, dict)
  }
  if (dMCO) {
    let dict = genDictionary(dMCO, lang, d.enums)
    _.merge(d, dict)
  }
  if (dictionaryDomains) {
    Object.keys(dictionaryDomains).forEach(async d => {
      if (providerDictionaries[d])
        return
      debugger
      const f = await fetchWithBackoff(`${URL}${d.split('.')[0]}/${fn}`, { headers }, 5000)
      providerDictionaries[d] = true
      const m = await f.json()
      if (m) {
        let dict = genDictionary(m, lang, d.enums)
        _.merge(d, dict)
      }
    })
  }
  return d
}
function dictionaries1(lang) {
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
    if (p.description)
      dprops[p.name][`${p.model}_d`] = p.description
  })
  return {
    models: dmodels,
    properties: dprops
  }
}
module.exports = dictionaries
