'use strict';

var React = require('react-native');
var utils = require('../utils/utils');
var ArticleView = require('./ArticleView');
var MessageView = require('./MessageView');
var NewResource = require('./NewResource');
var PhotosList = require('./PhotosList');
var Icon = require('./FAKIconImage');
var extend = require('extend');
var groupByEveryN = require('groupByEveryN');
var constants = require('tradle-constants');

var {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  ListView,
  Component,
  View
} = React;

class MessageRow extends Component {
  constructor(props) {
    super(props);
    var dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });

    this.state = {
      resource: this.props.resource,
      dataSource: dataSource
      // viewStyle: {
      //   margin: 1,
      // },
      // cnt: 0
    }
  }
  render() {
    var resource = this.props.resource;
    var isModel = !resource[constants.TYPE];
    if (isModel  &&  resource.autoCreate)
      return <View style={{height: 0}} />;
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;
    var me = utils.getMe();
    var isMyMessage;
    if (!isModel  &&  !this.props.isAggregation) {
      var fromHash = utils.getId(resource.from);
      if (fromHash == me[constants.TYPE] + '_' + me[constants.ROOT_HASH]) 
        isMyMessage = true;      
    }
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
    else {
      if (isMyMessage  || !to  ||  !to.photos)
        ownerPhoto = <View style={[styles.cell, {marginVertical: 0}]} />
      else {
        var uri = utils.getImageUri(to.photos[0].url);
        ownerPhoto = <Image source={{uri: uri}} style={styles.msgImage} /> 
        hasOwnerPhoto = true;
      }
    }
    var renderedRow = [];
    var onPressCall;
    if (isModel) 
      onPressCall = this.props.onSelect;
    else
      onPressCall = this.formatRow(isMyMessage, model, resource, renderedRow);
    
    var photoUrls = [];
    var photoListStyle = {height: isModel ? 0 : 3};
    var addStyle, inRow;
    var noMessage = !resource.message  ||  !resource.message.length;
    if (!renderedRow.length) {
      var vCols = isModel 
                ? utils.getDisplayName(resource) 
                : noMessage ? null : utils.getDisplayName(resource, model.properties);
      if (vCols)                
        renderedRow = <Text style={isModel ? styles.modelTitle : styles.resourceTitle} numberOfLines={2}>{vCols}</Text>;
    }
    else if (!isModel) {
      var fromHash = resource.from.id;
      if (isMyMessage) { 
        if (!noMessage)
          addStyle = styles.myCell;
      }
      else {
        if (!model.style)
          addStyle = {padding: 5, borderRadius: 10, borderColor: '#cccccc', backgroundColor: '#ffffff', marginVertical: 2};
        // else
        //   addStyle = {padding: 5, borderRadius: 10};
      }
      if (model.style) 
        addStyle = [addStyle, {padding: 5, borderRadius: 10, backgroundColor: '#efffe5', borderWidth: 1, borderColor: '#deeeb4', marginVertical: 2}]; //model.style];
        // viewCols = <View style={styles.myCell}>{viewCols}</View>
    }
    var properties = model.properties;
    var verPhoto;
    if (!isModel  &&  properties.photos) {
      if (resource.photos) {
        var len = resource.photos.length;
        inRow = len === 1 ? 1 : (len == 2 || len == 4) ? 2 : 3;
        var style;
        if (inRow === 1)
          style = styles.bigImage;
        else if (inRow === 2)
          style = styles.mediumImage;
        else
          style = styles.image;
        for (var p of resource.photos) 
          photoUrls.push({url: utils.getImageUri(p.url)});
        
        photoListStyle = {
          flexDirection: 'row', 
          alignSelf: isMyMessage ? 'flex-end' : 'flex-start', 
          marginLeft: isMyMessage ? 30 : 55,
          borderRadius: 10,
          marginBottom: 3, 
        }
      }
      else
        verPhoto = <View style={{height: 0, width:0}} />
    }
    else if (isModel  &&  resource.owner  &&  resource.owner.photos) {
      var ownerImg = resource.owner.photos[0].url;
      var url = utils.getImageUri(ownerImg);
      verPhoto = <Image source={{uri: ownerImg}} style={styles.ownerImage} />
    }
    var rowStyle = isModel && model.style 
                 ? [styles.row, {backgroundColor: '#efffe5'}] 
                 : noMessage ? {} : styles.row;
    var val;
    var date;
    if (!isModel  &&  resource.time) {
      var previousMessageTime = this.props.previousMessageTime;      
      var showTime = !previousMessageTime  ||  this.props.isAggregation;

      if (!showTime)  {
        var prevDate = new Date(previousMessageTime);
        var curDate = new Date(resource.time);
        showTime = resource.time - previousMessageTime > 3600000 ||
                   prevDate.getDate()  !== curDate.getDate()  ||
                   prevDate.getMonth() !== curDate.getMonth() ||
                   prevDate.getYear()  !== curDate.getYear() 
      }

      if (showTime)
        val = utils.getFormattedDate(resource.time);
    }
    
    var date = val 
             ? <Text style={styles.date} numberOfLines={1}>{val}</Text>
             : <View />;

    var showMessageBody;
    if (!isModel  &&  noMessage) {
      if (hasOwnerPhoto) 
        showMessageBody = true;
    }
    else 
      showMessageBody = true;
    var messageBody;
    var isSimpleMessage = model.id === 'tradle.SimpleMessage';
    if (showMessageBody) {
        var viewStyle;
        if (!isModel) {
          viewStyle = {flexDirection: 'row', alignSelf: isMyMessage ? 'flex-end' : 'flex-start'};
          if (resource.message.length > 30  ||  !isSimpleMessage)
            viewStyle.width = 260;
        }  
        var verified = (resource.verifications  &&  resource.verifications.length)
                     ? <View style={styles.verificationCheck}>
                         <Icon name='ion|ios-checkmark-empty' size={25} style={styles.icon} />
                       </View>
                     : <View />
        messageBody = 
          <TouchableHighlight onPress={onPressCall ? onPressCall : () => {}} underlayColor='transparent'>
            <View style={[rowStyle, viewStyle]}>
              {isModel ? <View style={{paddingLeft: 10}}/> : ownerPhoto}
              <View style={addStyle ? [styles.textContainer, addStyle] : styles.textContainer}>
                <View style={{flex: 1}}>
                  {renderedRow}
               </View>
               {verified}
              </View>
              {!isModel ? <View/> : ownerPhoto}
            </View>
          </TouchableHighlight>      
    }
    else
      messageBody = <View style={{height: 7}}/>
    var len = photoUrls.length;
    var inRow = len ? (len === 1 ? 1 : (len % 2) ? 3 : 2) : 0;
    var photoStyle = {}; 
    if (inRow > 0) {
      if (inRow === 1)
        photoStyle = styles.bigImage;
      else if (inRow === 2)
        photoStyle = styles.mediumImage;
      else
        photoStyle = styles.image;
    }

    var viewStyle = { margin:1, backgroundColor: '#f7f7f7' }
      
    return (
      <View style={viewStyle} key={resource}>
        {date}
        {messageBody}
        <View style={photoListStyle}>
          <PhotosList photos={photoUrls} style={photoStyle} navigator={this.props.navigator} numberInRow={inRow} />    
        </View>  
      </View>
    );
  }
  onPress(event) {
    this.props.navigator.push({
      component: ArticleView,
      passProps: {url: this.props.resource.message}
    });
  }
  createNewResource(model) {
    resource = {
      'from': this.props.resource.to,
      'to': this.props.resource.from,
      'message': this.props.resource.message,
    }
    resource[constants.TYPE] = model.id;

    this.props.navigator.push({
      id: 4,
      title: model.title,
      component: NewResource,
      titleTextColor: '#7AAAC3',
      passProps:  {
        model: model,
        resource: resource
      }
    });    
  }

  verify(event) {
    var self = this;
    var resource = self.props.resource;
    var model = utils.getModel(resource[constants.TYPE]).value;
    this.props.navigator.push({
      id: 5,
      component: MessageView,
      backButtonTitle: 'Back',
      // rightButtonTitle: 'Edit',
      // onRightButtonPress: {
      //     title: 'Edit',
      //     component: NewResource,
      //     titleTextColor: '#7AAAC3',
      //     id: 4,
      //     passProps: {
      //       resource: resource,
      //       metadata: model,
      //       callback: this.props.onSelect,
      //       resourceKey: model.id + '_' + resource[constants.ROOT_HASH]
      //     }
      // }, 

      passProps: {resource: self.props.resource, verify: true},
      title: resource[constants.TYPE] == 'tradle.AssetVerification' ? 'Doc verification' : model.title
    });
  }
  formatRow(isMyMessage, model, resource, renderedRow) {
    var viewCols = model.gridCols || model.viewCols;
    if (!viewCols)
      return
    var verPhoto;
    var vCols = [];
    var first = true;
    var self = this;
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;

    var properties = model.properties;
    var noMessage = !resource.message  ||  !resource.message.length;
    var onPressCall;

    var isSimpleMessage = model.id === 'tradle.SimpleMessage';
    
    viewCols.forEach(function(v) {
      if (properties[v].type === 'array'  ||  properties[v].type === 'date') 
        return;
      var style = styles.resourceTitle; //(first) ? styles.resourceTitle : styles.description;
      if (isMyMessage) {
        style = [style, {justifyContent: 'flex-end', paddingLeft: 5}];
        if (isSimpleMessage)
          style.push({color: '#ffffff'});
      }

      if (properties[v].ref) {
        if (resource[v]) {
          vCols.push(<Text style={style} numberOfLines={first ? 2 : 1}>{resource[v].title}</Text>);
          first = false;
        }
        return;
      }

      if (resource[v]  &&  (resource[v].indexOf('http://') == 0  ||  resource[v].indexOf('https://') == 0)) {
        onPressCall = self.onPress.bind(self);
        vCols.push(<Text style={style} numberOfLines={first ? 2 : 1}>{resource[v]}</Text>);
      }
      else if (!model.autoCreate) {
        var val = (properties[v].displayAs) 
                ? utils.templateIt(properties[v], resource)
                : resource[v];
        if (model.properties.verifications  &&  !isMyMessage)                  
          onPressCall = self.verify.bind(self);
        vCols.push(<Text style={style} numberOfLines={first ? 2 : 1}>{val}</Text>)
      }
      else {
        if (!resource[v]  ||  !resource[v].length)
          return;
        var msgParts = utils.splitMessage(resource[v]);
        // Case when the needed form was sent along with the message
        if (msgParts.length === 2) {
          var msgModel = utils.getModel(msgParts[1]);
          if (msgModel) {
            if (!isMyMessage)
              onPressCall = self.createNewResource.bind(self, msgModel.value);
            vCols.push(<View>
                         <Text style={style}>{msgParts[0]}</Text>
                         <Text style={[style, {color: isMyMessage ? '#efffe5' : '#7AAAC3'}]}>{msgModel.value.title}</Text>
                       </View>);                  
            return;
          }
        }
        vCols.push(<Text style={style}>{resource[v]}</Text>);
      }
      first = false;
    }); 
    if (model.style) 
      vCols.push(<Text style={styles.verySmallLetters}>{model.title}</Text>);
    
    if (vCols  &&  vCols.length)
      extend(renderedRow, vCols);
    return onPressCall ? onPressCall : (isSimpleMessage ? null : this.props.onSelect);
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
    fontSize: 22,
    fontWeight: '400',
    marginVertical: 15,
  },
  resourceTitle: {
    flex: 1,
    flexWrap: 'wrap',
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 2,
  },
  date: {
    flex: 1,
    color: '#999999',
    fontSize: 12,
    alignSelf: 'center',
    marginTop: 10
  },
  row: {
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    flexDirection: 'row',
    // padding: 5,
  },
  cell: {
    // marginTop: 20,
    // marginBottom: 20,
    marginLeft: 10,
    // fontSize: 18
  },
  myCell: { 
    padding: 5, 
    // marginRight: 5,
    // marginLeft: 30,    
    justifyContent: 'flex-end', 
    borderRadius: 10, 
    backgroundColor: '#569bff',
    // color: '#ffffff'
  },
  msgImage: {
    backgroundColor: '#dddddd',
    height: 50,
    // marginLeft: 10,
    marginRight: 5,
    width: 50,
    borderRadius: 25,
    borderColor: '#cccccc',
    borderWidth: 1
  },
  bigImage: {
    width: 240,
    height: 280,
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
    color: '#b4c3cb'
  },
  icon: {
    width: 30,
    height: 30,
    color: '#28C2C0'
  },
  verificationCheck: {
    position: 'absolute', 
    top: -5, 
    right: 5    
  }
});

module.exports = MessageRow;
