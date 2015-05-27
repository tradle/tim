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
//var Icon = require('FAKIconImage');

var Form = t.form.Form;

var {
  StyleSheet,
  Image, 
  View,
  Text,
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
  itemAdded(list, resource, error) {
    if (!resource)
      return;
    if (error) {
      if (resource['_type'] == this.props.resource['_type'])
        this.setState({err: error, resource: resource});
      return;
    }
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
    Actions.addItem(value, this.state.resource, this.props.metadata);
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
    var items = resource[propName];
    if (!items) {
      items = [];
      resource[propName] = items;
    }
    items.push(item);
    for (var p in json)
      if (!resource[p])
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
        resourceKey: this.props.resourceKey, 
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
      if (resource[bl.name]) {
        if (resource[bl.name].length)
          counter = 
            <View style={styles.itemsCounter}><Text>{resource[bl.name] ? resource[bl.name].length : ''}</Text></View>;
        else if (model.required  &&  model.required.indexOf(bl.name) != -1)
          counter = 
            <View style={styles.itemsCounter}><Image source={require('image!required')} style={styles.icon} /></View>;
        else
          counter = <View></View>    
      }
      else if (self.props.metadata.required  &&  self.props.metadata.required.indexOf(bl.name) != -1)
        counter = 
          <View><Image source={require('image!required')} style={styles.icon} /></View>;
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
      </View>
      </ScrollView>
    );
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
