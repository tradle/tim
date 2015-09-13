'use strict';

var React = require('react-native');
var utils = require('../utils/utils');
var constants = require('tradle-constants');
var STRUCTURED_MESSAGE_COLOR = '#F6FFF0';
var {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  Component,
  View
} = React;

class MessageTypeRow extends Component {
  constructor(props) {
    super(props);
    var resource = this.props.resource;
    this.state = {
      isModel: !resource[constants.TYPE]
    }
  }
  render() {
    var resource = this.props.resource;
    var isModel = this.state.isModel;
    if (isModel  &&  resource.autoCreate)
      return <View style={{height: 0}} />;
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;
    var me = utils.getMe();
    var to = this.props.to;
    var ownerPhoto, hasOwnerPhoto;
    if (isModel) {
      if (resource.owner  &&  resource.owner.photos)  {
        hasOwnerPhoto = true;
        var uri = utils.getImageUri(resource.owner.photos[0].url);
        ownerPhoto = 
          <View style={[styles.cell, {marginVertical: 2}]}>
            <Image source={{uri: uri}} style={styles.msgImage} />         
          </View>
      }
      else
        ownerPhoto = <View style={[styles.cell, {marginVertical: 20}]} />
    }  
    var renderedRow = [];
    var onPressCall = this.props.onSelect;
    
    var photoListStyle = {height: isModel ? 0 : 3};
    var addStyle, inRow;
    var noMessage = !resource.message  ||  !resource.message.length;
    var properties = model.properties;
    if (!renderedRow.length) {
      var vCols = utils.getDisplayName(resource);
      if (vCols)                
        renderedRow = <Text style={styles.modelTitle} numberOfLines={2}>{vCols}</Text>;
    }
    var verPhoto;
    if (resource.owner  &&  resource.owner.photos) {
      var ownerImg = resource.owner.photos[0].url;
      var url = utils.getImageUri(ownerImg);
      verPhoto = <Image source={{uri: ownerImg}} style={styles.ownerImage} />
    }
    var rowStyle = model.style 
                 ? [styles.row, {backgroundColor: STRUCTURED_MESSAGE_COLOR}] 
                 /*: noMessage ? {}*/ : styles.row;

    var messageBody = 
      <TouchableHighlight onPress={onPressCall ? onPressCall : () => {}} underlayColor='transparent'>
        <View style={rowStyle}>
          <View style={{paddingLeft: 10}}/>
          <View style={addStyle ? [styles.textContainer, addStyle] : styles.textContainer}>
            <View style={{flex: 1}}>
              {renderedRow}
           </View>
          </View>
          {ownerPhoto}
        </View>
      </TouchableHighlight>      

    var viewStyle = { margin:1, backgroundColor: '#f7f7f7' }
      
    return (
      <View style={viewStyle} key={resource}>
        {messageBody}
      </View>
    );
  }
}

var styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  modelTitle: {
    flex: 1,
    flexWrap: 'wrap',
    fontSize: 17,
    fontWeight: '400',
    marginVertical: 15,
  },
  resourceTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 2,
  },
  date: {
    flex: 1,
    color: '#999999',
    fontSize: 12,
    alignSelf: 'center',
    paddingTop: 10
  },
  row: {
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    flexDirection: 'row',
  },
  cell: {
    marginLeft: 10,
  },
  myCell: { 
    padding: 5, 
    justifyContent: 'flex-end', 
    borderRadius: 10, 
    backgroundColor: '#569bff',
  },
  warnImage: {
    backgroundColor: '#dddddd',
    height: 45,
    marginRight: 5,
    width: 45,
    borderRadius: 10,
    borderColor: '#cccccc',
    borderWidth: 1
  },
  msgImage: {
    backgroundColor: '#dddddd',
    height: 40,
    marginRight: 5,
    width: 40,
    borderRadius: 20,
    borderColor: '#cccccc',
    borderWidth: 1
  },
  bigImage: {
    width: 240,
    height: 280,
    margin: 1,
    borderRadius: 10
  },
  bigImageH: {
    width: 240,
    height: 170,
    margin: 1,
    borderRadius: 10
  },
  mediumImage: {
    width: 120,
    height: 120,
    margin: 1,
    borderRadius: 10
  },
  image: {
    width: 80,
    height: 80,
    margin: 1,
    borderRadius: 10
  },
  ownerImage: {
    backgroundColor: '#dddddd',
    height: 30,
    width: 30,
    marginTop: -5,
    position: 'absolute',
    right: 10,
    borderRadius: 15,
    borderColor: '#cccccc',
    borderWidth: 1
  },
  verySmallLetters: {
    fontSize: 12,
    alignSelf: 'flex-end',
    color: '#757575'
    // color: '#b4c3cb'
  },
});

module.exports = MessageTypeRow;
