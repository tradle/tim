'use strict';
 
var React = require('react-native');
var PhotoList = require('./PhotoList');
var ArticleView = require('./ArticleView');
var utils = require('../utils/utils');
var constants = require('tradle-constants');

var MONEY_TYPE = 'tradle.Money';
var DEFAULT_CURRENCY_SYMBOL = '$';

var {
  StyleSheet,
  Image, 
  View,
  ListView,
  LayoutAnimation,
  Text,
  TextInput,
  TouchableHighlight,
  Component
} = React;

class ShowPropertiesView extends Component {
  constructor(props) {
    super(props);
    var dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      resource: this.props.resource,
      viewStyle: {margin: 3},
      dataSource: dataSource
    }
  }

  render() {
    var viewCols = this.getViewCols();
    return (
      <View>    
        {viewCols}
      </View>
    );
  }

  getViewCols(resource, model) {
    var resource = this.state.resource;
    var modelName = resource[constants.TYPE];
    var model = utils.getModel(modelName).value;
    var vCols = model.viewCols;

    var excludedProperties = this.props.excludedProperties;
    var props = model.properties;
    if (excludedProperties) {
      var mapped = [];
      for (var p of excludedProperties) {
        if (props[p]) {
          mapped.push(p);
          continue;
        }
      }
      excludedProperties = mapped;
    }

    if (!vCols) {
      vCols = [];
      for (var p in props) {
        if (p != constants.TYPE)
          vCols.push(p)
      }
      // vCols = utils.objectToArray(model.properties);
      // var idx = vCols.indexOf(constants.TYPE);
      // delete vCols[idx];
    }
    var len = vCols.length; 
    for (var i=0; i<len; i++) {
      if (props[vCols[i]].displayName) {
        vCols.splice(i, 1);
        len--;
      }
    }
    var self = this;
    var first = true;
    var viewCols = vCols.map(function(p) {
      if (excludedProperties  &&  excludedProperties.indexOf(p) !== -1)
        return;
      
      var val = resource[p];
      var pMeta = model.properties[p];
      var isRef;
      var isDirectionRow;
      if (!val) {
        if (pMeta.displayAs) 
          val = utils.templateIt(pMeta, resource);      
        else
          return;
      }
      else if (pMeta.ref) {
        if (pMeta.ref == MONEY_TYPE) {
          if (typeof val === 'number') 
            val = DEFAULT_CURRENCY_SYMBOL + val; 
          
          else {
            var currencies = utils.getModel(pMeta.ref).value.properties.currency.oneOf;
            var valCurrency = val.currency;
            for (var c of currencies) {
              var currencySymbol = c[valCurrency];
              if (currencySymbol) {
                val = (valCurrency == 'USD') ? currencySymbol + val.value : val.value + currencySymbol;
                break;
              }
            }
          }
        }
        else {
          // ex. property that is referencing to the Organization for the contact
          var value = val[constants.TYPE] ? utils.getDisplayName(val, utils.getModel(val[constants.TYPE]).value.properties) : val.title;
               
          val = <TouchableHighlight onPress={self.props.showRefResource.bind(self, val, pMeta)} underlayColor='transparent'>
                 <Text style={styles.itemTitle}>{value}</Text>                 
               </TouchableHighlight>

          isRef = true;
          isDirectionRow = true;
        }
      }
      else if (pMeta.type === 'date')
        val = utils.formatDate(val);

      if (!val)
        return <View></View>;
      if (!isRef) {
        if (val instanceof Array) {
          if (pMeta.items.backlink)
            return <View />
          var vCols = pMeta.viewCols;          
          var cnt = val.length;
          val = self.renderItems(val, pMeta);
          first = false;
        }      
        else if (typeof val === 'number') {
          val = <Text style={styles.description}>{val}</Text>;        
          isDirectionRow = true;
        }
        else if (val.indexOf('http://') == 0  ||  val.indexOf('https://') === 0)
          val = <Text onPress={self.onPress.bind(self, val)} style={[styles.description, {color: '#7AAAC3'}]}>{val}</Text>;
        else {
          if (val.length < 30)
            isDirectionRow = true;
          val = <Text style={[styles.description]} numberOfLines={2}>{val}</Text>;
          // val = <Text style={[styles.description, {flexWrap: 'wrap'}]} numberOfLines={2}>{val}</Text>;
          // val = <Text style={[styles.description, isDirectionRow ? {alignSelf: 'flex-end'} : {alignSelf: 'flex-start'}]}>{val}</Text>;
        }
      }
      var separator = first
                    ? <View /> 
                    : <View style={styles.separator}></View>;

      var title = model.properties[p].skipLabel
                ? <View />
                : <Text style={styles.title}>{model.properties[p].title || utils.makeLabel(p)}</Text> 

      return (<View style={{padding:5}}>
               {separator}
               <View style={[styles.textContainer, isDirectionRow ? {flexDirection: 'row'} : {flexDirection: 'column'}]}>
                 {title}
                 {val}
               </View>
             </View>
             );
    });
    return viewCols;    
  }

  renderItems(val, pMeta) {
    var itemsMeta = pMeta.items.properties;
    if (!itemsMeta) {
      var ref = pMeta.items.ref;
      if (ref) {
        pMeta = utils.getModel(ref).value;
        itemsMeta = pMeta.properties;
      }
    }
    var counter = 0;
    var vCols = pMeta.viewCols;        
    if (!vCols) {
      vCols = [];
      for (var p in itemsMeta)
        vCols.push(p);
    }
    var cnt = val.length;
    var self = this;
    return val.map(function(v) {
      var ret = [];
      counter++; 
      for (var p of vCols) {
        var itemMeta = itemsMeta[p];
        if (!v[p]  &&  !itemMeta.displayAs)
          continue;
        if (itemMeta.displayName)
          continue;
        var value;
        if (itemMeta.displayAs) 
          value = utils.templateIt(itemMeta, v) 
        else if (itemMeta.type === 'date')
          value = utils.formatDate(v[p]);
        else if (itemMeta.type !== 'object') {
          if (p == 'photos') {
            var photos = [];
            ret.push(
               <PhotoList photos={v.photos} navigator={self.props.navigator} numberInRow={4}/>
            );
            continue;
          }          
          else
            value = v[p];
        }
        else if (itemMeta.ref) 
          value = v[p].title  ||  utils.getDisplayName(v[p], utils.getModel(itemMeta.ref).value.properties);
        else   
          value = v[p].title;

        if (!value)
          continue;

          // ret.push(
          //   <View>
          //     <TouchableHighlight onPress={self.showResource.bind(this, value)} underlayColor='transparent'>
          //       <View style={value.length > 60 ? styles.itemColContainer : styles.itemContainer}>
          //         <Text style={itemMeta.skipLabel ? {height: 0} : styles.itemTitle}>{itemMeta.skipLabel ? '' : utils.makeLabel(p)}</Text>
          //         <Text style={styles.description}>{value.title}</Text>                 
          //       </View>
          //      </TouchableHighlight>
          //  </View>);
        ret.push(
          <View>
           <View style={value.length > 60 ? styles.itemColContainer : styles.itemContainer}>
             <Text style={itemMeta.skipLabel ? {height: 0} : styles.itemTitle}>{itemMeta.skipLabel ? '' : itemMeta.title || utils.makeLabel(p)}</Text>
             <Text style={styles.description}>{value}</Text>                 
           </View>
         </View>);
      }
      return (
        <View>
           {ret}
           {counter == cnt ? <View></View> : <View style={styles.itemSeparator}></View>}
        </View>
      )
    });    
  }
  onPress(event) {
    var model = utils.getModel(this.props.resource[constants.TYPE]).value;
    this.props.navigator.push({
      id: 7,
      backButtonTitle: 'Back',
      title: utils.getDisplayName(this.props.resource, model.properties),
      component: ArticleView,
      passProps: {url: this.props.resource.url}
    });
  }
}

var styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    // flexWrap: 'wrap'
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  itemColContainer: {
    flex: 1,
    // flexWrap: 'wrap',
  },
  separator: {
    height: 1,
    backgroundColor: '#DDDDDD'
  },
  itemSeparator: {
    height: 1,
    backgroundColor: '#D7E6ED'
  },
  title: {
    fontSize: 18,
    marginTop: 3,
    marginBottom: 0,
    marginHorizontal: 7,
    color: '#2E3B4E'
  },
  itemTitle: {
    fontSize: 18,
    marginTop: 3,
    marginBottom: 0,
    marginHorizontal: 7,
    color: '#7AAAC3',
    // flexWrap: 'wrap'
  },
  description: {
    fontSize: 18,
    marginVertical: 3,
    marginHorizontal: 7,
    paddingLeft: 5,
    color: '#999999',
  },
  photo: {
    width: 86,
    height: 86,
    marginLeft: 1,
  },
  icon: {
    width: 40,
    height: 40
  }
});

module.exports = ShowPropertiesView;