import { makeResponsive } from 'react-native-orient'
import React, { Component } from 'react'
import {
  ListView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Platform
} from 'react-native'
import PropTypes from 'prop-types'
import Reflux from 'reflux'

import Icon from 'react-native-vector-icons/Ionicons'
import _ from 'lodash'
import reactMixin from 'react-mixin'

import constants from '@tradle/constants'
import { Text } from './Text'
import Actions from '../Actions/Actions'
import Store from '../Store/Store'
import NoResources from './NoResources'
import ResourceMixin from './ResourceMixin'
import ApplicationTreeRow from './ApplicationTreeRow'
import ApplicationTreeHeader from './ApplicationTreeHeader'
import PageView from './PageView'
import { showLoading, getContentSeparator } from '../utils/uiUtils'
import utils, {
  translate
} from '../utils/utils'
import buttonStyles from '../styles/buttonStyles'
import defaultBankStyle from '../styles/defaultBankStyle.json'
import StyleSheet from '../StyleSheet'
import { makeStylish } from './makeStylish'
import platformStyles from '../styles/platform'

var {
  TYPE,
  ROOT_HASH,
} = constants

var {
  FORM,
  ENUM,
} = constants.TYPES

const APPLICATION = 'tradle.Application'
const PHOTO_ID = 'tradle.PhotoID'
const STATUS = 'tradle.Status'

var cnt = 0

const viewCols = {
  'node_displayName': {
    type: 'string'
  },
  'percentageOfOwnership': {
    icon: 'ios-ribbon-outline',
    type: 'number',
    units: '%',
    description: 'Shares',
    color: 'turquoise'
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
  'ok': {
    label: 'ok',
    type: 'number',
    description: 'Checks\npassed',
    icon: 'tradle.Status_pass',
    backlink: 'checks',
    filter: {
      status: {
        id: `${STATUS}_pass`
      }
    }
  },
  'assignedToTeam': 'Team',
  'score': {
    label: 'IRR',
    link: 'showScoreDetails'
  },
  'scoreType': 'risk',
  'stalled': {
    label: 'Stalled',
    link: 'showTreeNode',
    type: 'number',
    units: 'h'
  },
  'elapsed': {
    label:'Delayed',
    type: 'number',
    color: 'teal',
    icon: 'ios-time-outline',
    description: 'Time it took\nto complete\napplication',
    units: 'h'
  },
  'waiting': {
    label: 'Waiting',
    icon: 'ios-timer-outline',
    color: 'orange',
    type: 'number',
    description: 'Waiting for\nthe approval',
    units: 'h'
  },
  lastNotified: {
    label: 'Last Notified',
    description: 'Last Notified',
    type: 'number',
    valueColor: '#ffdee7',
    units: 'h',
    icon: 'ios-mail-outline',
    color: 'darkblue'
  },
  timesNotified: {
    description: 'Times\nnotified',
    type: 'number',
    icon: 'ios-list-outline',
    color: 'darkgray',
    backlink: 'notifications',
  },
  // notifiedStatus: {
  //   label: 'Status',
  //   description: 'Notified status'
  // }
}

class ApplicationTree extends Component {
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
    let { resource } = this.props
    let { tree } = resource
    let list = []
    this.flatTree({nodes: tree.top.nodes, list})
    let depth = 0
    list.forEach(r => depth = r.node_level > depth && r.node_level || depth)
    this.state = {
      dataSource: dataSource.cloneWithRows(list),
      resource,
      depth
    }
  }
  componentDidMount() {
    this.listenTo(Store, 'onAction')
  }
  onAction(params) {
    let { action, application, context } = params
    switch(action) {
    case 'openApplicationChat':
      this.openApplicationChat(application, context)
      return
    case 'showScoreDetails':
      this.showScoreDetails(application)
      return
    }
  }
  flatTree({level, nodes, list, depth}) {
    if (!level)
      level = 0
    let hours = 3600 * 60 * 24

    for (let p in nodes) {
      let { _displayName, _permalink, top } = nodes[p]
      let node = _.omit(nodes[p], ['top']) //, '_link', '_permalink', '_displayName'])
      if (top) {
        if (top[TYPE] === PHOTO_ID)
          node.node_displayName = top._displayName.split('\n')[0]
        else
          node.node_displayName = top._displayName
      }
      else {
        let title = utils.makeModelTitle(node.requestFor || node[TYPE])
        let idx = _displayName.indexOf(title)
        node.node_displayName = idx <= 0 && _displayName || _displayName.slice(0, idx).trim()
      }
      node.stalled = node.lastMsgToClientTime && (node.status === 'started'  &&  Math.round((Date.now() - node.lastMsgToClientTime) / hours))
      node.waiting = (node.status === 'completed' && Math.round((Date.now() - node.dateCompleted) / hours)) || 0
      node.elapsed = node.dateCompleted && Math.round((node.dateCompleted - node.dateStarted) / hours)
      node.lastNotified = node.lastNotified && Math.round((Date.now() - node.lastNotified) / hours)
      node.node_permalink = _permalink
      node.node_level = level
      list.push(node)
      if (nodes[p].top  &&  nodes[p].top.nodes)
        this.flatTree({nodes: nodes[p].top.nodes, list, level: level + 1})
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.forceUpdate)
      return true
    if (!_.isEqual(this.state.resource.tree, nextState.resource.tree)) {
      return true
    }
  }
  renderRow(resource, sectionId, rowId) {
    let { navigator, bankStyle } = this.props
    return (
      <ApplicationTreeRow
        onSelect={() => {}}
        key={rowId}
        navigator={navigator}
        rowId={resource._permalink}
        depth={this.state.depth}
        gridCols={viewCols}
        node={resource}
        resource={this.props.resource}
        bankStyle={bankStyle  ||  defaultBankStyle}
        />
      );
  }
  getNextKey(resource) {
    return resource[ROOT_HASH] + '_' + cnt++
  }
  render() {
    let model = utils.getModel(APPLICATION);
    let me = utils.getMe()

    let content = <ListView
        dataSource={this.state.dataSource}
        renderHeader={this.renderHeader.bind(this)}
        enableEmptySections={true}
        renderRow={this.renderRow.bind(this)}
        automaticallyAdjustContentInsets={false}
        removeClippedSubviews={false}
        keyboardDismissMode='on-drag'
        keyboardShouldPersistTaps="always"
        initialListSize={1000}
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
    return <ApplicationTreeHeader gridCols={viewCols} depth={this.state.depth} />
  }
  showScoreDetails(application, applicantName) {
    let m = utils.getModel(APPLICATION)
    let { navigator, bankStyle } = this.props
    navigator.push({
      componentName: 'ScoreDetails',
      backButtonTitle: 'Back',
      title: `${translate(m.properties.scoreDetails, m)} - ${application.applicantName  ||  applicantName}`,
      passProps: {
        bankStyle,
        resource: application
      }
    })
  }
}
reactMixin(ApplicationTree.prototype, Reflux.ListenerMixin);
reactMixin(ApplicationTree.prototype, ResourceMixin);
ApplicationTree = makeResponsive(ApplicationTree)
ApplicationTree = makeStylish(ApplicationTree)

var styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
  },
  row: {
    flexDirection: 'row',
    padding: 5,
  },
  textContainer: {
    alignSelf: 'center',
  },
  resourceTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: '#757575',
    marginBottom: 2,
    paddingLeft: 5
  },
  headerRow: {
    borderBottomColor: '#cccccc',
    borderBottomWidth: 1,
  },
  type: {
    fontSize: 18,
    color: '#555555'
  },
  description: {
    fontSize: 16,
    color: '#555555'
  },
  gridHeader: {
    backgroundColor: '#eeeeee'
  },
  employee: {
    fontSize: 18,
  },
  loading: {
    fontSize: 17,
    alignSelf: 'center',
    // marginTop: 0,
    color: '#629BCA'
  },
  noResourcesIcon: {
    opacity: 0.4,
    marginTop: 0,
    width: 30,
    height: 30
  }
});

module.exports = ApplicationTree;
/*
JSON.stringify(tree, null, 2)
"{
  "_t": "tradle.Application",
  "_link": "0b8fbb89550005e7cd6cf3e9fd439c0528adfabd8f67133fdf3e9489431fea69",
  "_permalink": "0b8fbb89550005e7cd6cf3e9fd439c0528adfabd8f67133fdf3e9489431fea69",
  "_displayName": "Octopus SVB Business Account",
  "top": {
    "_t": "tradle.legal.LegalEntity",
    "_link": "539e426420f4a2760bb4d5c2ba0b20ab757ac7faf46faa0d24e558681a393dc3",
    "_permalink": "539e426420f4a2760bb4d5c2ba0b20ab757ac7faf46faa0d24e558681a393dc3",
    "_displayName": "Octopus",
    "nodes": {
      "312971cbfe5c0e2cb5f13c3bf3247d36713df352904e944261c6fddc18ee5fb5": {
        "_t": "tradle.Application",
        "_link": "312971cbfe5c0e2cb5f13c3bf3247d36713df352904e944261c6fddc18ee5fb5",
        "_permalink": "312971cbfe5c0e2cb5f13c3bf3247d36713df352904e944261c6fddc18ee5fb5",
        "_displayName": "Octopus Ventures Limited Controlling Entity Onboarding",
        "top": {
          "_t": "tradle.legal.LegalEntity",
          "_link": "568fa719afaa4a6902d313eaa53b54a98de10630118a400acd3eeeba032a33a8",
          "_permalink": "568fa719afaa4a6902d313eaa53b54a98de10630118a400acd3eeeba032a33a8",
          "_displayName": "Octopus Ventures Limited",
          "nodes": {
            "81536c70d301c8d6dad47b63dee46b9b9bf97db5059a5d13ca3e19610440929a": {
              "_t": "tradle.Application",
              "_link": "81536c70d301c8d6dad47b63dee46b9b9bf97db5059a5d13ca3e19610440929a",
              "_permalink": "81536c70d301c8d6dad47b63dee46b9b9bf97db5059a5d13ca3e19610440929a",
              "_displayName": "Octopus Investments Limited Controlling Entity Onboarding",
              "top": {
                "_t": "tradle.legal.LegalEntity",
                "_link": "9c62cdb558b0985e2b44dfe65d36b4ebaa02662b87f1d9636b27347f37d162b3",
                "_permalink": "9c62cdb558b0985e2b44dfe65d36b4ebaa02662b87f1d9636b27347f37d162b3",
                "_displayName": "Octopus Investments Limited",
                "nodes": {
                  "8bee5ba442852579ef4f657ab1bf58dc124001f95c67e984f12c65060aedd66a": {
                    "_t": "tradle.Application",
                    "_link": "8bee5ba442852579ef4f657ab1bf58dc124001f95c67e984f12c65060aedd66a",
                    "_permalink": "8bee5ba442852579ef4f657ab1bf58dc124001f95c67e984f12c65060aedd66a",
                    "_displayName": "Octopus Capital Limited Controlling Entity Onboarding",
                    "top": {
                      "_t": "tradle.legal.LegalEntity",
                      "_link": "ff0e05a9b4f71daeb64ca8ff0a405cbb799eb524736232edce8cf1b1024b9572",
                      "_permalink": "ff0e05a9b4f71daeb64ca8ff0a405cbb799eb524736232edce8cf1b1024b9572",
                      "_displayName": "Octopus Capital Limited"
                    },
                    "new": true,
                    "requestFor": "tradle.legal.LegalEntityProduct",
                    "numberOfChecksFailed": 2,
                    "submittedFormTypesCount": 2,
                    "maxFormTypesCount": 3,
                    "progress": 67,
                    "associatedResource": "1cb7521e98b60e3aeca7275e1f0943f866cf0ffab5ecc1d2e7741e7be26d88f0",
                    "parent": "81536c70d301c8d6dad47b63dee46b9b9bf97db5059a5d13ca3e19610440929a",
                    "ok": 11,
                    "dateStarted": 1581218420038,
                    "waiting": false,
                    "status": "started",
                    "assignedToTeam": {
                      "id": "tradle.ClientOnboardingTeam_fcrm",
                      "title": "FCRM"
                    },
                    "score": 32,
                    "scoreType": {
                      "id": "tradle.ScoreType_low",
                      "title": "Low"
                    },
                    "lastMsgToClientTime": 1581218605203,
                    "stalled": 0,
                    "formsCount": 7
                  }
                }
              },
              "new": true,
              "requestFor": "tradle.legal.LegalEntityProduct",
              "numberOfChecksFailed": 4,
              "submittedFormTypesCount": 2,
              "maxFormTypesCount": 3,
              "progress": 67,
              "associatedResource": "6a95a706adf91eaa81a83b1fd1717a92cc4e3460ae319dee42c800edb0c6d4fc",
              "parent": "312971cbfe5c0e2cb5f13c3bf3247d36713df352904e944261c6fddc18ee5fb5",
              "ok": 12,
              "dateStarted": 1581217634098,
              "waiting": false,
              "status": "started",
              "assignedToTeam": {
                "id": "tradle.ClientOnboardingTeam_fcrm",
                "title": "FCRM"
              },
              "score": 32,
              "scoreType": {
                "id": "tradle.ScoreType_low",
                "title": "Low"
              },
              "lastMsgToClientTime": 1581218323927,
              "stalled": 0,
              "formsCount": 8
            },
            "e80fddedd86d96ce219c4dbd1dd07c672f04830e33bcf67dd440aba5f43f225c": {
              "_t": "tradle.Application",
              "_link": "e80fddedd86d96ce219c4dbd1dd07c672f04830e33bcf67dd440aba5f43f225c",
              "_permalink": "e80fddedd86d96ce219c4dbd1dd07c672f04830e33bcf67dd440aba5f43f225c",
              "_displayName": "Controlling Person Onboarding",
              "top": {
                "_t": "tradle.PhotoID",
                "_link": "6a65c186e20df9a09d5d99f1c0c64d97343726f72e62e1b9ed14fe2399afaca2",
                "_permalink": "6a65c186e20df9a09d5d99f1c0c64d97343726f72e62e1b9ed14fe2399afaca2",
                "_displayName": "Chris Hulatt\nValid Driver Licence, United Kingdom"
              },
              "new": true,
              "requestFor": "tradle.legal.ControllingPersonOnboarding",
              "numberOfChecksFailed": 3,
              "submittedFormTypesCount": 4,
              "maxFormTypesCount": 4,
              "progress": 100,
              "associatedResource": "d409b32c00ca2992269a5e9bfcbc2a07deae5824ab5fdccf72e488ad04f43470",
              "parent": "312971cbfe5c0e2cb5f13c3bf3247d36713df352904e944261c6fddc18ee5fb5",
              "ok": 1,
              "lastMsgToClientTime": 1581218094972,
              "dateStarted": 1581217910906,
              "stalled": 0,
              "waiting": false,
              "status": "started",
              "score": 1,
              "scoreType": {
                "id": "tradle.ScoreType_low",
                "title": "Low"
              },
              "formsCount": 3,
              "assignedToTeam": {
                "id": "tradle.ClientOnboardingTeam_casres",
                "title": "CAS Res"
              }
            },
            "56a2df179170d29da4f23c58be251ac07805e45a6cbebaf04efd834d3365f524": {
              "_t": "tradle.Application",
              "_link": "56a2df179170d29da4f23c58be251ac07805e45a6cbebaf04efd834d3365f524",
              "_permalink": "56a2df179170d29da4f23c58be251ac07805e45a6cbebaf04efd834d3365f524",
              "_displayName": "Controlling Person Onboarding",
              "top": {
                "_t": "tradle.PhotoID",
                "_link": "d41d2dda1e822ddb115f5855b5bf85b0818cb5ecf617b44aefa4482220773bc2",
                "_permalink": "d41d2dda1e822ddb115f5855b5bf85b0818cb5ecf617b44aefa4482220773bc2",
                "_displayName": "Simon Rogerson\nValid Driver Licence, United Kingdom"
              },
              "new": true,
              "requestFor": "tradle.legal.ControllingPersonOnboarding",
              "numberOfChecksFailed": 1,
              "submittedFormTypesCount": 1,
              "maxFormTypesCount": 4,
              "progress": 25,
              "associatedResource": "b6e8ebbf1a2b5608affc0733effb63efe0ccf9eec4fe1d0bca6d570c9d464840",
              "parent": "312971cbfe5c0e2cb5f13c3bf3247d36713df352904e944261c6fddc18ee5fb5",
              "ok": 1,
              "dateStarted": 1581218179689,
              "waiting": false,
              "status": "started",
              "score": 1,
              "scoreType": {
                "id": "tradle.ScoreType_low",
                "title": "Low"
              }
            }
          }
        },
        "new": true,
        "requestFor": "tradle.legal.LegalEntityProduct",
        "numberOfChecksFailed": 2,
        "submittedFormTypesCount": 2,
        "maxFormTypesCount": 3,
        "progress": 67,
        "associatedResource": "048ff383ea1afbed874e81b2ed461da303409f57f2c97beafdec1d544aa8d9d5",
        "parent": "0b8fbb89550005e7cd6cf3e9fd439c0528adfabd8f67133fdf3e9489431fea69",
        "ok": 9,
        "dateStarted": 1581217246051,
        "waiting": false,
        "status": "started",
        "assignedToTeam": {
          "id": "tradle.ClientOnboardingTeam_casonb",
          "title": "CAS Onboarding"
        },
        "score": 32,
        "scoreType": {
          "id": "tradle.ScoreType_low",
          "title": "Low"
        },
        "lastMsgToClientTime": 1581217554688,
        "stalled": 0,
        "formsCount": 4
      }
    }
  }
}"
 */