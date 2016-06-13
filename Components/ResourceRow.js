'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
import LinearGradient from 'react-native-linear-gradient';
var ArticleView = require('./ArticleView');
var constants = require('@tradle/constants');
var Icon = require('react-native-vector-icons/Ionicons');
var RowMixin = require('./RowMixin');
var ResourceList = require('./ResourceList')
var Swipeout = require('react-native-swipeout')
var reactMixin = require('react-mixin');
var equal = require('deep-equal')
var extend = require('extend')
var Actions = require('../Actions/Actions');

import {
  Image,
  PixelRatio,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  ActivityIndicatorIOS,
  processColor
} from 'react-native';

import React, { Component } from 'react'

class ResourceRow extends Component {
  constructor(props) {
    super(props);
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (Object.keys(this.props).length  !== Object.keys(nextProps).length)
      return true
    if (this.state || nextState) {
      if (this.state  &&  nextState) {
        if (Object.keys(this.state).length  !== Object.keys(nextState).length)
          return true
      }
      else
        return true
    }
    var opts = {strict: true}
    for (var p in this.props) {
      if (typeof this.props[p] === 'function') {
        if ('' + this.props[p] !== '' + nextProps[p])
          return true
      }
      else if (this.props[p] !== nextProps[p]) {
        if (!equal(this.props[p], nextProps[p], opts))
          return true
      }
    }
    if (!this.state  &&  !nextState)
      return false
    for (var p in this.state) {
      if (this.state[p] !== nextState[p]) {
        if (!equal(this.state[p], nextState[p], opts))
          return true
      }
    }
    return false
  }

  render() {
    var resource = this.props.resource;
    var photo;
    var isIdentity = resource[constants.TYPE] === constants.TYPES.PROFILE;
    var noImage;
    if (resource.photos &&  resource.photos.length) {
      var uri = utils.getImageUri(resource.photos[0].url);
      var params = {
        uri: utils.getImageUri(uri)
      }
      if (uri.indexOf('/var/mobile/') === 0)
        params.isStatic = true
      photo = <Image source={params} style={styles.cellImage}  key={this.getNextKey()} />;
    }
    else {
      if (isIdentity) {
        if (!resource.firstName  &&  !resource.lastName)
          return <View/>
        var name = (resource.firstName ? resource.firstName.charAt(0) : '');
        name += (resource.lastName ? resource.lastName.charAt(0) : '');
        photo = <LinearGradient colors={['#A4CCE0', '#7AAAc3', '#5E92AD']} style={styles.cellRoundImage}>
           <Text style={styles.cellText}>{name}</Text>
        </LinearGradient>
      }
      else  {
        var model = utils.getModel(resource[constants.TYPE]).value;
        var icon = model.icon;
        if (icon)
          photo = <View style={styles.cellImage}><Icon name={icon} size={35} style={styles.icon} /></View>
        else if (model.properties.photos)
          photo = <View style={styles.cellImage} />
        else {
          photo = <View style={styles.cellNoImage} />
          noImage = true
        }
      }
    }
    var orgPhoto;
    // if (isIdentity  &&  resource.organization) {
    //   if (resource.organization.photo)
    //     orgPhoto = <Image source={{uri: resource.organization.photo}} style={styles.orgIcon} />
    // }
    // if (!orgPhoto)
      orgPhoto = <View/>

    var onlineStatus = (resource.online)
                     ? <View style={styles.online}></View>
                     : <View style={[styles.online, {backgroundColor: 'transparent'}]}></View>

    var cancelResource = (this.props.onCancel)
                       ? <View>
                         <TouchableHighlight onPress={this.props.onCancel} underlayColor='transparent'>
                           <View>
                             <Icon name='close-circled'  size={30}  color='#B1010E'  style={styles.cancelIcon} />
                           </View>
                         </TouchableHighlight>
                         </View>
                       : <View />;
    var textStyle = noImage ? [styles.textContainer, {marginVertical: 7}] : styles.textContainer;
    // Grey out if not loaded provider info yet
    var isOpaque = resource[constants.TYPE] === constants.TYPES.ORGANIZATION && !resource.contacts
    if (isOpaque)
      return (
      <View key={this.getNextKey()} style={{opacity: 0.5}}>
        <View style={styles.row} key={this.getNextKey()}>
          {photo}
          {orgPhoto}
          {onlineStatus}
          <View style={[textStyle, {flexDirection: 'row', justifyContent: 'space-between'}]} key={this.getNextKey()}>
            {this.formatRow(resource)}
            <ActivityIndicatorIOS hidden='true' color='#629BCA'/>
          </View>
          {cancelResource}
        </View>
        <View style={styles.cellBorder}  key={this.getNextKey()} />
      </View>
        )
    else
      return (
      <Swipeout right={[{text: 'Hide', backgroundColor: 'red', onPress: this.hideResource.bind(this, resource)}]} autoClose={true} scroll={(event) => this._allowScroll(event)} >
        <View key={this.getNextKey()} style={{opacity: 1, justifyContent: 'center'}}>
          <TouchableHighlight onPress={this.props.onSelect} underlayColor='transparent' key={this.getNextKey()}>
            <View style={styles.row} key={this.getNextKey()}>
              {photo}
              {orgPhoto}
              {onlineStatus}
              <View style={textStyle} key={this.getNextKey()}>
                {this.formatRow(resource)}
              </View>
              {cancelResource}
            </View>
          </TouchableHighlight>
          {this.props.isOfficialAccounts
          ? <TouchableHighlight underlayColor='transparent' style={{position: 'absolute', right: 20, top: 25, backgroundColor: 'white'}} onPress={() => {
              this.props.navigator.push({
                component: ResourceList,
                title: translate("myDocuments"),
                backButtonTitle: translate('back'),
                passProps: {
                  modelName: constants.TYPES.FORM,
                  resource: this.props.resource
                }
              })
            }}>
              <View style={textStyle}>
                 {resource.numberOfForms
                    ? <View style={{flexDirection: 'row'}}>
                         <Icon name={'ios-paper-outline'} color={'#cccccc'} size={35} style={{marginTop: -5}}/>
                         <Text style={{fontWeight: '600', marginLeft: 0, marginTop: -10, color: '#cccccc'}}>{resource.numberOfForms}</Text>
                      </View>
                    : <View />
                 }
              </View>
            </TouchableHighlight>
            : <View />}

          <View style={styles.cellBorder}  key={this.getNextKey()} />
        </View>
      </Swipeout>
      );
  }
  hideResource(resource) {
    let r = {}
    extend(true, r, resource)
    r.hide = true
    Actions.addItem({resource: resource, value: r, meta: utils.getModel(resource[constants.TYPE]).value})
  }
  _allowScroll(scrollEnabled) {
    this.setState({scrollEnabled: scrollEnabled})
  }
  rowContent() {
    return
    <View style={styles.row} key={this.getNextKey()}>
      {photo}
      {orgPhoto}
      {onlineStatus}
      <View style={textStyle} key={this.getNextKey()}>
        {this.formatRow(resource)}
      </View>
      {cancelResource}
    </View>
  }
  formatRow(resource) {
    var self = this;
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;
    var viewCols = model.gridCols || model.viewCols;
    var renderedViewCols;
    if (!viewCols) {
      var vCols = utils.getDisplayName(resource, model.properties);
      if (vCols && vCols.length) {
        if (model.subClassOf  &&  model.subClassOf === 'tradle.Enum')
          vCols = utils.createAndTranslate(vCols, true)

        return <Text style={styles.resourceTitle} numberOfLines={2}>{vCols}</Text>;
      }
      else
        return <Text style={styles.resourceTitle} numberOfLines={2}>{model.title + ' ' + utils.getFormattedDate(resource.time)}</Text>;
    }
    var vCols = [];
    var properties = model.properties;
    var first = true
    var dateProp;
    var datePropIdx;
    var datePropsCounter = 0;
    var backlink;
    var cnt = 10;
    for (var i=0; i<viewCols.length; i++) {
      var v = viewCols[i];
      if (properties[v].type === 'array') {
        if (properties[v].items.backlink)
          backlink = v;
        continue;
      }
      if (properties[v].type !== 'date'  ||  !resource[v])
        continue;
      if (resource[v]) {
        if (v === 'dateSubmitted' || v === 'lastMessageTime') {
          dateProp = v;
          if (!datePropsCounter)
            datePropIdx = i;
          datePropsCounter++;
        }
      }
    }
    if (datePropsCounter > 1)
      dateProp = null;

    var isIdentity = resource[constants.TYPE] === constants.TYPES.PROFILE;
    viewCols.forEach(function(v) {
      if (v === dateProp)
        return;
      if (properties[v].type === 'array')
        return;

      if (!resource[v]  &&  !properties[v].displayAs)
        return;
      var style = first ? styles.resourceTitle : styles.description;
      if (isIdentity  &&  v === 'organization')
        style = [style, {alignSelf: 'flex-end', marginTop: 20}, styles.verySmallLetters];
      if (properties[v].style)
        style = [style, properties[v].style];
      var ref = properties[v].ref;
      if (ref) {
        if (resource[v]) {
          var row;
          if (ref == constants.TYPES.MONEY)
            row = <Text style={style} numberOfLines={first ? 2 : 1} key={self.getNextKey()}>{(resource[v].currency || CURRENCY_SYMBOL) + resource[v].value}</Text>
          else
            row = <Text style={style} numberOfLines={first ? 2 : 1} key={self.getNextKey()}>{resource[v].title}</Text>

          vCols.push(row);
        }
        first = false;
      }
      else if (properties[v].type === 'date') {
        if (!dateProp)
          vCols.push(self.addDateProp(v));
        else
          return;
      }
      else  {
        var row;
        if (resource[v]  &&  (typeof resource[v] != 'string'))
          row = <Text style={style} numberOfLines={1} key={self.getNextKey()}>{resource[v]}</Text>;
        else if (!backlink  &&  resource[v]  && (resource[v].indexOf('http://') == 0  ||  resource[v].indexOf('https://') == 0))
          row = <Text style={style} onPress={self.onPress.bind(self)} numberOfLines={1} key={self.getNextKey()}>{resource[v]}</Text>;
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
          row = <Text style={style} key={self.getNextKey()}>{val}</Text>;
        }
        if (first  &&  dateProp) {
          var val = utils.formatDate(new Date(resource[dateProp]), true);
          // var dateBlock = self.addDateProp(resource, dateProp, true);
          row = <View style={{flexDirection: 'row', justifyContent: 'space-between'}} key={self.getNextKey()}>
                  <View>{row}</View>
                  <View style={{marginTop: -7}}>
                    <Text style={styles.verySmallLetters}>{val}</Text>
                  </View>
                </View>
        }
        vCols.push(row);
        first = false;
      }
    });
    if (vCols  &&  vCols.length)
      renderedViewCols = vCols;
    else {
      var vCols = utils.getDisplayName(resource, model.properties);
      return <Text style={styles.resourceTitle} numberOfLines={2}>{vCols}</Text>;

    }
    if (!backlink)
      return renderedViewCols
    return [
      <TouchableHighlight key={this.getNextKey()} onPress={this.props.showRefResources.bind(this, resource, backlink)} underlayColor='transparent'>
        <View key={this.getNextKey()}>
          {renderedViewCols}
        </View>
      </TouchableHighlight>
    ];
  }
  onPress(event) {
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;
    var title = utils.makeTitle(utils.getDisplayName(this.props.resource, model.properties));
    this.props.navigator.push({
      id: 7,
      title: title,
      component: ArticleView,
      passProps: {url: this.props.resource.url}
    });
  }
}
reactMixin(ResourceRow.prototype, RowMixin);

var styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    alignSelf: 'center'
  },
  // TODO: remove when you figure out v-centering
  // HACK FOR VERTICAL CENTERING
  resourceTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '400',
    // paddingTop: 18,
    // marginBottom: 2,
  },
  description: {
    flex: 1,
    flexWrap: 'wrap',
    color: '#999999',
    fontSize: 14,
  },
  row: {
    backgroundColor: 'white',
    // justifyContent: 'space-around',
    flexDirection: 'row',
    padding: 5,
  },
  rowV: {
    // backgroundColor: 'white',
    // justifyContent: 'space-around',
    // flexDirection: 'row',
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
  cellRoundImage: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#7AAAc3',
    paddingVertical: 1,
    // borderColor: '#7AAAc3',
    borderRadius: 30,
    // borderWidth: 1,
    height: 60,
    marginRight: 10,
    width: 60,
    alignSelf: 'center'
  },
  cellText: {
    // marginTop: 12,
    // alignSelf: 'center',
    color: '#ffffff',
    fontSize: 20,
    backgroundColor: 'transparent'
  },
  cellImage: {
    backgroundColor: '#dddddd',
    height: 60,
    marginRight: 10,
    width: 60,
    borderColor: '#7AAAc3',
    borderRadius: 30,
    borderWidth: 1,
  },
  cellNoImage: {
    backgroundColor: '#dddddd',
    marginTop: 20,
    marginLeft: 10,
  },
  cellBorder: {
    backgroundColor: '#eeeeee',
    height: 1,
    marginLeft: 4,
  },
  cancelIcon: {
    width: 40,
    height: 40,
  },
  icon: {
    width: 40,
    height: 40,
    alignSelf: 'center',
    marginLeft: 10,
    marginTop: 7,
    color: '#7AAAc3'
  },
  // orgIcon: {
  //   width: 30,
  //   height: 30,
  //   borderWidth: 1,
  //   borderColor: '#7AAAc3',
  //   borderRadius: 15,
  //   marginLeft: -30,
  //   marginTop: 40,
  // },
  // orgImage: {
  //   width: 30,
  //   height: 30,
  //   borderWidth: 1,
  //   borderColor: '#7AAAc3',
  //   borderRadius: 15,
  //   marginRight: 10,

  //   alignSelf: 'center',
//    // position: 'absolute',
//    // marginLeft: 10,
//    // marginTop: 7,
  // },
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
  verySmallLetters: {
    fontSize: 12,
    alignSelf: 'flex-end',
    color: '#b4c3cb'
  },
});

module.exports = ResourceRow;
