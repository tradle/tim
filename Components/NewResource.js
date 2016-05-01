'use strict';

var React = require('react-native');
var debug = require('debug')('NewResource')
var utils = require('../utils/utils');
var translate = utils.translate
var NewItem = require('./NewItem');
var ResourceList = require('./ResourceList')
var GridItemsList = require('./GridItemsList')
var PhotoView = require('./PhotoView');
var ResourceView = require('./ResourceView');
var ResourceMixin = require('./ResourceMixin');
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
var BG_IMAGE = require('../img/bg.png')
var equal = require('deep-equal')
var DeviceHeight
var DeviceWidth
var constants = require('@tradle/constants');
var UIImagePickerManager = require('NativeModules').ImagePickerManager;
var ENUM = 'tradle.Enum'
var LINK_COLOR, DEFAULT_LINK_COLOR = '#a94442'

var Form = t.form.Form;
var stylesheet = require('../styles/styles')

var {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  DeviceEventEmitter,
  // StatusBarIOS,
  AlertIOS,
  Dimensions,
  PropTypes,
  ActivityIndicatorIOS,
  Component,
  Navigator,
  TouchableHighlight,
  Animated
} = React;
DeviceHeight = Dimensions.get('window').height;
DeviceWidth = Dimensions.get('window').width

class NewResource extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    model: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    originatingMessage: PropTypes.object,
    editCols: PropTypes.string,
    callback: PropTypes.func,
    returnRoute: PropTypes.object,
    additionalInfo: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.updateKeyboardSpace = this.updateKeyboardSpace.bind(this);
    this.resetKeyboardSpace = this.resetKeyboardSpace.bind(this);
    if (this.props.bankStyle)
      LINK_COLOR = this.props.bankStyle.LINK_COLOR || DEFAULT_LINK_COLOR
    else
      LINK_COLOR = DEFAULT_LINK_COLOR
    var r = {};
    if (props.resource)
      extend(true, r, props.resource)
    else
      r[constants.TYPE] = props.model.id
    var isRegistration = !utils.getMe()  && this.props.model.id === constants.TYPES.PROFILE  &&  (!this.props.resource || !this.props.resource[constants.ROOT_HASH]);

    this.state = {
      resource: r,
      keyboardSpace: 0,
      // modalVisible: false,
      date: new Date(),
      isUploading: !isRegistration  &&  (!r[constants.ROOT_HASH] || Object.keys(r).length === 2),
      isRegistration: isRegistration,
      isLoadingVideo: false,
      isPrefilled: this.props.isPrefilled,
      modal: {},
      offSet: new Animated.Value(Dimensions.get('window').height)
    }
    var currentRoutes = this.props.navigator.getCurrentRoutes();
    var currentRoutesLength = currentRoutes.length;
    // currentRoutes[currentRoutesLength - 1].onRightButtonPress = {
    //   stateChange: this.onSavePressed.bind(this)
    // };

    currentRoutes[currentRoutesLength - 1].onRightButtonPress = this.onSavePressed.bind(this)

    this._contentOffset = { x: 0, y: 0 }
    this.scrollviewProps = {
      automaticallyAdjustContentInsets:true,
      scrollEventThrottle: 50,
      onScroll: this.onScroll.bind(this)
    };
  }
  updateKeyboardSpace(frames) {
    var height = frames.endCoordinates ? frames.endCoordinates.height : 0
    this.setState({keyboardSpace: height});
  }

  resetKeyboardSpace() {
    // LayoutAnimation.configureNext(animations.layout.spring);
    this.setState({keyboardSpace: 0});
  }
  shouldComponentUpdate(nextProps, nextState) {
    let isUpdate = nextState.err                             ||
           nextState.missedRequiredOrErrorValue              ||
           this.state.modal !== nextState.modal              ||
           this.state.prop !== nextState.prop                ||
           this.state.isUploading !== nextState.isUploading  ||
           this.state.isLoadingVideo !== nextState.isLoadingVideo      ||
           this.state.itemsCount != nextState.itemsCount     ||
          !equal(this.state.resource, nextState.resource)
    return isUpdate
           // nextState.isModalOpen !== this.state.isModalOpen  ||
           // this.state.modalVisible != nextState.modalVisible ||
  }
  componentWillMount() {
    if (this.state.resource[constants.ROOT_HASH]  &&  Object.keys(this.state.resource).length === 2)
      Actions.getItem(utils.getId(this.state.resource))
    else if (this.state.isUploading)
      Actions.getTemporary(this.state.resource[constants.TYPE])
  }

  componentDidMount() {
    this.listenTo(Store, 'itemAdded');
    DeviceEventEmitter.addListener('keyboardWillShow', (e) => {
      this.updateKeyboardSpace(e)
    });

    DeviceEventEmitter.addListener('keyboardWillHide', (e) => {
      this.resetKeyboardSpace(e)
    })
  }


  componentDidUpdate() {
    if (!this.state.missedRequiredOrErrorValue  ||  utils.isEmpty(this.state.missedRequiredOrErrorValue)) return

    let viewCols = this.props.model.viewCols
    let first
    for (let p in this.state.missedRequiredOrErrorValue) {
      if (!viewCols) {
        first = p
        break
      }

      if (!first || viewCols.indexOf(p) < viewCols.indexOf(first)) {
        first = p
      }
    }
    let ref = this.refs.form.getComponent(first) || this.refs[first]
    if (!ref) return

    if (!utils.isEmpty(this.state.missedRequiredOrErrorValue)  &&  !this.state.noScroll) {
      utils.scrollComponentIntoView(this, ref)
      this.state.noScroll = true
    }
  }

  itemAdded(params) {
    var resource = params.resource;
    if (params.action === 'languageChange') {
      this.props.navigator.popToTop()
      return
    }
    if (params.action === 'getItem'  &&  utils.getId(this.state.resource) === utils.getId(params.resource)) {
      this.setState({
        resource: params.resource,
        isUploading: false
      })
      return
    }
    if (params.action === 'getTemporary') {
      var r = {}
      extend(r, this.state.resource)
      extend(r, params.resource)
      this.setState({
        resource: r,
        isUploading: false
      })
      return
    }
    if (params.action === 'runVideo'  && this.state.isRegistration) {
      if (this.props.callback)
        this.setState({isLoadingVideo: true})
        return;
    }
    if (!resource  ||  (params.action !== 'addItem'  &&  params.action !== 'addMessage'))
      return;
    if (this.state.resource[constants.TYPE] !== resource[constants.TYPE])
      return
    if (params.error) {
      if (resource[constants.TYPE] == this.state.resource[constants.TYPE])
        this.setState({err: params.error, resource: resource, isRegistration: this.state.isRegistration});
      this.state.submitted = false
      return;
    }
    if (this.props.callback) {
      this.props.callback(resource);
      return;
    }

    var self = this;
    var title = utils.getDisplayName(resource, this.props.model.properties);
    var isMessage = this.props.model.interfaces  &&  this.props.model.interfaces.indexOf(constants.TYPES.MESSAGE) != -1;
    // When message created the return page is the chat window,
    // When profile or some contact info changed/added the return page is Profile view page
    if (isMessage) {
      if (this.props.originatingMessage  &&  resource[constants.ROOT_HASH] !== this.props.originatingMessage[constants.ROOT_HASH]) {
        var params = {
          value: {documentCreated: true},
          resource: this.props.originatingMessage,
          meta: utils.getModel(this.props.originatingMessage[constants.TYPE]).value
        }
        Actions.addItem(params)
      }
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
      rightButtonTitle: translate('edit'),
      backButtonTitle: translate('back'),
      onRightButtonPress: {
        title: title,
        id: 4,
        component: NewResource,
        rightButtonTitle: translate('done'),
        backButtonTitle: translate('back'),
        titleTextColor: '#7AAAC3',
        passProps: {
          model: self.props.model,
          resource: resource,
          currency: this.props.currency
        }
      },
      passProps: {
        resource: resource,
        currency: this.props.currency
      }
    });
    if (currentRoutesLength != 2)
      this.props.navigator.pop();
    this.state.submitted = false
  }
  onSavePressed() {
    if (this.state.submitted)
      return
    this.state.submitted = true
    this.state.noScroll = false
    var resource = this.state.resource;
    var value = this.refs.form.getValue();
    if (!value) {
      value = this.refs.form.refs.input.state.value;
      if (!value)
        value = {}
    }
    // value is a tcomb Struct
    var json = JSON.parse(JSON.stringify(value));
    this.checkEnums(json, resource)
    if (this.floatingProps) {
      for (var p in this.floatingProps) {
        json[p] = this.floatingProps[p]
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
    var missedRequiredOrErrorValue = {}
    var msg
    required.forEach((p) =>  {
      var v = json[p] ? json[p] : (this.props.resource ? this.props.resource[p] : null); //resource[p];
      if (v) {
        if (typeof v === 'string'  &&  !v.length) {
          v = null
          delete json[p]
        }
        else if (typeof v === 'object')  {
          let ref = this.props.model.properties[p].ref
          if (ref) {
            let rModel = utils.getModel(ref).value
            if (ref === constants.TYPES.MONEY) {
              if (!v.value || !v.value.length) {
                missedRequiredOrErrorValue[p] = translate('thisFieldIsRequired')
                return
              }
            }
            else if (!rModel.subClassOf  ||  rModel.subClassOf !== ENUM) {
              var units = this.props.model.properties[p].units
              if (units)
                v = v.value
              else {
                if (v.value === '')
                  v = null
                delete json[p]
              }
              return
            }
          }
        }
      }
      var isDate = Object.prototype.toString.call(v) === '[object Date]'
      if (!v  ||  (isDate  &&  isNaN(v.getTime())))  {
        var prop = this.props.model.properties[p]
        if (prop.items  &&  prop.items.backlink)
          return
        if ((prop.ref) ||  isDate  ||  prop.items) {
          if (resource && resource[p])
            return;
          missedRequiredOrErrorValue[p] = translate('thisFieldIsRequired') //'This field is required'
        }
        else if (!prop.displayAs)
          missedRequiredOrErrorValue[p] = translate('thisFieldIsRequired')
      }
    })
    var err = this.validateProperties(json)
    for (var p in err)
      missedRequiredOrErrorValue[p] = err[p]

    if (!utils.isEmpty(missedRequiredOrErrorValue)) {
      this.state.submitted = false
      var state = {
        missedRequiredOrErrorValue: missedRequiredOrErrorValue
      }
      if (msg)
        state.err = msg
      this.setState(state)
      return;
    }
    if (msg) {
      this.setState({ err: msg });
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

    // var json = JSON.parse(JSON.stringify(value));

    if (!resource) {
      resource = {};
      resource[constants.TYPE] = this.props.model.id;
    }
    // var isRegistration = !utils.getMe()  && this.props.model.id === constants.TYPES.PROFILE  &&  (!resource || !resource[constants.ROOT_HASH]);
    // if (isRegistration)
    //   this.state.isRegistration = true;
    var r = {}
    extend(true, r, resource)
    delete r.url
    var params = {
      value: json,
      resource: r,
      meta: this.props.model,
      isRegistration: this.state.isRegistration
    };
    if (this.props.additionalInfo)
      params.additionalInfo = additionalInfo
    Actions.addItem(params)
  }
  // HACK: the value for property of the type that is subClassOf Enum is set on resource
  // and it is different from what tcomb sets in the text field
  checkEnums(json, resource) {
    var props = this.props.model.properties
    for (var p in json) {
      if (!props[p]  ||  !props[p].ref)
        continue
      let m = utils.getModel(props[p].ref).value
      if (m.subClassOf  &&  m.subClassOf === ENUM)
        json[p] = resource[p]
    }
  }
  addFormValues() {
    var value = this.refs.form.getValue();
    // var json = value ? JSON.parse(JSON.stringify(value)) : this.refs.form.refs.input.state.value;
    var json = value ? value : this.refs.form.refs.input.state.value;
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
    var itemsCount = this.state.itemsCount ? this.state.itemsCount  + 1 : 1
    if (this.state.missedRequiredOrErrorValue)
      delete this.state.missedRequiredOrErrorValue[propName]
    this.setState({
      resource: resource,
      itemsCount: itemsCount,
      prop: propName
    });
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
    var blmodel = bl.items.ref ? utils.getModel(bl.items.ref).value : this.props.model
    if (bl.items.ref  &&  bl.allowToAdd) {
      this.props.navigator.push({
        id: 10,
        title: translate(bl, blmodel), // Add new ' + bl.title,
        backButtonTitle: translate('back'),
        component: ResourceList,
        passProps: {
          modelName: bl.items.ref,
          to: this.state.resource.to,
          resource: this.state.resource,
          isChooser: true,
          prop: bl,
          callback:    this.setChosenValue.bind(this),
          // onAddItem: this.onAddItem.bind(this),
          bankStyle: this.props.bankStyle,
          currency: this.props.currency
        }
      });
      return
    }
    this.props.navigator.push({
      id: 6,
      title: translate('addNew', translate(bl, blmodel)), // Add new ' + bl.title,
      backButtonTitle: translate('back'),
      component: NewItem,
      rightButtonTitle: translate('done'),
      // onRightButtonPress: {
      //   stateChange: this.onAddItem.bind(this, bl, ),
      //   before: this.done.bind(this)
      // },
      passProps: {
        metadata: bl,
        resource: this.state.resource,
        parentMeta: this.props.parentMeta,
        onAddItem: this.onAddItem.bind(this),
        currency: this.props.currency
      }
    });
  }
  showChoice() {
    var self = this;
    UIImagePickerManager.showImagePicker({
      returnIsVertical: true,
      chooseFromLibraryButtonTitle: __DEV__ ? 'Choose from Library' : null
    }, (response) => {
      if (response.didCancel)
        return;
      if (response.error) {
        console.log('ImagePickerManager Error: ', response.error);
        return
      }
      var item = {
        // title: 'photo',
        url: 'data:image/jpeg;base64,' + response.data,
        isVertical: response.isVertical,
        width: response.width,
        height: response.height,
        chooseFromLibraryButtonTitle: ''
      };
      self.onAddItem('photos', item);
    });
  }

  render() {
    if (this.state.isUploading)
      return <View/>
    var props = this.props;
    var parentBG = {backgroundColor: '#7AAAC3'};
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
    var isMessage = meta.interfaces  &&  meta.interfaces.indexOf(constants.TYPES.MESSAGE) != -1;
    var isFinancialProduct = isMessage  &&  this.props.model.subClassOf && this.props.model.subClassOf === constants.TYPES.FINANCIAL_PRODUCT
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
        model: model,
        items: arrays,
        onEndEditing: this.onEndEditing.bind(this),
      };
    if (this.props.editCols)
      params.editCols = this.props.editCols;
    if (this.state.isRegistration)
      params.isRegistration = true

    var options = this.getFormFields(params);

    var Model = t.struct(model);

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
    var itemsArray
    for (var p in itemsMeta) {
      var bl = itemsMeta[p]
      if (bl.readOnly  ||  bl.items.backlink) {
        arrayItems.push(<View key={this.getNextKey()} ref={bl.name} />)
        continue
      }
      let blmodel = meta
      var counter, count = 0
      itemsArray = null
      var isPhoto = false
      var count = resource  &&  resource[bl.name] ? resource[bl.name].length : 0
      if (count) {
        var items = []
        isPhoto = bl.name === 'photos'
        var arr = resource[bl.name]
        var n = isPhoto
              ? Math.min(arr.length, 7)
              : 3

        for (var i=0; i<n; i++) {
          if (isPhoto)
            items.push(<Image style={styles.thumb} source={{uri: arr[i].url}} onPress={() => this.openModal(arr[i])}/>)
        }
        if (isPhoto) {
          itemsArray =
            <View style={[styles.photoStrip, count ? {marginTop: -30} : {marginTop: 0}]}>
              <Text style={styles.activePropTitle}>{translate(bl, blmodel)}</Text>
              <View style={styles.photoStripItems}>{items}</View>
            </View>
          counter =
            <View>
              <View style={{marginTop: 15, paddingHorizontal: 5}}>
                <Icon name='ios-camera-outline'  size={25} color={LINK_COLOR} />
              </View>
            </View>;
        }
        else {
          var vCols = bl.viewCols;
          var cnt = resource[bl.name].length;
          let val = <View>{self.renderItems(resource[bl.name], bl, this.cancelItem.bind(this))}</View>

          var separator = <View style={styles.separator}></View>
          let cstyle = []
          if (count) {
            cstyle.push(styles.activePropTitle)
            cstyle.push({marginTop: 20})
          }
          else
            cstyle.push(styles.noItemsText)
          cstyle.push({paddingLeft: 10})
          itemsArray = <View>
                         <Text style={cstyle}>{translate(bl, model)}</Text>
                         {val}
                       </View>

          counter = <View style={[styles.itemsCounterEmpty, {marginTop: 15, paddingBottom: 10}]}>
                      <Icon name={bl.icon || 'plus'} size={bl.icon ? 25 : 15}  color={LINK_COLOR} />
                    </View>
        }
      }
      else {
        itemsArray = <Text style={count ? styles.itemsText : styles.noItemsText}>{translate(bl, blmodel)}</Text>
        counter = <View style={[styles.itemsCounterEmpty]}>
                  { bl.name === 'photos'
                    ? <Icon name='ios-camera-outline'  size={25} color={LINK_COLOR} />
                    : <Icon name={bl.icon || 'plus'}   size={bl.icon ? 25 : 15} color={LINK_COLOR} />
                  }
                  </View>
      }
      var title = translate(bl, blmodel) //.title || utils.makeLabel(p)
      var err = this.state.missedRequiredOrErrorValue
              ? this.state.missedRequiredOrErrorValue[meta.properties[p].name]
              : null
      var errTitle = translate('thisFieldIsRequired')
      var error = err
                ? <View style={styles.error}>
                    <Text style={styles.errorText}>{errTitle}</Text>
                  </View>
                : <View/>
      var actionableItem = isPhoto && count
                         ?  <TouchableHighlight style={{paddingTop: 15}} underlayColor='transparent'
                             onPress={self.showItems.bind(self, bl, meta)}>
                            {itemsArray}
                            </TouchableHighlight>
                         :  <TouchableHighlight style={count ? {paddingTop: 0} : {paddingTop: 15, paddingBottom: 7}} underlayColor='transparent'
                                onPress={self.onNewPressed.bind(self, bl, meta)}>
                              {itemsArray}
                            </TouchableHighlight>

      let istyle = []
      if (isPhoto) {
        if (count)
          istyle.push(styles.photoButton)
        else {
          istyle.push(styles.itemButton)
          // istyle.push({paddingBottom: 10})
          istyle.push({height: 70})
        }
      }
      else {
        istyle.push(styles.itemButton)
        if (err)
          istyle.push({marginBottom: 10})
        else if (!count)
          istyle.push({paddingBottom: 0})
        else {
          let height = 32
          if (resource[bl.name].photo)
            height = 55
          // else if (resource[bl.name][0].photo)
          //   height = 38
          istyle.push({paddingBottom: 0, height: count * height + 35})
        }
      }

      arrayItems.push (
        <View style={istyle} key={this.getNextKey()} ref={bl.name}>
          <View style={styles.items}>
            <View style={{flex: 5}}>
              {actionableItem}
            </View>
            <TouchableHighlight underlayColor='transparent' style={isPhoto  &&  count ? {marginTop: 15} : count ? {paddingTop: 0} : {marginTop: 15, paddingBottom: 7}}
                onPress={self.onNewPressed.bind(self, bl, meta)}>
              {counter}
            </TouchableHighlight>
          </View>
          {error}
        </View>
      );
    }
    // var FromToView = require('./FromToView');
    // var isRegistration = !utils.getMe()  &&  resource[constants.TYPE] === constants.TYPES.PROFILE
    if (this.state.isRegistration)
      Form.stylesheet = rStyles
    else
      Form.stylesheet = stylesheet

    // var style = isMessage ? {height: 570} : {height: 867};

    var style
    if (this.state.isRegistration)
      style = DeviceHeight < 600 ? {marginTop: 90} : {marginTop: DeviceHeight / 4}
    else
      style = {marginTop: 64}
    if (!options)
      options = {}
    options.auto = 'placeholders';
    options.tintColor = 'red'
    var photoStyle = /*isMessage && !isFinancialProduct ? {marginTop: -35} :*/ styles.photoBG;
    var button = this.state.isRegistration
               ? <TouchableHighlight style={styles.thumbButton}
                      underlayColor='transparent' onPress={this.onSavePressed.bind(this)}>
                  <View style={styles.getStarted}>
                     <Text style={styles.getStartedText}>ENTER</Text>
                  </View>
                 </TouchableHighlight>
               : <View style={{height: 0}} />

    var content =
      <ScrollView style={style} ref='scrollView' {...this.scrollviewProps}>
        <View style={styles.container}>
          <View style={photoStyle}>
            <PhotoView resource={resource} navigator={this.props.navigator}/>
          </View>
          <View style={this.state.isRegistration ? {marginHorizontal: DeviceHeight > 1000 ? 50 : 30, paddingTop: 30} : {paddingRight: 15, paddingTop: 10, marginHorizontal: 10}}>
            <Form ref='form' type={Model} options={options} value={data} onChange={this.onChange.bind(this)}/>
            {button}
            <View style={{marginTop: -10}}>
              {arrayItems}
             </View>
            <View style={{alignItems: 'center', marginTop: 50}}>
              <ActivityIndicatorIOS animating={this.state.isLoadingVideo ? true : false} size='large' color='#ffffff'/>
            </View>
          </View>
          <View style={{height: 300}}/>
        </View>
      </ScrollView>

    // StatusBarIOS.setHidden(true);
    if (!this.state.isRegistration) {
      if (this.state.err) {
        AlertIOS.alert(this.state.err)
        this.state.err = null
      }
      return content
    }
    var cTop = DeviceHeight / 6

    var thumb = {
      width: DeviceWidth / 2.2,
      height: DeviceWidth / 2.2,
    }

    return (
      <View style={{height: DeviceHeight}}>
        <Image source={BG_IMAGE} style={styles.bgImage} />

        {content}
        <View style={{opacity: 0.7, position: 'absolute', top: 20, right: 20, flexDirection: 'row'}}>
          <Image style={{width: 50, height: 50}} source={require('../img/TradleW.png')}></Image>
        </View>
      </View>
    )
  }
  cancelItem(pMeta, item) {
    var list = this.state.resource[pMeta.name];
    for (var i=0; i<list.length; i++) {
      if (equal(list[i], item)) {
        list.splice(i, 1);
        this.setState({
          resource: this.state.resource,
          itemsCount: list.length
        })
        return
      }
    }
  }

  showItems(prop, model, event) {
    var resource = this.state.resource;
    var model = (this.props.model  ||  this.props.metadata)
    if (!resource) {
      resource = {};
      resource[constants.TYPE] = model.id;
    }

    var currentRoutes = this.props.navigator.getCurrentRoutes();
    this.props.navigator.push({
      title: translate('tapToRemovePhotos'), //Tap to remove photos',
      titleTintColor: 'red',
      id: 19,
      component: GridItemsList,
      noLeftButton: true,
      rightButtonTitle: translate('done'),
      passProps: {
        prop:        prop.name,
        resource:    resource,
        onAddItem:   this.onAddItem.bind(this),
        list:        resource[prop.name],
        returnRoute: currentRoutes[currentRoutes.length - 1],
        callback:    this.setChosenValue.bind(this),
      }
    });
  }

  onEndEditing(prop, event) {
    if (this.state.resource[prop]  ||  event.nativeEvent.text.length)
      this.state.resource[prop] = event.nativeEvent.text;
  }
  onChange(value, properties) {
    if (!properties)
      return
    properties.forEach((p) => {
      this.state.resource[p] = value[p];
    })
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
    var modelName = constants.TYPES.SIMPLE_MESSAGE;
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
}
reactMixin(NewResource.prototype, Reflux.ListenerMixin);
reactMixin(NewResource.prototype, NewResourceMixin);
reactMixin(NewResource.prototype, ResourceMixin);

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noItemsText: {
    fontSize: 18,
    color: '#cccccc',
    // alignSelf: 'center',
    paddingLeft: 10
  },
  itemsText: {
    fontSize: 18,
    color: '#000000',
    // alignSelf: 'center',
    paddingLeft: 10
  },
  itemsCounterEmpty: {
    paddingHorizontal: 5
  },
  itemsCounter: {
    borderColor: '#2E3B4E',
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'center',
    paddingHorizontal: 5,
  },
  itemButton: {
    height: 70,
    marginLeft: 10,
    // marginLeft: 10,
    borderColor: '#ffffff',
    borderBottomColor: '#cccccc',
    borderBottomWidth: 0.5,
    paddingBottom: 10,
    justifyContent: 'flex-end',
  },
  photoButton: {
    marginLeft: 10,
    borderColor: '#ffffff',
    borderBottomColor: '#cccccc',
    borderBottomWidth: 0.5,
    // paddingBottom: 5,
  },

  photoBG: {
    // marginTop: -15,
    alignItems: 'center',
  },
  err: {
    // paddingVertical: 10,
    flexWrap: 'wrap',
    paddingHorizontal: 25,
    fontSize: 16,
    color: 'darkred',
  },
  getStartedText: {
    // color: '#f0f0f0',
    color: '#eeeeee',
    fontSize: 20,
    fontWeight:'300',
    alignSelf: 'center'
  },
  getStarted: {
    backgroundColor: '#467EAE', //'#2892C6',
    paddingVertical: 10,
    marginLeft: 10,
    // paddingHorizontal: 50,
    alignSelf: 'stretch',
  },
  thumbButton: {
    marginTop: 20,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    // paddingHorizontal: 80,
  },
  thumb: {
    width:  40,
    height: 40,
    marginRight: 2,
    borderRadius: 5
  },
  error: {
    paddingLeft: 5,
    position: 'absolute',
    bottom: -20,
    backgroundColor: 'transparent'
  },
  errorText: {
    fontSize: 14,
    color: '#a94442'
  },
  items: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // paddingBottom: 5
  },
  activePropTitle: {
    fontSize: 12,
    marginTop: 20,
    paddingBottom: 5,
    // marginBottom: 5,
    color: '#bbbbbb'
  },
  photoStrip: {
    marginLeft: 10,
    // marginTop: -30,
    paddingBottom: 5
  },
  photoStripItems: {
    flexDirection: 'row'
  },
  bgImage: {
    position:'absolute',
    left: 0,
    top: 0,
    width: DeviceWidth,
    height: DeviceHeight
  }
});

module.exports = NewResource;
