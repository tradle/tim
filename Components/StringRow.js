console.log('requiring StringRow.js')
'use strict';

import utils from '../utils/utils'
import StyleSheet from '../StyleSheet'

var DEFAULT_PRODUCT_ROW_BG_COLOR = '#f7f7f7'
var DEFAULT_PRODUCT_ROW_TEXT_COLOR = '#757575'
import {
  // Text,
  TouchableOpacity,
  View
} from 'react-native'
import PropTypes from 'prop-types'

import React, { Component } from 'react'
// import { Text } from './Text'

class StringRow extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let { title, bankStyle } = this.props
    let styles = createStyles({bankStyle})
    let renderedRow = <Text style={styles.modelTitle}>{title}</Text>;
    return (
      <TouchableOpacity style={styles.viewStyle} onPress={this.props.callback} underlayColor='transparent'>
        {renderedRow}
      </TouchableOpacity>
    );
  }
}

var createStyles = utils.styleFactory(StringRow, function ({ bankStyle }) {
  return StyleSheet.create({
    modelTitle: {
      flex: 1,
      flexWrap: 'wrap',
      fontSize: 20,
      fontWeight: '400',
      marginVertical: 15,
      marginLeft: 15,
      color: bankStyle  &&  bankStyle.productRowTextColor || DEFAULT_PRODUCT_ROW_TEXT_COLOR
    },
    viewStyle: {
      marginVertical: StyleSheet.hairlineWidth,
      backgroundColor: bankStyle  &&  bankStyle.productRowBgColor || DEFAULT_PRODUCT_ROW_BG_COLOR
    }
  })
})

module.exports = StringRow;
