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

const VERIFICATION = 'tradle.Verification'
const apis = {
  au10tix: {
    [TYPE]: "tradle.API",
    name: "au10tix",
    provider: {
      id: 'tradle.Organization_abcdefghijklmnopqrstuvwxyz012345abcdefghijklmnopqrstuvwxyz012345_abcdefghijklmnopqrstuvwxyz012345abcdefghijklmnopqrstuvwxyz012345'
    }
  },
  idscan: {
    [TYPE]: 'tradle.API',
    name: 'idscan',
    provider: {
      id: 'tradle.Organization_abcdefghijklmnopqrstuvwxyz012345abcdefghijklmnopqrstuvwxyz012345_abcdefghijklmnopqrstuvwxyz012345abcdefghijklmnopqrstuvwxyz012345'
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
    aspect: {
      type: 'authenticity',
      authentic: true
    },
    api: api,
    confidence: Number((1 - (Math.random() * 0.2)).toFixed(2)), // 0.8 - 1.0 range to 2 sig figs
    reference: {
      queryId: randomHex(32)
    }
  })
}

function newVisualVerification (doc) {
  const ownerPresence = randomVal(ownerPresences)
  return newVerificationWithMethod(doc, {
    [TYPE]: 'tradle.VisualVerificationMethod',
    aspect: {
      type: 'ownership',
      authentic: true
    },
    documentPresence: ownerPresence === 'physical' ? ownerPresence : randomVal(documentPresences),
    ownerPresence: ownerPresence
  })
}

function newVerificationWithMethod (doc, method, props={}) {
  return extend({
    [TYPE]: VERIFICATION,
    document: doc,
    dateVerified: Date.now(), // 10 mins ago
    method
  }, props)
}

function newVerificationTree (vOrDoc, depth) {
  const document = vOrDoc.document || vOrDoc
  depth = depth || 2

  if (depth === 2) {
    return {
      document,
      sources: [
        newAPIBasedVerification(document),
        newVisualVerification(document)
      ]
    }
  }

  return {
    document,
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
  const link = randomHex(32)
  return {
    id: `tradle.PersonalInfo_${link}_${link}`,
    title: type.split('.').pop()
  }
}

function randomHex (length) {
  length = length || 32

  return crypto.randomBytes(length).toString('hex')
}
