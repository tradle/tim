
import StyleSheet from '../StyleSheet'
import { circled } from './utils'
import { dimensions, isIphone10orMore } from '../utils/utils'

const isIphone10 = isIphone10orMore()

const footerButton = {
  ...circled(50),
  marginTop: -23,
  shadowOpacity: 1,
  shadowRadius: 5,
  shadowColor: '#afafaf',
}

export default StyleSheet.create({
  container: {
    marginTop: 64,
    flex: 1,
  },
  navBarRightIcon: {
    marginTop: isIphone10 ? -1 : 3
  },
  navBarSeparator: {
    height: isIphone10 ? 10 : 0
  },
  navBarMargin: {
    marginTop: isIphone10 ? 10 : 1,
  },
  navBarText: {
    marginTop: 10,
    fontSize: 17
  },
  navBarLeftButton: {
    paddingLeft: 10,
    paddingRight: 25,
    marginTop: isIphone10 ? 16 : 5
  },
  navBarRightButton: {
    paddingLeft: 25,
    paddingRight: 10,
    marginTop: isIphone10 ? 19 : 7
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
  },
  logo: {
    marginTop: 7
  },
  navBarMultiRowTitle: {
    flexDirection: 'column'
  },
  navBarIcon: {
    width: 25,
    height: 25,
  }
})
export const chatTextInputHeight = isIphone10 ? 60 : 45
export const menuButtonObject = {
  ...footerButton,
  backgroundColor: 'red'
}

export const conversationButtonObject = menuButtonObject
export const homeButtonObject = {
  ...footerButton,
  backgroundColor: '#fff'
}
export const treeButtonObject = {
  ...footerButton,
  backgroundColor: '#fff'
}

export const MenuIcon = {
  name: 'md-more',
  color: '#ffffff'
}

export function navBarTitleWidth(component) {
  return dimensions(component).width - 150
}
// Object.defineProperty(exports, 'MB', {
//   icon: 'md-more',
//   color: '#ffffff'
// })
