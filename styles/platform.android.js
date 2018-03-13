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

  navBarText: {
    marginTop: 15,
    fontSize: 17,
  },
  menuButtonNarrow: {
    marginTop: 2,
    paddingHorizontal: 5
  },
  menuButtonRegular: {
    marginTop: 2,
    paddingHorizontal: 5
  },
  conversationButton: {
    marginTop: 2,
    paddingHorizontal: 5
  },

  menuButton: {
    marginTop: 5,
    paddingHorizontal: 5
  },
  touchIdText: {
    color: '#2E3B4E',
    fontSize: 18,
    marginTop: 7,
    marginLeft: 15,
    alignSelf: 'flex-start'
  }
})
var menuIcon = {
  name: 'md-menu',
  color: 'red'
}
exports.MenuIcon = menuIcon
