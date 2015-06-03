'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');

var MESSAGE_INTERFACE = 'tradle.Message';

var {
  StyleSheet,
  Image, 
  View,
  Text,
  Component
} = React;

class FromToView extends Component {
  render() {
    var resource = this.props.resource;    
    var model = utils.getModel(resource['_type']).value;
    if (!model.interfaces  ||  model.interfaces.indexOf(MESSAGE_INTERFACE) == -1) 
      return <View />;

    var photoProp = utils.getCloneOf(MESSAGE_INTERFACE + '.photos', model.properties);

    var hasPhoto = resource[photoProp]  &&  resource[photoProp].length; 
    if (!resource.to.photos && !resource.from.photos)
      return <View style={styles.container}>
               <Text>{resource.from.title}</Text>
               <Text>{resource.to.title}</Text>
             </View>      
    var style = hasPhoto ? {marginTop: -70} : {marginTop: 0};
    var toPhoto = resource.to.photos && resource.to.photos[0].url;
    if (toPhoto  &&  toPhoto.indexOf('http') === -1)
      toPhoto = 'http://' + toPhoto;
    var fromPhoto = resource.from.photos && resource.from.photos[0].url;
    if (fromPhoto  &&  fromPhoto.indexOf('http') === -1)
      fromPhoto = 'http://' + fromPhoto;
    return <View style={[styles.container, style]}>
               <View  style={{flexDirection: 'column'}}>
                 <Image style={styles.thumb} source={{uri: fromPhoto}} />
                 <Text>{resource.from.title}</Text>
               </View>
               <View  style={{flexDirection: 'column'}}>
                 <Image style={styles.thumb} source={{uri: toPhoto}} />
                 <Text>{resource.to.title}</Text>
               </View>
            </View>
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10
  },
  thumb: {
    width: 70,
    height: 70,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: '#D7E6ED'
  },
});

module.exports = FromToView;