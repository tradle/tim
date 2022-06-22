'use strict';

import { StyleSheet } from 'react-native';
import { dimensions } from '../utils/utils'

export default StyleSheet.create({
  container: {
    // backgroundColor: '#f7f7f7',
    marginTop: 64,
    flex: 1,
  },
  navBarText: {
    // marginTop: 3,
    fontSize: 17
  },
  navBarLeftButton: {
    paddingLeft: 20,
    paddingRight: 25,
    marginTop: 0
  },
  navBarRightButton: {
    paddingLeft: 25,
    paddingRight: 20,
    // marginTop: 5
  },
  touchIdText: {
    color: '#2E3B4E',
    fontSize: 18,
    marginTop: 10,
    marginLeft: 15,
    alignSelf: 'flex-start'
  },
  logo: {
    marginTop: 2
  },
  navBarMultiRowTitle: {
    flexDirection: 'column',
    marginTop: 0
  },
  navBarIcon: {
    width: 25,
    height: 25,
    // marginTop: 10
  },
  pageMenu: {
    // flex: 1,
    width: 300,
    borderRightWidth: 2,
    // height: '100%',
    backgroundColor: 'transparent',
    borderRightColor: '#eee'
  },
  pageLeftMenu: {
    flex: 1,
    height: '100%',
    backgroundColor: '#f7f7f7',
    borderRightWidth: 1,
    borderRightColor: '#ccc'
  },
  pageContentWithMenu: {
    flex: 1,
    // flex: 3,
    // width: 800,
    // paddingRight: 10,
    zIndex: 1000,
    // marginLeft: 20
  }
})

export function navBarTitleWidth(component) {
  return dimensions(component).width - 150
}

export {
  MenuIcon,
  footerButtonObject,
  homeButtonObject,
  treeButtonObject,
  menuButtonObject,
  conversationButtonObject
} from './platform.ios'

// Object.defineProperty(exports, 'MB', {
//   icon: 'md-more',
//   color: '#ffffff'
// })

// module.exports = require('./platform.ios.js')
