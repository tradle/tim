'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var api = require('../api/api');

var {
  StyleSheet,
  Image, 
  View,
  Text,
  TextInput,
  TouchableHighlight,
  Component
} = React;

class ViewCols extends Component {
  constructor(props) {
    super(props);
    this.state = {resource: this.props.resource}
  }
  render() {
    var resource = this.state.resource;
    var modelName = resource['_type'];
    var model = utils.getModel(modelName).value;
 
    var viewCols = this.getViewCols(resource, model, this.props.excludedProperties);
    var date = utils.getFormattedDate(new Date(resource[this.state.timeProp]));
    return (
      <View style={styles.rowContainer}>    
        {viewCols}
      </View>
    );
  }
  changePhoto(photo) {
    this.setState({currentPhoto: photo});
  }

  getViewCols(resource, model, excludedProperties) {
    var vCols = model.viewCols;
    if (excludedProperties) {
      var mapped = [];
      for (var p of excludedProperties) {
        if (model.properties[p]) {
          mapped.push(p);
          continue;
        }
        var prop = api.getCloneOf(p, model.properties);
        if (prop)
          mapped.push(prop);
      }
      excludedProperties = mapped;
    }
    if (!vCols)
      vCols = utils.objectToArray(model.properties);
    var self = this;
    var first = true;
    var viewCols = vCols.map(function(p) {
      if (excludedProperties  &&  excludedProperties.indexOf(p) !== -1)
        return;
      
      var val = resource[p];
      var pMeta = model.properties[p];
      if (!val) {
        if (pMeta.displayAs) 
          val = utils.templateIt(pMeta, resource);      
        else
          return;
      }
      else if (pMeta.ref)
        val = val['_type'] ? utils.getDisplayName(val, utils.getModel(val['_type']).value.properties) : val.title;
      else if (pMeta.type === 'date')
        val = utils.formatDate(val);

      if (!val)
        return <View></View>;
      var isDirectionRow;
      if (val instanceof Array) {
        var vCols = pMeta.viewCols;          
        var cnt = val.length;
        var counter = 0;
        var isPhoto = pMeta.cloneOf  &&  pMeta.cloneOf == 'tradle.Message.photos';
        if (isPhoto  &&  val.length == 1)
          return <View />; 
        val = val.map(function(v) {
          var ret = [];
          var itemsMeta = pMeta.items.properties;
          counter++; 
          if (isPhoto) {
            ret.push(
              <TouchableHighlight underlayColor='#ffffff' onPress={self.changePhoto.bind(self, v)}>
                <View style={styles.photoItemContainer}>
                  <Image style={styles.thumb} source={{uri: (v.url.indexOf('http') == -1 ? 'http://' + v.url : v.url)}} />
                  <Text style={styles.description}>{v.title}</Text>
                </View>
              </TouchableHighlight>
            ); 
          }
          else  
            for (var p in itemsMeta) {
              if (vCols  &&  vCols.indexOf(p) == -1)
                continue;
              var itemMeta = pMeta.items.properties[p];
              var value = (itemMeta.displayAs) ? utils.templateIt(itemMeta, v) : v[p];
              if (!value)
                continue;
              ret.push(
                <View>
                 <View style={value.length > 60 ? styles.itemColContainer : styles.itemContainer}>
                   <Text style={itemMeta.skipLabel ? {height: 0} : styles.itemTitle}>{itemMeta.skipLabel ? '' : utils.makeLabel(p)}</Text>
                   <Text style={styles.description}>{value}</Text>                 
                 </View>
               </View>);
            } 
          first = false;
          return (
            <View>
               {ret}
               {counter == cnt ? <View></View> : <View style={styles.itemSeparator}></View>}
            </View>
          )
        });        
      } 
      else if (val.indexOf('http://') == 0  ||  val.indexOf('https://') === 0)
        val = <Text onPress={self.onPress.bind(self, val)} style={styles.description}>{val}</Text>;
      else {
        if (val.length < 30)
          isDirectionRow = true;
        val = <Text style={[styles.description, {flexWrap: 'wrap'}]} numberOfLines={2}>{val}</Text>;
        // val = <Text style={[styles.description, isDirectionRow ? {alignSelf: 'flex-end'} : {alignSelf: 'flex-start'}]}>{val}</Text>;
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
}
var styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    // flexWrap: 'wrap'
  },
  photoItemContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 2,
    justifyContent: 'space-between'
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 10,
  },
  itemColContainer: {
    flex: 1,
    paddingLeft: 10,
    flexWrap: 'wrap',
  },
  separator: {
    height: 1,
    backgroundColor: '#DDDDDD'
  },
  itemSeparator: {
    height: 1,
    backgroundColor: '#D7E6ED'
  },
  imageVerifiedBy: {
    width: 300,
    height: 50,
    alignSelf: 'stretch'
  },
  title: {
    fontSize: 18,
    margin: 5,
    marginBottom: 0,
    color: '#2E3B4E'
  },
  itemTitle: {
    fontSize: 18,
    margin: 5,
    marginBottom: 0,
    color: '#7AAAC3'
  },
  description: {
    fontSize: 18,
    margin: 5,
    color: '#656565',
  },
  photoBG: {
    backgroundColor: '#2E3B4E',
    alignItems: 'center',
  },
  rowContainer: {
    padding: 10
  },
  thumb: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#D7E6ED'
  },
  date: {
    fontSize: 12,
    alignSelf: 'flex-end',
    color: '#b4c3cb'
  }
});

module.exports = ViewCols;