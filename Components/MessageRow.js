'use strict';

var React = require('react-native');
var utils = require('../utils/utils');
var ArticleView = require('./ArticleView');
var ResourceView = require('./ResourceView');
var NewResource = require('./NewResource');
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

class MessageRow extends Component {
  render() {
    var resource = this.props.resource;
    var isModel = !resource['_type'];
    if (isModel  &&  resource.autoCreate)
      return <View style={{height: 0}} />;
    var model = this.props.models['model_' + (resource['_type'] || resource.id)].value;
    
    var isMyMessage;
    if (!isModel) {
      var fromHash = resource[utils.getCloneOf('tradle.Message.from', this.props.models['model_' + resource['_type']].value.properties)].id;
      if (fromHash == this.props.me['_type'] + '_' + this.props.me.rootHash) 
        isMyMessage = true;      
    }
    var to = this.props.to;
    var photo = isMyMessage  || !to  ||  !to.photos.length || isModel
              ? <View style={styles.cell}></View>
              : <Image source={{uri: to.photos[0].url}} style={styles.msgImage} /> 

    var renderedRow;
    if (!isModel) 
      renderedRow = this.formatRow(isMyMessage, model, resource);
    
    var addStyle;
    if (!renderedRow) {
      var vCols = isModel ? utils.getDisplayName(resource) : utils.getDisplayName(resource, model.properties);
      renderedRow = <Text style={[styles.resourceTitle]} numberOfLines={2}>{vCols}</Text>;
    }
    else if (!isModel) {
      var fromHash = resource[utils.getCloneOf('tradle.Message.from', this.props.models['model_' + resource['_type']].value.properties)].id;
      if (fromHash == this.props.me['_type'] + '_' + this.props.me.rootHash) 
        addStyle = styles.myCell;
      else
        addStyle = {marginRight: 30, padding: 5, borderRadius: 10};
      if (model.style)
        addStyle = [addStyle, model.style];
        // viewCols = <View style={styles.myCell}>{viewCols}</View>
    }
    var properties = model.properties;
    var verPhoto;
    if (properties.photos) {
      if (resource.photos)
        verPhoto = <Image source={{uri: resource.photos[0].url}} style={styles.photo} />
      else
        verPhoto = <View style={{height: 0}} />
    }
    var rowStyle = isModel && model.style ? [styles.row, [model.style]] : styles.row;

    return (
      <View>
        <TouchableHighlight onPress={this.props.onSelect} underlayColor={isMyMessage ? '#D7E6ED' : '#ffffff'}>
          <View style={{flexDirection: 'row'}}>
          <View style={[rowStyle, {flex: 4}]}>
            {photo}
            <View style={addStyle ? [styles.textContainer, addStyle] : styles.textContainer}>
               {renderedRow}
            </View>
          </View>
            {verPhoto}
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
  verify(event) {
    var self = this;
    var models = self.props.models;
    var resource = self.props.resource;
    this.props.navigator.push({
      component: ResourceView,
      rightButtonTitle: 'Edit',
      onRightButtonPress: () => {
        var page = {
          metadata: models['model_' + resource['_type']].value,
          models: models,
          data: resource,
          db: self.props.db,
          me: self.props.me
        };

        self.props.navigator.push({
          title: 'Edit',
          component: NewResource,
          titleTextColor: '#7AAAC3',
          passProps: {page: page}
        });
      }, 

      passProps: self.props,
      title: resource['_type'] == 'tradle.AssetVerification' ? 'Doc verification' : models['model_' + resource['_type']].value.title
    });
  }
  formatRow(isMyMessage, model, resource) {
    var viewCols = model.gridCols || model.viewCols;
    if (!viewCols)
      return
    var verPhoto;
    var vCols = [];
    var first = true;
    var self = this;
    var renderedRow;
    var properties = model.properties;
    viewCols.forEach(function(v) {
      var style = styles.resourceTitle; //(first) ? styles.resourceTitle : styles.description;
      if (isMyMessage)
        style = [style, {justifyContent: 'flex-end', paddingLeft: 5}];
      if (properties[v].ref) {
        if (resource[v]) {
          vCols.push(<Text style={style} numberOfLines={first ? 2 : 1}>{resource[v].title}</Text>);
        }
      }
      else if (properties[v].type === 'array') 
        return;
      else if (properties[v].type === 'date') {
        style = styles.description
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
        default:      
          val = moment(date).format('ddd, h:mA');
        }
        vCols.push(<Text style={style} numberOfLines={first ? 2 : 1}>{val}</Text>)
      }
      else  {
        if (resource[v]  &&  (resource[v].indexOf('http://') == 0  ||  resource[v].indexOf('https://') == 0))
          vCols.push(<Text style={style} onPress={self.onPress.bind(self)} numberOfLines={first ? 2 : 1}>{resource[v]}</Text>);
        else if (!model.autoCreate) {
          var val = (properties[v].displayAs) 
                  ? utils.templateIt(properties[v], resource)
                  : resource[v];
          vCols.push(<Text style={style} onPress={self.verify.bind(self)} numberOfLines={first ? 2 : 1}>{val}</Text>)
        }
        else
          vCols.push(<Text style={style} numberOfLines={first ? 2 : 1}>{resource[v]}</Text>);
      }
      first = false;
    }); 
    if (model.style) {
      vCols.push(<Text style={styles.verySmallLetters}>{model.title}</Text>);
    }
    if (vCols)
      renderedRow = vCols;
    return renderedRow;
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
