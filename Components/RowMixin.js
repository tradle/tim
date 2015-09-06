'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var constants = require('tradle-constants');

var {
  Text,
  View
} = React;

var RowMixin = {
  getMoneyProp(ref, moneyProp, moneyValue) {
    var moneyValue = this.props.resource[moneyProp.name];
    var currencies = utils.getModel(ref).value.properties.currency.oneOf;
    var valCurrency = moneyValue.currency;
    for (var c of currencies) {
      var currencySymbol = c[valCurrency];
      if (currencySymbol) {
        var val = (valCurrency == 'USD') ? currencySymbol + moneyValue.value : moneyValue.value + currencySymbol;
        return properties[v].skipLabel
            ? <Text style={style} numberOfLines={first ? 2 : 1}>{val}</Text>
            : <View style={{flexDirection: 'row'}}><Text style={style}>{moneyProp.title}</Text><Text style={style} numberOfLines={first ? 2 : 1}>{val}</Text></View>
      }
    }        

  },
  addDateProp(dateProp, style) {
    var resource = this.props.resource;
    var properties = utils.getModel(resource[constants.TYPE] || resource.id).value.properties;
    // var style = styles.description;
    if (properties[dateProp].style)
      style = [style, properties[dateProp].style];
    var val = utils.formatDate(new Date(resource[dateProp])); //utils.getFormattedDate(new Date(resource[dateProp]));
    
    return properties[dateProp].skipLabel
        ? <Text style={style}>{val}</Text>
        : <View style={{flexDirection: 'row'}}><Text style={style}>{properties[dateProp].title}</Text><Text style={style}>{val}</Text></View>

    return <Text style={[style]} numberOfLines={1}>{val}</Text>;
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
