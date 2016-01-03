'use strict';

var Reflux = require('reflux');
var debug = require('debug')('Actions')

var Actions = Reflux.createActions([
  'addItem',
  'addMessage',
  'getItem',
  'getTo',
  'getFrom',
  'addNewIdentity',
  'removeIdentity',
  'showIdentityList',
  'changeIdentity',
  'reloadDB',
  'reloadModels',
  'list',
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
  'forgetMe'
]);

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
