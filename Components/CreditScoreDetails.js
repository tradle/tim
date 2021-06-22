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
import StyleSheet from '../StyleSheet'
import { makeStylish } from './makeStylish'
import platformStyles from '../styles/platform'

const APPLICATION = 'tradle.Application'
const FORM = 'tradle.Form'
const viewCols = {
  property: {
    label: translate('property'),
  },
  form: {
    label: translate('form'),
    type: 'object'
  },
  // formProperty: {
  //   label: translate('formProperty')
  // },
  score: {
    label: translate('score')
  },
  scoreBar: {
    label: ' ',
    type: 'bar'
  }
}

class CreditScoreDetails extends Component {
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
    let { creditScoreDetails } = resource
    let totalScore = creditScoreDetails.find(r => r.property === 'totalScore')

    let crcSorted = _.groupBy(creditScoreDetails, 'group')
    let crc = []
    for (let p in crcSorted) {
      let arr = crcSorted[p]
      crc.push(p)
      crc = crc.concat(arr)
    }
    this.state = {
      dataSource: dataSource.cloneWithRows(crc),
      resource,
      totalScore: totalScore && totalScore.score
    }
  }
  renderRow(resource, sectionId, rowId) {
    let { navigator, bankStyle } = this.props
    let cols = []
    let size = _.size(viewCols)
    if (typeof resource === 'string') {
      if (resource === 'undefined')
        return <Row/>
      return <Row size={size} style={[styles.gridRow, {backgroundColor: 'aliceblue'}]} key={rowId} nowrap>
               <Col sm={size} md={size} lg={size} style={styles.col} key={rowId + resource}>
                 <Text style={styles.title}>{translate(resource)}</Text>
               </Col>
             </Row>

    }
    let isTotal = resource.total
    let isTotalScore = resource.property === 'totalScore'
    for (let p in viewCols) {
      let value = resource[p]
      if (value  ||  value === 0) {
        if (typeof value === 'object') {
          if (!Array.isArray(value))
            value = [value]

          value = value.map(v => {
            let title = v.title
            if (!title) {
              let type = utils.getType(v)
              let m = utils.getModel(type)
              if (m)
                title = translate(m)
            }
            return <TouchableOpacity onPress={this.showResource.bind(this, v)}>
                      <Text style={[isTotal && styles.total || styles.text, {color: bankStyle.linkColor}]}>{title}</Text>
                    </TouchableOpacity>
          })
        }
        else {
          if (typeof value === 'string')
            value = translate(value)
          let style = []
          let isNumber = typeof value === 'number'  ||  viewCols.type === 'number'
          if (isNumber)
            style.push(isTotal && styles.textRightTotal || styles.textRight)
          else
            style.push(isTotal && styles.total || styles.text)

          if (isTotal) {
            style.push({fontWeight: '600'})
            if (!isTotalScore) {
              style.push({paddingLeft: 30})
              if (resource[p] === resource.group)
                value = translate('total')
            }
          }
          else if (p === 'property') {
            style.push({paddingLeft: 30})
          }
          value = <Text style={style}>{value}</Text>
        }
        cols.push(<Col sm={1} md={1} lg={1} style={styles.col} key={rowId + p}>{value}</Col>)
        continue
      }
      if (p === 'scoreBar'  &&  resource.property !== 'totalScore') {
        let color = bankStyle.linkColor
        if (!isTotal) {
          let rgb = utils.hexToRgb(bankStyle.linkColor)
          color = `rgba(${Object.values(rgb).join(',')}, 0.5)`
        }
        value = <ProgressBar progress={resource.score/this.state.totalScore} width={150} color={color} borderWidth={1} borderRadius={3} height={5} showProgress={true} />
      }
      else
        value = <Text> </Text>

      cols.push(<Col sm={1} md={1} lg={1} style={styles.col} key={rowId + p}>{value}</Col>)
    }
    let backgroundColor = isTotalScore ? 'aliceblue' : 'transparent'
    return <Row size={_.size(viewCols)} style={[styles.gridRow, {backgroundColor}]} key={rowId} nowrap>
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
  showResource(resource) {
    let type = utils.getType(resource)
    if (!type) return
    let m = utils.getModel(type)
    if (!m) return
    const { navigator, bankStyle, locale, currency } = this.props
    if (utils.isSubclassOf(m, FORM)) {
      navigator.push({
        componentName: 'MessageView',
        title: resource.title,
        passProps: {
          resource,
          bankStyle,
          currency,
        }
      })
    }
    else {
      navigator.push({
        title: resource.title,
        componentName: 'ResourceView',
        backButtonTitle: 'Back',
        passProps: {
          resource,
          bankStyle,
          currency,
          locale
        }
      })
    }
  }
}
reactMixin(CreditScoreDetails.prototype, ResourceMixin);
CreditScoreDetails = makeResponsive(CreditScoreDetails)
CreditScoreDetails = makeStylish(CreditScoreDetails)

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
  title: {
    paddingLeft: 10,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 2,
    fontSize: 16
  },
  textRight: {
    fontSize: 16,
    fontWeight: '400',
    color: '#555555',
    marginBottom: 2,
    paddingRight: 10,
    alignSelf: 'flex-end'
  },
  textRightTotal: {
    fontSize: 16,
    fontWeight: '600',
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

module.exports = CreditScoreDetails;
