'use strict';

var path = require('path')
var parseURL = require('url').parse
var React = require('react-native')
var {
  AsyncStorage,
  AlertIOS,
  NetInfo
} = React

var path = require('path')
var BeSafe = require('asyncstorage-backup')
var Reflux = require('reflux');
var Actions = require('../Actions/Actions');
var extend = require('extend');
var Debug = require('debug')
// var deepEqual = require('deep-equal')
var debug = Debug('Store')

// var isConnected

var timerDebug = Debug('TIMER')
var Q = require('q');
Q.longStackSupport = true
Q.onerror = function (err) {
  console.error(err)
  throw err
}

var ENV = require('react-native-env')
var Keychain = require('react-native-keychain')
var AddressBook = require('NativeModules').AddressBook;

var voc = require('@tradle/models');
var sampleData = voc.data

var myIdentity = __DEV__ ? require('../data/myIdentity.json') : []
var welcome = require('../data/welcome.json');

var sha = require('stable-sha1');
var utils = require('../utils/utils');
var translate = utils.translate
var promisify = require('q-level');
var asyncstorageDown = require('asyncstorage-down')
var levelup = require('levelup')
var leveldown = require('cachedown')
leveldown.setLeveldown(asyncstorageDown)
var level = function (loc, opts) {
  opts = opts || {}
  opts.db = opts.db || function () {
    return leveldown.apply(null, arguments)
      .maxSize(100) // max cache size
  }

  return levelup(loc, opts)
}

var constants = require('@tradle/constants');
const NONCE = constants.NONCE
const TYPE = constants.TYPE
const ROOT_HASH = constants.ROOT_HASH
const CUR_HASH  = constants.CUR_HASH
const PREV_HASH  = constants.PREV_HASH

const ORGANIZATION = constants.TYPES.ORGANIZATION
const IDENTITY = constants.TYPES.IDENTITY
const MESSAGE = constants.TYPES.MESSAGE
const SIMPLE_MESSAGE = constants.TYPES.SIMPLE_MESSAGE
const FINANCIAL_PRODUCT = constants.TYPES.FINANCIAL_PRODUCT
const PRODUCT_LIST = constants.TYPES.PRODUCT_LIST
const PROFILE = constants.TYPES.PROFILE;
const PUBLISHED_IDENTITY = constants.TYPES.PROFILE;
const ADDITIONAL_INFO = constants.TYPES.ADDITIONAL_INFO;
const VERIFICATION = constants.TYPES.VERIFICATION;
const FORM = constants.TYPES.FORM;
const MODEL = constants.TYPES.MODEL;
const CUSTOMER_WAITING = constants.TYPES.CUSTOMER_WAITING
const FORGOT_YOU = constants.TYPES.FORGOT_YOU

const MY_IDENTITIES_TYPE  = 'tradle.MyIdentities'
const PRODUCT_APPLICATION = 'tradle.ProductApplication'
const MY_PRODUCT          = 'tradle.MyProduct'
const ENUM                = 'tradle.Enum'
const GUEST_SESSION_PROOF = 'tradle.GuestSessionProof'
const MY_IDENTITIES = MY_IDENTITIES_TYPE + '_1'
const SETTINGS = constants.TYPES.SETTINGS

const WELCOME_INTERVAL = 600000

var Tim = require('tim')
Tim.enableOptimizations()
Tim.CATCH_UP_INTERVAL = 10000
// var Zlorp = Tim.Zlorp
// Zlorp.ANNOUNCE_INTERVAL = 10000
// Zlorp.LOOKUP_INTERVAL = 10000
// Zlorp.KEEP_ALIVE_INTERVAL = 10000

const Sendy = require('sendy')
const SendyWS = require('sendy-ws')
const OTRClient = require('sendy-otr')
const SENDY_OPTS = { resendInterval: 2000, mtu: 10000 }
// const newOTRSwitchboard = require('sendy-otr-ws').Switchboard
const newSwitchboard = SendyWS.Switchboard
const WebSocketClient = SendyWS.Client
// const HttpClient = require('@tradle/transport-http').HttpClient
var getDHTKey = require('tim/lib/utils').getDHTKey

var dns = require('dns')
var map = require('map-stream')
// var bitcoin = require('@tradle/bitcoinjs-lib')
// var DHT = require('@tradle/bittorrent-dht') // use tradle/bittorrent-dht fork
var Blockchain = require('@tradle/cb-blockr') // use tradle/cb-blockr fork
// Blockchain.throttleGet(100)
// Blockchain.throttlePost(1000)
var midentity = require('@tradle/identity')
var Identity = midentity.Identity
var defaultKeySet = midentity.defaultKeySet
var Keeper = require('@tradle/http-keeper')
var Wallet = require('@tradle/simple-wallet')
var crypto = require('crypto')
var rimraf = require('rimraf')

// var fs = require('fs')
var kiki = require('@tradle/kiki')
var Keys = kiki.Keys

var tutils = require('@tradle/utils')
var ChainedObj = require('@tradle/chained-obj');
var Builder = ChainedObj.Builder;
var Parser = ChainedObj.Parser;

// var billPriv = require('../TiMTests/fixtures/bill-priv.json');
// var billPub = require('../TiMTests/fixtures/bill-pub.json');

var isTest, originalMe;
var currentEmployees = {}

// var tim;
var PORT = 51086

// var levelQuery = require('level-queryengine');
// var jsonqueryEngine = require('jsonquery-engine');
// var Sublevel = require('level-sublevel')
var TIM_PATH_PREFIX = 'me'

var models = {};
var list = {};
var bankMessages = {}
var temporaryResources = {}
var employees = {};
var db;
var ldb;
var isLoaded;
var me;
var language
var dictionary = {}
var isAuthenticated
var meDriver
var publishedIdentity
var driverPromise
var ready;
var networkName = 'testnet'
var TOP_LEVEL_PROVIDERS = ENV.topLevelProviders || [ENV.topLevelProvider]
var SERVICE_PROVIDERS_BASE_URL_DEFAULTS = __DEV__ ? ['http://127.0.0.1:44444'] : TOP_LEVEL_PROVIDERS.map(t => t.baseUrl)
var SERVICE_PROVIDERS_BASE_URLS
var HOSTED_BY = TOP_LEVEL_PROVIDERS.map(t => t.name)
// var ALL_SERVICE_PROVIDERS = require('../data/serviceProviders')
var SERVICE_PROVIDERS
var publishRequestSent = []

var driverInfo = {
  wsClients: {},
  whitelist: [],
}

var LocalizedStrings = require('react-native-localization')
let defaultLanguage = new LocalizedStrings({ en: {}, nl: {} }).getLanguage()

// var Store = Reflux.createStore(timeFunctions({
var Store = Reflux.createStore({

  // this will set up listeners to all publishers in TodoActions, using onKeyname (or keyname) as callbacks
  listenables: [Actions],
  // this will be called by all listening components as they register their listeners
  init() {
    // Setup components:
    var ldb = level('TiM.db', { valueEncoding: 'json' });
    // ldb = levelQuery(level('TiM.db', { valueEncoding: 'json' }));
    // ldb.query.use(jsonqueryEngine());
    db = promisify(ldb);

    NetInfo.isConnected.addEventListener(
      'change',
      this._handleConnectivityChange.bind(this)
    );
    NetInfo.isConnected.fetch().done(
      (isConnected) => {
        this.isConnected = isConnected
      }
    );

    this.loadModels()
    var self = this

    voc.forEach(function(m) {
      models[m.id] = {
        key: m.id,
        value: m
      }
      self.addNameAndTitleProps(m)
    })

    // if (true) {
    if (false) {
      return this.ready = this.wipe()
        .then(() => {
          AlertIOS.alert('please refresh')
          return Q.Promise(function (resolve) {})
        })
    }

    return this.ready = Q.all([
        this.getMe(),
        this.getSettings(),
        // this.loadModels()
      ])
      .then(() => {
        // this.loadMyResources()
        if (!utils.isEmpty(list))
          isLoaded = true;

        if (me) {
          return this.getDriver(me)
            .then(() => this.monitorTim())
        }
      })
  },

  _handleConnectivityChange(isConnected) {
    this.isConnected = isConnected
    this.trigger({action: 'connectivity', isConnected: isConnected})
    // this.setState({
    //   isConnected,
    // });
  },

  getMe() {
    var self = this

    return db.get(MY_IDENTITIES)
    .then(function(value) {
      if (value) {
        var key = MY_IDENTITIES
        list[key] = {
          key:   key,
          value: value
        }
        return db.get(IDENTITY + '_' + value.currentIdentity.split('_')[1])
      }
    })
    .then (function(value) {
      list[IDENTITY + '_' + value[ROOT_HASH]] = {
        key: IDENTITY + '_' + value[ROOT_HASH],
        value: value
      }
      return db.get(PROFILE + '_' + value[ROOT_HASH])
    })
    .then(function(value) {
      me = value
      self.setMe(me)
      var key = value[TYPE] + '_' + value[ROOT_HASH]
      list[key] = {
        key: key,
        value: value
      }
    })
    .catch(function(err) {
      // debugger
      // return self.loadModels()
    })
  },
  setMe(newMe) {
    me = newMe
    utils.setMe(me)
  },
  onUpdateMe(params) {
    let r = {}
    extend(true, r, me, params)
    this.setMe(r)
    let meId = utils.getId(r)
    list[meId].value  = r
    return db.put(meId, r)
      // .then(() => {
      //   if (params.registered) {
      //     this.trigger({action: 'registered'})
      //   } else if (params)
      // })
  },
  onSetAuthenticated(authenticated) {
    if (!me)
      return
    let meId = utils.getId(me)
    let r = {}
    extend(true, r, me, {
      isAuthenticated: authenticated,
      dateAuthenticated: Date.now()
    })

    this.setMe(r)
    this.trigger({ action: 'authenticated', value: authenticated })
    // return db.put(meId, r)
    // .then(() => {
    //   self.trigger({action: 'authenticated'})
    // })
  },
  getSettings() {
    var self = this
    var key = SETTINGS + '_1'
    return db.get(key)
    .then(function(value) {
      if (value) {
        list[key] = {
          key:   key,
          value: value
        }
      }
    })
    .catch(function(err) {
      // debugger
      // return self.loadModels()
    })
  },
  createFromIdentity(r) {
    var rr = {};
    if (r.name) {
      for (var p in r.name)
        rr[p] = r.name[p];
    }
    if (r.location) {
      for (var p in r.location)
        rr[p] = r.location[p];
    }
    for (var p in r)
      if (p !== 'name' && p !== 'location')
        rr[p] = r[p];
    return rr;
  },
  buildDriver(identity, keys, port) {
    var iJSON = identity.toJSON()
    // var prefix = iJSON.name.firstName.toLowerCase()
    // var dht = null; //this.dhtFor(iJSON, port)
    var keeper = new Keeper({
      // storage: prefix + '-storage',
      // flat: true, // flat directory structure
      storeOnFetch: true,
      db: level('storage', {
        db: leveldown,
        valueEncoding: 'binary'
      }),
      fallbacks: ['https://tradle.io/keeper']
      // fallbacks: ['http://tradle.io:25667']
      // fallbacks: ['http://localhost:25667']
    })

    var blockchain = new Blockchain(networkName)
    var wsClients = driverInfo.wsClients
    var whitelist = driverInfo.whitelist
    var otrKey = driverInfo.otrKey

    // return Q.ninvoke(dns, 'resolve4', 'tradle.io')
    //   .then(function (addrs) {
    //     console.log('tradle is at', addrs)

    meDriver = new Tim({
      pathPrefix: TIM_PATH_PREFIX,
      networkName: networkName,
      keeper: keeper,
      blockchain: blockchain,
      leveldown: leveldown,
      identity: identity,
      keys: keys,
      // dht: dht,
      // port: port,
      // sendThrottle: 10000,
      syncInterval: 10 * 60 * 1000,
      unchainThrottle: 10 * 60 * 1000,
      afterBlockTimestamp: constants.afterBlockTimestamp,
      // afterBlockTimestamp: 1445976998,
      // relay: {
      //   // address: addrs[0],
      //   address: '54.236.214.150',
      //   port: 25778
      // }
    })

    meDriver._shouldLoadTx = function (tx) {
      // if public, check if it's our infoHash
      // or if it's in pre-determined list to load
      // otherwise mark as ignored
      if (tx.txType === 1) return true

      return whitelist.indexOf(tx.txId) !== -1 ||
        tx.txData.toString('hex') === meDriver.myCurrentHash()
    }

    meDriver._sortParsedTxs = function (txs) {
      return txs.sort(function (a, b) {
        return whitelist.indexOf(a.txId) !== -1 ? -1 :
          whitelist.indexOf(b.txId) !== -1 ? 1 : 0
      })
    }

    meDriver._multiGetFromDB = utils.multiGet

    let noProviders
    if (!SERVICE_PROVIDERS_BASE_URLS) {
      var settings = list[SETTINGS + '_1']
      if (settings  &&  settings.value.urls)
        SERVICE_PROVIDERS_BASE_URLS = settings.value.urls
      else
        SERVICE_PROVIDERS_BASE_URLS = SERVICE_PROVIDERS_BASE_URL_DEFAULTS.slice()
    }

    otrKey = keys.filter((k) => k.type === 'dsa')[0]

    if (otrKey) otrKey = kiki.toKey(otrKey).priv()

    driverInfo.otrKey = otrKey
    meDriver._send = function (recipientHash, msg, recipientInfo) {
      const messenger = wsClients[recipientHash]
      if (!messenger) {
        return Q.reject(new Error('recipient not found'))
      }

      const args = arguments
      // return meDriver.ready()
      //   .then(function doSend () {
          // if (messenger === httpClient) {
          //   return messenger.send.apply(messenger, args)
          // }

          let identifier
          if (otrKey) {
            identifier = recipientInfo.identity.pubkeys.filter(function (k) {
              return k.type === 'dsa'
            })[0].fingerprint
          } else {
            identifier = recipientHash
          }

          // this timeout is not for sending the entire message
          // but rather an idle connection timeout
          messenger.setTimeout(5000)

          return Q.ninvoke(messenger, 'send', identifier, msg)
        // })
    }

    this.getInfo(SERVICE_PROVIDERS_BASE_URLS, true)
      .catch(function(err) {
        debugger
      })

    return Q()

    // var log = d.log;
    // d.log = function () {
    //   console.log('log', arguments);
    //   return log.apply(this, arguments);
    // }

    // return d
  },

  getInfo(serverUrls, retry) {
    let self = this

    let defer = Q.defer()
    let togo = serverUrls.length
    serverUrls.forEach((url) => {
      self.getServiceProviders(url, retry)
      .then((results) => {
        // var httpClient = driverInfo.httpClient
        var wsClients = driverInfo.wsClients
        var whitelist = driverInfo.whitelist
        var otrKey = driverInfo.otrKey
        // if (!httpClient) {
        //   httpClient = new HttpClient()
        //   driverInfo.httpClient = httpClient
        //   meDriver.ready().then(function () {
        //     var myHash = meDriver.myRootHash()
        //     httpClient.setRootHash(myHash)
        //   })

        //   httpClient.on('message', function () {
        //     meDriver.receiveMsg.apply(meDriver, arguments)
        //   })
        // }
        results.forEach(function(provider) {
          self.addProvider(provider)
        })
        if (--togo === 0) {
          defer.resolve()
          meDriver.watchTxs(whitelist)
          return meDriver
        }
      })
      .catch((err) => {
        debugger
      })
    })
    return defer.promise

    // return Q.all(serverUrls.map(url => self.getServiceProviders(url, retry)))
    // .then(function(results) {
    //   var httpClient = driverInfo.httpClient
    //   var wsClients = driverInfo.wsClients
    //   var whitelist = driverInfo.whitelist
    //   var otrKey = driverInfo.otrKey
    //   results.forEach(function(providers) {
    //     if (!httpClient) {
    //       httpClient = new HttpClient()
    //       driverInfo.httpClient = httpClient
    //       meDriver.ready().then(function () {
    //         var myHash = meDriver.myRootHash()
    //         httpClient.setRootHash(myHash)
    //       })

    //       httpClient.on('message', function () {
    //         meDriver.receiveMsg.apply(meDriver, arguments)
    //       })
    //     }

    //     providers.forEach(function(provider) {
    //       self.addProvider(provider)
    //       // httpClient.addRecipient(
    //       //   provider.hash,
    //       //   utils.joinURL(provider.url, provider.id, 'send')
    //       // )

    //       // if (provider.txId) {
    //       //   whitelist.push(provider.txId)
    //       // }

    //       // if (!otrKey) return

    //       // // self.addWebSocketClient()
    //       // var wsClient = new WebSocketClient({
    //       //   url: utils.joinURL(provider.url, provider.id, 'ws'),
    //       //   otrKey: otrKey,
    //       //   autoconnect: false,
    //       //   // rootHash: meDriver.myRootHash()
    //       // })
    //       // // will need to do this on demand too
    //       // // e.g. when scanning an employee QR Code at the bank
    //       // wsClient.on('message', meDriver.receiveMsg)
    //       // wsClients[provider.hash] = wsClient
    //     })
    //   })

    //   meDriver.watchTxs(whitelist)
    //   return meDriver
    // })
  },
  onGetEmployeeInfo(code) {
    let pair = code.split(':')
    let orgId = ORGANIZATION + '_' + pair[0]
    let serviceProvider =  SERVICE_PROVIDERS.filter((json) => json.org === orgId)[0]

    var org = list[orgId].value
    var self = this
    return Q.race([
      fetch(utils.joinURL(serviceProvider.url, serviceProvider.id + '/employee/' + pair[1])),
      Q.Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(new Error('timed out'))
        }, 5000)
      })])
    // return Q(employee)
      .then((response) => {
        return response.json()
      })
      .then(function(data) {
        let info = {
          bot: data,
          org: list[orgId].value,
          style: list[orgId].value.style,
          isEmployee: true
        }
        return self.addInfo(info)
      })
      .then(function(provider) {
        self.addProvider(provider)
        if (provider.txId) {
          meDriver.addContactIdentity(provider.identity)
          meDriver.watchTxs(driverInfo.whitelist)
        }

        let employee = list[PROFILE + '_' + provider.hash].value
        currentEmployees[utils.getId(org)] = employee
        let myIdentities = list[MY_IDENTITIES].value
        let currentIdentity = myIdentities.currentIdentity
        let identity = myIdentities.allIdentities.filter(function(i) {
          if (i.id === currentIdentity)
            return true
        })[0].publishedIdentity

        self.trigger({action: 'talkToEmployee', to: org, myIdentity: identity})
      })
      .catch((err) => {
        debugger
      })
  },
/*
  onGetEmployeeInfo(code) {
    let parts = code.split(':')

    let orgId = ORGANIZATION + '_' + parts[1]
    let serviceProvider =  SERVICE_PROVIDERS.filter((json) => json.org === orgId)

    serviceProvider = (serviceProvider  &&  serviceProvider.length) ? serviceProvider[0] : null
      // let serviceProvider =  SERVICE_PROVIDERS.filter((json) => json.url === serverUrl)

    var org = list[orgId].value
    var self = this
    let promise = serviceProvider ? Q() : this.getInfo([parts[0]])

    return promise
    .then(function() {
      if (!serviceProvider)
        serviceProvider = SERVICE_PROVIDERS.filter((json) => json.org === orgId)[0]

      return Q.race([
        fetch(utils.joinURL(serviceProvider.url, serviceProvider.id + '/employee/' + parts[1])),
        Q.Promise(function (resolve, reject) {
          setTimeout(function () {
            reject(new Error('timed out'))
          }, 5000)
        })]
      )
    })
    // return Q(employee)
    .then((response) => {
      return response.json()
    })
    .then(function(data) {
      let info = {
        bot: data,
        org: list[orgId].value,
        style: list[orgId].value.style,
        isEmployee: true
      }
      return self.addInfo(info)
    })
    .then(function(provider) {
      self.addProvider(provider)
      if (provider.txId) {
        meDriver.addContactIdentity(provider.identity)
        meDriver.watchTxs(driverInfo.whitelist)
      }

      let employee = list[PROFILE + '_' + provider.hash].value
      currentEmployees[utils.getId(org)] = employee
      let myIdentities = list[MY_IDENTITIES].value
      let currentIdentity = myIdentities.currentIdentity
      let identity = myIdentities.allIdentities.filter(function(i) {
        if (i.id === currentIdentity)
          return true
      })[0].publishedIdentity

      self.trigger({action: 'talkToEmployee', to: org, myIdentity: identity})
    })
    .catch((err) => {
      debugger
    })
  },
*/
  addProvider(provider) {
    // let httpClient = driverInfo.httpClient
    // httpClient.addRecipient(
    //   provider.hash,
    //   utils.joinURL(provider.url, provider.id, 'send')
    // )

    let whitelist = driverInfo.whitelist
    if (provider.txId)
      whitelist.push(provider.txId)

    const otrKey = driverInfo.otrKey
    const wsClients = driverInfo.wsClients
    meDriver.ready()
      .then(() => {
        const identifier = otrKey ? otrKey.fingerprint() : meDriver.myRootHash()
        const url = utils.joinURL(provider.url, provider.id, 'ws?from=' + identifier)
        if (wsClients[url]) return wsClients[url]

        const wsClient = new WebSocketClient({
          url: url,
          autoConnect: true
        })

        let transport
        if (otrKey) {
          transport = newSwitchboard({
            identifier: identifier,
            unreliable: wsClient,
            clientForRecipient: function (recipient) {
              return new OTRClient({
                key: otrKey,
                client: new Sendy(SENDY_OPTS),
                theirFingerprint: recipient
              })
            }
          })
        } else {
          transport = newSwitchboard({
            identifier: identifier,
            unreliable: wsClient,
            clientForRecipient: function () {
              return new Sendy(SENDY_OPTS)
            }
          })
        }

        wsClient.on('disconnect', function () {
          transport.clients().forEach(function (c) {
            // reset OTR session, restart on connect
            debug('aborting pending sends due to disconnect')
            c.reset(true)
          })
        })

        wsClients[url] = transport

        let timeouts = {}
        transport.on('receiving', function (msg) {
          clearTimeout(timeouts[msg.from])
          delete timeouts[msg.from]
        })

        transport.on('404', function (recipient) {
          if (!timeouts[recipient]) {
            timeout = setTimeout(function () {
              delete timeouts[recipient]
              transport.cancelPending(recipient)
            }, 10000)
          }
        })

        transport.on('message', function (msg, from) {
          const prop = otrKey ? 'fingerprint' : ROOT_HASH
          meDriver.receiveMsg(msg, {
            [prop]: from
          })
        })

        transport.on('timeout', function (identifier) {
          transport.cancelPending(identifier)
        })

        return transport
      })
      .then(wsClient => {
        wsClients[provider.hash] = wsClient
      })
      .catch(err => {
        debugger
      })
  },
  // Gets info about companies in this app, their bot representatives and their styles
  getServiceProviders(url, retry) {
    var self = this
    // return Q.race([
    //   fetch(utils.joinURL(url, 'info'), { headers: { cache: 'no-cache' } }),
    //   Q.Promise(function (resolve, reject) {
    //     setTimeout(function () {
    //       reject(new Error('timed out'))
    //     }, 5000)
    //   })
    // ])
    const doFetch = retry
                  ? utils.fetchWithBackoff
                  : utils.fetchWithTimeout

    let originalUrl = url
    url = utils.joinURL(url, 'info')
    let languageCode
    if (me) {
      language = me.language
      if (language) {
        language = list[utils.getId(language)].value
        languageCode = language.code
      }
    }
    if (!languageCode)
      languageCode = defaultLanguage
    if (languageCode)
      url += '?lang=' + languageCode

    return doFetch(url, { headers: { cache: 'no-cache' } }, 5000)
    .then((response) =>  {
      if (response.status > 300)
        throw new Error('Cannot access: ' + url)
      return response.json()
    })
    .then(function (json) {
      if (json.dictionary) {
        extend(true, dictionary, json.dictionary)
        if (me) {
          me.dictionary = dictionary
          me.language = language
          self.setMe(me)
        }
      }

      return Q.allSettled(json.providers.map(p => {
        if (p.org[ROOT_HASH]) return p

        return getDHTKey(p.org)
          .then(hash => p.org[ROOT_HASH] = hash)
      }))
      .then(() => json)
    })
    .then(function (json) {
      // var json = JSON.parse(text)
      if (!SERVICE_PROVIDERS)
        SERVICE_PROVIDERS = []
      var promises = []
      json.providers.forEach(function(sp) {
        let duplicateSP = null
        let isDuplicate = SERVICE_PROVIDERS.some((r) => {
          // return deepEqual(r.org, sp.org)
          if (r.org === utils.getId(sp.org))
            duplicateSP = r
        })

        if (isDuplicate)
          return
        SERVICE_PROVIDERS.push({id: sp.id, org: utils.getId(sp.org), url: originalUrl, style: sp.style})
        promises.push(self.addInfo(sp, originalUrl))
      })

      return Q.allSettled(promises)
    })
    .then((results) => {
      let list = self.searchNotMessages({modelName: ORGANIZATION})
      this.trigger({
        action: 'list',
        list: list,
      })
      return results
        .filter(r => r.state === 'fulfilled')
        .map(r => r.value)
    })
  },
  addInfo(sp, url) {
    var hash
    var self = this
    var okey = utils.getId(sp.org)
    return getDHTKey(sp.bot.pub)
    .then(function(dhtKey) {
      hash = dhtKey
      var ikey = IDENTITY + '_' + dhtKey
      var batch = []
      if (!list[okey]) {
        batch.push({type: 'put', key: okey, value: sp.org})
        list[okey] = {key: okey, value: sp.org}
      }
      if (sp.style)
        list[okey].value.style = sp.style
      if (!list[ikey]) {
        var profile = {
          _t: PROFILE,
          _r: dhtKey,
          firstName: sp.bot.profile.name.firstName || sp.id + 'Bot',
          organization: self.buildRef(sp.org)
          // organization: {
          //   id: okey,
          //   title: sp.org.name
          // }
        }
        if (sp.bot.profile.name.lastName)
          profile.lastName = sp.bot.profile.name.lastName
        profile.formatted = sp.bot.profile.name.formatted || (profile.lastName ? profile.firstName + ' ' + profile.lastName : profile.firstName)

        if (!sp.isEmployee)
          profile.bot = true
        // profile[ROOT_HASH] = r.pub[ROOT_HASH] //?????
        var identity = {
          _r:   dhtKey,
          txId: sp.bot.txId
        }
        extend(true, identity, sp.bot.pub)
        if (identity.name) {
          identity.firstName = identity.name.firstName
          identity.formatted = identity.name.formatted || identity.firstName
          delete identity.name
        }

        var pkey = utils.getId(profile)

        batch.push({type: 'put', key: ikey, value: identity })
        batch.push({type: 'put', key: pkey, value: profile })
        list[ikey] = {key: ikey, value: identity}
        list[pkey] = {key: pkey, value: profile}
      }
      if (!list[okey].value.contacts)
        list[okey].value.contacts = []
      var pkey = PROFILE + '_' + dhtKey
      list[okey].value.contacts.push({
        id:     pkey,
        titile: list[pkey].formatted
      })

      var promises = [
        // TODO: evaluate the security of this
        meDriver.addContactIdentity(sp.bot.pub)
      ]

      if (batch.length)
        promises.push(db.batch(batch))

      return Q.allSettled(promises)
    })
    .then(function() {
      if (!sp.isEmployee)
        return {hash: hash, txId: sp.bot.txId, id: sp.id, url: url}
      let orgSp = SERVICE_PROVIDERS.filter((r) => utils.getId(r.org) === okey)[0]
      return {hash: hash, txId: sp.bot.txId, id: orgSp.id, url: orgSp.url, identity: sp.bot.pub}
    })
  },
  dhtFor (identity, port) {
    var dht = new DHT({
      nodeId: this.nodeIdFor(identity),
      bootstrap: ['tradle.io:25778']
    })

    dht.on('error', function (err) {
      debugger
      throw err
    })

    dht.listen(port)
    // dht.socket.filterMessages(tutils.isDHTMessage)
    return dht
  },
  nodeIdFor (identity) {
    return crypto.createHash('sha256')
      .update(this.findKey(identity.pubkeys, { type: 'dsa' }).fingerprint)
      .digest()
      .slice(0, 20)
  },
  findKey (keys, where) {
    var match
    keys.some(function (k) {
      for (var p in where) {
        if (k[p] !== where[p]) return false
      }

      match = k
      return true
    })

    return match
  },
  onStart() {
    var self = this;
    this.ready.then(function() {
      // isLoaded = true
      self.trigger({
        action: 'start',
        models: models,
        me: me
      });
    });
  },

  onAddMessage(r, isWelcome, requestForForm) {
// NetInfo.isConnected.fetch().then(isConnected => {
//   console.log(isConnected ? 'online' : 'offline');
// });
    let m = this.getModel(r[TYPE]).value
    var props = m.properties;
    var rr = {};
    if (!r.time)
      r.time = new Date().getTime();
    var toOrg
    if (r.to[TYPE] === ORGANIZATION) {
      var orgId = utils.getId(r.to)
      var orgRep = this.getRepresentative(orgId)
      if (!orgRep) {
        var params = {
          action: 'addMessage',
          error: 'No ' + r.to.name + ' representative was found'
        }
        this.trigger(params);
        return
      }
      toOrg = r.to
      r.to = orgRep
    }
    for (var p in r) {
      if (!props[p])
        continue
      if (props[p].ref  &&  !props[p].id)
        rr[p] = this.buildRef(r[p])
      else
        rr[p] = r[p];
    }
    let firstTime
    if (r[TYPE] === PRODUCT_APPLICATION) {
      let result = this.searchMessages({modelName: PRODUCT_APPLICATION, to: toOrg})
      if (result) {
        result.filter(() => {
          if (result.message === r.message  &&  !r.documentCreated)
            return true
        })
        if (result.length) {
          result.forEach((r) => {
            list[utils.getId(r)].value.documentCreated = true
          })
        }
      }
    }
    else if (r[TYPE] === CUSTOMER_WAITING) {
      if (!this.isConnected) {
        let result = this.searchMessages({modelName: PRODUCT_LIST, to: toOrg})
        firstTime = !result  ||  !result.length
      }
    }
    rr[NONCE] = this.getNonce()
    var toChain = {
      _t: rr[TYPE],
      _z: rr[NONCE],
      time: r.time
    }
    if (rr.message)
      toChain.message = rr.message
    if (rr.photos)
      toChain.photos = rr.photos
    if (r.list)
      rr.list = r.list
    let required = m.required
    if (required) {
      required.forEach((p) => {
        toChain[p] = rr[p]
      })
      // HACK
      delete toChain.from
      delete toChain.to
    }
    var batch = []
    var self = this
    var error
    var welcomeMessage
    var dhtKey
    var promise = getDHTKey(toChain)
    // var isServiceMessage = rr[TYPE] === 'tradle.ServiceMessage'
    return promise
    .then(function(data) {
      if (!isWelcome) {
        dhtKey = data
        var to = list[utils.getId(r.to)].value;
        var from = list[utils.getId(r.from)].value;
        var dn = r.message; // || utils.getDisplayName(r, props);

        if (!dn)
          dn = 'sent photo';
        else {
          var msgParts = utils.splitMessage(dn);
          if (msgParts.length === 2) {
            var m = self.getModel(msgParts[1]);
            dn = m ? m.value.title + ' request' : msgParts[1];
          }
          else {
            var result = self.searchMessages({to: toOrg, modelName: MESSAGE});
            for (var i=result.length - 1; i>=0; i++) {
              if (result[i].type !== constants.TYPES.SIMPLE_MESSAGE)
                break
            }
          }
        }

        rr[ROOT_HASH] = dhtKey
        to.lastMessage = (from[ROOT_HASH] === me[ROOT_HASH]) ? 'You: ' + dn : dn;
        to.lastMessageTime = rr.time;
        from.lastMessage = rr.message;
        from.lastMessageTime = r.time;
        batch.push({type: 'put', key: to[TYPE] + '_' + to[ROOT_HASH], value: to});
        batch.push({type: 'put', key: from[TYPE] + '_' + from[ROOT_HASH], value: from});
      }
       if (!isWelcome  ||  (me.organization  &&  utils.getId(me.organization) === utils.getId(r.to)))
        return
      // Check whose message was the last one
      // var result = self.searchMessages({to: toOrg, modelName: MESSAGE});
      // if (result && result.length > 0) {
      //   result.sort(function(a,b) {
      //     return new Date(b.time) - new Date(a.time);
      //   });
      //   result = result.reverse();
      //   isWelcome = (!result[0].welcome  &&  !result[0].list)  &&  new Date().getTime() - result[0].time > 600 * 1000

      if (orgRep.lastMessageTime) {
        // isWelcome = new Date() - orgRep.lastMessageTime > WELCOME_INTERVAL
        // var msg = welcome.msg.replace('{firstName}', me.firstName)
        isWelcome = orgRep.lastMessage === r.message
        if (!isWelcome)
          return;
      }
      // var wmKey = SIMPLE_MESSAGE + '_Welcome' + toOrg.name.replace(' ', '_')// + '_' + new Date().getTime()
      // Create welcome message without saving it in DB
      // welcomeMessage = {}
      if (me.txId)
        return

      return self.getDriver(me)
      .then(function () {
        if (!self.isConnected  ||  publishRequestSent[orgId])
          return
        return meDriver.identityPublishStatus()
      })
      .then(function(status) {
        if (!status || !self.isConnected)
          return
        if (!status.queued  &&  !status.current) {
          self.publishMyIdentity(orgRep)
          publishRequestSent[orgId] = true
        }
        else
          self.updateMe()
      })
    })
    .then(function() {
      if (isWelcome && utils.isEmpty(welcomeMessage))
        return;

      // Temporary untill the real hash is known
      var key = rr[TYPE] + '_' + rr[ROOT_HASH];
      list[key] = {key: key, value: rr};
      var params = {
        action: 'addMessage',
        resource: isWelcome ? welcomeMessage : rr
      }
      if (error)
        params.error = error

      self.trigger(params);
      var key = IDENTITY + '_' + r.to[ROOT_HASH]
      if (batch.length  &&  !error  &&  list[key].value.pubkeys)
        return self.getDriver(me)
    })
    .then(function() {
      var key = IDENTITY + '_' + r.to[ROOT_HASH]
      if (list[key].value.pubkeys) {
        // if (publishRequestSent)
        //    return
        // if (r[TYPE] !== CUSTOMER_WAITING) {
        return utils.sendSigned(meDriver, {
          msg: toChain,
          to: [{fingerprint: self.getFingerprint(list[key].value)}],
          deliver: true
        })
        .catch(function (err) {
          debugger
        })
      }
    // }
    })
    .then(function(data) {
      if (!requestForForm  &&  isWelcome)
        return
      if (isWelcome  &&  utils.isEmpty(welcomeMessage))
        return
      delete list[rr[TYPE] + '_' + dhtKey]
      if (data)  {
        var roothash = data[0]._props[ROOT_HASH]
        rr[ROOT_HASH] = roothash
        rr[CUR_HASH] = data[0]._props[CUR_HASH]
      }
      var key = rr[TYPE] + '_' + rr[ROOT_HASH];
      batch.push({type: 'put', key: key, value: rr})
      list[key] = {key: key, value: rr};
      // var params = {
      //   action: 'addMessage',
      //   resource: isWelcome ? welcomeMessage : rr
      // }
      // if (error)
      //   params.error = error

      // self.trigger(params);
      return db.batch(batch)
    })
    .catch(function(err) {
      debugger
    });
  },

  getRepresentatives(orgId) {
    var result = this.searchNotMessages({modelName: PROFILE})
    var orgRep = [];
    result.some((ir) =>  {
      if (!ir.organization) return

      if (utils.getId(ir.organization) === orgId)
        orgRep.push(ir)
    })

    return orgRep.length ? orgRep : null
  },

  getRepresentative(orgId) {
    if (currentEmployees[orgId])
      return currentEmployees[orgId]
    var result = this.searchNotMessages({modelName: PROFILE})
    var orgRep;
    result.some((ir) =>  {
      if (!ir.organization) return

      if (utils.getId(ir.organization) === orgId  &&  ir.bot) {
        orgRep = ir
        return true
      }
    })

    return orgRep
  },
  onAddVerification(r, notOneClickVerification, dontSend) {
    var batch = [];
    var key;
    var fromId = utils.getId(r.from);
    var from = list[fromId].value;
    var toId = utils.getId(r.to);
    var to = list[toId].value;

    r[NONCE] = r[NONCE]  ||  this.getNonce()
    r.time = r.time || new Date().getTime();

    var toChain = {}
    if (!dontSend) {
      extend(toChain, r);
      if (r[ROOT_HASH]) {
        toChain[CUR_HASH] = r[ROOT_HASH]
        r[CUR_HASH] = r[ROOT_HASH]
      }
      delete toChain.from
      delete toChain.to
      toChain.time = r.time
    }
    var self = this;
    var key = IDENTITY + '_' + r.to[ROOT_HASH]

    var promise = dontSend
                 ? Q()
                 :  utils.sendSigned(meDriver, {
                      msg: toChain,
                      to: [{fingerprint: this.getFingerprint(list[key].value)}],
                      deliver: true
                  })
    var newVerification
    return promise
    .then(function(data) {
      if (data) {
        var roothash = data[0]._props[ROOT_HASH]
        r[ROOT_HASH] = roothash
        r[CUR_HASH] = data[0]._props[CUR_HASH]
      }
      key = r[TYPE] + '_' + r[ROOT_HASH];
      if (from.organization)
        r.organization = from.organization;
      if (!r.sharedWith) {
        r.sharedWith = []
        r.sharedWith.push(self.createSharedWith(utils.getId(r.from), r.time))
      }

      batch.push({type: 'put', key: key, value: r});
      newVerification = self.buildRef(r)

    // check if send returns somewhere roothash for the new resource
      return db.batch(batch)
    })
    .then(function() {
      var rr = {};
      // extend(rr, from);
      // rr.verifiedByMe = r;
      list[key] = {key: key, value: r};

      if (notOneClickVerification)
        self.trigger({action: 'addItem', resource: r});
      else
        self.trigger({action: 'addVerification', resource: r});

      var verificationRequestId = utils.getId(r.document);
      var verificationRequest = list[verificationRequestId].value;
      if (!verificationRequest.verifications)
        verificationRequest.verifications = [];
      if (!r.txId)
        verificationRequest.verifications.push(newVerification);
      else {
        for (var i=0; i<verificationRequest.verifications.length; i++) {
          if (utils.getId(verificationRequest.verifications).split('_')[1] === r[ROOT_HASH])
            verificationRequest.verifications = newVerification
        }
      }
      // if (!verificationRequest.sharedWith)
      //   verificationRequest.sharedWith = []
      // verificationRequest.sharedWith.push(fromId)
      return db.put(verificationRequestId, verificationRequest);
    })
    .then(function(data) {
      var d = data
    })
    .catch(function(err) {
      err = err
    })
  },
  onGetTo(key) {
    this.onGetItem(key, 'getTo');
  },
  onGetFrom(key) {
    this.onGetItem(key, 'getFrom');
  },
  onGetItem(key, action) {
    var resource = {};

    extend(resource, list[utils.getId(key)].value);
    var props = this.getModel(resource[TYPE]).value.properties;
    for (var p in props) {
      if (p.charAt(0) === '_')
        continue;
      var items = props[p].items;
      if (!items  ||  !items.backlink)
        continue;
      var backlink = items.backlink;
      var itemsModel = this.getModel(items.ref).value;
      var params = {
        modelName: items.ref,
        to: resource,
        meta: itemsModel,
        props: itemsModel.properties
      }
      var result = this.searchNotMessages(params);
      if (result  &&  result.length)
        resource[p] = result;
    }
    this.trigger({ resource: resource, action: action || 'getItem'});
  },

  getItem(resource) {
    var modelName = resource[TYPE];
    var meta = this.getModel(modelName).value;
    var foundRefs = [];
    var refProps = this.getRefs(resource, foundRefs, meta.properties);
    var self = this;
    var newResource = {};
    extend(newResource, resource);
    for (var i=0; i<foundRefs.length; i++) {
     // foundRefs.forEach(function(val) {
       var val = foundRefs[i];
       if (val.state === 'fulfilled') {
         var propValue = val.value[TYPE] + '_' + val.value[ROOT_HASH];
         var prop = refProps[propValue];
         newResource[prop] = val.value;
         newResource[prop].id = val.value[TYPE] + '_' + val.value[ROOT_HASH];
         if (!newResource[prop].title)
            newResource[prop].title = utils.getDisplayName(newResource, meta);
       }
     }
     return newResource;
  },
  getDependencies(resultList) {
    var self = this;
    var newResult = resultList.map(function(resource) {
      return self.getItem(resource);
    });
    return newResult;
  },
  getRefs(resource, foundRefs, props) {
    var refProps = [];
    for (var p in resource) {
      if (props[p] &&  props[p].type === 'object') {
        var ref = props[p].ref;
        if (ref  &&  resource[p]) {
          var rValue;
          // reference property could be set as a full resource (for char to have all info at hand when displaying the message)
          // or resource id
          if (resource[p][ROOT_HASH])
            rValue = resource[p][TYPE] + '_' + resource[p][ROOT_HASH];
          else
            rValue = utils.getId(resource[p]);

          refProps[rValue] = p;
          if (list[rValue]) {
            var elm = {value: list[rValue].value, state: 'fulfilled'};
            foundRefs.push(elm);
          }
        }
      }
    }
    return refProps;
  },
  onAddModelFromUrl(url) {
    var self = this;
    var model, props;
    return fetch(url)
    .then((response) => response.json())
    .then(function(responseData) {
      model = responseData;
      props = model.properties;

      var err = '';
      var id = model.id;

      if (!id)
        err += '"id" is required. Could be something like "myGithubId.nameOfTheModel"';
      var key = id;
      // if (models[key])
      //   err += '"id" is not unique';
      var message = model.message;
      var from = props.from;
      if (!from)
        err += '"from" is required. Should have {ref: "' + PROFILE + '"}';

      var to = props.to;
      if (!to)
        err += '"to" is required. Should have {ref: "' + PROFILE + '"}';
      var time = props.time;
      if (!time)
        err += '"time" is required';

      if (err.length) {
        self.trigger({action: 'newModelAdded', err: err});
        return;
      }
      model.interfaces = [];
      model.interfaces.push(MESSAGE);
      var rootHash = sha(model);
      model[ROOT_HASH] = rootHash;
      model[constants.OWNER] = self.buildRef(me)
      // model[constants.OWNER] = {
      //   id: PROFILE + '_' + me[ROOT_HASH],
      //   title: utils.getDisplayName(me, self.getModel(PROFILE).value.properties),
        // photos: me.photos
      // }
      // Wil need to publish new model
      return db.put(key, model);
    })
    .then(function() {
      if (!me.myModels)
        me.myModels = [];
      var key = model.id;
      me.myModels.push({key: key, title: model.title});

      self.setPropertyNames(props);

      models[key] = {
        key: key,
        value: model
      };
      self.trigger({action: 'newModelAdded', newModel: model});
    })
    .catch(function(err) {
      err = err;
    })
    .done();
  },
  setPropertyNames(props) {
    for (var p in props) {
      var val = props[p]
      if (!val.name && typeof val !== 'function')
        props[p].name = p;
      if (!val.title)
        val.title = utils.makeLabel(p);
    }
  },
  onSaveTemporary(resource) {
    temporaryResources[resource[TYPE]] = resource
  },
  onGetTemporary(type) {
    var r = temporaryResources[type]
    // if (!r) {
    //   r = {_t: type}
    //   if (type === SETTINGS)
    //     r.url = SERVICE_PROVIDERS_BASE_URL || SERVICE_PROVIDERS_BASE_URL_DEFAULT
    // }
    this.trigger({action: 'getTemporary', resource: r})
  },
  onAddItem(params) {
    var value = params.value;
    var resource = params.resource;
    delete temporaryResources[resource[TYPE]]
    var meta = params.meta;

    var isRegistration = params.isRegistration;
    var additionalInfo = params.additionalInfo;
    // Check if there are references to other resources
    var refProps = {};
    var promises = [];
    var foundRefs = [];
    var props = meta.properties;

    if (meta[TYPE] == VERIFICATION  ||  meta.subClassOf === VERIFICATION)
      return this.onAddVerification(resource, true);

    var self = this;
    var checkPublish
    if (meta.id === GUEST_SESSION_PROOF) {
      checkPublish = this.getDriver(me)
      .then(function () {
        // if (publishRequestSent)
          return meDriver.identityPublishStatus()
      })
      .then(function(status) {
        if (!status.queued  &&  !status.current) {
          let orgRep = list[utils.getId(resource.to)].value
          self.publishMyIdentity(orgRep)
        }
      })
    } else {
      checkPublish = Q()
    }

    return checkPublish
    .then(() => {
      for (var p in resource) {
        if (props[p] &&  props[p].type === 'object') {
          var ref = props[p].ref;
          if (ref  &&  resource[p])  {
            let refModel = this.getModel(ref).value
            if (refModel.inlined  ||  refModel.subClassOf === ENUM)
              continue;

            var rValue = utils.getId(resource[p])
            refProps[rValue] = p;
            if (list[rValue]) {
              var elm = {value: list[rValue].value, state: 'fulfilled'};
              foundRefs.push(elm);
            }
            else
              promises.push(Q.ninvoke(db, 'get', rValue));
          }
        }
      }
      // Add items properties if they were created
      var json = JSON.parse(JSON.stringify(value));
      for (p in resource) {
        if (props[p]  &&  props[p].type === 'array')
          json[p] = resource[p];
      }
      if (!json[TYPE])
        json[TYPE] = meta.id;
      var error = this.checkRequired(json, props);
      if (error) {
        foundRefs.forEach(function(val) {
          var propValue = val.value[TYPE] + '_' + val.value[ROOT_HASH];
          var prop = refProps[propValue];
          json[prop] = val.value;
        });

        this.trigger({
          action: 'addItem',
          // list: list,
          resource: json,
          error: error
        });
        return;
      }
      // if (error) {
      //   this.listenables[0].addItem.failed(error);
      //   return;
      // }
      var returnVal
      var identity
      var isNew = !resource[ROOT_HASH];
      // if (!isNew) // make sure that the values of ref props are not the whole resources but their references
      utils.optimizeResource(resource)

      var isMessage = meta.isInterface  ||  (meta.interfaces  &&  meta.interfaces.indexOf(MESSAGE) != -1);
      Q.allSettled(promises)
      .then(function(results) {
        let allFoundRefs = foundRefs.concat(results);
        allFoundRefs.forEach(function(val) {
          if (val.state === 'fulfilled') {
            var value = val.value;
            var propValue = value[TYPE] + '_' + value[ROOT_HASH];
            var prop = refProps[propValue];

            var title = utils.getDisplayName(value, self.getModel(value[TYPE]).value.properties);
            json[prop] = self.buildRef(value)
            if (isMessage)
              json.time = new Date().getTime();
          }
        });
        if (isNew  &&  !resource.time)
          resource.time = new Date().getTime();

        if (!resource  ||  isNew)
          returnVal = json
        else {
          returnVal = {};
          extend(true, returnVal, resource);
          for (var p in json)
            if (!returnVal[p])
              returnVal[p] = json[p];
            else if (!props[p])
              continue
            else if (!props[p].readOnly  &&  !props[p].immutable)
              returnVal[p] = json[p];
        }
        // utils.optimizeResource(returnVal)
        if (!isRegistration) {
          // HACK to not to republish identity
          if (returnVal[TYPE] !== PROFILE)
            returnVal[NONCE] = self.getNonce()
        }

        if (isRegistration)
          return handleRegistration()
        else if (isMessage)
          return handleMessage()
        else
          return save()
      })

      function handleRegistration () {
        self.trigger({action: 'runVideo'})
        return Q.all([
            self.loadDB(),
            Keychain.resetGenericPasswords()
          ])
          .then(function () {
            return self.getDriver(returnVal)
          })
          .then(function () {
            return getDHTKey(publishedIdentity)
          })
          .then(function (dhtKey) {
            if (!resource || isNew) {
              returnVal[ROOT_HASH] = dhtKey
            }

            return save()
          })
      }

      function handleMessage () {
        // TODO: fix hack
        // hack: we don't know root hash yet, use a fake
        if (returnVal.documentCreated)  {
          var params = {action: 'addItem', resource: returnVal}
          self.trigger(params);
          return self.waitForTransitionToEnd()
          .then(function() {
            return save()
          })
          .catch(function(err) {
            err = err
          })
        }
        // Trigger painting before send. for that set ROOT_HASH to some temporary value like NONCE
        // and reset it after the real root hash will be known
        let isNew = returnVal[ROOT_HASH] == null
        if (isNew)
          returnVal[ROOT_HASH] = returnVal[NONCE]

        var tmpKey = returnVal[TYPE] + '_' + returnVal[ROOT_HASH]
        list[tmpKey] = {key: tmpKey, value: returnVal};

        var params;
        if (returnVal[TYPE] === GUEST_SESSION_PROOF) {
          let org = list[utils.getId(returnVal.to)].value.organization
          org = list[utils.getId(org)].value
          params = {action: 'getForms', to: org}
        }
        else {
          params = {
            action: 'addItem',
            resource: returnVal
          }
        }
        var m = self.getModel(returnVal[TYPE]).value
        if (m.subClassOf === FORM) {
          if (self.isConnected)
            params.sendStatus = 'Sending'
          else
            params.sendStatus = 'Queued'
        }
        try {
          self.trigger(params);
        } catch (err) {
          debugger
        }
        return self.waitForTransitionToEnd()
        .then(function () {
          var to = list[utils.getId(returnVal.to)].value;

          var toChain = {}
          if (!isNew)
            toChain[PREV_HASH] = returnVal[CUR_HASH] || returnVal[ROOT_HASH]

          let exclude = ['to', 'from', 'verifications', CUR_HASH, 'sharedWith']
          if (isNew)
            exclude.push(ROOT_HASH)
          extend(toChain, returnVal)
          for (let p of exclude)
            delete toChain[p]

          toChain.time = returnVal.time

          var key = IDENTITY + '_' + to[ROOT_HASH]
          return utils.sendSigned(meDriver, {
            msg: toChain,
            to: [{fingerprint: self.getFingerprint(list[key].value)}],
            deliver: true
          })
        })
        .then(function (entries) {
          var entry = entries[0]
          // TODO: fix hack
          // we now have a real root hash,
          // scrap the placeholder
          delete list[tmpKey]
          returnVal[CUR_HASH] = entry.get(CUR_HASH)
          returnVal[ROOT_HASH] = entry.get(ROOT_HASH)
          return save(true)
        })
      }

      function save (noTrigger) {
        return self._putResourceInDB({
          type: returnVal[TYPE],
          resource: returnVal,
          rootHash: returnVal[ROOT_HASH],
          isRegistration: isRegistration,
          noTrigger: noTrigger
        })
      }
    })
  },
  onGetMe() {
    this.trigger({action: 'getMe', me: me})
  },
  onCleanup() {
    var me  = utils.getMe()
    if (!me)
      return
    var result = this.searchMessages({to: me, modelName: CUSTOMER_WAITING, isForgetting: true});
    if (result.length)
      delete result[result.length - 1]

    return this.cleanup(result)
    .then(() => {
      result = this.searchMessages({to: me, modelName: PRODUCT_LIST, isForgetting: true});
      if (result.length)
        delete result[result.length - 1]
      return this.cleanup(result)
    })

  },
  onShare(resource, to, formResource) {
    if (to[TYPE] === ORGANIZATION)
      to = this.getRepresentative(ORGANIZATION + '_' + to[ROOT_HASH])
    if (!to)
      return

    var ikey = IDENTITY + '_' + to[ROOT_HASH]
    var opts = {
      to: [{fingerprint: this.getFingerprint(list[ikey].value)}],
      deliver: true,
      chain: false
    }
    var self = this
    var promise = resource[CUR_HASH] ? meDriver.share({...opts, [CUR_HASH]: resource[CUR_HASH]}) : Q()
    return promise
    .then(function () {
      return meDriver.share({...opts, [CUR_HASH]: resource.document[ROOT_HASH]})
    })
    .then(function() {
      var key = formResource[TYPE] + '_' + formResource[ROOT_HASH]
      var r = list[key].value
      r.documentCreated = true
      var batch = []
      batch.push({type: 'put', key: key, value: r})
      var toId = utils.getId(to)
      var time = new Date().getTime()
      if (resource[ROOT_HASH]) {
        key = resource[TYPE] + '_' + resource[ROOT_HASH]
        var ver = list[key].value
        if (!ver.sharedWith)
          ver.sharedWith = []

        ver.sharedWith.push(self.createSharedWith(toId, time))
        utils.optimizeResource(ver)
        batch.push({type: 'put', key: key, value: ver})
      }
      var formId = utils.getId(resource.document)
      var form = list[formId].value
      if (!form.sharedWith)
        form.sharedWith = []

      form.sharedWith.push(self.createSharedWith(toId, time))

      utils.optimizeResource(form)
      batch.push({type: 'put', key: formId, value: form})
      return db.batch(batch)
    })
    .then(() => {
      self.trigger({action: 'list', list: self.searchNotMessages({modelName: ORGANIZATION, to: resource})})
    })
    .catch(function(err) {
      debugger
    })
  },
  createSharedWith(toId, time) {
    return {
      bankRepresentative: toId,
      timeShared: time
    }
  },
  checkRequired(resource, meta) {
    var type = resource[TYPE];
    var rootHash = resource[ROOT_HASH];
    var oldResource = (rootHash) ? list[type + '_' + rootHash] : null;
    var required = meta.required;
    if (!required)
      return;
    for (var i=0; i<required.length; i++) {
      var prop = required[i];
      if (!resource[prop] && (!oldResource || !oldResource[prop]))
        return 'Please add "' + meta.properties[prop].title + '"';
    }
  },
  onReloadModels() {
    this.loadModels()
  },
  wipe() {
    return Q.all([
      AsyncStorage.clear(),
      Keychain.resetGenericPasswords()
    ])
  },
  onReloadDB() {
    var self = this

    var destroyTim = meDriver ? meDriver.destroy() : Q()
    return destroyTim
      .then(() => this.wipe())
      .then(() => {
        AlertIOS.alert('please refresh')
        return Q.Promise(function (resolve) {})
      })
      .then(function() {
        list = {};
        models = {};
        me = null;
        return
        // return self.loadModels()
      })
      .then(function() {
        self.trigger({action: 'reloadDB', models: models});
      })
      .catch(function(err) {
        err = err;
      });
    // var togo = 1;
    // // this.loadModels()
    // // var name = me.firstName.toLowerCase();
    // var self = this
    // meDriver.destroy()
    // .then(function() {
    //   meDriver = null
    //   driverPromise = null

    //   rimraf('./', function () {
    //     console.log('rimraf done')
    //     finish()
    //   })
    //   ;[
    //     'addressBook.db',
    //     'msg-log.db',
    //     'messages.db',
    //     'txs.db'
    //   ].forEach(function (dbName) {
    //     ;[name].forEach(function (name) {
    //       togo++
    //       leveldown.destroy(TIM_PATH_PREFIX + '-' + dbName, finish)
    //     })
    //   })

    //   function finish () {
    //     if (--togo === 0)  {
    //       isLoaded = false;
    //       self.onReloadDB1()
    //     }
    //   }
    // })
    // .catch(function(err) {
    //   err = err
    // })
  },
  onMessageList(params) {
    this.onList(params);
  },
  onList(params) {
    if (isLoaded)
      this.getList(params);
    else {
      var self = this;
      this.loadDB()
      .then(function() {
        isLoaded = true;
        if (params.modelName)
          self.getList(params);
      });
    }
  },
  getList(params) {
    //query, modelName, resource, isAggregation, prop) {
    // meDriver.messages().byRootHash("41677f5827973883a3a5259c1337bda9a5360d38", function(err, r) {
    //   meDriver.lookupObject(r[0])
    //     .then(function (obj) {
    //       debugger
    //     })
    // })
    var result = this.searchResources(params);
    if (params.isAggregation)
      result = this.getDependencies(result);
    if (!result) {
      // First time. No connection no providers yet loaded
      if (!this.isConnected  &&  params.modelName === ORGANIZATION)
        this.trigger({action: 'list', alert: translate('noConnection')})

      return
    }

    var model = this.getModel(params.modelName).value;
    var isMessage = model.isInterface  ||  (model.interfaces  &&  model.interfaces.indexOf(MESSAGE) != -1);

    // if (!isMessage)
    //   return
    // HACK
    // utils.dedupeVerifications(result)

    // var resultList = [];
    // result.forEach((r) =>  {
    //   var rr = {};
    //   extend(rr, r);
    //   resultList.push(rr);
    // })
    var resultList = result
    var shareableResources;
    if (isMessage  &&  !params.isAggregation  &&  params.to)
      shareableResources = this.getShareableResources(result, params.to);
    var retParams = {
      action: isMessage  &&  !params.prop ? 'messageList' : 'list',
      list: resultList,
      spinner: params.spinner,
      isAggregation: params.isAggregation
    }
    // if (isMessage) {
    //   let orgId = utils.getId(params.to)
    //   let styles
    //   if (SERVICE_PROVIDERS)
    //      styles = SERVICE_PROVIDERS.filter((sp) => {
    //         if (sp.org === orgId)
    //           return true
    //       })
    //   if (styles  &&  styles.length)
    //     retParams.style = styles[0].style
    // }

    if (shareableResources)
      retParams.shareableResources = shareableResources;
    if (params.prop)
      retParams.prop = params.prop;

    this.trigger(retParams);
  },

  searchResources(params) {
    var meta = this.getModel(params.modelName).value;
    var isMessage = meta.isInterface  ||  (meta.interfaces  &&  meta.interfaces.indexOf(MESSAGE) != -1);
    if (isMessage  ||  meta.id === FORM)
      return this.searchMessages(params);
    else
      return this.searchNotMessages(params);
  },

  searchNotMessages(params) {
    var foundResources = {};
    var modelName = params.modelName;
    var to = params.to;
    var notVerified = params.notVerified
    var meta = this.getModel(modelName).value;
    var props = meta.properties;
    var containerProp, resourceId;

    let isOrg = params.modelName == ORGANIZATION
    if (isOrg)
      currentEmployees = {}
    // to variable if present is a container resource as for example subreddit for posts or post for comments
    // if to is passed then resources only of this container need to be returned
    if (to) {
      for (var p in props) {
        if (props[p].ref  &&  props[p].ref === to[TYPE]) {
          containerProp = p;
          resourceId = to[TYPE] + '_' + to[ROOT_HASH];
        }
      }
    }
    var query = params.query;

    var required = meta.required;
    var meRootHash = me  &&  me[ROOT_HASH];
    var meId = PROFILE + '_' + meRootHash;
    var subclasses = utils.getAllSubclasses(modelName).map(function(r) {
      return r.id
    })
    let orgToForm = {}
    for (var key in list) {
      var r = list[key].value;
      if (key.indexOf(modelName + '_') == -1) {
        var s = key.split('_')[0]
        if (isOrg) {
          if (this.getModel(s).value.subClassOf !== FORM)
            continue
          let toId = utils.getId(list[key].value.to)
          // The resource was never shared or it has a shared with party in it
          if (r.sharedWith) {
            let wasShared
            r.sharedWith.forEach((o) => {
              let org = list[o.bankRepresentative].value.organization
              let orgId = utils.getId(org)
              if (orgToForm[orgId])
                orgToForm[orgId] = ++orgToForm[orgId]
              else
                orgToForm[orgId] = 1
            })
          }
          else {
            let org = list[toId].value.organization
            if (!org) {
              let fromId = utils.getId(list[key].value.from)
              org = list[fromId].value.organization
            }
            let orgId = utils.getId(org)
            if (orgToForm[orgId])
              orgToForm[orgId] = ++orgToForm[orgId]
            else
              orgToForm[orgId] = 1
          }
          continue
        }
        if (subclasses) {
          if (subclasses.indexOf(s) === -1)
            continue;
        }
        else
          continue
      }
      else if (notVerified  &&  (r.verifications  &&  r.verifications.length))
        continue
      if (r.canceled)
        continue;
      // if (r[constants.OWNER]) {
      //   var id = utils.getId(r[constants.OWNER]);
      //   if (id != me[TYPE] + '_' + me[ROOT_HASH])
      //     continue;
      // }
      if (containerProp  &&  (!r[containerProp]  ||  utils.getId(r[containerProp]) !== resourceId))
        continue;
      if (!query) {
         foundResources[key] = r;
         continue;
       }
       // primitive filtering for this commit
       var combinedValue = '';
       for (var rr in props) {
         if (r[rr] instanceof Array)
          continue;
         combinedValue += combinedValue ? ' ' + r[rr] : r[rr];
       }
       if (!combinedValue  ||  (combinedValue  &&  (!query || combinedValue.toLowerCase().indexOf(query.toLowerCase()) != -1))) {
         foundResources[key] = r;
       }
    }
    // Don't show current 'me' contact in contact list or my identities list
    var isIdentity = modelName === PROFILE;
    if (!containerProp  &&  me  &&  isIdentity) {
      if (sampleData.getMyId())
        delete foundResources[PROFILE + '_' + me[ROOT_HASH]];
      else if (!isTest) {
        var myIdentities = list[MY_IDENTITIES].value.allIdentities;
        myIdentities.forEach((meId) =>  {
          if (foundResources[meId.id])
             delete foundResources[meId.id];
        })
      }
    }
    if (utils.isEmpty(foundResources))
      return
    var result = utils.objectToArray(foundResources);
    if (isIdentity) {
      result.forEach(function(r) {
        if (r.organization) {
          var res = list[utils.getId(r.organization.id)];
          if (res  &&  res.value) {
            var photos = res.value.photos;
            if (photos)
              r.organization.photo = photos[0].url;
          }
        }
      });
    }
    if (result.length === 1)
      return result
    var sortProp = params.sortProperty;
    if (sortProp) {
      var asc = (typeof params.asc != 'undefined') ? params.asc : false;
      if (props[sortProp].type == 'date') {
        result.sort(function(a,b) {
          var aVal = a[sortProp] ? a[sortProp] : 0;
          var bVal = b[sortProp] ? b[sortProp] : 0;
          if (asc)
            return aVal - bVal;
          else
            return bVal - aVal;
        });
      }
      else if (props[sortProp].type == 'string')  {
        result.sort();
        if (asc)
          result = result.reverse();
      }
      else if (props[sortProp].type == 'number') {
        result.sort(function(a, b) {
          return asc ? a - b : b - a
        });
      }
    }

    if (isOrg) {
      // cloning orgs to re-render the org list with the correct number of forms
      let retOrgs = []
      result.forEach((r) => {
        let oId = utils.getId(r)
        let rr = {}
        extend(true, rr, r)
        retOrgs.push(rr)
        rr.numberOfForms = orgToForm[oId]
      })
      result = retOrgs
    }
    return result;
  },
  searchMessagesNew(params) {
    let bankID = utils.getId(params.to)
    let messages = bankMessages[bankID]
    let promise = messages ? Q() : this.getConversation(params)
    let result = []
    let self = this
    return promise
    .then((data) => {
      if (data)
        return data
      data = Object.keys(messages)
      var defer = Q.defer()
      var togo = Object.keys(data).length
      for (let r of data) {
        meDriver.lookupObjectsByRootHash(r.split('_')[1])
        .then(function (objs) {
          var obj = objs[objs.length - 1]
          var res = obj.parsed.data
          var val = extend(true, res)
          self.fillFromAndTo(obj, val)

          val[ROOT_HASH] = obj[ROOT_HASH]
          result.push(val)
          if (--togo === 0)
            defer.resolve(result)
        })
        .catch((err) => {
          debugger
        })
      }
      return result
    })
  },

  getConversation(params) {
    var self = this
    var list = {}
    var hasVerifications
    var excludeTypes = [
      CUSTOMER_WAITING,
      constants.TYPES.FORGOT_YOU,
      constants.TYPES.FORGET_ME,
      constants.TYPES.IDENTITY_PUBLISHING_REQUEST
    ]
    var bankID = utils.getId(params.to)
    var reps = params.to[TYPE] === constants.TYPES.ORGANIZATION
             ? this.getRepresentatives(bankID)
             : [params.to]
    var messages = {}
    bankMessages[bankID] = messages
    return meDriver.getConversation(reps[0][ROOT_HASH])
    .then(function(data) {
      var result = []
      var defer = Q.defer()
      var togo = data.length
      var hasPL
      for (var i=data.length - 1; i>=0; i--) {
        var r = data[i]
        if (excludeTypes.indexOf(r[TYPE]) !== -1 ||
            !self.getModel(r[TYPE])) {
          --togo
          continue
        }
        if (r[TYPE] === PRODUCT_LIST) {
          if (hasPL) {
            --togo
            continue
          }
          hasPL = true
        }

        meDriver.lookupObject(r)
        .then(function (obj) {
          var res = obj.parsed.data
          var val = extend(true, res)
          self.fillFromAndTo(obj, val)

          val[ROOT_HASH] = obj[ROOT_HASH]
          result.push(val)
          let rid = utils.getId(val)
          list[rid] = {
            key: rid,
            value: {
              id: rid,
              title: utils.getDisplayName(val, utils.getModel(obj[TYPE]).value.properties),
              time: val.time
            }
          }
          if (val.photos)
            list[rid].value.photos = [val.photos[0]]
          if (val[TYPE] === VERIFICATION)
            hasVerifications = true

          if (--togo === 0)
            defer.resolve(result)
        })
        .catch(function(err) {
          debugger
        })
      }
      return defer.promise
    })
    .then(function(result) {
      if (hasVerifications) {
        result.forEach(function(r) {
          if (r[TYPE] === VERIFICATION)
            r.document = list[utils.getId(r.document)]
        })
      }
      result.sort(function(a, b) {
        return a.time - b.time;
      });
      result.forEach(function(r) {
        messages[utils.getId(r)] = r.time
      })
      // var shareableResources;
      // if (!params.isAggregation  &&  params.to)
      //   shareableResources = self.getShareableResources(result, params.to);

      // var retParams = {
      //   action: !params.prop ? 'messageList' : 'list',
      //   list: result,
      //   spinner: params.spinner,
      //   isAggregation: params.isAggregation
      // }
      // if (shareableResources)
      //   retParams.shareableResources = shareableResources;
      // if (params.prop)
      //   retParams.prop = params.prop;

      // self.trigger(retParams);
      return result
    })
    .catch(function(err) {
      debugger
    })
  },

  // extractReferences(val) {
  //   let props = utils.getModel(val[TYPE]).value.properties
  //   let r = {_t: val[TYPE]}
  //   for (let p in val) {
  //     if (props[p].ref) {
  //       if (props[p].ref !== constants.TYPE.MONEY)
  //         r[p] = val[p]
  //     }
  //     else if (props[p].type === 'array') {
  //       if
  //     }
  //   }
  // },
  getMessagesBefore(params) {
    var bankID = utils.getId(params.to)
    var messages
    var self = this
    var promise = bankMessages[bankID] ? Q() : this.searchMessagesNew(params)
    return promise
    .then(function(result) {
      var limit = params.limit
      var allMessages = bankMessages[bankID]

      var ids = Object.keys(allMessages)
      var start = ids.indexOf(utils.getId(params.lastId))
      var end = Math.max(0, start - limit)
      var result = []
      for (var i=start - 1; i > end &&  i >= 0; i--) {
        var val = list[ids[i]]
        if (val)
          result.push(val.value)
      }
      self.trigger({action: 'messageList', loadingEarlierMessages: true, list: result})
    })
  },
  // searchFormsToShare(params) {
  //   var modelName = params.modelName;
  //   var meta = this.getModel(modelName).value;
  //   var chatFrom = params.from
  //   chatFrom = list[utils.getId(chatFrom)].value

  //   var foundResources = {};
  //   var isAllMessages = meta.isInterface;
  //   var props = meta.properties;

  //   var implementors = isAllMessages ? utils.getAllSubclasses(modelName) : null;

  //   var required = meta.required;
  //   var meRootHash = me  &&  me[ROOT_HASH];
  //   var meId = PROFILE + '_' + meRootHash;
  //   var meOrgId = me.organization ? utils.getId(me.organization) : null;

  //   var chatId = chatFrom ? utils.getId(chatFrom) : null;
  //   var isChatWithOrg = chatFrom  &&  chatFrom[TYPE] === ORGANIZATION;
  //   var fromId
  //   var fromOrg
  //   if (isChatWithOrg) {
  //     var rep = this.getRepresentative(chatId)
  //     if (!rep)
  //       return
  //     chatFrom = rep
  //     chatId = utils.getId(chatFrom)
  //     // isChatWithOrg = false
  //     fromId = utils.getId(params.from)
  //     fromOrg = list[fromId].value
  //   }
  //   else {
  //     if (chatFrom  &&  chatFrom.organization) {
  //       fromId = utils.getId(chatFrom.organization)
  //     }
  //   }
  //   var lastPL
  //   var sharedWithTimePairs = []
  //   for (var key in list) {
  //     var iMeta = null;
  //     if (isAllMessages) {
  //       if (implementors) {
  //         implementors.some((impl) => {
  //           if (impl.id === key.split('_')[0]) {
  //             iMeta = impl;
  //             return true
  //           }
  //         })
  //         if (!iMeta)
  //           continue;
  //       }
  //     }
  //     else if (key.indexOf(modelName + '_') === -1) {
  //       var rModel = this.getModel(key.split('_')[0])
  //       if (!rModel)
  //         continue
  //       rModel = rModel.value;
  //       if (rModel.subClassOf !== modelName)
  //         continue;
  //     }
  //     if (!iMeta)
  //       iMeta = meta;
  //     var r = list[key].value;
  //     if (r.canceled)
  //       continue;
  //     // Make sure that the messages that are showing in chat belong to the conversation between these participants
  //     // HACK to not show service message in customer stream
  //     if (r.message  &&  r.message.length)  {
  //       if (r.message === '[already published](tradle.Identity)')
  //         continue
  //       var m = utils.splitMessage(r.message)

  //       if (m.length === 2) {
  //         if (m[1] === PROFILE)
  //           continue;
  //       }
  //     }
  //     var isSharedWith = false, timeResourcePair = null
  //     if (r.sharedWith  &&  fromId) {
  //       var sharedWith = r.sharedWith.filter(function(r) {
  //         let org = list[r.bankRepresentative].value.organization
  //         return (org) ? utils.getId(org) === fromId : false
  //       })
  //       isSharedWith = sharedWith.length !== 0
  //       if (isSharedWith) {
  //         timeResourcePair = {
  //           time: sharedWith[0].timeShared,
  //           resource: r
  //         }
  //       }
  //     }

  //     if (chatFrom) {
  //       var isForm = this.getModel(r[TYPE]).value.subClassOf === FORM
  //       var fromID = utils.getId(r.from);
  //       var toID = utils.getId(r.to);

  //       if (fromID !== meId  &&  toID !== meId  &&  toID != meOrgId)
  //         continue;
  //       if (isChatWithOrg) {
  //         var msgOrg = list[toID].value.organization
  //         if (!msgOrg)
  //           msgOrg = list[fromID].value.organization
  //         let msgOrgId = utils.getId(msgOrg)
  //         if (fromId !== msgOrgId  &&  !isSharedWith) // do not show shared verifications
  //           continue
  //       }
  //       else {
  //         if (!isSharedWith  &&  fromID !== chatId  &&  toID != chatId  &&  toID != meOrgId)
  //           continue;
  //       }
  //     }
  //     if (r.sharedWith  &&  fromId  &&  !isSharedWith)
  //       continue

  //     var msg = this.fillMessage(r);
  //     if (!msg)
  //       msg = r
  //     foundResources[key] = msg;
  //     if (!timeResourcePair)
  //       sharedWithTimePairs.push({
  //         time: r.time,
  //         resource: msg
  //       })
  //     else {
  //       timeResourcePair.resource = msg
  //       sharedWithTimePairs.push(timeResourcePair)
  //     }
  //     if (params.limit  &&  Object.keys(foundResources).length === params.limit)
  //       break;
  //   }

  //   sharedWithTimePairs.sort(function(a, b) {
  //     return a.time - b.time;
  //   });

  //   var result = []
  //   sharedWithTimePairs.forEach((r) => {
  //     result.push(r.resource)
  //   })

  //   if (!params.isForgetting) {
  //     result = result.filter((r, i) => {
  //       if (r[TYPE] === PRODUCT_LIST) {
  //         var next = result[i + 1]
  //         if (next && next[TYPE] === PRODUCT_LIST) {
  //           return false
  //         }
  //       }

  //       return true
  //     })
  //   }

  //   // not for subreddit
  //   result.forEach((r) =>  {
  //     r.from.photos = list[utils.getId(r.from)].value.photos;
  //     var to = list[utils.getId(r.to)]
  //     if (!to) console.log(r.to)
  //     r.to.photos = to && to.value.photos;
  //   })
  //   return result;
  // },

  /*
     params:
       modelName - type of the resources to search
       to: who am I talking to - usually company representatice.
           In non-strict mode the result will be array that contains resources where
           either 'to' or 'from' properties could be the representative of 'to' organization'
       strict: 'to' exclusively should have the params.to value
  */
  searchMessages(params) {
    if (params.loadingEarlierMessages)
      return this.getMessagesBefore(params)

    var query = params.query;
    var modelName = params.modelName;
    var meta = this.getModel(modelName).value;
    var isVerification = modelName === VERIFICATION  ||  meta.subClassOf === VERIFICATION;
    var chatTo = params.to
    if (chatTo  &&  chatTo.id)
      chatTo = list[utils.getId(chatTo)].value

    var prop = params.prop;
    if (typeof prop === 'string')
      prop = meta[prop];
    var backlink = prop ? (prop.items ? prop.items.backlink : prop) : null;
    var foundResources = {};
    var isAllMessages = meta.isInterface;
    var props = meta.properties;

    var implementors = isAllMessages ? utils.getImplementors(modelName) : null;

    var required = meta.required;
    var meRootHash = me  &&  me[ROOT_HASH];
    var meId = PROFILE + '_' + meRootHash;
    var meOrgId = me.organization ? utils.getId(me.organization) : null;

    var chatId = chatTo ? chatTo[TYPE] + '_' + chatTo[ROOT_HASH] : null;
    var isChatWithOrg = chatTo  &&  chatTo[TYPE] === ORGANIZATION;
    var toId
    var toOrg
    if (isChatWithOrg) {
      var rep = this.getRepresentative(chatId)
      if (!rep)
        return
      chatTo = rep
      chatId = chatTo[TYPE] + '_' + chatTo[ROOT_HASH]
      // isChatWithOrg = false
      toId = utils.getId(params.to)
      toOrg = list[toId].value
    }
    else {
      if (chatTo  &&  chatTo.organization) {
        toId = utils.getId(chatTo.organization)
      }
    }
    // if (isChatWithOrg  &&  !chatTo.name) {
    //   chatTo = list[chatId].value;
    // }
    var testMe = chatTo ? chatTo.me : null;
    if (testMe) {
      if (testMe === 'me') {
        if (!originalMe)
          originalMe = me;
        testMe = originalMe[ROOT_HASH];
      }

      isTest = true;
      var meId = constants.TYPES.PROFILE + '_' + testMe;
      me = list[meId].value;
      this.setMe(me);
      var myIdentities = list[MY_IDENTITIES].value;
      if (myIdentities)
        myIdentities.currentIdentity = meId;
    }
    var lastPL
    var sharedWithTimePairs = []
    var from = params.from
    for (var key in list) {
      var iMeta = null;
      if (isAllMessages) {
        if (implementors) {
          implementors.some((impl) => {
            if (impl.id === key.split('_')[0]) {
              iMeta = impl;
              return true
            }
          })
          if (!iMeta)
            continue;
        }
      }
      else if (key.indexOf(modelName + '_') === -1) {
        var rModel = this.getModel(key.split('_')[0])
        if (!rModel)
          continue
        rModel = rModel.value;
        if (rModel.subClassOf !== modelName)
          continue;
      }
      if (!iMeta)
        iMeta = meta;
      var r = list[key].value;
      if (r.canceled)
        continue;
      // Make sure that the messages that are showing in chat belong to the conversation between these participants
      if (isVerification) {
        if (r.organization) {
          if (!r.organization.photos) {
            var orgPhotos = list[utils.getId(r.organization.id)].value.photos;
            if (orgPhotos)
              r.organization.photos = [orgPhotos[0]];
          }
        }
        if (r.document) {
          var d = list[utils.getId(r.document)]
          if (!d)
            continue
          r.document = d.value;
        }
      }
      // HACK to not show service message in customer stream
      else if (r.message  &&  r.message.length)  {
        if (r.message === '[already published](tradle.Identity)')
          continue
        var m = utils.splitMessage(r.message)

        if (m.length === 2) {
          if (m[1] === PROFILE)
            continue;
        }
        if (chatTo.organization  &&  r[TYPE] === constants.TYPES.CUSTOMER_WAITING) {
          var rid = utils.getId(chatTo.organization);

          if (rid.indexOf(ORGANIZATION) == 0) {
            var org = list[utils.getId(r.to)].value.organization
            var orgId = utils.getId(org)
            if (params.isForgetting  &&  orgId === rid) {
              // foundResources[key] = r
              sharedWithTimePairs.push({
                 time: r.time,
                 resource: r
              })
            }
            if (!me.organization  ||  rid !== utils.getId(me.organization))
             continue;
           }
        }
        // Show only the last 'Choose the product' message
        // else if (r[TYPE] === PRODUCT_LIST) {
          // if (!lastPL  ||  lastPL.time < r.time) {
          //   var id = utils.getId(r.from)
          //   if (utils.getId(list[id].value.organization) === toId)
          //     lastPL = r
          // }
          // continue;
        // }
        // else if (m.length === 2  &&  m[0] === '[application for') {
          // continue
          // var id = utils.getId(r.to)
          // if (id === toId) {
          //   var fr = foundResources[foundResources.length - 1]
          //   if ()
          // }
        // }
      }
      var isSharedWith = false, timeResourcePair = null
      if (r.sharedWith  &&  toId) {
        var sharedWith = r.sharedWith.filter(function(r) {
          let org = list[r.bankRepresentative].value.organization
          return (org) ? utils.getId(org) === toId : false
        })
        isSharedWith = sharedWith.length !== 0
        if (isSharedWith) {
          timeResourcePair = {
            time: sharedWith[0].timeShared,
            resource: r
          }
        }
      }

      if (chatTo) {
        if (backlink  &&  r[backlink]) {
          var s = params.resource ? utils.getId(params.resource) : chatId
          if (s === utils.getId(r[backlink])) {
            foundResources[key] = r;
            if (timeResourcePair)
              sharedWithTimePairs.push(timeResourcePair)
            else
              sharedWithTimePairs.push({
                time: r.time,
                resource: r
              })
            if (params.limit  &&  Object.keys(foundResources).length === params.limit)
              break;
          }

          continue;
        }
        var m = this.getModel(r[TYPE]).value
        var isVerificationR = r[TYPE] === VERIFICATION  ||  m.subClassOf === VERIFICATION
        var isForm = m.subClassOf === FORM
        var isMyProduct = m.subClassOf === MY_PRODUCT
        let isProductApplication = m.id === PRODUCT_APPLICATION
        if ((!r.message  ||  r.message.trim().length === 0) && !r.photos &&  !isVerificationR  &&  !isForm  &&  !isMyProduct && !isProductApplication)
          // check if this is verification resource
          continue;
        var fromID = utils.getId(r.from);
        var toID = utils.getId(r.to);

        if (params.strict) {
          if (chatId !== toID)
            continue
        }
        if (fromID !== meId  &&  toID !== meId  &&  toID != meOrgId)
          continue;
        if (isChatWithOrg) {
          var msgOrg = list[toID].value.organization
          if (!msgOrg)
            msgOrg = list[fromID].value.organization
          let msgOrgId = utils.getId(msgOrg)
          if (toId !== msgOrgId  &&  (!isSharedWith || isVerificationR)) // do not show shared verifications
            continue
        }
        else {
          if (!isSharedWith  &&  fromID !== chatId  &&  toID != chatId  &&  toID != meOrgId)
            continue;
        }
      }
      if (params.strict  &&  chatId !== utils.getId(r.to))
        continue

      if (r.sharedWith  &&  toId  &&  !isSharedWith)
        continue
      // if (r.sharedWith  &&  toId) {
      //   var arr = r.sharedWith.filter(function(r) {
      //     return utils.getId(list[r.bankRepresentative].value.organization) === toId
      //   })
      //   if (!arr.length)
      //     continue
      //  }
       if (isVerificationR  ||  r[TYPE] === ADDITIONAL_INFO) {
        // if (!isSharedWith)
        //   continue
        var doc = {};
        var rDoc = list[utils.getId(r.document)]
        if (!rDoc) {
          if (params.isForgetting) {
            foundResources[key] = r
            if (timeResourcePair)
              sharedWithTimePairs.push(timeResourcePair)
            else
              sharedWithTimePairs.push({
                time: r.time,
                resource: r
              })
          }
          continue
        }

        // extend(true, doc, rDoc.value);
        // TODO: check if we can copy by reference
        for (var p in rDoc.value) {
          if (p === 'verifications' || p === 'additionalInfo') continue

          var val = rDoc.value[p]
          switch (typeof val) {
            case 'object':
              if (val) {
                doc[p] = extend(true, val)
              }
              break
            default:
              doc[p] = val
              break
          }
        }

        r.document = doc;
      }

      if (!query) {
        var msg = this.fillMessage(r);
        if (!msg)
          msg = r
        foundResources[key] = msg;
        if (!timeResourcePair)
          sharedWithTimePairs.push({
            time: r.time,
            resource: msg
          })
        else {
          timeResourcePair.resource = msg
          sharedWithTimePairs.push(timeResourcePair)
        }
        if (params.limit  &&  Object.keys(foundResources).length === params.limit)
          break;
        continue;
      }
       // primitive filtering for this commit
      var combinedValue = '';
      for (var rr in props) {
        if (r[rr] instanceof Array)
         continue;
        combinedValue += combinedValue ? ' ' + r[rr] : r[rr];
      }
      if (!combinedValue  ||  (combinedValue  &&  (!query || combinedValue.toLowerCase().indexOf(query.toLowerCase()) != -1))) {
        foundResources[key] = this.fillMessage(r);
        if (timeResourcePair)
          sharedWithTimePairs.push(timeResourcePair)
        else
          sharedWithTimePairs.push({
            time: r.time,
            resource: r
          })

        if (params.limit  &&  Object.keys(foundResources).length === params.limit)
          break;
      }
    }

    sharedWithTimePairs.sort(function(a, b) {
      return a.time - b.time;
    });

    var result = []
    sharedWithTimePairs.forEach((r) => {
      result.push(r.resource)
    })

    // var result = utils.objectToArray(foundResources);
    // if (lastPL)
    //   result.push(lastPL)

    if (params.isForgetting)
      return result
    let paRequests = {}
    let formRequests = {}
    result = result.filter((r, i) => {
      if (r[TYPE] === PRODUCT_LIST) {
        var next = result[i + 1]
        if (next && next[TYPE] === PRODUCT_LIST)
          return false
      }
      // Gather info about duplicate requests for the same product
      // if (r[TYPE] === PRODUCT_APPLICATION)  {
      //   if (!paRequests[r.product])
      //     paRequests[r.product] = []
      //   paRequests[r.product].push(i)
      // }
      // if (r[TYPE] === SIMPLE_MESSAGE  &&  r.message) {
      //   let parts = utils.splitMessage(r.message)
      //   if (parts.length === 2) {
      //     let formM = utils.getModel(parts[1])
      //     if (formM) {
      //       if (!formRequests[parts[1]])
      //         formRequests[parts[1]] = []
      //       formRequests[parts[1]].push(i)
      //     }
      //   }
      // }

      let m = utils.getModel(r[TYPE]).value
      let isMyProduct = m.subClassOf === MY_PRODUCT
      let isForm = !isMyProduct && m.subClassOf === FORM
      // r.from.photos = list[utils.getId(r.from)].value.photos;
      // var to = list[utils.getId(r.to)]
      // if (!to) console.log(r.to)
      // r.to.photos = to  &&  to.value.photos;
      if (isMyProduct)
        r.from.organization = list[utils.getId(r.from)].value.organization
      else if (isForm  &&  !params.isForgetting) {
        // set organization and photos for items properties for better displaying
        let form = list[utils.getId(r.to)].value
        r.to.organization = form.organization
        for (var p in r) {
          if (!m.properties[p]  ||  m.properties[p].type !== 'array' ||  !m.properties[p].items.ref)
            continue
          let pModel = utils.getModel(m.properties[p].items.ref).value
          if (pModel.properties.photos) {
            let items = r[p]
            items.forEach((ir) => {
              let itemPhotos = list[utils.getId(ir)].value.photos
              if (itemPhotos)
                ir.photo = itemPhotos[0].url
            })
          }
        }

      }

      return true
    })

    return result;
  },
  fillMessage(r) {
    var resource = {};
    extend(resource, r);
    if (!r.verifications  ||  !r.verifications.length)
      return resource;
    for (var i=0; i<resource.verifications.length; i++) {
      var v = resource.verifications[i];
      var vId = v.id ? utils.getId(v.id) : v[TYPE] + '_' + v[ROOT_HASH];
      var ver = {};
      extend(ver, list[vId].value);
      resource.verifications[i] = ver;
      if (ver.organization  &&  !ver.organization.photos) {
        var orgPhotos = list[utils.getId(ver.organization.id)].value.photos;
        if (orgPhotos)
          ver.organization.photo = orgPhotos[0].url;
      }
      // resource.time = ver.time;
    }
    return resource;
  },

  // Gathers resources that were created on this official account to figure out if the
  // customer has some other official accounts where he already submitted this information
  getShareableResources(foundResources, to) {
    if (!foundResources)
      return
    var verTypes = [];
    var meId = me[TYPE] + '_' + me[ROOT_HASH];
    var simpleLinkMessages = {}
    for (var i=0; i<foundResources.length; i++) {
      var r = foundResources[i];
      if (me  &&  utils.getId(r.to) !== meId  &&  utils.getId(r.from) !== meId)
        continue;
      // documentCreated identifier is set when the document of this type was created
      // and we don't want to create it again from this same notification
      if (r[TYPE] !== SIMPLE_MESSAGE  ||  r.documentCreated)
        continue;
      var msgParts = utils.splitMessage(r.message);
      // Case when the needed form was sent along with the message
      if (msgParts.length !== 2)
        continue;
      // Case when customer already has resource to SHARE on the screen but accidentally
      // or otherwise clicked on PRODUCT list link. To avoid the multiple shares
      // of the same resource with the same financial institution
      let rr = simpleLinkMessages[msgParts[1]]
      if (rr) {
        rr.documentCreated = true
        list[utils.getId(rr)].value.documentCreated = true
        continue
      }
      simpleLinkMessages[msgParts[1]] = r
      var msgModel = this.getModel(msgParts[1]);
      if (msgModel  &&  msgModel.value.subClassOf !== MY_PRODUCT)
        verTypes.push(msgModel.value.id);
    }
    var shareableResources = {};

    var isOrg = to  &&  to[TYPE] === ORGANIZATION
    var org = isOrg ? to : (to.organization ? list[utils.getId(to.organization)].value : null)
    var reps
    if (isOrg)
      reps = this.getRepresentatives(utils.getId(org))
    else
      reps = [utils.getId(to)]

    var productsToShare = this.searchMessages({modelName: MY_PRODUCT, to: utils.getMe(), strict: true})
    if (productsToShare  &&  productsToShare.length) {
      productsToShare.forEach((r) => {
        let fromId = utils.getId(r.from)
        if (r.sharedWith) {
          let sw = r.sharedWith.filter((r) => {
            if (reps.filter((rep) => {
                    if (utils.getId(rep) === r.bankRepresentative)
                      return true
                  }).length)
              return true
          })
          if (sw.length)
            return
        }
        var docType = r[TYPE]
        var v = shareableResources[docType];
        if (!v)
          shareableResources[docType] = [];
        let rr = {
          _t: VERIFICATION,
          document: r,
          organization: list[utils.getId(r.from)].value.organization
        }
        shareableResources[docType].push(rr);
      })
    }
    if (!verTypes.length)
      return shareableResources

    var l = this.searchMessages({modelName: VERIFICATION})
    l.forEach(function(val) {
      var doc = val.document
      var docType = (doc.id && doc.id.split('_')[0]) || doc[TYPE];
      if (verTypes.indexOf(docType) === -1)
        return;
      var id = utils.getId(val.to.id);
      if (id !== meId)
        return
      var document = doc.id ? list[utils.getId(doc.id)]  &&  list[utils.getId(doc.id)].value : doc;
      if (!document)
        return;
      if (to  &&  org  &&  document.verifications) {
        var thisCompanyVerification;
        for (var i=0; i<document.verifications.length; i++) {
          var v = document.verifications[i];
          if (v.organization  &&  utils.getId(org) === utils.getId(v.organization)) {
            let sharedWith = doc.sharedWith
            if (!sharedWith)
              thisCompanyVerification = true;
            else {
              let sw = sharedWith.filter((r) => {
                if (reps.filter((rep) => {
                        if (utils.getId(rep) === r.bankRepresentative)
                          return true
                      }).length)
                  return true
              })
              if (sw.length)
                thisCompanyVerification = true
            }
            break;
          }
        }
        if (thisCompanyVerification)
          return;
      }
      var value = {};
      extend(value, val);
      value.document = document;
      var v = shareableResources[docType];
      if (!v)
        shareableResources[docType] = [];
      shareableResources[docType].push(value);
    })
    // Allow sharing non-verified forms
    verTypes.forEach((verType) => {
      var l = this.searchNotMessages({modelName: verType, notVerified: true})
      if (!l)
        return
      l.forEach((r) => {
        let docType = r[TYPE]
        var v = shareableResources[docType];
        if (!v)
          shareableResources[docType] = [];
        let rr = {
          _t: VERIFICATION,
          document: r,
          organization: list[utils.getId(r.to)].value.organization
        }
        shareableResources[docType].push(rr)
      })
    })

    return shareableResources;
  },
  getNonce() {
    return crypto.randomBytes(32).toString('hex')
  },
  _putResourceInDB(params) {
    var modelName = params.type
    var value = params.resource
    var dhtKey = params.roothash
    var isRegistration = params.isRegistration
    var noTrigger = params.noTrigger
    // Cleanup null form values
    for (var p in value) {
      if (!value[p])
        delete value[p];
    }
    if (!value[TYPE])
      value[TYPE] = modelName;

    var model = this.getModel(modelName).value;
    var props = model.properties;
    var newLanguage
    var isNew = !value[ROOT_HASH]
    if (value[TYPE] === SETTINGS) {
      if (isNew) {
        if (SERVICE_PROVIDERS_BASE_URL_DEFAULTS.includes(value.url))
          isNew = false
        else {
          value[ROOT_HASH] = 1
          value[CUR_HASH] = 1
        }
      }
      if (!isNew  &&  (!value.urls  ||  (value.urls  &&  value.urls.indexOf(value.url) !== -1))) {
        this.trigger({action: 'addItem', resource: value, error: 'The "' + props.url.title + '" was already added'})
        return
      }
    }
    else
      value[CUR_HASH] = isNew ? dhtKey : value[ROOT_HASH]

    var batch = [];
    if (isNew) {
      var creator =  me
                  ?  me
                  :  isRegistration ? value : null;
      if (creator)
        value[constants.OWNER] = this.buildRef(creator)

      if (value[TYPE] === ADDITIONAL_INFO) {
        var verificationRequest = value.document;

        var vrId = utils.getId(verificationRequest);
        var vr = list[vrId].value;
        if (!vr.additionalInfo  ||  !vr.additionalInfo.length)
          vr.additionalInfo = [];
        vr.additionalInfo.push(this.buildRef(value))
        batch.push({type: 'put', key: vrId, value: vr});
      }
    }

    value.time = value.time || new Date().getTime();
    var isMessage = model.isInterface  ||  (model.interfaces  &&  model.interfaces.indexOf(MESSAGE) != -1)
    if (isMessage) {
      if (model.subClassOf === FORM) {
        if (!value.sharedWith)
          value.sharedWith = []
        value.sharedWith.push(this.createSharedWith(utils.getId(value.to), new Date().getTime()))
      }
      if (props['to']  &&  props['from']) {
        var to = list[utils.getId(value.to)].value;
        var from = list[utils.getId(value.from)].value;
        var dn = value.message || utils.getDisplayName(value, props);
        to.lastMessage = (from[ROOT_HASH] === me[ROOT_HASH]) ? 'You: ' + dn : dn;
        to.lastMessageTime = value.time;
        from.lastMessage = value.message;
        from.lastMessageTime = value.time;
        batch.push({type: 'put', key: to[TYPE] + '_' + to[ROOT_HASH], value: to});
        batch.push({type: 'put', key: from[TYPE] + '_' + from[ROOT_HASH], value: from});
      }
    }
    var iKey = modelName + '_' + value[ROOT_HASH];
    batch.push({type: 'put', key: iKey, value: value});

    var mid;

    var self = this;
    if (isRegistration) {
      this.registration(value)
      return
    }

    if (value[TYPE] === SETTINGS)
      return this.addSettings(value)
    db.batch(batch)
    .then(function() {
      return db.get(iKey)
    })
    .then(function(value) {
      list[iKey] = {key: iKey, value: value};
      if (mid)
        list[MY_IDENTITIES] = {key: MY_IDENTITIES, value: mid}
      else if (!isNew  &&  iKey === utils.getId(me)) {
        if (me.language || value.language) {
          if (value.language) {
            if (!me.language  ||  (utils.getId(me.language) !== utils.getId(value.language)))
              newLanguage = list[utils.getId(value.language)].value
          }
        }

        extend(true, me, value)
        self.setMe(me)
        if (newLanguage) {
          let lang = list[utils.getId(me.language)].value
          value.languageCode = lang.code
          db.put(iKey, value)

          me.language = lang
          me.languageCode = lang.code
          self.setMe(me)
          var urls = []
          if (SERVICE_PROVIDERS) {
            SERVICE_PROVIDERS.forEach((sp) => {
              if (urls.indexOf(sp.url) === -1)
                urls.push(sp.url)
            })
            return self.getInfo(urls)
          }
        }
      }
    })
    .then(function() {
      var  params = {action: newLanguage ? 'languageChange' : 'addItem', resource: value};
      // registration or profile editing
      if (!noTrigger) {
        self.trigger(params);
      }
      if (model.subClassOf === FORM) {
        let mlist = self.searchMessages({modelName: FORM})
        let olist = self.searchNotMessages({modelName: ORGANIZATION})
        self.trigger({action: 'list', modelName: ORGANIZATION, list: olist, forceUpdate: true})
      }
    })
    .catch(function(err) {
      if (!noTrigger) {
        self.trigger({action: 'addItem', error: err.message, resource: value})
      }
      err = err;
    });
  },
  registration(value) {
    var self = this
    isLoaded = true;
    me = value
    // meDriver = null
    var pKey = me[TYPE] + '_' + me[ROOT_HASH];
    var batch = [];
    var mid = {
      _t: MY_IDENTITIES_TYPE,
      currentIdentity: pKey,
      allIdentities: [{
        id: pKey,
        title: utils.getDisplayName(value, models[me[TYPE]].value.properties),
        privkeys: me.privkeys,
        publishedIdentity: publishedIdentity
      }]};
    delete me.privkeys

    batch.push({type: 'put', key: pKey, value: me});
    batch.push({type: 'put', key: MY_IDENTITIES, value: mid});///
    var identity = {}
    identity[ROOT_HASH] = me[ROOT_HASH]
    extend(true, identity, publishedIdentity)
    var iKey = IDENTITY + '_' + identity[ROOT_HASH]
    if (me.language) {
      me.language = list[utils.getId(me.language)].value
      me.languageCode = me.language.code
    }
    batch.push({type: 'put', key: iKey, value: identity});
    return db.batch(batch)
    .then(function() {
      delete me.privkeys
      var  params = {action: 'addItem', resource: value, me: value};
      self.setMe(me)
      return self.trigger(params);
    })
    .then(function(value) {
      list[iKey] = {key: iKey, value: identity};
      list[pKey] = {key: pKey, value: me};
      if (mid)
        list[MY_IDENTITIES] = {key: MY_IDENTITIES, value: mid};
      self.monitorTim()
      // return self.initIdentity(me)
    })
    .catch(function(err) {
      err = err;
    });
  },
  addSettings(value) {
    var v = value.url
    if (v.charAt(v.length - 1) === '/')
      v = v.substring(0, v.length - 1)
    var self = this
    var key = SETTINGS + '_1'
    var togo
    return this.getInfo([v])
    .then(function(json) {
      var settings = list[key]
      if (settings)
        list[key].value.urls.push(v)
      else {
        value.urls = SERVICE_PROVIDERS_BASE_URL_DEFAULTS.concat(v)
        list[key] = {
          key: key,
          value: value
        }
      }
    })
    .then(function() {
      // if (me)
      //   self.monitorTim()
      self.trigger({action: 'addItem', resource: value})
      db.put(key, list[key].value)
    })
    .catch((err) => {
      self.trigger({action: 'addItem', error: err.message, resource: value})
    })
  },
  forgetAndReset() {
    var orgs = this.searchNotMessages({modelName: ORGANIZATION})
    var togo = orgs.length
    var promises = []

    for (let org of orgs)
      promises.push(this.onForgetMe(org, true))

    return Q.all(promises)
    .then(function() {
      // debugger
      // wait for all ForgotYou messages or timeout before changing the server url
      var defer = Q.defer()
      setTimeout(() => {defer.reject('forget me request was timed out')}, 10000)
      meDriver.on('message', function (meta) {
        if (meta[TYPE] === FORGOT_YOU) {
          if (--togo === 0) {
            defer.resolve()
          }
        }
      })

      return defer.promise
   })
   .then(function() {
      // debugger
      return meDriver.destroy()
   })

  },
  getFingerprint(r) {
    var pubkeys = r.pubkeys
    if (!pubkeys) {
      // Choose any employee from the company to send the notification about the customer
      if (r[TYPE] === ORGANIZATION) {
        var secCodes = this.searchNotMessages({modelName: 'tradle.SecurityCode', to: r})
        var employees = this.searchNotMessages({modelName: PROFILE, prop: 'organization', to: r})

        if (employees) {
          // RABOBANK case
          if (secCodes) {
            var codes = [];
            secCodes.forEach(function(sc) {
              codes.push(sc.code)
            })

            for (var i=0; i<employees.length  &&  !pubkeys; i++) {
              if (employees[i].securityCode  && codes.indexOf(employees[i].securityCode) != -1) {
                pubkeys = list[IDENTITY + '_' + employees[i][ROOT_HASH]].pubkeys
              }
            }
          }
          // LLOYDS case
          else
            pubkeys = list[IDENTITY + '_' + employees[0][ROOT_HASH]].pubkeys
        }
      }
    }
    if (pubkeys) {
      for (var i=0; i<pubkeys.length; i++) {
        var key = pubkeys[i]
        if (key.purpose === 'sign'  &&  key.type === 'ec')
          return key.fingerprint
      }
    }
  },
  getDriver(me) {
    if (driverPromise) return driverPromise

    var allMyIdentities = list[MY_IDENTITIES]
    var currentIdentity

    var mePub = me[ROOT_HASH] ? list[IDENTITY + '_' + me[ROOT_HASH]]['pubkey'] : me['pubkeys']
    var mePriv
    if (allMyIdentities) {
      var all = allMyIdentities.value.allIdentities
      var curId = allMyIdentities.value.currentIdentity
      all.forEach(function(id) {
        if (id.id === curId) {
          currentIdentity = id
          mePriv = id.privkeys
          publishedIdentity = id.publishedIdentity
          mePub = publishedIdentity.pubkeys
        }
      })
    }
    if (!mePub  &&  !mePriv) {
      if (__DEV__  &&  !me.securityCode) {
        var profiles = {}
        var identities = {}
        myIdentity.forEach(function(r) {
          if (r[TYPE] == IDENTITY)
            identities[r[ROOT_HASH]] = r
          else
            profiles[r[ROOT_HASH]] = r
        })
        for (var hash in profiles) {
          if (!profiles[hash].securityCode  &&  me.firstName === profiles[hash].firstName) {
            var identity = identities[hash]
            mePub = identity.pubkeys  // hardcoded on device
            mePriv = identity.privkeys
            me[NONCE] = identity[NONCE]
            break
          }
        }
      }
      if (!mePub) {
        var keys = defaultKeySet({
          networkName: 'testnet'
        })

        // bringing it back!
        // if (__DEV__  &&  !keys.some((k) => k.type() === 'dsa')) {
        // if (!keys.some((k) => k.type() === 'dsa')) {
        //   keys.push(Keys.DSA.gen({
        //     purpose: 'sign'
        //   }))
        // }

        mePub = []
        mePriv = []
        keys.forEach(function(key) {
          mePriv.push(key.exportPrivate())
          mePub.push(key.exportPublic())
        })
      }
      me['privkeys'] = mePriv
      me[NONCE] = me[NONCE] || this.getNonce()
    }

    if (!publishedIdentity)
      publishedIdentity = this.makePublishingIdentity(me, mePub)
    if (me.language)
      language = list[utils.getId(me.language)].value
    return driverPromise = this.buildDriver(Identity.fromJSON(publishedIdentity), mePriv, PORT)
  },

  makePublishingIdentity(me, pubkeys) {
    var meIdentity = new Identity()
                        .name({
                          firstName: me.firstName,
                          formatted: me.firstName + (me.lastName ? ' ' + me.lastName : '')
                        })
                        .set('_z', me[NONCE] || this.getNonce())
    if (me.organization) {
      var org = this.buildRef(me.organization)
      meIdentity.set('organization', org)
    }

    pubkeys.forEach(meIdentity.addKey, meIdentity)
    return meIdentity.toJSON()
  },
  publishMyIdentity(orgRep) {
    var self = this
    var msg = {
      _t: constants.TYPES.IDENTITY_PUBLISHING_REQUEST,
      _z: self.getNonce(),
      identity: publishedIdentity
    }
    var key = IDENTITY + '_' + orgRep[ROOT_HASH]

    return utils.sendSigned(meDriver, {
      msg: msg,
      to: [{fingerprint: self.getFingerprint(list[key].value)}],
      deliver: true,
      public: true
    })
    .catch(function(err) {
      debugger
    })
  },
  loadAddressBook() {
    return

    var self = this;
    return Q.ninvoke(AddressBook, 'checkPermission')
    .then(function(permission) {
      // AddressBook.PERMISSION_AUTHORIZED || AddressBook.PERMISSION_UNDEFINED || AddressBook.PERMISSION_DENIED
      if(permission === AddressBook.PERMISSION_UNDEFINED)
        return Q.ninvoke(AddressBook, 'requestPermission')
               .then(function(permission) {
                 if (permission === AddressBook.PERMISSION_AUTHORIZED)
                   return self.storeContacts.bind(self);
               });
      else if (permission === AddressBook.PERMISSION_AUTHORIZED)
        return self.storeContacts()
      else if (permission === AddressBook.PERMISSION_DENIED) {
        //handle permission denied
        return
      }
    })
  },
  storeContacts() {
    var dfd = Q.defer();
    var self = this;
    var batch = [];
    var props = models[PROFILE].value.properties;
    AddressBook.getContacts(function(err, contacts) {
      contacts.forEach(function(contact) {
        var contactInfo = [];
        var newIdentity = {
          firstName: contact.firstName,
          lastName: contact.lastName,
          // formatted: contact.firstName + ' ' + contact.lastName,
          contactInfo: contactInfo
        };
        newIdentity[TYPE] = PROFILE;
        var me = list[MY_IDENTITIES];
        if (me)  {
          var currentIdentity = me.value.currentIdentity;
          newIdentity[constants.OWNER] = {
            id: currentIdentity,
            title: utils.getDisplayName(me, props)
          };
          if (me.organization) {
            var photos = list[utils.getId(me.organization.id)].value.photos;
            if (photos)
              me.organization.photo = photos[0].url;
          }
        }

        if (contact.thumbnailPath  &&  contact.thumbnailPath.length)
          newIdentity.photos = [{type: 'address book', url: contact.thumbnailPath}];
        var phoneNumbers = contact.phoneNumbers;
        if (phoneNumbers) {
          phoneNumbers.forEach(function(phone) {
            contactInfo.push({identifier: phone.number, type: phone.label + ' phone'})
          })
        }
        var emailAddresses = contact.emailAddresses;
        if (emailAddresses)
          emailAddresses.forEach(function(email) {
            contactInfo.push({identifier: email.email, type: email.label + ' email'})
          });
        newIdentity[ROOT_HASH] = sha(newIdentity);
        newIdentity[CUR_HASH] = newIdentity[ROOT_HASH];
        var key = PROFILE + '_' + newIdentity[ROOT_HASH];
        if (!list[key])
          batch.push({type: 'put', key: key, value: newIdentity});
      });
      if (batch.length)
        // identityDb.batch(batch, function(err, value) {
        db.batch(batch, function(err, value) {
          if (err)
            dfd.reject(err);
          else {
            self.loadMyResources()
            .then(function() {
              dfd.resolve();
            })
          }
        });
      else
        dfd.resolve();
    })
    return dfd.promise;
  },
  monitorTim() {
    var self = this
    // meDriver.ready()
    // .then(function() {
    //   console.log(meDriver.name(), 'is ready')
      // d.publishMyIdentity()

      // meDriver.identities().createReadStream()
      // .on('data', function (data) {
      //   console.log(data)
      // })
      //   var key = PROFILE + '_' + data.key
      //   var v;
      //   if (me  &&  data.key == me[ROOT_HASH])
      //     v = me
      //   else {
      //     if (list[key])
      //       v = list[key].value
      //     else
      //       v = {}
      //   }
      //   var val = data.value.identity
      //   val[ROOT_HASH] = data.value[ROOT_HASH]
      //   val[CUR_HASH] = data.value[CUR_HASH]

      //   var name = val.name;
      //   delete val.name
      //   for (var p in name)
      //     val[p] = name[p]

      //   extend(v, val)

      //   db.put(key, v)
      //   .then(function() {
      //     list[key] = {
      //       key: key,
      //       value: v
      //     }
      //     if (v.securityCode)
      //       employees[data.value.securityCode] = data.value
      //   })
      // })

      // var ellens = 0
      // meDriver.messages().createValueStream()
      // .on('data', function (data) {
      //   meDriver.lookupObject(data)
      //   .then(function (obj) {
      //     // return
      //     console.log('from msgs.db', obj)
      //     // self.putInDb(obj)
      //     // console.log('msg', obj)
      //   })
      // })

      // Object was successfully read off chain
      meDriver.on('unchained', function (obj) {
        // console.log('unchained', obj)
        meDriver.lookupObject(obj)
        .then(function(obj) {
          // return
          return self.putInDb(obj)
        })
        .catch(function (err) {
          debugger
        })
      })
      meDriver.on('unchained-self', function (info) {
        console.log('unchained self!')
        // meDriver.lookupObject(info)
        // .then(function(obj) {
        //   // return
          return self.updateMe()
        // })
        // .catch(function (err) {
        //   debugger
        // })
      })
      meDriver.on('lowbalance', function () {
        // debugger
        console.log('lowbalance')
      })
      // Object was successfully put on chain but not yet confirmed
      meDriver.on('chained', function (obj) {
        // debugger
        // console.log('chained', obj)
        meDriver.lookupObject(obj)
        .then(function(obj) {
          obj = obj
          // return putInDb(obj)
        })
      })

      meDriver.on('error', function (err) {
        debugger
        console.log(err)
      })

      meDriver.on('sent', function (msg) {
        meDriver.lookupObject(msg)
        .then(function(obj) {
          // return
          var model = self.getModel(obj[TYPE]).value
          if (model.subClassOf === FORM) {
            var r = list[obj[TYPE] + '_' + obj[ROOT_HASH]]
            if (r)
              self.trigger({action: 'updateItem', sendStatus: 'Sent', resource: r.value})
            // var o = {}
            // extend(o, obj)
            // var from = o.from
            // o.from = o.to
            // o.to = from
            // o.txId = Math.random() + '';
            // setTimeout(() => {
            //   self.putInDb(o)
            // }, 5000);
          }
        })
        .catch(function (err) {
          debugger
        })
      })

      meDriver.on('message', function (msg) {
        // debugger
        // console.log(msg)
        meDriver.lookupObject(msg)
        .then(function(obj) {
          // return
          return self.putInDb(obj, true)
        })
        .catch(function (err) {
          debugger
        })
      })
    // })
    // return meDriver.ready()
  },
  updateMe() {
    db.put(me[TYPE] + '_' + me[ROOT_HASH], me)
  },

  putInDb(obj, onMessage) {
    // defensive copy
    var val = extend(true, obj.parsed.data)
    if (!val)
      return


    val[ROOT_HASH] = val[ROOT_HASH]  ||  obj[ROOT_HASH]
    val[CUR_HASH] = obj[CUR_HASH]
    if (!val.time)
      val.time = obj.timestamp

    var type = val[TYPE]
    var isConfirmation
    var model = this.getModel(type)  &&  this.getModel(type).value
    if (!model) {
      if (val.message  &&  val.message.indexOf('Congratulations! You were approved for: ') != -1) {
        isMessage = true
        type = SIMPLE_MESSAGE
        val[TYPE] = type
        model = models[SIMPLE_MESSAGE].value
        isConfirmation = true
      }
      else
        return;
    }
    if (obj.txId)
      val.txId = obj.txId
    val.permissionKey = obj.permissionKey
    var key = type + '_' + val[ROOT_HASH]
    var v = list[key] ? list[key].value : null
    var batch = []
    var representativeAddedTo
    var self = this
    // var isServiceMessage
    if (model.id === IDENTITY) {
      // if (!me  ||  obj[ROOT_HASH] !== me[ROOT_HASH]) {
      var profile = {}

      if (val.name) {
        for (var p in val.name) {
          profile[p] = val.name[p]
        }
        delete val.name
      }
      if (val.location) {
        for (var p in val.location)
          profile[p] = val.location[p]
        delete val.location
      }
      extend(true, profile, val)
      profile[TYPE] = PROFILE
      delete profile.pubkeys
      delete profile.v
      var profileKey = PROFILE + '_' + profile[ROOT_HASH]
      v = list[key] ? list[profileKey].value : null
      if (!v  &&  me  &&  val[ROOT_HASH] === me[ROOT_HASH])
        v = me
      if (v)  {
        var vv = {}
        extend(vv, v)
        extend(vv, profile)
        profile = vv
      }
      var org
      if (val.organization) {
        // if (val.organization.title === 'Rabobank'  &&  val.securityCode)
        //   return
        org = list[utils.getId(val.organization)]  &&  list[utils.getId(val.organization)].value
        if (org) {
          profile.organization = val.organization
          delete val.organization
        }
      }
      batch.push({type: 'put', key: profileKey, value: profile})
      list[profileKey] = {
        key: profileKey,
        value: profile
      }

      batch.push({type: 'put', key: key, value: val})
      if (org) {
        var doAdd
        if (!org.contacts)
          doAdd = true
        else {
          var i = 0
          for (; i<org.contacts.length; i++) {
            if (org.contacts[i][ROOT_HASH] === key)
              break
          }
          doAdd = i !== org.contacts.length
        }
        if (doAdd)  {
          var representative = {
            id: key,
            title: val.formatted || val.firstName
          }
          var oo = {}
          extend(oo, org)
          if (!oo.contacts)
            oo.contacts = []
          oo.contacts.push(representative)
          var orgKey = org[TYPE] + '_' + org[ROOT_HASH];
          list[orgKey] = {
            key: orgKey,
            value: oo
          }
          batch.push({type: 'put', key: orgKey, value: oo})
          representativeAddedTo = org[ROOT_HASH]
        }
      }
      // }
    }
    else {
      var isMessage = model.interfaces  &&  model.interfaces.indexOf(MESSAGE) != -1
      if (isMessage) {
        var fromR = list[PROFILE + '_' + obj.from[ROOT_HASH]]
        if (!fromR)
          return
        var from = fromR.value
        if (me  &&  from[ROOT_HASH] === me[ROOT_HASH])
          return

        var fOrg = from.organization
        var org = fOrg ? list[utils.getId(fOrg)].value : null
        if (onMessage  &&  val[TYPE] === FORGOT_YOU) {
          this.forgotYou(org)
          return
        }
        var isProductList = val[TYPE] === PRODUCT_LIST
        if (isProductList) {
          var pList = JSON.parse(val.list)
          // var fOrg = obj.from.identity.toJSON().organization
          // org = list[utils.getId(fOrg)].value
          org.products = []
          pList.forEach(function(m) {
            self.addNameAndTitleProps(m)
            models[m.id] = {
              key: m.id,
              value: m
            }
            if (m.subClassOf === FINANCIAL_PRODUCT)
              org.products.push(m.id)
            else if (m.subClassOf == FORM  &&  !m.verifications) {
              m.properties.verifications = {
                type: 'array',
                readOnly: true,
                title: 'Verifications',
                name: 'verifications',
                items: {
                  backlink: 'document',
                  ref: VERIFICATION
                }
              }
            }
            if (!m[ROOT_HASH])
              m[ROOT_HASH] = sha(m)
            batch.push({type: 'put', key: m.id, value: m})
          })
          list[utils.getId(org)].value = org
          batch.push({type: 'put', key: utils.getId(org), value: org})
        }
        var to = list[PROFILE + '_' + obj.to[ROOT_HASH]].value
        if (onMessage) {
          let profileModel = utils.getModel(PROFILE).value
          val.from = {
            id: utils.getId(from),
            title: from.formatted || from.firstName
          }
          val.to = {
            id: utils.getId(to),
            title: to.formatted || to.firstName
          }

          // self.fillFromAndTo(obj, val)
        }
        else {
          let inDB = list[key].value
          val.from = inDB.from
          val.to = inDB.to
        }
        if (!val.time)
          val.time = obj.timestamp

        var isVerification = type === VERIFICATION  ||  model.subClassOf === VERIFICATION;
        if (isVerification) {
          this.onAddVerification(val, false, true)
          // if (!val.txId) {
          //   var o = {}
          //   extend(o, obj)
          //   o.txId = Math.random() + '';
          //   setTimeout(() => {
          //     self.putInDb(o)
          //   }, 5000);
          // }
          return
        }
        if (!isProductList) {
          var dn = val.message || utils.getDisplayName(val, model.properties);
          to.lastMessage = (obj.from[ROOT_HASH] === me[ROOT_HASH]) ? 'You: ' + dn : dn;
          to.lastMessageTime = val.time;
          from.lastMessage = val.message;
          from.lastMessageTime = val.time;
          batch.push({type: 'put', key: to[TYPE] + '_' + obj.to[ROOT_HASH], value: to});
          batch.push({type: 'put', key: from[TYPE] + '_' + obj.from[ROOT_HASH], value: from});
          batch.push({type: 'put', key: key, value: val})
        }
        else {
          if (!from.lastMessageTime || (new Date() - from.lastMessageTime) > WELCOME_INTERVAL)
            batch.push({type: 'put', key: key, value: val})
        }

      }
    }
    // if (batch.length)
    var self = this
    // return db.batch(batch)
    // .then(function() {
    if (model.subClassOf === MY_PRODUCT)
      val.sharedWith = [self.createSharedWith(utils.getId(val.from.id), new Date().getTime())]

    list[key] = {
      key: key,
      value: val
    }

    var retParams = {
      action: isMessage ? 'messageList' : 'list',
    }
    var resultList
    if (isMessage) {
      var toId = PROFILE + '_' + obj.to[ROOT_HASH]
      var meId = PROFILE + '_' + me[ROOT_HASH]
      var id = toId === meId ? PROFILE + '_' + obj.from[ROOT_HASH] : toId
      var to = list[id].value
      if (to.organization) {
        var org =  list[utils.getId(to.organization)].value
        resultList = self.searchMessages({to: org, modelName: MESSAGE})
      }
      else
        resultList = self.searchMessages({to: to, modelName: MESSAGE})
      var shareableResources = this.getShareableResources(resultList, to);
      if (shareableResources)
        retParams.shareableResources = shareableResources

      retParams.resource = to
    }
      // resultList = searchMessages({to: list[obj.to.identity.toJSON()[TYPE] + '_' + obj.to[ROOT_HASH]], modelName: MESSAGE})
    else if (!onMessage  &&  val[TYPE] != PROFILE)
      resultList = self.searchNotMessages({modelName: val[TYPE]})
    retParams.list = resultList

    return db.batch(batch)
    .then(function() {
      if (isConfirmation) {
        var from = list[PROFILE + '_' + obj.from[ROOT_HASH]].value

        var fOrg = from.organization
        var org = fOrg ? list[utils.getId(fOrg)].value : null
        if (onMessage  &&  val[TYPE] === FORGOT_YOU) {
          this.forgotYou(org)
          return
        }
        var msg = {
          message: me.firstName + ' is waiting for the response',
          _t: constants.TYPES.CUSTOMER_WAITING,
          from: me,
          to: org,
          time: new Date().getTime()
        }
        self.onAddMessage(msg, true)
      }
      else if (representativeAddedTo) {
        var orgList = self.searchNotMessages({modelName: ORGANIZATION})
        self.trigger({action: 'list', list: orgList, forceUpdate: true})
      }
      else
        self.trigger(retParams)
    })
  },
  fillFromAndTo(obj, val) {
    var whoAmI = obj.parsed.data._i.split(':')[0]
    var from = list[PROFILE + '_' + obj.from[ROOT_HASH]].value
    var to = list[PROFILE + '_' + obj.to[ROOT_HASH]].value

    if (whoAmI !== from[ROOT_HASH]) {
      // swap from and to
      [from, to] = [to, from]
    }

    val.to = {
      id: to[TYPE] + '_' + to[ROOT_HASH],
      title: to.formatted || to.firstName
    }

    val.from = {
      id: from[TYPE] + '_' + from[ROOT_HASH],
      title: from.formatted || from.firstName
    }
  },
  addNameAndTitleProps(m, aprops) {
    var mprops = aprops  ||  m.properties
    for (var p in mprops) {
      if (p.charAt(0) === '_')
        continue
      if (!mprops[p].name)
        mprops[p].name = p
      if (!mprops[p].title)
        mprops[p].title = utils.makeLabel(p)
      if (mprops[p].type === 'array') {
        var aprops = mprops[p].items.properties
        if (aprops)
          this.addNameAndTitleProps(m, aprops)
      }
    }
  },
  loadMyResources() {
    var myId = sampleData.getMyId();
    if (myId)
      myId = PROFILE + '_' + myId;
    var self = this;

    // console.time('dbStream')
    var orgContacts = {}
    return utils.readDB(db)
    .then((results) => {
      if (!results.length)
        return self.loadModels();

      results.forEach((data) => {
        if (data.value == null) return

        if (data.value.type === MODEL) {
          models[data.key] = data;
          self.setPropertyNames(data.value.properties);
        }
        else {
          isLoaded = true
          if (!myId  &&  data.key === MY_IDENTITIES) {
            myId = data.value.currentIdentity;
            if (list[myId])
              me = list[myId].value;
          }
          if (!me  &&  myId  && data.key == myId)
            me = data.value;
          if (data.value[TYPE] === PROFILE) {
            if (data.value.securityCode)
              employees[data.value.securityCode] = data.value
            if (data.value.organization) {
              if (!orgContacts[utils.getId(data.value.organization)])
                orgContacts[utils.getId(data.value.organization)] = []
              var c = orgContacts[utils.getId(data.value.organization)]
              c.push(self.buildRef(data.value))
            }
          }
          list[data.key] = data;
        }
      })
      var sameContactList = {}
      for (var p in orgContacts) {
        if (!list[p])
          continue
        var org = list[p].value
        if (!org.contacts  ||  org.contacts.length !== orgContacts[p].length) {
          org.contacts = orgContacts[p]
          continue
        }
        var newContact
        orgContacts[p].forEach(function(c) {
          var i = 0
          for (; i<org.contacts.length; i++) {
            var id = utils.getId(org.contacts[i])
            if (c[constants.TYPE] + '_' + c[constants.ROOT_HASH] === id)
              break
          }
          if (i !== org.contacts.length)
            newContact = true
        })
        if (newContact)
          org.contacts = orgContacts[p]
        else
          sameContactList[p] = p
      }
      if (!utils.isEmpty(list)) {
        sampleData.getResources().forEach(function(r) {
          if (!r[ROOT_HASH])
            r[ROOT_HASH] = sha(r)

          r[CUR_HASH] = r[ROOT_HASH]
          let id = utils.getId(r)
          if (!list[id])
            list[id] = {
              key: id,
              value: r
            }
        })
      }

      for (var s in sameContactList)
        delete orgContacts[s]
      if (!utils.isEmpty(orgContacts)) {
        var results = this.searchNotMessages({modelName: constants.TYPES.ORGANIZATION})
        self.trigger({action: 'list', list: results})
      }

      console.log('Stream ended');
      // console.timeEnd('dbStream')
      // if (me)
      //   utils.setMe(me);
      var noModels = self.isEmpty(models);
      if (noModels)
        return self.loadModels();
      // if (noModels || Object.keys(list).length == 2)
      //   if (me)
      //     return self.loadDB();
      //   else {
      //     isLoaded = false;
      //     if (noModels)
      //       return self.loadModels();
      //   }
      // // else
      // //   return self.loadAddressBook();

      if (me  &&  me.organization) {
        if (me.securityCode) {
          var org = list[utils.getId(me.organization)].value
          var secCodes = self.searchNotMessages({modelName: 'tradle.SecurityCode', to: org})
          if (!org.securityCodes  ||  org.securityCodes[!me.securityCode]) {
            self.trigger({err: 'The code was not registered with ' + me.organization.title})
            return;
          }
        }
        var photos = list[utils.getId(me.organization.id)].value.photos;
        if (photos)
          me.organization.photo = photos[0].url;
      }
      if (me  &&  (!list[me[TYPE] + '_' + me[ROOT_HASH]] || !list[IDENTITY + '_' + me[ROOT_HASH]]))
        me = null
      console.log('Stream closed');
      utils.setModels(models);
    })
    .catch(err => {
      debugger
      console.error('err:' + err);
    })
  },

  forgotYou(resource) {
    var orgId = utils.getId(resource)
    var msg = {
      _t: FORGOT_YOU,
      _z: this.getNonce(),
      message: 'You\'ve been successfully forgotten',
      from: this.buildRef(resource),
      to: this.buildRef(me)
    }
    msg.id = sha(msg)
    this.trigger({action: 'messageList', list: [msg], resource: resource})

    var reps = this.getRepresentatives(utils.getId(resource))
    var promises = []
    reps.forEach((r) =>
      promises.push(meDriver.forget(r[ROOT_HASH]))
    )
    var batch = []
    var self = this
    return Q.allSettled(promises)
    .then(function(result) {
      result.forEach(function(data) {
        if (data.state !== 'fulfilled')
          return
        data.value.forEach(function(r) {
          delete r.id
          var rId = utils.getId(r)
          if (!list[rId])
            return
          var res = list[rId].value
          var isVerification = r[TYPE] === VERIFICATION
          var model = utils.getModel(r[TYPE])
          var isForm = !isVerification  &&  model.subClassOf === FORM
          if (!r.deleted) {
            var fromId = utils.getId(res.from)
            var toId = utils.getId(res.to)
            var sharedWith = res.sharedWith
            var sharedWithKeys = sharedWith.map(function(r) {
              return r.bankRepresentative
            })
            reps.forEach(function(r) {
              var rId = utils.getId(r)
              var idx = sharedWithKeys.indexOf(rId)
              if (idx !== -1)
                sharedWith.splice(idx, 1)
            })
            utils.optimizeResource(res)
            batch.push({type: 'put', key: rId, value: res})
          }
          if (isVerification) {
            // var myVerifications = me.myVerifications.filter(function(r) {
            //   var verification = list[utils.getId(r)]
            //   if (!verification)
            //     return false
            //   verification = verification.value
            //   return utils.getId(verification) === rId ? false : true
            // })
            // if (myVerifications.length != me.myVerifications.length) {
            //   me.myVerifications = myVerifications
            //   batch.push({type: 'put', key: utils.getId(me), value: me})
            // }
            // Cleanup form from the deleted verification
            if (r.deleted) {
              var docPair = list[utils.getId(res.document)]
              if (docPair) {
                var doc = list[utils.getId(res.document)].value
                if (doc.verifications) {
                  var verifications = doc.verifications.filter(function(r) {
                    return (utils.getId(r) === rId) ? false : true
                  })
                  if (doc.verifications.length != verifications.length) {
                    doc.verifications = verifications
                    utils.optimizeResource(doc)
                    for (var i=0; i<data.length; i++) {
                      if (data[i][ROOT_HASH] === doc[ROOT_HASH]  &&  !data[i].deleted)
                        batch.push({type: 'put', key: utils.getId(doc), value: doc})
                    }
                  }
                }
              }
            }
          }
          if (r.deleted) {
            delete list[rId]
            batch.push({type: 'del', key: rId})
          }
        })
      })
      return db.batch(batch)
    })
    .then(function() {
      var result = self.searchMessages({to: resource, modelName: MESSAGE, isForgetting: true});
      batch = []
      result.forEach(function(r) {
        if (r[TYPE] === SIMPLE_MESSAGE  &&  r.message  &&  r.message.indexOf('Congratulations') === 0) {
          var id = utils.getId(r)
          batch.push({type: 'del', key: id})
          delete list[id]
        }
      })
      self.trigger({action: 'list', list: self.searchNotMessages({modelName: ORGANIZATION, to: resource})})
      // resource.numberOfForms = 0

      reps.forEach((r) => {
        r.lastMessageTime = null
        r.lastMessage = null
        delete publishRequestSent[utils.getId(r.organization)]
      })
      if (batch.length)
        return db.batch(batch)
    })
    .catch(function(err) {
      debugger
    })
  },

  cleanup(result) {
    if (!result.length)
      return Q()

    var batch = []
    var docs = []
    result.forEach(function(r){
      batch.push({type: 'del', key: r[TYPE] + '_' + r[ROOT_HASH], value: r})
    })
    var self = this
    return db.batch(batch)
    .then(function() {
      result.forEach(function(r) {
        delete list[r[TYPE] + '_' + r[ROOT_HASH]]
      })
    })
    .catch(function(err) {
      err = err
    })
  },
  onTalkToRepresentative(resource, org) {
    var orgRep = resource[TYPE] === ORGANIZATION
               ? this.getRepresentative(resource[TYPE] + '_' + resource[ROOT_HASH])
               : resource
    var self = this
    if (!orgRep) {
      var msg = {
        _t: SIMPLE_MESSAGE,
        _z: this.getNonce(),
        message: 'All representatives are currently assisting other customers. Please try again later'
      }
      msgFrom.from = this.buildRef(resource)
      msgFrom.to = this.buildRef(me)
      msg.id = sha(msg)
      result.push(msg)
      self.trigger({action: 'messageList', list: result, resource: resource})
      return
    }
    var result = self.searchMessages({to: resource, modelName: MESSAGE});
    var msg = {
      _t: SIMPLE_MESSAGE,
      _z: this.getNonce(),
      message: 'Representative will be with you shortly. Please tell us how can we help you today?'
    }
    msgFrom.from = this.buildRef(resource)
    msgFrom.to = this.buildRef(me)
    msg.id = sha(msg)
    result.push(msg)
    self.trigger({action: 'messageList', list: result, resource: resource})
    var key = IDENTITY + '_' + orgRep[ROOT_HASH]

    return utils.sendSigned(meDriver, {
      msg: msg,
      to: [{fingerprint: self.getFingerprint(list[key].value)}],
      deliver: true
    })
  },
  onForgetMe(resource, noTrigger) {
    var me = utils.getMe()
    var msg = {
      _t: constants.TYPES.FORGET_ME,
      _z: this.getNonce()
    }
    var orgRep = resource[TYPE] === ORGANIZATION
               ? this.getRepresentative(resource[TYPE] + '_' + resource[ROOT_HASH])
               : resource
    var self = this
    var key = IDENTITY + '_' + orgRep[ROOT_HASH]
    return utils.sendSigned(meDriver, {
      msg: msg,
      to: [{fingerprint: self.getFingerprint(list[key].value)}],
      deliver: true
    })
    .then(() => {
      if (noTrigger)
        return
      var result = self.searchMessages({to: resource, modelName: MESSAGE});
      msg.message = translate('inProgress')
      msg.from = self.buildRef(resource)
      msg.to = self.buildRef(me)
      // msg.from = {
      //   id: resource[TYPE] + '_' + resource[ROOT_HASH],
      //   title: utils.getDisplayName(resource)
      // }
      // msg.to = {
      //   id: me[TYPE] + '_' + me[ROOT_HASH],
      //   title: me.firstName
      // }
      msg.id = sha(msg)
      result.push(msg)
      self.trigger({action: 'messageList', list: result, resource: resource})
    })
    .catch(function (err) {
      debugger
    })
  },

  isEmpty(obj) {
    for(var prop in obj) {
      if(obj.hasOwnProperty(prop))
        return false;
    }
    return true;
  },

  getModel(modelName) {
    return models[modelName];
  },
  loadDB(loadTest) {
    loadTest = true;
    // var lt = !Device.isIphone();
    // var batch = [];

    if (loadTest) {
      if (utils.isEmpty(models)) {
        voc.forEach(function(m) {
          if (!m[ROOT_HASH])
            m[ROOT_HASH] = sha(m);
          let key = utils.getId(m)
          models[key] = {
            key: key,
            value: m
          }
          // batch.push({type: 'put', key: m.id, value: m});
        });
      }
      sampleData.getResources().forEach(function(r) {
        if (!r[ROOT_HASH])
          r[ROOT_HASH] = sha(r);

        r[CUR_HASH] = r[ROOT_HASH];
        var key = r[TYPE] + '_' + r[ROOT_HASH];
        list[key] = {
          key: key,
          value: r
        }
        // batch.push({type: 'put', key: key, value: r});
      });
      var self = this;
      return self.loadMyResources()
            // .then(self.loadAddressBook)
            .catch(function(err) {
              err = err;
              });
      // return db.batch(batch)
      //       .then(self.loadMyResources)
      //       // .then(self.loadAddressBook)
      //       .catch(function(err) {
      //         err = err;
      //         });
    }
    // else {
    //   return this.loadAddressBook()
    //         .catch(function(err) {
    //           err = err;
    //           });
    // }
  },
  loadModels() {
    var batch = [];
    var self = this
    voc.forEach(function(m) {
      if (!m[ROOT_HASH]) {
        m[ROOT_HASH] = sha(m);
        self.addNameAndTitleProps(m)
      }

      batch.push({type: 'put', key: m.id, value: m});
    });
    var self = this;
    return db.batch(batch)
          .then(function() {
            return self.loadMyResources();
          })
          .catch(function(err) {
            err = err;
          });
  },
  clearDb() {
    var self = this;
    return db.createReadStream()
    .on('data', function(data) {
       db.del(data.key, function(err) {
         err = err;
       })
    })
    .on('error', function (err) {
      console.log('Oh my!', err.name + ': ' + err.message)
    })
    .on('close', function (err) {
      console.log('Stream closed');
    })
    .on('end', function () {
      console.log('Stream end');
    })
  },

  onStartTransition() {
    if (meDriver) meDriver.pause(2000)
  },
  onEndTransition() {
    if (meDriver) meDriver.resume()

    if (this._transitionCallbacks) {
      // defensive copy
      var cbs = this._transitionCallbacks.slice()
      this._transitionCallbacks.length = 0
      cbs.forEach((fn) => fn())
    }
  },
  waitForTransitionToEnd(fn) {
    if (!this._transitionCallbacks) {
      this._transitionCallbacks = []
    }

    var defer = Q.defer()
    this._transitionCallbacks.push(defer.resolve)
    return defer.promise
  },
  buildRef(resource) {
    let ref = {
      id: utils.getId(resource) + (resource[CUR_HASH] ? '_' + resource[CUR_HASH] : ''),
      title: resource.id ? resource.title : utils.getDisplayName(resource, this.getModel(resource[TYPE]).value.properties)
    }
    if (resource.time)
      ref.time = resource.time
    return ref
  },
})
// );

module.exports = Store;

function timeSomething (name) {
  var start = Date.now()
  return (print) => {
    var ms = Date.now() - start
    if (print) {
      console.log(`TIMER: ${name} took ${ms}ms`)
    }

    return ms
  }
}

function timeFunctions (obj) {
  if (!__DEV__) return obj

  var timed = {}
  Object.keys(obj).forEach((k) => {
    var orig = obj[k]
    if (typeof orig !== 'function') {
      timed[k] = orig
      return
    }

    var total = 0
    var numCalls = 0
    timed[k] = function () {
      var stopTimer = timeSomething(k)
      var ret = orig.apply(this, arguments)
      if (!Q.isPromiseAlike(ret)) {
        recordDuration()
        return ret
      }

      return ret
        .catch(err => {
          recordDuration()
          throw err
        })
        .then(val => {
          recordDuration()
          return val
        })

      function recordDuration () {
        var ms = stopTimer()
        total += ms
        numCalls++
        timerDebug(`${k} took ${ms}ms. ${numCalls} calls totaled ${total}ms`)
      }
    }
  })

  return timed
}
