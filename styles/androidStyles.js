'use strict';

import {StyleSheet, Platform} from 'react-native';
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
    marginTop: 19,
    fontSize: 17,
  },
  menuButtonNarrow: {
    marginTop: 5,
    paddingHorizontal: 5
  },
  menuButtonRegular: {
    marginTop: 5,
    paddingHorizontal: 5
  }
})
var menuIcon = {
  name: 'md-menu',
  color: 'red'
}
exports.MenuIconAndroid = menuIcon
