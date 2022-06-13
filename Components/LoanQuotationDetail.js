import React, { Component } from 'react'
import {
  ListView,
  View,
  TouchableOpacity,
  Platform
} from 'react-native'
import PropTypes from 'prop-types'
import cloneDeep from 'lodash/cloneDeep'
import extend from 'lodash/extend'
import {Column as Col, Row} from 'react-native-flexbox-grid'
import Icon from 'react-native-vector-icons/Ionicons'

import { Text } from './Text'
import PageView from './PageView'
import { getContentSeparator } from '../utils/uiUtils'
import utils, {
  translate
} from '../utils/utils'
import StyleSheet from '../StyleSheet'
import platformStyles from '../styles/platform'
import { circled } from '../styles/utils'

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
    let { list, terms } = this.flatten(resource.loanQuotationDetail)
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
        }
        rows[term].push(val[term]) //.finCostLoan)
      }
    }
    return {list: [header].concat(Object.values(rows)), terms: Object.keys(rows)}
  }
  renderRow(resource, sectionId, rowId) {
    let { navigator, bankStyle, callback, resource: source, tableParams } = this.props
    let { terms } = this.state
    let cols = []
    let rid = parseInt(rowId)
    let id = rowId + 100
    cols.push(<Col sm={1} md={1} lg={1} style={[styles.col, {backgroundColor: '#cfcfcf'}]} key={++id}>
                <Text style={{fontSize: 16, alignSelf: 'center'}}>{rid ? terms[rowId - 1] : ''}</Text>
              </Col>)

    let style = { fontSize: 16, alignSelf: 'center' }
    resource.forEach((r, i) => {
      let bg = {}
      let pass
      let val
      if (!rid)
        val = r
      else {
        val = r.finCostLoan
        pass = rid  &&  r.status === 'pass'
        if (pass) {
          bg.backgroundColor = '#D6E7D6'
          bg.color = bankStyle.linkColor
        }

        let [decimal, mantissa] = (val + '').split('.')
        if (!mantissa)
          mantissa = '00'
        else if (mantissa.length < 2)
          for (let j=0; mantissa.length !== 2; j++) {
            mantissa += '0'
          }
        val = `${decimal}.${mantissa}`
      }
      let content = <Text style={style}>{val}</Text>
      if (pass) {
        let check
        let checkParams = tableParams || source
        if (checkParams) {
          if (checkParams.loanTerm  &&  checkParams.loanTerm.id === r.loanTerm.id  &&  checkParams.loanDeposit === r.loanDeposit)
            check = <Icon name='ios-checkmark' size={30} color='green' style={styles.icon}/>
        }
        content = <TouchableOpacity onPress={() => this.setProps(r)}>
                    {check}
                    {content}
                  </TouchableOpacity>
      }
      else
        content = <Text style={style}>{val}</Text>
      cols.push(<Col sm={1} md={1} lg={1} style={[styles.col, bg]} key={++id + i * 10}>
                  {content}
                </Col>)
    })

    return <Row size={resource.length + 1} style={[styles.gridRow, {backgroundColor: rid ? 'transparent' : '#cfcfcf' }]} key={id + 1} nowrap>
             {cols}
           </Row>

  }
  setProps(loanResource) {
    let { loanTerm, finCostLoan, xirrLoan, monthlyPaymentLoan } = loanResource
    let { resource, callback } = this.props
    let newResource = cloneDeep(resource)
    let loanItem = newResource.terms.find(t => t.finCostLoan)
    if (loanItem  &&  loanTerm.id !== loanItem.id) {
      delete loanItem.finCostLoan
      delete loanItem.xirrLoan
      delete loanItem.monthlyPaymentLoan
      let loanItemForNewTerm = newResource.terms.find(t => t.term.id === loanTerm.id)
      extend(loanItemForNewTerm, {finCostLoan, xirrLoan, monthlyPaymentLoan})
    }
    extend(newResource, loanResource)
    callback({resource: newResource, additionalInfo: {calculatingForLoan: true}, tableParams: loanResource })
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
  }
}

var styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
  },
  col: {
    height: 40,
    justifyContent: 'center',
    paddingRight: 10,
  },
  gridRow: {
    height: 40,
    borderBottomColor: '#f5f5f5',
    justifyContent: 'center',
    borderBottomWidth: 1
  },
  icon: {
    // paddingRight: 10
    position: 'absolute',
    bottom: -5,
    left: 10
  },
});

module.exports = LoanQuotationDetail;
