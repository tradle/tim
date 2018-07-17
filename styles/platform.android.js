'use strict';

import StyleSheet from '../StyleSheet'
import {Platform} from 'react-native';
import {getFontSize} from '../utils/utils'

export default StyleSheet.create({
  container: {
    backgroundColor: '#f7f7f7',
    marginTop: 56,
    flex: 1,
  },
  // navBarText: {
  //   marginTop: 10,
  //   fontSize: 17
  // },
  navBarSeparator: {
  },
  navBarMargin: {
  },
  navBarText: {
    fontSize: 17,
    marginTop: 15,
  },
  navBarLeftButton: {
    paddingLeft: 10,
    // paddingRight: 25,
    marginTop: 5
  },
  navBarRightButton: {
    // paddingLeft: 25,
    paddingRight: 10,
    marginTop: 7
  },
  // menuButtonNarrow: {
  //   marginTop: 2,
  //   paddingHorizontal: 5
  // },
  // menuButtonRegular: {
  //   marginTop: 2,
  //   paddingHorizontal: 5
  // },
  // conversationButton: {
  //   marginTop: 2,
  //   paddingHorizontal: 5
  // },

  touchIdText: {
    color: '#2E3B4E',
    fontSize: 18,
    marginTop: 7,
    marginLeft: 15,
    alignSelf: 'flex-start'
  }
})

const menuIcon = {
  name: 'md-menu',
  color: 'red'
}

const footerButton = {
  marginTop: 5,
  paddingHorizontal: 5,
  backgroundColor: 'transparent',
  borderColor: 'transparent'
}

export const MenuIcon = menuIcon
export const menuButtonObject = footerButton
export const homeButtonObject = footerButton
export const conversationButtonObject = footerButton
