'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var ArticleView =require('./ArticleView');
var {
  StyleSheet,
  ScrollView,
  Image, 
  View,
  Text,
  TextInput,
  Component
} = React;

var styles = StyleSheet.create({
  container: {
    marginTop: 60,
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 10,
  },
  itemColContainer: {
    flex: 1,
    paddingLeft: 10,
    flexWrap: 'wrap',
  },
  separator: {
    height: 1,
    backgroundColor: '#DDDDDD'
  },
  itemSeparator: {
    height: 1,
    backgroundColor: '#7AAAC3'
  },
  imageVerifiedBy: {
    width: 300,
    height: 50,
    alignSelf: 'stretch'
  },
  image: {
    width: 400,
    height: 350,
    alignSelf: 'stretch'
  },
  title: {
    fontSize: 18,
    margin: 5,
    marginBottom: 0,
    color: '#2E3B4E'
  },
  itemTitle: {
    fontSize: 16,
    margin: 5,
    marginBottom: 0,
    color: '#7AAAC3'
  },
  description: {
    fontSize: 18,
    margin: 5,
    color: '#656565',
  },
  photoBG: {
    backgroundColor: '#2E3B4E',
    alignItems: 'center',
  },
  buttonText: {
    marginTop: 20,
    fontSize: 18,
    color: '#2E3B4E',
    // alignSelf: 'center',
  },
  button: {
    marginTop: 20,
    marginBottom: 0,
    width: 100,
    // backgroundColor: '#eeeeee',
    padding: 10,
    // borderRadius: 10
  },
  rowContainer: {
    padding: 10
  }
});

class ResourceView extends Component {
   constructor(props) {
     this.state = {embedHeight: {height: 0}};
   }
   render() {
    var resource = this.props.resource;
    var photo = resource.photos && resource.photos.length 
              ? <Image source={{uri: resource.photos[0].url}} style={styles.image} /> 
              : <View />;
 
    var modelName = resource['_type'];
    var meta = utils.getModel(modelName).value;
    var vCols = meta.viewCols;

    if (!vCols)
      vCols = meta.properties;
    var self = this;
    var viewCols = vCols.map(function(p) {
      var val = resource[p];
      var pMeta = meta.properties[p];
      if (!val) {
        if (pMeta.displayAs) 
          val = utils.templateIt(pMeta, resource);      
        else
          return;
      }
      else if (pMeta.ref)
        val = val.title;
      else if (pMeta.type === 'date')
        val = utils.formatDate(val);

      if (!val)
        return <View></View>;
      var isDirectionRow;
      if (val instanceof Array) {
        var vCols = pMeta.viewCols;          
        var cnt = val.length;
        val = val.map(function(v) {
          var ret = [];
          var itemsMeta = pMeta.items.properties;

          for (var p in itemsMeta) {
            if (vCols  &&  vCols.indexOf(p) == -1)
              continue;
            var itemMeta = pMeta.items.properties[p];
            var value = (itemMeta.displayAs) ? utils.templateIt(itemMeta, v) : v[p];
            if (!value)
              continue;

            ret.push(
              <View>
               <View style={value.length > 60 ? styles.itemColContainer : styles.itemContainer}>
                 <Text style={itemMeta.skipLabel ? {height: 0} : styles.itemTitle}>{itemMeta.skipLabel ? '' : utils.makeLabel(p)}</Text>
                 <Text style={styles.description}>{value}</Text>                 
               </View>
                <View style={styles.separator}></View>
             </View>);
          } 
          return (
            <View>
               {ret}
               {cnt == 1 ? <View></View> : <View style={styles.itemSeparator}></View>}
            </View>
          )
        });        
      } 
      else if (val.indexOf('http://') == 0  ||  val.indexOf('https://') === 0)
        val = <Text onPress={self.onPress.bind(self, val)} style={styles.description}>{val}</Text>;
      else {
        if (val.length < 40)
          isDirectionRow = true;
        val = <Text style={[styles.description, isDirectionRow ? {alignSelf: 'flex-end'} : {alignSelf: 'flex-start'}]}>{val}</Text>;
      }
      
      return (<View style={{padding:5}}>
               <View style={[styles.textContainer, isDirectionRow ? {flexDirection: 'row'} : {flexDirection: 'column'}]}>
                 <Text style={styles.title}>{meta.properties[p].title || utils.makeLabel(p)}</Text>
                 {val}
               </View>
                <View style={styles.separator}></View>
             </View>
             );
    });
                  // <TextInput style={self.state.embedHeight} value={'<iframe width="420" height="315" src="https://barclays.com/embed/aifSjuyeE5M" frameborder="0" allowfullscreen></iframe>'}/>
    var embed = modelName === 'tradle.AssetVerification' 
              ? <View style={{marginLeft: 15}}>
                  <Text style={{fontSize: 20, paddingTop: 15, paddingBottom: 15, color: '#2E3B4E'}}>Verified By</Text>
                  <Image style={styles.imageVerifiedBy} source={{uri: 'http://upload.wikimedia.org/wikipedia/en/thumb/7/7e/Barclays_logo.svg/391px-Barclays_logo.svg.png'}}/>
                  <Text style={styles.buttonText} onPress={self.showEmbed.bind(self)}>Embed</Text>
                  <View style={styles.separator}></View>
                  <Text style={self.state.embedHeight}>{'<iframe width="420" height="315" src="https://tradle.io/embed/aifSjuyeE5M" frameborder="0" allowfullscreen></iframe>'}</Text>
                  <View style={{height: 50}} />
                </View>
              : <View></View>  
    return (
      <ScrollView  ref='this' style={styles.container}>
      <View style={styles.page}>
        <View style={styles.photoBG}>
          {photo}
        </View>
        <View style={styles.rowContainer}>    
          {viewCols}
        </View>
        {embed}
      </View>
      </ScrollView>
    );
  }
  onPress(url) {
    this.props.navigator.push({
      id: 7,
      component: ArticleView,
      passProps: {url: url}
    });
  } 
  showEmbed() {
    this.setState({embedHeight: {height: 60, padding: 5, marginRight: 10, borderColor: '#2E3B4E', backgroundColor: '#eeeeee'}});
  }
}
module.exports = ResourceView;