/*

  a bootstrap like style

*/
import { Dimensions } from 'react-native'
import utils from '../utils/utils'
import appStyle from './appStyle.json'
import * as platformButtons from './platform'

const {
  menuButtonObject,
  conversationButtonObject,
  homeButtonObject={},
  treeButtonObject
} = platformButtons

var FONT_SIZE = 12;
var FONT_SIZE_1 = 17;

(function adjustFontSize () {
  var { width, height } = Dimensions.get('window')
  var width = Math.min(width, height)
  if (width < 350) {
    // iPhone 4, 5
    FONT_SIZE--
  }
})();

var buttonStyles = Object.freeze({
  icon: {
    width: 30,
    height: 30,
  },
  row: {
    flexDirection: 'row',
  },
  container: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    justifyContent: 'center',
    // paddingTop: 10,
  },
  buttons: {
    flexDirection: 'row',
    backgroundColor: appStyle.TAB_COLOR,// '#F5FFED',
    borderBottomColor: '#a0a0a0',
    borderBottomWidth: 1,
    // alignSelf: 'stretch'
  },
  buttonsNoBorder: {
    flexDirection: 'row',
    backgroundColor: appStyle.TAB_COLOR,// '#F5FFED',
    // alignSelf: 'stretch'
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
    backgroundColor: appStyle.BACKGROUND_COLOR,
    opacity: 0.7,
    borderWidth: 1,
    borderColor: '#466690'
  },
  text1: {
    paddingTop: 3,
    color: '#ffffff',
    fontFamily: 'Avenir Next',
    fontSize: utils.getFontSize(FONT_SIZE_1)
  },
  menuButton: menuButtonObject,
  conversationButton: conversationButtonObject,
  treeButton: treeButtonObject,
  homeButton: {
    ...homeButtonObject,
    opacity: 0.9
  }
});

module.exports = buttonStyles;
