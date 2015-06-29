'use strict';

var React = require('react-native');
var utils = require('../utils/utils');
var moment = require('moment');
var Icon = require('FAKIconImage');

var {
  Image,
  PixelRatio,
  StyleSheet,
  Text,
  TouchableHighlight,
  Component,
  View
} = React;

class ResourceRow extends Component {
  render() {     
    var resource = this.props.resource;
    var photo;
    if (resource.photos &&  resource.photos.length) {
      var uri = resource.photos[0].url;
      photo = <Image source={{uri: utils.getImageUri(uri)}} style={styles.cellImage} /> 
    }
    else
      photo = <View style={styles.cellImage}></View>

    var onlineStatus = (resource.online) 
                     ? <View style={styles.online}></View>
                     : <View style={[styles.online, {backgroundColor: 'transparent'}]}></View>
    
    var cancelResource = (this.props.onCancel) 
                       ? <View style={{justifyContent: 'flex-end'}}>
                         <TouchableHighlight onPress={this.props.onCancel} underlayColor='transparent'>
                           <Icon name='ion|ios-close-empty'  size={30}  color='#9E0603'  style={styles.icon} /> 
                         </TouchableHighlight>
                         </View>  
                       : <View />; 
    
    return (
      <View>
        <TouchableHighlight onPress={this.props.onSelect}>
          <View style={styles.row}>
            {photo}
            {onlineStatus}
            <View style={styles.textContainer}>
              {this.formatRow(resource)}
              {cancelResource}
            </View>
          </View>
        </TouchableHighlight>
        <View style={styles.cellBorder} />
      </View>
    );
  }
  formatRow(resource) {
    var self = this;
    var model = utils.getModel(resource['_type'] || resource.id).value;
    var viewCols = model.gridCols || model.viewCols;
    var renderedViewCols;
    if (!viewCols) {
      var vCols = utils.getDisplayName(resource, model.properties);
      return <Text style={styles.resourceTitle} numberOfLines={2}>{vCols}</Text>;
    }
    var vCols = [];
    var properties = model.properties;
    var first = true
    var dateProp;
    var dataPropsCounter;
    viewCols.forEach(function(v) {
      if (properties[v].type !== 'date'  ||  !resource[v])
        return;
      dateProp = v;
      dataPropsCounter++;
    });
    if (dataPropsCounter > 1)
      dateProp = null;
    viewCols.forEach(function(v) {
      if (properties[v].type === 'array') 
        return;        
      if (!resource[v]  &&  !properties[v].displayAs)
        return;
      var style = (first) ? styles.resourceTitle : styles.description;
      if (properties[v].style)
        style = [style, properties[v].style];
      if (properties[v].ref) {
        if (resource[v]) {
          var row;
          if (dateProp) 
            row = <View style={{flexDirection: 'row'}}>
                    <Text style={style} numberOfLines={first ? 2 : 1}>{resource[v].title}</Text>
                    {self.addDateProp.bind(self, resource, dateProp)}
                  </View>
          else
            row = <Text style={style} numberOfLines={first ? 2 : 1}>{resource[v].title}</Text>
          vCols.push(row);
        }
        first = false;
      }
      else if (properties[v].type === 'date') {
        if (!dateProp)
          vCols.push(self.addDateProp(resource, v));
        else
          return;
      }
      else  {
        var row;
        if (resource[v]  &&  (resource[v].indexOf('http://') == 0  ||  resource[v].indexOf('https://') == 0))
          row = <Text style={style} onPress={self.onPress.bind(self)} numberOfLines={1}>{resource[v]}</Text>;
        else {          
          var val = properties[v].displayAs ? utils.templateIt(properties[v], resource) : resource[v];
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
        if (first  &&  dateProp) {
          var dateBlock = self.addDateProp(resource, dateProp);
          row = <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <View>{row}</View>
                  <View>{dateBlock}</View>
                </View>
        }
        vCols.push(row);
        first = false;
      }
    }); 
    if (vCols)
      renderedViewCols = vCols;
    return renderedViewCols;
  }
  addDateProp(resource, dateProp) {
    var properties = utils.getModel(resource['_type'] || resource.id).value.properties;
    var style = styles.description;
    if (properties[dateProp].style)
      style = [style, properties[dateProp].style];
    var val = utils.getFormattedDate(new Date(resource[dateProp]));
    return <Text style={[style, {alignSelf: 'flex-end'}]} numberOfLines={1}>{val}</Text>;

  }
}

var styles = StyleSheet.create({
  textContainer: {
    flex: 1,
  },
  resourceTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 2,
  },
  description: {
    flex: 1,
    flexWrap: 'wrap',
    color: '#999999',
    fontSize: 14,
  },
  row: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: 5,
  },
  cell: {
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 10,
    fontSize: 18
  },
  myCell: { 
    padding: 5, 
    marginLeft: 30,
    justifyContent: 'flex-end', 
    borderRadius: 10, 
    backgroundColor: '#D7E6ED'
  },
  cellImage: {
    backgroundColor: '#dddddd',
    height: 93,
    marginRight: 10,
    width: 60,
  },
  cellBorder: {
    backgroundColor: '#eeeeee',
    height: 1,
    marginLeft: 4,
  },
  icon: {
    width: 30,
    height: 30,
    position: 'absolute',
    right: 0
  },
  online: {
    backgroundColor: 'green',
    borderRadius: 6,
    width: 12,
    height: 12,
    position: 'absolute',
    top: 83,
    left: 8,
    borderWidth: 1,
    borderColor: '#ffffff'
  },
});

module.exports = ResourceRow;
