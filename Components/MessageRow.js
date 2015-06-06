'use strict';

var React = require('react-native');
var utils = require('../utils/utils');
var ArticleView = require('./ArticleView');
var ResourceView = require('./ResourceView');
var MessageView = require('./MessageView');
var NewResource = require('./NewResource');
var moment = require('moment');
var extend = require('extend');

var {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  Component,
  View
} = React;

class MessageRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resource: this.props.resource
    }
  }
  render() {
    var resource = this.props.resource;
    var isModel = !resource['_type'];
    if (isModel  &&  resource.autoCreate)
      return <View style={{height: 0}} />;
    var model = utils.getModel(resource['_type'] || resource.id).value;
    var me = utils.getMe();
    var isMyMessage;
    if (!isModel  &&  !this.props.isAggregation) {
      var fromHash = resource[utils.getCloneOf('tradle.Message.from', model.properties)].id;
      if (fromHash == me['_type'] + '_' + me.rootHash) 
        isMyMessage = true;      
    }
    var to = this.props.to;
    var photo = isMyMessage  || !to  ||  !to.photos || isModel
              ? <View style={styles.cell}></View>
              : <Image source={{uri: (to.photos[0].url.indexOf('http') == 0 ? to.photos[0].url : 'http://' + to.photos[0].url)}} style={styles.msgImage} /> 

    var renderedRow = [];
    var onPressCall;
    if (isModel) 
      onPressCall = this.props.onSelect;
    else
      onPressCall = this.formatRow(isMyMessage, model, resource, renderedRow);
    
    var addStyle;
    if (!renderedRow.length) {
      var vCols = isModel ? utils.getDisplayName(resource) : utils.getDisplayName(resource, model.properties);
      renderedRow = <Text style={[styles.resourceTitle]} numberOfLines={2}>{vCols}</Text>;
    }
    else if (!isModel) {
      var fromHash = resource[utils.getCloneOf('tradle.Message.from', model.properties)].id;
      if (isMyMessage) 
        addStyle = styles.myCell;
      else
        addStyle = {padding: 5, borderRadius: 10};
      if (model.style)
        addStyle = [addStyle, model.style];
        // viewCols = <View style={styles.myCell}>{viewCols}</View>
    }
    var properties = model.properties;
    var verPhoto;
    if (properties.photos) {
      if (resource.photos)
        verPhoto = <Image source={{uri: (resource.photos[0].url.indexOf('http') == 0 ? resource.photos[0].url : 'http://' + resource.photos[0].url)}} style={styles.msgImage} />
      else
        verPhoto = <View style={{height: 0, width:0}} />
    }
    var rowStyle = isModel && model.style ? [styles.row, [model.style]] : styles.row;

    return (
      <View>
        <TouchableHighlight onPress={onPressCall ? onPressCall : () => {}} underlayColor={isMyMessage ? '#D7E6ED' : '#ffffff'}>
          <View style={[rowStyle, {flexDirection: 'row'}]}>
            {photo}
            <View style={addStyle ? [styles.textContainer, addStyle] : styles.textContainer}>
              <View style={{flex: 4, flexDirection: 'column'}}>
               {renderedRow}
             </View>
             <View style={{flex: 1}}>  
               {verPhoto}
             </View>  
            </View>
          </View>
        </TouchableHighlight>
        <View style={isModel ? {backgroundColor: '#cccccc'} : {backgroundColor: '#ffffff'}} />
      </View>
    );
  }
  onPress(event) {
    this.props.navigator.push({
      component: ArticleView,
      passProps: {url: this.props.resource.message}
    });
  }
  createNewResource(meta) {
    this.props.navigator.push({
      id: 4,
      title: meta.title,
      component: NewResource,
      titleTextColor: '#7AAAC3',
      passProps:  {
        metadata: meta,
        resource: {
          '_type': meta.id, 
          'from': this.props.resource.to,
          'to': this.props.resource.from,
          'message': this.props.resource.message,
        }
      }
    });    
  }
  verify(event) {
    var self = this;
    var resource = self.props.resource;
    var model = utils.getModel(resource['_type']).value;
    this.props.navigator.push({
      id: 3,
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
      //       resourceKey: model.id + '_' + resource.rootHash
      //     }
      // }, 

      passProps: {resource: self.props.resource, verify: true},
      title: resource['_type'] == 'tradle.AssetVerification' ? 'Doc verification' : model.title
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
    var model = utils.getModel(resource['_type'] || resource.id).value;

    var properties = model.properties;
    var onPressCall;
    viewCols.forEach(function(v) {
      var style = styles.resourceTitle; //(first) ? styles.resourceTitle : styles.description;
      if (isMyMessage)
        style = [style, {justifyContent: 'flex-end', paddingLeft: 5}];
      if (properties[v].ref) {
        if (resource[v]) 
          vCols.push(<Text style={style} numberOfLines={first ? 2 : 1}>{resource[v].title}</Text>);
      }
      else if (properties[v].type === 'array') 
        return;
      else if (properties[v].type === 'date') {
        style = styles.description
        var val = utils.getFormattedDate(new Date(resource[v]));
        // var date = new Date(resource[v]);
        // var dayDiff = moment(new Date()).dayOfYear() - moment(date).dayOfYear();
        // var val;
        // switch (dayDiff) {
        // case 0:
        //   val = moment(date).fromNow();
        //   break;
        // case 1:
        //   val = moment(date).format('[yesterday], h:mA');
        //   break;
        // default:      
        //   val = moment(date).format('ddd, h:mA');
        // }
        vCols.push(<Text style={style} numberOfLines={first ? 2 : 1}>{val}</Text>)
      }
      else  {
        if (resource[v]  &&  (resource[v].indexOf('http://') == 0  ||  resource[v].indexOf('https://') == 0)) {
          onPressCall = self.onPress.bind(self);
          vCols.push(<Text style={style} numberOfLines={first ? 2 : 1}>{resource[v]}</Text>);
        }
        else if (!model.autoCreate) {
          var val = (properties[v].displayAs) 
                  ? utils.templateIt(properties[v], resource)
                  : resource[v];
          if (model.properties.verifiedBy  &&  !isMyMessage)                  
            onPressCall = self.verify.bind(self);
          vCols.push(<Text style={style} numberOfLines={first ? 2 : 1}>{val}</Text>)
        }
        else {
          var msgParts = utils.splitMessage(resource[v]);
          if (msgParts.length === 2) {
            var msgModel = utils.getModel(msgParts[1]);
            if (msgModel) {
              if (!isMyMessage)
                onPressCall = self.createNewResource.bind(self, msgModel.value);
              vCols.push(<View>
                           <Text style={style}>{msgParts[0]}</Text>
                           <Text style={[style, {color: '#7AAAC3'}]}>{msgModel.value.title}</Text>
                         </View>);                  
              return;
            }
          }
          vCols.push(<Text style={style}>{resource[v]}</Text>);
        }
      }
      first = false;
    }); 
    if (model.style) {
      vCols.push(<Text style={styles.verySmallLetters}>{model.title}</Text>);
    }
    if (vCols)
      extend(renderedRow, vCols);
    return onPressCall ? onPressCall : (model.id === 'tradle.SimpleMessage') ? null : this.props.onSelect;
  }
}

var styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  resourceTitle: {
    flex: 1,
    flexWrap: 'wrap',
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 2,
  },
  description: {
    flex: 1,
    flexWrap: 'wrap',
    color: '#999999',
    fontSize: 12,
    marginLeft: 5
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
  msgImage: {
    backgroundColor: '#dddddd',
    height: 50,
    marginRight: 10,
    width: 50,
    borderRadius: 25,
    borderColor: '#cccccc',
    borderWidth: 2
  },
  photo: {
    backgroundColor: '#dddddd',
    height: 73,
    alignSelf: 'flex-end',
    marginRight: 5,
    flex:1, 
    width: 70
  },
  verySmallLetters: {
    fontSize: 12,
    alignSelf: 'flex-end',
    color: '#b4c3cb'
  }
});

module.exports = MessageRow;
