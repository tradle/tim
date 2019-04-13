// import ResourceList from './ResourceList'
// import ResourceView from './ResourceView'
// import MessageView from './MessageView'
// import MessageList from './MessageList'
// import NewResource from './NewResource'
// import NewItem from './NewItem'
// import ApplicationView from './ApplicationView'
// import ArticleView from './ArticleView'
// import QRCode from './QRCode'
// import QRCodeScanner from './QRCodeScanner'

// import VerifierChooser from './VerifierChooser'
// import ShareResourceList from './ShareResourceList'
// import EnumList from './EnumList'
// import GridList from './GridList'
// import GridItemsList from './GridItemsList'
// import TimHome from './TimHome'
// import MarkdownPropertyEdit from './MarkdownPropertyEdit'
// import SignatureView from './SignatureView'
// import TourPage from './TourPage'
// import SplashPage from './SplashPage'

// import PasswordCheck from './PasswordCheck'
// import LockScreen from './LockScreen'
// import TouchIDOptIn from './TouchIDOptIn'
// import RemediationItemsList from './RemediationItemsList'
// import IdentitiesList from './IdentitiesList'
// import SupervisoryViewPerProvider from './SupervisoryViewPerProvider'
// import SupervisoryView from './SupervisoryView'
// import StringChooser from './StringChooser'
// import ContextChooser from './ContextChooser'
// import CameraView from './CameraView'
// import PhotoCarousel from './PhotoCarousel'
// import Log from './Log'
// import MatchImages from './MatchImages'

module.exports = {
  get ResourceList() {
    return require('./ResourceList')
  },
  get ResourceView() {
    return require('./ResourceView')
  },
  get MessageView() {
    return require('./MessageView')
  },
  get MessageList() {
    return require('./MessageList')
  },
  get NewResource() {
    return require('./NewResource')
  },
  get NewItem() {
    return require('./NewItem')
  },
  get ApplicationView() {
    return require('./ApplicationView')
  },
  get ArticleView() {
    return require('./ArticleView')
  },
  get GridList() {
    return require('./GridList')
  },
  get GridItemsList() {
    return require('./GridItemsList')
  },
  get EnumList() {
    return require('./EnumList')
  },
  get QRCode() {
    return require('./QRCode')
  },
  get QRCodeScanner() {
    return require('./QRCodeScanner')
  },
  get MatchImages() {
    return require('./MatchImages')
  },
  get ContextChooser() {
    return require('./ContextChooser')
  },
  get StringChooser() {
    return require('./StringChooser')
  },
  get SupervisoryView() {
    return require('./SupervisoryView')
  },
  get SupervisoryViewPerProvider() {
    return require('./SupervisoryViewPerProvider')
  },
  get TourPage() {
    return require('./TourPage')
  },
  get SplashPage() {
    return require('./SplashPage')
  },
  get TouchIDOptIn() {
    return require('./TouchIDOptIn')
  },
  get PasswordCheck() {
    return require('./PasswordCheck')
  },
  get LockScreen() {
    return require('./LockScreen')
  },
  get RemediationItemsList() {
    return require('./RemediationItemsList')
  },
  get CameraView() {
    return require('./CameraView')
  },
  get PhotoCarousel() {
    return require('./PhotoCarousel')
  },
  get IdentitiesList() {
    return require('./IdentitiesList')
  },
  get Log() {
    return require('./Log')
  },
  get MarkdownPropertyEdit() {
    return require('./MarkdownPropertyEdit')
  },
  get ShareResourceList() {
    return require('./ShareResourceList')
  },
  get VerifierChooser() {
    return require('./VerifierChooser')
  },
  get TimHome() {
    return require('./TimHome')
  }
}

// module.exports = new Proxy(components, {
//   get(components, key) {
//     if (key.charAt(0) === '_')
//       return this
//     if (!(key in components)) {
//       throw new Error(`component not found: ${key}`)
//     }

//     return components[key]
//   },
// })
