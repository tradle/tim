'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var NewItem = require('./NewItem');
var SearchScreen = require('./SearchScreen');
var t = require('tcomb-form-native');
var extend = require('extend');
var Actions = require('../Actions/Actions');
var Store = require('../Store/Store');
var Reflux = require('reflux');
var reactMixin = require('react-mixin');
var Icon = require('FAKIconImage');

var Form = t.form.Form;

var {
  StyleSheet,
  Image, 
  View,
  Text,
  TextInput,
  ScrollView,
  Component,
  TouchableHighlight,
} = React;

class NewResource extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resource: props.resource
    }
  }
  componentDidMount() {
    this.listenTo(Store, 'itemAdded');
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
    // if registration or after editing the profile
    if (this.state.isRegistration  ||  (params.me  &&  resource.rootHash === params.me.rootHash))
      utils.setMe(params.me);
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
    }
    var resource = this.state.resource;
    var isRegistration = !utils.getMe()  && this.props.metadata.id === 'tradle.Identity'  &&  (!resource || !resource.rootHash);
    if (!resource)
      resource = {'_type': this.props.metadata.id};
    if (isRegistration)
      this.state.isRegistration = true;
    Actions.addItem(value, resource, this.props.metadata, isRegistration);
  }
  chooser(prop, propName, event) {
    var resource = this.state.resource;
    var filter = event.nativeEvent.text; 
    var m = utils.getModel(prop.ref).value;
    this.props.navigator.push({
      title: m.title,
      titleTextColor: '#7AAAC3',
      id: 10,
      component: SearchScreen,
      passProps: {
        filter:      filter, 
        prop:        propName,
        modelName:   prop.ref,
        resource:    resource,
        callback:    this.setChosenValue.bind(this)
      }
    });
  }
  // setting ref property on the resource 
  setChosenValue(propName, value) {
    this.state.resource[propName] = value;
    this.setState({
      resource: this.state.resource
    });
  }

  onAddItem(propName, item) {
    var value = this.refs.form.getValue();
    var json = value ? JSON.parse(JSON.stringify(value)) : {};
    var resource = this.state.resource;
    if (!resource)
      resource = {'_type': this.props.metadata.id};
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
      title: 'Create new ' + bl.title,
      backButtonTitle: 'Back',
      component: NewItem,
      id: 6,
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
    var photo = resource  &&  resource.photos && resource.photos.length 
              ? <Image source={{uri: resource.photos[0].url}} style={styles.image} /> 
              : <View />;
    photo = <View />
    var iKey = resource  ? resource['_type'] + '_' + resource.rootHash : null;

    var meta =  props.metadata;
    if (this.props.setProperty)
      this.state.resource[this.props.setProperty.name] = this.props.setProperty.value;
    var model = {};
    var arrays = [];
    var data = {};
    extend(true, data, resource);
    var isMessage = meta.interfaces  &&  meta.interfaces.indexOf('tradle.Message') != -1;
    var showSendVerificationForm = false;
    if (isMessage) {
      if (!resource.message  ||  utils.parseMessage(resource.message).length < 2) {
        showSendVerificationForm = true;
        data.message = '';
      }
    }

    var options = utils.getFormFields({
        meta: meta, 
        data: data, 
        chooser: this.chooser.bind(this),
        model: model,
        items: arrays
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
      else if (self.props.metadata.required  &&  self.props.metadata.required.indexOf(bl.name) != -1)
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
            <Text style={styles.itemsText}>{bl.title}</Text>
            {counter}
          </View>
        </TouchableHighlight>
      );
    });
    var formRequest;
    if (resource  &&  showSendVerificationForm) {
      var title = resource.to['_type'] 
                ? utils.getDisplayName(resource.to, utils.getModel(resource.to['_type']).value.properties)
                : resource.to.title;
      formRequest =  
            <View style={{flex: 1}}>
              <Text style={styles.formRequest}>Send this form to {title}</Text>

              <View style={styles.searchBarBG}>
                <TextInput 
                  autoCapitalize='none'
                  autoFocus={true}
                  autoCorrect={false}
                  bufferDelay={20}
                  placeholder='Say something'
                  placeholderTextColor='#bbbbbb'
                  style={styles.searchBarInput}
                  value={this.state.userInput}
                  onChange={this.handleChange.bind(this)}
                  onEndEditing={this.onEndEditing.bind(this)}
                />
              </View>
            </View>
    }
    else
      formRequest = <View />

    return (
      <ScrollView
        initialListSize={10}
        pageSize={4}      
      >
      <View style={styles.container}>
        <Text style={errStyle}>{err}</Text>
        <View style={styles.photoBG}>
          {photo}
        </View>

        <View style={{'padding': 20}}>
          <Form ref='form' type={Model} options={options} value={data} />          
          {arrayItems}
          <View style={styles.buttons}>
            <TouchableHighlight style={[styles.button, parentBG]} underlayColor='#7AAAC3'
                onPress={this.onSavePressed.bind(this)}>
              <Text style={[styles.buttonText]}>Save</Text>
            </TouchableHighlight>
          </View>
        </View>
        {formRequest}
      </View>
      </ScrollView>
    );
  }
  handleChange(event) {
    this.setState({userInput: event.nativeEvent.text});
  }
  onEndEditing() {
    var msg = this.state.userInput;
    if (!msg)
      return;
    var me = utils.getMe();
    var resource = this.props.resource;
    var toName = utils.getDisplayName(resource.to, utils.getModel(this.props.resource.to['_type']).value.properties);
    var meta = utils.getModel(me['_type']).value.properties;
    var meName = utils.getDisplayName(me, meta);
    var modelName = 'tradle.SimpleMessage';
    var value = {
      '_type': modelName,  
      message: '[' + this.state.userInput + '](' + this.props.metadata.id + ')',

      'from': {
        id: me['_type'] + '_' + me.rootHash, 
        title: meName
      }, 
      'to': {
        id: resource.to['_type'] + '_' + resource.to.rootHash,
        title: toName
      },

      time: new Date().getTime()
    }
    Actions.addMessage(value); //, this.state.resource, utils.getModel(modelName).value);
  }

}
reactMixin(NewResource.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
  },
  buttons: { 
    flex: 1,
    flexDirection: 'row',
  },
  itemsText: {
    fontSize: 18,
    color: '#2E3B4E',
    alignSelf: 'center'
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
    // width: 150,
    borderColor: '#6093ae',
    borderWidth: 1,
    borderRadius: 8,
    margin: 10,
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
    alignSelf: 'stretch',
    justifyContent: 'center',
    margin: 10,
  },
  image: {
    width: 400,
    height: 350,
    alignSelf: 'stretch'
  },
  icon: {
    width: 20,
    height: 20
  },
  err: {
    paddingTop: 30,
    paddingLeft: 20,
    fontSize: 20,
    color: 'darkred',
  },
  searchBar: {
    flex: 4,
    padding: 10,
    // paddingLeft: 10,
    paddingTop: 3,

    height: 45,
    paddingBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eeeeee', 
  },
  searchBarBG: {
    marginTop: 10,
    marginBottom: 5,
    padding: 5,
    flex: 1,
    alignSelf: 'stretch',

    backgroundColor: '#eeeeee', 
    borderTopColor: '#eeeeee', 
    borderRightColor: '#eeeeee', 
    borderLeftColor: '#eeeeee', 
    borderWidth: 2,
    borderBottomColor: '#cccccc',
  },
  searchBarInput: {
    height: 30,
    fontSize: 18,
    paddingLeft: 10,
    backgroundColor: '#eeeeee',
    fontWeight: 'bold',
    // color: '#2E3B4E',
    borderRadius: 5,
    // borderWidth: 1,
    alignSelf: 'stretch',
    borderColor: '#eeeeee',
  },
  formRequest: {
    paddingTop: 30,
    paddingLeft: 20,
    fontSize: 18,
    color: '#2E3B4E',
  },
  formRequestButton: {
    height: 36,
    padding: 20,
    // alignSelf: 'stretch',
    // width: 150,
    borderColor: '#6093ae',
    borderWidth: 1,
    borderRadius: 8,
    margin: 10,
    justifyContent: 'center',
  },

});

module.exports = NewResource;

  // renderField(name, value) {
  //   var meta;
  //   var rMeta = this.props.metadata;
  //   for (var i=0; i<rMeta.length; i++)
  //     if (rMeta[i].prop == name) {
  //       meta = rMeta[i];
  //       break;
  //     }
  //   if (!meta.range) {
  //     return (
  //       <View style={{'paddingTop': 10}}>
  //         <View>
  //           <Text style={styles.label}>{meta.label}</Text>
  //         </View>
  //         <TextInput
  //           style={styles.textInput}
  //           value={value}
  //           clearButtonMode='while-editing'
  //          />
  //       </View>
  //     );
  //   }
  //   if (meta.range == 'boolean') 
  //     return (
  //       <View style={{'paddingTop': 10}}>
  //         <Text style={styles.label}>{meta.label}</Text>
  //         <SwitchIOS
  //           style={styles.switchInput}
  //           value={value}
  //           />
  //       </View>
  //     );
  // }
