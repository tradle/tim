var path = require('path')
var crypto = require('crypto')
var DHT = require('bittorrent-dht')
var leveldown = require('asyncstorage-down')
var open = leveldown.open
leveldown.open = function () {
  console.log(arguments)
  return open.apply(this, arguments)
}

var utils = require('tradle-utils')
var rimraf = require('rimraf')
var fs = require('fs')
var level = require('react-native-level')
var Driver = require('tim')
var Identity = require('midentity').Identity
// var tedPriv = require('chained-chat/test/fixtures/ted-priv')
// var Fakechain = require('blockloader/fakechain')
var Blockchain = require('cb-blockr')
var Keeper = require('bitkeeper-js')
var Wallet = require('simple-wallet')
// var fakeKeeper = help.fakeKeeper
// var fakeWallet = help.fakeWallet
// var ted = Identity.fromJSON(tedPriv)
var billPriv = require('./TiMTests/fixtures/bill-priv.json')
var billPub = require('./TiMTests/fixtures/bill-pub.json')
var tedPriv = require('./TiMTests/fixtures/ted-priv.json')
var tedPub = require('./TiMTests/fixtures/ted-pub.json')
var driverBill
var driverTed
var networkName = 'testnet'
var BILL_PORT = 51086
var TED_PORT = 51087
// var keeper = fakeKeeper.empty()

// var tedPub = new Buffer(stringify(require('./fixtures/ted-pub.json')), 'binary')
// var tedPriv = require('./fixtures/ted-priv')
// var ted = Identity.fromJSON(tedPriv)
// var tedPort = 51087
// var tedWallet = realWalletFor(ted)
// var blockchain = tedWallet.blockchain
// var tedWallet = walletFor(ted)

clear(function () {
  print(init)
})

// init()

function print (cb) {
  walk('./', function (err, results) {
    if (results && results.length) {
      results.forEach(function (r) {
        console.log(r)
      })
    }

    cb()
  })
}

function walk (dir, done) {
  var results = []
  fs.readdir(dir, function(err, list) {
    if (err) return done(err)
    var pending = list.length
    if (!pending) return done(null, results)
    list.forEach(function(file) {
      file = path.resolve(dir, file)
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res)
            if (!--pending) done(null, results)
          })
        } else {
          results.push(file)
          if (!--pending) done(null, results)
        }
      })
    })
  })
}

function clear (cb) {
  var togo = 1
  rimraf('./', finish)

  ;[
    'addressBook.db',
    'msg-log.db',
    'messages.db',
    'txs.db'
  ].forEach(function (dbName) {
    ;['bill', 'ted'].forEach(function (name) {
      togo++
      leveldown.destroy(name + '-' + dbName, finish)
    })
  })

  function finish () {
    if (--togo === 0) cb()
  }
}

function init () {
  setInterval(printIdentityStatus, 30000)
  driverBill = buildDriver(Identity.fromJSON(billPub), billPriv, BILL_PORT)
  driverTed = buildDriver(Identity.fromJSON(tedPub), tedPriv, TED_PORT)
  ;[driverBill, driverTed].forEach(function (d) {
    d.once('ready', function () {
      console.log(d.name(), 'is ready')
    })

    d.on('chained', function (obj) {
      debugger
      console.log('chained', obj)
    })

    // d.publishMyIdentity()
    d.on('error', function (err) {
      debugger
      console.error(err)
    })

    d.on('message', function (msg) {
      debugger
      console.log(msg)
    })
  })

  // driverTed.once('ready', function () {
  //   var billCoords = {
  //     fingerprint: billPub.pubkeys[0].fingerprint
  //   }

  //   driverTed.send({
  //     msg: {
  //       hey: 'ho'
  //     },
  //     to: [billCoords],
  //     deliver: true
  //   })
  // })
}

function printIdentityStatus () {
  ;[driverBill, driverTed].forEach(function (d) {
    d.identityPublishStatus(function (err, status) {
      console.log(d.name, 'identity publish status', status)
    })
  })
}

function buildDriver (identity, keys, port) {
  var iJSON = identity.toJSON()
  var prefix = iJSON.name.firstName.toLowerCase()
  var dht = dhtFor(iJSON)
  dht.listen(port)

  var keeper = new Keeper({
    dht: dht,
    storage: prefix + '-storage',
    checkReplication: 120000
  })

  var blockchain = new Blockchain(networkName)

  var d = new Driver({
    pathPrefix: prefix,
    networkName: networkName,
    keeper: keeper,
    blockchain: blockchain,
    leveldown: leveldown,
    identity: identity,
    identityKeys: keys,
    dht: dht,
    port: port,
    syncInterval: 60000
  })

  var log = d.log
  d.log = function () {
    console.log('log', arguments)
    return log.apply(this, arguments)
  }

  return d
}

function dhtFor (identity) {
  return new DHT({
    nodeId: nodeIdFor(identity),
    bootstrap: ['tradle.io:25778']
  })
}

function nodeIdFor (identity) {
  return crypto.createHash('sha256')
    .update(findKey(identity.pubkeys, { type: 'dsa' }).fingerprint)
    .digest()
    .slice(0, 20)
}

function findKey (keys, where) {
  var match
  keys.some(function (k) {
    for (var p in where) {
      if (k[p] !== where[p]) return false
    }

    match = k
    return true
  })

  return match
}
