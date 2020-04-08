
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
import Icon from 'react-native-vector-icons/Ionicons';

import React, { Component } from 'react'
import { Text } from './Text'

class StringRow extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let { title, bankStyle, description, forScan, icon } = this.props
    let styles = createStyles({bankStyle, description})
    let d
    if (icon)
      icon = <Icon name={icon} size={45} color={DEFAULT_PRODUCT_ROW_TEXT_COLOR} />

    if (description)
      d = <Text style={styles.modelDescription}>{description}</Text>
    return (
      <TouchableOpacity style={styles.viewStyle} onPress={this.props.callback}>
        <View>
          <View style={styles.row}>
            {icon}
            <Text style={styles.modelTitle}>{title}</Text>
          </View>
          {d}
        </View>
      </TouchableOpacity>
    );
  }
}

var createStyles = utils.styleFactory(StringRow, function ({ bankStyle, description }) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 15,
      marginBottom: description ? 7 : 15,
      marginLeft: 15,
    },
    modelTitle: {
      flex: 1,
      flexWrap: 'wrap',
      fontSize: 20,
      fontWeight: '400',
      marginTop: 15,
      marginBottom: description ? 7 : 15,
      marginLeft: 15,
      color: bankStyle  &&  bankStyle.productRowTextColor || DEFAULT_PRODUCT_ROW_TEXT_COLOR
    },
    modelDescription: {
      flex: 1,
      flexWrap: 'wrap',
      fontSize: 14,
      fontWeight: '400',
      marginTop: 0,
      marginBottom: 15,
      fontStyle: 'italic',
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
