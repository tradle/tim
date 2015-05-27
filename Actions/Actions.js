'use strict';

var Reflux = require('reflux');

var Actions = Reflux.createActions([
  'addItem',        
  'addMessage',
  'reloadDB',
  'list',
  'start'
]);

module.exports = Actions;