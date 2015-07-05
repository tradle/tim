'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var NewItem = require('./NewItem');
var PhotoView = require('./PhotoView');
var ResourceList = require('./ResourceList');
var ResourceView = require('./ResourceView');
var ChatMessage = require('./ChatMessage');
var t = require('tcomb-form-native');
var extend = require('extend');
var Actions = require('../Actions/Actions');
var Store = require('../Store/Store');
var Reflux = require('reflux');
var reactMixin = require('react-mixin');
var Icon = require('FAKIconImage');
var myStyles = require('../styles/styles');
var KeyboardEvents = require('react-native-keyboardevents');
var KeyboardEventEmitter = KeyboardEvents.Emitter;

var Form = t.form.Form;
Form.stylesheet = myStyles;

var {
  StyleSheet,
  Image, 
  View,
  Text,
  TextInput,
  ScrollView,
  LayoutAnimation,
  Component,
  TouchableHighlight,
} = React;

class NewResource extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resource: props.resource,
      keyboardSpace: 0,
    }
    this.props.navigator.route.onRightButtonPress = {
      stateChange: this.onSavePressed.bind(this)
    };
  }
  updateKeyboardSpace(frames) {
    LayoutAnimation.configureNext(animations.layout.spring);
    this.setState({keyboardSpace: frames.end.height});
  }

  resetKeyboardSpace() {
    LayoutAnimation.configureNext(animations.layout.spring);
    this.setState({keyboardSpace: 0});
  }  

  componentDidMount() {
    this.listenTo(Store, 'itemAdded');
    KeyboardEventEmitter.on(KeyboardEvents.KeyboardDidShowEvent, this.updateKeyboardSpace);
    KeyboardEventEmitter.on(KeyboardEvents.KeyboardWillHideEvent, this.resetKeyboardSpace);
  }

  componentWillUnmount() {
    KeyboardEventEmitter.off(KeyboardEvents.KeyboardDidShowEvent, this.updateKeyboardSpace);
    KeyboardEventEmitter.off(KeyboardEvents.KeyboardWillHideEvent, this.resetKeyboardSpace);
  }
  itemAdded(params) {
    var resource = params.resource;
    if (!resource  ||  (params.action !== 'addItem'  &&  params.action !== 'addMessage'))
      return;
    if (params.error) {
      if (resource['_type'] == this.props.resource['_type'])
        this.setState({err: params.error, resource: resource});
      return;
    }
    // if registration or after editing your own profile 
    // if (this.state.isRegistration  ||  (params.me  &&  resource.rootHash === params.me.rootHash))
    //   utils.setMe(params.me);
    var self = this;
    var title = utils.getDisplayName(resource, self.props.model.properties);
    var isMessage = this.props.model.interfaces  &&  this.props.model.interfaces.indexOf('tradle.Message') != -1;
    // When message created the return page is the chat window, 
    // When profile or some contact info changed/added the return page is Profile view page
    if (this.props.callback) {
      this.props.navigator.pop();
      this.props.callback(resource);
      return;
    }
    if (isMessage) {
      this.props.navigator.pop();
      return;
    }
    var currentRoutes = self.props.navigator.getCurrentRoutes();
    var currentRoutesLength = currentRoutes.length;
    var navigateTo = (currentRoutesLength == 2)
             ? this.props.navigator.replace
             : this.props.navigator.replacePrevious

    navigateTo({
      id: 3,
      title: title,
      component: ResourceView,
      titleTextColor: '#7AAAC3',
      rightButtonTitle: 'Edit',
      backButtonTitle: 'Back',
      onRightButtonPress: {
        title: title,
        id: 4,
        component: NewResource,
        titleTextColor: '#7AAAC3',
        passProps: {
          model: self.props.model,
          resource: resource
        }
      },
      passProps: {
        resource: resource
      }
    });
    if (currentRoutesLength != 2)
      this.props.navigator.pop();  
  }
  onSavePressed() {
    var value = this.refs.form.getValue();
    if (!value)
      return;
    if (!value) {
      var errors = this.refs.form.refs.input.getValue().errors;
      var msg = '';
      var errMsg = errors.forEach(function(err) {
         msg += ' ' + err.message;
      }); 
      this.setState({ err: msg });
      return;
    }
    var json = JSON.parse(JSON.stringify(value));
    var resource = this.state.resource;
    if (!resource)
      resource = {'_type': this.props.model.id};
    var isRegistration = !utils.getMe()  && this.props.model.id === 'tradle.Identity'  &&  (!resource || !resource.rootHash);
    if (isRegistration)
      this.state.isRegistration = true;
    Actions.addItem(json, resource, this.props.model, isRegistration);
  }
  chooser(prop, propName, event) {
    var resource = this.state.resource;
    var filter = event.nativeEvent.text; 
    var m = utils.getModel(prop.ref).value;
    this.props.navigator.push({
      title: m.title,
      titleTextColor: '#7AAAC3',
      id: 10,
      component: ResourceList,
      passProps: {
        filter:      filter, 
        prop:        propName,
        modelName:   prop.ref,
        resource:    resource,
        callback:    this.setChosenValue.bind(this)
      }
    });
  }
  // setting chosen from the list property on the resource like for ex. Organization on Contact
  setChosenValue(propName, value) {
    this.state.resource[propName] = value;
    this.setState({
      resource: this.state.resource
    });
  }

  onAddItem(propName, item) {
    if (!item)
      return;
    var value = this.refs.form.getValue();
    var json = value ? JSON.parse(JSON.stringify(value)) : {};
    var resource = this.state.resource;
    if (!resource)
      resource = {'_type': this.props.model.id};
    var items = resource[propName];
    if (!items) {
      items = [];
      resource[propName] = items;
    }
    items.push(item);
    for (var p in json)
      if (!resource[p] && json[p])
        resource[p] = json[p];
    this.setState({resource: resource, err: ''});
  }
  onNewPressed(bl) {
    this.props.navigator.push({
      id: 6,
      title: 'Add new ' + bl.title,
      backButtonTitle: 'Back',
      component: NewItem,
      rightButtonTitle: 'Done',
      // onRightButtonPress: {
      //   stateChange: this.onAddItem.bind(this, bl, ),
      //   before: this.done.bind(this)
      // },
      passProps: {
        metadata: bl,
        resource: this.props.resource,
        parentMeta: this.props.parentMeta,
        onAddItem: this.onAddItem.bind(this)
      }
    });
  }

  render() {
    var props = this.props;
    var parentBG = {backgroundColor: '#7AAAC3'};
    var err = this.state.err;

    var resource = this.state.resource;
    var iKey = resource  
             ? resource['_type'] + '_' + resource.rootHash
             : null;

    var meta =  props.model;
    if (this.props.setProperty)
      this.state.resource[this.props.setProperty.name] = this.props.setProperty.value;
    var data = {};
    var model = {};
    var arrays = [];
    extend(true, data, resource);
    var isMessage = meta.interfaces  &&  meta.interfaces.indexOf('tradle.Message') != -1;
    var showSendVerificationForm = false;
    if (isMessage) {
      var len = resource.message  &&  utils.splitMessage(resource.message).length;
      if (len < 2) 
        showSendVerificationForm = true;
      else
        data.message = '';        
    }

    var options = utils.getFormFields({
        meta: meta, 
        data: data, 
        chooser: this.chooser.bind(this),
        model: model,
        items: arrays,
        onSubmitEditing: this.onSavePressed.bind(this)
        // onEndEditing: this.handleChange.bind(this)
      });
    
    var Model = t.struct(model);

    var errStyle = err ? styles.err : {'padding': 0, 'height': 0};
    var itemsMeta = utils.getItemsMeta(meta);
    var self = this;
    var arrayItems = itemsMeta.map(function(bl) {
      if (bl.readOnly)
        return <View/>
      var counter;
      if (resource  &&  resource[bl.name]) {
        if (resource[bl.name].length)
          counter = 
            <View style={styles.itemsCounter}><Text>{resource[bl.name] ? resource[bl.name].length : ''}</Text></View>;
        else if (model.required  &&  model.required.indexOf(bl.name) != -1)
          counter = 
            <View>
            <Icon name='fontawesome|asterisk'  size={20}  color='#96415A'  style={styles.icon}/>
            </View>;
        else
          counter = <View></View>    
      }
      else if (self.props.model.required  &&  self.props.model.required.indexOf(bl.name) != -1)
        counter = 
          <View>
            <Icon name='fontawesome|asterisk'  size={20}  color='#96415A'  style={styles.icon}/>
          </View>;
      else
        counter = <View></View>    

      return (
        <TouchableHighlight style={styles.itemButton} underlayColor='#7AAAC3'
            onPress={self.onNewPressed.bind(self, bl)}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{justifyContent: 'flex-start', flexDirection: 'row'}}>
              <Icon name='fontawesome|plus'   size={20}  color='#7AAAC3'  style={styles.icon} />
              <Text style={styles.itemsText}>{bl.title}</Text>
            </View>
            {counter}
          </View>
        </TouchableHighlight>
      );
    });
    var FromToView = require('./FromToView');
    var style = isMessage ? {height: 570} : {height: 867};
    style.marginTop = 60;
    options.auto = 'placeholders';
    options.tintColor = 'red'

    var content = <ScrollView style={style}>
                      <View style={styles.container}>
                        <Text style={errStyle}>{err}</Text>
                        <View style={styles.photoBG}>
                          <PhotoView resource={resource} />
                        </View>
                        <FromToView resource={resource} model={meta} navigator={this.props.navigator} />
                        <View style={{'padding': 15}}>
                          <Form ref='form' type={Model} options={options} value={data} />          
                          {arrayItems}
                        </View>
                        <View style={{height: 30}} />          
                      </View>
                    </ScrollView>
    if (isMessage) 
      return (
        <View>
          {content}
          <View style={{height: this.state.keyboardSpace}}>
          <View style={{marginTop: -35}}>
            <ChatMessage resource={resource} 
                         model={meta} 
                         onSubmitEditing={this.onSubmitEditing.bind(this)}
                         onEndEditing={this.onEndEditing.bind(this)} />
          </View>    
          </View>
        </View>
      );
    else
      return content;
  }
  onEndEditing(userInput) {
    this.setState({userInput: userInput});
  }

  onSubmitEditing(msg) {
    msg = msg ? msg : this.state.userInput;
    var assets = this.state.selectedAssets;
    var isNoAssets = utils.isEmpty(assets);
    if (!msg  &&  isNoAssets)
      return;
    var me = utils.getMe();
    var resource = {from: utils.getMe(), to: this.props.resource.to};
    var model = this.props.model;

    var toName = utils.getDisplayName(resource.to, utils.getModel(resource.to['_type']).value.properties);
    var meta = utils.getModel(me['_type']).value.properties;
    var meName = utils.getDisplayName(me, meta);
    var modelName = 'tradle.SimpleMessage';
    var value = {
      '_type': modelName,  
      message: msg 
              ?  model.isInterface ? msg : '[' + msg + '](' + model.id + ')'
              : '',

      from: {
        id: me['_type'] + '_' + me.rootHash + '_' + me.currentHash, 
        title: meName
      }, 
      to: {
        id: resource.to['_type'] + '_' + resource.to.rootHash + '_' + resource.to.currentHash,
        title: toName
      },

      time: new Date().getTime()
    }
    if (!isNoAssets) {
      var photos = [];
      for (var assetUri in assets) 
        photos.push({url: assetUri, title: 'photo'});
      
      value.photos = photos;
    }
    this.setState({userInput: '', selectedAssets: {}});
    // setTimeout(function() {
    //   this.setState({textValue: this.state.userInput, selectedAssets: {}});
    //   this.refs.chat.focus();
    // }.bind(this), 0);
    Actions.addMessage(value); //, this.state.resource, utils.getModel(modelName).value);
  }
}
reactMixin(NewResource.prototype, Reflux.ListenerMixin);
var animations = {
  layout: {
    spring: {
      duration: 400,
      create: {
        duration: 300,
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 1,
      },
    },
    easeInEaseOut: {
      duration: 400,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleXY,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    },
  },
};

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttons: { 
    width: 100,
    alignSelf: 'center'
  },
  itemsText: {
    fontSize: 18,
    color: '#2E3B4E',
    alignSelf: 'center',
  },
  itemsCounter: {
    borderColor: '#2E3B4E',
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'center',
    paddingHorizontal: 5,
  },
  itemButton: {
    height: 36,
    padding: 20,
    alignSelf: 'stretch',
    borderColor: '#6093ae',
    borderWidth: 0.5,
    borderRadius: 8,
    marginTop: 7,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    alignSelf: 'center',
  },
  button: {
    height: 36,
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderColor: '#6093ae',
    borderWidth: 1,
    borderRadius: 8,
    // alignSelf: 'stretch',
    justifyContent: 'center',
    margin: 10,
  },
  image: {
    width: 400,
    height: 350,
    alignSelf: 'stretch'
  },
  photoBG: {
    backgroundColor: '#2E3B4E',
    alignItems: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginLeft: -5,
    marginRight: 5,
  },
  err: {
    paddingTop: 30,
    paddingLeft: 20,
    fontSize: 20,
    color: 'darkred',
  },

});

module.exports = NewResource;
