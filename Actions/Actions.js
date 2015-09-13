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
  'list',
  'messageList',
  'addModelFromUrl',
  'start',
  'addVerification'
  // 'messageList',
  // 'getMe',
  // 'getDb',
]);

module.exports = Actions;