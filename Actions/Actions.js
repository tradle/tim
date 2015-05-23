'use strict';

var Reflux = require('reflux');

var Actions = Reflux.createActions([
  'addItem',        
  'addMessage',
  'removeItem',     
  'editItem',
  'reloadDB',
  'list'
]);

module.exports = Actions;