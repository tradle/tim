import { makeResponsive } from 'react-native-orient'
import React, { Component } from 'react'
import {
  ListView,
  View,
  Platform
} from 'react-native'
import PropTypes from 'prop-types'
import {Column as Col, Row} from 'react-native-flexbox-grid'

import _ from 'lodash'
import reactMixin from 'react-mixin'

import { Text } from './Text'
import PageView from './PageView'
import { getContentSeparator } from '../utils/uiUtils'
import utils, {
  translate
} from '../utils/utils'
import buttonStyles from '../styles/buttonStyles'
import StyleSheet from '../StyleSheet'
import { makeStylish } from './makeStylish'
import platformStyles from '../styles/platform'


class LoanQuotationDetail extends Component {
  static propTypes = {
    resource: PropTypes.object.isRequired
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
    let {list, terms} = this.flatten(resource)
    this.state = {
      dataSource: dataSource.cloneWithRows(list),
      list,
      terms
    }
  }
  flatten(resource) {
    let header = Object.keys(resource)
    let values = Object.values(resource)

    let rows = {}
    let irr = {}
    for (let i=0; i<values.length; i++) {
      let val = values[i]
      for (let term in val) {
        if (!rows[term]) {
          rows[term] = []
          irr[term] = []
        }
        rows[term].push(val[term].finCostLoan)
        irr[term].push(val[term].irrLoan)
      }
    }
debugger
    return {list: [header].concat(Object.values(rows)), terms: Object.keys(rows)}
  }
  renderRow(resource, sectionId, rowId) {
    let { navigator, bankStyle } = this.props
    let { terms } = this.state
    let cols = []
    let rid = parseInt(rowId)
    let id = rowId + 100
    cols.push(<Col sm={1} md={1} lg={1} style={[styles.col, {backgroundColor: 'aliceblue'}]} key={++id}>
                <Text style={{fontSize: 16, alignSelf: 'center'}}>{rid ? terms[rowId - 1] : ''}</Text>
              </Col>)

    let style = { fontSize: 16, alignSelf: rid ? 'flex-end': 'center' }
    for (let i=0; i<resource.length; i++) {
      let val = resource[i]
      if (rid) {
        let [decimal, mantissa] = (val + '').split('.')
        if (!mantissa)
          mantissa = '00'
        else if (mantissa.length < 2)
          for (let i=0; mantissa.length !== 2; i++) {
            mantissa += '0'
          }
        val = `${decimal}.${mantissa}`
      }
      cols.push(<Col sm={1} md={1} lg={1} style={styles.col} key={++id + i * 10}>
                  <Text style={style}>{val}</Text>
                </Col>)
    }

    return <Row size={resource.length + 1} style={[styles.gridRow, {backgroundColor: rid ? 'transparent' : 'aliceblue' }]} key={id + 1} nowrap>
             {cols}
           </Row>

  }
  render() {
    let { list } = this.state
    let content = <ListView
        dataSource={this.state.dataSource}
        enableEmptySections={true}
        renderHeader={this.renderHeader.bind(this)}
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
    let rid = list.length + 100
    return (
      <PageView style={platformStyles.container} separator={contentSeparator} bankStyle={bankStyle}>
        <View style={styles.separator} />
        {content}
      </PageView>
    );
  }
  renderHeader() {
    const { bankStyle } = this.props
    const { list } = this.state
    return <View style={{flexDirection: 'row', backgroundColor: bankStyle.linkColor, height: 45, alignItems: 'center', justifyContent: 'center'}}>
             <View style={{flex: 1, alignItems: 'center'}}>
               <Text style={{fontSize: 16, color: '#fff'}}>{translate('Terms')}</Text>
             </View>
             <View style={{flex: list[0].length, alignItems: 'center'}}>
               <Text style={{fontSize: 16, color: '#fff'}}>{translate('Deposits')}</Text>
             </View>
           </View>
    // const { list } = this.state
    // return <View key='LoanQuotationDetail_h1'>
    //         <Row size={1} style={[styles.gridRow, {backgroundColor: 'aliceblue'}]} key={'LoanQuotationDetail_0'} nowrap>
    //           <Col sm={list.length + 1} md={list.length + 1} lg={list.length + 1} style={[styles.col, {alignItems: 'center'}]} key={'LoanQuotationDetail_1'}>
    //             <Text style={{fontSize: 20}}>{translate('Deposits')}</Text>
    //           </Col>)
    //         </Row>
    //       </View>
  }
}
LoanQuotationDetail = makeResponsive(LoanQuotationDetail)
LoanQuotationDetail = makeStylish(LoanQuotationDetail)

var styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
  },
  col: {
    height: 40,
    justifyContent: 'center',
    // paddingVertical: 5,
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
    height: 40,
    borderBottomColor: '#f5f5f5',
    justifyContent: 'center',
    // paddingVertical: 5,
    paddingRight: 7,
    borderBottomWidth: 1
  },
});

module.exports = LoanQuotationDetail;
