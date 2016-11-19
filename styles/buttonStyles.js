/*

  a bootstrap like style

*/
'use strict';

var ICON_BORDER_COLOR = '#D7E6ED';
var BACKGROUND_COLOR = /*'#2E3B4E';*/'#7AAAC3';
var ERROR_COLOR = '#a94442';
var HELP_COLOR = '#999999';
var BORDER_COLOR = '#cccccc';
var DISABLED_COLOR = '#777777';
var DISABLED_BACKGROUND_COLOR = '#eeeeee';
var FONT_SIZE = 14;
var FONT_SIZE_1 = 17;
var FONT_WEIGHT = '500';

var utils = require('../utils/utils')

var buttonStyles = Object.freeze({
  icon: {
    width: 30,
    height: 30,
  },
  row: {
    flexDirection: 'row',
  },
  container: {
    alignSelf: 'center',
    paddingHorizontal: 7,
    marginTop: 10,
  },
  buttons: {
    flexDirection: 'row',
    backgroundColor: '#F5FFED',
    borderBottomColor: '#a0a0a0',
    borderBottomWidth: 1,
    alignSelf: 'stretch'
  },
  text: {
    color: '#757575',
    paddingBottom: 10,
    fontSize: utils.getFontSize(FONT_SIZE),
    alignSelf: 'center',
  },
  msgText: {
    color: '#ffffff',
    paddingBottom: 10,
    fontSize: utils.getFontSize(FONT_SIZE),
    alignSelf: 'center',
  },

  row1: {
    flexDirection: 'row',
    alignSelf: 'center',
    position: 'absolute',
    left: 30,
    top: 5
  },
  icon1: {
    width: 25,
    height: 25,
    paddingTop: 2
  },
  container1: {
    flex: 1,
    paddingHorizontal: 10
  },
  buttonContent: {
    alignSelf: 'center',
    width: 150,
    height: 40,
    borderRadius: 10,
    backgroundColor: BACKGROUND_COLOR,
    opacity: 0.7,
    borderWidth: 1,
    borderColor: '#466690'
  },
  text1: {
    paddingTop: 3,
    color: '#ffffff',
    fontFamily: 'Avenir Next',
    fontSize: utils.getFontSize(FONT_SIZE_1)
  }
});

module.exports = buttonStyles;