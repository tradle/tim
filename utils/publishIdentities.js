
var Q = require('q')
var typeforce = require('typeforce')
var memdown = require('memdown')
var Keeper = require('@tradle/http-keeper')
var Blockchain = require('@tradle/cb-blockr')
var Tim = require('tim')
var CONSTANTS = require('@tradle/constants')
var NETWORK_NAME = 'testnet'
var BASE_PORT = 22222

module.exports = {
  one: publishOne,
  all: publishAll,
}

function publishOne (opts) {
  var tim = newTim(opts)

  var published = false
  return tim.ready()
    .then(loopUntilPublished)
    .then(tim.destroy)
    .then(function () {
      console.log(tim.name(), tim.myCurrentHash())
    })

  function loopUntilPublished () {
    if (published) return

    return tim.identityPublishStatus()
      .then(function (status) {
        console.log(tim.name(), 'status', status)
        published = status.current
        if (published) return

        if (!status.queued) {
          return tim.publishMyIdentity()
            .then(function () {
              published = true
            })
        }

        return waitForPublished()
      })
      .then(loopUntilPublished)
  }

  function waitForPublished () {
    var defer = Q.defer()
    var events = ['chained', 'unchained']
    events.forEach(function (event) {
      tim.on(event, checkIfPublished)
    })

    function checkIfPublished (info) {
      tim.lookupObject(info)
        .then(function (obj) {
          if (obj[ROOT_HASH] !== tim.myCurrentHash()) return

          events.forEach(function (e) {
            tim.removeListener(e, checkIfPublished)
          })

          defer.resolve()
        })
    }

    return defer.promise
  }
}

function publishAll (arr) {
  return arr.reduce(function (memo, next) {
    return memo.then(function () {
      return publishOne(next)
    })
  }, Q())
}

function newTim (opts) {
  typeforce({
    identity: 'Identity',
    keys: 'Array',
    afterBlockTimestamp: '?Number'
  }, opts)

  var keeper = new Keeper({
    storeOnFetch: true,
    storage: 'storage',
    fallbacks: ['http://tradle.io:25667']
  })

  var blockchain = new Blockchain(NETWORK_NAME)
  var tim = new Tim({
    pathPrefix: 'doesnotmatter',
    networkName: NETWORK_NAME,
    keeper: keeper,
    blockchain: blockchain,
    leveldown: memdown,
    identity: opts.identity,
    identityKeys: opts.keys,
    dht: null,
    port: BASE_PORT++,
    syncInterval: 20000,
    afterBlockTimestamp: opts.afterBlockTimestamp || CONSTANTS.afterBlockTimestamp
  })

  tim.on('error', console.error)
  return tim
}
