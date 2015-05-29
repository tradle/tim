'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var ArticleView = require('./ArticleView');
var SearchScreen = require('./SearchScreen');
var Reflux = require('reflux');
var Store = require('../Store/Store');
var reactMixin = require('react-mixin');

var {
  StyleSheet,
  ScrollView,
  Image, 
  View,
  Text,
  TextInput,
  TouchableHighlight,
  Component
} = React;

class ResourceView extends Component {
  constructor(props) {
    this.state = {
      resource: props.resource,
      embedHeight: {height: 0}
    };
  }
  componentDidMount() {
    this.listenTo(Store, 'onResourceUpdate');
  }
  onResourceUpdate(list, resource) {
    if (resource  &&  this.props.resource.rootHash === resource.rootHash)
      this.setState({resource: resource});
  }
  changePhoto(photo) {
    this.setState({currentPhoto: photo});
  }
  showMoreLikeThis() {
    var self = this;
    var modelName = this.props.resource['_type'];
    this.props.navigator.push({
      title: utils.getModel(modelName).value.title,
      component: SearchScreen,
      id: 10,
      backButtonTitle: 'Back',
      passProps: {
        resource: utils.getMe(), 
        filter: '',
        isAggregation: true,
        modelName: modelName,
      }
    });
  }
  render() {
    var resource = this.state.resource;
    var hasPhoto = resource.photos && resource.photos.length; 
    var modelName = resource['_type'];
    var model = utils.getModel(modelName).value;

    var photo;
    var currentPhoto = this.state.currentPhoto || (resource.photos && resource.photos[0]);
    if (hasPhoto) {
      if (!model.interfaces  || currentPhoto) {
        var url = currentPhoto.url;
        var nextPhoto = resource.photos.length == 1
        if (resource.photos.length == 1)
          photo = <Image source={{uri: (url.indexOf('http') == 0 ? url : 'http://' + url)}} style={styles.image} />; 
        else {           
          var nextPhoto;
          var len = resource.photos.length;
          for (var i=0; i<len  &&  !nextPhoto; i++) {
            var p = resource.photos[i].url;
            if (p === url)
              nextPhoto = i === len - 1 ? resource.photos[0] : resource.photos[i + 1];
          }
          photo = <TouchableHighlight underlayColor='#ffffff' onPress={this.changePhoto.bind(this, nextPhoto)}>
                    <Image source={{uri: (url.indexOf('http') == 0 ? url : 'http://' + url)}} style={styles.image} />
                  </TouchableHighlight>
        }
      }
    }
    else
      photo = <View style={styles.image}/>;
 
    var vCols = model.viewCols;

    if (!vCols)
      vCols = model.properties;
    var self = this;
    var viewCols = vCols.map(function(p) {
      var val = resource[p];
      var pMeta = model.properties[p];
      if (!val) {
        if (pMeta.displayAs) 
          val = utils.templateIt(pMeta, resource);      
        else
          return;
      }
      else if (pMeta.ref)
        val = val['_type'] ? utils.getDisplayName(val, utils.getModel(val['_type']).value.properties) : val.title;
      else if (pMeta.type === 'date')
        val = utils.formatDate(val);

      if (!val)
        return <View></View>;
      var isDirectionRow;
      if (val instanceof Array) {
        var vCols = pMeta.viewCols;          
        var cnt = val.length;
        var counter = 0;
        var isPhoto = pMeta.cloneOf  &&  pMeta.cloneOf == 'tradle.Message.photos';
        if (isPhoto  &&  val.length == 1)
          return <View />; 
        val = val.map(function(v) {
          var ret = [];
          var itemsMeta = pMeta.items.properties;
          counter++; 
          if (isPhoto) 
            ret.push(
              <TouchableHighlight underlayColor='#ffffff' onPress={self.changePhoto.bind(self, v)}>
                <View style={styles.itemContainer}>
                  <Image style={styles.photo} source={{uri: (v.url.indexOf('http') == -1 ? 'http://' + v.url : v.url)}} />
                  <Text style={styles.description}>{v.title}</Text>
                </View>
              </TouchableHighlight>
            ); 
          else  
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
               </View>);
            } 
          return (
            <View>
               {ret}
               {counter == cnt ? <View></View> : <View style={styles.itemSeparator}></View>}
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
                 <Text style={styles.title}>{model.properties[p].title || utils.makeLabel(p)}</Text>
                 {val}
               </View>
                <View style={styles.separator}></View>
             </View>
             );
    });
    var verify = this.props.verify
               ? <View style={{flex: 1, paddingRight: 10}}>
                   <TouchableHighlight onPress={this.verify.bind(this)} underlayColor='#ffffff'>
                     <View style={[styles.button, {backgroundColor: '#7AAAC3', alignSelf: 'stretch'}]}>
                       <Text style={[styles.buttonText, {color: '#ffffff'}]}>Verify</Text>
                     </View>
                   </TouchableHighlight>
                 </View>
               : <View></View>  
                  // <TextInput style={self.state.embedHeight} value={'<iframe width='420' height='315' src='https://barclays.com/embed/aifSjuyeE5M' frameborder='0' allowfullscreen></iframe>'}/>
    var isMessage = model.interfaces  &&  model.interfaces.indexOf('tradle.Message') != -1;
    var moreLikeThis;
    if (isMessage) 
      moreLikeThis = 
        <View style={{flex: 2, paddingHorizontal: 10}}>
          <TouchableHighlight underlayColor='#ffffff' onPress={this.showMoreLikeThis.bind(this)}>
            <View style={[styles.button, {alignSelf: 'stretch'}]}><Text style={styles.buttonText}>{'More ' + model.title}</Text></View>           
          </TouchableHighlight>
        </View>
    else
      moreLikeThis = <View />
    var embed = /*modelName === 'tradle.AssetVerification' 
              ? <View style={{marginLeft: 15}}>
                  <Text style={{fontSize: 20, paddingTop: 15, paddingBottom: 15, color: '#2E3B4E'}}>Verified By</Text>
                  <Image style={styles.imageVerifiedBy} source={{uri: 'http://upload.wikimedia.org/wikipedia/en/thumb/7/7e/Barclays_logo.svg/391px-Barclays_logo.svg.png'}}/>
                  <Text style={styles.buttonText} onPress={self.showEmbed.bind(self)}>Embed</Text>
                  <View style={styles.separator}></View>
                  <Text style={self.state.embedHeight}>{"<iframe width='420' height='315' src='https://tradle.io/embed/aifSjuyeE5M' frameborder='0' allowfullscreen></iframe>"}</Text>
                  <View style={{height: 50}} />
                </View>
              :*/ <View></View>  
    return (
      <ScrollView  ref='this' style={styles.container}>
      <View style={styles.page}>
        <View style={styles.photoBG}>
          {photo}
        </View>
        <View style={styles.buttonsContainer}>
          {moreLikeThis}
          {verify}
        </View>
        <View style={styles.rowContainer}>    
          {viewCols}
        </View>
        {embed}
      </View>
      </ScrollView>
    );
  }
  verify() {
    this.props.navigator.pop();
    // var resource = this.props.resource;
    // var me = utils.getMe();
    // var owner = this.props.resource[toClone];
    // var verification = {
    //   message: {
    //     value: resource['_type'] + '_' + resource.rootHash;
    //     title: utils.getModel(this.props.modelName).value.title;
    //   }
    //   owner: {
    //     value: owner['_type'] + '_' + owner.rootHash;
    //     title: owner.formatted
    //   }
    //   verifier: { 
    //     value: me['_type'] + '_' : me.rootHash,
    //     title: me.formatted
    //   }
    // }
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
reactMixin(ResourceView.prototype, Reflux.ListenerMixin);

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
    justifyContent: 'space-between'
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
    backgroundColor: '#D7E6ED'
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
    fontSize: 18,
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
  buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  buttonText: {
    // marginTop: 20,
    fontSize: 18,
    color: '#2E3B4E',
    alignSelf: 'center',
  },
  button: {
    marginTop: 10,
    alignSelf: 'center',
    marginBottom: 10,
    // width: 100,
    backgroundColor: '#eeeeee',
    borderColor: '#cccccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10
  },
  rowContainer: {
    padding: 10
  },
  photo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#D7E6ED'
  },
});

module.exports = ResourceView;