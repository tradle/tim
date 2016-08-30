import utils from '../utils/utils'

module.exports = utils.isAndroid()
  ? require('./platform.android') : utils.isIOS()
  ? require('./platform.ios') : require('./platform.web')
