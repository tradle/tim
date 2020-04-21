import { makeResponsive } from 'react-native-orient'
import React, { Component } from 'react'
import {
  ListView,
  TouchableOpacity,
  View,
  Platform
} from 'react-native'
import PropTypes from 'prop-types'
import Reflux from 'reflux'
import InfiniteScrollView from 'react-native-infinite-scroll-view'
import debounce from 'debounce'
import Icon from 'react-native-vector-icons/Ionicons'
import _ from 'lodash'
import reactMixin from 'react-mixin'

import constants from '@tradle/constants'
import { Text } from './Text'
import Actions from '../Actions/Actions'
import Store from '../Store/Store'
import ResourceMixin from './ResourceMixin'
import ApplicationTreeRow from './ApplicationTreeRow'
import ApplicationTreeHeader from './ApplicationTreeHeader'
import PageView from './PageView'
import { showLoading, getContentSeparator, getGridCols } from '../utils/uiUtils'
import { showScoreDetails, loadMoreContentAsync, onScrollEvent } from './utils/gridUtils'
import { translate, getModel, getDisplayName, makeModelTitle, getMe, getEnumValueId } from '../utils/utils'
import buttonStyles from '../styles/buttonStyles'
import defaultBankStyle from '../styles/defaultBankStyle.json'
import StyleSheet from '../StyleSheet'
import { makeStylish } from './makeStylish'
import platformStyles from '../styles/platform'

var {
  TYPE,
  ROOT_HASH,
} = constants

const APPLICATION = 'tradle.Application'
const STATUS = 'tradle.Status'

var cnt = 0

let viewCols = {
  'node_displayName': {
    type: 'string'
  },
  'dateStarted': {
    icon: 'ios-clock-outline',
    description: 'Date started',
    color: 'darkblue'
  },
  'progress': {
    label: '%',
    type: 'number',
    description: 'Progress',
    '100': '#D8F0D8'
  },
  'numberOfChecksFailed': {
    label: 'Failed',
    type: 'string',
    description: 'Checks\nfailed',
    icon: 'tradle.Status_fail',
    backlink: 'checks',
    filter: {
      status: {
        id: `${STATUS}_fail`
      }
    }
  },
  'numberOfCheckOverrides': {
    description: '# of overrides',
    icon: 'ios-thunderstorm-outline',
    color: 'green'
  },
  'assignedToTeam': 'Team',
  'score': {
    label: 'IRR',
    link: 'showScoreDetails'
  },
  'scoreType': 'risk',
  'node_depth': {
    label:'Depth',
    type: 'number',
  },
  'elapsed': {
    label:'Delayed',
    type: 'number',
    range: 'time',
    color: 'teal',
    icon: 'ios-time-outline',
    description: 'Time it took\nto complete\napplication',
  },
  'waiting': {
    label: 'Waiting',
    icon: 'ios-timer-outline',
    color: 'orange',
    type: 'number',
    range: 'time',
    description: 'Waiting for\nthe approval'
  },
}

class ApplicationsGrid extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
  };
  constructor(props) {
    super(props);

    const dataSource = new ListView.DataSource({
      rowHasChanged: function(row1, row2) {
        if (row1 !== row2)
          return true
        if (row1  &&  row2)
          return row1 !== row2 || row1._online !== row2._online || row1.style !== row2.style
        return true
      }
    })
    let m = getModel(APPLICATION)
    let gridCols = getGridCols(m)
    let vCols = _.cloneDeep(viewCols)
    gridCols.forEach(p => {
      if (vCols[p])
        return
      let prop = m.properties[p]
      vCols[p] = _.clone(prop)
      vCols[p].label = translate(prop, m)
    })
    delete vCols.applicantName
    delete vCols.status
    this.limit = 20
    this.state = {
      dataSource,
      nodes: [],
      list: [],
      allLoaded: false,
      refreshing: false,
      viewCols: vCols,
      depth: 1
    }
    this._loadMoreContentAsync = this._loadMoreContentAsync.bind(this)
    // this._loadMoreContentAsync = debounce(this._loadMoreContentAsync.bind(this), 500)
  }
  componentDidMount() {
    this.listenTo(Store, 'onAction')
  }
  onAction(params) {
    let { action, list, application, endCursor, applicantName, allLoaded } = params
    switch(action) {
    case 'list':
      if (!list  ||  !list.length  ||  list[0][TYPE] !== APPLICATION) return
      let nodes = this.transformTree({list})
      let newNodes = this.state.nodes.slice().concat(nodes)
      let newList = this.state.list.slice().concat(list)
      if (allLoaded === 'undefined')
        allLoaded =  list  &&  list.length < this.limit
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(newNodes),
        list: newList,
        allLoaded,
        refreshing: false,
        nodes: newNodes,
        endCursor
      })
      break
    case 'openApplicationChat':
      this.openApplicationChat(application)
      return
    case 'showScoreDetails':
      let { bankStyle, navigator } = this.props
      showScoreDetails({application, applicantName, bankStyle, navigator})
      return
    }
  }
  componentWillMount() {
    let { resource, bookmark, modelName, } = this.props
    Actions.list({
      modelName,
      filterResource: resource,
      bookmark,
      search: true,
      first: true,
      limit: this.limit * 2
    })
  }
  async _loadMoreContentAsync() {
    loadMoreContentAsync(this)
  }
  onScroll(event) {
    if (this.state.refreshing || this.props.isModel)
      return
    _.extend(this, onScrollEvent(event))
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.forceUpdate)
      return true
    if (!_.isEqual(this.state.resource, nextState.resource)) {
      return true
    }
    if (this.props.orientation !== nextProps.orientation)
      return true
    if (this.state.dataSource.getRowCount() !== nextState.dataSource.getRowCount())
      return true
    if (!this.state.list  ||  !nextState.list  ||  this.state.list.length !== nextState.list.length)
      return true
    for (let i=0; i<this.state.list.length; i++) {
      if (this.state.list[i].numberOfForms !== nextState.list[i].numberOfForms)
        return true
      if (this.state.list[i][ROOT_HASH] !== nextState.list[i][ROOT_HASH])
        return true
      if (this.state.list[i]._online !== nextState.list[i]._online)
        return true
    }
    return false
  }

  transformTree({list}) {
    let minutes = 60000
    let gridCols = getGridCols(APPLICATION)
    let nodes =  list.map(r => {
      let node = _.pick(r, gridCols)

      let title = makeModelTitle(r.requestFor)
      let displayName = getDisplayName({ resource: r })
      node._displayName = displayName
      let idx = displayName.indexOf(title)
      node.node_displayName = idx <= 0 && displayName || displayName.slice(0, idx).trim()
      // node.stalled = r.lastMsgToClientTime && (r.status === 'started'  &&  Math.round((Date.now() - r.lastMsgToClientTime) / minutes))
      node.waiting = (r.status === 'completed' && Math.round((Date.now() - r.dateCompleted) / minutes)) || 0
      node.elapsed = r.dateCompleted && Math.round(10 * (r.dateCompleted - r.dateStarted) / minutes)/10
      // node.lastNotified = r.lastNotified && Math.round((Date.now() - r.lastNotified) / minutes)
      node._permalink = r[ROOT_HASH]
      if (r.maxFormTypesCount  &&  r.submittedFormTypesCount)
        node.progress = Math.min(Math.round(100 * r.submittedFormTypesCount / r.maxFormTypesCount), 100)

      node[TYPE] = APPLICATION
      node.node_level = 0
      if (r.tree) {
        let cpceCount = {
          cp: 0,
          ce: 0
        }
        node.node_depth = this.getDepth(r.tree, cpceCount)
      }

      return node
    })
    return nodes
  }
  getDepth = function (obj, cpceCount) {
    var depth = 0;
    if (!obj.top  ||  !obj.top.nodes)
      return depth
    let nodes = obj.top.nodes
    for (let p in nodes) {
      let node = nodes[p]
      if (node.typeOfControllingEntity) {
        if (getEnumValueId(node.typeOfControllingEntity) === 'person')
          cpceCount.cp++
        else
          cpceCount.ce++
      }
      let tmpDepth = this.getDepth(node, cpceCount)
      if (tmpDepth > depth)
        depth = tmpDepth
    }
    return 1 + depth
  }
  renderRow(resource, sectionId, rowId) {
    let { navigator, bankStyle } = this.props
    let { list, depth, viewCols } = this.state
    let r = list.find(r => r[ROOT_HASH] === resource._permalink)
    return (
      <ApplicationTreeRow
        onSelect={() => {}}
        key={rowId}
        navigator={navigator}
        rowId={resource._permalink}
        depth={depth}
        gridCols={viewCols}
        node={resource}
        resource={r}
        bankStyle={bankStyle  ||  defaultBankStyle}
        />
      )
  }
  render() {
    let model = getModel(APPLICATION);
    let me = getMe()
    let { allLoaded, depth } = this.state
    let content = <ListView onScroll={this.onScroll.bind(this)}
        dataSource={this.state.dataSource}
        renderHeader={this.renderHeader.bind(this)}
        enableEmptySections={true}
        renderRow={this.renderRow.bind(this)}
        automaticallyAdjustContentInsets={false}
        removeClippedSubviews={false}
        keyboardDismissMode='on-drag'
        keyboardShouldPersistTaps="always"
        initialListSize={20}
        renderScrollComponent={props => <InfiniteScrollView {...props} allLoaded={allLoaded}/>}
        onLoadMoreAsync={this._loadMoreContentAsync}
        scrollRenderAhead={10}
        pageSize={20}
        canLoadMore={true}
        showsVerticalScrollIndicator={false} />;

    let { bankStyle } = this.props
    let contentSeparator = getContentSeparator(bankStyle)
    return (
      <PageView style={platformStyles.container} separator={contentSeparator} bankStyle={bankStyle}>
        <View style={styles.separator} />
        {content}
      </PageView>
    );
  }
  renderHeader() {
    return <ApplicationTreeHeader gridCols={this.state.viewCols} depth={1} />
  }
}
reactMixin(ApplicationsGrid.prototype, Reflux.ListenerMixin)
reactMixin(ApplicationsGrid.prototype, ResourceMixin)
ApplicationsGrid = makeResponsive(ApplicationsGrid)
ApplicationsGrid = makeStylish(ApplicationsGrid)

var styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
  }
})

module.exports = ApplicationsGrid
