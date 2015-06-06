'use strict';

var Reflux = require('reflux');

var Actions = Reflux.createActions([
  'addItem',        
  'addMessage',
  'getItem',
  'addNewIdentity',
  'reloadDB',
  'list',
  'start'
  // 'messageList',
  // 'getMe',
  // 'getDb',
]);

module.exports = Actions;