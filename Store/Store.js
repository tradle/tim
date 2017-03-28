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
import createPoliteQueue from '../utils/polite-queue.js'
const co = require('bluebird').coroutine
var TimerMixin = require('react-timer-mixin')
var reactMixin = require('react-mixin');

var path = require('path')
var Reflux = require('reflux');
var Actions = require('../Actions/Actions');
var extend = require('extend');
var Debug = require('debug')
var deepEqual = require('deep-equal')
var once = require('once')

const SENT = 'Sent'
const SENDING = 'Sending'
const QUEUED = 'Queued'

var debug = Debug('tradle:app:store')
var employee = require('../people/employee.json')

const PHOTO_ID = 'tradle.PhotoID'
const PERSONAL_INFO = 'tradle.PersonalInfo'
const ASSIGN_RM = 'tradle.AssignRelationshipManager'
const NAME = 'tradle.Name'
const CONFIRMATION = 'tradle.Confirmation'
const APPLICATION_DENIAL = 'tradle.ApplicationDenial'
const FRIEND = 'Friend'

var Q = require('q');
Q.longStackSupport = true
Q.onerror = function (err) {
  debug(err.stack)
  throw err
}

var ENV = require('../utils/env')
var AddressBook = require('NativeModules').AddressBook;

var voc = require('@tradle/models');
var sampleData = voc.data
var sampleProfile = require('../data/sampleProfile.json')
// var currencies = voc.currencies
// var nationalities = voc.nationalities
// var countries = voc.countries

// var myIdentity = __DEV__ ? require('../data/myIdentity.json') : []
var welcome = require('../data/welcome.json');

var sha = require('stable-sha1');
var utils = require('../utils/utils');
var Keychain = ENV.useKeychain !== false && !utils.isWeb() && require('../utils/keychain')
var translate = utils.translate
var promisify = require('q-level');
var debounce = require('debounce')
var asyncstorageDown = require('asyncstorage-down')
var levelup = require('levelup')
var mutexify = require('mutexify')

// var updown = require('level-updown')

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
const FORGET_ME         = constants.TYPES.FORGET_ME
const FORGOT_YOU        = constants.TYPES.FORGOT_YOU
const SETTINGS          = constants.TYPES.SETTINGS
const REMEDIATION_SIMPLE_MESSAGE = 'tradle.RemediationSimpleMessage'

// const SHARED_RESOURCE     = 'tradle.SharedResource'
const MY_IDENTITIES_TYPE  = 'tradle.MyIdentities'
const INTRODUCTION        = 'tradle.Introduction'
const PRODUCT_APPLICATION = 'tradle.ProductApplication'
const PARTIAL             = 'tradle.Partial'
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
const ITEM                = 'tradle.Item'
const MY_IDENTITIES       = MY_IDENTITIES_TYPE + '_1'
const REMEDIATION         = 'tradle.Remediation'
const CONFIRM_PACKAGE_REQUEST = "tradle.ConfirmPackageRequest"
const VERIFIABLE          = 'tradle.Verifiable'
const MODELS_PACK         = 'tradle.ModelsPack'
const STYLES_PACK         = 'tradle.StylesPack'
const MONEY               = 'tradle.Money'
const APPLICATION_SUBMITTED = 'tradle.ApplicationSubmitted'

const WELCOME_INTERVAL = 600000
const MIN_SIZE_FOR_PROGRESS_BAR = 30000

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

var dns = require('dns')
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
const ON_RECEIVED_PROGRESS = 0.66

var models = {};
var list = {};
var enums = {}
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
var SERVICE_PROVIDERS_BASE_URL_DEFAULTS = __DEV__ ? ['http://' + ENV.LOCAL_IP + ':44444'] : TOP_LEVEL_PROVIDERS.map(t => t.baseUrl)
var SERVICE_PROVIDERS_BASE_URLS
var HOSTED_BY = TOP_LEVEL_PROVIDERS.map(t => t.name)
// var ALL_SERVICE_PROVIDERS = require('../data/serviceProviders')
var SERVICE_PROVIDERS
var publishRequestSent = []
var driverInfo = (function () {
  const clientToIdentifiers = new Map()
  const byUrl = {}
  const byIdentifier = {}
  const wsClients = {
    add({ client, url, identifier }) {
      const identifiers = clientToIdentifiers.get(client) || []
      if (identifiers.indexOf(identifier) === -1) identifiers.push(identifier)

      clientToIdentifiers.set(client, identifiers)

      if (url) byUrl[url] = client
      if (identifier) byIdentifier[identifier] = client

      return client
    },
    providers({ client, url }) {
      if (!client) client = byUrl[url]

      return client && clientToIdentifiers.get(client) || []
    },
    byUrl,
    byIdentifier
  }

  return { wsClients }
  // whitelist: [],
})()

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
const POLITE_TASK_TIMEOUT = __DEV__ ? 60000 : 6000

const {
  newAPIBasedVerification,
  newIdscanVerification,
  newAu10tixVerification,
  newVisualVerification,
  newVerificationTree,
  randomDoc,
  newFormRequestVerifiers
} = require('../utils/faker')


// var Store = Reflux.createStore(timeFunctions({
var Store = Reflux.createStore({
  mixins: [TimerMixin],

  // this will set up listeners to all publishers in TodoActions, using onKeyname (or keyname) as callbacks
  listenables: [Actions],
  // this will be called by all listening components as they register their listeners
  init() {
    return this.ready = this._init()
  },
  async _init() {
    const self = this
    // Setup components:
    const ldb = level('TiM.db', { valueEncoding: 'json' });
    // ldb = levelQuery(level('TiM.db', { valueEncoding: 'json' }));
    // ldb.query.use(jsonqueryEngine());
    db = promisify(ldb);

    this.announcePresence = debounce(this.announcePresence.bind(this), 100)
    this._loadedResourcesDefer = Q.defer()
    this.lockReceive = utils.locker({ timeout: 600000 })
    this._connectedServers = {}
    this._politeQueue = createPoliteQueue({
      wait: async function () {
        await self.onIdle()
        // give UI a chance to stutter a bit
        await utils.promiseDelay(ENV.delayBetweenExpensiveTasks || 0)
      },
      timeout: POLITE_TASK_TIMEOUT
    })

    NetInfo.isConnected.addEventListener(
      'change',
      this._handleConnectivityChange.bind(this)
    );

    if (utils.isSimulator()) {
      // isConnected always returns false on simulator
      // https://github.com/facebook/react-native/issues/873
      this.isConnected = true
    } else {
      NetInfo.isConnected.fetch().done(
        (isConnected) => {
          this.isConnected = isConnected
        }
      );
    }

    this.addModels()
    this.loadModels()
    utils.setModels(models);
    this.loadStaticData()

    // if (true) {
    if (false) {
      await this.wipe()
      Alert.alert('please refresh')
      return Q.Promise(function (resolve) {
        // hang
      })
    }

    return this.getReady()
  },
  async getReady() {
    let me
    try {
      me = await this.getMe()
    } catch(err)  {
      debug('Store.init ' + err.stack)
    }
    let doMonitor = true
    if (!me  &&  ENV.autoRegister) {
      me = await this.autoRegister()
      doMonitor = false
    }
    await this.getSettings()

    if (!utils.isEmpty(list))
      isLoaded = true;

    if (me) {
      await this.getDriver(me)
      if (doMonitor)
        this.monitorTim()
    }

    if (me && me.registeredForPushNotifications) {
      Push.resetBadgeNumber()
    }
  },
  addModels() {
    voc.forEach((m) => {
      // if (!m[ROOT_HASH])
      //   m[ROOT_HASH] = sha(m);
      models[m.id] = {
        key: m.id,
        value: m
      }
      m[ROOT_HASH] = sha(m)
      if (!m.properties[TYPE]) {
        m.properties[TYPE] = {
          type: 'string',
          readOnly: true
        }
      }
      if (!m.properties.time) {
        m.properties.time = {
          type: 'date',
          readOnly: true
        }
      }
      this.addNameAndTitleProps(m)
      this.addVerificationsToFormModel(m)
      this.addFromAndTo(m)
    })
  },
  _handleConnectivityChange(isConnected) {
    if (isConnected === this.isConnected) return

    debug('network connectivity changed, connected: ' + isConnected)
    this.isConnected = isConnected
    this.trigger({action: 'connectivity', isConnected: isConnected})
    if (!meDriver) return

    if (isConnected) {
      meDriver.resume()
    } else {
      meDriver.pause()
    }
    // Alert.alert('Store: ' + isConnected)
  },

  getMe() {
    return db.get(MY_IDENTITIES)
    .then((value) => {
      if (value) {
        var key = MY_IDENTITIES
        this._setItem(key, value)
        return db.get(value.currentIdentity.replace(PROFILE, IDENTITY))
      }
    })
    .then ((value) => {
      this._setItem(utils.getId(value), value)
      return db.get(utils.getId(value).replace(IDENTITY, PROFILE))
    })
    .then((value) => {
      me = value
      let changed
      if (me.isAuthenticated) {
        // if (Date.now() - me.dateAuthenticated > AUTHENTICATION_TIMEOUT) {
        delete me.isAuthenticated
        delete me.dateAuthenticated
        changed = true
        // }
      }
      // HACK for the case if employee removed
      if (me.isEmployee  &&  !me.organization) {
        delete me.isEmployee
        changed = true
      }

      if (changed)
        this.dbPut(utils.getId(me), me)

      this.setMe(me)
      var key = me[TYPE] + '_' + me[ROOT_HASH]
      this._setItem(key, me)
      return me
    })
    // .catch(function(err) {
      // debugger
      // return self.loadModels()
    // })
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
    return this.dbPut(meId, r)
      // .then(() => {
      //   if (params.registered) {
      //     this.trigger({action: 'registered'})
      //   } else if (params)
      // })
  },
  onSetAuthenticated(authenticated) {
    if (!authenticated) meDriver.pause()
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

  setBusyWith(reason) {
    this.busyWith = reason && translate(reason)
    this.triggerBusy()
  },

  triggerBusy() {
    this.trigger({ action: 'busy', activity: this.busyWith })
  },

  idlifyExpensiveCalls() {
    if (this._idlifiedExpensiveCalls) return

    this._idlifiedExpensiveCalls = true
    this.idlify({
      overwrite: true,
      context: meDriver,
      methods: [
        'createObject'
      ]
    })
  },

  idlify({ context, methods, overwrite, delay }) {
    const idlified = overwrite ? context : {}
    methods.forEach(method => {
      idlified[method] = this.idlifyFunction({
        fn: context[method].bind(context),
        delay
      })
    })

    return idlified
  },

  idlifyFunction({ fn, context, delay }) {
    const self = this
    return async function idlifiedFunction (...args) {
      return self._politeQueue.push(() => {
        return fn(...args)
      })
    }
  },

  async buildDriver (...args) {
    this.setBusyWith('initializingEngine')
    const ret = await this._buildDriver(...args)
    this.setBusyWith(null)
    return ret
  },

  _buildDriver ({ keys, identity, encryption }) {
    var self = this
    var keeper = createKeeper({
      path: path.join(TIM_PATH_PREFIX, 'keeper'),
      db: asyncstorageDown,
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

    meDriver.setMaxListeners(0)

    console.log('me: ' + meDriver.permalink)
    meDriver = tradleUtils.promisifyNode(meDriver)
    this.idlifyExpensiveCalls()

    // TODO: figure out of we need to publish identities
    meDriver.identityPublishStatus = meDriver.identitySealStatus
    meDriver._multiGetFromDB = utils.multiGet
    meDriver.addressBook.setCache(new Cache({ max: 500 }))
    meDriver.pause()

    let noProviders
    if (!SERVICE_PROVIDERS_BASE_URLS) {
      let settingsId = SETTINGS + '_1'
      var settings = this._getItem(settingsId)
      fixOldSettings(settings)

      let updateSettings
      if (__DEV__  &&  settings  &&  settings.urls) {
        let urls = settings.urls
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
          this.dbPut(settingsId, settings)
      }
      else {
        SERVICE_PROVIDERS_BASE_URLS = SERVICE_PROVIDERS_BASE_URL_DEFAULTS ? SERVICE_PROVIDERS_BASE_URL_DEFAULTS.slice() : []
        var settings = {
          [TYPE]: SETTINGS,
          [ROOT_HASH]: '1',
          [CUR_HASH]: '1',
          urls: SERVICE_PROVIDERS_BASE_URLS,
          hashToUrl: {},
          urlToId: {}
        }
        this._setItem(settingsId, settings)
        this.dbPut(settingsId, settings)
      }
    }

    // if (TLS_ENABLED) {
    //   tlsKey = keys.filter((k) => k.type === 'dsa')[0]
    //   if (tlsKey) tlsKey = DSA.parsePrivate(tlsKey.priv)
    // }

    // if (tlsKey) tlsKey = kiki.toKey(tlsKey).priv()

    const tlsKey = driverInfo.tlsKey = TLS_ENABLED && meDriver.keys.filter(k => k.get('purpose') === 'tls')[0]
    // var fromPubKey = meDriver.identity.pubkeys.filter(k => k.type === 'ec' && k.purpose === 'sign')[0]
    meDriver._send = function (msg, recipientInfo, cb) {
      const start = Date.now()
      const monitor = setInterval(function () {
        debug(`still sending to ${recipientInfo.permalink} after ${(Date.now() - start)/1000|0} seconds`, msg.unserialized.object[TYPE])
      }, 5000)

      trySend(msg, recipientInfo, function (err, result) {
        clearInterval(monitor)
        cb(err, result)
      })
    }

    function trySend (msg, recipientInfo, cb) {
      const recipientHash = recipientInfo.permalink
      let messenger = wsClients.byIdentifier[recipientHash]
      if (!messenger) {
        const url = self._getItem(SETTINGS + '_1').hashToUrl[recipientHash]
        messenger = url && wsClients.byUrl[url]
      }

      const identifier = self.getIdentifier(recipientInfo)
      if (!messenger) {
        meDriver.sender.pause(identifier)
        // Alert.alert('meDriver._send recipient not found ' + recipientHash)
        return cb(new Error('recipient not found'))
      }

      debug(`pushing msg to ${identifier} into network stack`)
      // this timeout is not for sending the entire message
      // but rather an idle connection timeout
      messenger.send(identifier, msg, function (err) {
        if (err) debug(`failed to deliver message to ${identifier}: ${err.message}`)
        else debug(`delivered message to ${identifier}`)

        cb(err)
      })

      // messenger.setTimeout(60000)
    }

    // meDriver = timeFunctions(meDriver)
    this.getInfo({serverUrls: SERVICE_PROVIDERS_BASE_URLS, retry: true})
    // .then(() => {
    //   if (me && utils.isEmpty(chatMessages))
    //     this.initChats()
    // })
    .catch(function(err) {
      debug('initial getInfo failed:', err)
      throw err
    })

    return Q(meDriver)
  },
  initChats() {
    let meId = utils.getId(me)
    let meOrgId = me.organization ? utils.getId(me.organization) : null

    for (var p in list) {
      let r = this._getItem(p)
      if (r._context) {
        let c = this._getItem(r._context)
        // context could be empty if ForgetMe was requested for the provider where form was originally created
        // if (c  &&  c._readOnly) {
        let cId = utils.getId(c)
        if (utils.isReadOnlyChat(r)  ||  r[TYPE] === APPLICATION_DENIAL  ||  (r[TYPE] === CONFIRMATION  &&  utils.getId(r.from) === meId)) {
          this.addMessagesToChat(cId, r, true)
          continue
        }
        else {
          // Check if the message was sent by the party that is not one of the 2 original parties of the context
          let meId = utils.getId(me)
          let fromId = utils.getId(r.from)
          let toId = utils.getId(r.to)

          let chkId = (toId === meId) ? fromId : toId

          let cTo = utils.getId(c.to)
          let cFrom = utils.getId(c.from)
          if (chkId !== cTo  &&  chkId !== cFrom) {
            let chatId = utils.getId(cTo === meId ? cFrom : cTo)
            let chat = this._getItem(chatId)
            if (chat.organization  &&  cFrom === meId)
              this.addMessagesToChat(utils.getId(chat.organization), r, true)
            else
              this.addMessagesToChat(chatId, r, true)
            continue
          }
        }
        if (chatMessages[cId])
          this.addMessagesToChat(cId, r, true)
      }

      let m = this.getModel(r[TYPE])
      if (!m.interfaces  ||  m.interfaces.indexOf(MESSAGE) === -1)
        continue

      let addedToProviders = []
      if (r._sharedWith) {
        r._sharedWith.forEach((shareInfo) => {
          // if (shareInfo.bankRepresentative === meId)
          //   this.addMessagesToChat(utils.getId(r.to), r, true, shareInfo.timeShared)
          // else  {
            let rep = this._getItem(shareInfo.bankRepresentative)
            let orgId = utils.getId(rep.organization)
            if (meOrgId !== orgId) {
              this.addMessagesToChat(orgId, r, true, shareInfo.timeShared)
              addedToProviders.push(orgId)
            }
          // }
        })
      }
      if (m.id === VERIFICATION  &&  meId === utils.getId(r.from)  && r.to)
        this.addMessagesToChat(utils.getId(r.to), r, true)
      // Shared context
      else if (m.id === PRODUCT_APPLICATION  &&  utils.isReadOnlyChat(r))   //  &&  r._readOnly)
        this.addMessagesToChat(utils.getId(r.from), r, true)
      else  if (r.to) { // remove
        let fromId = utils.getId(r.from)
        let rep = this._getItem(meId === fromId ? utils.getId(r.to) : fromId)
        let orgId = rep.organization ? utils.getId(rep.organization) : utils.getId(rep)
        if (addedToProviders.indexOf(orgId) === -1)
          this.addMessagesToChat(orgId, r, true)
      }
    }
    for (let id in chatMessages) {
      var arr = chatMessages[id]
      arr.sort((a, b) => a.time - b.time)
      chatMessages[id] = this.filterChatMessages(arr, id)
    }
  },
  // Filtered result contains only messages that get displayed
  filterChatMessages(messages, orgId, lastId) {
    let meId = utils.getId(me)
    let productToForms = {}
    let productApp = {}
    let removeMsg = []
    // Compact all FormRequests that were fulfilled
    for (let i=messages.length - 1; i>=0; i--) {
      let r = this._getItem(messages[i].id)
      let product = r.product || (r._context && this._getItem(r._context).product)

      if (r[TYPE] === FORM_REQUEST  &&  !r.document) {// && r.documentCreated)
      // delete list[id]
        let forms = productToForms[product]
        if (!forms)
          productToForms[product] = {}
        let formIdx = productToForms[product][r.form]
        if (typeof formIdx !== 'undefined'  &&  !r.documentCreated)
          removeMsg.push(formIdx)
          // messages.splice(formIdx, 1)

        productToForms[product][r.form] = i
      }
      if (r[TYPE] === PRODUCT_APPLICATION) {
        let productIdx = productApp[product]
        if (productIdx)
          removeMsg.push(productIdx)
          // messages.splice(productIdx, 1)
        // else
          productApp[product] = i
      }
    }
    if (removeMsg.length) {
      removeMsg.sort((i1, i2) => {return i2 - i1})
      for (let i=0; i<removeMsg.length; i++)
        messages.splice(removeMsg[i], 1)
    }
    // Compact all SelfIntroduction
    messages = messages.filter((rr, i) => {
      let r = this._getItem(rr.id)
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
      let r = this._getItem(rr.id)

      // Check if there was request for the next form after multy-entry form
      let fromId = utils.getId(r.from)

      if (!me.isEmployee  &&  fromId !== meId  &&  list[fromId]) {
        let rFrom = this._getItem(fromId)
        if (!rFrom.bot) {
          let photos = rFrom.photos
          if (photos)
            r.from.photo = photos[0]
          else
            r.from.photo = employee
        }
      }
      let m = this.getModel(r[TYPE])
      // r.from.photos = list[utils.getId(r.from)].value.photos;
      // var to = list[utils.getId(r.to)]
      // if (!to) console.log(r.to)
      // r.to.photos = to  &&  to.value.photos;
      if (m.subClassOf === FORM) {
        // set organization and photos for items properties for better displaying
        let form = this._getItem(utils.getId(r.to))
        if (orgId  &&  r._sharedWith  &&  r._sharedWith.length > 1) {
          // if (utils.getId(r.to.organization) !== toOrgId) {
          //   let filteredVerifications = this.getSharedVerificationsAboutThisForm(r, toOrgId)
          // }
        }
        r.to.organization = form.organization
        for (var p in r) {
          if (!m.properties[p]  ||  m.properties[p].type !== 'array' ||  !m.properties[p].items.ref)
            continue
          let pModel = this.getModel(m.properties[p].items.ref)
          if (pModel.properties.photos) {
            let items = r[p]
            items.forEach((ir) => {
              let irRes = this._getItem(utils.getId(ir))
              // HACK - bad forgetMe
              let itemPhotos = irRes  && irRes.photos
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
  getInfo(params) {
    let serverUrls = params.serverUrls
    let retry = params.retry
    let id = params.id
    let newServer = params.newServer
    let maxAttempts = params.maxAttempts
    debug('fetching provider info from', serverUrls)
    return Q.all(serverUrls.map(url => {
      return this.getServiceProviders({url: url, retry: retry, id: id, newServer: newServer})
        .then(results => {
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
          results.forEach(provider => {
            this.addProvider(provider)
            Push.subscribe(provider.hash)
              .catch(err => console.log('failed to register for push notifications'))
          })
        })
        .catch(err => {
          if (err instanceof TypeError || err instanceof ReferenceError) {
            throw err
          }

          // forgive individual errors for batch getInfo
          if (id || maxAttempts > 0) throw err
        })
        .then(() => meDriver)
    }))
    // Not the best way to
  },

  onGetEmployeeInfo(code) {
    var self = this
    let parts = code.split(';')

    let orgId = ORGANIZATION + '_' + parts[1]
    let serviceProvider =  SERVICE_PROVIDERS  ? SERVICE_PROVIDERS.filter((json) => json.org === orgId) : null

    serviceProvider = (serviceProvider  &&  serviceProvider.length) ? serviceProvider[0] : null
      // let serviceProvider =  SERVICE_PROVIDERS.filter((json) => json.url === serverUrl)

    var org = this._getItem(orgId)
    let promise = serviceProvider ? Q() : this.getInfo({serverUrls: [parts[0]]})

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
      let r = this._getItem(orgId)
      let info = {
        bot: data,
        org: r,
        style: r.style,
        isEmployee: true
      }
      return self.addInfo(info)
    })
    .then(function(provider) {
      self.addProvider(provider)
      self.addToSettings(provider)

      utils.addContactIdentity(meDriver, { identity: provider.identity })

      let employee = this._getItem(PROFILE + '_' + provider.hash)
      currentEmployees[utils.getId(org)] = employee
      let myIdentities = this._getItem(MY_IDENTITIES)
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
  onSetProviderStyle(stylePack) {
    const style = utils.interpretStylesPack(stylePack)
  },
  addToSettings(provider) {
    let r = this._getItem(SETTINGS + '_1')
    if (!r.hashToUrl)
      r.hashToUrl = {}

    // save provider's employee
    // if (!hashToUrl[provider.hash]) {
    r.hashToUrl[provider.hash] = getProviderUrl(provider)
    return this.dbPut(SETTINGS + '_1', r)
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
    const url = getProviderUrl(provider)
    debug('adding provider', provider.hash, url)

    let transport = wsClients.byUrl[url] || wsClients.byIdentifier[provider.hash]
    if (transport) {
      wsClients.add({
        client: transport,
        url: url,
        identifier: provider.hash
      })

      return transport
    }

    const wsClient = this.getWsClient(url)
    transport = this.getTransport(wsClient)

    // const url = utils.joinURL(base, 'ws?from=' + identifier).replace(/^http/, 'ws')
    // const wsClient = new WebSocketClient({
    //   url: url,
    //   autoConnect: true,
    //   // for now, till we figure out why binary
    //   // doesn't work (socket.io parser errors on decode)
    //   forceBase64: true
    // })

    transport.on('presence', updatePresence)

    wsClient.on('disconnect', function () {
      onTransportConnectivityChanged(false)
    })

    wsClient.on('connect', function () {
      onTransportConnectivityChanged(true)
      // request presence information
      wsClient.sendCustomEvent('presence')
    })

    wsClient.on('presence', function (present) {
      debug('presence updated', present)
      // the below only handles the known parties
      // TODO: handle the new arrivals in `present`

      wsClients
        .providers({ client: transport })
        .forEach(permalink => {
          const isPresent = present.indexOf(permalink) !== -1
          updatePresence(permalink, isPresent)
        })

      // const permalinks = wsClients.providers({ client: transport })
      // permalinks.forEach(permalink => {
      //   const isPresent = present.indexOf(permalink) !== -1
      //   updatePresence(permalink, isPresent)
      // })

      // const newArrivals = present.filter(permalink => {
      //   if (permalinks.indexOf(permalink) === -1) {
      //     const { hashToUrl={} } = self._getItem(SETTINGS + '_1')
      //     return !hashToUrl[permalink]
      //   }
      // })

      // if (newArrivals.length) self.getInfo([url])
    })

    function onTransportConnectivityChanged (connected) {
      if (connected) {
        self._handleConnectivityChange(true)
        self._connectedServers[url] = true
      } else {
        delete self._connectedServers[url]
        transport.clients().forEach(function (c) {
          // reset OTR session, restart on connect
          debug('aborting pending sends due to disconnect')
          c.destroy()
        })
      }

      const numConnected = Object.keys(self._connectedServers).length
      if (numConnected === 0) {
        self.trigger({ action: 'onlineStatus', online: false })
      } else if (numConnected === 1) {
        self.trigger({ action: 'onlineStatus', online: true })
      }

      wsClients
        .providers({ client: transport })
        .forEach(permalink => updatePresence(permalink, connected))
    }

    wsClients.add({
      client: transport,
      url: url,
      identifier: provider.hash
    })

    // let timeouts = {}
    transport.on('receiving', function (msg) {
      onTransportConnectivityChanged(true)
    })

    // transport.on('404', function (recipient) {
    //   if (!timeouts[recipient]) {
    //     timeout = setTimeout(function () {
    //       delete timeouts[recipient]
    //       transport.cancelPending(recipient)
    //     }, 10000)
    //   }
    // })

    const receive = this.idlifyFunction({
      fn: opts => this.receive({ ...opts, transport })
    })

    transport.on('message', async function (msg, from) {
      debug('queuing receipt of msg from', from)
      if (!wsClients.byIdentifier[from]) {
        wsClients.add({
          client: transport,
          url: url,
          identifier: from
        })
      }

      const unlock = await self.lockReceive(from)
      const maybePromise = receive({ msg, from })
      if (!Q.isPromiseAlike(maybePromise)) {
        return process.nextTick(unlock)
      }

      try {
        await maybePromise
        debug('received msg from', from)
      } finally {
        unlock()
      }
    })

    transport.setTimeout(40000)
    transport.on('timeout', function (identifier) {
      debug(`connection timed out with ${identifier}, canceling pending to trigger resend`)
      transport.cancelPending(identifier)
    })

    function updatePresence (recipient, present) {
      if (present) {
        meDriver.sender.resume(recipient)
      } else {
        meDriver.sender.pause(recipient)
        transport.cancelPending(recipient)
        // try again soon. Todo: make this smarter
        setTimeout(() => meDriver.sender.resume(recipient), 10000)
      }
      // self.trigger({action: 'onlineStatus', online: present})
      self.setProviderOnlineStatus(recipient, present)
    }
  },

  async receiveIntroduction({ transport, msg, org }) {
    const { wsClients } = driverInfo
    const payload = msg.object
    const { identity } = payload
    const permalink = utils.getPermalink(identity)
    await utils.addContactIdentity(meDriver, { identity, permalink })
    await this.addContact(payload, permalink, msg.forPartials || msg.forContext)
    const url = utils.keyByValue(wsClients.byUrl, transport)
    await this.addToSettings({hash: permalink, url: url})
  },

  receiveSelfIntroduction({ transport, msg }) {
    const payload = msg.object
    const { wsClients } = driverInfo
    const rootHash = utils.getPermalink(payload.identity)
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
        onPress: async () => {
          await utils.addContactIdentity(meDriver, { identity: payload.identity })
          await this.addContact(payload, rootHash)
          const url = utils.keyByValue(wsClients.byUrl, transport)
          this.addToSettings({hash: rootHash, url: url})
        }},
        {text: translate('cancel'), onPress: () => console.log('Canceled!')},
      ]
    )
  },

  async receivePairingRequest({ payload }) {
    const rootHash = utils.getPermalink(payload.identity)
    Alert.alert(
      translate('pairingRequest'),
      null,
      [
        {text: translate('Ok'),
        onPress: () => {
          this.trigger({action: 'acceptingPairingRequest', resource: payload})
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
  },

  async receive({ transport, msg, from }) {
    const self = this
    const { tlsKey, wsClients } = driverInfo
    let progressUpdate
    let willAnnounceProgress = willShowProgressBar(msg)
    try {
      msg = tradleUtils.unserializeMessage(msg)
      const payload = msg.object
      debug(`receiving ${payload[TYPE]}`)

      let org = this._getItem(PROFILE + '_' + from).organization
      progressUpdate = willAnnounceProgress && {
        action: 'progressUpdate',
        recipient: this._getItem(org)
      }

      if (payload.context) {
        let s = PRODUCT_APPLICATION + '_' + payload.context
        let r = list[s]
      }

      switch (payload[TYPE]) {
      case INTRODUCTION:
        return this.receiveIntroduction({ transport, msg, org })
      case SELF_INTRODUCTION:
        return this.receiveSelfIntroduction({ transport, msg, org })
      default:
        break
      }
    } catch (err) {
      debug('experienced error receiving message: ' + (err.stack || err.message))
      if (progressUpdate) {
        this.trigger({ ...progressUpdate, progress: 1 })
      }

      let payload
      try {
        // debugger
        payload = JSON.parse(msg)
      } catch (err) {
        debug('received invalid json from ' + from)
        return
      }

      if (payload[TYPE] === PAIRING_REQUEST) {
        this.receivePairingRequest({ payload })
      }

      return

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
    }

    // const prop = 'pubKey'
    // const identifier = tradle.utils.deserializePubKey(new Buffer(from, 'hex'))

    const prop = tlsKey ? 'pubKey' : 'permalink'
    const identifier = prop === 'permalink' ? from : {
      type: 'ec',
      curve: 'curve25519',
      pub: new Buffer(from, 'hex')
    }

    if (progressUpdate) {
      this.trigger({ ...progressUpdate, progress: ON_RECEIVED_PROGRESS })
    }

    meDriver.sender.resume(identifier)
    try {
      await meDriver.receive(msg, { [prop]: identifier })
    } catch (err) {
      console.warn('failed to receive msg:', err, msg)
    } finally {
      if (progressUpdate) {
        this.trigger({ ...progressUpdate, progress: 1 })
      }
    }
  },
  setProviderOnlineStatus(permalink, online) {
    if (!SERVICE_PROVIDERS) return

    const provider = SERVICE_PROVIDERS.find(provider => {
      return provider.permalink === permalink
    })

    if (!provider) return

    const org = this._getItem(provider.org)
    org._online = online

    this.trigger({action: 'onlineStatus', online: online, resource: org})
    this.announcePresence()
  },

  announcePresence() {
    let l = this.searchNotMessages({modelName: ORGANIZATION})
    this.trigger({ action: 'list', list: l })
  },

  onPairingRequestAccepted(payload) {
    return this.onProcessPairingRequest(this._getItem(PAIRING_DATA + '_1'), payload)
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
    identityInfo = identityInfo || meDriver.identityInfo
    const purpose = TLS_ENABLED ? 'tls' : 'sign'
    const key = tradleUtils.find(identityInfo.keys || identityInfo.object.pubkeys, k => {
      const kPurpose = k.purpose || k.get('purpose')
      return kPurpose === purpose
    })

    return key.pubKeyString || key.pub
  },

  getWsClient(baseUrl) {
    const tlsKey = driverInfo.tlsKey
    const url = utils.joinURL(baseUrl, 'ws?' + querystring.stringify({
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
    var self = this
    return newSwitchboard({
      identifier: this.getIdentifier(),
      unreliable: wsClient,
      clientForRecipient: function (recipient) {
        const sendy = new Sendy({ ...SENDY_OPTS, name: recipient })
        let prevPercent
        sendy.on('progress', ({ total, progress }) => {
          if (!willShowProgressBar({ length: total })) return // don't show progress bar for < 30KB

          const percent = ON_RECEIVED_PROGRESS * 100 * progress / total | 0
          if (!percent || percent === prevPercent) return

          prevPercent = percent
          const org = self._getItem(PROFILE + '_' + recipient).organization
          self.trigger({action: 'progressUpdate', progress: percent / 100, recipient: self._getItem(org)})
          debug(`${percent}% of message downloaded from ${recipient}`)
        })

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
  getServiceProviders(params) {
    let url = params.url
    let retry = params.retry
    let id = params.id
    let newServer = params.newServer
    var self = this
    // return Q.race([
    //   fetch(utils.joinURL(url, 'info'), { headers: { cache: 'no-cache' } }),
    //   Q.Promise(function (resolve, reject) {
    //     setTimeout(function () {
    //       reject(new Error('timed out'))
    //     }, 5000)
    //   })
    // ])

    // Make sure not to get all providers from this server
    // but the ones customer requested before
    var providerIds
    if (!id) {
      let settings = this._getItem(SETTINGS + '_1')
      if (settings  &&  settings.urlToId  &&  settings.urlToId[url])
        providerIds = settings.urlToId[url]
    }
    const doFetch = retry
                  ? utils.fetchWithBackoff
                  : utils.fetchWithTimeout

    let originalUrl = url
    url = utils.joinURL(url, 'info')
    let languageCode
    if (me) {
      language = me.language
      if (language && list[utils.getId(language)]) {
        language = this._getItem(utils.getId(language))
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
      let newProviders
      if (!SERVICE_PROVIDERS) {
        SERVICE_PROVIDERS = []
        newProviders = true
      }

      var promises = []
      json.providers.forEach(sp => {
        if (id)  {
          if (sp.id !== id)
            return
        }
        else if (providerIds  &&  providerIds.indexOf(sp.id) === -1)
          return
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

        sp.bot.permalink = sp.bot.pub[ROOT_HASH] || protocol.linkString(sp.bot.pub)

        let newSp = {
          id: sp.id,
          org: utils.getId(sp.org),
          url: originalUrl,
          style: sp.style,
          permalink: sp.bot.permalink,
          publicConfig: sp.publicConfig
        }
        // Check is this is an update SP info
        let oldSp
        for (let i=0; !newProviders  &&  i<SERVICE_PROVIDERS.length; i++) {
          let r = SERVICE_PROVIDERS[i]
          if (r.id === sp.id  &&  r.url === originalUrl) {
            oldSp = SERVICE_PROVIDERS[i]
            SERVICE_PROVIDERS[i] = newSp
            break
          }
        }
        if (!oldSp)
          SERVICE_PROVIDERS.push(newSp)

        promises.push(self.addInfo(sp, originalUrl, newServer))
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
  addInfo(sp, url, newServer) {
    var okey = sp.org ? utils.getId(sp.org) : null
    var hash = protocol.linkString(sp.bot.pub)
    var ikey = IDENTITY + '_' + hash
    var batch = []
    var org = this._getItem(okey)
    if (org) {
      // allow to unhide the previously hidden provider
      if (newServer  &&  org._inactive)
        org._inactive = false
      this._mergeItem(okey, sp.org)
      this.configProvider(sp, org)
      batch.push({type: 'put', key: okey, value: org})
      this.resetForEmployee(me, org)
    }
    else {
      let newOrg = {}
      extend(newOrg, sp.org)
      this.configProvider(sp, newOrg)
      batch.push({type: 'put', key: okey, value: newOrg})
      this._setItem(okey, newOrg)
    }

    list[okey].value._online = true
    if (sp.style)
      this._getItem(okey).style = sp.style
    if (!list[ikey]) {
      var profile = {
        [TYPE]: PROFILE,
        [ROOT_HASH]: hash,
        firstName: sp.bot.profile.name.firstName || sp.id + 'Bot',
        organization: this.buildRef(sp.org)
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
      this._setItem(ikey, identity)
      this._setItem(pkey, profile)
    }
    if (!this._getItem(okey).contacts) {
      this._mergeItem(okey, { contacts: [] })
      // list[okey].value.contacts = []
    }

    var pkey = PROFILE + '_' + hash

    var curOkeyVal = this._getItem(okey)
    var newContact = {
      id:     pkey,
      // title: list[pkey].value.formatted
    }

    this._mergeItem(okey, { contacts: [...curOkeyVal.contacts, newContact] })
    // list[okey].value.contacts.push({
    //   id:     pkey,
    //   titile: list[pkey].formatted
    // })

    var promises = [
      // TODO: evaluate the security of this
      utils.addContactIdentity(meDriver, {
        identity: sp.bot.pub,
        permalink: sp.bot[CUR_HASH]
      })
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
  resetForEmployee(me, org) {
    if (!me  ||  !me.isEmployee  ||  utils.getId(me.organization) !== utils.getId(org))
      return
    let myOrg = me.organization
    if (myOrg._canShareContext === org._canShareContext &&
        myOrg._hasSupportLine === org._hasSupportLine)
      return
    myOrg._canShareContext = org._canShareContext
    myOrg._hasSupportLine = org._hasSupportLine
    this.setMe(me)
    this.dbPut(utils.getId(me), me)
  },
  configProvider(sp, org) {
    let config = sp.publicConfig
    if (!config)
      return
    let orgId = utils.getId(org)
    for (var p in config)
      org['_' + p] = config[p]

    if (org._country) {
      let countries = this.searchNotMessages({modelName:'tradle.Country'})
      let country = countries.filter((c) => {
        return c.code === org._country ||  c.country === org._country
      })
      if (country)
        org.country = this.buildRef(country[0])
      delete org._country
    }
    if (org._currency) {
      let currencies = this.searchNotMessages({modelName:'tradle.Currency'})
      let currency = currencies.filter((c) => {
        return c.code === org._currency || c.currencyName === org._currency
      })
      delete org._currency
      if (currency) {
        org.currency = this.buildRef(currency[0])
        let code = currency[0].code
        if (currency[0].symbol)
          org.currency.symbol = currency[0].symbol
        else {
          let currencies = this.getModel(MONEY).properties.currency.oneOf
          for (let i=0; i<currencies.length  &&  !org.currency.symbol; i++) {
            if (currencies[i][code])
              org.currency.symbol = currencies[i][code]
          }
        }
        this._setItem(orgId, org)
        this.dbPut(orgId, org)
      }
    }
    if (org._defaultPropertyValues) {
      for (let m in org._defaultPropertyValues) {
        let mm = this.getModel(m)
        let props = mm.properties
        let mObj = org._defaultPropertyValues[m]
        for (let p in mObj) {
          if (props[p].ref  &&  this.getModel(props[p].ref).subClassOf === ENUM) {
            let enumList = this.searchNotMessages({modelName: props[p].ref})
            let eprop = utils.getEnumProperty(this.getModel(props[p].ref))
            let val = enumList.filter((eVal) => eVal[eprop] === mObj[p])
            if (val.length)
              mObj[p] = this.buildRef(val[0])
          }
        }
      }
      utils.addDefaultPropertyValuesFor(org)
    }
    if (org._hidePropertyInEdit)
      utils.addHidePropertyInEditFor(org)
    if (config.greeting) {
      if (typeof config.greeting === 'string')
        org._greeting = config.greeting
      else
        org._greeting = utils.isWeb() ? config.greeting.web : config.greeting.mobile
    }
  },

  addContact(data, hash, noMessage) {
    var ikey = IDENTITY + '_' + hash
    var pkey = PROFILE + '_' + hash

    var profile = list[pkey] && this._getItem(pkey)
    var identity = list[ikey]  &&  this._getItem(ikey)

    var batch = []
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
        profile._unread = 1
        if (noMessage)
          profile._inactive = true
      }

      profile.formatted = profile.firstName + (data && data.lastName ? ' ' + data.lastName : '')
      var identity = data.identity
      identity[ROOT_HASH] = hash
      identity[CUR_HASH] = hash

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
    if (!isDevicePairing) {
      if (!this._getItem(utils.getId(profile)).bot)
        this.trigger({action: 'newContact', newContact: profile})
    }

    let promise
    if (isDevicePairing)
      promise = Q()
    else {
      let r = this._getItem(utils.getId(profile))
      if ((r  &&  r.bot) || noMessage)
        promise = Q()
      else {
        if (profile._inactive) {
          profile._inactive = false
          batch.push({type: 'put', key: pkey, value: profile })
        }

        promise = this.onAddMessage({msg: {
                    [TYPE]: SIMPLE_MESSAGE,
                    message: translate('howCanIHelpYou', profile.formatted, utils.getMe().firstName),
                    from: this.buildRef(utils.getMe()),
                    to: this._getItem(pkey)
                  }})
      }
    }
    // return newContact ? db.batch(batch) : Q()
    // .then(() => {
    // return isDevicePairing ? Q() : this.onAddMessage({
    //     [TYPE]: SIMPLE_MESSAGE,
    //     message: translate('howCanIHelpYou', profile.formatted, utils.getMe().firstName),
    //     from: this.buildRef(utils.getMe()),
    //     to: this._getItem(pkey)
    //   })
    return promise
    .then(() => {
      if (batch.length)
        return db.batch(batch)
    })
    // })
    .catch((err) => {
      debugger
    })
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
    this.triggerBusy()
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
  onSetPreferences(preferences) {
    this.preferences = preferences
  },
  onAddMessage(params) {
    let r = params.msg
    let isWelcome = params.isWelcome
    let requestForForm = params.requestForForm
    let cb = params.cb
    var disableAutoResponse = params.disableAutoResponse

    var self = this
    let m = this.getModel(r[TYPE])
    var props = m.properties;
    if (!r.time)
      r.time = new Date().getTime();
    var toOrg
    // r.to could be a reference to a resource
    var to = this._getItem(r.to)
    // if (!r.to[TYPE])
    //   r.to = this._getItem(r.to)
    let isReadOnlyContext
    if (to[TYPE] === ORGANIZATION) {
      var orgId = utils.getId(r.to)
      var orgRep = this.getRepresentative(orgId)
      // if (me.isEmployee  &&  utils.getId(me.organization) === orgId)
      //   return
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
    else
      isReadOnlyContext = to[TYPE]  === PRODUCT_APPLICATION  &&  utils.isReadOnlyChat(to)


    let isSelfIntroduction = r[TYPE] === SELF_INTRODUCTION

    var rr = {};
    var context
    if (r._context) {
      rr._context = r._context
      context = this._getItem(r._context)
    }
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
    if (isSelfIntroduction)
      toChain.profile = { firstName: me.firstName }
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
    // var promise = Q(protocol.linkString(toChain))
    let hash = r.to[ROOT_HASH]
    if (!hash)
      hash = this._getItem(utils.getId(r.to))[ROOT_HASH]
    var toId = IDENTITY + '_' + hash
    rr._sendStatus = self.isConnected ? SENDING : QUEUED
    var noCustomerWaiting
    return meDriver.sign({ object: toChain })
    .then(function(result) {
      toChain = result.object
      let hash = protocol.linkString(result.object)

      rr[ROOT_HASH] = r[ROOT_HASH] = rr[CUR_HASH] = r[CUR_HASH] = hash
      let isProductApplication = r[TYPE] === PRODUCT_APPLICATION
      if (isProductApplication) {
        rr._context = r._context = {id: utils.getId(r), title: r.product}
        let params = {
          action: 'addItem',
          resource: rr,
          // sendStatus: sendStatus
        }
        self.trigger(params)
        self.addLastMessage(r, batch)
      }
      else if (!isWelcome)
        self.addLastMessage(r, batch)

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

      // ProductApplication was requested as a part of verification process from different provider
      if (isProductApplication)
        isWelcome = false
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
          var allMyIdentities = self._getItem(MY_IDENTITIES)
          var all = allMyIdentities.allIdentities
          var curId = allMyIdentities.currentIdentity

          let identity = all.filter((id) => id.id === curId)
          console.log('Store.onAddMessage: type = ' + r[TYPE] + '; to = ' + r.to.title)
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
          return self.onAddMessage({msg: msg, disableAutoResponse: disableAutoResponse})
        }
      })
    })
    .then(function() {
      if (isWelcome  &&  utils.isEmpty(welcomeMessage))
        return;

      // Temporary untill the real hash is known
      var key = utils.getId(rr)

      rr.to = self.buildRef(isReadOnlyContext ? context.to : r.to)
      if (r[TYPE] === PRODUCT_APPLICATION)
        rr.to.organization = self.buildRef(to)

      self._setItem(key, rr)

      if (!toOrg)
        toOrg = to.organization ? to.organization : to

      if (rr._context &&  utils.isReadOnlyChat(rr._context)) {
        let cId = utils.getId(rr._context)
        self.addMessagesToChat(cId, rr)
        let context = self._getItem(rr._context)
        if (rr[TYPE] === APPLICATION_DENIAL  ||  rr[TYPE] === CONFIRMATION) {
          if (rr[TYPE] === APPLICATION_DENIAL)
            context._denied = true
          else
            context._approved = true
          self.trigger({action: 'updateRow', resource: context, forceUpdate: true})
          self.dbPut(cId, context)
        }
      }
      else
        self.addMessagesToChat(utils.getId(toOrg), rr)

      var params = {
        action: 'addMessage',
        resource: isWelcome ? welcomeMessage : rr
      }
      if (error)
        params.error = error
      self.trigger(params)
      if (batch.length  &&  !error  &&  (isReadOnlyContext || self._getItem(toId).pubkeys))
        return self.getDriver(me)
    })
    .then(function() {
      // SelfIntroduction or IdentityPublishRequest were just sent
      if (noCustomerWaiting)
        return
      if (isReadOnlyContext)
        return self.sendMessageToContextOwners(toChain, [context.from, context.to], context)

      if (self._getItem(toId).pubkeys) {
        // let sendParams = self.packMessage(r, toChain)
        let sendParams = self.packMessage(toChain, r.from, r.to, r._context)
        if (disableAutoResponse) {
          if (!sendParams.other)
            sendParams.other = {}
          sendParams.other.disableAutoResponse = true
        }
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
      if (isReadOnlyContext)
        return
      // cleanup temporary resources from the chat message references and from the in-memory storage - 'list'
      if (!toOrg)
        toOrg = to.organization ? to.organization : to

      let orgId = utils.getId(toOrg)
      // self.deleteMessageFromChat(orgId, rr)
      // delete list[rr[TYPE] + '_' + tmpKey]

      // saving the new message
      const data = utils.toOldStyleWrapper(result.message)
      if (data)  {
        rr[ROOT_HASH] = data[ROOT_HASH]
        rr[CUR_HASH] = data[CUR_HASH]
      }
      var key = utils.getId(rr)

      self.dbBatchPut(key, rr, batch)
      // rr._sendStatus = self.isConnected ? SENDING : QUEUED

      self._setItem(key, rr)
      // self.addMessagesToChat(orgId, rr)
      return db.batch(batch)
    })
    .catch(function(err) {
      debugger
    })
    .finally(() => {
      if (cb)
        cb(rr)
    })
  },

  packMessage(toChain, from, to, context) {
    var sendParams = {
      object: toChain
    }
    to = this._getItem(utils.getId(to))
    let provider, hash
    if (to[ROOT_HASH] === me[ROOT_HASH]) {
      provider = this._getItem(from)
      hash = provider[ROOT_HASH]
    }
    else
      provider = to
    hash = provider[ROOT_HASH]

    // if (!hash)
    //   hash = provider[ROOT_HASH]

    var isEmployee
    if (me.organization) {
      isEmployee = utils.isEmployee(to)
      // See if the sender is in a process of verifying some form in shared context chat
      if (!isEmployee  &&  context)
        isEmployee = utils.isReadOnlyChat(this._getItem(context))
    }
    // if (me.isEmployee)
    //   isEmployee = (!to.organization ||  utils.getId(to.organization) === utils.getId(me.organization))

    // let isEmployee = me.isEmployee && (!r.to.organization || utils.getId(r.to.organization) === utils.getId(me.organization))
    if (isEmployee) {
      let arr
      if (SERVICE_PROVIDERS)
        arr = SERVICE_PROVIDERS.filter((sp) => {
          let reps = this.getRepresentatives(sp.org)
          let talkingToBot = reps.forEach((r) => {
            return r[ROOT_HASH] === hash ? true : false
          })
          return talkingToBot  &&  talkingToBot.length ? true : false
        })
      else  {
        if (!to.bot)
          arr = [to]
      }
      if (!arr  ||  !arr.length) {
        var toRootHash = hash

        sendParams.other = {
          forward: toRootHash
        }
        let rep = this.getRepresentative(utils.getId(me.organization))

        sendParams.to = { permalink: rep[ROOT_HASH] }
      }
    }
    if (context) {
      if (!sendParams.other)
        sendParams.other = {}
      let cId = utils.getId(context)
      sendParams.other.context = cId.split('_')[1]
      if (toChain[TYPE] !== PRODUCT_APPLICATION) {
        let c = this._getItem(cId)
        // will be null for PRODUCT_APPLICATION itself
        if (c) {
          c.lastMessageTime = new Date().getTime()
          c.formsCount = c.formsCount ? ++c.formsCount : 1
          this.dbPut(cId, c)
        }
      }
    }
    if (!sendParams.to) {
      var toId = IDENTITY + '_' + hash
      sendParams.to = { permalink: hash }
    }
    return sendParams
  },
  // disableOtherFormRequestsLikeThis(rr) {
  //   let fromRep = utils.getId(rr.from)
  //   let orgId = utils.getId(this._getItem(fromRep).organization)
  //   let messages = chatMessages[orgId]
  //   let batch = []
  //   messages.forEach((r) => {
  //     let m = this._getItem(r.id)
  //     if (m[TYPE] === FORM_REQUEST  &&
  //         m[ROOT_HASH] !== rr[ROOT_HASH] &&
  //         m.product === rr.product  &&
  //         m.form === rr.form        &&
  //         !m.document               &&
  //         !m.documentCreated) {
  //       m.documentCreated = true
  //       batch.push({type: 'put', key: utils.getId(m), value: m})
  //     }
  //   })
  //   if (batch.length)
  //     return db.batch(batch)
  // },

  // Every chat has it's own messages array where
  // all the messages present in order they were received
  addMessagesToChat(id, r, isInit, timeShared) {
    if (r.documentCreated  &&  !isInit)
      return
    if (!r.time  &&  !timeShared)
      return
    // if (r.sharedWith) {
    //   if (r[TYPE] !== VERIFICATION) {
    //     if (id.split('_')[0] === ORGANIZATION) {
    //       let o = this._getItem(utils.getId(r.to)).organization
    //       if (utils.getId(o) !== id)
    //         return
    //     }
    //   }
    // }
    // Check if this is a shared context
    if (r._context) {
      let c = this._getItem(r._context)
      // context could be empty if ForgetMe was requested for the provider where form was originally created
      // if (c  &&  c._readOnly)
      if (utils.isReadOnlyChat(r))
        id = utils.getId(r._context)
    }
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
        for (let i=0; i<messages.length  &&  idx === -1; i++)
          if (messages[i].id === rid)
            idx = i

        if (idx !== -1) {
          if (r.time === list[rid].value.time)
            return
          messages.splice(idx, 1)
        }
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

  onAddVerification(params) {
    let r = params.r

    let notOneClickVerification = params.notOneClickVerification
    let to = params.to || [r.to]
    let document = params.document || r.document

    // if (__DEV__) {
    //   let newV = newVerificationTree(r, 4)
    //   if (newV) {
    //     delete newV.from
    //     extend(r, newV, true)
    //   }
    // }

    let dontSend = params.dontSend
    let time = r && r.time || new Date().getTime()
    let self = this
    let fromId = utils.getId(r  &&  r.from || me)
    let from = this._getItem(fromId)
    let newVerification
    let isReadOnly
    let key

    let promise = (dontSend)
                ? Q()
                : meDriver.createObject({object: {
                    [TYPE]: VERIFICATION,
                    document: document,
                    time: time
                  }})

    return promise
    .then((result) => {
      if (result) {
        r = utils.clone(result.object)
        r[ROOT_HASH] = result.permalink
        r[CUR_HASH] = result.link
        r.from = this.buildRef(me)
        r.to = this.buildRef(this._getItem(to[0]))
      }
      newVerification = this.buildRef(r)
      let context = r._context
      if (!context) {
        document = this._getItem(utils.getId(document))
        context = document._context
        if (context)
          r._context = context
      }
      var promise = dontSend
                   ? Q()
                   : this.sendMessageToContextOwners(result.object, to, context)
                 // meDriver.signAndSend(sendParams)
                    // meDriver.signAndSend({
                    //   object: toChain,
                    //   to: { fingerprint: this.getFingerprint(list[key].value) }
                    // })
      return promise
    })
    .then(() => {
      key = utils.getId(r)
      if (!r._sharedWith) {
        r._sharedWith = []
        // Case where employee verifies the form
        if (me &&  me.isEmployee) {
          let rep = this.getRepresentative(utils.getId(me.organization))
          this.addSharedWith(r, rep, r.time)
        }
        else
          this.addSharedWith(r, r.from, r.time)
      }
      // if (dontSend  &&  r.sources) {
      //   let result = self.searchMessages({modelName: VERIFICATION, to: r.to})
      //   r.sources.forEach((s) => {
      //     let from = s.from
      //     delete s.from

      //     s[ROOT_HASH] = tradleUtils.hexLink(s)
      //     s.from = from
      //     let v = this._getItem(VERIFICATION + '_' + s[ROOT_HASH])
      //     if (v)  {
      //       if (!v._verifies)
      //         v._verifies = []
      //       v._verifies.push(utils.clone(v.document))
      //     }
      //   })
      // }
      var batch = [];
      this.dbBatchPut(key, r, batch);
      let len = batch.length

      if (r._context) {
        let c = this._getItem(utils.getId(r._context));
        isReadOnly = utils.isReadOnlyChat(c) //c  &&  c._readOnly
      }
      if (!isReadOnly)
        this.addLastMessage(r, batch)
      if (r.sources) {
        let docId = utils.getId(r.document)
        let docs = []
        getDocs(r.sources, docId, docs)
        let supportingDocs = docs.map((r) => this.buildRef(r))
        let d = this._getItem(docId)
        d._supportingDocuments = supportingDocs
        this.dbPut(docId, d)
        this._setItem(docId, d)
      }
      return db.batch(batch)
    })
    .then(() => {
      this.addVisualProps(r)
      // var rr = {};
      // extend(rr, from);
      // rr.verifiedByMe = r;
      this._setItem(key, r)

      let context = r._context ? this._getItem(r._context) : null
      if (isReadOnly)
        this.addMessagesToChat(utils.getId(r._context), r)
      if (fromId === utils.getId(me)) {
        to.forEach((recipient) => {
          this.addMessagesToChat(utils.getId(recipient), r)
        })
      }
      else if (context && params.isThirdPartySentRequest) {
        let cOrg = this._getItem(context.to).organization
        this.addMessagesToChat(utils.getId(cOrg), r)
      }
      else
        this.addMessagesToChat(from.organization ? utils.getId(from.organization) : fromId, r)

      if (notOneClickVerification)
        this.trigger({action: 'addItem', resource: r});
      else
        this.trigger({action: 'addVerification', resource: r});

      var verificationRequestId = utils.getId(r.document);
      var verificationRequest = this._getItem(verificationRequestId)
      if (!verificationRequest.verifications)
        verificationRequest.verifications = [];
      if (!r.txId) {
        verificationRequest.verifications.push(this.buildRef(newVerification));
      }
      else {
        for (var i=0; i<verificationRequest.verifications.length; i++) {
          if (utils.getId(verificationRequest.verifications).split('_')[1] === r[ROOT_HASH])
            verificationRequest.verifications = this.buildRef(newVerification)
        }
      }
      // if (!verificationRequest._sharedWith)
      //   verificationRequest._sharedWith = []
      // verificationRequest._sharedWith.push(fromId)
      return this.dbPut(verificationRequestId, verificationRequest);
    })
    .catch((err) => {
      debugger
      err = err
    })
    function getDocs(varr, rId, docs) {
      if (!varr)
        return
      varr.forEach((v) => {
        if (v.method) {
          if (utils.getId(v.document) !== rId)
            docs.push(v.document)
        }
        else if (v.sources)
          self.getDocs(v.sources, rId, docs)
      })
    }

  },
  addVisualProps(r) {
    let from = this._getItem(r.from || me)
    if (from.organization) {
      r.from.organization = from.organization
      let fOrg = this._getItem(from.organization)
      if (fOrg.photos)
        r.from.photo = fOrg.photos[0]
      if (r[TYPE] === VERIFICATION)
        r.organization = from.organization
    }
    let to = this._getItem(r.to)
    if (to.organization) {
      r.to.organization = to.organization
      let toOrg = this._getItem(to.organization)
      if (toOrg.photos)
        r.to.photo = toOrg.photos[0]
    }
    if (r && r._verifiedBy) {
      let verifiedBy = this._getItem(r._verifiedBy)
      if (verifiedBy.organization)
        r._verifiedBy.organization = verifiedBy.organization
      if (verifiedBy.photos)
        r._verifiedBy.photo = verifiedBy.photos[0]
    }
    return r
  },
  sendMessageToContextOwners(v, recipients, context) {
    return Q.all(recipients.map((to) => {
      let sendParams = this.packMessage(v, me, to, context)
      return meDriver.send(sendParams)
    }))
  },
  onGetTo(key) {
    this.onGetItem(key, 'getTo');
  },
  onGetFrom(key) {
    this.onGetItem(key, 'getFrom');
  },
  addSharedWith(r, shareWith, time, shareBatchId) {
    // if (!r._sharedWith)
    //   r._sharedWith = []
    let id = utils.getId(shareWith)
    if (id === utils.getId(utils.getMe()))
      debugger
    r._sharedWith.push(this.createSharedWith(id, time, shareBatchId))
  },

  onGetItem(key, action) {
    Q.all([this.myResourcesLoaded])
    .then(() => {
      var resource = {};

      extend(resource, this._getItem(utils.getId(key)))

      const resModel = this.getModel(resource[TYPE])
      if (!resModel) {
        throw new Error(`missing model for ${resource[TYPE]}`)
      }

      var props = resModel.properties;
      for (var p in props) {
        if (p.charAt(0) === '_'  ||  props[p].hidden)
          continue;
        var items = props[p].items;
        if (!items  ||  !items.backlink)
          continue;
        var backlink = items.backlink;
        var itemsModel = this.getModel(items.ref);
        var params = {
          modelName: items.ref,
          to: resource,
          meta: itemsModel,
          prop: props[p],
          props: itemsModel.properties
        }
        var meta = this.getModel(items.ref)
        var isMessage = utils.isMessage(meta)
        var result = isMessage ? this.searchMessages(params) : this.searchNotMessages(params)
        if (result  &&  result.length)
          resource[p] = result;
      }
      this.trigger({ resource: resource, action: action || 'getItem'});
    })
  },
  onExploreBacklink(resource, prop, backlinkAdded) {
    let list = this.searchMessages({
      prop: prop,
      modelName: prop.items.ref,
      to: resource
    })
    this.trigger({action: 'exploreBacklink', resource: resource, backlink: prop, list: list, backlinkAdded: backlinkAdded})
  },
  onGetDetails(resource) {
    this.trigger({action: 'showDetails', resource: resource})
  },
  onGetDocuments(resource, docs) {
    let list = docs.map((r) => this._getItem(utils.getId(r)))
    this.trigger({action: 'showDocuments', list: list, resource: resource})
  },
  getItem(resource) {
    var self = this;
    var modelName = resource[TYPE];
    var meta = this.getModel(modelName)
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
            var elm = {value: this._getItem(rValue), state: 'fulfilled'};
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
      //   title: utils.getDisplayName(me, self.getModel(PROFILE).properties),
        // photos: me.photos
      // }
      // Wil need to publish new model
      return self.dbPut(key, model);
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

  async onAddAll(resource, to, message) {
    let rId = utils.getId(resource)
    let r = this._getItem(rId)
    r.documentCreated = true
    this.trigger({action: 'addItem', resource: r})
    this.dbPut(rId, r)
    let context = resource._context
    // prepare some whitespace
    const numRows = 5
    const white = ' '.repeat(40)
    const messages = new Array(numRows).fill(white)
    const title = `${translate('importing')}...          ` // extra whitespace on purpose

    Actions.showModal({
      title,
      message: messages.join('\n')
    })

    for (let i = 0; i < resource.items.length; i++) {
      await utils.promiseDelay(200)
      let item = resource.items[i]
      item._context = context
      item.to = to
      item.from = me
      let itemType = utils.getType(item)
      let itemModel = this.getModel(itemType)
      let displayName = ''
      if (itemModel) displayName += itemModel.title + ': '

      displayName += item.title || utils.getDisplayName(item)

      if (i > 0) {
        let last = messages.length - 1
        messages[last] = messages[last].replace('importing', 'imported')
      }

      // let's not run out of room on the screen
      let next = displayName // `importing "${displayName}"`
      if (next.length > 30) {
        next = next.slice(0, 27) + '...'
      }

      let idx = Math.min(numRows - 1, i)
      if (messages[idx].trim()) {
        messages.shift()
        messages.push(next)
      } else {
        messages[idx] = next
      }

      Actions.showModal({
        title,
        message: messages.join('\n\n')
      })

      let promiseAddItem = this.onAddItem({ resource: item, noTrigger: true })
      let promiseSentEvent = new Promise(resolve => meDriver.once('sent', resolve))
      await Promise.all([
        promiseAddItem,
        Promise.race([
          promiseSentEvent,
          // force continue loop
          utils.promiseDelay(2000)
        ])
      ])
    }

    await utils.promiseDelay(200)
    Actions.hideModal()

    this.onAddMessage({msg: {
      [TYPE]: REMEDIATION_SIMPLE_MESSAGE,
      [NONCE]: this.getNonce(),
      message: message,
      time: new Date().getTime(),
      _context: resource._context,
      from: this.buildRef(me),
      to: this.buildRef(r.from)
    }})

    // bulk example:

    // const signed = await Q.all(resource.items.map(form => {
    //   return applicant.createObject({ object: form })
    // }))

    // // store `signed` in `list`

    // const result = await meDriver.signAndSend({
    //   to: to,
    //   object: {
    //     [TYPE]: 'tradle.ConfirmPackageResponse',
    //     message: REMEDIATION_SIMPLE_MESSAGE,
    //     sigs: signed.map(wrapper => wrapper.object[SIG])
    //   }
    // })
  },
  onAddItem(params) {
    var self = this
    var resource = params.resource
    var value = params.value
    var doneWithMultiEntry = params.doneWithMultiEntry
    if (!value)
      value = resource
    let cb = params.cb

    delete temporaryResources[resource[TYPE]]
    var meta = params.meta;
    if (!meta)
      meta = this.getModel(resource[TYPE])
    var shareWith = params.shareWith

    var isRegistration = params.isRegistration;
    var additionalInfo = params.additionalInfo;
    // Check if there are references to other resources
    var refProps = {};
    var promises = [];
    var foundRefs = [];
    var props = meta.properties;

    if (meta.id == VERIFICATION  ||  meta.subClassOf === VERIFICATION)
      return this.onAddVerification({r: resource, notOneClickVerification: true});
    let isGuestSessionProof = meta.id === GUEST_SESSION_PROOF
    // Check if the recipient is not one if the creators of this context.
    // If NOT send the message to the counterparty of the context
    let context = resource._context || value._context
    let isRemediation
    if (context) {
      context = this._getItem(context)
      isRemediation = context.product === REMEDIATION
      let toId = utils.getId(resource.to)
      if (toId !== utils.getId(context.to)  &&  toId !== utils.getId(context.from))
        resource.to = utils.clone(utils.getId(context.to) === utils.getId(me) ? context.from : context.to)
    }
    let isSelfIntroduction = meta[TYPE] === SELF_INTRODUCTION
    var isNew = !resource[ROOT_HASH];

    var checkPublish
    var isBecomingEmployee = isNew ? false : becomingEmployee(resource)
    if (isBecomingEmployee) {
      if (isBecomingEmployee.error) {
        this.trigger({action: 'addItem', error: isBecomingEmployee.error})
        return
      }
      isBecomingEmployee = isBecomingEmployee.isBecomingEmployee
    }
    // Data were obtaipackmy scanning QR code of the forms that were entered on Web
    if (isGuestSessionProof) {
      resource[TYPE] = PRODUCT_APPLICATION
      resource.product = REMEDIATION
    }
    if (isGuestSessionProof || isBecomingEmployee) {
      checkPublish = this.getDriver(me)
      .then(function () {
        // if (publishRequestSent)
          return meDriver.identityPublishStatus()
      })
      .then(function(status) {
        if (!status.watches.link  &&  !status.link) {
          let rep = isBecomingEmployee
                  ? self.getRepresentative(utils.getId(resource.organization))
                  : self._getItem(utils.getId(resource.to))
          return self.publishMyIdentity(rep, params.disableAutoResponse)
        }
        else {
          let orgRep
          if (isBecomingEmployee) {
            let orgId = utils.getId(resource.organization)
            orgRep = self.getRepresentative(orgId)
          }
          else
            orgRep = self._getItem(utils.getId(resource.to))

          console.log('Store.onAddItem: type = ' + resource[TYPE] + (resource.to ? '; to = ' + resource.to.title : ''))

          var msg = {
            message: me.firstName + ' is waiting for the response',
            [TYPE]: SELF_INTRODUCTION,
            identity: meDriver.identity,
            profile: {
              firstName: me.firstName,
            },
            from: me,
            to: orgRep
          }

          return self.onAddMessage({msg: msg, disableAutoResponse: params.disableAutoResponse})
        }
      })
    } else {
      checkPublish = Q()
    }

    return checkPublish
    .then(() => {
      for (var p in resource) {
        if (!props[p] ||  props[p].type !== 'object')
          continue
        var ref = props[p].ref;
        if (!ref  ||  !resource[p])
          continue
        let refModel = this.getModel(ref)
        if (refModel.inlined  ||  refModel.subClassOf === ENUM)
          continue;

        var rValue = utils.getId(resource[p])
        refProps[rValue] = p;
        if (list[rValue]) {
          var elm = {value: this._getItem(rValue), state: 'fulfilled'};
          foundRefs.push(elm);
        }
        else
          promises.push(Q.ninvoke(db, 'get', rValue));
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
      if (!isSelfIntroduction  &&  !doneWithMultiEntry)
        resource = utils.optimizeResource(resource)

      var isMessage = utils.isMessage(meta)
      var readOnlyBacklinks = []
      return Q.allSettled(promises)
      .then(function(results) {
        let allFoundRefs = foundRefs.concat(results);
        allFoundRefs.forEach(function(val) {
          if (val.state !== 'fulfilled')
            return
          var value = val.value;
          var propValue = utils.getId(value)
          var prop = refProps[propValue];

          var title = utils.getDisplayName(value, self.getModel(value[TYPE]).properties);
          json[prop] = self.buildRef(value)
        });

        if (isMessage  &&  !json.documentCreated  &&  (!isRemediation ||  !json.time))
          json.time = new Date().getTime();
        if (isNew  ||  !value.documentCreated) //(meta.id !== FORM_ERROR  &&  meta.id !== FORM_REQUEST  &&  !meta.id === FORM_ERROR))
          resource.time = new Date().getTime();

        if (!resource  ||  isNew)
          returnVal = json
        else {
          returnVal = {};
          extend(true, returnVal, resource);
          for (var p in json)
            // Could be metadata property that is why it preceeds the next 'else'
            if (!returnVal[p])
              returnVal[p] = json[p];
            else if (!props[p])
              continue
            else if (!props[p].readOnly  &&  !props[p].immutable)
              returnVal[p] = json[p];
        }
        for (let p in props) {
          if (!returnVal[p]  &&  props[p].backlink  &&  props[p].ref  &&  props[p].readOnly)
            readOnlyBacklinks.push(props[p])
        }
        if (readOnlyBacklinks.length) {
          readOnlyBacklinks.forEach((prop) => {
            let pm = self.getModel(prop.ref)
            let isMessage = utils.isMessage(pm)
            if (isMessage) {
              let result = self.searchMessages({modelName: prop.ref, context: context})
              if (result  &&  result.length)
                returnVal[prop.name] = self.buildRef(result[0])
            }
          })
        }

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
          return handleMessage(params.noTrigger, returnVal)
        else
          return save(returnVal, isBecomingEmployee)
      })
      .then(() => {
        if (params.disableFormRequest) {
          // let result = self.searchMessages({modelName: FORM_REQUEST, to: resource.to, context: resource._context})
          // if (result &&  result.length) {
          //   result.forEach((fr) => {
            let fr = this._getItem(utils.getId(params.disableFormRequest))

            if (!fr.documentCreated  &&  fr.form === resource[TYPE]) {
              fr.documentCreated = true
              let key = utils.getId(fr)
              self._setItem(key, fr)
              self.dbPut(key, fr)
              self.trigger({action: 'addItem', resource: fr})
            }
          //   })
          // }
        }
        if (isBecomingEmployee) {
          let orgId = utils.getId(resource.organization)
          let orgRep = self.getRepresentative(orgId)

          let msg = {
            [TYPE]: PRODUCT_APPLICATION,
            product: EMPLOYEE_ONBOARDING,
            time: new Date().getTime()
          }
          self.trigger({action: 'employeeOnboarding', to: this._getItem(orgId)})
          meDriver.createObject({object: msg})
          .then((data) => {
            let hash = data.link
            msg = utils.clone(msg)
            msg[CUR_HASH] = hash
            msg[ROOT_HASH] = hash
            msg._context = self.buildRef(msg)
            msg.to = self.buildRef(orgRep)
            msg.from = self.buildRef(me)

            let sendParams = {
              link: hash,
              to: { permalink: orgRep[ROOT_HASH] },
              other: { context: hash }
            }
            self._setItem(utils.getId(msg), msg)
            self.addMessagesToChat(orgId, msg)
            return meDriver.send(sendParams)
          })
          .catch(function (err) {
            console.log('Store.onAddItem: ' + err.message)
            debugger
          })
        }
        else if (params.cb) {
          if (returnVal[TYPE] !== SETTINGS)
            params.cb(returnVal)
          else {
            // return newly created provider
            SERVICE_PROVIDERS.forEach((r) => {
              if (r.id === returnVal.id  &&  utils.urlsEqual(r.url, returnVal.url))
                params.cb(self._getItem(utils.getId(r.org)))
            })
          }
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

            return save(returnVal)
          })
      }

      function handleMessage (noTrigger, returnVal) {
        // TODO: fix hack
        // hack: we don't know root hash yet, use a fake
        if (returnVal.documentCreated)  {
          // when all the multientry forms are filled out and next form is requested
          // do not show the last form request for the multientry form it is confusing for the user
          if (doneWithMultiEntry) {
            let ptype = returnVal[TYPE] === FORM_REQUEST && returnVal.product
            if (ptype) {
              let multiEntryForms = self.getModel(ptype).multiEntryForms
              if (multiEntryForms  &&  multiEntryForms.indexOf(returnVal.form) !== -1) {
                let rid = returnVal.from.organization.id
                self.deleteMessageFromChat(rid, returnVal)
                let id = utils.getId(returnVal)
                delete list[id]
                db.del(id)
                var params = {action: 'addItem', resource: returnVal}
                self.trigger(params);
                return
              }
            }
          }
          var params = {action: 'addItem', resource: returnVal}
          // return self.disableOtherFormRequestsLikeThis(returnVal)
          // .then(() => {
            // don't save until the real resource is created
          list[utils.getId(returnVal)].value = returnVal
          self.trigger(params);
          return self.onIdle()
          .then(() => {
            save(returnVal)
          })
          .catch(function(err) {
            debugger
          })
          // })
        }
        // Trigger painting before send. for that set ROOT_HASH to some temporary value like NONCE
        // and reset it after the real root hash will be known
        let isNew = returnVal[ROOT_HASH] == null
        let isForm = self.getModel(returnVal[TYPE]).subClassOf === FORM
        if (!isNew  &&  isForm) {
          let formId = utils.getId(returnVal)
          let prevRes = self._getItem(formId)
          if (utils.compare(returnVal, prevRes)) {
            self.trigger({action: 'noChanges'})
            return
          }
        }


        let rId = utils.getId(returnVal.to)
        let to = self._getItem(rId)
        let permalink = to[ROOT_HASH]
        var toChain = {}

        let exclude = ['to', 'from', 'verifications', CUR_HASH, '_sharedWith', '_sendStatus', '_context', '_online', 'idOld']
        // if (isNew)
        //   exclude.push(ROOT_HASH)
        extend(toChain, returnVal)
        for (let p of exclude)
          delete toChain[p]

        if (!isNew) {
          toChain[PREV_HASH] = returnVal[CUR_HASH]
          let properties = self.getModel(returnVal[TYPE]).properties
          for (let p in toChain)
            if (!properties[p]  && p !== TYPE && p !== ROOT_HASH && p !== PREV_HASH)
              delete toChain[p]
        }

        // toChain.time = returnVal.time

        var key = IDENTITY + '_' + to[ROOT_HASH]

        // let sendParams = self.packMessage(toChain, returnVal.from, returnVal.to, returnVal._context)
        return meDriver.createObject({object: toChain})
        .then((data) => {
          let hash = data.link
          if (isNew)
            returnVal[ROOT_HASH] = hash
          returnVal[CUR_HASH] = hash

          var returnValKey = utils.getId(returnVal)

          self._setItem(returnValKey, returnVal)
          let org
          if (!utils.isSavedItem(returnVal)) {
            org = self._getItem(utils.getId(returnVal.to)).organization
            let orgId = utils.getId(org)
            self.addMessagesToChat(orgId, returnVal)
          }
          var params;

          var sendStatus = (self.isConnected) ? SENDING : QUEUED
          if (isGuestSessionProof) {
            org = self._getItem(utils.getId(org))
            params = {action: 'getForms', to: org}
          }
          else {
            returnVal._sendStatus = sendStatus
            // if (isNew)
            self.addVisualProps(returnVal)
            params = {
              action: 'addItem',
              resource: returnVal
            }
          }

          var m = self.getModel(returnVal[TYPE])
          try {
            if (!noTrigger)
              self.trigger(params);
          } catch (err) {
            debugger
          }

          if (!utils.isSavedItem(returnVal)) {
            let sendParams = {
              to: {permalink: permalink},
              link: hash,
            }
            if (returnVal._context) {
              sendParams.other = {
                context: self._getItem(utils.getId(returnVal._context))[ROOT_HASH]
              }
            }

            return meDriver.send(sendParams)
          }
        })
        .then(function (result) {
          if (readOnlyBacklinks.length) {
            readOnlyBacklinks.forEach((prop) => {
              let topR = returnVal[prop.name]
              if (topR) {
                if (!topR[prop.backlink])
                  topR[prop.backlink] = []
                topR[prop.backlink].push(self.buildRef(returnVal))
              }
            })
          }

          delete returnVal._sharedWith
          delete returnVal.verifications
          return save(returnVal, true)
        })
        .then(() => {
          if (returnVal[TYPE] === ASSIGN_RM) {
            let app = self._getItem(returnVal.application)
            app._relationshipManager = true
            self.dbPut(utils.getId(app), app)
          }
          let rId = utils.getId(returnVal.to)
          let to = self._getItem(rId)

          if (!isNew  ||  self.getModel(returnVal[TYPE]).subClassOf !== FORM)
            return
          let allFormRequests = self.searchMessages({modelName: FORM_REQUEST, to: to})
          let formRequests = allFormRequests  &&  allFormRequests.filter((r) => {
            if (r.document === returnVal[NONCE])
              return true
          })
          if (formRequests  &&  formRequests.length) {
            let req = formRequests[0]
            req.document = utils.getId(returnVal)
            // returnVal = req
            return save(req, true)
          }
        })
      }
      function save (returnVal, noTrigger) {
        let r = {
          type: returnVal[TYPE],
          resource: returnVal,
          roothash: returnVal[ROOT_HASH],
          isRegistration: isRegistration,
          noTrigger: noTrigger
        }
        if (params.maxAttempts)
          r.maxAttempts = params.maxAttempts
        return self._putResourceInDB(r)
      }
    })

    function becomingEmployee(resource) {
      if (resource[TYPE] !== PROFILE)
        return

      if (!resource.organization  &&  !me.organization)
        return

      let meOrgId = me.organization ? utils.getId(me.organization) : null
      let newOrgId = utils.getId(resource.organization)

      if (meOrgId  &&  meOrgId !== newOrgId) {
        if (self.checkIfEmployeeAlready())
          return {error: 'Can\'t change employment'}
      }
      if (!meOrgId) {
        if (!SERVICE_PROVIDERS)
          return {error: 'Can\'t verify if provider is active at this time. Try again later'}
        let o = SERVICE_PROVIDERS.filter((r) => {
          return r.org == newOrgId ? true : false
        })
        if (o  &&  o.length)
          return {isBecomingEmployee: true}
      }
      else if (meOrgId)
        return self.checkIfEmployeeAlready()
    }
  },
  checkIfEmployeeAlready() {
    let result = this.searchMessages({to: me, modelName: MY_EMPLOYEE_PASS})
    if (!result || result.every(r => r.revoked))
      return {isBecomingEmployee: true}
    let meId = utils.getId(me)
    return {isBecomingEmployee: !(result.some((r) => meId === utils.getId(r.to)))}
  },
  onAddApp(serverUrl) {
    const parts = serverUrl.split(';')
    const [url, id] = parts
    // let idx = serverUrl.lastIndexOf('/')
    // let id = parts[parts.length - 1]
    // let url = parts.slice(0, parts.length - 1).join('/')
    const fullUrl = utils.joinURL(url, id)
    return this.getInfo({serverUrls: [url], retry: false, id: id})
    .then(() => {
      const newProvider = tradleUtils.find(SERVICE_PROVIDERS, r => r.id === id)
      if (!newProvider) {
        return this.trigger({
          action: 'addApp',
          error: `no provider found at url: ${fullUrl}`
        })
      }

      this.addToSettings(newProvider)
      this.trigger({ action: 'addApp' })

      // let list = self.searchNotMessages({modelName: ORGANIZATION})
      // this.trigger({
      //   action: 'list',
      //   list: list,
      // })
    })
    .catch(err => {
       // this.trigger({action: 'addApp', error: 'Oops! No one is there.'})
      this.trigger({
        action: 'addApp',
        error: `Server at ${fullUrl} is unavailable: ` + err.message
      })
    })
  },

  onGetMe() {
    this.trigger({action: 'getMe', me: me})
  },
  onCleanup() {
    // var me  = utils.getMe()
    if (!me)
      return
    // Delete all resources but the last one. Every time custome enters the chat RM will receive
    // CustomerWaiting and the customer will receive ProductList message. So there is no point to keep them
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
  onShare(resource, shareWithList, originatingResource) {
    const self = this
    if (resource[TYPE] === PRODUCT_APPLICATION) {
      let listOfProviders = []
      let list = shareWithList.map((id) => {
        let rep = this.getRepresentative(id)
        listOfProviders.push(rep.organization.title)
        return this.buildRef(rep)
      })
      listOfProviders = listOfProviders.join(', ')

      let msg = {
        [TYPE]: 'tradle.ShareContext',
        context: this.buildRef(resource),
        with: list
      }

      let permalink
      if (me.isEmployee) {
        let orgId = utils.getId(this._getItem(me.organization))
        permalink = this.getRepresentative(orgId)[ROOT_HASH]
      }
      else
        permalink = originatingResource[TYPE] === ORGANIZATION
                  ?  this.getRepresentative(utils.getId(originatingResource))[ROOT_HASH]
                  :  originatingResource[ROOT_HASH]

      return meDriver.createObject({ object: msg })
      .then((data) => {
        let shareContext = utils.clone(msg)
        shareContext.from = this.buildRef(me)
        let time = new Date().getTime()
        shareContext.time = time
        shareContext._context = shareContext.context
        shareContext.to = utils.clone(resource.from)
        shareContext.message = translate('sharedWith', translate(this.getModel(resource.product)), listOfProviders)
        let hash = data.link
        shareContext[ROOT_HASH] = shareContext[CUR_HASH] = hash
        let key = utils.getId(shareContext)
        this.dbPut(key, shareContext)
        this._setItem(key, shareContext)
        this.addMessagesToChat(shareContext.to.id, shareContext, false, time)
        this.trigger({action: 'addMessage', resource: shareContext})
        let sendParams = {
          to: {permalink: permalink},
          link: hash,
          other: {
            context: resource[ROOT_HASH]
          }      // let sendParams = {
        }
        return meDriver.send(sendParams)
      })
      .catch((err) => {
        debugger
      })
    }

    // if (resource[TYPE] === VERIFICATION) {
    //   if (!Array.isArray(shareWithList))
    //     sharedWithList = [sharedWithList]
    this.shareAll(resource.document, shareWithList, originatingResource)
    //   return
    // }

    // let promisses = []
    // shareWithList.forEach((r) => {
    //   promisses.push(this.onShareOne(resource, this._getItem(r)))
    // })
    // Q.all(promisses)
    // .then((results) => {
    //   debugger
    // })
  },
  shareAll(document, to, formResource) {
    var documentCreated = formResource.documentCreated
    var key = utils.getId(formResource)
    var r = this._getItem(key)
    // disable FormRequest from being used again
    r.documentCreated = true
    this.trigger({action: 'addItem', context: formResource.context, resource: r})
    if (documentCreated)
      return

    // Get representative
    to = this._getItem(to)
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
      to: {fingerprint: this.getFingerprint(this._getItem(ikey))},
      // share seal if it exists
      seal: true
    }
    if (formResource  &&  formResource._context)
      opts.other = {context: utils.getId(formResource._context).split('_')[1]}

    let batch = []
    // Get the whole resource
    document = this._getItem(utils.getId(document))
    let verifications = document.verifications
    let shareBatchId = new Date().getTime()
    let doShareDocument = (typeof formResource.requireRawData === 'undefined')  ||  formResource.requireRawData
    let promise = doShareDocument
                ? this.shareForm(document, to, opts, formResource, shareBatchId)
                : Q()

    return promise
    .then(() => {
      var documentId = utils.getId(document)
      if (r[TYPE] === FORM_REQUEST)
        r.document = documentId

      this.dbBatchPut(key, r, batch)
      // utils.optimizeResource(document)
      if (doShareDocument) {
        this.addLastMessage(document, batch, to)
        this.dbBatchPut(documentId, document, batch)
      }
      if (!verifications) {
        this.trigger({action: 'addItem', sendStatus: SENT, resource: document})
        document._sendStatus = SENT
        return
      }

      let all = verifications.length
      let defer = Q.defer()
      verifications.forEach((v) => {
        let ver = this._getItem(v)
        return this.shareVerification(ver, to, opts, shareBatchId)
        .then(() => {
          let vId = utils.getId(ver)
          let v = this._getItem(vId)
          this.dbBatchPut(vId, v, batch)

          if (--all === 0) {
            if (!doShareDocument)
              this.addLastMessage(ver, batch, to)

            defer.resolve()
            return
          }
        })
      })
      return defer.promise
    })
    .then(() => {
      db.batch(batch)
    })
  },
  shareForm(document, to, opts, shareBatchId) {
    var time = new Date().getTime()
    return meDriver.send({...opts, link: this._getItem(document)[CUR_HASH]})
    .then(() => {
      if (!document._sharedWith) {
        document._sharedWith = []
        if (!utils.isMyProduct(document)  &&  !utils.isSavedItem(document))
          this.addSharedWith(document, document.to, document.time, shareBatchId)
      }
      if (utils.isSavedItem(document)) {
        document._creationTime = document.time
        document.time = new Date().getTime()
        let docId = utils.getId(document)
        document.to = to
        this._setItem(docId, document)
        this.dbPut(docId, document)
      }


      this.addSharedWith(document, to, time, shareBatchId)
      this.addMessagesToChat(utils.getId(to.organization), document, false, time)
    })
    .catch(function(err) {
      debugger
    })
  },

  shareVerification(resource, to, opts, shareBatchId) {
    var time = new Date().getTime()
    var toId = utils.getId(to)
    var ver
    if (resource[ROOT_HASH]) {
      // Show sending status to not to keep customer in suspense
      if (!resource.sharedWith)
        resource.sharedWith = []
      ver = this._getItem(utils.getId(resource))
      this.addSharedWith(ver, to, time, shareBatchId)
      ver._sendStatus = this.isConnected ? SENDING : QUEUED

      // utils.optimizeResource(ver, true)

      this.addMessagesToChat(utils.getId(to.organization), ver, false, time)
      this.trigger({action: 'addItem', context: resource.context, resource: ver})
    }
    let promise = resource[CUR_HASH] ? meDriver.send({...opts, link: resource[CUR_HASH]}) : Q()
    return promise
    .then(() => {
      if (ver) {
        this.trigger({action: 'updateItem', sendStatus: SENT, resource: ver})
        ver._sendStatus = SENT
      }
    })
    .catch(function(err) {
      debugger
    })
  },
  createSharedWith(toId, time, shareBatchId) {
    return {
      bankRepresentative: toId,
      timeShared: time,
      shareBatchId: shareBatchId
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
        return utils.restartApp()
        // Alert.alert('please refresh')
        // return Q.Promise(function (resolve) {})
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

  },
  async autoRegister() {
    let me
    try {
      me = await this.getMe()
    } catch(err) {
      debug('Store.autoRegister', err.stack)
    }
    if (!me) {
      await this.onAddItem({resource: {
              [constants.TYPE]: constants.TYPES.PROFILE,
              firstName: FRIEND
            }, isRegistration: true})
    }

    return utils.getMe()
  },
  async onGetProvider(params) {
    await this.ready
    await this._loadedResourcesDefer.promise
    // try {
    //   await this.getMe()
    // } catch(err) {
    //   debug('Store.onGetProvider', err.stack)
    // }
    let permalink = params.provider
    let serverUrl = params.url
    let providerBot = this._getItem(PROFILE + '_' + permalink)
    if (!providerBot) {
      await this.onAddItem({
        resource: {[constants.TYPE]: constants.TYPES.SETTINGS, url: serverUrl},
        maxAttempts: 5
      })
      providerBot = this._getItem(PROFILE + '_' + permalink)
    }
    if (providerBot) {
      let provider = this._getItem(utils.getId(providerBot.organization))
      this.trigger({action: 'getProvider', provider: provider})
    }
  },
  getProviderById(providerId) {
    if (!SERVICE_PROVIDERS)
      return
    let provider
    SERVICE_PROVIDERS.forEach((sp) => {
      if (sp.id === providerId)
        provider = this._getItem(sp.org)
    })
    return provider
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
    var meta = this.getModel(params.modelName)
    var isMessage = utils.isMessage(meta)
    if (!isMessage) {
      params.fromView = true
      return this._searchNotMessages(params)
      .then((result) => {
        let isOrg = params.modelName === ORGANIZATION
        if (!result) {
          // First time. No connection no providers yet loaded
          if (!this.isConnected  &&  isOrg)
            this.trigger({action: 'list', alert: translate('noConnection')})

          return
        }
        if (!SERVICE_PROVIDERS)
          this.trigger({action: 'onlineStatus', onlineStatus: false})

        if (isOrg) {
          let r1 = result.filter((r) => r.priority)
          if (r1) {
            let r2 = result.filter((r) => !r.priority)
            result = r1.concat(r2)
          }
          // if (r1) {
          //   r1.forEach((r) => {
          //     SERVICE_PROVIDERS.forEach((sp) => {
          //       if (utils.getId(r) === sp.org)
          //         r._styles = sp.style
          //     })
          //   })
          //   let r2 = result.filter((r) => !r.priority)
          //   result = r1.concat(r2)
          // }
        }
        else if (params.modelName === PROFILE) {
          result = result.filter((r) => !r._inactive)
        }

        if (params.isAggregation)
          result = this.getDependencies(result);
        var shareableResources;
        if (params.sponsorName) {
          result = result.filter((r) => r.name === params.sponsorName)
        }
        var retParams = params.list
                      ? { action: 'filteredList', list: result}
                      : { action: params.sponsorName ? 'sponsorsList' : 'list',
                          list: result,
                          spinner: params.spinner,
                          isAggregation: params.isAggregation
                        }
        if (params.prop)
          retParams.prop = params.prop;

        this.trigger(retParams);
      })
    }

    return this._searchMessages(params)
    .then((result) => {
      if (!result)
        return
      if (params.isAggregation)
        result = this.getDependencies(result);

      if ((ENV.hideVerificationsInChat  ||  ENV.hideProductApplicationInChat)  &&
          params.modelName === MESSAGE      &&
          params.to                         &&
          params.to[TYPE] === ORGANIZATION  &&
          !params.isForgetting) {
        for (let i=result.length - 1; i>=0; i--)
          if (result[i][TYPE] === VERIFICATION) {
            if (ENV.hideVerificationsInChat)
              result.splice(i, 1)
          }
          else if (result[i][TYPE] === PRODUCT_APPLICATION) {
            if (ENV.hideProductApplicationInChat)
              result.splice(i, 1)
          }
      }
      var shareableResources;
      var retParams = {
        action: !params.listView  &&  !params.prop && !params._readOnly ? 'messageList' : 'list',
        list: result,
        spinner: params.spinner,
        to: params.to,
        isAggregation: params.isAggregation
      }
      let hasMore = params.limit  &&  result.length > params.limit
      if (params.loadEarlierMessages || hasMore) {
        if (hasMore)  {
          result.splice(0, 1)
          retParams.allLoaded = true
        }
        retParams.loadEarlierMessages = true
      }
      // if (params.modelName === FORM)
      //   retParams.requestedModelName = FORM
      retParams.requestedModelName = params.modelName
      if (!params.isAggregation  &&  params.to  &&  !params.prop) {
        if (params.to[TYPE] !== PROFILE  ||  !me.isEmployee) {
          // let to = list[utils.getId(params.to)].value
          // if (to  &&  to[TYPE] === ORGANIZATION)
          // entering the chat should clear customer's unread indicator
          shareableResources = this.getShareableResources(result, params.to)
        }
        if (me.isEmployee  && params.to[TYPE] === PROFILE) {
          let toId = utils.getId(params.to)
          let to = this._getItem(toId)
          if (!to.bot) {
            to._unread = 0
            this.dbPut(toId, to)
            .then(() => {
              this.trigger({action: 'updateRow', resource: to})
            })
          }
        }
        let orgId

        if (params.to[TYPE] === PRODUCT_APPLICATION  &&  utils.isReadOnlyChat(params.to)) {
          if (!params.context)
            params.context = params.to
        }
        else {
          if (params.to.organization)
            orgId = utils.getId(params.to.organization)
          else if (params.to[TYPE] === ORGANIZATION)
              orgId = utils.getId(params.to)

          if (orgId) {
            let rep = this.getRepresentative(orgId)
            if (rep  &&  !rep.bot)
              retParams.isEmployee = true

            // Filter forms verified by a different provider and leave only verifications
            if (params.modelName === MESSAGE) {
              let rmIdx = []
              let sharedVerifiedForms = []
              for (let i=0; i<result.length; i++) {
                let r = result[i]
                let m = this.getModel(r[TYPE])
                // So not show remediation PA in chat
                if (m.id === PRODUCT_APPLICATION  &&  r.product === REMEDIATION) {
                  rmIdx.push(i)
                  continue
                }
                // Product created in Remediation show only from profile view
                if (m.subClassOf === MY_PRODUCT  &&  r._context) {
                  if (this._getItem(utils.getId(r._context)).product === REMEDIATION) {
                    rmIdx.push(i)
                    continue
                  }
                }
                if (m.subClassOf !== FORM)
                  continue
                // Case when event to dosplay ML is before the new resource was sent
                let formCreatorId = r.to.organization
                                  ? utils.getId(r.to.organization)
                                  : utils.getId(this._getItem(utils.getId(r.to)).organization)
                if (formCreatorId === orgId)
                  continue
                let fId = utils.getId(r)
                for (let ii = i+1; ii<result.length; ii++) {
                  let v = result[ii]
                  if (v[TYPE] !== VERIFICATION)
                    continue
                  if (utils.getId(v.document) === fId) {
                    let vFromId = utils.getId(v.from.organization)
                    // If this is this provider's verification then the form was shared
                    //  without verification and the stub needs to be shown
                    if (vFromId === orgId)
                      break
                    sharedVerifiedForms.push(i)
                  }
                }
              }
              if (rmIdx) {
                for (let i=rmIdx.length - 1; i>=0; i--)
                  result.splice(rmIdx[i], 1)
              }
              if (sharedVerifiedForms.length) {
                for (let i = sharedVerifiedForms.length - 1; i>=0; i--)
                  result.splice(sharedVerifiedForms[i], 1)
              }
              // Pin last unfulfilled Form Request from current context
              let rContext = result.length  &&  result[result.length - 1]._context
              if (rContext)
                for (let i=result.length - 1; i>=0; i--) {
                  let r = result[i]
                  if (r[TYPE] === FORM_REQUEST) {
                    if (!r.documentCreated  &&  utils.getId(r._context) === utils.getId(rContext)) {
                      result.splice(i, 1)
                      result.push(r)
                    }
                    break
                  }
                }
            }
          }
        }

        if (params.context)
          retParams.context = params.context
        else if (params.modelName !== PRODUCT_APPLICATION)
          retParams.context = this.getCurrentContext(params.to, orgId)
  /*
        // Filter out forms that were shared, leave only verifications
        if (params.to  &&  params.to[TYPE] === ORGANIZATION  &&  !utils.isEmployee(params.to)) {//  &&  utils.getId(params.to) !== meId) {
          let toId = utils.getId(this.getRepresentative(utils.getId(params.to)))
          result = result.filter((r) => {
            // if (r[TYPE] !== VERIFICATION  ||  !r._sharedWith ||  r._sharedWith.length === 0)
            //   return
            if (this.getModel(r[TYPE]).value.subClassOf !== FORM)
              return true
            let rId = utils.getId(r.to)
            return (utils.getId(r.from) === meId  &&  rId !== toId) ? false : true
            // let shV = r._sharedWith.forEach((rr) => {
            //   if (rr.bankRepresentative === toId) {
            //     let d = this._getItem(r.document)
            //     if (utils.getId(d.to) !== toId)
            //       filterOutForms.push(utils.getId(r.document))
            //   }
            // })
          })
          retParams.list = result
        }
  */
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
        retParams.shareableResources = shareableResources
      if (params.prop)
        retParams.prop = params.prop
      this.trigger(retParams)
    })
  },
  getCurrentContext(to, orgId) {
    let c = this.searchMessages({modelName: PRODUCT_APPLICATION, to: to})
    if (!c  ||  !c.length)
      return

    let meId = utils.getId(me)
    let talkingToCustomer = !orgId  &&  me.isEmployee  &&  to  &&  to[TYPE] === PROFILE  &&  utils.getId(to) !== meId
    if (talkingToCustomer) {
      // Use the context that was already started if such exists
      let contexts = c.filter((r) => !r._readOnly && r.formsCount)
      let currentProduct = c[c.length - 1].product
      contexts = c.filter((r) => !r._readOnly && r.product === currentProduct)
      return contexts.length ? contexts[0] : c[c.length - 1]
    }
    if (c.length === 1)
      return utils.isReadOnlyChat(c[0]) ? null : c[0]

    let contexts = c.filter((r) => !utils.isReadOnlyChat(r) && r.formsCount)
    if (!contexts)
      return
    if (!contexts.length)
      return c[c.length - 1]
    if (contexts.length === 1)
      return contexts[0]
    contexts.sort((a, b) => {
      return b.lastMessageTime - a.lastMessageTime
    })
    return contexts[0]
  },

  searchResources(params) {
    var meta = this.getModel(params.modelName)
    var isMessage = utils.isMessage(meta)
    if (isMessage) //  ||  meta.id === FORM)
      return this.searchMessages(params);
    else {
      params.fromView = true
      return this.searchNotMessages(params);
    }
  },
  onListSharedWith(resource, chat) {
    let sharedWith = resource._sharedWith
    if (!sharedWith)
      return null
    let chatId = utils.getId(chat)
    let shareWithMapping = {}
    let result = []
    sharedWith.forEach((r) => {
      let bot = this._getItem(r.bankRepresentative)
      let org = this._getItem(utils.getId(bot.organization))
      if (utils.getId(org) === chatId)
        return
      result.push(org)
      shareWithMapping[r.bankRepresentative] = org
    })
    this.trigger({action: 'listSharedWith', list: result, sharedWith: shareWithMapping})
  },
  _searchNotMessages(params) {
    return this._loadedResourcesDefer.promise
    .then(() => {
      return this.searchNotMessages(params)
    })
  },
  searchNotMessages(params) {
    if (params.list)
      return params.list.map((r) => this._getItem(r))

    var foundResources = {};
    var modelName = params.modelName;
    var meta = this.getModel(modelName)
    if (meta.subClassOf === ENUM)
      return this.getEnum(params)
    var to = params.to;
    var notVerified = params.notVerified
    var props = meta.properties;
    var containerProp, resourceId;

    let isOrg = params.modelName == ORGANIZATION
    let sortProp = params.sortProperty
                 ? params.sortProperty
                 : isOrg  &&  !params.sortProperty ? LAST_MESSAGE_TIME : meta.sort

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
      var r = this._getItem(key);
      if (key.indexOf(modelName + '_') === -1) {
        var s = key.split('_')[0]
        if (isOrg) {
          if (this.getModel(s).subClassOf !== FORM)
            continue
          let toId = utils.getId(this._getItem(key).to)
          // The resource was never shared or it has a shared with party in it
          if (r._sharedWith) {
            let wasShared
            r._sharedWith.forEach((o) => {
              let org = this._getItem(o.bankRepresentative).organization
              let orgId = utils.getId(org)
              if (orgToForm[orgId])
                orgToForm[orgId] = ++orgToForm[orgId]
              else
                orgToForm[orgId] = 1
            })
          }
          else {
            if (utils.isSavedItem(r))
              continue
            let org = this._getItem(toId).organization
            if (!org) {
              let fromId = utils.getId(this._getItem(key).from)
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
      if (isOrg  &&  r._inactive)
        continue
      if (containerProp  &&  (!r[containerProp]  ||  utils.getId(r[containerProp]) !== resourceId))
        continue;
      if (!query) {
        foundResources[key] = r
        continue;
      }
      var fr = this.checkCriteria(r, query)
      // var combinedValue = '';
      // for (var rr in props) {
      //   if (rr.charAt(0) === '_')
      //     continue
      //   if (r[rr] instanceof Array)
      //     continue;
      //   combinedValue += combinedValue ? ' ' + r[rr] : r[rr];
      // }
      // if (!combinedValue  ||  (combinedValue  &&  (!query || combinedValue.toLowerCase().indexOf(query.toLowerCase()) != -1))) {
      if (fr)
        foundResources[key] = r
    }
    // Don't show current 'me' contact in contact list or my identities list
    if (!containerProp  &&  me  &&  isIdentity) {
      if (!isTest) {
        var myIdentities = this._getItem(MY_IDENTITIES).allIdentities;
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
        let sortPropToR = {}
        let arr = result.map((r) => {
          sortPropToR[r[sortProp]] = r
          return r[sortProp]
        })
        arr.sort();
        if (asc)
          arr = arr.reverse();
        result = arr.map((s) => sortPropToR[s])
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
        let orgId = utils.getId(r)
        let rr = {}
        extend(true, rr, r)
        rr.numberOfForms = orgToForm[orgId]
        retOrgs.push(rr)
      })
      result = retOrgs
    }
    return result;
  },
  getEnum(params) {
    let result
    let enumList = enums[params.modelName]
    if (params.query)
      return enumList.filter((r) => this.checkCriteria(r, params.query))
    else
      return enumList
  },
  checkCriteria(r, query) {
    if (!query)
      return r
    let props = this.getModel(r[TYPE]).properties
    var combinedValue = '';
    for (var rr in props) {
      if (rr.charAt(0) === '_'  ||   Array.isArray(r[rr]))
        continue;
      combinedValue += combinedValue ? ' ' + r[rr] : r[rr];
    }
    if (!combinedValue)
      return r

    if (combinedValue.toLowerCase().indexOf(query.toLowerCase()) !== -1)
      return r
    return
  },
  _searchMessages(params) {
    return this._loadedResourcesDefer.promise
      .then(() => {
        return this.searchMessages(params)
      })
  },
  searchMessages(params) {
    var self = this
    var query = params.query;
    var modelName = params.modelName;
    var meta = this.getModel(modelName)
    var prop = params.prop;
    var context = params.context
    var _readOnly = params._readOnly  || (context  && utils.isReadOnlyChat(context)) //(context  &&  context._readOnly)
    if (_readOnly  &&  modelName === PRODUCT_APPLICATION)
      return this.getAllSharedContexts()
    if (typeof prop === 'string')
      prop = meta[prop];
    var backlink = prop ? (prop.items ? prop.items.backlink : prop) : null;
    var foundResources = [];
    var props = meta.properties;

    // var required = meta.required;
    var meId = utils.getId(me)
    var meOrgId = me.isEmployee ? utils.getId(me.organization) : null;

    let filterOutForms = !params.listView  &&  !params.isForgetting  &&  params.to  &&  params.to[TYPE] === ORGANIZATION  //&&  !utils.isEmployee(params.to)

    var chatTo = params.to
    if (chatTo  &&  chatTo.id)
      chatTo = this._getItem(utils.getId(chatTo))
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
      toOrg = this._getItem(toOrgId)
      thisChatMessages = chatMessages[toOrgId]
    }
    else {
      if (chatTo) {
        if (chatTo.organization  &&  !meOrgId) {
          toOrgId = utils.getId(chatTo.organization)
          thisChatMessages = chatMessages[toOrgId]
        }
        else {
          if (meId !== chatId)
            thisChatMessages = chatMessages[chatId]
        }
      }
//       else if (chatId === meId) {
// console.log('What are we doing here!!! chatId: ' + chatId)
//         thisChatMessages = chatMessages[chatId]
//       }
    }

    if (!thisChatMessages  &&  (!params.to || chatId === meId  || (params.prop  &&  params.prop.items  &&  params.prop.items.backlink))) {
      thisChatMessages = []
      let isInterface = meta.isInterface
      let isForm = meta.id === FORM
      let isMessage = meta.id === MESSAGE
      Object.keys(list).forEach(key => {
        let r = self._getItem(key)
        let type = r[TYPE]
        let m = self.getModel(type)
        if (!m) return
        let addMessage = type === modelName  ||  (!isForm  &&  m.subClassOf === meta.id)
        // This is the case when backlinks are requested on Profile page
        if (!addMessage) {
          if (isForm) {
            if (m.subClassOf === FORM) {
              // Make sure to not return Items and Documents in this list
              let ilen = m.interfaces.length
              if (params.isForgetting  ||  ilen === 1  ||  (ilen === 2  &&  m.interfaces.indexOf(VERIFIABLE) !== -1))
                addMessage = true
            }
          }
          else if (params.isForgetting  || (isInterface  &&  m.interfaces  &&  m.interfaces.indexOf(meta.id) !== -1)) //  && (!isMessage  ||  m.value.interfaces.length === 1))) {
            addMessage = true
        }
        if (addMessage)
          thisChatMessages.push({id: key, time: r.time})

      })

      thisChatMessages.sort((a, b) => {
        return a.time - b.time
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
      me = this._getItem(meId);
      this.setMe(me);
      var myIdentities = this._getItem(MY_IDENTITIES);
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
      var r = this._getItem(key)
      var iMeta = null;
      if (isAllMessages)
        iMeta = this.getModel(key.split('_')[0])
      else if (r[TYPE] !== modelName) {
        var rModel = this.getModel(r[TYPE])
        // Checks for the first level of subClasses
        if (rModel.subClassOf !== modelName)
          continue;
      }
      if (!iMeta)
        iMeta = meta;
      if (r.canceled)
        continue;
      if (context) {
        if (!this.inContext(r, context))
          continue
      }
      // if (r._context  &&  this._getItem(r._context)._readOnly)
      //   continue
      var isFormError = isAllMessages && r[TYPE] === FORM_ERROR
      // Make sure that the messages that are showing in chat belong to the conversation between these participants
      if (isVerification) {
        if (r.document) {
          var d = this._getItem(utils.getId(r.document))
          if (!d)
            continue

          if (params.resource  &&  resourceId !== meId  && utils.getId(params.resource) !== utils.getId(d))
            continue
          r.document = d;
        }
      }
      else if (isFormError) {
        let prefill = this._getItem(utils.getId(r.prefill))
        r.prefill =  prefill ? prefill : r.prefill
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

          // var org = this._getItem(utils.getId(r.to)).organization
          // var orgId = utils.getId(org)
          if (!utils.isEmployee(this._getItem(rid)))
            continue;
        }

      }

      var isSharedWith = false, timeResourcePair = null
      if (r._sharedWith  &&  toOrgId) {
        var sharedWith = r._sharedWith.filter((r) => {
          let org = this._getItem(r.bankRepresentative).organization
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
          if (s === utils.getId(r[backlink])  &&  checkAndFilter(r, i)) {
            if (limit  &&  foundResources.length === limit)
              break
          }

          continue;
        }

        var m = this.getModel(r[TYPE])
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

      if (r._sharedWith  &&  toOrgId  &&  !isSharedWith)
        continue
      if (isVerificationR) {
        var doc = {};
        var rDoc = list[utils.getId(r.document)]
        if (!rDoc) {
          if (params.isForgetting)
            checkAndFilter(r, i)
          continue
        }

        // TODO: check if we can copy by reference
        for (var p in rDoc.value) {
          if (p === 'verifications') continue

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
      // primitive filtering for this commit
      if (checkAndFilter(r, i)) {
        if (limit  &&  foundResources.length === limit)
          break
      }
    }
    if (!foundResources.length)
      return
    // Minor hack before we intro sort property here
    return   params._readOnly  &&  modelName === PRODUCT_APPLICATION
           ? foundResources.filter((r) => utils.isReadOnlyChat(r)) //r._readOnly)
           : foundResources.reverse()

    function checkAndFilter(r, i) {
      if (!query) {
        if (!filterOutForms  ||  !doFilterOut(r, chatId, i)) {
          foundResources.push(self.fillMessage(r))
          return true
        }
      }
      let isVerificationR = r[TYPE] === VERIFICATION
      let checkVal = isVerificationR ? self._getItem(r.document) : r
      let fr = self.checkCriteria(r, query)

      // let checkProps = self.getModel(checkVal[TYPE]).value.properties
      // var combinedValue = '';
      // for (var rr in checkProps) {
      //   if (!checkVal[rr])
      //     continue
      //   if (checkVal[rr] instanceof Array)
      //    continue;
      //   let val = (checkProps[rr].type === 'object') ? checkVal[rr].title || '' : checkVal[rr]
      //   if (!val)
      //     continue
      //   combinedValue += combinedValue ? ' ' + val : val
      // }
      // if (!combinedValue  ||  (combinedValue  &&  (!query || combinedValue.toLowerCase().indexOf(query.toLowerCase()) !== -1))) {
      if (fr) {
        // foundResources[key] = this.fillMessage(r);
        if (!filterOutForms  ||  !doFilterOut(r, chatId, i)) {
          foundResources.push(self.fillMessage(r))
          return true
        }
      }
      return false
    }
    function doFilterOut(r, toId, idx) {
      let m = self.getModel(r[TYPE])
      if (m.id === PRODUCT_APPLICATION  &&  r.product === REMEDIATION)
        return true
      if (r._notSent)
        return true
      if (r._context       &&
          !params.prop     &&
          (m.subClassOf === FORM || m.id === VERIFICATION) &&
          self._getItem(utils.getId(r._context)).product === REMEDIATION) {
        let org = m.subClassOf === FORM ? self._getItem(utils.getId(r.to)) : self._getItem(utils.getId(r.from))
        let remMsg = self.searchMessages({modelName: REMEDIATION_SIMPLE_MESSAGE, to: org})
        if (remMsg  &&  remMsg.length)
          return r.time < remMsg[0].time + 30000

        return true
      }
      if (r._inactive)
        return true
      if (m.subClassOf === MY_PRODUCT  &&
          r._context                   &&
          self._getItem(utils.getId(r._context)).product === REMEDIATION)
        return true


      return false
      // if (m.subClassOf !== FORM)
      //   return false
      // // for employee
      // let meId = utils.getId(me)
      // if (utils.getId(r.from) !== meId)
      //   return false

      // let rId = utils.getId(r.to)
      // if (rId === toId  ||  !r._sharedWith  ||  r._sharedWith.length === 1)
      //   return false

      // for (let i=idx; i<thisChatMessages.length; i++) {
      //   let msg = self._getItem(thisChatMessages[i].id)
      //   if (msg[TYPE] !== VERIFICATION)
      //     continue
      //   let item = self._getItem(utils.getId(msg.from))
      //   if (utils.getId(item.organization) === toId)
      //     return false

      //   if (!msg._sharedWith)
      //     return false

      //   for (let ii=0; ii<r._sharedWith.length; ii++) {
      //     let shareBatchId = r._sharedWith[ii].shareBatchId
      //     if (msg._sharedWith.some((share) => shareBatchId  &&  share.shareBatchId === shareBatchId))
      //       return true
      //   }
      // }
      // return false
    }
  },
  onGetAllContexts(params) {
    let list = this.searchMessages(params)
    let l = list  &&  list.filter((r) => r.formsCount)
    this.trigger({action: 'allContexts', list: l, to: params.to})
  },
  onHasPartials() {
    let list = this.searchNotMessages({modelName: PARTIAL})
    if (list  &&  list.length)
      this.trigger({action: 'hasPartials', count: list.length})
  },

  onGetAllPartials(resource) {
    let plist = this.searchNotMessages({modelName: PARTIAL})
    if (!plist  ||  !plist.length)
      return

    let allContextsArr = plist.filter((r) => r.type === PRODUCT_APPLICATION)
    let allContexts ={}
    allContextsArr.forEach((a) => allContexts[a.resource.id] = a)

    let providers = {}
    let owners = {}
    let allResources = {}
    plist.forEach((r) => {
      let pId = utils.getId(r.providerInfo)
      let stats = providers[pId]
      if (!stats) {
        stats = {
          openApps: {},
          completedApps: {},
          applications: [],
          formRequests: [],
          forms: [],
          formCorrections: [],
          verifications: [],
          formErrors: [],
          myProducts: [],
          providerInfo: r.providerInfo
        }
        providers[pId] = stats
      }
      let t = r.type || r.leaves.filter((prop) => prop.key === TYPE)[0].value
      let ownerId
      // in case of form request or form error the partial will have a bot as a sender
      // in this case we need to check the context to see who those requests were sent to
      let owner
      if (t !== FORM_REQUEST  &&  t !== FORM_ERROR) {
        ownerId = r.from.id
        owner = r.from
      }
      else {
        let pa = allContexts[PRODUCT_APPLICATION + '_' + r.context]
        owner = pa ? pa.from : r.from
        ownerId = owner.id
      }
      if (!owners[pId])
        owners[pId] = {}
      let providerCustomerStats = owners[pId][ownerId]
      if (!providerCustomerStats) {
        providerCustomerStats = {
          owner: owner,
          openApps: {},
          completedApps: {},
          applications: [],
          formRequests: [],
          forms: [],
          formCorrections: [],
          verifications: [],
          formErrors: [],
          myProducts: [],
          providerInfo: r.providerInfo
        }
        owners[pId][ownerId] = providerCustomerStats
      }

      let l = r.leaves

      allResources[r.resource.id] = r

      switch (t) {
      case FORM_REQUEST:
        stats.formRequests.push(r)
        providerCustomerStats.formRequests.push(r)
        break
      case FORM_ERROR:
        stats.formErrors.push(r)
        providerCustomerStats.formErrors.push(r)
        break
      case VERIFICATION:
        stats.verifications.push(r)
        providerCustomerStats.verifications.push(r)
        break
      case PRODUCT_APPLICATION:
        let product = l.filter((prop) => prop.key === 'product')[0].value
        if (this.getModel(product)) {
          stats.applications.push({productType: product, product: r})
          providerCustomerStats.applications.push({productType: product, product: r})
        }
        break
      default:
        if (this.getModel(t).subClassOf === MY_PRODUCT) {
          stats.myProducts.push({[t] : r})
          providerCustomerStats.myProducts.push(r)
        }
        else {
          let id = r.resource.id.split('_')
          if (id.length === 2  ||  id[1] === id[2]) {
            stats.forms.push(r)
            providerCustomerStats.forms.push(r)
          }
          else {
            stats.formCorrections.push(r)
            providerCustomerStats.formCorrections.push(r)
          }
        }
      }
    })
    for (let p in providers) {
      providers[p].verifications.forEach((v) => {
        let docId = v.leaves.filter((prop) => prop.key === 'document')[0].value.id
        // HACK till modified forms paritals fixed
        if (allResources[docId]) {
          let docOwner = allResources[docId].from.id
          owners[p][docOwner].verifications.push(v)
        }
      })
    }

    for (let p in owners) {
      let o = owners[p]
      let pruned = {}
      for (let r in o) {
        if (o[r].applications.length)
          pruned[r] = o[r]
      }
      owners[p] = pruned
    }
    var self = this
    // provider customers per product stats
    for (let pc in owners) {
      let providerCustomers = owners[pc]
      for (let p in providerCustomers) {
        let customer = providerCustomers[p]
        let allPerApp = []
        customer.allPerApp = allPerApp
        customer.applications.forEach((a) => {
          let allStats = {
            app: a,
            product: a.productType,
            forms: [],
            formErrors: [],
            verifications: [],
            formCorrections: [],
            formRequests: []
          }
          allPerApp.push(allStats)
          let formModels = this.getModel(a.productType).forms
          let productContext = a.product.context
          customer.forms.forEach((f) => {
            if (productContext === f.context)
              allStats.forms.push(f)
            // let formType = f.leaves.find(l => l.key === TYPE && l.value).value
            // if (formModels.indexOf(formType) !== -1)
            //   allStats.forms.push(f)
          })
          customer.formCorrections.forEach((f) => {
            if (productContext === f.context)
              allStats.formCorrections.push(f)
            // let formType = f.leaves.find(l => l.key === TYPE && l.value).value
            // if (formModels.indexOf(formType) !== -1)
            //   allStats.formCorrections.push(f)
          })
          customer.verifications.forEach((f) => {
            if (productContext === f.context)
              allStats.verifications.push(f)
            // let doc = v.leaves.find(l => l.key === 'document' && l.value).value
            // if (formModels.indexOf(doc.id.split('_')[0]) !== -1)
            //   allStats.verifications.push(v)
          })
          customer.formRequests.forEach((f) => {
            if (productContext === f.context)
              allStats.formRequests.push(f)
            // let forRequestType = f.leaves.find(l => l.key === 'product' && l.value).value
            // if (forRequestType === a.productType)
            //   allStats.formRequests.push(f)
          })
          customer.formErrors.forEach((f) => {
            if (productContext === f.context)
              allStats.formErrors.push(f)
            // let forRequestType = f.leaves.find(l => l.key === 'product' && l.value).value
            // if (forRequestType === a.productType)
            //   allStats.formErrors.push(f)
          })
        })
      }
      getProviderPerCustomerPerProductStats(providers[pc], providerCustomers, resource)
    }

    for (let p in providers) {
      let stats = providers[p]
      let pId = stats.providerInfo.id
      let apps = stats.applications
      apps.forEach((a) => {
        let product = a.productType
        let forms = this.getModel(product).forms
        let ownerId = a.product.from.id
        let uniqueVerifications = {}
        let verifications = owners[pId][ownerId].verifications
        verifications.forEach((v) => {
          let doc = v.leaves.filter((prop) => prop.key === 'document')[0].value.id
          let docType = doc.split('_')[0]
          // if (!owners[pId][ownerId].forms)
          //   return
          // if (!allResources[doc]  ||  allResources[doc].from.id !== ownerId)
          //   return
          if (forms.indexOf(docType) !== -1) {
            if (!uniqueVerifications[docType])
              uniqueVerifications[docType] = v
          }
        })
        if (Object.keys(uniqueVerifications).length === forms.length) {
          if (verifications.length) {
            verifications.sort((a, b) => a.time - b.time)

            owners[pId][ownerId].completedApps[product] = verifications[verifications.length - 1].time
            if (!stats.completedApps[product])
              stats.completedApps[product] = 1
            else
              stats.completedApps[product]++
          }
        }
        else {
          if (!stats.openApps[product])
            stats.openApps[product] = 1
          else
            stats.openApps[product]++
        }
      })
    }
    this.trigger({action: 'allPartials', list: plist, stats: Object.values(providers), owners: owners })

    function getProviderPerCustomerPerProductStats(provider, providerCustomers, resource) {
      provider.applications.forEach((a) => {
        for (let p in providerCustomers) {
          let app = providerCustomers[p]
          app.allPerApp.forEach((appProps) => {
            appProps.stats = {}
            let appStats = appProps.stats[appProps.product] = {
              product: appProps.product,
              formErrors: appProps.formErrors.length,
              formCorrections: appProps.formCorrections.length,
              verifications: appProps.verifications.length,
              forms: appProps.forms.length
            }
            if (!resource || resource.providerInfo.id !== provider.providerInfo.id)
              return

            let m = self.getModel(appProps.product)
            let t = resource.leaves.filter((prop) => prop.key === TYPE)[0].value
            if (t !== VERIFICATION  &&  resource.from.id !== p)
              return
            if (m.forms.indexOf(t) === -1  &&  t !== VERIFICATION)
              return
            switch (t) {
            case FORM_REQUEST:
              appStats.changed = 'formRequests'
              break
            case FORM_ERROR:
              appStats.changed = 'formErrors'
              break
            case VERIFICATION:
              let docId = resource.leaves.filter((prop) => prop.key === 'document')[0].value.id
              let docType = docId.split('_')[0]
              if (m.forms.indexOf(docType)  !== -1) {
                app.allPerApp.forEach((a) => {
                  a.forms.forEach((f) => {
                    if (f.resource.id === docId)
                      appStats.changed = 'verifications'
                  })
                })
              }
              break
            case PRODUCT_APPLICATION:
              appStats.changed = 'productApplications'
              break
            default:
              if (self.getModel(t).subClassOf === MY_PRODUCT)
                appStats.changed = 'myProducts'
              else
                appStats.changed = 'forms'
            }
          })
        }
      })
    }
  },
  onGetAllSharedContexts() {
    Q.all([this.myResourcesLoaded])
    .then(() => {
      let list = this.getAllSharedContexts()
      if (!list)
        return
      // let org = this._getItem(me.organization)
      // let deniedList = this.searchMessages({modelName: APPLICATION_DENIAL})
      // let denied = {}
      // if (deniedList)
      //   deniedList.forEach((r) => denied[utils.getId(r), r])
      // let approvedList = this.searchMessages({modelName: CONFIRMATION})
      // let approved = {}
      // if (approvedList)
      //   approvedList.forEach((r) => approved[utils.getId(r), r])

      // let relationshipManagers = this.searchMessages({modelName: ASSIGN_RM, to: me.organization})
      // if (!relationshipManagers) {
      //   this.trigger({action: 'allSharedContexts', count: list.length, list: list})
      //   return
      // }
      // let meId = IDENTITY + '_' + me[ROOT_HASH]
      // relationshipManagers.forEach((r) => {
      //   let employeeId = utils.getId(r.employee)
      //   let appId = utils.getId(r.application)
      //   for (let i=0; i<list.length; i++) {
      //     let pa = list[i]
      //     let paId = utils.getId(pa)
      //     if (pa._denied  ||  pa._approved) {
      //       this.dbPut(paId, pa)
      //       this._setItem(paId, pa)
      //       this.trigger({action: 'addItem', resource: pa})
      //       continue
      //     }
      //     if (pa._assignedRM || pa._relationshipManager)
      //       return
      //     if (paId !== appId)
      //       continue
      //     if (employeeId === meId) {
      //       pa._relationshipManager = true
      //       let r = this._getItem(paId)
      //       pa._relationshipManager = true
      //     }
      //     // HACK to not to restart the whole thing
      //     else
      //       pa._assignedRM = utils.clone(r.employee)

      //     this.dbPut(utils.getId(pa), pa)
      //   }
      // })
      this.trigger({action: 'allSharedContexts', count: list.length, list: list})
    })
  },
  inContext(r, context) {
    return r._context && utils.getId(r._context) === utils.getId(context)
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
      extend(ver, this._getItem(vId));
      resource.verifications[i] = ver;
      if (ver.organization  &&  !ver.organization.photos) {
        var orgPhotos = this._getItem(utils.getId(ver.organization.id)).photos;
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

    var hasVerifiers = []
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
        this._getItem(utils.getId(rr)).documentCreated = true
        continue
      }
      simpleLinkMessages[r.form] = r
      var msgModel = this.getModel(r.form);

      if (msgModel  &&  msgModel.subClassOf !== MY_PRODUCT  &&  !msgModel.notShareable) {
        verTypes.push(msgModel.id);
        if (r.verifiers)
          hasVerifiers[msgModel.id] = r.verifiers
      }
    }
    var shareableResources = {};
    var shareableResourcesRootToR = {}
    var shareableResourcesRootToOrgs = {}

    var isOrg = to  &&  to[TYPE] === ORGANIZATION
    var org = isOrg ? to : (to.organization ? this._getItem(utils.getId(to.organization)) : null)
    var reps = isOrg ? this.getRepresentatives(utils.getId(org)) : [utils.getId(to)]
    var self = this
    var productsToShare = this.searchMessages({modelName: MY_PRODUCT, to: utils.getMe(), strict: true})
    if (productsToShare  &&  productsToShare.length) {
      productsToShare.forEach((r) => {
        let fromId = utils.getId(r.from)
        if (r._sharedWith) {
          let sw = r._sharedWith.filter((r) => {
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
          organization: this._getItem(utils.getId(r.from)).organization
        }

        addAndCheckShareable(rr)
      })
    }
    if (!verTypes.length)
      return {verifications: shareableResources}

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
        var fromOrgId = utils.getId(this._getItem(fromId).organization)
        if (fromOrgId === toId)
          return
        var document = doc.id ? this._getItem(utils.getId(doc.id)) : doc;
        if (!document  ||  document._inactive)
          return;

        // Check if there is at least one verification by the listed in FormRequest verifiers
        if (hasVerifiers  &&  hasVerifiers[docType]) {
          let verifiers = hasVerifiers[docType]
          let foundVerifiedForm
          verifiers.forEach((v) => {
            let provider = SERVICE_PROVIDERS.filter((sp) => sp.id === v.id  &&  utils.urlsEqual(sp.url, v.url))
            if (!provider.length)
              return
            let spReps = this.getRepresentatives(utils.getId(provider[0].org))
            let sw = val._sharedWith.filter((r) => {
              return spReps.some((rep) => utils.getId(rep) === r.bankRepresentative)
            })
            if (sw.length)
              foundVerifiedForm = true
          })
          if (!foundVerifiedForm)
            return
        }

        /*
        if (to  &&  org  &&  document.verifications) {
          var thisCompanyVerification;
          for (var i=0; i<document.verifications.length; i++) {
            var v = this._getItem(utils.getId(document.verifications[i]));

            if (v.organization  &&  utils.getId(org) === utils.getId(v.organization)) {
              let sharedWith = doc._sharedWith
              if (!sharedWith)
                thisCompanyVerification = true;
              else {
                let sw = sharedWith.filter((r) => {
                  if (reps.some((rep) => utils.getId(rep) === r.bankRepresentative)))
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
        */
        var value = {};
        extend(value, val);
        value.document = document;

        addAndCheckShareable(value)
      })
    // Allow sharing non-verified forms
    let context = this.getCurrentContext(to)
    verTypes.forEach((verType) => {
      if (hasVerifiers  &&  hasVerifiers[verType])
        return
      var l = this.searchNotMessages({modelName: verType, notVerified: true})
      if (!l)
        return
      l.forEach((r) => {
        if (!context  ||  (r._context  &&  utils.getId(context) !== utils.getId(r._context))) {
          let rr = {
            [TYPE]: VERIFICATION,
            document: r,
            organization: this._getItem(utils.getId(r.to)).organization
          }
          addAndCheckShareable(rr)
        }
      })
    })
    return {verifications: shareableResources, providers: shareableResourcesRootToOrgs}
    // Allow sharing only the last version of the resource
    function addAndCheckShareable(verification) {
      let r = verification.document
      let docType = r[TYPE]
      let docModel = self.getModel(docType)
      let isMyProduct = docModel.subClassOf === MY_PRODUCT
      let isItem = utils.isSavedItem(r)
      // Allow sharing only of resources that were filled out by me
      if (!isMyProduct  &&  utils.getId(r.from) !== utils.getId(me))
        return
      var v = shareableResources[docType];
      if (!v)
        shareableResources[docType] = [];
      else if (verification.from  &&   shareableResourcesRootToR[r[ROOT_HASH]]) {
        let arr = shareableResources[r[TYPE]]
        let vFromId = utils.getId(verification.from)
        for (let i=0; i<arr.length; i++) {
          let rr = arr[i].document
          if (r[ROOT_HASH] === rr[ROOT_HASH]) {
            // if (utils.getId(arr[i].from) === vFromId) {
              if (r.time < rr.time) {
                addSharedWithProvider(verification)
                return
              }
              else
                arr.splice(i, 1)
            // }
          }
        }
      }
      // Check that this is not the resource that was send to me as to an employee
      if (utils.getId(r.to) !== meId  ||  isMyProduct  ||  isItem) {
        // Don't add this verification if it's for a previous copy of the document
        // If the this is the newer copy remove the older and push this one
        if (shareableResources[docType].length) {
          let sr = shareableResources[docType]
          for (let i=0; i<sr.length; i++) {
            let d = sr[i].document
            if (d[ROOT_HASH] !== r[ROOT_HASH])
              continue
            // Don't add the verification for teh previous copy of the document
            if (!r[PREV_HASH] || d[PREV_HASH] === r[CUR_HASH])
              return
            if (r[PREV_HASH] === d[CUR_HASH]) {
              sr.splice(i, 1)
              break
            }
          }
        }
        shareableResources[docType].push(verification)
        shareableResourcesRootToR[r[ROOT_HASH]] = r
        addSharedWithProvider(verification)
      }
    }
    function addSharedWithProvider(verification) {
      let hash = verification.document[ROOT_HASH]
      let o = shareableResourcesRootToOrgs[hash]
      if (!o) {
        o = []
        shareableResourcesRootToOrgs[hash] = o
      }
      else {
        let oId = utils.getId(verification.organization)
        let oo = o.filter((r) => utils.getId(r) === oId)
        if (oo.length)
          return
      }
      o.push(verification.organization)
    }
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
      if (!value[p]  &&  (typeof value[p] === 'undefined'))
        delete value[p];
    }
    if (!value[TYPE])
      value[TYPE] = modelName;

    var model = this.getModel(modelName)
    var props = model.properties;
    var newLanguage

    var isMessage = utils.isMessage(model)
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
      // if (!isNew  &&  (!value.urls  ||  (value.urls  &&  value.urls.indexOf(value.url) !== -1))) {
      //   this.trigger({action: 'addItem', resource: value, error: 'The "' + props.url.title + '" was already added'})
      //   return
      // }
    }
    else if (isNew)
      value[CUR_HASH] = dhtKey //isNew ? dhtKey : value[ROOT_HASH]

    let isInMyData = isMessage &&  utils.isSavedItem(value)
    var batch = [];
    value.time = value.time || new Date().getTime();
    if (isMessage) {
      let isForm = model.subClassOf === FORM
      if (/*isNew  &&*/  isForm  &&  !isInMyData) {
        if (!value._sharedWith)
          value._sharedWith = []
        this.addSharedWith(value, value.to, new Date().getTime())
      }
      // if (isNew)
      //   this.addVisualProps(value)
      if (!isNew  &&  !isForm) {
        let prevRes = list[value[TYPE] + '_' + value[ROOT_HASH] + '_' + value[PREV_HASH]]
        if (prevRes) {
          prevRes = prevRes.value
          prevRes[NEXT_HASH] = value[CUR_HASH]
          this.dbBatchPut(utils.getId(prevRes), prevRes, batch)
        }
      }

      if (props['to']  &&  props['from'])
        this.addLastMessage(value, batch)
    }
    var iKey = utils.getId(value) //modelName + '_' + value[ROOT_HASH];
    this.dbBatchPut(iKey, value, batch);

    var mid;

    if (isRegistration) {
      let sample = utils.clone(sampleProfile)
      extend(sample, value)
      value = sample
      return this.registration(value)
    }

    if (value[TYPE] === SETTINGS)
      return this.addSettings(value, params.maxAttempts ? params.maxAttempts : -1)

    let meId = utils.getId(me)
    let self = this
    db.batch(batch)
    .then(() => {
      return db.get(iKey)
    })
    .then((value) => {
      if (isMessage) {
        let r = this.addVisualProps(value)
        if (r === value)
          r = value
      }
      this._setItem(iKey, value)
      if (isMessage  &&  !isInMyData) {
        let toId = utils.getId(value.to)
        if (toId === meId)
          toId = utils.getId(value.from)
        if (value.to.organization  &&  value.from.organization  &&  utils.getId(value.to.organization)  !== utils.getId(value.from.organization)) {
          let org = this._getItem(toId).organization
          this.addMessagesToChat(utils.getId(org), value)
        }
        else if (value._context  &&  utils.isReadOnlyChat(value._context))
          this.addMessagesToChat(utils.getId(value._context), value)
      }
      if (mid)
        this._setItem(MY_IDENTITIES, mid)
      else if (!isNew  &&  iKey === meId) {
        if (me.language || value.language) {
          if (value.language) {
            if (!me.language  ||  (utils.getId(me.language) !== utils.getId(value.language)))
              newLanguage = this._getItem(utils.getId(value.language))
          }
        }

        Object.assign(me, value)
        // extend(true, me, value)
        this.setMe(me)
        if (newLanguage) {
          let lang = this._getItem(utils.getId(me.language))
          value.languageCode = lang.code
          this.dbPut(iKey, value)

          me.language = lang
          me.languageCode = lang.code
          this.setMe(me)
          var urls = []
          if (SERVICE_PROVIDERS) {
            SERVICE_PROVIDERS.forEach((sp) => {
              if (urls.indexOf(sp.url) === -1)
                urls.push(sp.url)
            })
            return this.getInfo({serverUrls: urls})
          }
        }
      }
    })
    .then(() => {
      var  params = {action: newLanguage ? 'languageChange' : 'addItem', resource: value};
      // registration or profile editing
      if (!noTrigger) {
        this.trigger(params);
      }
      if (model.subClassOf === FORM) {
        if (model.interfaces.indexOf(ITEM) !== -1) {
          let {container, item} = getContainerProp(model)
          if (value[container.name]) {
            let cRes = this._getItem(utils.getId(value[container.name]))
            this.onExploreBacklink(cRes, item, true)
          }
        }
        let mlist = this.searchMessages({modelName: FORM})
        let olist = this.searchNotMessages({modelName: ORGANIZATION})
        this.trigger({action: 'list', modelName: ORGANIZATION, list: olist, forceUpdate: true})
      }
    })
    .catch((err) => {
      if (!noTrigger) {
        this.trigger({action: 'addItem', error: err.message, resource: value})
      }
      err = err;
    })
    function getContainerProp(model) {
      let props = model.properties
      let refProps = utils.getPropertiesWithAnnotation(props, 'ref')
      for (let p in refProps) {
        let l = props[p]
        let container = self.getModel(l.ref)
        if (!utils.isMessage(container))
          continue
        let cProps = container.properties
        let containerBl = utils.getPropertiesWithAnnotation(cProps, 'items')
        for (let c in containerBl)  {
          if (cProps[c].items.ref === model.id)
            return {container: props[p], item: cProps[c]}
        }

      }
    }
  },
  addLastMessage(value, batch, sharedWith) {
    let model = this.getModel(value[TYPE])
    if (model.id === CUSTOMER_WAITING || model.id === SELF_INTRODUCTION)
      return
    if (model.id === SIMPLE_MESSAGE  &&  value.message  && value.message === '[already published](tradle.Identity)')
      return
    if (value._context  &&  utils.isReadOnlyChat(value._context))
      return

    let to = this._getItem(utils.getId(value.to));
    let toId = utils.getId(to)
    if (toId !== meId  &&  to.bot)
      to = this._getItem(utils.getId(to.organization))

    let dn
    let messageType = model.id
    if (sharedWith) {
      let sharedWithOrg = this._getItem(utils.getId(sharedWith.organization))
      let orgName = sharedWithOrg.name
      // let orgName = utils.getDisplayName(to, this.getModel(ORGANIZATION).value.properties)
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

    let from = this._getItem(utils.getId(value.from));
    let fromId = utils.getId(from)
    let meId = utils.getId(me)
    let isNew = !value[ROOT_HASH] || !this._getItem(utils.getId(value))

    if (fromId !== meId  &&  from.bot)
      from = this._getItem(utils.getId(from.organization))

    if (model.id === FORM_REQUEST  &&  value.product) {
      let m = this.getModel(value.product)
      if (m.forms.indexOf(value.form) !== 0)
        return
      dn = translate('formRequest', translate(this.getModel(value.product)))
      messageType = FINANCIAL_PRODUCT
    }
    else if (model.id === VERIFICATION) {
      let docType = utils.getId(value.document).split('_')[0]
      dn = translate('receivedVerification', translate(this.getModel(docType)))
    }
    else if (model.id === PRODUCT_APPLICATION)
      dn = this.getModel(value.product).title
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
        title: utils.getDisplayName(value, this.getModel(me[TYPE]).properties),
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
      me.language = this._getItem(utils.getId(me.language))
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
  addSettings: co(function* addSettings (value, maxAttempts) {
    var self = this
    var v = value.url
    if (v.charAt(v.length - 1) === '/')
      v = v.substring(0, v.length - 1)

    var key = SETTINGS + '_1'
    const settings = this._getItem(key)
    let allProviders, oneProvider
    if (value.id) {
      if (SERVICE_PROVIDERS) {
        if (SERVICE_PROVIDERS.some((r) => r.id === value.id  &&  r.url === value.url))
          return
      }
      // We don't have this provider yet
      if (settings  &&  settings.urls.indexOf(value.url) !== -1) {
        // check if all providers were fetched from this server.
        if (!Object.keys(settings.urlToId).length)
          allProviders = true
        // check if this provider was already requested but
        // it was not picked up or it was removed on server and may be added again
        else if (settings.urlToId[value.id].indexOf(value.id) !== -1)
          oneProvider = true
      }
    }
    let gotInfo
    if (maxAttempts !== -1) {
      let attempts = 0
  //     let waitTime = 1000
  //     let maxWait = 60000
      while (true) {
        try {
          yield this.getInfo({serverUrls: [v], retry: false, id: value.id ? value.id : null, newServer: true, maxAttempts: maxAttempts})
          gotInfo = true
          break;
        }
        catch (err) {
          if (attempts === maxAttempts) {
            this.trigger({action: 'noAccessToServer'})
            return
          }
          attempts++
        }
      }
    }
    if (!gotInfo)
      try {
        yield this.getInfo({serverUrls: [v], retry: true, id: value.id ? value.id : null, newServer: true})
      } catch (err) {
        self.trigger({action: 'addItem', error: err.message, resource: value})
      }
    if (allProviders)
      return
    if (settings) {
      if (settings.urls.indexOf(v) === -1)
        self._mergeItem(key, { urls: [...settings.urls, v] })
      // Save the fact that only some providers are needed from this server
      if (value.id) {
        var urlToId = settings.urlToId
        if (!urlToId[v])
          urlToId[v] = [value.id]
        else if (urlToId[v].indexOf(value.id) === -1)
          urlToId[v].push(value.id)
        else
          return

        self._mergeItem(key, { urlToId: urlToId })
      }
    }
    else {
      value.urls = SERVICE_PROVIDERS_BASE_URL_DEFAULTS.concat(v)
      self._setItem(key, value)
    }
    self.trigger({action: 'addItem', resource: value})
    return self.dbPut(key, self._getItem(key))
  }),
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
        var employees = this.searchNotMessages({modelName: PROFILE, prop: 'organization', to: r})

        if (employees)
          pubkeys = list[IDENTITY + '_' + employees[0][ROOT_HASH]].pubkeys
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
    var mePub = me[ROOT_HASH] ? this._getItem(IDENTITY + '_' + me[ROOT_HASH]).pubkeys : me.pubkeys
    var mePriv
    var identity
    var allMyIdentities = this._getItem(MY_IDENTITIES)
    if (allMyIdentities) {
      var all = allMyIdentities.allIdentities
      var curId = allMyIdentities.currentIdentity
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
      language = list[utils.getId(me.language)] && this._getItem(utils.getId(me.language))

    return driverPromise = this.loadIdentityAndKeys(me)
    .then(result => {
      if (!Keychain) {
        let privkeys = result.keys.map(k => {
          return k.toJSON ? k.toJSON(true) : k
        })
        let myIdentities = this._getItem(MY_IDENTITIES)
        if (myIdentities) {
          let currentIdentity = myIdentities.currentIdentity
          myIdentities.allIdentities.forEach((r) => {
             if (r.id === currentIdentity)
               r.privkeys = privkeys
          })
          this.dbPut(MY_IDENTITIES, myIdentities)
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
    .catch(err => {
      if (!/authentication failed/.test(err.message)) {
        // Alert.alert(
        //   'Something went wrong...',
        //   'Please restart the app and try again'
        // )

        throw err
      }

      // user doesn't have passcode enabled
      return new Promise(resolve => {
        Alert.alert(
          translate('youShallNotPass'),
          translate('enablePasscodeFirst'),
          [
            { text: 'OK', onPress: resolve }
          ]
        )
      })
      // retry
      .then(() => this.createNewIdentity())
    })
  },

  publishMyIdentity(orgRep, disableAutoResponse) {
    var self = this
    var msg = {
      [TYPE]: IDENTITY_PUBLISHING_REQUEST,
      [NONCE]: self.getNonce(),
      identity: meDriver.identity,
      profile: {
        firstName: me.firstName
      }
    }
    var opts = {
      object: msg,
      to: { permalink: orgRep[ROOT_HASH] }
    }
    if (disableAutoResponse)
      opts.other = { disableAutoResponse: true }

    return meDriver.signAndSend(opts)
    .catch(function(err) {
      debugger
    })
  },
  loadAddressBook() {
    return // method not used currently

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
    var self = this;
    var dfd = Q.defer();
    var batch = [];
    var props = this.getModel(PROFILE).properties;
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
        var myIdentities = self._getItem(MY_IDENTITIES)
        if (myIdentities)  {
          var currentIdentity = myIdentities.currentIdentity;
          newIdentity[constants.OWNER] = {
            id: currentIdentity,
            title: utils.getDisplayName(currentIdentity, props)
          };
          // if (me.organization) {
          //   var photos = list[utils.getId(me.organization.id)].value.photos;
          //   if (photos)
          //     me.organization.photo = photos[0].url;
          // }
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
        var model = self.getModel(obj[TYPE])
        var addCurHash = model.subClassOf === FORM || model.subClassOf === MY_PRODUCT
        // if (isForm  ||  model.id === PRODUCT_APPLICATION) {
        let key = obj[TYPE] + '_' + obj[ROOT_HASH] + (addCurHash ? '_' +  obj[CUR_HASH] : '')
        var r = list[key]
        if (r) {
          r = r.value
          if (r._sendStatus !== SENT) {
            self.trigger({action: 'updateItem', sendStatus: SENT, resource: r})
            r._sendStatus = SENT
            self.dbPut(key, r)
          }
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

      meDriver.on('message', async function (msg) {
        self.maybeWatchSeal(msg)
        const payload = msg.object.object
        if (payload[TYPE] === MESSAGE) {
          let obj = msg.object
          obj.from = {[ROOT_HASH]: msg.objectinfo.author}
          obj.objectinfo = msg.objectinfo
          try {
            const originalRecipient = await meDriver.addressBook.byPubKey(msg.object.object.recipientPubKey)
            obj.to = {[ROOT_HASH]: originalRecipient.permalink}
            obj.parsed = {data: payload.object}
            obj[ROOT_HASH] = protocol.linkString(obj.parsed.data)
            if (!obj.parsed.data[CUR_HASH])
              obj[CUR_HASH] = obj[ROOT_HASH]

            await self.putInDb(obj, true)
            self.trigger({ action: 'receivedMessage', msg: msg })
          } catch (err) {
            console.error('1. failed to process received message', err)
          }

          return
        }
        else if (payload[TYPE] === VERIFICATION && payload.sources) {
// const pubKeys = []
// forEachSource(payload.sources, function (source) {
//   pubKeys.push(tradleUtils.claimedSigPubKey(source).pub.toString('hex'))
// })

// console.log(pubKeys)
          const sourceToAuthor = await lookupSourceAuthors(meDriver, payload.sources)
          for (var [verification, author] of sourceToAuthor) {
            let a = self._getItem(PROFILE + '_' + author.permalink)
            verification.from = self.buildRef(a)
            verification.from.organization = utils.clone(a.organization)
          }
          // debugger
        }
        else if (payload[TYPE] === PARTIAL) {
          msg.object[ROOT_HASH] = msg.objectinfo.permalink

          payload.context = msg.object.forContext || msg.object.context
          payload.leaves = tradle.partial.interpretLeaves(payload.leaves)

          let partialPermalink = payload.leaves.find(l => l.key === ROOT_HASH && l.value)
          if (partialPermalink)
            msg.partialinfo.permalink = partialPermalink.value
          else
            msg.partialinfo.permalink = msg.partialinfo.link

          let from = PROFILE + '_' + msg.partialinfo.author
          let fromR = self._getItem(from)
          payload.from = fromR ? self.buildRef(fromR) : {id: from}

          let type = payload.leaves.find(l => l.key === TYPE && l.value).value
          payload.type = type
          var r = {
            [TYPE]: type,
            [ROOT_HASH]: msg.partialinfo.permalink,
            [CUR_HASH]: msg.partialinfo.link
          }
          payload.resource = {id: utils.getId(r)}
          payload.providerInfo = utils.clone(self._getItem(PROFILE + '_' + msg.objectinfo.author).organization)
          // debugger
        }
        // else if (payload[TYPE] === CONFIRM_PACKAGE_REQUEST)
        //   debugger

        const old = utils.toOldStyleWrapper(msg)
        old.to = { [ROOT_HASH]: meDriver.permalink }
        try {
          await self.putInDb(old, true)
          if (payload[TYPE] === PARTIAL)
            self.onGetAllPartials(payload)
          self.trigger({ action: 'receivedMessage', msg: msg })
        } catch (err) {
          debugger
          console.error('2. failed to process received message', err)
        }
      })
    // })
    // return meDriver.ready()
  },
  dbPut(key, value) {
    let v = utils.isMessage(value)  &&  value[TYPE] !== CONFIRM_PACKAGE_REQUEST ? utils.optimizeResource(value, true) : value
    return db.put(key, v)
  },
  dbBatchPut(key, value, batch) {
    let v = utils.isMessage(value)  &&  value[TYPE] !== CONFIRM_PACKAGE_REQUEST ? utils.optimizeResource(value, true) : value
    batch.push({type: 'put', key: key, value: v})
  },
  maybeWatchSeal(msg) {
    const payload = msg.object.object
    const type = payload[TYPE]
    let model = this.getModel(type)
    if (!model) return
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
      .done()

    // meDriver.watchSeal({
    //   link: msg.link,
    //   basePubKey: msg.object.recipientPubKey
    // }).done()
  },

  // updateMe() {
  //   db.put(utils.getId(me), me)
  // },

  putInDb(obj, onMessage) {
    return this._loadedResourcesDefer.promise
    .then(() => this._putInDb(obj, onMessage) || Q())
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

    var from = this._getItem(fromId)
    var me = utils.getMe()
    if (utils.getId(me) === fromId)
      val.time = val.time || obj.timestamp
    else {
      val.sentTime = val.time || obj.timestamp
      if (!val.time)
        val.time = new Date().getTime()
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
    var model = this.getModel(type)
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
      var isMessage = utils.isMessage(model)
      if (isMessage) {
        // if (val[TYPE] === PRODUCT_LIST  &&  (!val.list || !val.list.length))
        //   return
        noTrigger = this.putMessageInDB(val, obj, batch, onMessage)
        if (type === VERIFICATION)
          return
      }
      else
        this.dbBatchPut(key, val, batch)
    }
    if (model.subClassOf === MY_PRODUCT)
      val._sharedWith = [this.createSharedWith(utils.getId(val.from.id), new Date().getTime())]

    self._mergeItem(key, val)
    // var retParams = {
    //   action: isMessage ? 'messageList' : 'list'
    // }

    var resultList

    let isMyMessage
    if (isMessage) {
      var toId = PROFILE + '_' + obj.to[ROOT_HASH]
      var meId = PROFILE + '_' + me[ROOT_HASH]
      isMyMessage = isMessage ? (toId !== meId  &&  fromId !== meId) : false
      // let to = this._getItem(toId)
      // var isSelfIntroduction = model.id === SELF_INTRODUCTION
      // if (isMyMessage) {
      //   var id = !isSelfIntroduction  &&  toId === meId ? fromId : toId
      //   if (!noTrigger  &&  id) {
      //     var to = this._getItem(id)
      //     if (to.organization) {
      //       var org =  this._getItem(utils.getId(to.organization))
      //       resultList = this.searchMessages({to: org, modelName: MESSAGE})
      //     }
      //     else
      //       resultList = this.searchMessages({to: to, modelName: MESSAGE})
      //     retParams.list = resultList
      //     var shareableResources = this.getShareableResources(resultList, to);
      //     if (shareableResources)
      //       retParams.shareableResources = shareableResources
      //     retParams.resource = to
      //   }
      // }
    }
    // else if (!onMessage  &&  val[TYPE] != PROFILE) {
    //   resultList = this.searchNotMessages({modelName: val[TYPE]})
    //   retParams.list = resultList
    // }

    return db.batch(batch)
    .then(() => {
      // if (onMessage  &&  val[TYPE] === FORGOT_YOU) {
      //   this.forgotYou(from)
      // }

      // else
      if (model.id === PRODUCT_LIST  &&  isMyMessage) {
        // var orgList = this.searchNotMessages({modelName: ORGANIZATION})
        // this.trigger({action: 'list', list: orgList, forceUpdate: true})
        this.trigger({action: 'getItem', resource: this._getItem(utils.getId(from.organization))})
      }

      if (isConfirmation  &&  isMyMessage) {
        var fOrg = from.organization
        var org = fOrg ? this._getItem(utils.getId(fOrg)) : null
        var msg = {
          message: me.firstName + ' is waiting for the response',
          [TYPE]: constants.TYPES.CUSTOMER_WAITING,
          from: me,
          to: org,
          time: new Date().getTime()
        }
        this.onAddMessage({msg: msg, isWelcome: true})
      }
      else if (isMessage  &&  !noTrigger) {
        if (onMessage) {
          let meId = utils.getId(me)
          if (me.isEmployee) {
            let isReadOnlyChat
            if (val._context)
              isReadOnlyChat = utils.isReadOnlyChat(this._getItem(val._context))
            else
              isReadOnlyChat = utils.isReadOnlyChat(val)
            if (!val._context  ||  isReadOnlyChat) {
              let notMeId = toId === meId ? fromId  : toId
              let notMe = this._getItem(notMeId)
              if (notMe  &&  !notMe.bot) {
                ++notMe._unread
                this.trigger({action: 'updateRow', resource: notMe})
              }
            }
            if (isReadOnlyChat  &&  val[TYPE] === PRODUCT_APPLICATION)
              this.onGetAllSharedContexts()
          }
        }
        this.trigger({action: 'addItem', resource: val})
      }
      else if (representativeAddedTo /* &&  !triggeredOrgs*/) {
        var orgList = this.searchNotMessages({modelName: ORGANIZATION})
        this.trigger({action: 'list', list: orgList, forceUpdate: true})
      }
      else if (!isMessage  &&  val[TYPE] === PARTIAL)
        this.trigger({action: 'hasPartials'})

      if (utils.isWeb()  &&  val[TYPE] === APPLICATION_SUBMITTED  && ENV.offerKillSwitchAfterApplication  &&  !utils.getMe().useGesturePassword) {
        setTimeout(() => {
          this.trigger({action: 'offerKillSwitchAfterApplication'})
        }, 2000)
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
    let v = list[key] ? this._getItem(profileKey) : null
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
      org = list[utils.getId(val.organization)]  &&  this._getItem(utils.getId(val.organization))
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
    var from = this._getItem(fromProfile)

    if (!from) {
      if (val[TYPE] !== SELF_INTRODUCTION)
        return
      let name = val.name || (val.identity.name && val.identity.name.formatted)
      from = {
        [TYPE]: PROFILE,
        [ROOT_HASH]: obj.objectinfo.author,
        firstName: name ?  name.charAt(0).toUpperCase() + name.slice(1) : 'NewCustomer' + Object.keys(list).length
      }
    }

    let key = utils.getId(val)

    // if (me  &&  from[ROOT_HASH] === me[ROOT_HASH])
    //   return
    var toId = PROFILE + '_' + obj.to[ROOT_HASH]
    var to = this._getItem(toId)
    var meId = utils.getId(me)
    // HACK for showing verification in employee's chat

    let isThirdPartySentRequest
    // HACK for showing verification in employee's chat
    if (val[TYPE] === VERIFICATION) {
      let document = this._getItem(utils.getId(val.document))
      if (!document) {
        debugger
        return
      }
      let context = this._getItem(obj.object.context ? this._getItem(PRODUCT_APPLICATION + '_' + obj.object.context) : document._context)
      context = context ? this._getItem(context) : null
      if (context) {
        let originalTo = context.to.organization // this._getItem(document.to).organization
        let verificationFrom = from.organization

        if (verificationFrom  !==  originalTo) { //}  &&  val._context  &&  utils.isReadOnlyChat(val._context)) {
          val._verifiedBy = from.organization
          to = this._getItem(document.from)  // document from is not changing but to does depending on what party verifies or asks for corrections
          toId = utils.getId(to)
          from = this._getItem(utils.clone(context.to))
          isThirdPartySentRequest = true
        }
      }
    }
    // if (val[TYPE] === VERIFICATION  && me.isEmployee  &&  meId === toId) {
    //   let document = this._getItem(val.document)
    //   if (utils.getId(document.from) === meId) {
    //     val._verifiedBy = from.organization
    //     fromProfile = document.from
    //     from = this._getItem(fromProfile)
    //   }
    // }

    var fOrg = (me  &&  from[ROOT_HASH] === me[ROOT_HASH]) ? to.organization : from.organization
    var org = fOrg ? this._getItem(utils.getId(fOrg)) : null
    var inDB
    if (onMessage) {
      let fromId = utils.getId(from)
      // let meId = utils.getId(me)
      // if (me.isEmployee) {
      //   let notMeId = toId === meId ? fromId  : toId
      //   let notMe = this._getItem(notMeId)
      //   if (!notMe.bot) {
      //     ++notMe._unread
      //     // this.trigger({action: 'updateRow', resource: notMe})
      //   }
      // }
      let profileModel = this.getModel(PROFILE)
      val.from = {
        id: fromId,
        title: from.formatted || from.firstName
      }
      val.to = {
        id: toId,
        title: to.formatted || to.firstName
      }
      // self.fillFromAndTo(obj, val)
    }
    else {
      let inDB = this._getItem(key)
      val.from = inDB.from
      val.to = inDB.to
      val._context = inDB._context
      val._sharedWith = inDB._sharedWith
      val.verifications = inDB.verifications
      if (val.txId  &&  !inDB.txId) {
        val.time = inDB.time
        val.sealedTime = val.time || obj.timestamp
      }
    }
    let isReadOnly = utils.getId(to) !== meId  &&  utils.getId(from) !== meId
    // if (val[TYPE] === PRODUCT_APPLICATION  &&  isReadOnly) {
    //   // props that are convenient for displaying in shared context
    //   val.from.organization = this._getItem(utils.getId(val.from)).organization
    //   val.to.organization = this._getItem(utils.getId(val.to)).organization
    //   // val._readOnly = true
    // }
    let isNew = val[ROOT_HASH] === val[CUR_HASH]
    if (obj.object.context  &&  val[TYPE] !== PRODUCT_APPLICATION) {
      // if (!val._contexts)
      //   val._contexts = []
      let contextId = PRODUCT_APPLICATION + '_' + obj.object.context
      let context = this._getItem(contextId)

      // Avoid doubling the number of forms
      if (context) {
        isThirdPartySentRequest = utils.getId(from) !== utils.getId(context.from)  &&  utils.getId(from) !== utils.getId(context.to)
        if (!inDB)
          context.formsCount = context.formsCount ? ++context.formsCount : 1
        context.lastMessageTime = new Date().getTime()
        batch.push({type: 'put', key: contextId, value: context})
        val._context = this.buildRef(context)
      }
      // val._contexts.push(this.buildRef(context))
    }
    else if (val[TYPE] === FORM_REQUEST  &&  isNew) {
      let product = val.product
      let contexts = this.searchMessages({modelName: PRODUCT_APPLICATION, to: org})
      if (contexts) {
        let i = contexts.length - 1
        for (; i>=0; i--)
          if (contexts[i].product === product) {
          // if (!val._contexts)
          //   val._contexts = []
          // val._contexts.push(this.buildRef(contexts[i]))
            val._context = this.buildRef(contexts[i])
            break
          }
      }
    }
    if (val[TYPE] === FORM_REQUEST) {
      let self = this
      ///=============== TEST VERIFIERS
      if (isNew) {
        // Prefill for testing and demoing

        let orgs = {}
        this.searchNotMessages({modelName: ORGANIZATION}).forEach((r) => orgs[utils.getId(r)] = r)

        newFormRequestVerifiers(from, SERVICE_PROVIDERS, val, orgs)
        //============
        if (SERVICE_PROVIDERS && val.verifiers) {
          if (!val.message) {
            val.message = 'Please have this form verified by one of our trusted associates'
          }

          val.verifiers.forEach((v) => {
            let serviceProvider = SERVICE_PROVIDERS.find((sp) => {
              if (!utils.urlsEqual(sp.url, v.url)) return
              if (v.id) return v.id === sp.id

              return v.permalink === sp.permalink
            })

            if (serviceProvider) {
              v.provider = serviceProvider.org
              let org = self._getItem(v.provider)
              v.name = org.name
              v.id = serviceProvider.id
              v.photo = org.photos && org.photos[0].url
            }
            // else
            //   this.getInfo([v.url], true) //, id)
          })
        }
      }

      let formRequests = this.searchMessages({modelName: FORM_REQUEST, to: org})
      if (formRequests)
        formRequests.forEach((r) => {
          if (!r.documentCreated  &&  r.form === val.form) {
            r.documentCreated = true
            let rId = utils.getId(r)
            this._getItem(rId).documentCreated = true
            batch.push({type: 'put', key: rId, value: r})
          }
        })
    }
    // if (onMessage  &&  val[TYPE] === FORGOT_YOU) {
    //   this.forgotYou(from)
    //   return
    // }

    var isProductList = val[TYPE] === PRODUCT_LIST
    var isModelsPack = val[TYPE] === MODELS_PACK
    var pList = isProductList ? val.list : val.models

    var noTrigger
    if (pList) {
      org.products = []
      pList.forEach((m) => {
        // HACK for not overwriting Tradle models
        if (isModelsPack  &&  m.id.indexOf('tradle.') === 0) {
          console.log('ModelsPack: the name you chose is the same as one of Tradle\'s core Models. Please rename and resend the model')
          return
        }

        this.addNameAndTitleProps(m)
        models[m.id] = {
          key: m.id,
          value: m
        }
        if (isProductList  &&  m.subClassOf === FINANCIAL_PRODUCT)
          org.products.push(m.id)

        if (m.subClassOf === ENUM)
          this.createEnumResources(m)

        if (utils.isMessage(m)) {
          this.addVerificationsToFormModel(m)
          this.addFromAndTo(m)
        }
        if (!m[ROOT_HASH])
          m[ROOT_HASH] = 1
        batch.push({type: 'put', key: m.id, value: m})
      })
      utils.setModels(models)
      let orgId = utils.getId(org)
      list[orgId].value = org
      batch.push({type: 'put', key: utils.getId(org), value: org})
      this.trigger({action: 'getItem', resource: org})
      noTrigger = hasNoTrigger(orgId)
    }
    if (isProductList  &&  this.preferences) {
      if (this.preferences.firstPage === 'chat' && ENV.autoRegister) {
          // ENV.autoRegister                &&
          // org.products.length === 1) {
        let meRef = this.buildRef(utils.getMe())
        let pa = this.searchMessages({modelName: PRODUCT_APPLICATION})
        let product = org.products[0]
        let hasThisProductApp
        if (pa) {
          hasThisProductApp = pa.some((r) => r.product === product)
        }
        if (hasThisProductApp)
          return
        if (org._greeting) {
          let msg = {
            [TYPE]: SIMPLE_MESSAGE,
            [ROOT_HASH]: val.from.title.replace(' ', '_') + '_1',
            message: translate(org._greeting),
            time: new Date().getTime(),
            from: val.from,
            to: meRef
          }
          let msgId = utils.getId(msg)
          this._setItem(msgId, msg)
          this.addMessagesToChat(utils.getId(org), msg)
          this.trigger({action: 'addMessage', resource: msg})
          db.put(msgId, msg)

          // this.onAddMessage({
          //   msg: {
          //     [TYPE]: SIMPLE_MESSAGE,
          //     message: translate(this.preferences._message),
          //     to: val.from,
          //     from: meRef
          //   }
          // })
        }
        this.onAddMessage({
          msg: {
            [TYPE]: PRODUCT_APPLICATION,
            product: product,
            from: meRef,
            to: val.from
          }
        })
        return
      }
    }
    var isStylesPack = val[TYPE] === STYLES_PACK
    if (isStylesPack) {
      org.style = utils.interpretStylesPack(val)
      batch.push({type: 'put', key: utils.getId(org), value: org})
      this.trigger({action: 'customStyles', provider: org})
    }

    if (!val.time)
      val.time = obj.timestamp

    let type = val[TYPE]
    var model = this.getModel(type)
    let isVerification = type === VERIFICATION  || (model  && model.subClassOf === VERIFICATION)
    if (isVerification) {
      this.onAddVerification({r: val, notOneClickVerification: false, dontSend: true, isThirdPartySentRequest: isThirdPartySentRequest})
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
    // if (model.subClassOf === MY_PRODUCT)
    //   val.from.organization = this._getItem(utils.getId(val.from)).organization
    if (!isProductList  &&  !isReadOnly) {
    //   if (!from.lastMessageTime || (new Date() - from.lastMessageTime) > WELCOME_INTERVAL)
    //     batch.push({type: 'put', key: key, value: val})
    // }
    // else {
      let meId = utils.getId(to)
      if (val[TYPE] === MY_EMPLOYEE_PASS) {
        to.isEmployee = true
        to.organization = this.buildRef(org)
        this.resetForEmployee(to, org)
        // to.organization._canShareContext = org._canShareContext
        // to.organization._hasSupportLine = org._hasSupportLine
        // this.setMe(to)
        // batch.push({type: 'put', key: utils.getId(to), value: to})
        if (to.firstName === FRIEND) {
          let toRep = this.getRepresentative(utils.getId(org))
          toRep = this._getItem(toRep)
          let result = this.searchMessages({modelName: PERSONAL_INFO, to: org})
          let fRes = result.filter((r) => utils.getId(r.from) === meId)
          to.firstName = fRes[0].firstName
          this._setItem(meId, to)
          this.dbPut(meId, to)
        }
      }
      else {
        let fromId = utils.getId(val.from)
        let fr = this._getItem(fromId)
        if (val[TYPE] === NAME) {
          fr.firstName = val.givenName
          fr.lastName = val.surname
          this._setItem(fromId, fr)
          this.dbPut(fromId, fr)
          this.trigger({action: 'addItem', resource: fr})
        }
        else if (fr.firstName === FRIEND) {
          if (val[TYPE] === PHOTO_ID) {
            let personal = val.scanJson.personal
            if (personal) {
              let { firstName, lastName } = personal
              if (firstName) {
                firstName = firstName.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
                fr.firstName = firstName
                if (lastName) {
                  lastName = lastName.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
                  fr.lastName = lastName
                }
              }
            }
          }
          this._setItem(fromId, fr)
          this.dbPut(fromId, fr)
          this.trigger({action: 'addItem', resource: fr})
        }
      }
      this.addLastMessage(val, batch)
    }
    if (list[key]) {
      let v = {}
      extend(true, v, val)
      this._setItem(key, v)
    }
    if (!noTrigger) {
      let context = val._context ? this._getItem(utils.getId(val._context)) : null
      if (isReadOnly) {
        if (val[TYPE] === PRODUCT_APPLICATION)
          this.addMessagesToChat(utils.getId(val), val)
        else if (val._context) {
          let cId = utils.getId(context)
          if (val._context  &&  utils.isReadOnlyChat(val)) // context._readOnly)
            this.addMessagesToChat(cId, val)
          if (val[TYPE] === ASSIGN_RM || val[TYPE] === APPLICATION_DENIAL || val[TYPE] === CONFIRMATION || val[TYPE] === APPLICATION_SUBMITTED) {
            if (val[TYPE] === ASSIGN_RM)
              context._assignedRM = val.employee
            else if (val[TYPE] === APPLICATION_DENIAL)
              context._denied = true
            else if (val[TYPE] === APPLICATION_SUBMITTED)
              context._appSubmitted = true
            else
              context._approved = true
            this._setItem(cId, context)
            this.trigger({action: 'updateRow', resource: context, forceUpdate: true})
            this.dbBatchPut(cId, context, batch)
          }
        }
      }
      // Check that the message was send to the party that is not anyone who created the context it was send from
      // That is possible if the message was sent from shared context
      else if (isThirdPartySentRequest) {
        let chat = utils.getId(context.to) === meId ? context.from : context.to
        chat = this._getItem(chat)
        let id  = chat.organization ? utils.getId(chat.organization) : utils.getId(chat)
        this.addMessagesToChat(id, val)
      }
      else
        this.addMessagesToChat(utils.getId(org ? org : from), val)

      this.dbBatchPut(key, val, batch)
      this.addVisualProps(val)
    }
    return noTrigger
    function hasNoTrigger(orgId) {
      let messages = chatMessages[orgId]
      if (!messages)
        return false
      let type
      // Skip all SELF_INTRODUCTION messages since they are not showing anyways on customer screen
      for (let i=0; i<messages.length; i++) {
        type = messages[i].id.split('_')[0]
        if (type  === PRODUCT_LIST)
          return true
      }
      // Don't trigger re-rendering the list if the current and previous messages were of PRODUCT_LIST type
      return false
    }
  },
  // if the last message showing was PRODUCT_LIST. No need to re-render
  fillFromAndTo(obj, val) {
    var whoAmI = obj.parsed.data._i.split(':')[0]
    var from = this._getItem(PROFILE + '_' + obj.objectinfo.author)
    var to = this._getItem(PROFILE + '_' + obj.to[ROOT_HASH])

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
  addFromAndTo(m) {
    if (!m.interfaces  ||  m.interfaces.indexOf(MESSAGE) === -1)
      return
    let properties = m.properties
    if (properties.from  &&  properties.to)
      return
    properties.from = {
      type: 'object',
      ref: IDENTITY,
      readOnly: true
    }
    properties.to = {
      type: 'object',
      ref: IDENTITY,
      readOnly: true
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
    const self = this;
    let myId
    // console.time('dbStream')
    var orgContacts = {}
    return utils.dangerousReadDB(db)
    .then((results) => {
      if (!results.length)
        return self.loadModels();

      results.forEach((data) => {
        if (data.value == null) return

        if (data.value.type === MODEL) {
          let m = data.value
          models[data.key] = data;
          self.setPropertyNames(m.properties)
          if (m.subClassOf === ENUM)
            self.createEnumResources(m)
          return
        }
        isLoaded = true
        if (!myId  &&  data.key === MY_IDENTITIES) {
          myId = data.value.currentIdentity;
          if (list[myId]) {
            me = this._getItem(myId)
            utils.setMe(me)
          }
        }
        if (!me  &&  myId  && data.key == myId) {
          me = data.value
          utils.setMe(me)
        }
        if (data.value[TYPE] === PROFILE) {
          if (data.value.securityCode)
            employees[data.value.securityCode] = data.value

          const org = data.value.organization
          if (org) {
            const orgId = utils.getId(org)
            if (!orgContacts[orgId])
              orgContacts[orgId] = []
            var c = orgContacts[orgId]
            c.push(self.buildRef(data.value))
          }
        }
        self._setItem(data.key, data.value)
      })
      var sameContactList = {}
      for (var p in orgContacts) {
        if (!list[p])
          continue
        var org = this._getItem(p)
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
      // this.loadStaticData()

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
      if (me) {
        // db resource do not have properties needed for rendering
        let allMessages = self.searchMessages({modelName: MESSAGE, to: me})
        if (allMessages) {
          allMessages.forEach((r) => {
            r = self.addVisualProps(r)
            self._setItem(utils.getId(r), r)
            // let props = ['from', 'to']
            // let pvals = [self._getItem(r.from.id), self._getItem(r.to.id)]
            // for (let i=0; i<props.length; i++) {
            //   let v = pvals[i]
            //   if (!v.organization)
            //     continue
            //   r[props[i]].organization = v.organization
            //   let org = self._getItem(v.organization)
            //   if (org.photos)
            //     r[props[i]].organization.photo = org.photos[0]
            // }
          })
        }
      }
    })
    .then(() => {
      if (me  &&  me.isEmployee) {
        let changed
        let orgId = utils.getId(me.organization)
        let org = this._getItem(orgId)
        if (org._canShareContext !== me.organization._canShareContext) {
          changed = true
          me.organization._canShareContext = org._canShareContext
        }
        if (org._hasSupportLine !== me.organization._hasSupportLine) {
          changed = true
          me.organization._hasSupportLine = org._hasSupportLine
        }
        if (changed) {
          let meId = utils.getId(me)
          db.put(meId, me)
          self._setItem(meId, me)
        }
      }
      if (me  &&  utils.isEmpty(chatMessages)) {
        // utils.setMe(me)
        this.initChats()
      }
      if (SERVICE_PROVIDERS)
        SERVICE_PROVIDERS.forEach((p) => this._getItem(p.org)._online = true)
      else {
        let orgs = self.searchNotMessages({modelName: ORGANIZATION})
        if (orgs)
          orgs.forEach((org) => {
            self._getItem(utils.getId(org))._online = false
          })
      }
      this._loadedResourcesDefer.resolve()
    })
    .catch(err => {
      debugger
      console.error('err: ' + err.message, err.stack);
    })
  },
  // Received by employee/bot request from customer. And all the customer resources on FI side gets deleted
  forgetMe(resource) {
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
        this.deleteMessageFromChat(utils.getId(resource), this._getItem(id))
        delete list[id]
      })
      this.trigger({action: 'messageList', modelName: MESSAGE, to: resource, forgetMeFromCustomer: true})
      return meDriver.signAndSend({
        object: { [TYPE]: FORGOT_YOU },
        to: { permalink: resource[ROOT_HASH] }
      })
    })
    .catch((err) => {
      debugger
    })
  },
  // Creates resources from subClassOf tradle.Enum models that have 'enum' model property
  createEnumResources(model) {
    if (model.subClassOf !== ENUM  ||  !model.enum)
      return
    let eProp
    for (let p in model.properties) {
      if (p !== TYPE) {
        eProp = p
        break
      }
    }
    model.enum.forEach((r) => {
      let enumItem = {
        [TYPE]: model.id,
        [ROOT_HASH]: r.id,
        [eProp]: r.title
      }
      this.loadStaticItem(enumItem)
    })
  },
  // Cleanup and notify customer that FI successfully forgotten him
  forgotYou(resource) {
    var self = this
    var org = this._getItem(utils.getId(resource.organization))
    var orgId = utils.getId(org)
    var msg = {
      [TYPE]: FORGOT_YOU,
      [NONCE]: this.getNonce(),
      message: translate('youAreForgotten'),
      from: this.buildRef(org),
      to: this.buildRef(me)
    }
    msg[ROOT_HASH] = sha(msg)

    var reps = this.getRepresentatives(utils.getId(org))
    var promises = []
    reps.forEach((r) =>
      promises.push(meDriver.forget(r[ROOT_HASH]))
    )
    var batch = []
    var notDeleted = {}
    return Q.allSettled(promises)
    .then((result) => {
      result.forEach((data) => {
        if (data.state !== 'fulfilled')
          return
        data.value.forEach((r) => {
          r = utils.toOldStyleWrapper(r)
          var rId = utils.getId(r)
          var res = list[rId] && this._getItem(rId)
          if (!res) {
            let idx = r[TYPE].indexOf('Confirmation')
            if (idx === -1)
              return
            let realProductType = r[TYPE].substring(0, r[TYPE].length - 'Confirmation'.length)
            let m = this.getModel(realProductType)
            if (!m  ||  m.subClassOf !== FINANCIAL_PRODUCT)
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
          var model = this.getModel(r[TYPE])
          var isForm = !isVerification  &&  model.subClassOf === FORM
          var deleted = !(res._sharedWith && res._sharedWith.length > 1)
          if (!deleted) {
            var fromId = utils.getId(res.from)
            var toId = utils.getId(res.to)
            var sharedWith = res._sharedWith || []
            var sharedWithKeys = sharedWith.map(function(r) {
              return r.bankRepresentative
            })
            reps.forEach(function(r) {
              var rId = utils.getId(r)
              var idx = sharedWithKeys.indexOf(rId)
              if (idx !== -1)
                sharedWith.splice(idx, 1)
            })
            let contextId = res  &&  res._context  &&  utils.getId(res._context)
            if (contextId) {
              for (let i=0; i<batch.length; i++) {
                if (batch[i].key === contextId  &&  batch[i].type === 'del') {
                  batch.splice(i, 1)
                  let c = this._getItem(contextId)
                  c._inactive = true
                  this.dbBatchPut(contextId, c, batch)
                  notDeleted[contextId] = c
                  break
                }
              }
              notDeleted[contextId] = res._context
            }
            if (res[TYPE] === VERIFICATION) {
              let documentId = utils.getId(res.document)
              for (let i=0; i<batch.length; i++) {
                if (batch[i].key === documentId  &&  batch[i].type === 'del') {
                  batch.splice(i, 1)
                  let doc = this._getItem(documentId)
                  doc._inactive = true
                  this.dbBatchPut(documentId, doc, batch)
                  notDeleted[documentId] = doc
                  break
                }
              }
            }
            this.dbBatchPut(rId, res, batch)
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
                var doc = this._getItem(utils.getId(res.document))
                if (doc.verifications) {
                  var verifications = doc.verifications.filter(function(r) {
                    return (utils.getId(r) === rId) ? false : true
                  })
                  if (doc.verifications.length != verifications.length) {
                    doc.verifications = verifications
                    for (var i=0; i<data.length; i++) {
                      if (data[i][ROOT_HASH] === doc[ROOT_HASH]  &&  !data[i].deleted)
                        this.dbBatchPut(utils.getId(doc), doc, batch)
                    }
                  }
                }
              }
            }
          }
          if (deleted  &&  !notDeleted[rId]) {
            if (res._sharedWith) {
              res._sharedWith.forEach((r) => {
                let org = this._getItem(r.bankRepresentative).organization
                // this.deleteMessageFromChat(utils.getId(org), res)
              })
            }
            // delete list[rId]
            // this.deleteMessageFromChat(orgId, r)
            batch.push({type: 'del', key: rId})
          }
        })
      })
      batch.forEach((r) => {
        if (r.type === 'del')
          delete list[r.key]
      })
      // this.trigger({action: 'messageList', list: [msg], resource: org, to: resource})
      this.trigger({action: 'messageList', list: [msg], to: org})
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
      org.numberOfForms = 0
      self.trigger({action: 'list', list: self.searchNotMessages({modelName: ORGANIZATION, to: org})})
      batch.push({type: 'put', key: orgId, value: org})
      if (batch.length)
        return db.batch(batch)
    })
    .catch(function(err) {
      debugger
    })
  },

  getAllSharedContexts() {
    let list = this.searchMessages({modelName: PRODUCT_APPLICATION})
    if (!list  ||  !list.length)
      return
    let l = list.filter((r) => {
      return utils.isReadOnlyChat(r)
    })
    let ll = l.map((r) => {
      let forms = this.searchMessages({modelName: MESSAGE, to: r})
      if (!forms  ||  r._approved)
        return
      let result = forms.map((rr) => {
        if (rr[TYPE] === APPLICATION_SUBMITTED) {
          r._appSubmitted = true
          this.dbPut(utils.getId(r), r)
        }
        else if (this.getModel(rr[TYPE]).subClassOf === MY_PRODUCT) {
          r._approved = true
          this.dbPut(utils.getId(r), r)
        }
      })
    })
    l.sort((a, b) => b.sentTime - a.sentTime)
    return l
  },
  cleanup(result) {
    // if (!result.length)
      return Q()

    var batch = []
    var meId = utils.getId(me)
    result.forEach((r) => {
      batch.push({type: 'del', key: utils.getId(r), value: r})
      if (this.getModel(r[TYPE]).interfaces) {
        let id = (utils.getId(r.from) === meId) ? utils.getId(r.to) : utils.getId(r.from)
        let rep = this._getItem(id)
        let orgId = rep.bot  &&  rep.organization ? utils.getId(rep.organization) : utils.getId(rep)

        this.deleteMessageFromChat(orgId, r)
      }
      delete list[utils.getId(r)]
    })
    return db.batch(batch)
    .catch(function(err) {
      err = err
    })
  },
  onTalkToRepresentative(resource, org) {
    var orgRep = resource[TYPE] === ORGANIZATION
               ? this.getRepresentative(utils.getId(resource))
               : resource
    if (!orgRep) {
      var msg = {
        [TYPE]: SIMPLE_MESSAGE,
        [NONCE]: this.getNonce(),
        message: 'All representatives are currently assisting other customers. Please try again later'
      }
      msg.from = this.buildRef(resource)
      msg.to = this.buildRef(me)
      msg.id = sha(msg)
      result.push(msg)
      this.trigger({action: 'messageList', list: result, resource: resource})
      return
    }
    var result = this.searchMessages({to: resource, modelName: MESSAGE});
    var msg = {
      [TYPE]: SIMPLE_MESSAGE,
      [NONCE]: this.getNonce(),
      message: 'Representative will be with you shortly. Please tell us how can we help you today?'
    }
    msg.from = this.buildRef(resource)
    msg.to = this.buildRef(me)
    msg.id = sha(msg)
    result.push(msg)
    this.trigger({action: 'messageList', list: result, resource: resource})
    var key = IDENTITY + '_' + orgRep[ROOT_HASH]

    return meDriver.signAndSend({
      object: msg,
      to: { fingerprint: this.getFingerprint(this._getItem(key)) }
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
        to: { fingerprint: this.getFingerprint(this._getItem(IDENTITY + '_' + rep[ROOT_HASH])) }
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

    let myIdentities = this._getItem(MY_IDENTITIES)
    if (myIdentities) {
      publishedIdentity = myIdentities.allIdentities[0].publishedIdentity
      deviceId = this._getItem(IDENTITY + '_' + pairingData.identity).deviceId
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
      let transport = driverInfo.wsClients.byUrl[url]
      if (!transport) {
        let wsClient = this.getWsClient(url, deviceId)
        transport = this.getTransport(wsClient, deviceId)
        driverInfo.wsClients.byUrl[url] = transport
      }
      let self = this
      transport.on('message', (msg, from) => {
        try {
          const payload = JSON.parse(msg)
          if (payload[TYPE] === PAIRING_RESPONSE) {
            transport.destroy()
            delete driverInfo.wsClients.byUrl[url]

            return self.onProcessPairingResponse(this._getItem(PAIRING_DATA + '_1'), payload)
            .then(() => {
              debugger
              Alert.alert('Pairing was successful')
              this.trigger({action: 'pairingSuccessful'})
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
      //   driverInfo.wsClients.byUrl[url] = transport
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
        let transport = driverInfo.wsClients.byUrl[url]
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
    let myIdentities = this._getItem(MY_IDENTITIES)
    let currentIdentity = myIdentities.currentIdentity

    let id = currentIdentity.replace(PROFILE, IDENTITY)
    list[id].value = identity || meDriver.identity

    myIdentities.allIdentities.forEach((r) => {
      if (r.id === currentIdentity)
        r.publishedIdentity = this._getItem(id)
    })

    batch.push({type: 'put', key: MY_IDENTITIES, value: myIdentities})
    batch.push({type: 'put', key: id, value: this._getItem(id)})

    // If pairing request was not verified what do we want to do
    db.batch(batch)
  },

  onProcessPairingResponse (pairingData, pairingRes) {
    // device 2 validate response
    if (tradleUtils.hexLink(pairingRes.prev) !== pairingData.identity)
      return Promise.reject(new Error('prev identity does not match expected'))

    let pubkeys = this._getItem(IDENTITY + '_' + pairingData.identity).pubkeys
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

    let me = this._getItem(PROFILE + '_' + pairingData.identity)
    return this.getDriver(me)
    .then(() =>  utils.addContactIdentity(meDriver, { identity: pairingRes.prev }))
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
    return models[modelName] && models[modelName].value
  },
  loadDB() {
    const self = this
    if (utils.isEmpty(models))
      this.addModels()

    // return this.loadStaticDbData(true)
    // .then(() => {
      return this.loadMyResources()
    // })
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
  // loadStaticDbData(saveInDB) {
  //   let batch = []
  //   let sData = [currencies, nationalities, countries]
  //   sData.forEach((arr) => {
  //     arr.forEach((r) => {
  //       this.loadStaticItem(r, saveInDB, batch)
  //     })
  //   })
  //   return batch.length ? db.batch(batch) : Q()
  // },
  loadStaticItem(r, saveInDB, batch) {
    if (!r[ROOT_HASH])
      r[ROOT_HASH] = sha(r)

    r[CUR_HASH] = r[ROOT_HASH]
    let type = r[TYPE]
    let enumList = enums[type]
    if (!enumList) {
      enumList = []
      enums[type] = enumList
    }

    if (enumList.filter((e) => e[ROOT_HASH] === r[ROOT_HASH]).length)
      return
    enumList.push(r)
    let id = utils.getId(r)
    if (saveInDB)
      batch.push({type: 'put', key: id, value: r})
  },

  loadModels() {
    var batch = [];


    // voc.forEach(function(m) {
    //   if (!m[ROOT_HASH]) {
    //     m[ROOT_HASH] = sha(m);
    //     self.addNameAndTitleProps(m)
    //   }

    //    batch.push({type: 'put', key: m.id, value: m});
    // });

    for (var m in models)
      batch.push({type: 'put', key: m, value: models[m].value});

    this.setBusyWith('loadingModels')

    // return Promise.resolve()
    return db.batch(batch)
          .then(() => {
            this.setBusyWith('loadingResources')
            return this.loadMyResources();
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
    debug('transition start')
    this._transitioning = true
    if (ENV.pauseOnTransition) {
      if (meDriver) meDriver.pause(2000)
    }

    // clearTimeout(this._transitionTimeout)
    // this._transitionTimeout = setTimeout(() => {
    //   this.onEndTransition()
    // }, 2000)
  },
  onEndTransition() {
    debug('transition end')
    // clearTimeout(this._transitionTimeout)
    // if (!this._transitioning) return

    this._transitioning = false
    if (ENV.pauseOnTransition) {
      if (meDriver && me && me.isAuthenticated) {
        meDriver.resume()
      }
    }

    if (this._transitionCallbacks) {
      // defensive copy
      var cbs = this._transitionCallbacks.slice()
      this._transitionCallbacks.length = 0
      cbs.forEach((fn) => fn())
    }
  },
  async onIdle() {
    if (utils.isWeb() || !this._transitioning) return

    debug('deferring job till transition finishes')
    if (!this._transitionCallbacks) {
      this._transitionCallbacks = []
    }

    const start = Date.now()
    const waitForTransitionToEnd = new Promise(resolve => {
      this._transitionCallbacks.push(resolve)
    })

    await Q.race([
      waitForTransitionToEnd,
      // after 2 seconds, give up waiting
      utils.promiseDelay(2000)
    ])

    const delay = Date.now() - start
    debug(`running deferred job (delayed ${delay})`)
  },
  buildRef(resource) {
    if (!resource[TYPE] && resource.id)
      return resource
    let m = this.getModel(resource[TYPE])
    // let isForm = m.subClassOf === FORM
    // let id = utils.getId(resource)
    // if (isForm)
    //   id += '_' + resource[CUR_HASH]
    let ref = {
      id: utils.getId(resource),
      title: resource.id ? resource.title : utils.getDisplayName(resource)
    }
    if (resource.time)
      ref.time = resource.time
    return ref
  },
  _setItem(key, value) {
    list[key] = { key, value }
  },
  _getItem(r) {
    if (typeof r === 'string')
      return list[r] ? list[r].value : null
    else if (r.value)
      return r.value
    else {
      let rr = list[utils.getId(r)]
      return rr ? rr.value : null
    }
  },
  _mergeItem(key, value) {
    const current = list[key] || {}
    list[key] = { key, value: { ...current.value, ...value } }
  },
  onViewChat(msg) {
    // let to = this._getItem(PROFILE + '_' + msg.to[ROOT_HASH])
    // let chat = to.organization ? this._getItem(to.organization) : to
    // this.trigger({action: 'showChat', to: to})
  },
  // onGetDocumentsFor(requestedDocumentType) {
  //   if (requestedDocumentType !== 'tradle.PersonalInfo')
  //     return
  //   let m = this.getModel(requestedDocumentType)
  //   let evidentiaryDocTypes = m.evidentiaryDocuments
  //   let docTypeToDocs = {}
  //   evidentiaryDocTypes.forEach((d) => {
  //     docTypeToDocs[d] = this.searchMessages(d)
  //   })
  //   this.trigger({action: 'documentsFor', documentType: requestedDocumentType, documents: docTypeToDocs})
  // }
  onShowModal(modal) {
    this.trigger({ action: 'showModal', modal })
  },
  onHideModal() {
    this.trigger({ action: 'hideModal' })
  }
})
// );

module.exports = Store;

function getProviderUrl (provider) {
  return provider.url
  // return provider.id ? utils.joinURL(provider.url, provider.id) : provider.url
}

function forEachSource (sources, fn) {
  sources.forEach(source => {
    fn(source)
    if (source.sources) {
      forEachSource(source.sources, fn)
    }
  })
}

async function lookupSourceAuthors (meDriver, sources) {
  const promises = []
  const sourceToAuthor = new Map()
  forEachSource(sources, source => {
    const promise = Q.ninvoke(tradleUtils, 'lookupAuthor', meDriver, {
      object: source,
      verify: true
    })
    .then(author => sourceToAuthor.set(source, author))
    // .catch(err => {
    //   debugger
    // })
    promises.push(promise)
  })

  await Q.allSettled(promises)
  return sourceToAuthor
}

function fixOldSettings (settings) {
  if (!(settings && settings.hashToUrl)) return

  // previously there was 1 websocket connection per provider
  // now it's 1 per url, so endpoint urls no longer contain provider ids

  const { hashToUrl } = settings
  for (var hash in hashToUrl) {
    let url = hashToUrl[hash]
    let lastSlashIdx = url.lastIndexOf('/')
    if (lastSlashIdx > 8) {
      hashToUrl[hash] = url.slice(0, lastSlashIdx)
    }
  }
}

function willShowProgressBar ({ length }) {
  return length >= MIN_SIZE_FOR_PROGRESS_BAR
}

// function midpoint (a, b) {
//   return (a + b) / 2
// }

  // searchFormsToShare(params) { //   var modelName = params.modelName;
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
  //     if (r._sharedWith  &&  fromId) {
  //       var sharedWith = r._sharedWith.filter(function(r) {
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
  //     if (r._sharedWith  &&  fromId  &&  !isSharedWith)
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
  //         let im = this.getModel(ip.ref)
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
  //             title: utils.getDisplayName(val, this.getModel(obj[TYPE]).value.properties),
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
  // //   let props = this.getModel(val[TYPE]).value.properties
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
        iMeta = this.getModel(key.split('_')[0]).value
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
      if (r._sharedWith  &&  toOrgId) {
        var sharedWith = r._sharedWith.filter(function(r) {
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
          //     // let sharedWithThisOrg = r._sharedWith.filter((s) => {
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

      if (r._sharedWith  &&  toOrgId  &&  !isSharedWith)
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
        iMeta = this.getModel(key.split('_')[0]).value
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
      if (r._sharedWith  &&  toOrgId) {
        var sharedWith = r._sharedWith.filter(function(r) {
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

      if (r._sharedWith  &&  toOrgId  &&  !isSharedWith)
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
  packResult(result) {
    let foundResources = {}
    result.forEach((fr) => {
      foundResources[utils.getId(fr.value)] = fr
    })
    return foundResources
  },
  // Checks if the  version of the resource is the latest
//   isNewerVersion(r, shareableResources) {
//     let arr = shareableResources[r[TYPE]]
//     for (let i=0; i<arr.length; i++) {
//       let rr = arr[i].document
//       if (r[ROOT_HASH] === rr[ROOT_HASH]) {
// // Alert.alert('rtime = ' + r.time + '; rrtime = ' + rr.time)
//         if (r.time < rr.time)
//           return false
//         else
//           arr.splice(i, 1)
//       }
//     }
//     return true
//   },

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

*/
/*
  initChats() {
    let meId = utils.getId(me)
    let meOrgId = me.organization ? utils.getId(me.organization) : null

    for (var p in list) {
      let r = this._getItem(p)
      if (r._context) {
        let c = this._getItem(r._context)
        // context could be empty if ForgetMe was requested for the provider where form was originally created
        if (c  &&  c._readOnly) {
          this.addMessagesToChat(utils.getId(r._context), r, true)
          continue
        }
      }

      let m = this._getItem(this.getModel(r[TYPE]))
      if (!m.interfaces  ||  m.interfaces.indexOf(MESSAGE) === -1)
        continue

      let addedToProviders = []
      if (r._sharedWith) {
        if (m.id === VERIFICATION)
          r._sharedWith.forEach((shareInfo) => {
            // if (shareInfo.bankRepresentative === meId)
            //   this.addMessagesToChat(utils.getId(r.to), r, true, shareInfo.timeShared)
            // else  {
            let rep = this._getItem(shareInfo.bankRepresentative)
            let orgId = utils.getId(rep.organization)
            if (meOrgId !== orgId) {
              this.addMessagesToChat(orgId, r, true, shareInfo.timeShared)
              addedToProviders.push(orgId)
            }
            // }
          })
      }
      if (m.id === VERIFICATION  &&  meId === utils.getId(r.from))
        this.addMessagesToChat(utils.getId(r.to), r, true)
      else {
        let fromId = utils.getId(r.from)
        let rep = this._getItem(meId === fromId ? utils.getId(r.to) : fromId)
        let orgId = rep.organization ? utils.getId(rep.organization) : utils.getId(rep)
        if (addedToProviders.indexOf(orgId) === -1)
          this.addMessagesToChat(orgId, r, true)
      }
    }
    for (let id in chatMessages) {
      var arr = chatMessages[id]
      arr.sort((a, b) => a.time - b.time)
      chatMessages[id] = this.filterChatMessages(arr, id)
    }
  },
  // Filtered result contains only messages that get displayed
  filterChatMessages(messages, orgId, lastId) {
    let meId = utils.getId(me)
    let productToForms = {}
    let productApp = {}
    let removeMsg = []
    // Compact all FormRequests that were fulfilled
    for (let i=messages.length - 1; i>=0; i--) {
      let r = this._getItem(messages[i].id)
      if (r[TYPE] === FORM_REQUEST  &&  !r.document) {// && r.documentCreated)
      // delete list[id]
        let forms = productToForms[r.product]
        if (!forms)
          productToForms[r.product] = {}
        let formIdx = productToForms[r.product][r.form]
        if (typeof formIdx !== 'undefined')
          removeMsg.push(formIdx)
          // messages.splice(formIdx, 1)

        productToForms[r.product][r.form] = i
      }
      if (r[TYPE] === PRODUCT_APPLICATION) {
        let productIdx = productApp[r.product]
        if (productIdx)
          removeMsg.push(productIdx)
          // messages.splice(productIdx, 1)
        // else
          productApp[r.product] = i
      }
    }
    if (removeMsg.length) {
      removeMsg.sort((i1, i2) => {return i2 - i1})
      for (let i=0; i<removeMsg.length; i++)
        messages.splice(removeMsg[i], 1)
    }
    // Compact all SelfIntroduction
    messages = messages.filter((rr, i) => {
      let r = this._getItem(rr.id)
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
      let r = this._getItem(rr.id)

      // Check if there was request for the next form after multy-entry form
      let fromId = utils.getId(r.from)

      if (!me.isEmployee  &&  fromId !== meId  &&  list[fromId]) {
        let rFrom = this._getItem(fromId)
        if (!rFrom.bot) {
          let photos = rFrom.photos
          if (photos)
            r.from.photo = photos[0]
          else
            r.from.photo = employee
        }
      }
      let m = this.getModel(r[TYPE]).value
      // r.from.photos = list[utils.getId(r.from)].value.photos;
      // var to = list[utils.getId(r.to)]
      // if (!to) console.log(r.to)
      // r.to.photos = to  &&  to.value.photos;
      if (m.subClassOf === FORM) {
        // set organization and photos for items properties for better displaying
        let form = this._getItem(utils.getId(r.to))
        if (orgId  &&  r._sharedWith  &&  r._sharedWith.length > 1) {
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
              let irRes = this._getItem(utils.getId(ir))
              // HACK - bad forgetMe
              let itemPhotos = irRes  && irRes.photos
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
*/
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
/*
  onAddVerification(r, notOneClickVerification, dontSend) {
    var self = this;
    var batch = [];
    var key;
    var fromId = utils.getId(r.from);
    var from = this._getItem(fromId)
    var toId = utils.getId(r.to);
    var to = this._getItem(toId)

    r[NONCE] = r[NONCE]  ||  this.getNonce()
    r.time = r.time || new Date().getTime();
    let document = this._getItem(utils.getId(r.document))
    if (document._context)
      r._context = document._context

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
    let isReadOnly
    if (r._context) {
      let c = this._getItem(utils.getId(r._context));
      isReadOnly = c  &&  c._readOnly
    }
    var newVerification
    return promise
    .then((data) => {
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
      if (!r._sharedWith) {
        r._sharedWith = []
        r._sharedWith.push(self.createSharedWith(utils.getId(r.from), r.time))
      }
      batch.push({type: 'put', key: key, value: r});
      newVerification = self.buildRef(r)
      let len = batch.length
      if (!isReadOnly)
        self.addLastMessage(r, batch)
      return db.batch(batch)
    })
    .then(() => {
      var rr = {};
      // extend(rr, from);
      // rr.verifiedByMe = r;
      self._setItem(key, r)
      if (isReadOnly)
        self.addMessagesToChat(utils.getId(r._context), r)
      if (utils.getId(from) === utils.getId(me))
        self.addMessagesToChat(utils.getId(r.to), r)
      else
        self.addMessagesToChat(from.organization ? utils.getId(from.organization) : fromId, r)

      if (notOneClickVerification)
        self.trigger({action: 'addItem', resource: r});
      else
        self.trigger({action: 'addVerification', resource: r});

      var verificationRequestId = utils.getId(r.document);
      var verificationRequest = self._getItem(verificationRequestId)
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
      // if (!verificationRequest._sharedWith)
      //   verificationRequest._sharedWith = []
      // verificationRequest._sharedWith.push(fromId)
      return db.put(verificationRequestId, verificationRequest);
    })
    .then((data) => {
      var d = data
    })
    .catch((err) => {
      debugger
      err = err
    })
  },
  // packMessage(r, toChain) {
    // var sendParams = {
    //   object: toChain
    // }
    // let to = this._getItem(utils.getId(r.to))
    // let provider, hash
    // if (to[ROOT_HASH] === me[ROOT_HASH]) {
    //   provider = this._getItem(r.from)
    //   hash = provider[ROOT_HASH]
    // }
    // else
    //   provider = to
    // hash = provider[ROOT_HASH]

    // // if (!hash)
    // //   hash = provider[ROOT_HASH]

    // var isEmployee
    // if (me.organization) {
    //   isEmployee = utils.isEmployee(to)
    //   // See if the sender is in a process of verifying some form in shared context chat
    //   if (!isEmployee  &&  r._context)
    //     isEmployee = utils.isReadOnlyChat(this._getItem(r._context))
    // }
    // // if (me.isEmployee)
    // //   isEmployee = (!to.organization ||  utils.getId(to.organization) === utils.getId(me.organization))

    // // let isEmployee = me.isEmployee && (!r.to.organization || utils.getId(r.to.organization) === utils.getId(me.organization))
    // if (isEmployee) {
    //   let arr
    //   if (SERVICE_PROVIDERS)
    //     arr = SERVICE_PROVIDERS.filter((sp) => {
    //       let reps = this.getRepresentatives(sp.org)
    //       let talkingToBot = reps.forEach((r) => {
    //         return r[ROOT_HASH] === hash ? true : false
    //       })
    //       return talkingToBot  &&  talkingToBot.length ? true : false
    //     })
    //   else  {
    //     if (!to.bot)
    //       arr = [to]
    //   }
    //   if (!arr  ||  !arr.length) {
    //     var toRootHash = hash

    //     sendParams.other = {
    //       forward: toRootHash
    //     }
    //     let rep = this.getRepresentative(utils.getId(me.organization))

    //     sendParams.to = { permalink: rep[ROOT_HASH] }
    //   }
    // }
    // if (r._context) {
    //   if (!sendParams.other)
    //     sendParams.other = {}
    //   let cId = utils.getId(r._context)
    //   sendParams.other.context = cId.split('_')[1]
    //   if (r[TYPE] !== PRODUCT_APPLICATION) {
    //     let c = this._getItem(cId)
    //     // will be null for PRODUCT_APPLICATION itself
    //     if (c) {
    //       c.lastMessageTime = new Date().getTime()
    //       c.formsCount = c.formsCount ? ++c.formsCount : 1
    //       db.put(cId, c)
    //     }
    //   }
    // }
    // if (!sendParams.to) {
    //   var toId = IDENTITY + '_' + hash
    //   sendParams.to = { permalink: hash }
    // }
    // return sendParams
  // },

  onGetAllPartials1() {
    let list = this.searchNotMessages({modelName: PARTIAL})
    if (!list  ||  !list.length)
      return

    let providers = {}
    let ch = {}
    // let allResources = {}
    list.forEach((r) => {
      let pId = utils.getId(r.provider)
      let stats = providers[pId]
      if (!stats) {
        stats = {
          openApps: {},
          completedApps: {},
          applications: [],
          formRequests: [],
          forms: [],
          verifications: [],
          formErrors: [],
          myProducts: [],
          provider: r.provider
        }
        providers[pId] = stats
      }

      let l = r.leaves
      let t = r.leaves.filter((prop) => prop.key === TYPE)[0].value

      // allResources[r.resource.id] = r
      // if (ch[r.from.id])
      //   ch[r.from.id] = {}

      owners[r.from.id][r.resource.id] = r

      switch (t) {
      case FORM_REQUEST:
        stats.formRequests.push(r)
        break
      case FORM_ERROR:
        stats.formErrors.push(r)
        break
      case VERIFICATION:
        stats.verifications.push(r)
        break
      case PRODUCT_APPLICATION:
        let product = l.filter((prop) => prop.key === 'product')[0].value
        if (product === 'tradle.CoverholderApproval')
        stats.applications.push(r)
        break
      default:
        if (this.getModel(t).value.subClassOf === MY_PRODUCT)
          stats.myProducts.push(r)
        else
          stats.forms.push(r)
      }
    })
    for (let p in providers) {
      let stats = providers[p]
      let apps = stats.applications
      apps.forEach((a) => {
        let product = a.leaves.filter((prop) => prop.key === 'product')[0].value
        let forms = this.getModel(product).value.forms
        let ch = a.from.id
        let uniqueVerifications = {}
        stats.verifications.forEach((v) => {
          let doc = v.leaves.filter((prop) => prop.key === 'document')[0].value.id
          // if (allResources[doc].from.id !== ch)
          //   return
          if (forms.indexOf(doc)) {
            if (!uniqueVerifications[doc])
              uniqueVerifications[doc] = v
          }
        })
        if (Object.keys(uniqueVerifications).length === forms.length) {
          if (!stats.completedApps[product])
            stats.completedApps[product] = 0
          stats.completedApps[product]++
        }
        else {
          if (!stats.openApps[product])
            stats.openApps[product] = 1
          else
            stats.openApps[product]++
        }
      })
    }

    // let stats = []
    // for (let p in providers) {
    //   let r = providers[p].provider
    //   stats.push[{provider: r, open: r.open, completed: r.completed}]
    // }
    this.trigger({action: 'allPartials', stats: Object.values(providers)})
  },
  onGetAllPartials1(listOnly) {
    let list = this.searchNotMessages({modelName: PARTIAL})
    if (!list  ||  !list.length)
      return

    let providers = {}
    let owners = {}
    let allResources = {}
    list.forEach((r) => {
      let pId = utils.getId(r.provider)
      let stats = providers[pId]
      if (!stats) {
        stats = {
          openApps: {},
          completedApps: {},
          applications: [],
          formRequests: [],
          forms: [],
          formCorrections: [],
          verifications: [],
          formErrors: [],
          myProducts: [],
          provider: r.provider
        }
        providers[pId] = stats
      }
      let ownerId = r.from.id
      if (!owners[pId])
        owners[pId] = {}
      let applicantStats = owners[pId][ownerId]
      if (!applicantStats) {
        applicantStats = {
          owner: r.from,
          openApps: {},
          completedApps: {},
          applications: [],
          formRequests: [],
          forms: [],
          formCorrections: [],
          verifications: [],
          formErrors: [],
          myProducts: [],
          provider: r.provider
        }
        owners[pId][ownerId] = applicantStats
      }

      let l = r.leaves
      let t = r.leaves.filter((prop) => prop.key === TYPE)[0].value

      allResources[r.resource.id] = r

      // if (!owners[pId])
      //   owners[pId] = {}
      // if (!owners[pId][ownerId])
      //   owners[pId][ownerId] = {}
      // owners[pId][ownerId][r.resource.id] = r

      // if (ch[r.from.id])
      //   ch[r.from.id] = {}

      // ch[r.from.id][r.resource.id] = r

      switch (t) {
      case FORM_REQUEST:
        stats.formRequests.push(r)
        applicantStats.formRequests.push(r)
        break
      case FORM_ERROR:
        stats.formErrors.push(r)
        applicantStats.formErrors.push(r)
        break
      case VERIFICATION:
        stats.verifications.push(r)
        // applicantStats.verifications.push(r)
        break
      case PRODUCT_APPLICATION:
        let product = l.filter((prop) => prop.key === 'product')[0].value
        if (product === 'tradle.CoverholderApproval') {
          stats.applications.push({productType: product, product: r})
          applicantStats.applications.push({productType: product, product: r})
          // stats.applications.push(r)
          // applicantStats.applications.push(r)
        }
        break
      default:
        if (this.getModel(t).value.subClassOf === MY_PRODUCT) {
          stats.myProducts.push(r)
          applicantStats.myProducts.push(r)
        }
        else {
          let id = r.resource.id.split('_')
          if (id.length === 2  ||  id[1] === id[2]) {
            stats.forms.push(r)
            applicantStats.forms.push(r)
          }
          else {
            stats.formCorrections.push(r)
            applicantStats.formCorrections.push(r)
          }
        }
      }
    })

    for (let p in providers) {
      providers[p].verifications.forEach((v) => {
        let docId = v.leaves.filter((prop) => prop.key === 'document')[0].value.id
        // HACK till modified forms paritals fixed
        if (allResources[docId]) {
          let docOwner = allResources[docId].from.id
          owners[p][docOwner].verifications.push(v)
        }
      })
    }

    for (let p in owners) {
      let o = owners[p]
      let pruned = {}
      for (let r in o) {
        if (o[r].applications.length)
          pruned[r] = o[r]
      }
      owners[p] = pruned
    }

    for (let p in providers) {
      let stats = providers[p]
      let pId = stats.provider.id
      let apps = stats.applications
      apps.forEach((a) => {
        // let product = a.product.leaves.filter((prop) => prop.key === 'product')[0].value
        let product = a.productType
        let forms = this.getModel(product).value.forms
        let ownerId = a.product.from.id
        let uniqueVerifications = {}
        let verifications = owners[pId][ownerId].verifications
        verifications.forEach((v) => {
          let doc = v.leaves.filter((prop) => prop.key === 'document')[0].value.id
          let docType = doc.split('_')[0]
          // if (!owners[pId][ownerId].forms)
          //   return
          // if (!allResources[doc]  ||  allResources[doc].from.id !== ownerId)
          //   return
          if (forms.indexOf(docType) !== -1) {
            if (!uniqueVerifications[docType])
              uniqueVerifications[docType] = v
          }
        })
        if (Object.keys(uniqueVerifications).length === forms.length) {
          verifications.sort((a, b) => a.time - b.time)

          owners[pId][ownerId].completedApps[product] = verifications[verifications.length - 1].time
          if (!stats.completedApps[product])
            stats.completedApps[product] = 1
          else
            stats.completedApps[product]++
        }
        else {
          if (!stats.openApps[product])
            stats.openApps[product] = 1
          else
            stats.openApps[product]++
        }
      })
    }

    // let stats = []
    // for (let p in providers) {
    //   let r = providers[p].provider
    //   stats.push[{provider: r, open: r.open, completed: r.completed}]
    // }
    this.trigger({action: 'allPartials', list: list, stats: Object.values(providers), owners: owners})
  },

    // })
//       function handleMessage2 (noTrigger, returnVal) {
//         // TODO: fix hack
//         // hack: we don't know root hash yet, use a fake
//         if (returnVal.documentCreated)  {
//           // when all the multientry forms are filled out and next form is requested
//           // do not show the last form request for the multientry form it is confusing for the user
//           if (doneWithMultiEntry) {
//             let ptype = returnVal[TYPE] === FORM_REQUEST && returnVal.product
//             if (ptype) {
//               let multiEntryForms = this.getModel(ptype).value.multiEntryForms
//               if (multiEntryForms  &&  multiEntryForms.indexOf(returnVal.form) !== -1) {
//                 let rid = returnVal.from.organization.id
//                 self.deleteMessageFromChat(rid, returnVal)
//                 let id = utils.getId(returnVal)
//                 delete list[id]
//                 db.del(id)
//                 var params = {action: 'addItem', resource: returnVal}
//                 self.trigger(params);
//                 return
//               }
//             }
//           }
//           var params = {action: 'addItem', resource: returnVal}
//           // return self.disableOtherFormRequestsLikeThis(returnVal)
//           // .then(() => {
//             // don't save until the real resource is created
//           list[utils.getId(returnVal)].value = returnVal
//           self.trigger(params);
//           return self.onIdle()
//           .then(() => {
//             save(returnVal)
//           })
//           .catch(function(err) {
//             debugger
//           })
//           // })
//         }
//         // Trigger painting before send. for that set ROOT_HASH to some temporary value like NONCE
//         // and reset it after the real root hash will be known
//         let isNew = returnVal[ROOT_HASH] == null
//         let isForm = self.getModel(returnVal[TYPE]).value.subClassOf === FORM
//         if (isNew)
//           returnVal[ROOT_HASH] = returnVal[NONCE]
//         else {
//           if (isForm) {
//             let formId = utils.getId(returnVal)
//             let prevRes = self._getItem(formId)
//             if (utils.compare(returnVal, prevRes)) {
//               self.trigger({action: 'noChanges'})
//               return
//             }
//             returnVal[PREV_HASH] = returnVal[CUR_HASH]
//             returnVal[CUR_HASH] = returnVal[NONCE]
//           }
//           if (returnVal.txId)
//             delete returnVal.txId
//         }

//         var returnValKey = utils.getId(returnVal)

//         self._setItem(returnValKey, returnVal)

//         let org = self._getItem(utils.getId(returnVal.to)).organization
//         let orgId = utils.getId(org)
//         self.addMessagesToChat(orgId, returnVal)

//         var params;

//         var sendStatus = (self.isConnected) ? SENDING : QUEUED
//         if (isGuestSessionProof) {
//           org = self._getItem(utils.getId(org))
//           params = {action: 'getForms', to: org}
//         }
//         else {
//           returnVal._sendStatus = sendStatus
//           // if (isNew)
//           self.addVisualProps(returnVal)
//           params = {
//             action: 'addItem',
//             resource: returnVal
//           }
//         }

//         var m = self.getModel(returnVal[TYPE]).value
// //         var to = returnVal.to
// //         Object.defineProperty(returnVal, 'to', {
// //           get: function () {
// //             return to
// //           },
// //           set: function () {
// //             debugger
// //             console.log('yay!')
// //           }
// //         })

// //         var organization = to.organization
// //         Object.defineProperty(to, 'organization', {
// //           get: function () {
// //             return organization
// //           },
// //           set: function () {
// //             debugger
// //             console.log('yay!')
// //           }
// //         })


//         try {
//           if (!noTrigger)
//             self.trigger(params);
//         } catch (err) {
//           debugger
//         }

//         return self.onIdle()
//         .then(function () {
//           let rId = utils.getId(returnVal.to)
//           let to = self._getItem(rId)

//           var toChain = {}
//           if (!isNew) {
//             // returnVal[PREV_HASH] = returnVal[CUR_HASH] || returnVal[ROOT_HASH]
//             toChain[PREV_HASH] = returnVal[PREV_HASH]
//           }

//           let exclude = ['to', 'from', 'verifications', CUR_HASH, '_sharedWith', '_sendStatus', '_context', '_online', 'idOld']
//           if (isNew)
//             exclude.push(ROOT_HASH)
//           extend(toChain, returnVal)
//           for (let p of exclude)
//             delete toChain[p]

//           toChain.time = returnVal.time

//           var key = IDENTITY + '_' + to[ROOT_HASH]

//           let sendParams = self.packMessage(toChain, returnVal.from, returnVal.to, returnVal._context)
//           return meDriver.signAndSend(sendParams)
//         })
//         .then(function (result) {
//           // TODO: fix hack
//           // we now have a real root hash,
//           // scrap the placeholder
//           // if (isNew ||  !shareWith)
//           if (isNew  ||  isForm) {
//             delete list[returnValKey]
//             self.deleteMessageFromChat(orgId, returnVal)

//           }
//           if (readOnlyBacklinks.length) {
//             readOnlyBacklinks.forEach((prop) => {
//               let topR = returnVal[prop.name]
//               if (topR) {
//                 if (!topR[prop.backlink])
//                   topR[prop.backlink] = []
//                 topR[prop.backlink].push(self.buildRef(returnVal))
//               }
//             })
//           }

//           returnVal[CUR_HASH] = result.object.link
//           returnVal[ROOT_HASH] = result.object.permalink
//           // var sendStatus = (self.isConnected) ? SENDING : QUEUED
//           // returnVal._sendStatus = sendStatus

// //           let org = list[utils.getId(returnVal.to)].value.organization
// //           self.addMessagesToChat(utils.getId(org), returnVal)
//           delete returnVal._sharedWith
//           delete returnVal.verifications
//           // if (shareWith) {
//           //   let oldValue = list[returnValKey]
//           //   for (let p in shareWith) {
//           //     if (shareWith[p])
//           //       this.onShare(returnVal, list[p].value)
//           //   }
//           // }
//           return save(returnVal, true)
//         })
//         .then(() => {
//           let rId = utils.getId(returnVal.to)
//           let to = self._getItem(rId)

//           if (!isNew  ||  self.getModel(returnVal[TYPE]).value.subClassOf !== FORM)
//             return
//           let allFormRequests = self.searchMessages({modelName: FORM_REQUEST, to: to})
//           let formRequests = allFormRequests  &&  allFormRequests.filter((r) => {
//             if (r.document === returnVal[NONCE])
//               return true
//           })
//           if (formRequests  &&  formRequests.length) {
//             let req = formRequests[0]
//             req.document = utils.getId(returnVal)
//             // returnVal = req
//             save(req, true)
//           }
//         })
//       }
//       function save (returnVal, noTrigger) {
//         return self._putResourceInDB({
//           type: returnVal[TYPE],
//           resource: returnVal,
//           roothash: returnVal[ROOT_HASH],
//           isRegistration: isRegistration,
//           noTrigger: noTrigger
//         })
//       }
*/
