/*

  a bootstrap like style

*/
'use strict';

var ICON_BORDER_COLOR = '#D7E6ED';
var BACKGROUND_COLOR = '#7AAAC3';
var ERROR_COLOR = '#a94442';
var HELP_COLOR = '#999999';
var BORDER_COLOR = '#cccccc';
var DISABLED_COLOR = '#777777';
var DISABLED_BACKGROUND_COLOR = '#eeeeee';
var FONT_SIZE = 17;
var FONT_WEIGHT = '500';

var buttonStyles = Object.freeze({
  icon: {
    width: 25,
    height: 25,
    borderWidth: 2,
    borderColor: ICON_BORDER_COLOR,
    borderRadius: 12,
  },
  container: {
    flex: 1,
    position: 'absolute', 
    right: 10 
  },
  buttonContent: {
    padding: 10, 
    width: 150, 
    height: 40, 
    borderRadius: 10, 
    backgroundColor: BACKGROUND_COLOR, 
    opacity: 0.5, 
    borderWidth: 1, 
    borderColor: '#466690'
  },
  text: {
    color: '#ffffff', 
    marginLeft: 5,
    fontWeight: '800'
  }
});

module.exports = buttonStyles;