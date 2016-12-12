const crypto = require('crypto')
const extend = require('xtend')
const { constants } = require('@tradle/engine')
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
  if (from.organization.title !== 'Easy Bank' && val.form !== 'tradle.LoanPart')
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
    url: 'https://azure1.tradle.io',
    product: 'tradle.LifeInsurance',
    id: 'europi',
    name: 'Europi Bank',
    photo: 'data:image/jpeg;base64,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'
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
