'use strict';

var Reflux = require('reflux');

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
  'endTransition'
  // 'messageList',
  // 'getMe',
  // 'getDb',
]);

module.exports = Actions;
