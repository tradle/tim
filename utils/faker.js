const crypto = require('crypto')
const extend = require('xtend')
const { constants } = require('@tradle/engine')
const ENV = require('./env')
const { TYPE } = constants

var formDefaults = require('../data/formDefaults.json')

module.exports = {
  newAPIBasedVerification,
  newIdscanVerification,
  newAu10tixVerification,
  newVisualVerification,
  newVerificationTree,
  randomDoc,
  newFormRequestVerifiers
}

const nextTitle = (function () {
  const titles = ['HSBC', 'Aviva', 'UBS', 'Alianz', 'Barclays', 'Lloyds Banking Group', 'Bank of America', 'Citi', 'JP Morgan', 'Morgan Stanley', 'Credit Suisse']
  let titleIdx = -1
  return function () {
    titleIdx++
    titleIdx = titleIdx % titles.length
    return titles[titleIdx]
  }
})()

const VERIFICATION = 'tradle.Verification'
const apis = {
  au10tix: {
    [TYPE]: "tradle.API",
    name: "au10tix",
    provider: {
      id: 'tradle.Organization_9ac10efb26e08e637baed8e855515f88ada0eed2b3af29f3b683bbfb94118157',
      title: 'Au10tix'
    }
  },
  idscan: {
    [TYPE]: 'tradle.API',
    name: 'idscan',
    provider: {
      id: 'tradle.Organization_e51f0d14ad262b2675aa7ca7169237a8d1a9b025b4f619ade0e0781472133be5',
      title: 'IDScan'
    }
  }
}

const ownerPresences = ['physical', 'selfie', 'video']
const documentPresences = ['physical', 'snapshot', 'video']

function newFormRequestVerifiers(from, SERVICE_PROVIDERS, val, orgs) {
  if (!from || !SERVICE_PROVIDERS || !SERVICE_PROVIDERS.length)
    return
  if (from.organization.title !== 'UBS' || val.form !== 'tradle.TaxesFiledConfirmationForm')
    return

  if (val.form in formDefaults) {
    let formRes = {[TYPE]: val.form}
    val.formResource = extend(formRes, formDefaults[val.form])
    // console.log(JSON.stringify(resource, 0, 2))
  }
  else
    return
  let verifiers = []
  let fOrgId = from.organization && from.organization.id

  verifiers.push({
    url: __DEV__ ? ENV.LOCAL_SERVER : 'https://ubs.tradle.io',
    product: 'tradle.TaxesFiledConfirmation',
    id: 'taxtime',
    name: 'Tax Time!',
    photo: 'data:image/png;base64,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'
  })
/*
  for (let i=0; i<SERVICE_PROVIDERS.length  &&  verifiers.length < 2; i++) {
    let sp = SERVICE_PROVIDERS[i]
    if (fOrgId  &&  fOrgId === sp.org)
      continue
    let org = orgs[sp.org]
    verifiers.push({
      url: sp.url,
      product: 'tradle.MortgageLoan',
      providerID: sp.id,
      provider: {
        id: sp.org,
        title: org ? org.name : sp.id,
        photo: org ? org.photos[0] : null// org.photos &&  org.photos[0]
      }
    })
  }
*/
  val.verifiers = verifiers

}
function newIdscanVerification (doc) {
  return newAPIBasedVerification(doc, apis.idscan)
}

function newAu10tixVerification (doc) {
  return newAPIBasedVerification(doc, apis.au10tix)
}

function newAPIBasedVerification (doc, api) {
  if (!api) api = randomVal(apis)

  return newVerificationWithMethod(doc, {
    [TYPE]: 'tradle.APIBasedVerificationMethod',
    aspect: [{
      type: 'authenticity',
      authentic: true
    }],
    api: api,
    confidence: Number((1 - (Math.random() * 0.2)).toFixed(2)), // 0.8 - 1.0 range to 2 sig figs
    reference: [{
      queryId: randomHex(16)
    }]
  })
}

function newVisualVerification (doc) {
  const ownerPresence = randomVal(ownerPresences)
  return newVerificationWithMethod(doc, {
    [TYPE]: 'tradle.VisualVerificationMethod',
    aspect: [{
      type: 'ownership',
      authentic: true
    }],
    documentPresence: ownerPresence === 'physical' ? ownerPresence : randomVal(documentPresences),
    ownerPresence: ownerPresence
  })
}

function newVerificationWithMethod (doc, method, props={}) {
  return extend({
    [TYPE]: VERIFICATION,
    document: doc,
    from: {
      id: 'tradle.Organization_' + randomHex(16),
      title: nextTitle()
    },
    dateVerified: Date.now(), // 10 mins ago
    method
  }, props)
}

function newVerificationTree (verification, depth) {
  if (depth < 2) return verification

  const document = verification.document
  const from = verification.from.title
  if (from !== 'easyBot') return

  if (depth < 2) throw new Error('min depth is 2')

  depth = depth || 2

  if (depth === 2) {
    let r = {
      document,
      from: {
        id: 'tradle.Organization_' + randomHex(16),
        title: nextTitle()
      },
      sources: [
        newAPIBasedVerification(document),
        newVisualVerification(document)
      ]
    }
    return r
  }

  return {
    document,
    from: {
      id: 'tradle.Organization_' + randomHex(16),
      title: nextTitle()
    },
    sources: [0, 0].map(a => newVerificationTree(verification, depth - 1))
  }
}

function randomVal (obj) {
  if (Array.isArray(obj)) {
    return obj[Math.floor(Math.random() * obj.length)]
  }

  const keys = Object.keys(obj)
  const idx = Math.floor(keys.length * Math.random())
  return obj[keys[idx]]
}

function randomDoc (type) {
  type = type || 'tradle.PersonalInfo'
  const link = randomHex(16)
  return {
    id: `tradle.PersonalInfo_${link}_${link}`,
    title: type.split('.').pop()
  }
}

function randomHex (length) {
  length = length || 32

  return crypto.randomBytes(length).toString('hex')
}
