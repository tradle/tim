import utils from '../utils/utils'
import constants from '@tradle/constants'
var translate = utils.translate
import StyleSheet from '../StyleSheet'

var DEFAULT_PRODUCT_ROW_BG_COLOR = '#f7f7f7'
var DEFAULT_PRODUCT_ROW_TEXT_COLOR = '#757575'
var PRODUCT_ROW_BG_COLOR, PRODUCT_ROW_TEXT_COLOR
import {
  Text,
  TouchableHighlight,
  View
} from 'react-native'
import PropTypes from 'prop-types'
var { TYPE } = constants
import React, { Component } from 'react'

class MessageTypeRow extends Component {
  static propTypes = {
    resource: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
    bankStyle: PropTypes.object,
  };
  constructor(props) {
    super(props);
    const { bankStyle } = props
    PRODUCT_ROW_BG_COLOR = (bankStyle  &&  bankStyle.productRowBgColor) || DEFAULT_PRODUCT_ROW_BG_COLOR
    PRODUCT_ROW_TEXT_COLOR = (bankStyle  &&  bankStyle.productRowTextColor) || DEFAULT_PRODUCT_ROW_TEXT_COLOR
  }
  render() {
    const { resource, onSelect } = this.props
    if (resource.autoCreate)
      return <View style={{height: 0}} />;
    var onPressCall = onSelect;

    var title
    let isContext = utils.isContext(resource[TYPE])
    let renderedRow
    if (isContext) {
      let model = utils.getModel(resource.requestFor)
      title = model  &&  translate(model) || resource.requestFor

      renderedRow = <View style={styles.context}>
                      <Text style={[styles.modelTitle, {color: PRODUCT_ROW_TEXT_COLOR, flex:4}]}>{title}</Text>
                    </View>
    }
    else {
      title = utils.getDisplayName(resource)
      renderedRow = <Text style={[styles.modelTitle, {color: PRODUCT_ROW_TEXT_COLOR}]}>{title}</Text>;
    }

    var viewStyle = { marginVertical: StyleSheet.hairlineWidth, backgroundColor: PRODUCT_ROW_BG_COLOR }
    return (
      <TouchableHighlight style={viewStyle} onPress={onPressCall ? onPressCall : () => {}} underlayColor='transparent'>
        {renderedRow}
      </TouchableHighlight>
    );
  }
}

var styles = StyleSheet.create({
  modelTitle: {
    flex: 1,
    flexWrap: 'wrap',
    fontSize: 20,
    fontWeight: '400',
    marginLeft: 15,
    alignSelf: 'center'
  },
  context: {
    flexDirection: 'row',
    paddingVertical: 20,
    justifyContent: 'space-between'
  },
  date: {
    flex: 1,
    flexWrap: 'wrap',
    fontSize: 15,
    color: '#aaaaaa',
    alignSelf: 'center'
  },
});

module.exports = MessageTypeRow;
