import utils, {
  translate
} from '../utils/utils'

import GridList from './GridList'
import constants from '@tradle/constants'

var { TYPE } = constants

var uiUtils = {
  showBookmarks(params) {
    let { resource, navigator, bankStyle, currency } = params
    // let model = utils.getModel(BOOKMARK)
    let btype = resource.bookmark[TYPE]
    let bm = utils.getModel(btype)
    navigator.push({
      id: 30,
      title: translate('searchSomething', translate(bm)),
      backButtonTitle: 'Back',
      component: GridList,
      passProps: {
        modelName: btype,
        bookmark: resource,
        resource: resource.bookmark,
        bankStyle: bankStyle,
        currency: currency,
        limit: 20,
        search: true
      },
    })
  },
}
module.exports = uiUtils
