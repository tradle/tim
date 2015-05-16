'use strict';

var React = require('react-native');
var utils = require('../utils/utils');
var moment = require('moment');

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
    var photo = resource.photos &&  resource.photos.length
              ? <Image source={{uri: resource.photos[0].url}} style={styles.cellImage} /> 
              : <View style={styles.cell}></View>

    return (
      <View>
        <TouchableHighlight onPress={this.props.onSelect}>
          <View style={styles.row}>
            {photo}
            <View style={styles.textContainer}>
              {this.formatRow(resource)}
            </View>
          </View>
        </TouchableHighlight>
        <View style={styles.cellBorder} />
      </View>
    );
  }
  formatRow(resource) {
    var self = this;
    var model = this.props.models['model_' + (resource['_type'] || resource.id)].value;
    var viewCols = model.gridCols || model.viewCols;
    var renderedViewCols;
    if (viewCols) {
      var vCols = [];
      var properties = model.properties;
      var first = true
      viewCols.forEach(function(v) {
        var style = (first) ? styles.resourceTitle : styles.description;
        if (properties[v].ref) {
          if (resource[v]) {
            vCols.push(<Text style={style} numberOfLines={first ? 2 : 1}>{resource[v].title}</Text>);
          }
        }
        else if (properties[v].type === 'array') 
          return;
        else if (properties[v].type === 'date') {
          var date = new Date(resource[v]);
          var dayDiff = moment(new Date()).dayOfYear() - moment(date).dayOfYear();
          var val;
          switch (dayDiff) {
          case 0:
            val = moment(date).fromNow();
            break;
          case 1:
            val = moment(date).format('[yesterday], h:mA');
            break;
          case 2:
            break;
          default:      
            val = moment(date).format('ddd, h:mA');
          }
          vCols.push(<Text style={style} numberOfLines={first ? 2 : 1}>{val}</Text>)
        }
        else  {
          if (resource[v]  &&  (resource[v].indexOf('http://') == 0  ||  resource[v].indexOf('https://') == 0))
            vCols.push(<Text style={style} onPress={self.onPress.bind(self)} numberOfLines={first ? 2 : 1}>{resource[v]}</Text>);
          else
            vCols.push(<Text style={style} numberOfLines={first ? 2 : 1}>{resource[v]}</Text>);
        }
        first = false;
      }); 
      if (vCols)
        renderedViewCols = vCols;
    }
    if (!viewCols) {
      var vCols = utils.getDisplayName(resource, model.properties);
      renderedViewCols = <Text style={styles.resourceTitle} numberOfLines={2}>{vCols}</Text>;
    }
    return renderedViewCols;
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
    color: '#999999',
    fontSize: 12,
  },
  row: {
    alignItems: 'center',
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
});

module.exports = ResourceRow;
