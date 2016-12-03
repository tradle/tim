'use strict';

var Reflux = require('reflux');
var debug = require('debug')('Actions')

var actionProps = {}
var asyncActions = [
  'addItem',
  'addMessage',
  'getItem',
  'getMe',
  'getTo',
  'getFrom',
  'getEmployeeInfo',
  'addNewIdentity',
  'removeIdentity',
  'showIdentityList',
  'changeIdentity',
  'reloadDB',
  'reloadModels',
  'list',
  'listSharedWith',
  'messageList',
  'productList',
  'addModelFromUrl',
  'start',
  'share',
  'addVerification',
  'startTransition',
  'endTransition',
  'talkToRepresentative',
  'saveTemporary',
  'getTemporary',
  'cleanup',
  'forgetMe',
  'updateMe',
  'scheduleUpdate',
  'genPairingData',
  'sendPairingRequest',
  'processPairingRequest',
  'processPairingResponse',
  'pairingRequestAccepted',
  'addApp',
  'getAllContexts',
  'getAllSharedContexts',
  'viewChat'
]

var syncActions = [
  'setAuthenticated',
  'downloadedCodeUpdate',
  'requestWipe'
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
