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
  get CheckView() {
    return require('./CheckView')
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
  get ApplicationTree() {
    return require('./ApplicationTree')
  },
  get ScoreDetails() {
    return require('./ScoreDetails')
  },
  get SignatureView() {
    return require('./SignatureView')
  },
  get ArticleView() {
    return require('./ArticleView')
  },
  get PdfView() {
    return require('./PdfView')
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
  get ReviewPrefilledItemsList() {
    return require('./ReviewPrefilledItemsList')
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
