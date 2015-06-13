'use strict';

var Reflux = require('reflux');

var Actions = Reflux.createActions([
  'addItem',        
  'addMessage',
  'getItem',
  'addNewIdentity',
  'removeIdentity',
  'showIdentityList',
  'changeIdentity',
  'reloadDB',
  'list',
  'addModelFromUrl',
  'start'
  // 'messageList',
  // 'getMe',
  // 'getDb',
]);

module.exports = Actions;