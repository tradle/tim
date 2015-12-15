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
var Icon = require('react-native-vector-icons/Ionicons');
var myStyles = require('../styles/styles');
var rStyles = require('../styles/registrationStyles');
var NewResourceMixin = require('./NewResourceMixin');
var reactMixin = require('react-mixin');
var Device = require('react-native-device');
var BG_IMAGE = require('../img/bg.png')
var equal = require('deep-equal')
// var KeyboardEvents = require('react-native-keyboardevents');
// var KeyboardEventEmitter = KeyboardEvents.Emitter;
var constants = require('@tradle/constants');
var UIImagePickerManager = require('NativeModules').UIImagePickerManager;

var Form = t.form.Form;
// Form.stylesheet = myStyles;

var {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  DeviceEventEmitter,
  StatusBarIOS,
  // LayoutAnimation,
  Component,
  Navigator,
  TouchableHighlight,

} = React;

class NewResource extends Component {
  constructor(props) {
    super(props);
    this.updateKeyboardSpace = this.updateKeyboardSpace.bind(this);
    this.resetKeyboardSpace = this.resetKeyboardSpace.bind(this);
    var r = {};
    if (props.resource)
      r = props.resource
    else {
      r[constants.TYPE] = props.model.id;
    }
    this.state = {
      resource: r,
      keyboardSpace: 0
    }
    var currentRoutes = this.props.navigator.getCurrentRoutes();
    var currentRoutesLength = currentRoutes.length;
    currentRoutes[currentRoutesLength - 1].onRightButtonPress = {
      stateChange: this.onSavePressed.bind(this)
    };
  }
  updateKeyboardSpace(frames) {
    // LayoutAnimation.configureNext(animations.layout.spring);
    // var height = frames.end ? frames.end.height : frames.endCoordinates.height
    var height = frames.endCoordinates ? frames.endCoordinates.height : 0
    this.setState({keyboardSpace: height});
  }

  resetKeyboardSpace() {
    // LayoutAnimation.configureNext(animations.layout.spring);
    this.setState({keyboardSpace: 0});
  }
  shouldComponentUpdate(nextProps, nextState) {
    return equal(this.state.resource, nextState.resource)
  }

  componentDidMount() {
    this.listenTo(Store, 'itemAdded');
    DeviceEventEmitter.addListener('keyboardWillShow', (e) => {
      this.updateKeyboardSpace(e)
    });

    DeviceEventEmitter.addListener('keyboardWillHide', (e) => {
      this.resetKeyboardSpace(e)
     // ...
    })
    // KeyboardEventEmitter.on(KeyboardEvents.KeyboardDidShowEvent, this.updateKeyboardSpace);
    // KeyboardEventEmitter.on(KeyboardEvents.KeyboardWillHideEvent, this.resetKeyboardSpace);
  }

  componentWillUnmount() {
    // KeyboardEventEmitter.off(KeyboardEvents.KeyboardDidShowEvent, this.updateKeyboardSpace);
    // KeyboardEventEmitter.off(KeyboardEvents.KeyboardWillHideEvent, this.resetKeyboardSpace);
  }
  itemAdded(params) {
    var resource = params.resource;
    if (!resource  ||  (params.action !== 'addItem'  &&  params.action !== 'addMessage'))
      return;
    if (params.error) {
      if (resource[constants.TYPE] == this.state.resource[constants.TYPE])
        this.setState({err: params.error, resource: resource, isRegistration: this.state.isRegistration});
      return;
    }
    // if registration or after editing your own profile
    // if (this.state.isRegistration  ||  (params.me  &&  resource[constants.ROOT_HASH] === params.me[constants.ROOT_HASH]))
    //   utils.setMe(params.me);
    var self = this;
    var title = utils.getDisplayName(resource, self.props.model.properties);
    var isMessage = this.props.model.interfaces  &&  this.props.model.interfaces.indexOf('tradle.Message') != -1;
    // When message created the return page is the chat window,
    // When profile or some contact info changed/added the return page is Profile view page
    if (this.props.callback) {
      // this.props.navigator.pop();
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
        rightButtonTitle: 'Done',
        backButtonTitle: 'Back',
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
    if (this.state.submitted)
      return
    this.state.submitted = true
    var resource = this.state.resource;
    var value = this.refs.form.getValue();
    if (!value) {
      value = this.refs.form.refs.input.state.value;
      if (!value) {
        this.state.submitted = false
        return;
      }
    }
    var required = this.props.model.required;
    if (!required) {
      required = []
      for (var p in this.props.model.properties) {
        if (p.charAt(0) !== '_')
          required.push(p)
      }
    }
    var msg = '';
    var noRequired;
    required.forEach((p) =>  {
      var v = value[p] ? value[p] : resource[p];
      var isDate = Object.prototype.toString.call(v) === '[object Date]'
      if (!v || (isDate  &&  isNaN(v.getTime())))  {
        var prop = this.props.model.properties[p]
        if (prop.items  &&  prop.items.backlink)
          return
        if ((prop.ref /*&& prop.ref !== 'tradle.Money'*/) ||  isDate  ||  prop.items) {
          if (resource && resource[p])
            return;
          if (msg.length == 0)
            msg += 'Invalid values for the properties: '
          else
            msg += ', ';
          msg += '\'' + this.props.model.properties[p].title + '\'';
        }
        else
          noRequired = true
      }
    })
    if (msg.length) {
      this.setState({ err: msg });
      this.state.submitted = false
      return;
    }
    if (noRequired) {
      this.state.submitted = false
      return;
    }

    if (!value) {
      var errors = this.refs.form.refs.input.getValue().errors;
      var msg = '';
      var errMsg = errors.forEach(function(err) {
         msg += ' ' + err.message;
      });
      this.setState({ err: msg });
      this.state.submitted = false
      return;
    }

    var json = JSON.parse(JSON.stringify(value));

    if (!resource) {
      resource = {};
      resource[constants.TYPE] = this.props.model.id;
    }
    var isRegistration = !utils.getMe()  && this.props.model.id === constants.TYPES.IDENTITY  &&  (!resource || !resource[constants.ROOT_HASH]);
    if (isRegistration)
      this.state.isRegistration = true;
    var params = {
      value: json,
      resource: resource,
      meta: this.props.model,
      isRegistration: isRegistration
    };
    if (this.props.additionalInfo)
      additionalInfo: additionalInfo

    Actions.addItem(params);
  }
  chooser(prop, propName, event) {
    var resource = this.state.resource;
    if (!resource) {
      resource = {};
      resource[constants.TYPE] = this.props.model.id;
    }
    var isFinancialProduct = this.props.model.subClassOf  &&  this.props.model.subClassOf == 'tradle.FinancialProduct';
    var value = this.refs.form.input;

    var filter = event.nativeEvent.text;
    var m = utils.getModel(prop.ref).value;
    var currentRoutes = this.props.navigator.getCurrentRoutes();
    this.props.navigator.push({
      title: m.title,
      titleTextColor: '#7AAAC3',
      id: 10,
      component: ResourceList,
      backButtonTitle: 'Back',
      sceneConfig: isFinancialProduct ? Navigator.SceneConfigs.FloatFromBottom : Navigator.SceneConfigs.FloatFromRight,
      passProps: {
        filter:      filter,
        prop:        propName,
        modelName:   prop.ref,
        resource:    resource,
        isRegistration: this.state.isRegistration,
        returnRoute: currentRoutes[currentRoutes.length - 1],
        callback:    this.setChosenValue.bind(this),
      }
    });
  }
  // setting chosen from the list property on the resource like for ex. Organization on Contact
  setChosenValue(propName, value) {
    var resource = this.state.resource;
    var id = value[constants.TYPE] + '_' + value[constants.ROOT_HASH]
    resource[propName] = {
      id: id,
      title: utils.getDisplayName(value, utils.getModel(value[constants.TYPE]).value.properties)
    }
    // resource[propName] = value;
    var data = this.refs.form.refs.input.state.value;
    if (data) {
      for (var p in data)
        if (!resource[p])
          resource[p] = data[p];
    }

    this.setState({
      resource: this.state.resource
    });
  }

  addFormValues() {
    var value = this.refs.form.getValue();
    var json = value ? JSON.parse(JSON.stringify(value)) : this.refs.form.refs.input.state.value;
    var resource = this.state.resource;
    if (!resource) {
      resource = {};
      resource[constants.TYPE] = this.props.model.id;
    }
    for (var p in json)
      if (!resource[p] && json[p])
        resource[p] = json[p];
    return resource;
  }

  onAddItem(propName, item) {
    if (!item)
      return;
    var resource = this.addFormValues();
    var items = resource[propName];
    if (!items) {
      items = [];
      resource[propName] = items;
    }
    items.push(item);
    this.setState({resource: resource, err: ''});
  }
  onNewPressed(bl) {
    // if (bl.items.backlink) {
    //   var model = utils.getModel(bl.items.ref).value;
    //   var resource = {};
    //   resource[constants.TYPE] = bl.items.ref;
    //   resource[bl.items.backlink] = this.props.resource;
    //   var passProps = {
    //     model: model,
    //     // callback: this.props.navigator.pop,
    //     resource: resource
    //   }
    //   this.props.navigator.push({
    //     id: 4,
    //     title: 'Add new ' + bl.title,
    //     backButtonTitle: 'Back',
    //     component: NewResource,
    //     rightButtonTitle: 'Done',
    //     passProps: passProps,
    //   });
    //   return;
    // }
    var resource = this.addFormValues();
    this.setState({resource: resource, err: ''});
    if (bl.name === 'photos') {
      this.showChoice();
      return;
    }
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
        chooser: this.chooser.bind(this),
        template: this.myCustomTemplate.bind(this),
        resource: this.state.resource,
        parentMeta: this.props.parentMeta,
        onAddItem: this.onAddItem.bind(this)
      }
    });
  }
  showChoice() {
    var self = this;
    UIImagePickerManager.showImagePicker({returnIsVertical: true}, (doCancel, response) => {
      if (doCancel)
        return;

      var item = {
        // title: 'photo',
        url: 'data:image/jpeg;base64,' + response.data,
        isVertical: response.isVertical,
        width: response.width,
        height: response.height
      };
      self.onAddItem('photos', item);
    });
  }

  render() {
    var props = this.props;
    var parentBG = {backgroundColor: '#7AAAC3'};
    var err = this.state.err;

    var resource = this.state.resource;
    var iKey = resource
             ? resource[constants.TYPE] + '_' + resource[constants.ROOT_HASH]
             : null;

    var meta =  props.model;
    if (this.props.setProperty)
      this.state.resource[this.props.setProperty.name] = this.props.setProperty.value;
    var data = {};
    var model = {};
    var arrays = [];
    extend(true, data, resource);
    var isMessage = meta.interfaces  &&  meta.interfaces.indexOf('tradle.Message') != -1;
    var isFinancialProduct = isMessage  &&  this.props.model.subClassOf && this.props.model.subClassOf === 'tradle.FinancialProduct'
    var showSendVerificationForm = false;
    var formToDisplay;
    if (isMessage) {
      var len = resource.message  &&  utils.splitMessage(resource.message).length;
      if (len < 2)
        showSendVerificationForm = true;
      else
        data.message = '';
    }
    var params = {
        meta: meta,
        data: data,
        chooser: this.chooser.bind(this),
        model: model,
        items: arrays,
        // onSubmitEditing: this.onSavePressed.bind(this),
        onEndEditing: this.onEndEditing.bind(this),
        // onChange: this.onChange.bind(this),
        template: this.myCustomTemplate.bind(this),
      };
    if (this.props.editCols)
      params.editCols = this.props.editCols;
    var options = this.getFormFields(params);
    // var options = utils.getFormFields(params);

    var Model = t.struct(model);

    var errStyle = err ? styles.err : {'padding': 0, 'height': 0};
    var itemsMeta
    if (this.props.editCols) {
      itemsMeta = []
      this.props.editCols.forEach(function(p) {
        if (meta.properties[p].type === 'array')
          itemsMeta.push(meta.properties[p])
      })
    }
    else
      itemsMeta = utils.getItemsMeta(meta);

    var self = this;
    var arrayItems = [];

    for (var p in itemsMeta) {
      var bl = itemsMeta[p]
      if (bl.readOnly  ||  bl.items.backlink) {
        arrayItems.push (<View key={this.getNextKey()} />)
        continue
      }
      var counter;
      if (resource  &&  resource[bl.name]) {
        if (resource[bl.name].length)
          counter =
            <View style={styles.itemsCounter}>
              <Text>{resource[bl.name] ? resource[bl.name].length : ''}</Text>
            </View>;
        else if (model.required  &&  model.required.indexOf(bl.name) != -1)
          counter =
            <View>
              <Icon name='asterisk'  size={15}  color='#96415A'  style={styles.icon1}/>
            </View>;
        else
          counter = <View/>
      }
      else if (self.props.model.required  &&  self.props.model.required.indexOf(bl.name) != -1)
        counter =
          <View>
            <Icon name='asterisk'  size={15}  color='#96415A'  style={styles.icon1} />
          </View>;
      else
        counter = <View />
      var title = bl.title || utils.makeLabel(p)
      arrayItems.push (
        <TouchableHighlight style={styles.itemButton} underlayColor='transparent'
            onPress={self.onNewPressed.bind(self, bl)} key={this.getNextKey()}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{justifyContent: 'flex-start', flexDirection: 'row'}}>
              <Icon name='plus'   size={15}  color='#7AAAC3'  style={styles.icon1} />
              <Text style={styles.itemsText}>{bl.title}</Text>
            </View>
            {counter}
          </View>
        </TouchableHighlight>
      );
    }
    // var FromToView = require('./FromToView');
    var isRegistration = !utils.getMe()  &&  resource[constants.TYPE] === constants.TYPES.IDENTITY
    // if (isRegistration)
    //   Form.stylesheet = rStyles
    // else
    //   Form.stylesheet = myStyles

    // var style = isMessage ? {height: 570} : {height: 867};
    var style = isRegistration ? {marginTop: Device.height / 5} : {marginTop: 64};
    options.auto = 'placeholders';
    options.tintColor = 'red'
    var photoStyle = /*isMessage && !isFinancialProduct ? {marginTop: -35} :*/ styles.photoBG;

    var button = isRegistration
               ? <TouchableHighlight style={styles.thumbButton}
                      underlayColor='transparent' onPress={this.onSavePressed.bind(this)}>
                  <View style={styles.getStarted}>
                     <Text style={styles.getStartedText}>Welcome</Text>
                  </View>
                 </TouchableHighlight>
               : <View />

    // <FromToView resource={resource} model={meta} navigator={this.props.navigator} />
    var content =
      <ScrollView style={style}>
        <View style={styles.container}>
          <View style={{flexWrap: 'wrap'}}>
            <Text style={errStyle}>{err}</Text>
          </View>
          <View style={photoStyle}>
            <PhotoView resource={resource} />
          </View>
          <View style={isRegistration ? {marginLeft: 30, marginRight: 30, paddingTop: 30} : {'padding': 15}}>
            <Form ref='form' type={Model} options={options} value={data} onChange={this.onChange.bind(this)}/>
            {button}
            {arrayItems}
          </View>
          <View style={{height: 300}}/>
        </View>
      </ScrollView>
    // if (isMessage)
    //   return (
    //     <View>
    //       {content}
    //       <View style={{height: this.state.keyboardSpace}}>
    //       <View style={{marginTop: -35}}>
    //         <ChatMessage resource={resource}
    //                      model={meta}
    //                      onSubmitEditing={this.onSubmitEditing.bind(this)} />
    //       </View>
    //       </View>
    //     </View>
    //   );
    // else

    StatusBarIOS.setHidden(true);
    if (isRegistration) {
      var cTop = Device.height / 6

      var thumb = {
        width: Device.width / 2.2,
        height: Device.width / 2.2,
      }
          // <View>
          //   <Image source={BG_IMAGE} style={{position:'absolute', left: 0, top: 0, width: Device.width, height: Device.height}} />
          //   <View style={{alignSelf: 'center', marginTop: cTop}}>
          //     <View style={{opacity: 0.3}}>
          //       <Image style={thumb} source={require('../img/TradleW.png')}></Image>
          //       <Text style={styles.tradle}>Tradle</Text>
          //     </View>
          //   </View>
          //   {content}
          // </View>

      return (
          <View>
            <Image source={BG_IMAGE} style={{position:'absolute', left: 0, top: 0, width: Device.width, height: Device.height}} />
            <View style={{opacity: 0.7, marginLeft: 20, marginTop: 10, flexDirection: 'row'}}>
              <Image style={{width: 50, height: 50}} source={require('../img/TradleW.png')}></Image>
              <Text style={{fontSize: 25, marginTop: 10, paddingHorizontal: 10, color: '#cccccc'}}>Tradle</Text>
            </View>

            {content}
          </View>

        )
    }
    else
      return content;
  }
  onEndEditing(prop, event) {
    if (this.state.resource[prop]  ||  event.nativeEvent.text.length)
      this.state.resource[prop] = event.nativeEvent.text;
  }
  onChange(value) {
    this.state.resource = value;
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

    var toName = utils.getDisplayName(resource.to, utils.getModel(resource.to[constants.TYPE]).value.properties);
    var meta = utils.getModel(me[constants.TYPE]).value.properties;
    var meName = utils.getDisplayName(me, meta);
    var modelName = 'tradle.SimpleMessage';
    var value = {
      message: msg
              ?  model.isInterface ? msg : '[' + msg + '](' + model.id + ')'
              : '',

      from: {
        id: me[constants.TYPE] + '_' + me[constants.ROOT_HASH] + '_' + me[constants.CUR_HASH],
        title: meName
      },
      to: {
        id: resource.to[constants.TYPE] + '_' + resource.to[constants.ROOT_HASH] + '_' + resource.to[constants.CUR_HASH],
        title: toName
      },

      time: new Date().getTime()
    }
    value[constants.TYPE] = modelName;

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
  myCustomTemplate(params) {
    var contentStyle = {
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignSelf: 'stretch',
      borderWidth: 0.5,
      height: 36,
      borderColor: '#cccccc',
      padding: 8,
      marginBottom: 5,
      borderRadius: 4
    };

    var labelStyle = {color: '#cccccc', fontSize: 14};
    var textStyle = {color: '#000000', fontSize: 14};
    var resource = /*this.props.resource ||*/ this.state.resource
    var label, style

    if (resource && resource[params.prop]) {
      var m = utils.getId(resource[params.prop]).split('_')[0]
      var rModel = utils.getModel(m).value
      label = utils.getDisplayName(resource[params.prop], rModel.properties)
      if (!label)
        label = resource[params.prop].title
      style = textStyle
    }
    else {
      label = params.label
      style = labelStyle
    }
    return (
      <View>
        <TouchableHighlight underlayColor='transparent' onPress={params.chooser} key={this.getNextKey()}>
          <View style={contentStyle}>
            <Text style={style}>{label}</Text>
            <Icon name='ios-arrow-down'  size={15}  color='#96415A'  style={styles.icon1} />
          </View>
        </TouchableHighlight>
      </View>
    );
  }

  moneyTemplate(prop) {
    var containerStyle = {
      justifyContent: 'space-between',
      flexDirection: 'row',
      borderWidth: 0.5,
      height: 36,
      borderColor: '#cccccc',
      padding: 8,
      marginBottom: 5,
      borderRadius: 4
    };
    return
      <TouchableHighlight style={containerStyle} underlayColor='#7AAAC3'
          onPress={this.onNewPressed.bind(this, prop)} key={this.getNextKey()}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={{justifyContent: 'flex-start', flexDirection: 'row'}}>
            <Text style={styles.itemsText}>{prop.title}</Text>
            <Icon name='ios-arrow-down'  size={15}  color='#96415A' style={styles.icon1} key={this.getNextKey()}/>
          </View>
        </View>
      </TouchableHighlight>
  }

}
reactMixin(NewResource.prototype, Reflux.ListenerMixin);
// var animations = {
//   layout: {
//     spring: {
//       duration: 400,
//       create: {
//         duration: 300,
//         type: LayoutAnimation.Types.easeInEaseOut,
//         property: LayoutAnimation.Properties.opacity,
//       },
//       update: {
//         type: LayoutAnimation.Types.spring,
//         springDamping: 1,
//       },
//     },
//     easeInEaseOut: {
//       duration: 400,
//       create: {
//         type: LayoutAnimation.Types.easeInEaseOut,
//         property: LayoutAnimation.Properties.scaleXY,
//       },
//       update: {
//         type: LayoutAnimation.Types.easeInEaseOut,
//       },
//     },
//   },
// };
reactMixin(NewResource.prototype, NewResourceMixin);

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttons: {
    width: 100,
    alignSelf: 'center'
  },
  itemsText: {
    fontSize: 12,
    color: '#cccccc',
    // color: '#2E3B4E',
    alignSelf: 'center',
  },
  itemsCounter: {
    borderColor: '#2E3B4E',
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'center',
    paddingHorizontal: 5,
  },
  submitButton: {
    color: '#2B6493',
    fontSize: 17,
    backgroundColor: '#cccccc',
    height: 56,
    paddingHorizontal: 30,
    padding: 17,
    borderRadius: 10,
    borderColor: '#cccccc',
    borderWidth: 0.5,
  },

  itemButton: {
    height: 36,
    padding: 20,
    alignSelf: 'stretch',
    borderColor: '#cccccc',
    // borderColor: '#6093ae',
    borderWidth: 0.5,
    borderRadius: 8,
    marginBottom: 10,
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
  photoBG: {
    marginTop: -15,
    alignItems: 'center',
  },
  icon1: {
    width: 15,
    height: 15,
    marginRight: 5,
    marginLeft: -5,
  },
  icon: {
    width: 20,
    height: 20,
    marginLeft: -5,
    marginRight: 5,
  },
  err: {
    // paddingVertical: 10,
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    fontSize: 16,
    color: 'darkred',
  },
  getStartedText: {
    // color: '#f0f0f0',
    color: '#eeeeee',
    fontSize: 20,
    fontWeight:'500'
  },
  getStarted: {
    backgroundColor: '#467EAE', //'#2892C6',
    paddingVertical: 10,
    paddingHorizontal: 50
  },
  thumbButton: {
    marginTop: 20,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    // paddingHorizontal: 80,
  },
  tradle: {
    // color: '#7AAAC3',
    color: '#eeeeee',
    fontSize: 35,
    alignSelf: 'center',
  },

});

module.exports = NewResource;
