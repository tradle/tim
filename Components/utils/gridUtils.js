import Actions from '../../Actions/Actions'
import { translate, isEnum, getId, getMe, getModel } from '../../utils/utils'

// import { ROOT_HASH } from '@tradle/constants'

const BOOKMARK = 'tradle.Bookmark'
const APPLICATION = 'tradle.Application'

var gridUtils = {
  async loadMoreContentAsync({state, props, direction, limit}) {
    let { list=[], sortProperty, endCursor, prevEndCursor,
          refreshing, allLoaded, order } = state
    let { modelName, search, resource, bookmark, isBacklink, prop } = props

    if (refreshing)
      return
    if (allLoaded)
      return
    if (direction !== 'down')
      return
    if (isBacklink  &&  prop  &&  resource[prop.name].length < limit) {
      state.allLoaded = true
      return
    }
    if (endCursor === prevEndCursor  &&  !isEnum(modelName))
      return
    state.refreshing = true
console.log('loadMoreContentAsync: filterResource', resource)

    Actions.list({
      modelName,
      sortProperty,
      asc: order  &&  order[sortProperty],
      limit,
      direction,
      search,
      endCursor,
      to: modelName === BOOKMARK ? getMe() : null,
      filterResource: (search  &&  resource) || resource,
      bookmark,
      // from: list.length,
      lastId: getId(list[list.length - 1])
    })
  },
  showScoreDetails({navigator, bankStyle, application, applicantName}) {
    let m = getModel(APPLICATION)
    navigator.push({
      componentName: 'ScoreDetails',
      backButtonTitle: 'Back',
      title: `${application.applicantName ||  applicantName}  →  ${translate(m.properties.score, m)} ${application.score}`,
      passProps: {
        bankStyle,
        resource: application
      }
    })
  },
  // getNextKey(resource) {
  //   return resource[ROOT_HASH] + '_' + cnt++
  // },
  onScrollEvent(event) {
    let currentOffset = event.nativeEvent.contentOffset.y
    let contentHeight = event.nativeEvent.contentSize.height
    let delta = currentOffset - (this.offset || 0)
    return {
      direction: delta > 0 || Math.abs(delta) < 3 ? 'down' : 'up',
      offset: currentOffset
    }
  }
}
module.exports = gridUtils