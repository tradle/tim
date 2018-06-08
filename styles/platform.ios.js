'use strict';

import DeviceInfo from 'react-native-device-info'
import StyleSheet from '../StyleSheet'
import { circled } from './utils'

const deviceID = DeviceInfo.getDeviceId()
const isIphone10 = deviceID  &&  deviceID.indexOf('iPhone10') === 0

const footerButton = {
  ...circled(50),
  marginTop: -23,
  shadowOpacity: 1,
  shadowRadius: 5,
  shadowColor: '#afafaf',
}

export default StyleSheet.create({
  container: {
    // backgroundColor: '#f7f7f7',
    marginTop: isIphone10  &&  74  || 64,
    flex: 1,
  },
  navBarText: {
    marginTop: 10,
    fontSize: 17
  },
  deviceAdjustments: {
    marginTop: isIphone10 && 10 || 0
  },
  // navBar: {
  //   marginTop: 10,
  //   padding: 3
  // },
  touchIdText: {
    color: '#2E3B4E',
    fontSize: 18,
    marginTop: 10,
    marginLeft: 15,
    alignSelf: 'flex-start'
  }
})

export const menuButtonObject = {
  ...footerButton,
  backgroundColor: 'red'
}

export const conversationButtonObject = menuButtonObject
export const homeButtonObject = {
  ...footerButton,
  backgroundColor: '#fff'
}

export const MenuIcon = {
  name: 'md-more',
  color: '#ffffff'
}

// Object.defineProperty(exports, 'MB', {
//   icon: 'md-more',
//   color: '#ffffff'
// })
