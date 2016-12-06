const crypto = require('crypto')
const extend = require('xtend')
const { constants } = require('@tradle/engine')
const { TYPE } = constants

module.exports = {
  newAPIBasedVerification,
  newIdscanVerification,
  newAu10tixVerification,
  newVisualVerification,
  newVerificationTree,
  randomDoc
}
const titles = ['HSBC', 'Aviva', 'UBS', 'Alianz', 'Barclays', 'LBG', 'Admiral', 'Citi', 'JP Morgan', 'Lloyds of London Market']
let titleIdx = 0

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
      title: titles[titleIdx++]
    },
    dateVerified: Date.now(), // 10 mins ago
    method
  }, props)
}

function newVerificationTree (vOrDoc, depth) {
  if (titleIdx === titles.length)
    titleIdx = 0
  const document = vOrDoc.document || vOrDoc
  if (depth < 2) throw new Error('min depth is 2')

  depth = depth || 2

  if (depth === 2) {
    let r = {
      document,
      from: {
        id: 'tradle.Organization_' + randomHex(16),
        title: titles[titleIdx++]
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
      title: titles[titleIdx++]
    },
    sources: [0, 0].map(a => newVerificationTree(vOrDoc, depth - 1))
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
