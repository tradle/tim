'use strict';

var reactMixin = require('react-mixin');
var utils = require('../utils/utils');
var RowMixin = require('./RowMixin');
var reactMixin = require('react-mixin');
var extend = require('extend');
var equal = require('deep-equal')
var constants = require('@tradle/constants');
import Icon from 'react-native-vector-icons/Ionicons';

import React, { Component } from 'react'
import {
  ListView,
  StyleSheet,
  Text,
  Image,
  TouchableHighlight,
  View,
} from 'react-native'

class ItemsList extends Component {
  constructor(props) {
    super(props);
    var dataSource = new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      });
    this.state = {
      isLoading: utils.getModels() ? false : true,
      list: this.props.list,
      dataSource: dataSource.cloneWithRows(this.props.list),
      filter: this.props.filter,
      userInput: ''
    };
    var currentRoutes = this.props.navigator.getCurrentRoutes();
    var currentRoutesLength = currentRoutes.length;
    currentRoutes[currentRoutesLength - 1].onRightButtonPress = () => {
      props.callback(props.prop, this.state.list)
      props.navigator.popToRoute(props.returnRoute);
    }

  }

  cancelItem(item) {
    var list = [];
    extend(list, this.state.list);
    for (var i=0; i<list.length; i++) {
      if (equal(list[i], item)) {
        list.splice(i, 1);
        break;
      }
    }
    this.setState({
      list: list,
      dataSource: this.state.dataSource.cloneWithRows(list)
    })
  }

  renderRow(resource)  {
    var counter = this.props.resource[this.props.prop].length
    if (this.props.prop === 'photos')
      return (
        <View style={styles.row}>
          <View style={styles.textContainer} key={this.getNextKey()}>
            <Image source={{uri: resource.url}} style={styles.cellImage}  key={this.getNextKey()} />
            <View style={{marginTop: 15}}>
              <TouchableHighlight underlayColor='transparent' onPress={this.cancelItem.bind(this, resource)}>
                <Icon name={'android-close'} size={30} color='#D20000' />
              </TouchableHighlight>
            </View>
          </View>
          <View style={styles.separator}></View>
        </View>

        )
    return
      this.renderItem([resource], this.props.prop)

  }
  renderItem(val, pMeta) {
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
      vCols.forEach((p) =>  {
        var itemMeta = itemsMeta[p];
        if (!v[p]  &&  !itemMeta.displayAs)
          return
        if (itemMeta.displayName)
          return
        var value;
        if (itemMeta.displayAs)
          value = utils.templateIt(itemMeta, v)
        else if (itemMeta.type === 'date')
          value = utils.formatDate(v[p]);
        else if (itemMeta.type !== 'object') {
          if (p == 'photos') {
            var photos = [];
            ret.push(
               <PhotoList photos={v.photos} navigator={self.props.navigator} numberInRow={4} resource={this.props.resource}/>
            );
            return
          }
          else
            value = v[p];
        }
        else if (itemMeta.ref)
          value = v[p].title  ||  utils.getDisplayName(v[p], utils.getModel(itemMeta.ref).value.properties);
        else
          value = v[p].title;

        if (!value)
          return

        ret.push(
          <View style={{padding: 10}} key={self.getNextKey()}>
           <View style={styles.itemColContainer} key={self.getNextKey()}>
             <Text style={itemMeta.skipLabel ? {height: 0} : styles.title} key={self.getNextKey()}>{itemMeta.skipLabel ? '' : itemMeta.title || utils.makeLabel(p)}</Text>
             <Text style={styles.description} key={self.getNextKey()}>{value}</Text>
           </View>
         </View>
        );
      })
      return (
        <View key={self.getNextKey()}>
           {ret}
           {counter == cnt ? <View></View> : <View style={styles.itemSeparator}></View>}
        </View>
      )
    });
  }

  render() {
    if (this.state.isLoading)
      return <View/>
    return (
      <View style={styles.container}>
        <ListView ref='listview'
          dataSource={this.state.dataSource}
          renderRow={this.renderRow.bind(this)}
          removeClippedSubviews={false}
          automaticallyAdjustContentInsets={false}
          keyboardDismissMode='on-drag'
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false} />
      </View>
    );
  }

}
reactMixin(ItemsList.prototype, RowMixin);

var styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 64,
    marginHorizontal: 10,
    backgroundColor: 'white',
  },
  row: {
    backgroundColor: 'white',
    padding: 5,
  },
  textContainer: {
    flex: 1,
    padding: 5,
    // alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  separator: {
    height: 0.5,
    backgroundColor: '#cccccc',
    // flex: 40,
    marginTop: 5,

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
});

module.exports = ItemsList;

