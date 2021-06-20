import _ from 'lodash'
import { fetchWithBackoff } from './utils'

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
  if (!dictionaryDomains)
    return d
  Object.keys(dictionaryDomains).forEach(async dd => {
    if (providerDictionaries[d])
      return
    // debugger
    let url = `${URL}${dd.split('.')[0]}/${fn}`
    const f = await fetchWithBackoff(url, { headers }, 5000)
    if (f.status > 300)
      return
    providerDictionaries[dd] = true
    const m = await f.json()
    if (m) {
      let dict = genDictionary(m, lang, d.enums)
      _.merge(d, dict)
    }
  })
  return d
}
function genDictionary(dictionary, lang, enums) {
  let groups = _.groupBy(dictionary, 'type')
  let models = groups[MODEL]
  let properties = groups[PROPERTY_NAME]
  let dmodels = {}
  let descriptions = {}
  models.forEach(m => {
    dmodels[m.name] = m[lang]
    if (m.enum)
      enums[m.name] = _.clone(m.enum)
    if (m.description)
      descriptions[m.name] = m.description
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
