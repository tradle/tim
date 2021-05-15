
var Reflux = require('reflux');
var debug = require('debug')('Actions')

var actionProps = {}
var asyncActions = [
  'addApp',
  'addItem',
  'addChatItem',
  'addMessage',
  'addModelFromUrl',
  'addNewIdentity',
  'addVerification',
  'addAll',
  'applyForProduct',
  'approveApplication',

  'getItem',
  'getMe',
  // 'getTo',
  // 'getFrom',
  // 'getEmployeeInfo',
  'getTemporary',
  'getProductList',
  'getItemsToMatch',

  'refreshApplication',

  'removeIdentity',
  'showIdentityList',
  'changeIdentity',

  'reloadDB',

  'reloadModels',
  'getModels',
  'getRequestedProperties',

  'list',
  'listSharedWith',
  'messageList',
  'productList',
  'start',
  'share',
  'shareMany',
  'startTransition',
  'endTransition',
  // 'talkToRepresentative',
  'saveTemporary',
  'cleanup',
  'forgetMe',
  'updateMe',
  'scheduleUpdate',

  'genPairingData',
  'sendPairingRequest',
  'getMasterIdentity',
  'getRepresentative',

  'processPairingRequest',
  'processPairingResponse',
  'pairingRequestAccepted',

  'getAllContexts',
  'getAllSharedContexts',

  'getAllPartials',
  'hasPartials',
  'hasBookmarks',
  'getBookmarks',
  'viewChat',

  'exploreBacklink',
  'exploreForwardlink',
  'getDetails',
  'getProvider',
  'acceptTermsAndChat',
  'setPreferences',
  'getDocuments',
  'hasTestProviders',

  'listMultientry',

  'getIdentity',
  'openURL',
  'requestWipe',
  'verifyOrCorrect',
  'importData',
  'stepIndicatorPress',
  'showStepIndicator',
  'showAllShareables',
  'submitDraftApplication',
  'noPairing'
]

var syncActions = [
  'setAuthenticated',
  'downloadedCodeUpdate',
  'showModal',
  'hideModal',
  'setProviderStyle',
  'updateEnvironment'
]

asyncActions.forEach(name => actionProps[name] = {})
syncActions.forEach(name => {
  actionProps[name] = { sync: true }
})

var Actions = Reflux.createActions(actionProps)

Object.keys(Actions).forEach((name) => {
  var fn = Actions[name]
  Actions[name] = function () {
    debug('Actions.' + name)
    return fn.apply(this, arguments)
  }

  for (var p in fn) {
    Actions[name][p] = fn[p]
  }
})

module.exports = Actions;
