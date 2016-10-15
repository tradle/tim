'use strict';

var path = require('path')
var querystring = require('querystring')
var parseURL = require('url').parse
import ReactNative, {
  Alert,
  NetInfo,
  Platform,
  AppState
} from 'react-native'

import AsyncStorage from './Storage'
import * as LocalAuth from '../utils/localAuth'
import Push from '../utils/push'

var path = require('path')
// var BeSafe = require('asyncstorage-backup')
var Reflux = require('reflux');
var Actions = require('../Actions/Actions');
var extend = require('extend');
var Debug = require('debug')
var deepEqual = require('deep-equal')

const SENT = 'Sent'
const SENDING = 'Sending'
const QUEUED = 'Queued'

var debug = Debug('Store')
var employee = require('../people/employee.json')

var Q = require('q');
Q.longStackSupport = __DEV__
Q.onerror = function (err) {
  console.error(err)
  throw err
}

var ENV = Platform.OS !== 'ios' ? require('../environment.json') : require('react-native-env')
// var AddressBook = require('NativeModules').AddressBook;

var voc = require('@tradle/models');
var sampleData = voc.data
var currencies = voc.currencies
var nationalities = voc.nationalities
var countries = voc.countries

// var myIdentity = __DEV__ ? require('../data/myIdentity.json') : []
var welcome = require('../data/welcome.json');

var sha = require('stable-sha1');
var utils = require('../utils/utils');
var Keychain = !utils.isWeb() && require('../utils/keychain')
var translate = utils.translate
var promisify = require('q-level');
var leveldown = require('./leveldown')
var level = require('./level')
var mutexify = require('mutexify')

const collect = require('stream-collector')
const tradle = require('@tradle/engine')
const tradleUtils = tradle.utils
const protocol = tradle.protocol
const constants = require('@tradle/constants') // tradle.constants
const Cache = require('lru-cache')
const NONCE = constants.NONCE
const TYPE = constants.TYPE
const SIG = constants.SIG
const ROOT_HASH = constants.ROOT_HASH
const CUR_HASH  = constants.CUR_HASH
const PREV_HASH  = constants.PREV_HASH
const NEXT_HASH = '_n'
const LAST_MESSAGE_TIME = 'lastMessageTime'

const ORGANIZATION = constants.TYPES.ORGANIZATION
const IDENTITY = constants.TYPES.IDENTITY
const IDENTITY_PUBLISHING_REQUEST = constants.TYPES.IDENTITY_PUBLISHING_REQUEST
const MESSAGE = constants.TYPES.MESSAGE
const SIMPLE_MESSAGE = constants.TYPES.SIMPLE_MESSAGE
const FINANCIAL_PRODUCT = constants.TYPES.FINANCIAL_PRODUCT
const PRODUCT_LIST = constants.TYPES.PRODUCT_LIST
const PROFILE = constants.TYPES.PROFILE;
const ADDITIONAL_INFO = constants.TYPES.ADDITIONAL_INFO;
const VERIFICATION = constants.TYPES.VERIFICATION;
const FORM = constants.TYPES.FORM;
const MODEL = constants.TYPES.MODEL;
const CUSTOMER_WAITING  = constants.TYPES.CUSTOMER_WAITING
const SELF_INTRODUCTION = constants.TYPES.SELF_INTRODUCTION
const INTRODUCTION      = 'tradle.Introduction'
const FORGET_ME         = constants.TYPES.FORGET_ME
const FORGOT_YOU        = constants.TYPES.FORGOT_YOU

// const SHARED_RESOURCE     = 'tradle.SharedResource'
const MY_IDENTITIES_TYPE  = 'tradle.MyIdentities'
const PRODUCT_APPLICATION = 'tradle.ProductApplication'
const MY_PRODUCT          = 'tradle.MyProduct'
const ENUM                = 'tradle.Enum'
const GUEST_SESSION_PROOF = 'tradle.GuestSessionProof'
const FORM_ERROR          = 'tradle.FormError'
const EMPLOYEE_ONBOARDING = 'tradle.EmployeeOnboarding'
const MY_EMPLOYEE_PASS    = 'tradle.MyEmployeeOnboarding'
const FORM_REQUEST        = 'tradle.FormRequest'
const PAIRING_REQUEST     = 'tradle.PairingRequest'
const PAIRING_RESPONSE    = 'tradle.PairingResponse'
const PAIRING_DATA        = 'tradle.PairingData'
const COUNTRY           = 'tradle.Country'
const MY_IDENTITIES     = MY_IDENTITIES_TYPE + '_1'
const SETTINGS          = constants.TYPES.SETTINGS

const WELCOME_INTERVAL = 600000

// var Tim = require('tim')
// Tim.enableOptimizations()
// Tim.CATCH_UP_INTERVAL = 10000
// var Zlorp = Tim.Zlorp
// Zlorp.ANNOUNCE_INTERVAL = 10000
// Zlorp.LOOKUP_INTERVAL = 10000
// Zlorp.KEEP_ALIVE_INTERVAL = 10000

const Sendy = require('sendy')
const SendyWS = require('sendy-ws')
const TLSClient = require('sendy-axolotl')
// const DSA = require('@tradle/otr').DSA
// const BigInt = require('@tradle/otr/vendor/bigint')
// const BigIntTimes = {}
// Object.keys(BigInt).forEach(function (method) {
//   const orig = BigInt[method]
//   BigIntTimes[method] = 0
//   BigInt[method] = function () {
//     var now = Date.now()
//     var result = orig.apply(this, arguments)
//     BigIntTimes[method] += Date.now() - now
//     return result
//   }
// })

const SENDY_OPTS = { resendInterval: 30000, mtu: 10000, autoConnect: true }
// const newOTRSwitchboard = require('sendy-otr-ws').Switchboard
const newSwitchboard = SendyWS.Switchboard
const WebSocketClient = SendyWS.Client
// const HttpClient = require('@tradle/transport-http').HttpClient
// var getDHTKey = require('tim/lib/utils').getDHTKey

// var dns = require('dns')
var map = require('map-stream')
var Blockchain = require('@tradle/cb-blockr') // use tradle/cb-blockr fork
// var defaultKeySet = midentity.defaultKeySet
var createKeeper = require('@tradle/keeper')
var cachifyKeeper = require('@tradle/keeper/cachify')
var crypto = require('crypto')
// var tutils = require('@tradle/utils')
var isTest, originalMe;
var currentEmployees = {}

// var tim;
var PORT = 51086
var TIM_PATH_PREFIX = 'me'
// If app restarts in less then 10 minutes keep it authenticated
const AUTHENTICATION_TIMEOUT = LocalAuth.TIMEOUT

var models = {};
var list = {};
var chatMessages = {}
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
// var publishedIdentity
var driverPromise
var ready;
var networkName = 'testnet'
var TOP_LEVEL_PROVIDERS = ENV.topLevelProviders || [ENV.topLevelProvider]
var COMMON_ENV = require('../utils/env')
var SERVICE_PROVIDERS_BASE_URL_DEFAULTS = __DEV__ ? ['http://' + COMMON_ENV.LOCAL_IP + ':44444'] : TOP_LEVEL_PROVIDERS.map(t => t.baseUrl)
var SERVICE_PROVIDERS_BASE_URLS
var HOSTED_BY = TOP_LEVEL_PROVIDERS.map(t => t.name)
// var ALL_SERVICE_PROVIDERS = require('../data/serviceProviders')
var SERVICE_PROVIDERS
var publishRequestSent = []

var driverInfo = {
  wsClients: {},
  // whitelist: [],
}

// const KEY_SET = [
//   { type: 'bitcoin', purpose: 'payment' },
//   { type: 'bitcoin', purpose: 'messaging' },
//   { type: 'ec', purpose: 'sign', curve: 'p256' },
//   { type: 'ec', purpose: 'update', curve: 'p256' }
// ]

const ENCRYPTION_KEY = 'accountkey'
const DEVICE_ID = 'deviceid'
// const ENCRYPTION_SALT = 'accountsalt'
const TLS_ENABLED = false
const PAUSE_ON_TRANSITION = true

// var Store = Reflux.createStore(timeFunctions({
var Store = Reflux.createStore({

  // this will set up listeners to all publishers in TodoActions, using onKeyname (or keyname) as callbacks
  listenables: [Actions],
  // this will be called by all listening components as they register their listeners
  init() {
    var self = this
    // Setup components:
    var ldb = level('TiM.db', { valueEncoding: 'json' });
    // ldb = levelQuery(level('TiM.db', { valueEncoding: 'json' }));
    // ldb.query.use(jsonqueryEngine());
    db = promisify(ldb);

    this._loadedResourcesDefer = Q.defer()
    if (NetInfo) {
      NetInfo.isConnected.addEventListener(
        'change',
        this._handleConnectivityChange.bind(this)
      );

      if (utils.isSimulator()) {
        // isConnected always returns false on simulator
        // https://github.com/facebook/react-native/issues/873
        this.isConnected = true
      } else {
        NetInfo.isConnected.fetch().then(isConnected => this.isConnected = isConnected)
      }
    }

    this.loadModels()

    voc.forEach(function(m) {
      models[m.id] = {
        key: m.id,
        value: m
      }
      self.addNameAndTitleProps(m)
      self.addVerificationsToFormModel(m)
    })
    utils.setModels(models);

    // if (true) {
    if (false) {
      return this.ready = this.wipe()
        .then(() => {
          Alert.alert('please refresh')
          return Q.Promise(function (resolve) {
            // hang
          })
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
      .then(() => {
        if (me && me.registeredForPushNotifications) {
          Push.resetBadgeNumber()
        }
      })
  },

  _handleConnectivityChange(isConnected) {
    this.isConnected = isConnected
    this.trigger({action: 'connectivity', isConnected: isConnected})
    // Alert.alert('Store: ' + isConnected)
  },

  getMe() {
    var self = this

    return db.get(MY_IDENTITIES)
    .then(function(value) {
      if (value) {
        var key = MY_IDENTITIES
        self._setItem(key, value)
        return db.get(value.currentIdentity.replace(PROFILE, IDENTITY))
      }
    })
    .then (function(value) {
      self._setItem(utils.getId(value), value)
      return db.get(utils.getId(value).replace(IDENTITY, PROFILE))
    })
    .then(function(value) {
      me = value
      if (me.isAuthenticated) {
        if (Date.now() - me.dateAuthenticated > AUTHENTICATION_TIMEOUT) {
          delete me.isAuthenticated
          delete me.dateAuthenticated
          db.put(utils.getId(me), me)
        }
      }
      // HACK for the case if employee removed
      if (me.isEmployee  &&  !me.organization) {
        delete me.isEmployee
        db.put(utils.getId(me), me)
      }
      self.setMe(me)
      var key = value[TYPE] + '_' + value[ROOT_HASH]
      self._setItem(key, value)
    })
    .catch(function(err) {
      if (!err.notFound) debugger
      // return self.loadModels()
    })
  },
  setMe(newMe) {
    me = newMe
    if (SERVICE_PROVIDERS  &&  me.organization  &&  !me.organization.url) {
      let orgId = utils.getId(me.organization)
      let o = SERVICE_PROVIDERS.filter((r) => {
        return r.org == orgId ? true : false
      })
      if (o && o.length) {
        if (o[0].url)
          me.organization.url = o[0].url
      }
    }
    utils.setMe(me)
  },
  onUpdateMe(params) {
    let r = {}
    extend(true, r, me, params)
    this.setMe(r)
    let meId = utils.getId(r)
    this._setItem(meId, r)
    return db.put(meId, r)
      // .then(() => {
      //   if (params.registered) {
      //     this.trigger({action: 'registered'})
      //   } else if (params)
      // })
  },
  onSetAuthenticated(authenticated) {
    if (!me) me = utils.getMe()

    let meId = utils.getId(me)
    let r = {}
    // extend(true, r, me, {
    //   isAuthenticated: authenticated,
    //   dateAuthenticated: Date.now()
    // })
    this.onUpdateMe({
      isAuthenticated: authenticated,
      dateAuthenticated: Date.now()
    })

    // this.setMe(r)
    this.trigger({ action: 'authenticated', value: authenticated })
    // if (authenticated)
    //   return
    // let me = utils.getMe()
    // let settings = list[SETTINGS + '_1'].value
    // if (utils.isEmpty(settings.hashToUrl))
    //   return
    // let time = new Date().getTime()
    // let toChain = {
    //   [TYPE]: 'tradle.AppState',
    //   [NONCE]: this.getNonce(),
    //   state: 'background'
    // }

    // Object.keys(settings.hashToUrl).forEach(id => {
    //   let to = list[id].value
    //   if (!to.pubkeys) return

    //   let result = this.searchMessages({modelName: MESSAGE, to: to, limit: 1})
    //   if (result  &&  time - result[0].time < 36000) {
    //     meDriver.signAndSend({
    //       object: toChain,
    //       to: { fingerprint: self.getFingerprint(list[toId].value) }
    //     })
    //     .catch(function (err) {
    //       debugger
    //     })
    //   }
    // })
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
        self._setItem(key, value)
      }
    })
    .catch(function(err) {
      // debugger
      // return self.loadModels()
    })
  },
  buildDriver ({ keys, identity, encryption }) {
    var self = this
    var keeper = createKeeper({
      path: path.join(TIM_PATH_PREFIX, 'keeper'),
      db: leveldown,
      encryption: encryption
    })

    cachifyKeeper(keeper, {
      max: 100
    })

    var blockchain = new Blockchain(networkName)
    var wsClients = driverInfo.wsClients
    // var whitelist = driverInfo.whitelist
    // var tlsKey = driverInfo.tlsKey

    // return Q.ninvoke(dns, 'resolve4', 'tradle.io')
    //   .then(function (addrs) {
    //     console.log('tradle is at', addrs)

    meDriver = new tradle.node({
      name: 'me',
      dir: TIM_PATH_PREFIX,
      identity: identity,
      keys: keys,
      keeper: keeper,
      networkName: networkName,
      blockchain: blockchain,
      leveldown: leveldown,
      // dht: dht,
      // port: port,
      // sendThrottle: 10000,
      syncInterval: 10 * 60 * 1000,
      // unchainThrottle: 10 * 60 * 1000,
      // afterBlockTimestamp: constants.afterBlockTimestamp,
      // afterBlockTimestamp: 1445976998,
      // relay: {
      //   // address: addrs[0],
      //   address: '54.236.214.150',
      //   port: 25778
      // }
    })

    console.log('me: ' + meDriver.permalink)
    meDriver = tradleUtils.promisifyNode(meDriver)

    // TODO: figure out of we need to publish identities
    meDriver.identityPublishStatus = meDriver.identitySealStatus
    meDriver._multiGetFromDB = utils.multiGet
    meDriver.addressBook.setCache(new Cache({ max: 500 }))

    let noProviders
    if (!SERVICE_PROVIDERS_BASE_URLS) {
      let settingsId = SETTINGS + '_1'
      var settings = list[settingsId]
      let updateSettings
      if (__DEV__  &&  settings  &&  settings.value.urls) {
        let urls = settings.value.urls
        // HACK for non-static ip
        if (SERVICE_PROVIDERS_BASE_URL_DEFAULTS) {
          SERVICE_PROVIDERS_BASE_URL_DEFAULTS.forEach((url) => {
            let found
            urls.forEach((u) => {
              if (u === url)
                found = true
            })
            if (!found) {
              updateSettings = true
              urls.push(url)
            }
          })
        }
        SERVICE_PROVIDERS_BASE_URLS = urls
        if (updateSettings)
          db.put(settingsId, settings.value)
      }
      else {
        SERVICE_PROVIDERS_BASE_URLS = SERVICE_PROVIDERS_BASE_URL_DEFAULTS.slice()
        var settings = {
          [TYPE]: SETTINGS,
          [ROOT_HASH]: '1',
          [CUR_HASH]: '1',
          urls: SERVICE_PROVIDERS_BASE_URLS,
          hashToUrl: {}
        }
        this._setItem(settingsId, settings)
        db.put(settingsId, settings)
      }
    }


    // if (TLS_ENABLED) {
    //   tlsKey = keys.filter((k) => k.type === 'dsa')[0]
    //   if (tlsKey) tlsKey = DSA.parsePrivate(tlsKey.priv)
    // }

    // if (tlsKey) tlsKey = kiki.toKey(tlsKey).priv()

    var tlsKey = driverInfo.tlsKey = TLS_ENABLED && meDriver.keys.filter(k => k.get('purpose') === 'tls')[0]
    // var fromPubKey = meDriver.identity.pubkeys.filter(k => k.type === 'ec' && k.purpose === 'sign')[0]
    meDriver._send = function (msg, recipientInfo, cb) {
      const recipientHash = recipientInfo.permalink
      let messenger = wsClients[recipientHash]
      if (!messenger) {
        let url = list[SETTINGS + '_1'].value.hashToUrl[recipientHash]
        messenger = wsClients[url]
      }
      if (!messenger) {
        // Alert.alert('meDriver._send recipient not found ' + recipientHash)
        return cb(new Error('recipient not found'))
      }

      const args = arguments
      const identifier = self.getIdentifier(recipientInfo)

      // this timeout is not for sending the entire message
      // but rather an idle connection timeout
      messenger.send(identifier, msg, cb)
      messenger.setTimeout(60000)
    }

    // meDriver = timeFunctions(meDriver)
    this.getInfo(SERVICE_PROVIDERS_BASE_URLS, true)
    // .then(() => {
    //   if (me && utils.isEmpty(chatMessages))
    //     this.initChats()
    // })
    .catch(function(err) {
      debugger
    })

    return Q(meDriver)
  },
  initChats() {
    let meId = utils.getId(me)
    for (var p in list) {
      let r = list[p].value
      let m = this.getModel(r[TYPE]).value
      if (m.interfaces  &&  m.interfaces.indexOf(MESSAGE) !== -1) {
        if (r.sharedWith) {
          r.sharedWith.forEach((shareInfo) => {
            if (shareInfo.bankRepresentative === meId)
              this.addMessagesToChat(utils.getId(r.to), r, true, shareInfo.timeShared)
            else  {
              let rep = list[shareInfo.bankRepresentative].value
              let orgId = utils.getId(rep.organization)
              this.addMessagesToChat(orgId, r, true, shareInfo.timeShared)
              if (utils.getId(r.to) === meId) {
                let contact = list[utils.getId(r.from)].value
                if (!contact.organization  ||  !contact.bot)
                  this.addMessagesToChat(utils.getId(r.from), r, true, shareInfo.timeShared)
              }
            }
          })
        }
        else if (m.id === VERIFICATION  &&  meId === utils.getId(r.from))
          this.addMessagesToChat(utils.getId(r.to), r, true)
        else {
          let fromId = utils.getId(r.from)
          let rep = list[meId === fromId ? utils.getId(r.to) : fromId].value
          let orgId = rep.organization ? utils.getId(rep.organization) : utils.getId(rep)
          this.addMessagesToChat(orgId, r, true)
        }
      }
    }
    for (let id in chatMessages) {
      chatMessages[id].sort(function(a, b) {
        return a.time - b.time;
      })
      chatMessages[id] = this.filterChatMessages(chatMessages[id], id)
    }
  },
  // Filtered result contains only messages that get displayed
  filterChatMessages(messages, orgId, lastId) {
    let meId = utils.getId(me)
    let productToForms = {}
    let productApp = {}
    // Compact all FormRequests that were fulfilled
    for (let i=messages.length - 1; i>=0; i--) {
      let r = list[messages[i].id].value
      if (r[TYPE] === FORM_REQUEST  &&  !r.document) {// && r.documentCreated)
      // delete list[id]
        let forms = productToForms[r.product]
        if (!forms)
          productToForms[r.product] = {}
        let formIdx = productToForms[r.product][r.form]
        if (typeof formIdx !== 'undefined')
          messages.splice(formIdx, 1)

        productToForms[r.product][r.form] = i
      }
      if (r[TYPE] === PRODUCT_APPLICATION) {
        let productIdx = productApp[r.product]
        if (productIdx)
          messages.splice(productIdx, 1)
        else
          productApp[r.product] = i
      }
    }
    // Compact all SelfIntroduction
    messages = messages.filter((rr, i) => {
      let r = list[rr.id].value
      return r[TYPE] === SELF_INTRODUCTION ? false : true
        // delete list[id]
    })
    let newResult = messages.filter((rr, i) => {
      let time = rr.time
      let id = rr.id
      let type = id.split('_')[0]
      // Compact ProductList resources that go one after another
      if (type === PRODUCT_LIST  &&  i !== messages.length - 1) {
        var next = messages[i + 1]

        if (next && next.id.split('_')[0] === PRODUCT_LIST) {
          // delete list[id]
          return false
        }
      }
      // if (r[TYPE] === CUSTOMER_WAITING) {
      //   let f = list[utils.getId(r.from)].value.organization
      //   let t = list[utils.getId(r.to)].value.organization
      //   if (utils.getId(f) === utils.getId(t))
      //     return false
      // }
      let r = list[rr.id].value

      // Check if there was request for the next form after multy-entry form
      let fromId = utils.getId(r.from)

      if (!me.isEmployee  &&  fromId !== meId  &&  list[fromId]) {
        let rFrom = list[fromId].value
        if (!rFrom.bot) {
          let photos = list[fromId].value.photos
          if (photos)
            r.from.photo = photos[0]
          else
            r.from.photo = employee
        }
      }
      let m = this.getModel(r[TYPE]).value
      let isMyProduct = m.subClassOf === MY_PRODUCT
      let isForm = !isMyProduct && m.subClassOf === FORM
      // r.from.photos = list[utils.getId(r.from)].value.photos;
      // var to = list[utils.getId(r.to)]
      // if (!to) console.log(r.to)
      // r.to.photos = to  &&  to.value.photos;
      if (isMyProduct)
        r.from.organization = list[utils.getId(r.from)].value.organization
      else if (isForm) {
        // set organization and photos for items properties for better displaying
        let form = list[utils.getId(r.to)].value
        if (orgId  &&  r.sharedWith  &&  r.sharedWith.length > 1) {
          // if (utils.getId(r.to.organization) !== toOrgId) {
          //   let filteredVerifications = this.getSharedVerificationsAboutThisForm(r, toOrgId)
          // }
        }
        r.to.organization = form.organization
        for (var p in r) {
          if (!m.properties[p]  ||  m.properties[p].type !== 'array' ||  !m.properties[p].items.ref)
            continue
          let pModel = this.getModel(m.properties[p].items.ref).value
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
    if (lastId  &&  lastId.split('_')[0] === PRODUCT_LIST) {
      let i=newResult.length - 1
      for (; i>=0; i--)
        if (newResult[i][TYPE] !== PRODUCT_LIST)
          break
        newResult.splice(i, 1)
    }
    return newResult
    // return newResult.reverse()
  },


  getInfo(serverUrls, retry, id) {
    let self = this

    let defer = Q.defer()
    let togo = serverUrls.length
    serverUrls.forEach((url) => {
      self.getServiceProviders(url, retry, id)
      .then((results) => {
        // var httpClient = driverInfo.httpClient
        var wsClients = driverInfo.wsClients
        // var whitelist = driverInfo.whitelist
        var tlsKey = driverInfo.tlsKey
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
          Push.subscribe(provider.hash)
            .catch(err => console.log('failed to register for push notifications'))
        })

        if (--togo === 0) {
          defer.resolve()
          // meDriver.watchTxs(whitelist)
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
    //   var tlsKey = driverInfo.tlsKey
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

    //       // if (!tlsKey) return

    //       // // self.addWebSocketClient()
    //       // var wsClient = new WebSocketClient({
    //       //   url: utils.joinURL(provider.url, provider.id, 'ws'),
    //       //   tlsKey: tlsKey,
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
    var self = this
    let parts = code.split(';')

    let orgId = ORGANIZATION + '_' + parts[1]
    let serviceProvider =  SERVICE_PROVIDERS  ? SERVICE_PROVIDERS.filter((json) => json.org === orgId) : null

    serviceProvider = (serviceProvider  &&  serviceProvider.length) ? serviceProvider[0] : null
      // let serviceProvider =  SERVICE_PROVIDERS.filter((json) => json.url === serverUrl)

    var org = list[orgId].value
    let promise = serviceProvider ? Q() : this.getInfo([parts[0]])

    return promise
    .then(function() {
      if (!serviceProvider)
        serviceProvider = SERVICE_PROVIDERS.filter((json) => json.org === orgId)[0]

      return Q.race([
        fetch(utils.joinURL(serviceProvider.url, serviceProvider.id + '/employee/' + parts[2]), { headers: { cache: 'no-cache' }}),
        Q.Promise(function (resolve, reject) {
          setTimeout(function () {
            reject(new Error('timed out'))
          }, 5000)
        })]
      )
    })
    // return Q(employee)
    .then((response) => {
      return response.clone().json()
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
      self.addToSettings(provider)

      meDriver.addContactIdentity(provider.identity)

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
  addToSettings(provider) {
    let hashToUrl = list[SETTINGS + '_1'].value.hashToUrl
    if (!hashToUrl) {
      list[SETTINGS + '_1'].value.hashToUrl = {}
      hashToUrl = list[SETTINGS + '_1'].value.hashToUrl
    }
    // save provider's employee
    // if (!hashToUrl[provider.hash]) {
      hashToUrl[provider.hash] = getProviderUrl(provider)

      db.put(SETTINGS + '_1', list[SETTINGS + '_1'].value)
    // }
  },
  addProvider(provider) {
    // let httpClient = driverInfo.httpClient
    // httpClient.addRecipient(
    //   provider.hash,
    //   utils.joinURL(provider.url, provider.id, 'send')
    // )

    // let whitelist = driverInfo.whitelist
    // if (provider.txId)
    //   whitelist.push(provider.txId)
    let self = this
    let tlsKey = driverInfo.tlsKey
    const wsClients = driverInfo.wsClients
    // const identifier = tlsKey ? tlsKey.pubKeyString : meDriver.permalink

    // const identifier = tradle.utils.serializePubKey(identifierPubKey).toString('hex')
    const base = getProviderUrl(provider)

    if (wsClients[base]) return wsClients[base]

    let wsClient = this.getWsClient(base)
    let transport = this.getTransport(wsClient)
    // const url = utils.joinURL(base, 'ws?from=' + identifier).replace(/^http/, 'ws')
    // const wsClient = new WebSocketClient({
    //   url: url,
    //   autoConnect: true,
    //   // for now, till we figure out why binary
    //   // doesn't work (socket.io parser errors on decode)
    //   forceBase64: true
    // })

    wsClient.on('disconnect', function () {
      transport.clients().forEach(function (c) {
        // reset OTR session, restart on connect
        debug('aborting pending sends due to disconnect')
        c.destroy()
      })

      // pause all channels
      meDriver.sender.pause()
    })

    wsClient.on('connect', function (recipient) {
      // resume all paused channels
      meDriver.sender.resume()
    })

    wsClients[base] = transport
    wsClients[provider.hash] = transport

    // let timeouts = {}
    // transport.on('receiving', function (msg) {
    //   clearTimeout(timeouts[msg.from])
    //   delete timeouts[msg.from]
    // })

    // transport.on('404', function (recipient) {
    //   if (!timeouts[recipient]) {
    //     timeout = setTimeout(function () {
    //       delete timeouts[recipient]
    //       transport.cancelPending(recipient)
    //     }, 10000)
    //   }
    // })

    transport.on('404', function (recipient) {
      meDriver.sender.pause(recipient)
      transport.cancelPending(recipient)
      // try again soon. Todo: make this smarter
      setTimeout(() => meDriver.resume(), 10000)
    })

    const receiveLocks = {}
    transport.on('message', function (msg, from) {
      if (!receiveLocks[from]) receiveLocks[from] = mutexify()

      const lock = receiveLocks[from]
      lock(_release => {
        const timeout = setTimeout(release, 10000)
        const release = () => {
          clearTimeout(timeout)
          _release()
        }

        const promise = receive(msg, from)
        if (!Q.isPromiseAlike(promise)) {
          return release()
        }

        promise.finally(release)
      })
    })

    transport.on('timeout', function (identifier) {
      transport.cancelPending(identifier)
    })

    function receive (msg, from) {
      try {
        msg = tradleUtils.unserializeMessage(msg)
        const payload = msg.object
        switch (payload[TYPE]) {
        case INTRODUCTION:
          let rootHash = payload.identity[ROOT_HASH] || protocol.linkString(payload.identity)
          return meDriver.addContactIdentity(payload.identity)
          .then(() => {
            return self.addContact(payload, rootHash)
          })
          .then(() => {
            const url = utils.keyByValue(wsClients, transport)
            self.addToSettings({hash: rootHash, url: url})
          })
          break
        case SELF_INTRODUCTION:
          rootHash = payload.identity[ROOT_HASH] || protocol.linkString(payload.identity)
          let name = payload.name
          if (!name  ||  !name.length) {
            name = payload.identity.name
            if (name)
              name = name.formatted
          }
          if (!name && payload.message)
            name = payload.message.split(' ')[0]

          // const rootHash = payload.identity[ROOT_HASH] || protocol.linkString(payload.identity)
          Alert.alert(
            translate('newContactRequest', name),
            payload.message || null,
            [
              {text: translate('Ok'),
              onPress: () => {
                return meDriver.addContactIdentity(payload.identity)
                .then(() => {
                  return self.addContact(payload, rootHash)
                })
                .then(() => {
                  const url = utils.keyByValue(wsClients, transport)
                  self.addToSettings({hash: rootHash, url: url})
                })
              }},
              {text: translate('cancel'), onPress: () => console.log('Canceled!')},
            ]
          )

          // if (name)
          //   name = name.charAt(0).toUpperCase() + name.slice(1)


          return
        default:
          break
        }
      } catch (err) {
        try {
//           debugger
          const payload = JSON.parse(msg)
          if (payload[TYPE] === PAIRING_REQUEST) {
            const rootHash = payload.identity[ROOT_HASH] || protocol.linkString(payload.identity)
            Alert.alert(
              translate('pairingRequest'),
              null,
              [
                {text: translate('Ok'),
                onPress: () => {
                  self.trigger({action: 'acceptingPairingRequest', resource: payload})
                  // return self.onProcessPairingRequest(list[PAIRING_DATA + '_1'].value, payload)
                  // .then(() => {
                  //   Alert.alert(translate('pairingRequestWasProcesseed'))
                  // })
                  // .catch((err) => {
                  //   debugger
                  // })
                }},
                {text: translate('cancel'), onPress: () => console.log('Canceled!')},
              ]
            )
          }
          // else if (payload[TYPE] === PAIRING_RESPONSE) {
          //   return self.onProcessPairingResponse(list[PAIRING_DATA + '_1'].value, payload)
          //   .then(() => {
          //     debugger
          //     Alert.alert('Pairing was successful')
          //   })
          //   .catch((err) => {
          //     debugger
          //     Alert.alert(err)
          //   })
          // }
          return
        } catch (err) {
          return
        }
      }

      // const prop = 'pubKey'
      // const identifier = tradle.utils.deserializePubKey(new Buffer(from, 'hex'))

      const prop = tlsKey ? 'pubKey' : 'permalink'
      const identifier = prop === 'permalink' ? from : {
        type: 'ec',
        curve: 'curve25519',
        pub: new Buffer(from, 'hex')
      }

      meDriver.sender.resume(identifier)
      return meDriver.receive(msg, { [prop]: identifier })
        .catch(err => {
          console.warn('failed to receive msg:', err, msg)
          debugger
        })
    }
  },
  onPairingRequestAccepted(payload) {
    return this.onProcessPairingRequest(list[PAIRING_DATA + '_1'].value, payload)
    .then(() => {
      this.trigger({action: 'pairingRequestAccepted'})
    })
    .catch((err) => {
      debugger
      this.trigger({action: 'invalidPairingRequest', error: (err.fullType === 'exists' ? translate('thisDeviceWasAlreadyPaired') : translate('invalidPairingRequest'))})
    })
  },

  getIdentifier(identityInfo) {
    identityInfo = identityInfo || meDriver.identityInfo
    return TLS_ENABLED ? this.getIdentifierPubKey(identityInfo) : identityInfo.permalink
  },

  getIdentifierPubKey(identityInfo) {
    identityInfo = identityInfo || meDriver
    const purpose = TLS_ENABLED ? 'tls' : 'sign'
    const key = tradleUtils.find(identityInfo.keys || identityInfo.object.pubkeys, k => {
      const kPurpose = k.purpose || k.get('purpose')
      return kPurpose === purpose
    })

    return key.pubKeyString || key.pub
  },

  getWsClient(base) {
    const tlsKey = driverInfo.tlsKey
    const url = utils.joinURL(base, 'ws?' + querystring.stringify({
      from: this.getIdentifier(),
      // pubKey: this.getIdentifierPubKey()
    })).replace(/^http/, 'ws')

    return new WebSocketClient({
      url: url,
      autoConnect: true,
      // for now, till we figure out why binary
      // doesn't work (socket.io parser errors on decode)
      forceBase64: true
    })
  },

  getTransport(wsClient) {
    const tlsKey = driverInfo.tlsKey
    return newSwitchboard({
      identifier: this.getIdentifier(),
      unreliable: wsClient,
      clientForRecipient: function (recipient) {
        const sendy = new Sendy(SENDY_OPTS)
        if (!tlsKey) return sendy

        return new TLSClient({
          key: {
            secretKey: tlsKey.priv,
            publicKey: tlsKey.pub
          },
          client: sendy,
          theirPubKey: new Buffer(recipient, 'hex')
        })
      }
    })
  },

  // Gets info about companies in this app, their bot representatives and their styles
  getServiceProviders(url, retry, id) {
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
      if (language && list[utils.getId(language)]) {
        language = list[utils.getId(language)].value
        languageCode = language.code
      }
    }
    if (!languageCode)
      languageCode = utils.getDefaultLanguage()
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
          if (language)
            me.language = language
          self.setMe(me)
        }
      }

      if (!SERVICE_PROVIDERS)
        SERVICE_PROVIDERS = []

      var promises = []
      json.providers.forEach(sp => {
        if (id)  {
          if (sp.id !== id)
            return
        }
        // else if (sp.id !== 'eres'  &&  !list[PROFILE + '_' + sp.bot[ROOT_HASH]])
        //   return
        if (!sp.org[ROOT_HASH]) {
          sp.org[ROOT_HASH] = protocol.linkString(sp.org)
        }

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
      if (utils.getMe())
        self.setMe(utils.getMe())
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
    var self = this
    var okey = sp.org ? utils.getId(sp.org) : null
    var hash = protocol.linkString(sp.bot.pub)
    var ikey = IDENTITY + '_' + hash
    var batch = []
    if (!list[okey]) {
      batch.push({type: 'put', key: okey, value: sp.org})
      this._setItem(okey, sp.org)
    }
    if (sp.style)
      list[okey].value.style = sp.style
    if (!list[ikey]) {
      var profile = {
        [TYPE]: PROFILE,
        [ROOT_HASH]: hash,
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
      profile.photos = []
      if (sp.bot.profile.photo)
        profile.photos.push(sp.bot.profile.photo)
      else
        profile.photos.push(employee)
      if (sp.isEmployee)
        profile.isEmployee = true
      else
        profile.bot = true
      // profile[ROOT_HASH] = r.pub[ROOT_HASH] //?????
      var identity = {
        [ROOT_HASH]:   hash,
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
      self._setItem(ikey, identity)
      self._setItem(pkey, profile)
    }
    if (!list[okey].value.contacts) {
      self._mergeItem(okey, { contacts: [] })
      // list[okey].value.contacts = []
    }

    var pkey = PROFILE + '_' + hash

    var curOkeyVal = list[okey].value
    var newContact = {
      id:     pkey,
      // title: list[pkey].value.formatted
    }

    self._mergeItem(okey, { contacts: [...curOkeyVal.contacts, newContact] })
    // list[okey].value.contacts.push({
    //   id:     pkey,
    //   titile: list[pkey].formatted
    // })

    var promises = [
      // TODO: evaluate the security of this
      meDriver.addContactIdentity(sp.bot.pub)
    ]

    if (batch.length)
      promises.push(db.batch(batch))

    return Q.allSettled(promises)
    .then(function() {
      if (!sp.isEmployee)
        return {hash: hash, txId: sp.bot.txId, id: sp.id, url: url}
      let orgSp = SERVICE_PROVIDERS.filter((r) => utils.getId(r.org) === okey)[0]
      return {hash: hash, txId: sp.bot.txId, id: orgSp.id, url: orgSp.url, identity: sp.bot.pub}
    })
    .catch(err => {
      debugger
      throw err
    })
  },

  addContact(data, hash) {
    var ikey = IDENTITY + '_' + hash
    var pkey = PROFILE + '_' + hash

    var profile = list[pkey] && list[pkey].value
    var identity = list[ikey]  &&  list[ikey].value

    var newContact = !profile  ||  !identity
    var isDevicePairing = data[TYPE]  &&  data[TYPE] === PAIRING_REQUEST
    if (newContact) {
      if (data.name === '')
        data.name = data.identity.name && data.identity.name.formatted
      if (isDevicePairing) {
        profile = {
          [TYPE]: PROFILE,
          [ROOT_HASH]: hash,
          firstName:  me.firstName,
          formatted: me.formatted
        }
      }
      else {
        profile = {
          [TYPE]: PROFILE,
          [ROOT_HASH]: hash,
          ...data.profile
        }

        if (!profile.firstName) {
          profile.firstName = data.name || data.message.split(' ')[0]
        }

        if (!profile.formatted) {
          profile.formatted = profile.firstName
        }
      }

      profile.formatted = profile.firstName + (data && data.lastName ? ' ' + data.lastName : '')
      var identity = data.identity
      identity[ROOT_HASH] = hash
      identity[CUR_HASH] = hash

      var batch = []
      batch.push({type: 'put', key: ikey, value: identity })
      batch.push({type: 'put', key: pkey, value: profile })
      this._setItem(ikey, identity)
      this._setItem(pkey, profile)
    }
    // HACK
    if (!profile.firstName.length) {
      profile.firstName = identity.name.firstName
      profile.formatted = identity.name.formatted || profile.firstName
    }
    if (!isDevicePairing)
      this.trigger({action: 'newContact', to: profile, newContact: true})

    // return newContact ? db.batch(batch) : Q()
    // .then(() => {
      return isDevicePairing ? Q() : this.onAddMessage({
          [TYPE]: SIMPLE_MESSAGE,
          message: translate('howCanIHelpYou', profile.formatted, utils.getMe().firstName),
          from: this.buildRef(utils.getMe()),
          to: list[pkey].value
        })
      .then(() => {
        if (newContact)
          return db.batch(batch)
      })
    // })
    .catch((err) => {
      debugger
    })
  },
  // dhtFor (identity, port) {
  //   var dht = new DHT({
  //     nodeId: this.nodeIdFor(identity),
  //     bootstrap: ['tradle.io:25778']
  //   })

  //   dht.on('error', function (err) {
  //     debugger
  //     throw err
  //   })

  //   dht.listen(port)
  //   // dht.socket.filterMessages(tutils.isDHTMessage)
  //   return dht
  // },
  //
  // nodeIdFor (identity) {
  //   return crypto.createHash('sha256')
  //     .update(this.findKey(identity.pubkeys, { type: 'dsa' }).fingerprint)
  //     .digest()
  //     .slice(0, 20)
  // },
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
    Q.all([
      LocalAuth.hasTouchID(),
      this.ready
    ])
    .spread(hasTouchID => {
      // isLoaded = true
      self.trigger({
        action: 'start',
        models: models,
        me: me,
        hasTouchID
      });
    })
  },

  onAddMessage(r, isWelcome, requestForForm) {
    var self = this
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

    let isSelfIntroduction = r[TYPE] === SELF_INTRODUCTION

    for (var p in r) {
      if (!props[p])
        continue
      if (!isSelfIntroduction  &&  props[p].ref  &&  !props[p].id)
        rr[p] = this.buildRef(r[p])
      else
        rr[p] = r[p];
    }
    // let firstTime
    if (r[TYPE] === PRODUCT_APPLICATION) {
      let result = this.searchMessages({modelName: PRODUCT_APPLICATION, to: toOrg})
      if (result) {
        result = result.filter((r) => {
          return (r.message === r.message  &&  !r.documentCreated) ? true : false
        })
        if (result.length) {
          result.forEach((r) => {
            const rid = utils.getId(r)
            self._mergeItem(rid, { documentCreated: true })
          })
        }
      }
    }
    let isCustomerWaiting = r[TYPE] === CUSTOMER_WAITING
    //   if (!this.isConnected) {
    //     let result = this.searchMessages({modelName: PRODUCT_LIST, to: toOrg})
    //     firstTime = !result  ||  !result.length
    //   }
    // }
    rr[NONCE] = this.getNonce()
    var toChain = {
      [TYPE]: rr[TYPE],
      [NONCE]: rr[NONCE],
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
    var error
    var welcomeMessage
    var tmpKey
    // var promise = Q(protocol.linkString(toChain))
    let hash = r.to[ROOT_HASH]
    if (!hash)
      hash = list[utils.getId(r.to)].value[ROOT_HASH]
    var toId = IDENTITY + '_' + hash
    var sendStatus = (self.isConnected) ? SENDING : QUEUED
    var noCustomerWaiting
    return meDriver.sign({ object: toChain })
    .then(function(result) {
      toChain = result.object
      tmpKey = rr[ROOT_HASH] = result.sig

      if (r[TYPE] === PRODUCT_APPLICATION) {
        let params = {
          action: 'addItem',
          resource: rr,
          // sendStatus: sendStatus
        }
        self.trigger(params)
      }

      if (!isWelcome) {
        let len = batch.length
        self.addLastMessage(r, batch)
      }
      if (!isWelcome  ||  utils.isEmployee(r.to))
        return
      if (!orgRep)
        return
      if (orgRep.lastMessageTime) {
        isWelcome = orgRep.lastMessage === r.message
        if (!isWelcome)
          return;
      }
      // var wmKey = SIMPLE_MESSAGE + '_Welcome' + toOrg.name.replace(' ', '_')// + '_' + new Date().getTime()
      // Create welcome message without saving it in DB
      // welcomeMessage = {}
      if (me.txId)
        return
      // Avoid sending CustomerWaiting request after SelfIntroduction or IdentityPublishRequest to
      // prevent the not needed duplicate expensive operations for obtaining ProductList
      return self.getDriver(me)
      .then(function () {
        if (/*!self.isConnected  || */ publishRequestSent[orgId])
          return
        // TODO:
        // do we need identity publish status anymore
        return meDriver.identityPublishStatus()
      })
      .then(function(status) {
        if (!status/* || !self.isConnected*/)
          return
        publishRequestSent[orgId] = true
        if (!status.watches.link  &&  !status.link) {
          if (isCustomerWaiting)
            noCustomerWaiting = true
          return self.publishMyIdentity(orgRep)
        }
        else {
          // self.updateMe()
          var allMyIdentities = list[MY_IDENTITIES].value
          var all = allMyIdentities.allIdentities
          var curId = allMyIdentities.currentIdentity

          let identity = all.filter((id) => id.id === curId)

          var msg = {
            message: me.firstName + ' is waiting for the response',
            [TYPE]: SELF_INTRODUCTION,
            identity: identity[0].publishedIdentity,
            profile: {
              firstName: me.firstName
            },
            from: me,
            to: r.to
          }
          if (isCustomerWaiting)
            noCustomerWaiting = true
          return self.onAddMessage(msg)
        }
      })
    })
    .then(function() {
      if (isWelcome && utils.isEmpty(welcomeMessage))
        return;

      // Temporary untill the real hash is known
      var key = utils.getId(rr)
      rr._sendStatus = sendStatus
      self._setItem(key, rr)

      if (!toOrg) {
        let to = list[utils.getId(r.to)].value
        toOrg = to.organization ? to.organization : to
      }

      self.addMessagesToChat(utils.getId(toOrg), rr)

      var params = {
        action: 'addMessage',
        resource: isWelcome ? welcomeMessage : rr
      }
      if (error)
        params.error = error

      self.trigger(params);
      if (batch.length  &&  !error  &&  list[toId].value.pubkeys)
        return self.getDriver(me)
    })
    .then(function() {
      // SelfIntroduction or IdentityPublishRequest were just sent
      if (noCustomerWaiting)
        return
      if (list[toId].value.pubkeys) {
        let sendParams = self.packMessage(r, toChain)
        const method = toChain[SIG] ? 'send' : 'signAndSend'
        return meDriver[method](sendParams)
        .catch(function (err) {
          debugger
        })
      }
    })
    .then(function(result) {
      if (!requestForForm  &&  isWelcome)
        return
      if (isWelcome  &&  utils.isEmpty(welcomeMessage))
        return
      // cleanup temporary resources from the chat message references and from the in-memory storage - 'list'
      if (!toOrg) {
        let to = list[utils.getId(r.to)].value
        toOrg = to.organization ? to.organization : to
      }
      let orgId = utils.getId(toOrg)
      self.deleteMessageFromChat(orgId, rr)
      delete list[rr[TYPE] + '_' + tmpKey]

      // saving the new message
      const data = utils.toOldStyleWrapper(result.message)
      if (data)  {
        rr[ROOT_HASH] = data[ROOT_HASH]
        rr[CUR_HASH] = data[CUR_HASH]
      }
      var key = utils.getId(rr)
      batch.push({type: 'put', key: key, value: rr})
      rr._sendStatus = self.isConnected ? SENDING : QUEUED

      self._setItem(key, rr)
      self.addMessagesToChat(orgId, rr)
      return db.batch(batch)
    })
    .catch(function(err) {
      debugger
    });
  },
  packMessage(r, toChain) {
    var sendParams = {
      object: toChain
    }
    let hash = r.to[ROOT_HASH]
    if (hash === me[ROOT_HASH])
      hash = r.from[ROOT_HASH]
    if (!hash)
      hash = list[utils.getId(r.to)].value[ROOT_HASH]
    var toId = IDENTITY + '_' + hash
    var isEmployee
    if (me.isEmployee) {
      let to = list[utils.getId(r.to)].value
      isEmployee = (!to.organization ||  utils.getId(to.organization) === utils.getId(me.organization))
    }
    // let isEmployee = me.isEmployee && (!r.to.organization || utils.getId(r.to.organization) === utils.getId(me.organization))
    if (isEmployee) {
      let arr = SERVICE_PROVIDERS.filter((sp) => {
        let reps = this.getRepresentatives(sp.org)
        let talkingToBot = reps.forEach((r) => {
          return r[ROOT_HASH] === hash ? true : false
        })
        return talkingToBot  &&  talkingToBot.length ? true : false
      })
      if (!arr.length) {
        var toRootHash = hash

        sendParams.other = {
          forward: toRootHash
        }
        let rep = this.getRepresentative(utils.getId(me.organization))

        sendParams.to = { fingerprint: this.getFingerprint(list[IDENTITY + '_' + rep[ROOT_HASH]].value) }
      }
    }
    var toId = IDENTITY + '_' + hash
    if (!sendParams.to)
      sendParams.to = { fingerprint: this.getFingerprint(list[toId].value) }
    return sendParams
  },
  disableOtherFormRequestsLikeThis(rr) {
    let fromRep = utils.getId(rr.from)
    let orgId = utils.getId(list[fromRep].value.organization)
    let messages = chatMessages[orgId]
    messages.forEach((r) => {
      let m = list[r.id].value
      if (m[TYPE] === FORM_REQUEST  &&
          m.product === rr.product  &&
          m.form === rr.form        &&
          !m.document               &&
          !m.documentCreated) {
        m.documentCreated = true
        db.put(utils.getId(m), m)
      }
    })

  },
  // Every chat has it's own messages array where
  // all the messages present in order they were received
  addMessagesToChat(id, r, isInit, timeShared) {
    if (r.documentCreated  &&  !isInit)
      return
    // if (!isInit  &&  utils.isEmpty(chatMessages))
    //   return
    let messages = chatMessages[id]
    let rid = utils.getId(r)
    if (messages  &&  messages.length) {
      if (!isInit) {
        if (r[TYPE] === SELF_INTRODUCTION)
          return
        if (r[TYPE] === PRODUCT_LIST) {
          let msgId = messages[messages.length - 1].id
          if (msgId.split('_')[0] === PRODUCT_LIST)
            messages.splice(messages.length - 1, 1)
        }
  //       return false
        let idx = -1
        for (let i=0; i<messages.length  &&  !idx; i++)
          if (messages[i].id === rid)
            idx = i

        if (idx !== -1)
          messages.splice(idx, 1)
      }
    }
    else {
      messages = []
      chatMessages[id] = messages
    }
    messages.push({id: utils.getId(r), time: timeShared ? timeShared : r.time})
  },
  // cleanup
  deleteMessageFromChat(id, r) {
    let messages = chatMessages[id]
    if (messages) {
      let rid = utils.getId(r)
      for (let i=0; i<messages.length; i++)
        if (messages[i].id === rid) {
          messages.splice(i, 1)
          break
        }
    }
  },
  getRepresentatives(orgId) {
    var result = this.searchNotMessages({modelName: PROFILE, all: true})
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
    var result = this.searchNotMessages({modelName: PROFILE, all: true})
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
    var self = this;
    var batch = [];
    var key;
    var fromId = utils.getId(r.from);
    var from = list[fromId].value;
    var toId = utils.getId(r.to);
    var to = list[toId].value;

    r[NONCE] = r[NONCE]  ||  this.getNonce()
    r.time = r.time || new Date().getTime();

    var toChain = {}
    var sendParams
    var toRootHash = toId.split('_')[1]
    if (!dontSend) {
      extend(toChain, r);
      if (r[ROOT_HASH]) {
        toChain[CUR_HASH] = r[ROOT_HASH]
        r[CUR_HASH] = r[ROOT_HASH]
      }
      delete toChain.from
      delete toChain.to
      toChain.time = r.time
      sendParams = this.packMessage(r, toChain)
    }
    var key = IDENTITY + '_' + toRootHash

    var promise = dontSend
                 ? Q()
                 :  meDriver.signAndSend(sendParams)
                    // meDriver.signAndSend({
                    //   object: toChain,
                    //   to: { fingerprint: this.getFingerprint(list[key].value) }
                    // })
    var newVerification
    return promise
    .then(function(data) {
      if (data) {
        r[CUR_HASH] = data.object.link
        r[ROOT_HASH] = data.object.permalink
        // var roothash = data[0]._props[ROOT_HASH]
        // r[ROOT_HASH] = roothash
        // r[CUR_HASH] = data[0]._props[CUR_HASH]
      }
      key = utils.getId(r)
      if (from.organization)
        r.organization = from.organization;
      if (!r.sharedWith) {
        r.sharedWith = []
        r.sharedWith.push(self.createSharedWith(utils.getId(r.from), r.time))
      }
      batch.push({type: 'put', key: key, value: r});
      newVerification = self.buildRef(r)
      let len = batch.length
      self.addLastMessage(r, batch)
      return db.batch(batch)
    })
    .then(function() {
      var rr = {};
      // extend(rr, from);
      // rr.verifiedByMe = r;
      self._setItem(key, r)
      if (utils.getId(from) === utils.getId(me))
        self.addMessagesToChat(utils.getId(r.to), r)
      else
        self.addMessagesToChat(from.organization ? utils.getId(from.organization) : fromId, r)

      if (notOneClickVerification)
        self.trigger({action: 'addItem', resource: r});
      else
        self.trigger({action: 'addVerification', resource: r});

      var verificationRequestId = utils.getId(r.document);
      var verificationRequest = list[verificationRequestId].value;
      if (!verificationRequest.verifications)
        verificationRequest.verifications = [];
      if (!r.txId) {
        verificationRequest.verifications.push(self.buildRef(newVerification));
      }
      else {
        for (var i=0; i<verificationRequest.verifications.length; i++) {
          if (utils.getId(verificationRequest.verifications).split('_')[1] === r[ROOT_HASH])
            verificationRequest.verifications = self.buildRef(newVerification)
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
      debugger
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
    var self = this;
    var modelName = resource[TYPE];
    var meta = this.getModel(modelName).value;
    var foundRefs = [];
    var refProps = this.getRefs(resource, foundRefs, meta.properties);
    var newResource = {};
    extend(newResource, resource);
    for (var i=0; i<foundRefs.length; i++) {
     // foundRefs.forEach(function(val) {
       var val = foundRefs[i];
       if (val.state === 'fulfilled') {
         var propValue = utils.getId(val.value)
         var prop = refProps[propValue];
         newResource[prop] = val.value;
         newResource[prop].id = propValue
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
          // reference property could be set as a full resource (for char to have all info at hand when displaying the message)
          // or resource id
          let rValue = utils.getId(resource[p])

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
    var self = this;
    var value = params.value;
    var resource = params.resource;
    delete temporaryResources[resource[TYPE]]
    var meta = params.meta;
    var shareWith = params.shareWith

    var isRegistration = params.isRegistration;
    var additionalInfo = params.additionalInfo;
    // Check if there are references to other resources
    var refProps = {};
    var promises = [];
    var foundRefs = [];
    var props = meta.properties;

    if (meta.id == VERIFICATION  ||  meta.subClassOf === VERIFICATION)
      return this.onAddVerification(resource, true);

    let isSelfIntroduction = meta[TYPE] === SELF_INTRODUCTION
    var isNew = !resource[ROOT_HASH];

    var checkPublish
    var isSwitchingToEmployeeMode = isNew ? false : self.isSwitchingToEmployeeMode(resource)
    // Data were obtained by scanning QR code of the forms that were entered on Web
    if (meta.id === GUEST_SESSION_PROOF || isSwitchingToEmployeeMode) {
      checkPublish = this.getDriver(me)
      .then(function () {
        // if (publishRequestSent)
          return meDriver.identityPublishStatus()
      })
      .then(function(status) {
        if (!status.watches.link  &&  !status.link) {
          if (isSwitchingToEmployeeMode)
            self.publishMyIdentity(self.getRepresentative(utils.getId(resource.organization)))
          else
            self.publishMyIdentity(list[utils.getId(resource.to)].value)
        }
        else if (isSwitchingToEmployeeMode) {
          let orgId = utils.getId(resource.organization)
          let orgRep = self.getRepresentative(orgId)

          var msg = {
            message: me.firstName + ' is waiting for the response',
            [TYPE]: SELF_INTRODUCTION,
            identity: meDriver.identity,
            name: me.firstName,
            from: me,
            to: orgRep
          }
          checkPublish = self.onAddMessage(msg)
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
      var json = utils.clone(value) // maybe not the best way to copy, try `clone`?
      for (p in resource) {
        if (props[p]  &&  props[p].type === 'array')
          json[p] = resource[p];
      }
      if (!json[TYPE])
        json[TYPE] = meta.id;
      var error = this.checkRequired(json, props);
      if (error) {
        foundRefs.forEach(function(val) {
          var propValue = utils.getId(val.value)
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
      // if (!isNew) // make sure that the values of ref props are not the whole resources but their references
      if (!isSelfIntroduction)
        utils.optimizeResource(resource)

      var isMessage = meta.isInterface  ||  (meta.interfaces  &&  meta.interfaces.indexOf(MESSAGE) != -1);
      Q.allSettled(promises)
      .then(function(results) {
        let allFoundRefs = foundRefs.concat(results);
        allFoundRefs.forEach(function(val) {
          if (val.state === 'fulfilled') {
            var value = val.value;
            var propValue = utils.getId(value)
            var prop = refProps[propValue];

            var title = utils.getDisplayName(value, self.getModel(value[TYPE]).value.properties);
            json[prop] = self.buildRef(value)
            if (isMessage  &&  !json.documentCreated)
              json.time = new Date().getTime();
          }
        });
        // if (isNew  &&  !resource.time)
        if (isNew  ||  !value.documentCreated) //(meta.id !== FORM_ERROR  &&  meta.id !== FORM_REQUEST  &&  !meta.id === FORM_ERROR))
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
        if (params.chat) {
          let chatId = utils.getId(params.chat)
          returnVal.to = self.buildRef(self.getRepresentative(chatId))
        }

        if (isRegistration)
          return handleRegistration()
        else if (isMessage)
          return handleMessage()
        else
          return save(isSwitchingToEmployeeMode)
      })
      .then(() => {
        if (isSwitchingToEmployeeMode) {
          let orgId = utils.getId(resource.organization)
          let orgRep = self.getRepresentative(orgId)

          let msg = {
            [TYPE]: PRODUCT_APPLICATION,
            product: EMPLOYEE_ONBOARDING,
            [NONCE]: self.getNonce(),
            time: new Date().getTime()
          }
          self.trigger({action: 'employeeOnboarding', to: list[orgId].value})
          meDriver.signAndSend({
            object: msg,
            to: { fingerprint: self.getFingerprint(list[utils.getId(IDENTITY + '_' + orgRep[ROOT_HASH])].value) }
          })
          .catch(function (err) {
            debugger
          })
        }
      })

      function handleRegistration () {
        self.trigger({action: 'runVideo'})
        return Q.all([
            self.loadDB(),
            utils.resetPasswords()
          ])
          .then(function () {
            return self.getDriver(returnVal)
          })
          .then(function () {
            if (!resource || isNew) {
              returnVal[ROOT_HASH] = protocol.linkString(meDriver.identity)
            }

            return save()
          })
      }

      function handleMessage () {
        // TODO: fix hack
        // hack: we don't know root hash yet, use a fake
        if (returnVal.documentCreated)  {
          var params = {action: 'addItem', resource: returnVal}
          self.disableOtherFormRequestsLikeThis(returnVal)
          // don't save until the real resource is created
          list[utils.getId(returnVal)].value = returnVal
          self.trigger(params);
          return self.waitForTransitionToEnd()
          .then(() => {
            save()
          })
          .catch(function(err) {
            debugger
          })
        }
        // Trigger painting before send. for that set ROOT_HASH to some temporary value like NONCE
        // and reset it after the real root hash will be known
        let isNew = returnVal[ROOT_HASH] == null
        let isForm = self.getModel(returnVal[TYPE]).value.subClassOf === FORM
        if (isNew)
          returnVal[ROOT_HASH] = returnVal[NONCE]
        else if (isForm) {
          let prevRes = list[returnVal[TYPE] + '_' + returnVal[ROOT_HASH] + '_' + returnVal[CUR_HASH]].value
          if (utils.compare(returnVal, prevRes)) {
            self.trigger({action: 'noChanges'})
            return
          }
          returnVal[PREV_HASH] = returnVal[CUR_HASH]
          returnVal[CUR_HASH] = returnVal[NONCE]
        }

        var returnValKey = utils.getId(returnVal)

        self._setItem(returnValKey, returnVal)

        let org = list[utils.getId(returnVal.to)].value.organization
        let orgId = utils.getId(org)
        self.addMessagesToChat(orgId, returnVal)

        var params;
        if (returnVal[TYPE] === GUEST_SESSION_PROOF) {
          org = list[utils.getId(org)].value
          params = {action: 'getForms', to: org}
        }
        else {
          params = {
            action: 'addItem',
            resource: utils.clone(returnVal)
          }
        }
        var m = self.getModel(returnVal[TYPE]).value

        // if (m.subClassOf === FORM)
        //   params.sendStatus = sendStatus


//         var to = returnVal.to
//         Object.defineProperty(returnVal, 'to', {
//           get: function () {
//             return to
//           },
//           set: function () {
//             debugger
//             console.log('yay!')
//           }
//         })

//         var organization = to.organization
//         Object.defineProperty(to, 'organization', {
//           get: function () {
//             return organization
//           },
//           set: function () {
//             debugger
//             console.log('yay!')
//           }
//         })

        try {
          self.trigger(params);
        } catch (err) {
          debugger
        }

        return self.waitForTransitionToEnd()
        .then(function () {
          let rId = utils.getId(returnVal.to)
          let to = list[rId].value

          var toChain = {}
          if (!isNew) {
            // returnVal[PREV_HASH] = returnVal[CUR_HASH] || returnVal[ROOT_HASH]
            toChain[PREV_HASH] = returnVal[PREV_HASH]
          }

          let exclude = ['to', 'from', 'verifications', CUR_HASH, 'sharedWith', '_sendStatus']
          if (isNew)
            exclude.push(ROOT_HASH)
          extend(toChain, returnVal)
          for (let p of exclude)
            delete toChain[p]

          toChain.time = returnVal.time

          var key = IDENTITY + '_' + to[ROOT_HASH]

          let sendParams = self.packMessage(returnVal, toChain)

          return meDriver.signAndSend(sendParams)
          // return meDriver.signAndSend({
          //   object: toChain,
          //   to: { fingerprint: self.getFingerprint(list[key].value) }
          // })
        })
        .then(function (result) {
          // TODO: fix hack
          // we now have a real root hash,
          // scrap the placeholder
          // if (isNew ||  !shareWith)
          if (isNew  ||  isForm) {
            delete list[returnValKey]
            self.deleteMessageFromChat(orgId, returnVal)

          }

          returnVal[CUR_HASH] = result.object.link
          returnVal[ROOT_HASH] = result.object.permalink
          var sendStatus = (self.isConnected) ? SENDING : QUEUED
          returnVal._sendStatus = sendStatus

//           let org = list[utils.getId(returnVal.to)].value.organization
//           self.addMessagesToChat(utils.getId(org), returnVal)
          delete returnVal.sharedWith
          delete returnVal.verifications
          // if (shareWith) {
          //   let oldValue = list[returnValKey]
          //   for (let p in shareWith) {
          //     if (shareWith[p])
          //       this.onShare(returnVal, list[p].value)
          //   }
          // }
          return save(true)
        })
        .then(() => {
          let rId = utils.getId(returnVal.to)
          let to = list[rId].value

          if (!isNew  ||  self.getModel(returnVal[TYPE]).value.subClassOf !== FORM)
            return
          let allFormRequests = self.searchMessages({modelName: FORM_REQUEST, to: to})
          let formRequests = allFormRequests  &&  allFormRequests.filter((r) => {
            if (r.document === returnVal[NONCE])
              return true
          })
          if (formRequests  &&  formRequests.length) {
            let req = formRequests[0]
            req.document = utils.getId(returnVal)
            returnVal = req
            save(true)
          }
        })
      }
      function save (noTrigger) {
        return self._putResourceInDB({
          type: returnVal[TYPE],
          resource: returnVal,
          roothash: returnVal[ROOT_HASH],
          isRegistration: isRegistration,
          noTrigger: noTrigger
        })
      }
    })
  },
  isSwitchingToEmployeeMode(resource) {
    if (resource[TYPE] !== PROFILE  ||  !resource.organization)
      return
    let org = list[utils.getId(resource)].value.organization
    let newOrgId = utils.getId(resource.organization)
    let settingOrg = !org || utils.getId(org) !== newOrgId
    if (settingOrg) {
      let o = SERVICE_PROVIDERS.filter((r) => {
        return r.org == newOrgId ? true : false
      })
      if (o  &&  o.length)
        return true
    }
    else if (org) {
      let result = this.searchMessages({to: me, modelName: MY_EMPLOYEE_PASS})
      if (!result)
        return true
      let meOrgId = utils.getId(me.organization)
      let repId = utils.getId(this.getRepresentative(meOrgId))
      let fresult = result.some((r) => {
        return repId === utils.getId(r.to)
      })
      return fresult.length
    }
  },
  onGetMe() {
    this.trigger({action: 'getMe', me: me})
  },
  onCleanup() {
    // var me  = utils.getMe()
    if (!me)
      return
    var result = this.searchMessages({to: me, modelName: CUSTOMER_WAITING, isForgetting: true});
    if (!result)
      return
    if (result.length)
      delete result[result.length - 1]

    return this.cleanup(result)
    .then(() => {
      result = this.searchMessages({to: me, modelName: PRODUCT_LIST, isForgetting: true});
      if (result  &&  result.length) {
        delete result[result.length - 1]
        return this.cleanup(result)
      }
    })

  },
  onShare(resource, shareWithList, formResource) {
    if (!Array.isArray(shareWithList))
      return this.onShareOne(resource, shareWithList, formResource)
    let promisses = []
    shareWithList.forEach((r) => {
      promisses.push(this.onShareOne(resource, list[r].value))
    })
    Q.all(promisses)
    .then((results) => {
      debugger
    })
  },

  onShareOne(resource, to, formResource) {
    var self = this
    var toOrgId
    if (to[TYPE] === ORGANIZATION) {
      toOrgId = utils.getId(to)
      to = this.getRepresentative(ORGANIZATION + '_' + to[ROOT_HASH])
    }
    else
      toOrgId = utils.getId(to.organization)
    if (!to)
      return

    var ikey = IDENTITY + '_' + to[ROOT_HASH]
    var opts = {
      to: {fingerprint: this.getFingerprint(list[ikey].value)},
      // share seal if it exists
      seal: true
    }

    var promise = meDriver.send({...opts, link: resource.document[CUR_HASH]})
    return promise
    .then(function () {
      return resource[CUR_HASH] ? meDriver.send({...opts, link: resource[CUR_HASH]}) : Q()
      // return meDriver.send({...opts, link: resource.document[ROOT_HASH]})
    })
    .then(function() {
      var key = utils.getId(formResource)
      var r = list[key].value
      r.documentCreated = true
      if (r[TYPE] === FORM_REQUEST)
        r.document = resource[TYPE] === VERIFICATION
                   ? utils.getId(resource.document)
                   : utils.getId(resource)

      var batch = []
      batch.push({type: 'put', key: key, value: r})
      var toId = utils.getId(to)
      var time = new Date().getTime()
      // let sh = {
      //   [TYPE]: SHARED_RESOURCE,
      //   [ROOT_HASH]: self.getNonce(),
      //   resource: self.buildRef(resource),
      //   from: resource.from,
      //   to: resource.to,
      //   time: time
      // }
      // batch.push({type: 'put', key: utils.getId(sh), value: sh})
      if (resource[ROOT_HASH]) {
        key = utils.getId(resource)
        var ver = list[key].value
        if (!ver.sharedWith)
          ver.sharedWith = []

        ver.sharedWith.push(self.createSharedWith(toId, time))
        utils.optimizeResource(ver)
        batch.push({type: 'put', key: key, value: ver})
      }
      var formId = utils.getId(resource.document)
      var form = list[formId].value
      if (!form.sharedWith) {
        form.sharedWith = []
        form.sharedWith.push(self.createSharedWith(utils.getId(form.to), form.time))
      }

      form.sharedWith.push(self.createSharedWith(toId, time))
      self.addMessagesToChat(toOrgId, form, false, time)
      if (ver)
        self.addMessagesToChat(toOrgId, ver, false, time)

      utils.optimizeResource(form)
      self.addLastMessage(form, batch, to)
      batch.push({type: 'put', key: formId, value: form})
      return db.batch(batch)
    })
//     .then(() => {
//       self.trigger({action: 'list', list: self.searchNotMessages({modelName: ORGANIZATION, to: resource})})
//     })
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
  onRequestWipe() {
    Alert.alert(translate('areYouSureAboutWipe'), '', [
      {
        text: 'Cancel',
        onPress: () => {}
      },
      {
        text: 'OK',
        onPress: () => Actions.reloadDB()
      }
    ])
  },
  wipe() {
    if (utils.isWeb()) {
      return this.wipeWeb()
    } else {
      return this.wipeMobile()
    }
  },

  wipeWeb() {
    if (localStorage) localStorage.clear()
    if (sessionStorage) sessionStorage.clear()
    if (leveldown.destroyAll) return leveldown.destroyAll()
  },

  wipeMobile() {
    return Q.all([
      AsyncStorage.clear(),
      utils.resetPasswords()
    ])
    .then(() => AsyncStorage.getAllKeys())
    .then(keys => console.log('AsyncStorage has ' + keys.length + ' keys'))
  },
  onReloadDB() {
    var self = this

    var destroyTim = meDriver ? meDriver.destroy() : Q()
    return destroyTim
      .then(() => this.wipe())
      .then(() => {
        // Alert.alert('please refresh')
        return utils.restartApp()// Q.Promise(function (resolve) {})
      })
      // .then(function() {
      //   list = {};
      //   models = {};
      //   me = null;
      //   return
      //   // return self.loadModels()
      // })
      // .then(function() {
      //   self.trigger({action: 'reloadDB', models: models});
      // })
      // .catch(function(err) {
      //   err = err;
      // });
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
    var self = this;
    if (isLoaded)
      this.getList(params);
    else {
      this.loadDB()
      .then(function() {
        isLoaded = true;
        if (params.modelName)
          self.getList(params);
      });
    }
  },
  getList(params) {
    var meta = this.getModel(params.modelName).value;
    var isMessage = meta.isInterface  ||  (meta.interfaces  &&  meta.interfaces.indexOf(MESSAGE) != -1);
    if (!isMessage) {
      params.fromView = true
      let result = this.searchNotMessages(params);
      if (!result) {
        // First time. No connection no providers yet loaded
        if (!this.isConnected  &&  params.modelName === ORGANIZATION)
          this.trigger({action: 'list', alert: translate('noConnection')})

        return
      }
      if (params.isAggregation)
        result = this.getDependencies(result);
      var shareableResources;
      var retParams = {
        action: 'list',
        list: result,
        spinner: params.spinner,
        isAggregation: params.isAggregation
      }
      if (params.prop)
        retParams.prop = params.prop;
      this.trigger(retParams);
      return
    }

    return this._searchMessages(params)
    .then((result) => {
      if (!result)
        return
      if (params.isAggregation)
        result = this.getDependencies(result);

      var retParams = {
        action: !params.prop ? 'messageList' : 'list',
        list: result,
        spinner: params.spinner,
        isAggregation: params.isAggregation
      }
      var shareableResources;
      let hasMore = params.limit  &&  result.length > params.limit
      if (params.loadEarlierMessages || hasMore) {
        if (hasMore)  {
          result.splice(0, 1)
          retParams.allLoaded = true
        }
        retParams.loadEarlierMessages = true
      }
      if (!params.isAggregation  &&  params.to) {
        // let to = list[utils.getId(params.to)].value
        // if (to  &&  to[TYPE] === ORGANIZATION)
          shareableResources = this.getShareableResources(result, params.to)
      }
      if (params.to) {
        let orgId
        if (params.to.organization)
          orgId = utils.getId(params.to.organization)
        else {
          if (params.to[TYPE] === ORGANIZATION)
            orgId = utils.getId(params.to)
        }
        if (orgId) {
          let rep = this.getRepresentative(orgId)
          if (rep  &&  !rep.bot)
            retParams.isEmployee = true
        }
      }

      if (shareableResources)
        retParams.shareableResources = shareableResources;
      if (params.prop)
        retParams.prop = params.prop;
      this.trigger(retParams);
    })
  },
  getList1(params) {
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

    var resultList = result
    var shareableResources;
    var retParams = {
      action: isMessage  &&  !params.prop ? 'messageList' : 'list',
      list: resultList,
      spinner: params.spinner,
      isAggregation: params.isAggregation
    }
    if (isMessage) {
      let hasMore = params.limit  &&  result.length > params.limit
      if (params.loadEarlierMessages || hasMore) {
        if (hasMore)  {
          result.splice(0, 1)
          retParams.allLoaded = true
        }
        retParams.loadEarlierMessages = true
      }
      if (!params.isAggregation  &&  params.to) {
        // let to = list[utils.getId(params.to)].value
        // if (to  &&  to[TYPE] === ORGANIZATION)
          shareableResources = this.getShareableResources(result, params.to)
      }
      if (params.to) {
        let orgId
        if (params.to.organization)
          orgId = utils.getId(params.to.organization)
        else {
          if (params.to[TYPE] === ORGANIZATION)
            orgId = utils.getId(params.to)
        }
        if (orgId) {
          let rep = this.getRepresentative(orgId)
          if (rep  &&  !rep.bot)
            retParams.isEmployee = true
        }
      }
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
    if (isMessage)
      return this._searchMessages(params);
    else {
      params.fromView = true
      return this.searchNotMessages(params);
    }
  },
  onListSharedWith(resource, chat) {
    let sharedWith = resource.sharedWith
    if (!sharedWith)
      return null
    let chatId = utils.getId(chat)
    let shareWithMapping = {}
    let result = []
    sharedWith.forEach((r) => {
      let bot = list[r.bankRepresentative].value
      let org = list[utils.getId(bot.organization)].value
      if (utils.getId(org) === chatId)
        return
      result.push(org)
      shareWithMapping[r.bankRepresentative] = org
    })
    this.trigger({action: 'listSharedWith', list: result, sharedWith: shareWithMapping})
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
    let sortProp = params.sortProperty
                 ? params.sortProperty
                 : isOrg  &&  !params.sortProperty ? LAST_MESSAGE_TIME : null

    var isIdentity = modelName === PROFILE;
    // to variable if present is a container resource as for example subreddit for posts or post for comments
    // if to is passed then resources only of this container need to be returned
    if (to) {
      for (var p in props) {
        if (props[p].ref  &&  props[p].ref === to[TYPE]) {
          containerProp = p;
          resourceId = utils.getId(to)
        }
      }
    }
    var query = params.query;

    var required = meta.required;
    var meId = me ? utils.getId(me) : null
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
      else if (params.fromView  &&  isIdentity  &&  r.bot)
        continue
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
        foundResources[key] = r
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
        foundResources[key] = r
      }
    }
    // Don't show current 'me' contact in contact list or my identities list
    if (!containerProp  &&  me  &&  isIdentity) {
      if (sampleData.getMyId())
        delete foundResources[utils.getId(me)];
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
    // if (isIdentity) {
    //   result.forEach(function(r) {
    //     if (r.organization) {
    //       var res = list[utils.getId(r.organization.id)];
    //       if (res  &&  res.value) {
    //         var photos = res.value.photos;
    //         if (photos)
    //           r.organization.photo = photos[0].url;
    //       }
    //     }
    //   });
    // }
    if (isIdentity  && !params.all && me.isEmployee) {
      let retPeople = []
      // Filter out the employees of other service providers from contact list
      // This will go away when thru-bot communications will deployed
      result.forEach((r) => {
        if (!r.organization) {
          retPeople.push(r)
          return
        }
        let orgId = utils.getId(r.organization)
        if (r.isEmployee  &&  utils.getId(r.organization) !== orgId) {
          let orgs = SERVICE_PROVIDERS.filter((rr) => {
            return rr.org === orgId ? true : false
          })
          if (!orgs.length)
            retPeople.push(r)
        }
      })
      result = retPeople
    }
    if (result.length === 1)
      return result
    // var sortProp = params.sortProperty;
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
  _searchMessages(params) {
    return this._loadedResourcesDefer.promise
      .then(() => {
        return this.searchMessages(params)
      })
  },
  searchMessages(params) {
    var query = params.query;
    var modelName = params.modelName;
    var meta = this.getModel(modelName).value;
    var prop = params.prop;
    if (typeof prop === 'string')
      prop = meta[prop];
    var backlink = prop ? (prop.items ? prop.items.backlink : prop) : null;
    var foundResources = [];
    var props = meta.properties;

    // var required = meta.required;
    var meId = utils.getId(me)
    var meOrgId = me.isEmployee ? utils.getId(me.organization) : null;

    var chatTo = params.to
    if (chatTo  &&  chatTo.id)
      chatTo = list[utils.getId(chatTo)].value
    var chatId = chatTo ? utils.getId(chatTo) : null;
    var isChatWithOrg = chatTo  &&  chatTo[TYPE] === ORGANIZATION;
    var toOrgId
    var toOrg
    let thisChatMessages

    if (isChatWithOrg) {
      var rep = this.getRepresentative(chatId)
      if (!rep)
        return
      chatTo = rep
      chatId = utils.getId(chatTo)
      // isChatWithOrg = false
      toOrgId = utils.getId(params.to)
      toOrg = list[toOrgId].value
      thisChatMessages = chatMessages[toOrgId]
    }
    else {
      if (chatTo) {
        if (chatTo.organization  &&  !meOrgId) {
          toOrgId = utils.getId(chatTo.organization)
          thisChatMessages = chatMessages[toOrgId]
        }
        else
          thisChatMessages = chatMessages[utils.getId(chatTo)]
      }
//       else if (chatId === meId) {
// console.log('What are we doing here!!! chatId: ' + chatId)
//         thisChatMessages = chatMessages[chatId]
//       }
    }
    if (!thisChatMessages  &&  (!params.to  ||  chatId === meId)) {
      thisChatMessages = []
      Object.keys(list).filter((key) => {
        let type = list[key].value[TYPE]
        let m = this.getModel(type)
        if (!m)
          return false
        if (type === modelName                      ||
           m.value.subClassOf === modelName         ||
           (modelName === MESSAGE  &&  m.value.interfaces)) {
          thisChatMessages.push({id: key, time: list[key].value.time})
          return true
        }
      })
    }

    if (!thisChatMessages  ||  !thisChatMessages.length)
      return null
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
    // var lastPL
    // var sharedWithTimePairs = []
    var from = params.from
    var limit = params.limit ? params.limit + 1 : null
    var isAllMessages = meta.isInterface;
    var implementors = isAllMessages ? utils.getImplementors(modelName) : null;
    var isVerification = modelName === VERIFICATION  ||  meta.subClassOf === VERIFICATION;

    // for (var key in list) {
    let lastId = params.lastId
    let ii = thisChatMessages.length - 1
    if (lastId) {
      for (; ii>=0; ii--) {
        if (thisChatMessages[ii].id === lastId) {
          ii--
          break
        }
      }
    }
    let resourceId = params.resource ? utils.getId(params.resource) : null
    for (let i=ii; i>=0; i--) {
      var key = thisChatMessages[i].id
      var iMeta = null;
      if (isAllMessages)
        iMeta = utils.getModel(key.split('_')[0]).value
      else if (list[key].value[TYPE] !== modelName) {
        var rModel = this.getModel(list[key].value[TYPE])
        if (!rModel)
          continue
        rModel = rModel.value;
        // Checks for the first level of subClasses
        if (rModel.subClassOf !== modelName)
          continue;
      }
      if (!iMeta)
        iMeta = meta;
      var r = list[key].value;
      if (r.canceled)
        continue;
      var isFormError = isAllMessages && r[TYPE] === FORM_ERROR
      // Make sure that the messages that are showing in chat belong to the conversation between these participants
      if (isVerification) {
        if (r.document) {
          var d = list[utils.getId(r.document)]
          if (!d)
            continue

          if (params.resource  &&  resourceId !== meId  && utils.getId(params.resource) !== utils.getId(d.value))
            continue
          r.document = d.value;
        }
      }
      else if (isFormError)
        r.prefill = list[utils.getId(r.prefill)] ? list[utils.getId(r.prefill)].value : r.prefill

      // HACK to not show service message in customer stream
      else if (r.message  &&  r.message.length)  {
        if (r[TYPE] === SELF_INTRODUCTION  &&  !params.isForgetting && (utils.getId(r.to) !== meId))
          continue
        if (r.message === '[already published](tradle.Identity)')
          continue
        var m = utils.splitMessage(r.message)

        if (m.length === 2) {
          if (m[1] === PROFILE)
            continue;
        }
        if (chatTo.organization  &&  r[TYPE] === constants.TYPES.CUSTOMER_WAITING) {
          var rid = utils.getId(chatTo.organization);

          var org = list[utils.getId(r.to)].value.organization
          var orgId = utils.getId(org)
          if (!utils.isEmployee(list[utils.getId(chatTo.organization)].value))
            continue;
        }

      }

      var isSharedWith = false, timeResourcePair = null
      if (r.sharedWith  &&  toOrgId) {
        var sharedWith = r.sharedWith.filter(function(r) {
          let org = list[r.bankRepresentative].value.organization
          return (org) ? utils.getId(org) === toOrgId : false
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
        // backlinks like myVerifications, myDocuments etc. on Profile
        if (backlink  &&  r[backlink]) {
          var s = params.resource ? utils.getId(params.resource) : chatId
          if (s === utils.getId(r[backlink])) {
            foundResources.push(r)
            // for Loading earlier resources we don't need to check limit untill we get to the lastId
            if (limit  &&  foundResources.length === limit)
              break
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
        // var fromID = utils.getId(r.from);
        var toID = utils.getId(r.to);

        if (params.strict) {
          if (chatId !== toID)
            continue
        }
      }
      if (params.strict  &&  chatId !== utils.getId(r.to))
        continue

      if (r.sharedWith  &&  toOrgId  &&  !isSharedWith)
        continue
      if (isVerificationR  ||  r[TYPE] === ADDITIONAL_INFO) {
        var doc = {};
        var rDoc = list[utils.getId(r.document)]
        if (!rDoc) {
          if (params.isForgetting)
            foundResources.push(r)
          continue
        }

        // TODO: check if we can copy by reference
        for (var p in rDoc.value) {
          if (p === 'verifications' || p === 'additionalInfo') continue

          var val = rDoc.value[p]
          switch (typeof val) {
            case 'object':
              if (val) {
                if (Array.isArray(val))
                  doc[p] = val.slice(0)
                else
                  doc[p] = extend(true, {}, val)
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
        // foundResources[key] = msg;
        foundResources.push(msg)
        if (limit  &&  foundResources.length === limit)
          break

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
        // foundResources[key] = this.fillMessage(r);
        foundResources.push(this.fillMessage(r))

        if (limit  &&  foundResources.length === limit)
          break
      }
    }
    if (!foundResources.length)
      return
    return foundResources.reverse()
  },

  getSearchResult(result) {
    return result.map((r) => {
      return r.value
    })
  },

  fillMessage(r) {
    return r

    var resource = {};
    extend(resource, r);
    if (!r.verifications  ||  !r.verifications.length)
      return resource;
    for (var i=0; i<resource.verifications.length; i++) {
      var v = resource.verifications[i];
      var vId = utils.getId(v)
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
    var meId = utils.getId(me)
    var simpleLinkMessages = {}
    var meId = utils.getId(utils.getMe())
    for (var i=0; i<foundResources.length; i++) {
      var r = foundResources[i]
      if (me  &&  utils.getId(r.to) !== meId  &&  utils.getId(r.from) !== meId)
        continue;
      // documentCreated identifier is set when the document of this type was created
      // and we don't want to create it again from this same notification
      if (r[TYPE] !== FORM_REQUEST  ||  r.documentCreated)
        continue;
      if (utils.getId(r.to)  !==  meId)
        continue
      // var msgParts = utils.splitMessage(r.message);
      // // Case when the needed form was sent along with the message
      // if (msgParts.length !== 2)
      //   continue;
      // Case when customer already has resource to SHARE on the screen but accidentally
      // or otherwise clicked on PRODUCT list link. To avoid the multiple shares
      // of the same resource with the same financial institution
      // let rr = simpleLinkMessages[msgParts[1]]
      let rr = simpleLinkMessages[r.form]
      if (rr) {
        rr.documentCreated = true
        list[utils.getId(rr)].value.documentCreated = true
        continue
      }
      simpleLinkMessages[r.form] = r
      var msgModel = this.getModel(r.form);
      if (msgModel  &&  msgModel.value.subClassOf !== MY_PRODUCT)
        verTypes.push(msgModel.value.id);
    }
    var shareableResources = {};
    var shareableResourcesRootToR = {}

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
        if (shareableResourcesRootToR[r[ROOT_HASH]]) {
          let arr = shareableResources[r[TYPE]]
          let skip
          for (let i=0; i<arr.length  &&  !skip; i++) {
            if (r[ROOT_HASH] === rr[ROOT_HASH]) {
              if (r.time < rr.time)
                skip = true
              else
                arr.splice(i, 1)
            }
          }
          if (skip)
            return
        }
        let rr = {
          [TYPE]: VERIFICATION,
          document: r,
          organization: list[utils.getId(r.from)].value.organization
        }

        addAndCheckShareable(rr)
      })
    }
    if (!verTypes.length)
      return shareableResources

    let toId = utils.getId(to)
    var l = this.searchMessages({modelName: VERIFICATION})
    if (l)
      l.forEach((val) => {
        var doc = val.document
        var docType = (doc.id && doc.id.split('_')[0]) || doc[TYPE];
        if (verTypes.indexOf(docType) === -1)
          return;
        var id = utils.getId(val.to.id);
        if (id !== meId)
          return
        // Filter out the verification from the same company
        var fromId = utils.getId(val.from)
        var fromOrgId = utils.getId(list[fromId].value.organization)
        if (fromOrgId === toId)
          return
        var document = doc.id ? list[utils.getId(doc.id)]  &&  list[utils.getId(doc.id)].value : doc;
        if (!document)
          return;
        if (to  &&  org  &&  document.verifications) {
          var thisCompanyVerification;
          for (var i=0; i<document.verifications.length; i++) {
            var v = list[utils.getId(document.verifications[i])].value;

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
          // if (thisCompanyVerification)
          //   return;
        }
        var value = {};
        extend(value, val);
        value.document = document;

        addAndCheckShareable(value)
      })
    // Allow sharing non-verified forms
    verTypes.forEach((verType) => {
      var l = this.searchNotMessages({modelName: verType, notVerified: true})
      if (!l)
        return
      l.forEach((r) => {
        let rr = {
          [TYPE]: VERIFICATION,
          document: r,
          organization: list[utils.getId(r.to)].value.organization
        }
        addAndCheckShareable(rr)
      })
    })

    return shareableResources
    // Allow sharing only the last version of the resource
    function addAndCheckShareable(verification) {
      let r = verification.document
      // Allow sharing only of resources that were filled out by me
      // if (utils.getId(r.from) !== utils.getId(me))
      //   return
      let docType = r[TYPE]
      var v = shareableResources[docType];
      if (!v)
        shareableResources[docType] = [];
      else if (shareableResourcesRootToR[r[ROOT_HASH]]) {
        let arr = shareableResources[r[TYPE]]
        for (let i=0; i<arr.length; i++) {
          let rr = arr[i].document
          if (r[ROOT_HASH] === rr[ROOT_HASH]) {
            if (r.time < rr.time)
              return
            else
              arr.splice(i, 1)
          }
        }
      }
      // Check that this is not the resource that was send to me as to an employee
      if (utils.getId(r.to) !== meId) {
        shareableResources[docType].push(verification)
        shareableResourcesRootToR[r[ROOT_HASH]] = r
      }
    }
  },

  getNonce() {
    return crypto.randomBytes(32).toString('hex')
  },
  _putResourceInDB(params) {
    var self = this;
    var modelName = params.type
    var value = params.resource
    var dhtKey = params.roothash
    var isRegistration = params.isRegistration
    var noTrigger = params.noTrigger
    // Cleanup null form values
    for (var p in value) {
      if (!value[p]  &&  (typeof value[p] === 'undefined'))
        delete value[p];
    }
    if (!value[TYPE])
      value[TYPE] = modelName;

    var model = this.getModel(modelName).value;
    var props = model.properties;
    var newLanguage

    var isMessage = model.isInterface  ||  (model.interfaces  &&  model.interfaces.indexOf(MESSAGE) != -1)
    var originalR = list[utils.getId(value)]
    var isNew = !value[ROOT_HASH] || !value[CUR_HASH] || (!isMessage  &&  !originalR)
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
    else if (isNew)
      value[CUR_HASH] = dhtKey //isNew ? dhtKey : value[ROOT_HASH]

    var batch = [];
    if (isNew) {
      var creator =  me
                  ?  me
                  :  isRegistration ? value : null;
      // if (creator)
      //   value[constants.OWNER] = this.buildRef(creator)

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
    if (isMessage) {
      let isForm = model.subClassOf === FORM
      if (/*isNew  &&*/  isForm) {
        if (!value.sharedWith)
          value.sharedWith = []
        value.sharedWith.push(this.createSharedWith(utils.getId(value.to), new Date().getTime()))
      }
      if (!isNew  &&  isForm) {
        let prevRes = list[value[TYPE] + '_' + value[ROOT_HASH] + '_' + value[PREV_HASH]]
        if (prevRes) {
          prevRes = prevRes.value
          prevRes[NEXT_HASH] = value[CUR_HASH]
          utils.optimizeResource(prevRes)
          batch.push({type: 'put', key: utils.getId(prevRes), value: prevRes})
        }
      }

      if (props['to']  &&  props['from'])
        self.addLastMessage(value, batch)
    }
    var iKey = utils.getId(value) //modelName + '_' + value[ROOT_HASH];
    batch.push({type: 'put', key: iKey, value: value});

    var mid;

    if (isRegistration) {
      this.registration(value)
      return
    }

    if (value[TYPE] === SETTINGS)
      return this.addSettings(value)

    let meId = utils.getId(me)

    db.batch(batch)
    .then(function() {
      return db.get(iKey)
    })
    .then(function(value) {
      self._setItem(iKey, value)
      if (isMessage) {
        let toId = utils.getId(value.to)
        if (toId === meId)
          toId = utils.getId(value.from)

        let org = list[toId].value.organization
        self.addMessagesToChat(utils.getId(org), value)
      }
      if (mid)
        self._setItem(MY_IDENTITIES, mid)
      else if (!isNew  &&  iKey === meId) {
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
  addLastMessage(value, batch, sharedWith) {
    let model = this.getModel(value[TYPE]).value
    if (model.id === CUSTOMER_WAITING || model.id === SELF_INTRODUCTION)
      return
    if (model.id === SIMPLE_MESSAGE  &&  value.message  && value.message === '[already published](tradle.Identity)')
      return

    let to = list[utils.getId(value.to)].value;
    let toId = utils.getId(to)
    if (toId !== meId  &&  to.bot)
      to = list[utils.getId(to.organization)].value

    let dn
    let messageType = model.id
    if (sharedWith) {
      let sharedWithOrg = list[utils.getId(sharedWith.organization)].value
      let orgName = utils.getDisplayName(to, this.getModel(ORGANIZATION).value.properties)
      if (model.subClassOf !== MY_PRODUCT && model.subClassOf !== FORM)
        return
      dn = translate('sharedForm', translate(model), orgName)
      sharedWithOrg.lastMessage = dn
      sharedWithOrg.lastMessageTime = value.time;
      sharedWithOrg.lastMessageType = messageType
      batch.push({type: 'put', key: utils.getId(sharedWithOrg), value: sharedWithOrg});
      this.trigger({action: 'list', list: this.searchNotMessages({modelName: ORGANIZATION}), forceUpdate: true})
      return
    }

    let from = list[utils.getId(value.from)].value;
    let fromId = utils.getId(from)
    let meId = utils.getId(me)
    let isNew = !value[ROOT_HASH] || !list[utils.getId(value)]

    if (fromId !== meId  &&  from.bot)
      from = list[utils.getId(from.organization)].value

    if (model.id === FORM_REQUEST  &&  value.product) {
      let m = this.getModel(value.product).value
      if (m.forms.indexOf(value.form) !== 0)
        return
      dn = translate('formRequest', translate(this.getModel(value.product).value))
      messageType = FINANCIAL_PRODUCT
    }
    else if (model.id === VERIFICATION) {
      let docType = utils.getId(value.document).split('_')[0]
      dn = translate('receivedVerification', translate(this.getModel(docType).value))
    }
    else if (model.subClassOf === MY_PRODUCT)
      dn = translate('receivedProduct', translate(model))
    else if (model.subClassOf === FORM) {
      if (isNew)
        dn = translate('submittingForm', translate(model))
      else if (fromId !== meId)
        dn = translate('receivedForm', translate(model))
      else
        dn = translate('submittingModifiedForm', translate(model))
    }
    else {
      dn = value.message || utils.getDisplayName(value, model.properties);
      if (!dn)
        return
    }
    let r
    if (toId !== meId) {
      r = to
      to.lastMessage = 'You: ' + dn
    }
    else {
      r = from
      from.lastMessage = dn
    }
    r.lastMessageTime = value.time;
    r.lastMessageType = messageType
    batch.push({type: 'put', key: utils.getId(r), value: r});
    this.trigger({action: 'list', list: this.searchNotMessages({modelName: ORGANIZATION}), forceUpdate: true})
  },

  registration(value) {
    var self = this
    isLoaded = true;
    me = value
    // meDriver = null
    var pKey = utils.getId(me)
    var batch = [];
    var publishedIdentity = meDriver.identity
    var mid = {
      [TYPE]: MY_IDENTITIES_TYPE,
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
      var  params = {action: 'addItem', resource: value, me: value};
      self.setMe(me)
      return self.trigger(params);
    })
    .then(function(value) {
      self._setItem(iKey, identity)
      self._setItem(pKey, me)
      if (mid)
        self._setItem(MY_IDENTITIES, mid)
      self.monitorTim()
      // return self.initIdentity(me)
    })
    .catch(function(err) {
      err = err;
    });
  },
  addSettings(value) {
    var self = this
    var v = value.url
    if (v.charAt(v.length - 1) === '/')
      v = v.substring(0, v.length - 1)
    var key = SETTINGS + '_1'
    var togo
    return this.getInfo([v])
    .then(function(json) {
      var settings = list[key]
      if (settings) {
        const curVal = list[key].value
        self._mergeItem(key, { urls: [...curVal.urls, v] })
      }
      else {
        value.urls = SERVICE_PROVIDERS_BASE_URL_DEFAULTS.concat(v)
        self._setItem(key, value)
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
      setTimeout(() => defer.reject('forget me request was timed out'), 10000)
      meDriver.on('message', onMessage)
      return defer.promise

      function onMessage (meta) {
        if (meta[TYPE] === FORGOT_YOU) {
          if (--togo === 0) {
            meDriver.removeListener('message', onMessage)
            defer.resolve()
          }
        }
      }
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
        // var secCodes = this.searchNotMessages({modelName: 'tradle.SecurityCode', to: r})
        var employees = this.searchNotMessages({modelName: PROFILE, prop: 'organization', to: r})

        if (employees) {
          // RABOBANK case
          // if (secCodes) {
          //   var codes = [];
          //   secCodes.forEach(function(sc) {
          //     codes.push(sc.code)
          //   })

          //   for (var i=0; i<employees.length  &&  !pubkeys; i++) {
          //     if (employees[i].securityCode  && codes.indexOf(employees[i].securityCode) != -1) {
          //       pubkeys = list[IDENTITY + '_' + employees[i][ROOT_HASH]].pubkeys
          //     }
          //   }
          // }
          // // LLOYDS case
          // else
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

  // TODO: simplify getDriver to use this
  loadIdentityAndKeys(me) {
    var mePub = me[ROOT_HASH] ? list[IDENTITY + '_' + me[ROOT_HASH]].value.pubkeys : me.pubkeys
    var mePriv
    var identity
    var allMyIdentities = list[MY_IDENTITIES]
    if (allMyIdentities) {
      var all = allMyIdentities.value.allIdentities
      var curId = allMyIdentities.value.currentIdentity
      all.some(id => {
        if (id.id === curId) {
          // currentIdentity = id
          mePriv = id.privkeys
          identity = id.publishedIdentity
          mePub = mePub || identity.pubkeys
          return true
        }
      })
    }

    if (mePub) {
      const lookupKeys = Keychain
        ? Keychain.lookupKeys(mePub)
        : Q.resolve(mePriv.map(k => tradleUtils.importKey(k)))

      return Q.all([
        lookupKeys,
        utils.getPassword(ENCRYPTION_KEY)
      ])
      .spread((keys, encryptionKey) => {
        return { keys, encryptionKey, identity }
      })
    }

    return this.createNewIdentity()
      .spread((encryptionKey, identityInfo) => {
        return {
          ...identityInfo,
          encryptionKey
        }
      })
  },

  getDriver(me) {
    if (driverPromise) return driverPromise

    // var loadIdentityAndKeys
    // var allMyIdentities = list[MY_IDENTITIES]
    // var currentIdentity

    // var mePub = me[ROOT_HASH] ? list[IDENTITY + '_' + me[ROOT_HASH]].value.pubkeys : me.pubkeys
    // var mePriv
    // var publishedIdentity
    // if (allMyIdentities) {
    //   var all = allMyIdentities.value.allIdentities
    //   var curId = allMyIdentities.value.currentIdentity
    //   all.forEach(function(id) {
    //     if (id.id === curId) {
    //       currentIdentity = id
    //       mePriv = id.privkeys
    //       publishedIdentity = id.publishedIdentity
    //       mePub = mePub || publishedIdentity.pubkeys
    //     }
    //   })
    // }
    // // debugger
    // if (!mePub  &&  !mePriv) {
    //   // if (__DEV__  &&  !me.securityCode) {
    //   //   var profiles = {}
    //   //   var identities = {}
    //   //   myIdentity.forEach(function(r) {
    //   //     if (r[TYPE] == IDENTITY)
    //   //       identities[r[ROOT_HASH]] = r
    //   //     else
    //   //       profiles[r[ROOT_HASH]] = r
    //   //   })
    //   //   for (var hash in profiles) {
    //   //     if (!profiles[hash].securityCode  &&  me.firstName === profiles[hash].firstName) {
    //   //       var identity = identities[hash]
    //   //       mePub = identity.pubkeys  // hardcoded on device
    //   //       mePriv = identity.privkeys
    //   //       me[NONCE] = identity[NONCE]
    //   //       break
    //   //     }
    //   //   }
    //   // }
    //   let encryptionKey
    //   loadIdentityAndKeys = this.createNewIdentity()
    //   .spread((eKey, identityInfo) => {
    //     encryptionKey = eKey
    //     publishedIdentity = identityInfo.identity
    //     mePub = publishedIdentity.pubkeys
    //     mePriv = identityInfo.keys
    //     return encryptionKey
    //   })
    //   // const encryptionKey = crypto.randomBytes(32).toString('hex')
    //   // const globalSalt = crypto.randomBytes(32).toString('hex')
    //   // const genIdentity = Q.ninvoke(tradleUtils, 'newIdentity', {
    //   //     networkName,
    //   //     keys: KEY_SET
    //   //   })
    //   //   .then(identityInfo => {
    //   //     publishedIdentity = identityInfo.identity
    //   //     mePub = publishedIdentity.pubkeys
    //   //     mePriv = identityInfo.keys
    //   //   })

    //   // loadIdentityAndKeys = Q.all([
    //   //   utils.setPassword(ENCRYPTION_KEY, encryptionKey).then(() => encryptionKey),
    //   //   genIdentity
    //   // ])
    //   // .spread(encryptionKey => encryptionKey)

    //     // bringing it back!
    //     // if (__DEV__  &&  !keys.some((k) => k.type() === 'dsa')) {
    //     // if (!keys.some((k) => k.type() === 'dsa')) {
    //     //   keys.push(Keys.DSA.gen({
    //     //     purpose: 'sign'
    //     //   }))
    //     // }
    // }
    // else
    //   loadIdentityAndKeys = utils.getPassword(ENCRYPTION_KEY)

    if (me.language)
      language = list[utils.getId(me.language)] && list[utils.getId(me.language)].value

    return driverPromise = this.loadIdentityAndKeys(me)
    .then(result => {
      if (!Keychain) {
        let privkeys = result.keys.map(k => {
          return k.toJSON ? k.toJSON(true) : k
        })
        let myIdentities = list[MY_IDENTITIES]
        if (myIdentities) {
          myIdentities = myIdentities.value


          let currentIdentity = myIdentities.currentIdentity
          myIdentities.allIdentities.forEach((r) => {
             if (r.id === currentIdentity)
               r.privkeys = privkeys
          })
          db.put(MY_IDENTITIES, myIdentities)
        }
        else
          me.privkeys = privkeys
        // me['privkeys'] = result.keys.map(k => {
        //   return k.toJSON ? k.toJSON(true) : k
        // })
      }

      // if (!Keychain) me['privkeys'] = result.keys.map(k => k.toJSON(true))
      me[NONCE] = me[NONCE] || this.getNonce()
      // driverInfo.deviceID = result.deviceID
      return this.buildDriver({
        identity: result.identity,
        keys: result.keys,
        encryption: {
          key: new Buffer(result.encryptionKey, 'hex')
        }
      })
    })
    .then(node => {
      // no need to wait for this to finish
      Push.init({ me, node, Store: this })
      return node
    }, err => {
      debugger
      throw err
    })
    // .then(node => {
    //   if (!me.registeredForPushNotifications) {
    //     return utils.setupPushNotifications({ node })
    //       .then(() => Actions.updateMe({ registeredForPushNotifications: true }))
    //   } else {
    //     return utils.setupPushNotifications({ requestPermissions: false })
    //   }

    //   return node
    // })
  },
  createNewIdentity() {
    const encryptionKey = crypto.randomBytes(32).toString('hex')
    // const globalSalt = crypto.randomBytes(32).toString('hex')
    const genIdentity = Keychain
      ? Keychain.generateNewSet({ networkName })
          .then(keys => Q.ninvoke(tradleUtils, 'newIdentityForKeys', keys))
      : Q.ninvoke(tradleUtils, 'newIdentity', { networkName })

    return Q.all([
      utils.setPassword(ENCRYPTION_KEY, encryptionKey).then(() => encryptionKey),
      genIdentity
    ])
  },

  // makePublishingIdentity(me, pubkeys) {
  //   var meIdentity = new Identity()
  //                       .name({
  //                         firstName: me.firstName,
  //                         formatted: me.firstName + (me.lastName ? ' ' + me.lastName : '')
  //                       })
  //                       .set([NONCE], me[NONCE] || this.getNonce())
  //   if (me.isEmployee) {
  //     var org = this.buildRef(me.organization)
  //     meIdentity.set('organization', org)
  //   }

  //   pubkeys.forEach(meIdentity.addKey, meIdentity)
  //   return meIdentity.toJSON()
  // },

  publishMyIdentity(orgRep) {
    var self = this
    var msg = {
      [TYPE]: IDENTITY_PUBLISHING_REQUEST,
      [NONCE]: self.getNonce(),
      identity: meDriver.identity,
      profile: {
        firstName: me.firstName
      }
    }
    var key = IDENTITY + '_' + orgRep[ROOT_HASH]

    return meDriver.signAndSend({
      object: msg,
      to: { fingerprint: self.getFingerprint(list[key].value) }
    })
    .catch(function(err) {
      debugger
    })
  },
  // loadAddressBook() {
  //   return

  //   var self = this;
  //   return Q.ninvoke(AddressBook, 'checkPermission')
  //   .then(function(permission) {
  //     // AddressBook.PERMISSION_AUTHORIZED || AddressBook.PERMISSION_UNDEFINED || AddressBook.PERMISSION_DENIED
  //     if(permission === AddressBook.PERMISSION_UNDEFINED)
  //       return Q.ninvoke(AddressBook, 'requestPermission')
  //              .then(function(permission) {
  //                if (permission === AddressBook.PERMISSION_AUTHORIZED)
  //                  return self.storeContacts.bind(self);
  //              });
  //     else if (permission === AddressBook.PERMISSION_AUTHORIZED)
  //       return self.storeContacts()
  //     else if (permission === AddressBook.PERMISSION_DENIED) {
  //       //handle permission denied
  //       return
  //     }
  //   })
  // },
  // storeContacts() {
  //   var dfd = Q.defer();
  //   var self = this;
  //   var batch = [];
  //   var props = models[PROFILE].value.properties;
  //   AddressBook.getContacts(function(err, contacts) {
  //     contacts.forEach(function(contact) {
  //       var contactInfo = [];
  //       var newIdentity = {
  //         firstName: contact.firstName,
  //         lastName: contact.lastName,
  //         // formatted: contact.firstName + ' ' + contact.lastName,
  //         contactInfo: contactInfo
  //       };
  //       newIdentity[TYPE] = PROFILE;
  //       var me = list[MY_IDENTITIES];
  //       if (me)  {
  //         var currentIdentity = me.value.currentIdentity;
  //         newIdentity[constants.OWNER] = {
  //           id: currentIdentity,
  //           title: utils.getDisplayName(me, props)
  //         };
  //         // if (me.organization) {
  //         //   var photos = list[utils.getId(me.organization.id)].value.photos;
  //         //   if (photos)
  //         //     me.organization.photo = photos[0].url;
  //         // }
  //       }

  //       if (contact.thumbnailPath  &&  contact.thumbnailPath.length)
  //         newIdentity.photos = [{type: 'address book', url: contact.thumbnailPath}];
  //       var phoneNumbers = contact.phoneNumbers;
  //       if (phoneNumbers) {
  //         phoneNumbers.forEach(function(phone) {
  //           contactInfo.push({identifier: phone.number, type: phone.label + ' phone'})
  //         })
  //       }
  //       var emailAddresses = contact.emailAddresses;
  //       if (emailAddresses)
  //         emailAddresses.forEach(function(email) {
  //           contactInfo.push({identifier: email.email, type: email.label + ' email'})
  //         });
  //       newIdentity[ROOT_HASH] = sha(newIdentity);
  //       newIdentity[CUR_HASH] = newIdentity[ROOT_HASH];
  //       var key = PROFILE + '_' + newIdentity[ROOT_HASH];
  //       if (!list[key])
  //         batch.push({type: 'put', key: key, value: newIdentity});
  //     });
  //     if (batch.length)
  //       // identityDb.batch(batch, function(err, value) {
  //       db.batch(batch, function(err, value) {
  //         if (err)
  //           dfd.reject(err);
  //         else {
  //           self.loadMyResources()
  //           .then(function() {
  //             dfd.resolve();
  //           })
  //         }
  //       });
  //     else
  //       dfd.resolve();
  //   })
  //   return dfd.promise;
  // },
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
      meDriver.on('readseal', function (seal) {
        const link = seal.link
        meDriver.objects.get(link)
          .then(function(obj) {
            if (obj.object[TYPE] === IDENTITY && obj.link === meDriver.link) {
              return
            }

            const wrapper = { ...seal, ...obj }
            save(wrapper)
          })

        function save (wrapper) {
            // return
          const getFromTo = wrapper.type === 'tradle.Message'
            ? Q(wrapper)
            : getAuthorForObject(wrapper)

          return getFromTo
            .then(msgInfo => {
              wrapper.from = { [ROOT_HASH]: msgInfo.author }
              wrapper.to = { [ROOT_HASH]: msgInfo.recipient }
              wrapper = utils.toOldStyleWrapper(wrapper)
              if (!wrapper.objectinfo) {
                wrapper.objectinfo = tradleUtils.pick(wrapper, 'author', 'type', 'link', 'permalink', 'prevlink')
              }

              return self.putInDb(wrapper)
            })
            .catch(function (err) {
              console.error('unable to get message for object', wrapper)
              debugger
            })
        }

        function getAuthorForObject (wrapper) {
          // objects don't really have a from/to
          // so this will need to be redesigned
          const msgStream = meDriver.objects.messagesWithObject({
            permalink: wrapper.permalink,
            link: link
          })

          return Q.all([
            meDriver.addressBook.lookupIdentity({ permalink: wrapper.author }),
            Q.nfcall(collect, msgStream)
          ])
          .spread(function (authorInfo, messages) {
            const match = messages.filter(m => m.author === authorInfo.permalink)[0]
            // if (!match) throw new Error('unable to get message for object')
            if (!match) {
              console.error('unable to get message for object', wrapper)
              throw new Error('unable to get message for object')
            }
            return match
          })
        }
      })

      // meDriver.on('unchained-self', function (info) {
      //   console.log('unchained self!')
      //   // meDriver.lookupObject(info)
      //   // .then(function(obj) {
      //   //   // return
      //     return self.updateMe()
      //   // })
      //   // .catch(function (err) {
      //   //   debugger
      //   // })
      // })

      meDriver.on('error', function (err) {
        debugger
        console.log(err)
      })

      meDriver.on('sent', function (msg) {
        const obj = utils.toOldStyleWrapper(msg)
        var model = self.getModel(obj[TYPE]).value
        var isForm = model.subClassOf === FORM
        // if (isForm  ||  model.id === PRODUCT_APPLICATION) {
          let key = obj[TYPE] + '_' + obj[ROOT_HASH] + (isForm ? '_' +  obj[CUR_HASH] : '')
          var r = list[key]
          if (r) {
            r = r.value
            self.trigger({action: 'updateItem', sendStatus: SENT, resource: r})
            r._sendStatus = SENT
            db.put(key, r)
          }
          // var o = {}
          // extend(o, obj)
          // var from = o.from
          // o.from = o.to
          // o.to = from
          // o.txId = Math.random() + '';
          // setTimeout(() => {
          //   self.putInDb(o)
          // }, 5000);
        // }

        self.maybeWatchSeal(msg)
      })

      meDriver.on('message', function (msg) {
        if (msg.object.object[TYPE] === MESSAGE) {
          return
        }

        const old = utils.toOldStyleWrapper(msg)
        old.to = { [ROOT_HASH]: meDriver.permalink }
        self.putInDb(old, true)
          .then(() => {
            self.trigger({ action: 'receivedMessage', msg: msg })
          }, err => {
            console.error(err)
            debugger
          })

        self.maybeWatchSeal(msg)
      })
    // })
    // return meDriver.ready()
  },

  maybeWatchSeal(msg) {
    const payload = msg.object.object
    const type = payload[TYPE]
    let model = this.getModel(type)
    if (!model) return

    model = model.value
    const sup = model.subClassOf
    let link
    if (type === IDENTITY_PUBLISHING_REQUEST) {
      link = protocol.linkString(payload.identity)
    } else {
      switch (sup) {
      case FORM:
      case MY_PRODUCT:
      case VERIFICATION:
        link = protocol.linkString(payload)
        break
      default:
        return
      }
    }

    let otherGuy = msg.author === meDriver.permalink ? msg.recipient : msg.author
    return meDriver.addressBook.lookupIdentity({ permalink: otherGuy })
      .then(identityInfo => {
        const chainPubKey = tradleUtils.chainPubKey(identityInfo.object)
        return meDriver.watchSeal({
          link: link,
          basePubKey: chainPubKey
        })
      })
      .catch(err => {
        console.error(err)
        debugger
      })

    // meDriver.watchSeal({
    //   link: msg.link,
    //   basePubKey: msg.object.recipientPubKey
    // }).done()
  },

  // updateMe() {
  //   db.put(utils.getId(me), me)
  // },

  putInDb(obj, onMessage) {
    return this._putInDb(obj, onMessage) || Q()
  },
  _putInDb(obj, onMessage) {
    // defensive copy
    var self = this
    var val = extend(true, {}, obj.parsed.data)
    if (!val)
      return

    val[ROOT_HASH] = val[ROOT_HASH]  ||  obj[ROOT_HASH]
    val[CUR_HASH] = obj[CUR_HASH]

    var fromId = obj.objectinfo
               ? obj.objectinfo.author
               : obj.txId ? obj.from[ROOT_HASH] : null
    fromId = PROFILE + '_' + fromId
    var from = list[fromId].value
    var me = utils.getMe()
    if (utils.getId(me) === fromId)
      val.time = val.time || obj.timestamp
    else {
      val.time = new Date().getTime()
      val.sentTime = val.time || obj.timestamp
    }
    // var from = list[PROFILE + '_' + obj.from[ROOT_HASH]].value
    var type = val[TYPE]
    if (type === FORGET_ME) {
      // Alert.alert("Received ForgetMe from " + obj.from[ROOT_HASH])
      this.forgetMe(from)
      return
    }
    if (onMessage  &&  val[TYPE] === FORGOT_YOU) {
      // this.trigger({action: 'messageList', to: me})
      this.forgotYou(from)
      return
    }
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
    var key = utils.getId(val)
    var batch = []
    var representativeAddedTo, noTrigger
    // var isServiceMessage
    if (model.id === IDENTITY)
      representativeAddedTo = this.putIdentityInDB(val, batch)
    else {
      var isMessage = model.interfaces  &&  model.interfaces.indexOf(MESSAGE) != -1
      if (isMessage) {
        noTrigger = this.putMessageInDB(val, obj, batch, onMessage)
        if (type === VERIFICATION)
          return
      }
    }
    if (model.subClassOf === MY_PRODUCT)
      val.sharedWith = [this.createSharedWith(utils.getId(val.from.id), new Date().getTime())]

    self._mergeItem(key, val)
    var retParams = {
      action: isMessage ? 'messageList' : 'list'
    }

    var resultList
    if (isMessage) {
      var toId = PROFILE + '_' + obj.to[ROOT_HASH]
      var meId = PROFILE + '_' + me[ROOT_HASH]
      var isSelfIntroduction = model.id === SELF_INTRODUCTION
      var id = !isSelfIntroduction  &&  toId === meId ? fromId : toId
      var to = list[id].value
      if (!noTrigger) {
        if (to.organization) {
          var org =  list[utils.getId(to.organization)].value
          resultList = this.searchMessages({to: org, modelName: MESSAGE})
        }
        else
          resultList = this.searchMessages({to: to, modelName: MESSAGE})
        retParams.list = resultList
        var shareableResources = this.getShareableResources(resultList, to);
        if (shareableResources)
          retParams.shareableResources = shareableResources
        retParams.resource = to
      }
      // if (to.organization) {
      //    if (!to.bot)
      //     retParams.isEmployee = true
      // }
    }
    else if (!onMessage  &&  val[TYPE] != PROFILE) {
      resultList = this.searchNotMessages({modelName: val[TYPE]})
      retParams.list = resultList
    }

    return db.batch(batch)
    .then(() => {
      // if (onMessage  &&  val[TYPE] === FORGOT_YOU) {
      //   this.forgotYou(from)
      // }

      // else
      if (model.id === PRODUCT_LIST) {
        // var orgList = this.searchNotMessages({modelName: ORGANIZATION})
        // this.trigger({action: 'list', list: orgList, forceUpdate: true})
        this.trigger({action: 'getItem', resource: list[utils.getId(from.organization)].value})
      }

      if (isConfirmation) {
        var fOrg = from.organization
        var org = fOrg ? list[utils.getId(fOrg)].value : null
        var msg = {
          message: me.firstName + ' is waiting for the response',
          [TYPE]: constants.TYPES.CUSTOMER_WAITING,
          from: me,
          to: org,
          time: new Date().getTime()
        }
        this.onAddMessage(msg, true)
      }
      else if (isMessage  &&  !noTrigger)
        this.trigger({action: 'addItem', resource: val})
      else if (representativeAddedTo  &&  !triggeredOrgs) {
        var orgList = this.searchNotMessages({modelName: ORGANIZATION})
        this.trigger({action: 'list', list: orgList, forceUpdate: true})
      }
//       else
        // this.trigger(retParams)
    })
  },
  putIdentityInDB(val, batch) {
    var profile = {}
    // var me = utils.getMe()
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
    let key = utils.getId(val)
    var profileKey = utils.getId(profile)
    let v = list[key] ? list[profileKey].value : null
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
    this._setItem(profileKey, profile)
    var representativeAddedTo
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
        var orgKey = utils.getId(org)
        this._setItem(orgKey, oo)
        batch.push({type: 'put', key: orgKey, value: oo})
        representativeAddedTo = org[ROOT_HASH]
      }
    }
    return representativeAddedTo
  },
  putMessageInDB(val, obj, batch, onMessage) {
    var fromProfile = PROFILE + '_' + (obj.objectinfo ? obj.objectinfo.author : obj.from[ROOT_HASH])
    var fromR = list[fromProfile]

    if (!fromR) {
      if (val[TYPE] !== SELF_INTRODUCTION)
        return
      let name = val.name || (val.identity.name && val.identity.name.formatted)
      fromR = {
        key: fromProfile,
        value: {
          [TYPE]: PROFILE,
          [ROOT_HASH]: obj.objectinfo.author,
          firstName: name ?  name.charAt(0).toUpperCase() + name.slice(1) : 'NewCustomer' + Object.keys(list).length
        }
      }
    }
    let key = utils.getId(val)
    var from = fromR.value

    // if (me  &&  from[ROOT_HASH] === me[ROOT_HASH])
    //   return

    var to = list[PROFILE + '_' + obj.to[ROOT_HASH]].value
    var fOrg = (me  &&  from[ROOT_HASH] === me[ROOT_HASH]) ? to.organization : from.organization
    var org = fOrg ? list[utils.getId(fOrg)].value : null

    if (onMessage) {
      let profileModel = this.getModel(PROFILE).value
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

    // if (onMessage  &&  val[TYPE] === FORGOT_YOU) {
    //   this.forgotYou(from)
    //   return
    // }

    var isProductList = val[TYPE] === PRODUCT_LIST
    var noTrigger
    if (isProductList) {
      var pList = val.list
      // var fOrg = obj.from.identity.toJSON().organization
      // org = list[utils.getId(fOrg)].value
      org.products = []
      pList.forEach((m) => {
        this.addNameAndTitleProps(m)
        models[m.id] = {
          key: m.id,
          value: m
        }
        if (m.subClassOf === FINANCIAL_PRODUCT)
          org.products.push(m.id)
        this.addVerificationsToFormModel(m)
        if (!m[ROOT_HASH])
          m[ROOT_HASH] = sha(m)
        batch.push({type: 'put', key: m.id, value: m})
      })
      utils.setModels(models)
      let orgId = utils.getId(org)
      list[orgId].value = org
      batch.push({type: 'put', key: utils.getId(org), value: org})
      noTrigger = this.hasNoTrigger(orgId)
    }
    if (!val.time)
      val.time = obj.timestamp

    let type = val[TYPE]
    var model = this.getModel(type)  &&  this.getModel(type).value
    let isVerification = type === VERIFICATION  || (model  && model.subClassOf === VERIFICATION)
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
    //   if (!from.lastMessageTime || (new Date() - from.lastMessageTime) > WELCOME_INTERVAL)
    //     batch.push({type: 'put', key: key, value: val})
    // }
    // else {
      if (val[TYPE] === MY_EMPLOYEE_PASS) {
        to.isEmployee = true
        to.organization = this.buildRef(org)
        this.setMe(to)
        batch.push({type: 'put', key: utils.getId(to), value: to})
      }

      this.addLastMessage(val, batch)
    }
    if (list[key]) {
      let v = {}
      extend(true, v, val)
      this._setItem(key, v)
    }
    this.addMessagesToChat(utils.getId(org ? org : from), val)
    batch.push({type: 'put', key: key, value: val})
    return noTrigger
  },
  // if the last message showing was PRODUCT_LIST. No need to re-render
  hasNoTrigger(orgId) {
    let messages = chatMessages[orgId]
    if (!messages)
      return false
    let i=messages.length - 1
    let type
    // Skip all SELF_INTRODUCTION messages since they are not showing anyways on customer screen
    for (; i>=0; i--) {
      type = messages[i].id.split('_')[0]
      if (type  !== SELF_INTRODUCTION)
        break
    }
    if (type === PRODUCT_LIST)
      return true
    // Don't trigger re-rendering the list if the current and previous messages were of PRODUCT_LIST type
    return false
  },
  fillFromAndTo(obj, val) {
    var whoAmI = obj.parsed.data._i.split(':')[0]
    var from = list[PROFILE + '_' + obj.objectinfo.author].value
    var to = list[PROFILE + '_' + obj.to[ROOT_HASH]].value

    if (whoAmI !== from[ROOT_HASH]) {
      // swap from and to
      [from, to] = [to, from]
    }

    val.to = {
      id: utils.getId(to),
      title: to.formatted || to.firstName
    }

    val.from = {
      id: utils.getId(from),
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
  addVerificationsToFormModel(m) {
    if (m.subClassOf !== FORM  ||  m.verifications)
      return
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
  },
  loadMyResources() {
    var self = this;
    var myId = sampleData.getMyId();
    if (myId)
      myId = PROFILE + '_' + myId;

    // console.time('dbStream')
    var orgContacts = {}
    return utils.dangerousReadDB(db)
    .then((results) => {
      if (!results.length)
        return self.loadModels();

      results.forEach((data) => {
        if (data.value == null) return

        if (data.value.type === MODEL) {
          models[data.key] = data;
          self.setPropertyNames(data.value.properties)
          return
        }
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
        self._setItem(data.key, data.value)
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
      this.loadStaticData()

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
      var noModels = utils.isEmpty(models);
      if (noModels)
        return self.loadModels();
      if (me  &&  (!list[me[TYPE] + '_' + me[ROOT_HASH]] || !list[IDENTITY + '_' + me[ROOT_HASH]]))
        me = null
      console.log('Stream closed');
      utils.setModels(models);
    })
    .then(() => {
      if (me  &&  utils.isEmpty(chatMessages))
        this.initChats()
      this._loadedResourcesDefer.resolve()
    })
    .catch(err => {
      debugger
      console.error('err:' + err);
    })
  },
  // Received by employee/bot request from customer. And all the customer resources on FI side gets deleted
  forgetMe(resource) {
    let self = this
    let result = this.searchMessages({modelName: MESSAGE, to: resource, isForgetting: true})
    let batch = []
    let ids = []
    result.forEach((r) => {
      let id = utils.getId(r)
      batch.push({type: 'del', key: id})
      ids.push(id)
    })
    let id = utils.getId(resource)
    ids.push(id)
    batch.push({type: 'del', key: id})
    return db.batch(batch)
    .then(() => {
      ids.forEach((id) => {
        self.deleteMessageFromChat(utils.getId(resource), list[id].value)
        delete list[id]
      })
      self.trigger({action: 'messageList', modelName: MESSAGE, forgetMeFromCustomer: true})
      return meDriver.signAndSend({
        object: { [TYPE]: FORGOT_YOU },
        to: { permalink: resource[ROOT_HASH] }
      })
    })
    .catch((err) => {
      debugger
    })
  },
  // Cleanup and notify customer that FI successfully forgotten him
  forgotYou(resource) {
    var self = this
    var org = list[utils.getId(resource.organization)].value
    var orgId = utils.getId(org)
    var msg = {
      [TYPE]: FORGOT_YOU,
      [NONCE]: this.getNonce(),
      message: translate('youAreForgotten'),
      from: this.buildRef(org),
      to: this.buildRef(me)
    }
    msg.id = sha(msg)

    var reps = this.getRepresentatives(utils.getId(org))
    var promises = []
    reps.forEach((r) =>
      promises.push(meDriver.forget(r[ROOT_HASH]))
    )
    var batch = []
    return Q.allSettled(promises)
    .then(function(result) {
      result.forEach(function(data) {
        if (data.state !== 'fulfilled')
          return
        data.value.forEach(function(r) {
          r = utils.toOldStyleWrapper(r)
          var rId = utils.getId(r)
          var res = list[rId] && list[rId].value
          if (!res) {
            let idx = r[TYPE].indexOf('Confirmation')
            if (idx === -1)
              return
            let realProductType = r[TYPE].substring(0, r[TYPE].length - 'Confirmation'.length)
            let m = utils.getModel(realProductType)
            if (!m  ||  m.value.subClassOf !== FINANCIAL_PRODUCT)
              return
            // This is confirmation for getting the product
            rId = SIMPLE_MESSAGE + '_' +  r[ROOT_HASH]
            res = list[rId]
            if (!res)
              return
            res = res.value
            r = res
          }
          var isVerification = r[TYPE] === VERIFICATION
          var model = self.getModel(r[TYPE]).value
          var isForm = !isVerification  &&  model.subClassOf === FORM
          var deleted = !(res.sharedWith && res.sharedWith.length > 1)
          if (!deleted) {
            var fromId = utils.getId(res.from)
            var toId = utils.getId(res.to)
            var sharedWith = res.sharedWith || []
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
            if (deleted) {
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
          if (deleted) {
            if (res.sharedWith) {
              res.sharedWith.forEach((r) => {
                let org = list[r.bankRepresentative].value.organization
                // self.deleteMessageFromChat(utils.getId(org), res)
              })
            }
            delete list[rId]
            // self.deleteMessageFromChat(orgId, r)
            batch.push({type: 'del', key: rId})
          }
        })
      })
      self.trigger({action: 'messageList', list: [msg], resource: org})
      chatMessages[orgId] = []

      return db.batch(batch)
    })
    .then(function() {
      var result = self.searchMessages({to: org, modelName: MESSAGE, isForgetting: true});
      batch = []
      if (result)
        result.forEach(function(r) {
          let doDelete = r[TYPE] === SELF_INTRODUCTION  ||  (r[TYPE] === SIMPLE_MESSAGE  &&  r.message  &&  r.message.indexOf('Congratulations') === 0)
          if (doDelete) {
            var id = utils.getId(r)
            batch.push({type: 'del', key: id})
            delete list[id]
          }
        })

      // resource.numberOfForms = 0

      // reps.forEach((r) => {
      //   r.lastMessageTime = null
      //   r.lastMessage = null
      //   delete publishRequestSent[utils.getId(r.organization)]
      // })
      delete publishRequestSent[orgId]

      org.lastMessage = null
      org.lastMessageTime = null
      org.lastMessageType = null
      self.trigger({action: 'list', list: self.searchNotMessages({modelName: ORGANIZATION, to: org})})
      batch.push({type: 'put', key: orgId, value: org})
      if (batch.length)
        return db.batch(batch)
    })
    .catch(function(err) {
      debugger
    })
  },

  cleanup(result) {
    var self = this
    if (!result.length)
      return Q()

    var batch = []
    var docs = []
    result.forEach(function(r){
      batch.push({type: 'del', key: utils.getId(r), value: r})
    })
    return db.batch(batch)
    .then(function() {
      result.forEach(function(r) {
        if (this.getModel(r[TYPE]).value.interfaces) {
          let id = (utils.getId(r.from) === meId) ? utils.getId(r.from) : utils.getId(r.to)
          let rep = list[id].value
          let orgId = rep.organization ? utils.getId(rep.organization) : utils.getId(rep)

          self.deleteMessageFromChat(orgId, r)
        }
        delete list[utils.getId(r)]
      })
    })
    .catch(function(err) {
      err = err
    })
  },
  onTalkToRepresentative(resource, org) {
    var self = this
    var orgRep = resource[TYPE] === ORGANIZATION
               ? this.getRepresentative(utils.getId(resource))
               : resource
    if (!orgRep) {
      var msg = {
        [TYPE]: SIMPLE_MESSAGE,
        [NONCE]: this.getNonce(),
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
      [TYPE]: SIMPLE_MESSAGE,
      [NONCE]: this.getNonce(),
      message: 'Representative will be with you shortly. Please tell us how can we help you today?'
    }
    msgFrom.from = this.buildRef(resource)
    msgFrom.to = this.buildRef(me)
    msg.id = sha(msg)
    result.push(msg)
    self.trigger({action: 'messageList', list: result, resource: resource})
    var key = IDENTITY + '_' + orgRep[ROOT_HASH]

    return meDriver.signAndSend({
      object: msg,
      to: { fingerprint: self.getFingerprint(list[key].value) }
    })
  },
  onForgetMe(resource, noTrigger) {
    // var me = utils.getMe()
    var msg = {
      [TYPE]: FORGET_ME,
      [NONCE]: this.getNonce()
    }
    var rId = utils.getId(resource)
    var orgReps = resource[TYPE] === ORGANIZATION
                ? this.getRepresentatives(rId)
                : [resource]

    let promises = []

    for (let rep of orgReps) {
      promises.push(meDriver.signAndSend({
        object: msg,
        to: { fingerprint: this.getFingerprint(list[IDENTITY + '_' + rep[ROOT_HASH]].value) }
      })
    )}

    return Q.all(promises)
    .then((results) => {
      if (noTrigger)
        return
      // var result = this.searchMessages({to: resource, modelName: MESSAGE});
      msg[ROOT_HASH] = results[0].object.permalink
      msg.message = translate('inProgress')
      // reverse to and from to display as from assistent
      msg.from = this.buildRef(list[PROFILE + '_' + results[0].message.recipient].value)
      msg.to = this.buildRef(me)

      let mId = utils.getId(msg)
      list[mId] = {
        key: mId,
        value: msg
      }
      let batch = []

      this.addMessagesToChat(utils.getId(rId), msg)

      batch.push({type: 'put', key: mId, value: msg})
      // result.push(msg)
      this.trigger({action: 'addMessage', to: resource, resource: msg})

      resource.lastMessage = translate('requestedForgetMe')
      resource.lastMessageTime = new Date().getTime()
      resource.lastMessageType = FORGET_ME
      this.trigger({action: 'list', list: this.searchNotMessages({modelName: ORGANIZATION}), forceUpdate: true})

      batch.push({type: 'put', key: rId, value: resource})
      db.batch(batch)
    })
    .catch(function (err) {
      debugger
    })
  },
  // Devices one
  onGenPairingData() {
    if (!SERVICE_PROVIDERS) {
      this.trigger({action: 'genPairingData', error: 'Can\'t connect to server'})
      return
    }
    let pairingData = {
      nonce: crypto.randomBytes(32).toString('base64'),
      identity: meDriver.link,
      firstName: me.firstName,
      rendezvous: {
        url: SERVICE_PROVIDERS[0].url + '/' + SERVICE_PROVIDERS[0].id
      }
    }
    let dbPairingData = utils.clone(pairingData)
    dbPairingData[TYPE] = PAIRING_DATA
    // db.put(PAIRING_DATA + '_1', pairingData)
    list[PAIRING_DATA + '_1'] = {key: PAIRING_DATA + '_1', value: dbPairingData}
    this.trigger({action: 'genPairingData', pairingData: JSON.stringify(pairingData)})
  },

  onSendPairingRequest (pairingData) {
    // device 2 sends pairing request
    let publishedIdentity
    let deviceId

    let myIdentities = list[MY_IDENTITIES]
    if (myIdentities) {
      myIdentities = myIdentities.value
      publishedIdentity = myIdentities.allIdentities[0].publishedIdentity
      deviceId = list[IDENTITY + '_' + pairingData.identity].value.deviceId
    }

    let promise = myIdentities
                ? Q()
                : this.createNewIdentity()
                // : Q.ninvoke(tradleUtils, 'newIdentity', {
                //       networkName,
                //       keys: KEY_SET
                //   })
    return promise
    .spread((encryptionKey, identityInfo) => {
      if (!identityInfo)
        return
      publishedIdentity = identityInfo.identity
      let mePub = publishedIdentity.pubkeys
      let mePriv = identityInfo.keys
      let currentIdentity = PROFILE + '_' + pairingData.identity
      var myIdentities = {
        [TYPE]: MY_IDENTITIES_TYPE,
        currentIdentity: currentIdentity,
        allIdentities: [{
          id: currentIdentity,
          // title: utils.getDisplayName(value, models[me[TYPE]].value.properties),
          privkeys: mePriv,
          publishedIdentity: publishedIdentity
        }]
      }
      var profile = {
        [TYPE]: PROFILE,
        [ROOT_HASH]: pairingData.identity,
        firstName: pairingData.firstName,
        formatted: pairingData.firstName,
      }
      deviceId = identityInfo.link
      var identity = {
        [TYPE]: IDENTITY,
        [ROOT_HASH]: pairingData.identity,
        pubkeys: mePub,
        deviceId: deviceId
      }
      let batch = []
      list[currentIdentity] = {
        key: currentIdentity,
        value: profile
      }
      let identityId = utils.getId(identity)
      list[identityId] = {
        key: identityId,
        value: identity
      }
      list[MY_IDENTITIES] = {
        key: MY_IDENTITIES,
        value: myIdentities
      }
      batch.push({type: 'put', key: MY_IDENTITIES, value: myIdentities})
      batch.push({type: 'put', key: currentIdentity, value: profile})
      batch.push({type: 'put', key: utils.getId(identity), value: identity})
      db.batch(batch)
    })
   .then(() => {
      const pairingReq = {
        [TYPE]: PAIRING_REQUEST,
        identity: publishedIdentity
      }

      const hmac = crypto.createHmac('sha256', pairingData.nonce)
      hmac.update(tradleUtils.stringify(pairingReq))
      pairingReq.auth = hmac.digest('base64')

      const url = pairingData.rendezvous.url
      let transport = driverInfo.wsClients[url]
      if (!transport) {
        let wsClient = this.getWsClient(url, deviceId)
        transport = this.getTransport(wsClient, deviceId)
        driverInfo.wsClients[url] = transport
      }
      let self = this
      transport.on('message', function (msg, from) {
        try {
          const payload = JSON.parse(msg)
          if (payload[TYPE] === PAIRING_RESPONSE) {
            transport.destroy()
            delete driverInfo.wsClients[url]

            return self.onProcessPairingResponse(list[PAIRING_DATA + '_1'].value, payload)
            .then(() => {
              debugger
              Alert.alert('Pairing was successful')
              self.trigger({action: 'pairingSuccessful'})
            })
            .catch((err) => {
              debugger
              Alert.alert(err)
            })
          }
        } catch (err) {
          debugger
        }
      })

      // if (!transport) {
      //   let wsClient = this.getWsClient(url, meDriver.permalink)
      //   transport = this.getTransport(wsClient, meDriver.permalink)
      //   driverInfo.wsClients[url] = transport
      // }
      const pairingReqStr = tradleUtils.stringify(pairingReq)

      function send () {
        return Q.ninvoke(transport, 'send', pairingData.identity, pairingReqStr)
          .then(() => {
            // debugger
            let dbPairingData = utils.clone(pairingData)
            dbPairingData[TYPE] = PAIRING_DATA
            // db.put(PAIRING_DATA + '_1', pairingData)
            list[PAIRING_DATA + '_1'] = {key: PAIRING_DATA + '_1', value: dbPairingData}
          })
          .catch((err) => {
            debugger
          })
      }

      return utils.tryWithExponentialBackoff(send)
    })
      // .then(() => {
      //   this.trigger({action: 'sentPairingRequest', pairingData: pairingData})
      // })
  },

  onProcessPairingRequest(pairingData, pairingReq) {
    const myPubKeys = meDriver.identity.pubkeys
    const alreadyPaired = pairingReq.identity.pubkeys.some(a => {
      return myPubKeys.some(b => {
        return a.pub === b.pub
      })
    })

    const verify = crypto.createHmac('sha256', pairingData.nonce)
    verify.update(tradleUtils.stringify(tradleUtils.omit(pairingReq, 'auth')))
    if (verify.digest('base64') !== pairingReq.auth) {
      return Promise.reject(new Error('invalidPairingRequest'))
    }

    if (alreadyPaired) {
      // won't work because prev is not right
      return sendResponse()
    }

    const allPubKeys = meDriver.identity.pubkeys.concat(pairingReq.identity.pubkeys)
    const pubkeys = allPubKeys.map(pk => tradleUtils.clone(pk))
    let identity = {
            keys: meDriver.keys.concat(pairingReq.identity.pubkeys),
            identity: tradleUtils.clone(meDriver.identity, {
              pubkeys: pubkeys // allPubKeys.map(pk => tradleUtils.clone(pk))
            })
          }
    return Q.ninvoke(meDriver, 'updateIdentity', identity)
    .then(() => {
      let batch = []
      batch.push({type: 'put', key: PAIRING_REQUEST + '_1', value: pairingReq})
      this.updatePubkeys(batch)
      // let batch = []
      // let id = IDENTITY + '_' + utils.getMe()[ROOT_HASH]
      // let myIdentity = list[id].value

      // myIdentity.pubkeys = allPubKeys.map(pk => tradleUtils.clone(pk))

      // updatePubkeys(myIdentity.pubkeys)
      // let myIdentities = list[MY_IDENTITIES].value
      // let currentIdentity = myIdentities.currentIdentity
      // myIdentities.allIdentities.forEach((r) => {
      //   if (r.id === currentIdentity)
      //     r.publishedIdentity.pubkeys = utils.clone(myIdentity.pubkeys)
      // })

      // batch.push({type: 'put', key: MY_IDENTITIES, value: myIdentities})
      // batch.push({type: 'put', key: id, value: myIdentity})
      // batch.push({type: 'put', key: PAIRING_REQUEST + '_1', value: pairingReq})

      // // If pairing request was not verified what do we want to do
      // db.batch(batch)
    })
    .then(() => {
      return sendResponse()
    })

    function sendResponse () {
      const getPrev = meDriver.identity[PREV_HASH] ? Q.ninvoke(meDriver.keeper, 'get',  meDriver.identity[PREV_HASH]) : Promise.resolve(meDriver.identity)
      return getPrev.then(prev => {
        const pairingRes = {
          [TYPE]: PAIRING_RESPONSE,
          // can we make it secure without sending prev?
          prev: prev,
          identity: meDriver.identity
        }

        const url = pairingData.rendezvous.url
        let transport = driverInfo.wsClients[url]
        const pairingResStr = tradleUtils.stringify(pairingRes)
        return utils.tryWithExponentialBackoff(send)

        function send () {
          return Q.ninvoke(transport, 'send', tradleUtils.hexLink(pairingReq.identity), pairingResStr)
            .then(() => {
              db.put(PAIRING_RESPONSE + '_1', pairingRes)
              debugger
            })
            .catch((err) => {
              debugger
            })
        }
      })
    }
  },
  updatePubkeys(batch, identity) {
    let myIdentities = list[MY_IDENTITIES].value
    let currentIdentity = myIdentities.currentIdentity

    let id = currentIdentity.replace(PROFILE, IDENTITY)
    list[id].value = identity || meDriver.identity

    myIdentities.allIdentities.forEach((r) => {
      if (r.id === currentIdentity)
        r.publishedIdentity = list[id].value
    })

    batch.push({type: 'put', key: MY_IDENTITIES, value: myIdentities})
    batch.push({type: 'put', key: id, value: list[id].value})

    // If pairing request was not verified what do we want to do
    db.batch(batch)
  },

  onProcessPairingResponse (pairingData, pairingRes) {
    // device 2 validate response
    if (tradleUtils.hexLink(pairingRes.prev) !== pairingData.identity)
      return Promise.reject(new Error('prev identity does not match expected'))

    let pubkeys = list[IDENTITY + '_' + pairingData.identity].value.pubkeys
    const hasMyKeys = pubkeys.every(myKey => {
      return pairingRes.identity.pubkeys.some(theirKey => {
        return deepEqual(theirKey, myKey)
      })
    })
    // const hasMyKeys = meDriver.identity.pubkeys.every(myKey => {
    //   return pairingRes.identity.pubkeys.some(theirKey => {
    //     return deepEqual(theirKey, myKey)
    //   })
    // })

    if (!hasMyKeys)
      return Promise.reject(new Error(translate('deviceDoesNotHaveMyKeys')))

    let batch = []
    this.updatePubkeys(batch, pairingRes.identity)


    // let myIdentities = list[MY_IDENTITIES].value
    // let currentIdentity = myIdentities.currentIdentity

    // myIdentities.allIdentities.forEach((r) => {
    //   if (r.id === currentIdentity)
    //     r.publishedIdentity.pubkeys = pairingRes.identity.pubkeys
    // })

    // let id = IDENTITY + '_' + pairingData.identity
    // list[id].value.pubkeys = utils.clone(pairingRes.identity.pubkeys)
    // let batch = []
    // batch.push({type: 'put', key: MY_IDENTITIES, value: myIdentities})
    // batch.push({type: 'put', key: id, value: list[id].value})
    // db.batch(batch)

    let me = list[PROFILE + '_' + pairingData.identity].value
    return this.getDriver(me)
    .then(() =>  meDriver.addContact(pairingRes.prev))
    .then(() => {
      Q.ninvoke(meDriver, 'setIdentity', {
        keys: meDriver.keys.concat(pairingRes.identity.pubkeys),
        identity: pairingRes.identity
      })
    })
    .then(() => {
      this.setMe(me)
      // let me = utils.getMe()
      // let oldId = IDENTITY + '_' + me[ROOT_HASH]
      // delete list[oldId]

      // let oldProfileId = utils.getId(me)
      // let profile = list[oldProfileId].value
      // delete list[oldProfileId]

      // profile[ROOT_HASH] = pairingRes.identity[ROOT_HASH]
      // profile[CUR_HASH] = pairingRes.identity[ROOT_HASH]

      // let newId = IDENTITY + '_' + pairingRes.identity[ROOT_HASH]
      // list[newId] = {
      //   key: newId,
      //   value: utils.clone(pairingRes.identity)
      // }
      // let newProfileId = PROFILE + '_' +  pairingRes.identity[ROOT_HASH]
      // list[newProfileId] = {
      //   key: newProfileId,
      //   value: profile
      // }
      // let myIdentities = list[MY_IDENTITIES].value
      // myIdentities.currentIdentity = newProfileId
      // myIdentities.allIdentities.forEach((r) => {
      //   if (r.id !== oldProfileId)
      //     return
      //   r.id = newProfileId,
      //   r.publishedIdentity.pubkeys = utils.clone(pairingRes.identity.pubkeys)
      // })

      // let batch = []
      // batch.push({type: 'del', key: oldId})
      // batch.push({type: 'del', key: oldProfileId})
      // batch.push({type: 'put', key: MY_IDENTITIES, value: list[MY_IDENTITIES].value})
      // batch.push({type: 'put', key: newId, value: list[newId].value})
      // batch.push({type: 'put', key: newProfileId, value: list[newProfileId].value})
      // batch.push({type: 'put', key: PAIRING_RESPONSE + '_1', value: pairingRes})
      // db.batch(batch)
    })
  },

  getModel(modelName) {
    return models[modelName];
  },
  loadDB() {
    if (utils.isEmpty(models)) {
      voc.forEach(function(m) {
        if (!m[ROOT_HASH])
          m[ROOT_HASH] = sha(m);
        let key = utils.getId(m)
        models[key] = {
          key: key,
          value: m
        }
      });
    }

    return this.loadStaticDbData(true)
    .then(() => {
      return this.loadMyResources()
    })
    // .then(self.loadAddressBook)
    .catch(function(err) {
      err = err;
      });
  },
  loadStaticData() {
    sampleData.getResources().forEach((r) => {
      this.loadStaticItem(r)
    });
  },
  loadStaticDbData(saveInDB) {
    let batch = []
    let sData = [currencies, nationalities, countries]
    sData.forEach((arr) => {
      arr.forEach((r) => {
        this.loadStaticItem(r, saveInDB, batch)
      })
    })
    return batch.length ? db.batch(batch) : Q()
  },
  loadStaticItem(r, saveInDB, batch) {
    if (!r[ROOT_HASH])
      r[ROOT_HASH] = sha(r)

    r[CUR_HASH] = r[ROOT_HASH]
    let id = utils.getId(r)
    if (!list[id])
      this._setItem(id, r)
    if (saveInDB)
      batch.push({type: 'put', key: id, value: r})
  },

  loadModels() {
    var self = this
    var batch = [];
    voc.forEach(function(m) {
      if (!m[ROOT_HASH]) {
        m[ROOT_HASH] = sha(m);
        self.addNameAndTitleProps(m)
      }

      batch.push({type: 'put', key: m.id, value: m});
    });

    // return Promise.resolve()
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
    if (PAUSE_ON_TRANSITION) {
      if (meDriver) meDriver.pause(2000)
    }
  },
  onEndTransition() {
    if (PAUSE_ON_TRANSITION) {
      if (meDriver) meDriver.resume()
    }

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
    if (!resource[TYPE] && resource.id)
      return resource
    let isForm = this.getModel(resource[TYPE]).value.subClassOf === FORM
    // let id = utils.getId(resource)
    // if (isForm)
    //   id += '_' + resource[CUR_HASH]
    let ref = {
      id: utils.getId(resource),
      title: resource.id ? resource.title : utils.getDisplayName(resource, this.getModel(resource[TYPE]).value.properties)
    }
    if (resource.time)
      ref.time = resource.time
    return ref
  },
  _setItem(key, value) {
    list[key] = { key, value }
  },
  _mergeItem(key, value) {
    const current = list[key] || {}
    list[key] = { key, value: { ...current.value, ...value } }
  },
})
// );

module.exports = Store;

function getProviderUrl (provider) {
  return provider.id ? utils.joinURL(provider.url, provider.id) : provider.url
}
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
  // parseForm(val, model) {
  //   let properties = model.properties
  //   for (let p in val) {
  //     let prop = properties[p]
  //     if (!prop)
  //       continue
  //     if (prop.type !== 'array')
  //       continue
  //     let v = JSON.parse(val[p])
  //     val[p] = Array.isArray(v) ? v : [v]
  //     let iprops = prop.properties
  //     if (!iprop)
  //       continue
  //     for (let item of val[p]) {
  //       for (let itemProp in item) {
  //         let ip = iprops[itemProp]
  //         if (!ip.ref)
  //           continue
  //         let im = utils.getModel(ip.ref)
  //         if (im.subClassOf !== 'ENUM')
  //           continue
  //         let result = this.searchNotMessages({modelName: im._id})
  //         let enumProp
  //         for (let ep in im.properties)
  //           if (ep.charAt(0) !== '_') {
  //             enumProp = ep
  //             break
  //           }
  //         let rValue = result.filter((r) => r[enumProp] === item[enumProp])
  //         item[enumProp] = { id: utils.getId(rValue[0]), title: item[enumProp] }
  //       }
  //     }
  //   }

  // },

  // searchMessagesNew(params) {
  //   let bankID = utils.getId(params.to)
  //   let messages = chatMessages[bankID]
  //   let promise = messages ? Q() : this.getConversation(params)
  //   let result = []
  //   let self = this
  //   return promise
  //   .then((data) => {
  //     if (data)
  //       return data
  //     data = Object.keys(messages)
  //     var defer = Q.defer()
  //     var togo = Object.keys(data).length
  //     for (let r of data) {
  //       meDriver.lookupObjectsByRootHash(r.split('_')[1])
  //       .then(function (objs) {
  //         var obj = objs[objs.length - 1]
  //         var res = obj.parsed.data
  //         var val = extend(true, res)
  //         self.fillFromAndTo(obj, val)

  //         val[ROOT_HASH] = obj[ROOT_HASH]
  //         result.push(val)
  //         if (--togo === 0)
  //           defer.resolve(result)
  //       })
  //       .catch((err) => {
  //         debugger
  //       })
  //     }
  //     return result
  //   })
  // },

  // getConversation(params) {
  //   var self = this
  //   var list = {}
  //   var hasVerifications
  //   var excludeTypes = [
  //     CUSTOMER_WAITING,
  //     FORGOT_YOU,
  //     FORGET_ME,
  //     IDENTITY_PUBLISHING_REQUEST
  //   ]
  //   var bankID = utils.getId(params.to)
  //   var reps = params.to[TYPE] === constants.TYPES.ORGANIZATION
  //            ? this.getRepresentatives(bankID)
  //            : [params.to]
  //   var messages = {}
  //   chatMessages[bankID] = messages
  //   return meDriver.getConversation(reps[0][ROOT_HASH])
  //   .then(function(data) {
  //     var result = []
  //     var defer = Q.defer()
  //     var togo = data.length
  //     var hasPL
  //     for (var i=data.length - 1; i>=0; i--) {
  //       var r = data[i]
  //       if (excludeTypes.indexOf(r[TYPE]) !== -1 ||
  //           !self.getModel(r[TYPE])) {
  //         --togo
  //         continue
  //       }
  //       if (r[TYPE] === PRODUCT_LIST) {
  //         if (hasPL) {
  //           --togo
  //           continue
  //         }
  //         hasPL = true
  //       }

  //       meDriver.lookupObject(r)
  //       .then(function (obj) {
  //         var res = obj.parsed.data
  //         var val = extend(true, res)
  //         self.fillFromAndTo(obj, val)

  //         val[ROOT_HASH] = obj[ROOT_HASH]
  //         result.push(val)
  //         let rid = utils.getId(val)
  //         list[rid] = {
  //           key: rid,
  //           value: {
  //             id: rid,
  //             title: utils.getDisplayName(val, utils.getModel(obj[TYPE]).value.properties),
  //             time: val.time
  //           }
  //         }
  //         if (val.photos)
  //           list[rid].value.photos = [val.photos[0]]
  //         if (val[TYPE] === VERIFICATION)
  //           hasVerifications = true

  //         if (--togo === 0)
  //           defer.resolve(result)
  //       })
  //       .catch(function(err) {
  //         debugger
  //       })
  //     }
  //     return defer.promise
  //   })
  //   .then(function(result) {
  //     if (hasVerifications) {
  //       result.forEach(function(r) {
  //         if (r[TYPE] === VERIFICATION)
  //           r.document = list[utils.getId(r.document)]
  //       })
  //     }
  //     result.sort(function(a, b) {
  //       return a.time - b.time;
  //     });
  //     result.forEach(function(r) {
  //       messages[utils.getId(r)] = r.time
  //     })
  //     // var shareableResources;
  //     // if (!params.isAggregation  &&  params.to)
  //     //   shareableResources = self.getShareableResources(result, params.to);

  //     // var retParams = {
  //     //   action: !params.prop ? 'messageList' : 'list',
  //     //   list: result,
  //     //   spinner: params.spinner,
  //     //   isAggregation: params.isAggregation
  //     // }
  //     // if (shareableResources)
  //     //   retParams.shareableResources = shareableResources;
  //     // if (params.prop)
  //     //   retParams.prop = params.prop;

  //     // self.trigger(retParams);
  //     return result
  //   })
  //   .catch(function(err) {
  //     debugger
  //   })
  // },

  // // extractReferences(val) {
  // //   let props = utils.getModel(val[TYPE]).value.properties
  // //   let r = {_t: val[TYPE]}
  // //   for (let p in val) {
  // //     if (props[p].ref) {
  // //       if (props[p].ref !== constants.TYPE.MONEY)
  // //         r[p] = val[p]
  // //     }
  // //     else if (props[p].type === 'array') {
  // //       if
  // //     }
  // //   }
  // // },
  // getMessagesBefore(params) {
  //   var bankID = utils.getId(params.to)
  //   var messages
  //   var self = this
  //   var promise = chatMessages[bankID] ? Q() : this.searchMessagesNew(params)
  //   return promise
  //   .then(function(result) {
  //     var limit = params.limit
  //     var allMessages = chatMessages[bankID]

  //     var ids = Object.keys(allMessages)
  //     var start = ids.indexOf(utils.getId(params.lastId))
  //     var end = Math.max(0, start - limit)
  //     var result = []
  //     for (var i=start - 1; i > end &&  i >= 0; i--) {
  //       var val = list[ids[i]]
  //       if (val)
  //         result.push(val.value)
  //     }
  //     self.trigger({action: 'messageList', loadingEarlierMessages: true, list: result})
  //   })
  // },
/*
  searchMessages1(params) {
    // if (params.loadingEarlierMessages)
    //   return this.getMessagesBefore(params)

    var query = params.query;
    var modelName = params.modelName;
    var meta = this.getModel(modelName).value;
    var prop = params.prop;
    if (typeof prop === 'string')
      prop = meta[prop];
    var backlink = prop ? (prop.items ? prop.items.backlink : prop) : null;
    var foundResources = {};
    var props = meta.properties;

    // var required = meta.required;
    var meId = utils.getId(me)
    var meOrgId = me.isEmployee ? utils.getId(me.organization) : null;

    var chatTo = params.to
    if (chatTo  &&  chatTo.id)
      chatTo = list[utils.getId(chatTo)].value
    var chatId = chatTo ? utils.getId(chatTo) : null;
    var isChatWithOrg = chatTo  &&  chatTo[TYPE] === ORGANIZATION;
    var toId
    var toOrg
    let thisChatMessages
    if (isChatWithOrg) {
      var rep = this.getRepresentative(chatId)
      if (!rep)
        return
      chatTo = rep
      chatId = utils.getId(chatTo)
      // isChatWithOrg = false
      toId = utils.getId(params.to)
      toOrg = list[toId].value
      thisChatMessages = chatMessages[toId]
    }
    else {
      if (chatTo  &&  chatTo.organization  &&  !meOrgId) {
        toId = utils.getId(chatTo.organization)
        thisChatMessages = chatMessages[toId]
      }
      else
        thisChatMessages = chatMessages[chatId]
    }
    if (!thisChatMessages  &&  !params.to) {
      thisChatMessages = []
      Object.keys(list).filter((key) => {
        if (list[key].value[TYPE] === modelName                           ||
           utils.getModel(list[key].value[TYPE]).subClassOf === modelName ||
           modelName === MESSAGE  &&  utils.getModel(list[key].value[TYPE]).interfaces) {
          thisChatMessages.push({id: key, time: list[key].value.time})
          return true
        }
      })
    }
    if (!thisChatMessages)
      return null
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
    // var lastPL
    // var sharedWithTimePairs = []
    var from = params.from
    var limit = params.limit ? params.limit + 1 : null
    var isAllMessages = meta.isInterface;
    var implementors = isAllMessages ? utils.getImplementors(modelName) : null;
    var isVerification = modelName === VERIFICATION  ||  meta.subClassOf === VERIFICATION;

    // for (var key in list) {
    let lastId = params.lastId
    let lastIdIdx = -1
    for (let i=thisChatMessages.length - 1; i>=0; i--) {
      var key = thisChatMessages[i].id
      if (lastId && lastIdIdx === -1  &&  key === lastId) {
        let result = this.filterResult(foundResources)
        lastIdIdx = result.length
        limit = result.length + limit
        params.limit = limit - 1
        foundResources = this.packResult(result)
//         foundResources = {}
//         result.forEach((fr) => {
//           foundResources[utils.getId(fr)] = fr
//         })
      }
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
      else if (list[key].value[TYPE] !== modelName) {
        var rModel = this.getModel(list[key].value[TYPE])
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
      var isFormError = isAllMessages && r[TYPE] === FORM_ERROR
      // Make sure that the messages that are showing in chat belong to the conversation between these participants
      if (isVerification) {
        // if (r.organization) {
        //   if (!r.organization.photos) {
        //     var orgPhotos = list[utils.getId(r.organization.id)].value.photos;
        //     if (orgPhotos)
        //       r.organization.photos = [orgPhotos[0]];
        //   }
        // }
        if (r.document) {
          var d = list[utils.getId(r.document)]
          if (!d)
            continue
          if (params.resource  &&  utils.getId(params.resource) !== utils.getId(d.value))
            continue
          r.document = d.value;
        }
      }
      else if (isFormError) {
        r.prefill = list[utils.getId(r.prefill)] ? list[utils.getId(r.prefill)].value : r.prefill
      }
      // HACK to not show service message in customer stream
      else if (r.message  &&  r.message.length)  {
        if (r[TYPE] === SELF_INTRODUCTION  &&  !params.isForgetting && (utils.getId(r.to) !== meId))
          continue
        if (r.message === '[already published](tradle.Identity)')
          continue
        var m = utils.splitMessage(r.message)

        if (m.length === 2) {
          if (m[1] === PROFILE)
            continue;
        }
        if (chatTo.organization  &&  r[TYPE] === constants.TYPES.CUSTOMER_WAITING) {
          var rid = utils.getId(chatTo.organization);

          // if (rid.indexOf(ORGANIZATION) === 0) {
          var org = list[utils.getId(r.to)].value.organization
          var orgId = utils.getId(org)
          // if (params.isForgetting  &&  orgId === rid) {
          //   // foundResources[key] = r
          //   sharedWithTimePairs.push({
          //      time: r.time,
          //      resource: r
          //   })
          // }
          if (!utils.isEmployee(list[utils.getId(chatTo.organization)].value))
          // if (!me.isEmployee  ||  rid !== utils.getId(me.organization))
            continue;
         // }
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
            // if (timeResourcePair)
            //   sharedWithTimePairs.push(timeResourcePair)
            // else
            //   sharedWithTimePairs.push({
            //     time: r.time,
            //     resource: r
            //   })
            // for Loading earlier resources we don't need to check limit untill we get to the lastId
            if (lastId && lastIdIdx === -1)
              continue
            if (limit  &&  Object.keys(foundResources).length === limit) {
              let result = this.filterResult(foundResources)
              if (result.length === limit)
                return result
              else
                foundResources = this.packResult(result)
            }
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
          if (isVerificationR) {
            let org = list[fromID].value.organization
            if (!org)
              org = list[toID].value.organization

            let msgOrgId = utils.getId(org)
            if (toId !== msgOrgId) {
              // if (!isSharedWith)
                continue
              // let sharedWithThisOrg = r.sharedWith.filter((s) => {
              //   let rep = list[s.bankRepresentative].value
              //   if (utils.getId(rep.organization) === toId)
              //     return true
              // })
              // if (!sharedWithThisOrg  ||  !sharedWithThisOrg.length)
              //   continue
            }
          }
          else {
            let msgOrg
            if (toID !== meId) {
              msgOrg = list[toID].value.organization
              if (!msgOrg)
                msgOrg = list[fromID].value.organization
            }
            else {
              msgOrg = list[fromID].value.organization
              if (!msgOrg)
                msgOrg = list[toID].value.organization
            }
            let msgOrgId = utils.getId(msgOrg)
            if (toId !== msgOrgId  &&  (!isSharedWith || isVerificationR)) // do not show shared verifications
              continue
           //   let msgOrgTo = list[toID].value.organization
          //   let msgOrgFrom = list[fromID].value.organization
          // // if (toID === meId)
          // //   continue
          //   let msgOrg
          //   if (!msgOrgTo  ||  (msgOrgFrom  &&  toID !== meId))
          //     msgOrg = msgOrgFrom
          //   else
          //     msgOrg = msgOrgTo

          //   let msgOrgId = utils.getId(msgOrg)
          //   if (toId !== msgOrgId  &&  !isSharedWith)
          //     continue
          }
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
            // if (timeResourcePair)
            //   sharedWithTimePairs.push(timeResourcePair)
            // else
            //   sharedWithTimePairs.push({
            //     time: r.time,
            //     resource: r
            //   })
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
                if (Array.isArray(val))
                  doc[p] = val.slice(0)
                else
                  doc[p] = extend(true, {}, val)
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
        // if (!timeResourcePair)
        //   sharedWithTimePairs.push({
        //     time: r.time,
        //     resource: msg
        //   })
        // else {
        //   timeResourcePair.resource = msg
        //   sharedWithTimePairs.push(timeResourcePair)
        // }
        if (lastId  &&  lastIdIdx === -1)
          continue
        if (limit  &&  Object.keys(foundResources).length === limit) {
          let result = this.filterResult(foundResources)
          if (result.length === limit)
            return result
          foundResources = this.packResult(result)
        }

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
        // if (timeResourcePair)
        //   sharedWithTimePairs.push(timeResourcePair)
        // else
        //   sharedWithTimePairs.push({
        //     time: r.time,
        //     resource: r
        //   })

        if (limit  &&  Object.keys(foundResources).length === limit) {
          let result = this.filterResult(foundResources)
          if (result.length === limit)
            return result
          foundResources = this.packResult(result)
        }
      }
    }

//     sharedWithTimePairs.sort(function(a, b) {
//       return a.time - b.time;
//     });

      let result = this.filterResult(foundResources)
//           if (result.length === limit)
//             break;
//           else {
//             foundResources = {}
//             result.forEach((fr) => {
//               foundResources[utils.getId(fr)] = fr
//             })
//           }

//        var result = Object.values(foundResources)
//     var result = []
//     sharedWithTimePairs.forEach((r) => {
//       result.push(r.resource)
//     })

    // var result = utils.objectToArray(foundResources);
    // if (lastPL)
    //   result.push(lastPL)

    if (params.isForgetting)
      return result
    // let paRequests = {}
    // let formRequests = {}
//     this.filterResult(result)
    // There was a case when FormRequest was following ProductList over and over with the same form
    // let curFormRequest
    // let removeNext
    // result = result.filter((r, i) => {
    //   if (r[TYPE] === PRODUCT_LIST) {
    //     var next = result[i + 1]
    //     if (next) {
    //        if (next[TYPE] === PRODUCT_LIST)
    //         return false
    //       else if (next[TYPE] === FORM_REQUEST  &&  !next.documentCreated) {
    //         if (!curFormRequest)
    //           return true
    //         if (curFormRequest === next.product)
    //           return false
    //       }
    //     }
    //   }
    //   else if (r[TYPE] === FORM_REQUEST) {
    //     if (r.documentCreated)
    //       return true
    //     if (r.product === curFormRequest)
    //      return false
    //     curFormRequest = r.product
    //   }
    //   return true
    // })
    return result //.reverse();
  },

  // filterResult(result, lastId, toOrgId) {
  //   if (!result)
  //     return
  //   if (!Array.isArray(result))
  //     result = Object.values(result) //.reverse()
  //   if (!result  ||  !result.length)
  //     return

  //   result.sort(function(a, b) {
  //     return a.time - b.time;
  //   });

  //   let meId = utils.getId(me)
  //   let newResult = result.filter((rr, i) => {
  //     let time = rr.time
  //     let r = rr.value
  //     if (r[TYPE] === PRODUCT_LIST  &&  i !== result.length - 1) {
  //       var next = result[i + 1].value
  //       if (next && next[TYPE] === PRODUCT_LIST)
  //         return false
  //     }
  //     // if (r[TYPE] === CUSTOMER_WAITING) {
  //     //   let f = list[utils.getId(r.from)].value.organization
  //     //   let t = list[utils.getId(r.to)].value.organization
  //     //   if (utils.getId(f) === utils.getId(t))
  //     //     return false
  //     // }
  //     if (r[TYPE] === SELF_INTRODUCTION) {
  //       // var next = result[i + 1]
  //       // if (next && next[TYPE] === SELF_INTRODUCTION)
  //         return false
  //     }
  //     // Check if there was request for the next form after multy-entry form
  //     if (r[TYPE] === FORM_REQUEST  &&  !r.document && r.documentCreated)
  //       return false
  //     // Gather info about duplicate requests for the same product
  //     // if (r[TYPE] === PRODUCT_APPLICATION)  {
  //     //   if (!paRequests[r.product])
  //     //     paRequests[r.product] = []
  //     //   paRequests[r.product].push(i)
  //     // }
  //     // if (r[TYPE] === SIMPLE_MESSAGE  &&  r.message) {
  //     //   let parts = utils.splitMessage(r.message)
  //     //   if (parts.length === 2) {
  //     //     let formM = utils.getModel(parts[1])
  //     //     if (formM) {
  //     //       if (!formRequests[parts[1]])
  //     //         formRequests[parts[1]] = []
  //     //       formRequests[parts[1]].push(i)
  //     //     }
  //     //   }
  //     // }
  //     let fromId = utils.getId(r.from)

  //     if (!me.isEmployee  &&  fromId !== meId  &&  list[fromId]) {
  //       let rFrom = list[fromId].value
  //       if (!rFrom.bot) {
  //         let photos = list[fromId].value.photos
  //         if (photos)
  //           r.from.photo = photos[0]
  //         else
  //           r.from.photo = employee
  //       }
  //     }
  //     let m = this.getModel(r[TYPE]).value
  //     let isMyProduct = m.subClassOf === MY_PRODUCT
  //     let isForm = !isMyProduct && m.subClassOf === FORM
  //     // r.from.photos = list[utils.getId(r.from)].value.photos;
  //     // var to = list[utils.getId(r.to)]
  //     // if (!to) console.log(r.to)
  //     // r.to.photos = to  &&  to.value.photos;
  //     if (isMyProduct)
  //       r.from.organization = list[utils.getId(r.from)].value.organization
  //     else if (isForm) {
  //       // set organization and photos for items properties for better displaying
  //       let form = list[utils.getId(r.to)].value
  //       if (toOrgId  &&  r.sharedWith  &&  r.sharedWith.length > 1) {
  //         // if (utils.getId(r.to.organization) !== toOrgId) {
  //         //   let filteredVerifications = this.getSharedVerificationsAboutThisForm(r, toOrgId)
  //         // }
  //       }
  //       r.to.organization = form.organization
  //       for (var p in r) {
  //         if (!m.properties[p]  ||  m.properties[p].type !== 'array' ||  !m.properties[p].items.ref)
  //           continue
  //         let pModel = this.getModel(m.properties[p].items.ref).value
  //         if (pModel.properties.photos) {
  //           let items = r[p]
  //           items.forEach((ir) => {
  //             let itemPhotos = list[utils.getId(ir)].value.photos
  //             if (itemPhotos)
  //               ir.photo = itemPhotos[0].url
  //           })
  //         }
  //       }
  //     }
  //     return true
  //   })
  //   if (lastId  &&  lastId.split('_')[0] === PRODUCT_LIST) {
  //     let i=newResult.length - 1
  //     for (; i>=0; i--)
  //       if (newResult[i][TYPE] !== PRODUCT_LIST)
  //         break
  //       newResult.splice(i, 1)
  //   }
  //   return newResult
  //   // return newResult.reverse()
  // },
  // getSharedVerificationsAboutThisForm(form, toOrgId) {
  //   let result = this.searchMessages({modelName: VERIFICATION, to: utils.getMe(), strict: true})
  //   // let result = this.searchMessages({modelName: VERIFICATION, to: to, strict: true, filterProps: {from: utils.getMe(), document: utils.getId(form)}})
  //   let formId = utils.getId(form)
  //   return result.filter((r) => {
  //     if (utils.getId(r.document) !== formId)
  //       return false
  //     let fromOrgId = utils.getId(list[utils.getId(r.from)].value.organization)
  //     if (fromOrgId === toOrgId)
  //       return false
  //     return true
  //   })
  // },
  searchMessages(params) {
    var query = params.query;
    var modelName = params.modelName;
    var meta = this.getModel(modelName).value;
    var prop = params.prop;
    if (typeof prop === 'string')
      prop = meta[prop];
    var backlink = prop ? (prop.items ? prop.items.backlink : prop) : null;
    var foundResources = [];
    var props = meta.properties;

    // var required = meta.required;
    var meId = utils.getId(me)
    var meOrgId = me.isEmployee ? utils.getId(me.organization) : null;

    var chatTo = params.to
    if (chatTo  &&  chatTo.id)
      chatTo = list[utils.getId(chatTo)].value
    var chatId = chatTo ? utils.getId(chatTo) : null;
    var isChatWithOrg = chatTo  &&  chatTo[TYPE] === ORGANIZATION;
    var toOrgId
    var toOrg
    let thisChatMessages

    if (isChatWithOrg) {
      var rep = this.getRepresentative(chatId)
      if (!rep)
        return
      chatTo = rep
      chatId = utils.getId(chatTo)
      // isChatWithOrg = false
      toOrgId = utils.getId(params.to)
      toOrg = list[toOrgId].value
      thisChatMessages = chatMessages[toOrgId]
    }
    else {
      if (chatTo) {
        if (chatTo.organization  &&  !meOrgId) {
          toOrgId = utils.getId(chatTo.organization)
          thisChatMessages = chatMessages[toOrgId]
        }
        else
          thisChatMessages = chatMessages[utils.getId(chatTo)]
      }
//       else if (chatId === meId) {
// console.log('What are we doing here!!! chatId: ' + chatId)
//         thisChatMessages = chatMessages[chatId]
//       }
    }
    if (!thisChatMessages  &&  (!params.to  ||  chatId === meId)) {
      thisChatMessages = []
      Object.keys(list).filter((key) => {
        let type = list[key].value[TYPE]
        let m = this.getModel(type)
        if (!m)
          return false
        if (type === modelName                      ||
           m.value.subClassOf === modelName         ||
           (modelName === MESSAGE  &&  m.value.interfaces)) {
          thisChatMessages.push({id: key, time: list[key].value.time})
          return true
        }
      })
    }

    if (!thisChatMessages  ||  !thisChatMessages.length)
      return null
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
    // var lastPL
    // var sharedWithTimePairs = []
    var from = params.from
    var limit = params.limit ? params.limit + 1 : null
    var isAllMessages = meta.isInterface;
    var implementors = isAllMessages ? utils.getImplementors(modelName) : null;
    var isVerification = modelName === VERIFICATION  ||  meta.subClassOf === VERIFICATION;

    // for (var key in list) {
    let lastId = params.lastId
    let ii = thisChatMessages.length - 1
    if (lastId) {
      for (; ii>=0; ii--) {
        if (thisChatMessages[ii].id === lastId) {
          ii--
          break
        }
      }
    }
    let resourceId = params.resource ? utils.getId(params.resource) : null
    for (let i=ii; i>=0; i--) {
      var key = thisChatMessages[i].id
      var iMeta = null;
      if (isAllMessages) {
        iMeta = utils.getModel(key.split('_')[0]).value
        // if (implementors) {
        //   implementors.some((impl) => {
        //     if (impl.id === key.split('_')[0]) {
        //       iMeta = impl;
        //       return true
        //     }
        //   })
        //   if (!iMeta)
        //     continue;
        // }
      }
      else if (list[key].value[TYPE] !== modelName) {
        var rModel = this.getModel(list[key].value[TYPE])
        if (!rModel)
          continue
        rModel = rModel.value;
        // Checks for the first level of subClasses
        if (rModel.subClassOf !== modelName)
          continue;
      }
      if (!iMeta)
        iMeta = meta;
      var r = list[key].value;
      if (r.canceled)
        continue;
      var isFormError = isAllMessages && r[TYPE] === FORM_ERROR
      // Make sure that the messages that are showing in chat belong to the conversation between these participants
      if (isVerification) {
        if (r.document) {
          var d = list[utils.getId(r.document)]
          if (!d)
            continue

          if (params.resource  &&  resourceId !== meId  && utils.getId(params.resource) !== utils.getId(d.value))
            continue
          r.document = d.value;
        }
      }
      else if (isFormError)
        r.prefill = list[utils.getId(r.prefill)] ? list[utils.getId(r.prefill)].value : r.prefill

      // HACK to not show service message in customer stream
      else if (r.message  &&  r.message.length)  {
        if (r[TYPE] === SELF_INTRODUCTION  &&  !params.isForgetting && (utils.getId(r.to) !== meId))
          continue
        if (r.message === '[already published](tradle.Identity)')
          continue
        var m = utils.splitMessage(r.message)

        if (m.length === 2) {
          if (m[1] === PROFILE)
            continue;
        }
        if (chatTo.organization  &&  r[TYPE] === constants.TYPES.CUSTOMER_WAITING) {
          var rid = utils.getId(chatTo.organization);

          var org = list[utils.getId(r.to)].value.organization
          var orgId = utils.getId(org)
          if (!utils.isEmployee(list[utils.getId(chatTo.organization)].value))
            continue;
        }

      }

      var isSharedWith = false, timeResourcePair = null
      if (r.sharedWith  &&  toOrgId) {
        var sharedWith = r.sharedWith.filter(function(r) {
          let org = list[r.bankRepresentative].value.organization
          return (org) ? utils.getId(org) === toOrgId : false
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
        // backlinks like myVerifications, myDocuments etc. on Profile
        if (backlink  &&  r[backlink]) {
          var s = params.resource ? utils.getId(params.resource) : chatId
          if (s === utils.getId(r[backlink])) {
            foundResources.push(r)
            // for Loading earlier resources we don't need to check limit untill we get to the lastId
            if (limit  &&  foundResources.length === limit)
              return foundResources.reverse()
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

        // if (fromID !== meId  &&  toID !== meId  &&  toID != meOrgId)
        //   continue;
        // if (isChatWithOrg) {
          // if (isVerificationR) {
          //   let org = list[fromID].value.organization
          //   if (!org)
          //     org = list[toID].value.organization

          //   let msgOrgId = utils.getId(org)
          //   if (toOrgId !== msgOrgId) {
          //     // if (!isSharedWith)
          //       continue
          //     // let sharedWithThisOrg = r.sharedWith.filter((s) => {
          //     //   let rep = list[s.bankRepresentative].value
          //     //   if (utils.getId(rep.organization) === toOrgId)
          //     //     return true
          //     // })
          //     // if (!sharedWithThisOrg  ||  !sharedWithThisOrg.length)
          //     //   continue
          //   }
          // }
          // else {
          //   let msgOrg
          //   if (toID !== meId) {
          //     msgOrg = list[toID].value.organization
          //     if (!msgOrg)
          //       msgOrg = list[fromID].value.organization
          //   }
          //   else {
          //     msgOrg = list[fromID].value.organization
          //     if (!msgOrg)
          //       msgOrg = list[toID].value.organization
          //   }
          //   let msgOrgId = utils.getId(msgOrg)
          //   if (toOrgId !== msgOrgId  &&  (!isSharedWith || isVerificationR)) // do not show shared verifications
          //     continue
          // }
      //   }
      //   else {
      //     if (!isSharedWith  &&  fromID !== chatId  &&  toID != chatId  &&  toID != meOrgId)
      //       continue;
      //   }
      }
      if (params.strict  &&  chatId !== utils.getId(r.to))
        continue

      if (r.sharedWith  &&  toOrgId  &&  !isSharedWith)
        continue
      if (isVerificationR  ||  r[TYPE] === ADDITIONAL_INFO) {
        var doc = {};
        var rDoc = list[utils.getId(r.document)]
        if (!rDoc) {
          if (params.isForgetting)
            foundResources.push(r)
          continue
        }

        // TODO: check if we can copy by reference
        for (var p in rDoc.value) {
          if (p === 'verifications' || p === 'additionalInfo') continue

          var val = rDoc.value[p]
          switch (typeof val) {
            case 'object':
              if (val) {
                if (Array.isArray(val))
                  doc[p] = val.slice(0)
                else
                  doc[p] = extend(true, {}, val)
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
        // foundResources[key] = msg;
        foundResources.push(msg)
        if (limit  &&  foundResources.length === limit)
          return foundResources.reverse()

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
        // foundResources[key] = this.fillMessage(r);
        foundResources.push(this.fillMessage(r))

        if (limit  &&  foundResources.length === limit)
          return foundResources.reverse()
      }
    }
    if (!foundResources.length)
      return
    return foundResources.reverse()// this.filterResult(foundResources, lastId, toOrg ? utils.getId(toOrg) : null)
    // result.sort(function(a, b) {
    //   return a.time - b.time;
    // });
    // return this.getSearchResult(result)

    // if (params.isForgetting)
    //   return result
    // return result //.reverse();
  },
  searchMessages(params) {
    var query = params.query;
    var modelName = params.modelName;
    var meta = this.getModel(modelName).value;
    var prop = params.prop;
    if (typeof prop === 'string')
      prop = meta[prop];
    var backlink = prop ? (prop.items ? prop.items.backlink : prop) : null;
    var foundResources = [];
    var props = meta.properties;

    // var required = meta.required;
    var meId = utils.getId(me)
    var meOrgId = me.isEmployee ? utils.getId(me.organization) : null;

    var chatTo = params.to
    if (chatTo  &&  chatTo.id)
      chatTo = list[utils.getId(chatTo)].value
    var chatId = chatTo ? utils.getId(chatTo) : null;
    var isChatWithOrg = chatTo  &&  chatTo[TYPE] === ORGANIZATION;
    var toOrgId
    var toOrg
    let thisChatMessages

    if (isChatWithOrg) {
      var rep = this.getRepresentative(chatId)
      if (!rep)
        return
      chatTo = rep
      chatId = utils.getId(chatTo)
      // isChatWithOrg = false
      toOrgId = utils.getId(params.to)
      toOrg = list[toOrgId].value
      thisChatMessages = chatMessages[toOrgId]
    }
    else {
      if (chatTo) {
        if (chatTo.organization  &&  !meOrgId) {
          toOrgId = utils.getId(chatTo.organization)
          thisChatMessages = chatMessages[toOrgId]
        }
        else
          thisChatMessages = chatMessages[utils.getId(chatTo)]
      }
//       else if (chatId === meId) {
// console.log('What are we doing here!!! chatId: ' + chatId)
//         thisChatMessages = chatMessages[chatId]
//       }
    }
    if (!thisChatMessages  &&  (!params.to  ||  chatId === meId)) {
      thisChatMessages = []
      Object.keys(list).filter((key) => {
        let type = list[key].value[TYPE]
        let m = this.getModel(type)
        if (!m)
          return false
        if (type === modelName                      ||
           m.value.subClassOf === modelName         ||
           (modelName === MESSAGE  &&  m.value.interfaces)) {
          thisChatMessages.push({id: key, time: list[key].value.time})
          return true
        }
      })
    }

    if (!thisChatMessages  ||  !thisChatMessages.length)
      return null
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
    // var lastPL
    // var sharedWithTimePairs = []
    var from = params.from
    var limit = params.limit ? params.limit + 1 : null
    var isAllMessages = meta.isInterface;
    var implementors = isAllMessages ? utils.getImplementors(modelName) : null;
    var isVerification = modelName === VERIFICATION  ||  meta.subClassOf === VERIFICATION;

    // for (var key in list) {
    let lastId = params.lastId
    let ii = thisChatMessages.length - 1
    if (lastId) {
      for (; ii>=0; ii--) {
        if (thisChatMessages[ii].id === lastId) {
          ii--
          break
        }
      }
    }
    let resourceId = params.resource ? utils.getId(params.resource) : null
    for (let i=ii; i>=0; i--) {
      var key = thisChatMessages[i].id
      var iMeta = null;
      if (isAllMessages) {
        iMeta = utils.getModel(key.split('_')[0]).value
        // if (implementors) {
        //   implementors.some((impl) => {
        //     if (impl.id === key.split('_')[0]) {
        //       iMeta = impl;
        //       return true
        //     }
        //   })
        //   if (!iMeta)
        //     continue;
        // }
      }
      else if (list[key].value[TYPE] !== modelName) {
        var rModel = this.getModel(list[key].value[TYPE])
        if (!rModel)
          continue
        rModel = rModel.value;
        // Checks for the first level of subClasses
        if (rModel.subClassOf !== modelName)
          continue;
      }
      if (!iMeta)
        iMeta = meta;
      var r = list[key].value;
      if (r.canceled)
        continue;
      var isFormError = isAllMessages && r[TYPE] === FORM_ERROR
      // Make sure that the messages that are showing in chat belong to the conversation between these participants
      if (isVerification) {
        if (r.document) {
          var d = list[utils.getId(r.document)]
          if (!d)
            continue

          if (params.resource  &&  resourceId !== meId  && utils.getId(params.resource) !== utils.getId(d.value))
            continue
          r.document = d.value;
        }
      }
      else if (isFormError)
        r.prefill = list[utils.getId(r.prefill)] ? list[utils.getId(r.prefill)].value : r.prefill

      // HACK to not show service message in customer stream
      else if (r.message  &&  r.message.length)  {
        if (r[TYPE] === SELF_INTRODUCTION  &&  !params.isForgetting && (utils.getId(r.to) !== meId))
          continue
        if (r.message === '[already published](tradle.Identity)')
          continue
        var m = utils.splitMessage(r.message)

        if (m.length === 2) {
          if (m[1] === PROFILE)
            continue;
        }
        if (chatTo.organization  &&  r[TYPE] === constants.TYPES.CUSTOMER_WAITING) {
          var rid = utils.getId(chatTo.organization);

          var org = list[utils.getId(r.to)].value.organization
          var orgId = utils.getId(org)
          if (!utils.isEmployee(list[utils.getId(chatTo.organization)].value))
            continue;
        }

      }

      var isSharedWith = false, timeResourcePair = null
      if (r.sharedWith  &&  toOrgId) {
        var sharedWith = r.sharedWith.filter(function(r) {
          let org = list[r.bankRepresentative].value.organization
          return (org) ? utils.getId(org) === toOrgId : false
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
        // backlinks like myVerifications, myDocuments etc. on Profile
        if (backlink  &&  r[backlink]) {
          var s = params.resource ? utils.getId(params.resource) : chatId
          if (s === utils.getId(r[backlink])) {
            foundResources.push(r)
            // for Loading earlier resources we don't need to check limit untill we get to the lastId
            if (limit  &&  foundResources.length === limit)
              return foundResources.reverse()
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
      }
      if (params.strict  &&  chatId !== utils.getId(r.to))
        continue

      if (r.sharedWith  &&  toOrgId  &&  !isSharedWith)
        continue
      if (isVerificationR  ||  r[TYPE] === ADDITIONAL_INFO) {
        var doc = {};
        var rDoc = list[utils.getId(r.document)]
        if (!rDoc) {
          if (params.isForgetting)
            foundResources.push(r)
          continue
        }

        // TODO: check if we can copy by reference
        for (var p in rDoc.value) {
          if (p === 'verifications' || p === 'additionalInfo') continue

          var val = rDoc.value[p]
          switch (typeof val) {
            case 'object':
              if (val) {
                if (Array.isArray(val))
                  doc[p] = val.slice(0)
                else
                  doc[p] = extend(true, {}, val)
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
        // foundResources[key] = msg;
        foundResources.push(msg)
        if (limit  &&  foundResources.length === limit)
          return foundResources.reverse()

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
        // foundResources[key] = this.fillMessage(r);
        foundResources.push(this.fillMessage(r))

        if (limit  &&  foundResources.length === limit)
          return foundResources.reverse()
      }
    }
    if (!foundResources.length)
      return
    return foundResources.reverse()// this.filterResult(foundResources, lastId, toOrg ? utils.getId(toOrg) : null)
    // result.sort(function(a, b) {
    //   return a.time - b.time;
    // });
    // return this.getSearchResult(result)

    // if (params.isForgetting)
    //   return result
    // return result //.reverse();
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
  onAddApp(serverUrl) {
    let parts = serverUrl.split(';')
    // let idx = serverUrl.lastIndexOf('/')
    // let id = parts[parts.length - 1]
    // let url = parts.slice(0, parts.length - 1).join('/')

    return this.getInfo([parts[0]], false, parts[1])
    .then(() => {
      this.trigger({action: 'addApp'})
      // let list = self.searchNotMessages({modelName: ORGANIZATION})
      // this.trigger({
      //   action: 'list',
      //   list: list,
      // })
    })
  },

  packResult(result) {
    let foundResources = {}
    result.forEach((fr) => {
      foundResources[utils.getId(fr.value)] = fr
    })
    return foundResources
  },
*/
