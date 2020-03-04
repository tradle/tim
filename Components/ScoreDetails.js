import { makeResponsive } from 'react-native-orient'
import React, { Component } from 'react'
import {
  ListView,
  TouchableOpacity,
  View,
  Platform
} from 'react-native'
import PropTypes from 'prop-types'
import {Column as Col, Row} from 'react-native-flexbox-grid'

import Icon from 'react-native-vector-icons/Ionicons'
import _ from 'lodash'
import reactMixin from 'react-mixin'

import { Text } from './Text'
import ProgressBar from './ProgressBar'
import ResourceMixin from './ResourceMixin'
import ApplicationTreeHeader from './ApplicationTreeHeader'
import PageView from './PageView'
import { getContentSeparator } from '../utils/uiUtils'
import utils, {
  translate
} from '../utils/utils'
import buttonStyles from '../styles/buttonStyles'
import StyleSheet from '../StyleSheet'
import { makeStylish } from './makeStylish'
import platformStyles from '../styles/platform'

const APPLICATION = 'tradle.Application'
const viewCols = {
  riskFactor: {
    label: translate('riskFactor'),
  },
  totalScore: {
    label: translate('totalScore'),
    type: 'number'
  },
  form: {
    label: translate('form'),
  },
  riskClass: {
    label: translate('riskClass')
  },
  riskValue: {
    label: translate('riskValue')
  },
  score: {
    label: translate('score')
  },
  scoreBar: {
    label: ' ',
    type: 'bar'
  }
}
const mapSummaryToDetails = {
  beneficialOwnersRisk: 'beneficialOwnerRisk'
}

class ScoreDetails extends Component {
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
    let { resource } = props
    let { scoreDetails } = resource
    let list = this.flatTree(scoreDetails)
    let depth = 0
    this.state = {
      dataSource: dataSource.cloneWithRows(list),
      resource,
      depth
    }
  }
  flatTree({details, summary}) {
    let hours = 3600 * 60 * 24
    let list = []
    for (let p in summary) {
      let tree = {
        riskFactor: p,
        totalScore: summary[p]
      }
      list.push(tree)
      if (!summary[p]) {
        tree.score = 0
        continue
      }

      let criteria = mapSummaryToDetails[p] || p

      let categoryDetails = details.filter(d => {
        return d[criteria]
      })
      if (!categoryDetails.length) {
        tree.score = tree.totalScore
        continue
      }

      let copy = _.cloneDeep(tree)

      let rows = []
      categoryDetails.forEach(d => {
        let branch
        if (tree.form) {
          branch = {...copy}
          delete branch.totalScore
          list.push(branch)
        }
        else
          branch = tree
        branch.form = d.form
        let dd = d[criteria]

        for (let c in dd) {
          if (c === 'score' || c === 'risk')
            continue
          if (branch.riskClass) {
            branch = {...copy}
            delete branch.totalScore
            delete branch.riskFactor
            branch.form = d.form
            list.push(branch)
          }
          if (dd[c].risk  ||  (_.size(dd) <= 2  &&  d.risk))
            branch.totalScore = 100
          branch.score = dd[c].score || dd.score || (_.size(dd) === 1  &&  Object.values(dd)[0])

          branch.riskClass = translate(criteria)
          branch.riskValue = c

        }
      })
    }
    return list
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.forceUpdate)
      return true
    if (!_.isEqual(this.state.resource.scoreDetails, nextState.resource.scoreDetails)) {
      return true
    }
  }
  renderRow(resource, sectionId, rowId) {
    let { navigator, bankStyle } = this.props
    let { summary } = this.props.resource.scoreDetails
    let cols = []

    for (let p in viewCols) {
      let value = resource[p]
      if (value  ||  value === 0) {
        if (typeof value === 'object')
          value = <TouchableOpacity onPress={() => {}}><Text style={[styles.text, {color: bankStyle.linkColor}]}>{value._displayName}</Text></TouchableOpacity>
        else {
          if (typeof value === 'string')
            value = translate(value)
          let style
          if (typeof value === 'number'  ||  viewCols.type === 'number')
            style = styles.textRight
          else
            style = styles.text
          value = <Text style={style}>{value}</Text>
        }
        cols.push(<Col sm={1} md={1} lg={1} style={styles.col} key={rowId + p}>
                    {value}
                  </Col>)
      }
      else {
        if (p === 'scoreBar'  &&  resource.score)
          value = <ProgressBar progress={resource.score/100} width={150} color={bankStyle.linkColor} borderWidth={1} borderRadius={3} height={5} showProgress={true} />
        else
          value = <Text> </Text>

        cols.push(<Col sm={1} md={1} lg={1} style={styles.col} key={rowId + p}>{value}</Col>)
      }

    }

    return <Row size={_.size(viewCols)} style={[styles.gridRow, {backgroundColor: resource.totalScore === 100 && '#FFDEE7' || 'transparent'}]} key={rowId} nowrap>
             {cols}
           </Row>

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
    return <ApplicationTreeHeader gridCols={viewCols} depth={0} />
  }
}
reactMixin(ScoreDetails.prototype, ResourceMixin);
ScoreDetails = makeResponsive(ScoreDetails)
ScoreDetails = makeStylish(ScoreDetails)

var styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
  },
  col: {
    paddingVertical: 5,
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    color: '#555555',
    marginBottom: 2,
    paddingLeft: 10,
  },
  textRight: {
    fontSize: 16,
    fontWeight: '400',
    color: '#555555',
    marginBottom: 2,
    paddingRight: 10,
    alignSelf: 'flex-end'
  },
  gridRow: {
    borderBottomColor: '#f5f5f5',
    paddingVertical: 5,
    paddingRight: 7,
    borderBottomWidth: 1
  },
});

module.exports = ScoreDetails;
// {
//   "details": [
//     {
//       "form": {
//         "_t": "tradle.legal.LegalEntity",
//         "_link": "31a16baa22714d49641d56b4f6984aade2fdbd2de305f19fb72a5ff535168bf2",
//         "_permalink": "a5f853272af4ad693a6a370f0f6291f40bced18ea703e18ee636dce03af4697e",
//         "_displayName": "Octopus Ventures Limited"
//       },
//       "countryOfRegistration": {
//         "GB": {
//           "score": 0.67
//         },
//         "score": 0.67
//       }
//     },
//     {
//       "form": {
//         "_t": "tradle.legal.LegalEntityControllingPerson",
//         "_link": "40635b2e899c5ab1055ca8e005c844c6e8a43d796c2b4a6c745b2199051cb65e",
//         "_permalink": "40635b2e899c5ab1055ca8e005c844c6e8a43d796c2b4a6c745b2199051cb65e",
//         "_displayName": "HULATT, Christopher Robert"
//       },
//       "beneficialOwnerRisk": {
//         "GB": {
//           "score": 0.67
//         },
//         "score": 0.67
//       }
//     },
//     {
//       "form": {
//         "_t": "tradle.legal.LegalEntityControllingPerson",
//         "_link": "1806b31b0a234070e8177534eb8d94bcdc19552e48e391ea0ec81a558bdf8408",
//         "_permalink": "625355a1bf1a2c0d0346001b0c4ce58e2ab45b70c8a1622e8cffc2c65d3ba10a",
//         "_displayName": "ROGERSON, Simon Andrew"
//       },
//       "beneficialOwnerRisk": {
//         "CU": {
//           "score": 11.61
//         },
//         "score": 11.61,
//         "risk": "*AUTOHIGH*"
//       },
//       "risk": "*AUTOHIGH*"
//     }
//   ],
//   "summary": {
//     "baseRisk": 17.95,
//     "transactionalRisk": 5.735,
//     "beneficialOwnersRisk": 11.61,
//     "countryOfRegistration": 0.67,
//     "countriesOfOperation": 0,
//     "crossBorderRisk": 0,
//     "lengthOfRelationship": 4.32,
//     "legalStructureRisk": 3.64,
//     "historicalBehaviorRisk": 0,
//     "bsaCodeRisk": 0
//   }
// }"
//
