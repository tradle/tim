'use strict';

var React = require('react-native');
var utils = require('../utils/utils');
var constants = require('@tradle/constants');
var cnt = 0;
var {
  Text,
  View
} = React;

var RowMixin = {
  addDateProp(dateProp, style) {
    var resource = this.props.resource;
    var properties = utils.getModel(resource[constants.TYPE] || resource.id).value.properties;
    // var style = styles.description;
    if (properties[dateProp]  &&  properties[dateProp].style)
      style = [style, properties[dateProp].style];
    var val = utils.formatDate(new Date(resource[dateProp])); //utils.getFormattedDate(new Date(resource[dateProp]));

    return !properties[dateProp]  ||  properties[dateProp].skipLabel
        ? <Text style={style} key={this.getNextKey()}>{val}</Text>
        : <View style={{flexDirection: 'row'}} key={this.getNextKey()}><Text style={style}>{properties[dateProp].title}</Text><Text style={style}>{val}</Text></View>

    return <Text style={[style]} numberOfLines={1} key={this.getNextKey()}>{val}</Text>;
  },
  getNextKey() {
    return this.props.resource[constants.ROOT_HASH] + '_' + cnt++
  },
  anyOtherRow(prop, backlink, styles) {
    var row;
    var resource = this.props.resource;
    var propValue = resource[prop.name];
    if (propValue  &&  (typeof propValue != 'string'))
      row = <Text style={style} numberOfLines={1}>{propValue}</Text>;
    else if (!backlink  &&  propValue  && (propValue.indexOf('http://') == 0  ||  propValue.indexOf('https://') == 0))
      row = <Text style={style} onPress={this.onPress.bind(this)} numberOfLines={1}>{propValue}</Text>;
    else {
      var val = prop.displayAs ? utils.templateIt(prop, resource) : propValue;
      let msgParts = utils.splitMessage(val);
      if (msgParts.length <= 2)
        val = msgParts[0];
      else {
        val = '';
        for (let i=0; i<msgParts.length - 1; i++)
          val += msgParts[i];
      }
      row = <Text style={style}>{val}</Text>;
    }
    return row;
  }
}
module.exports = RowMixin;
