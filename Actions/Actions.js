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
  'addModelFromUrl',
  'start',
  'share',
  'addVerification'
  // 'messageList',
  // 'getMe',
  // 'getDb',
]);

module.exports = Actions;