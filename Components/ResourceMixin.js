'use strict';

var React = require('react-native')
var utils = require('../utils/utils');
var UIImagePickerManager = require('NativeModules').ImagePickerManager;
var extend = require('extend');
var translate = utils.translate
// var ResourceView = require('./ResourceView');
// var ResourceList = require('./ResourceList');
var PhotoList = require('./PhotoList')
var constants = require('@tradle/constants');

var {
  Text,
  View,
  StyleSheet,
  Image,
  Navigator
} = React;

var ResourceMixin = {
  showRefResource(resource, prop) {
    var id = utils.getId(resource)
    // if (resource[constants.TYPE] + '_' + resource[constants.ROOT_HASH] !== this.state.propValue)
    if (id !== this.state.propValue)
      return;
    var type = resource[constants.TYPE] || id.split('_')[0]
    var model = utils.getModel(type).value;
    var title = utils.getDisplayName(resource, model.properties);
    this.props.navigator.push({
      title: title,
      id: 3,
      component: require('./ResourceView'),
      titleTextColor: '#7AAAC3',
      // rightButtonTitle: 'Edit',
      backButtonTitle: translate('back'),
      passProps: {
        resource: resource,
        prop: prop,
        currency: this.props.currency
      }
    });
  },
  showResources(resource, prop) {
    this.props.navigator.push({
      id: 10,
      title: translate(prop, utils.getModel(resource[constants.TYPE]).value),
      titleTextColor: '#7AAAC3',
      backButtonTitle: translate('back'),
      component: require('./ResourceList'),
      passProps: {
        modelName: prop.items.ref,
        filter: '',
        resource: resource,
        prop: prop,
        currency: this.props.currency
      }
    });
  },

  renderItems(val, pMeta) {
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
               <PhotoList photos={v.photos} navigator={self.props.navigator} numberInRow={4} resource={resource}/>
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
          <View style={styles.item} key={self.getNextKey()}>
           <View style={styles.itemColContainer}>
             <Text style={itemMeta.skipLabel ? {height: 0} : styles.itemText}>{itemMeta.skipLabel ? '' : itemMeta.title || utils.makeLabel(p)}</Text>
             <Text style={styles.itemText}>{value}</Text>
           </View>
         </View>
        );
      })
      if (!ret.length  && v.title) {
        ret.push(
          <View style={{padding: 5}} key={self.getNextKey()}>
           <View style={[styles.itemColContainer, {flexDirection: 'row'}]}>
             {v.photo
              ? <Image source={{uri: v.photo}} style={styles.thumb} />
              : <View />
             }
             <Text style={styles.itemText}>{v.title}</Text>

           </View>
         </View>
        );
      }

      return (
        <View key={self.getNextKey()}>
           {ret}
           {counter == cnt ? <View></View> : <View style={styles.itemSeparator}></View>}
        </View>
      )
    });
  }
}

var styles = StyleSheet.create({
  thumb: {
    width:  25,
    height: 25,
    marginRight: 2,
    borderRadius: 5
  },
  itemText: {
    fontSize: 18,
    fontFamily: 'Avenir Next',
    marginBottom: 0,
    marginHorizontal: 7,
    color: '#000000',
  },
  itemSeparator: {
    height: 1,
    backgroundColor: '#ffffff',
    marginHorizontal: 15
  },
  itemColContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 20,
  },
  item: {
    paddingBottom: 7,
  }
})

module.exports = ResourceMixin;
