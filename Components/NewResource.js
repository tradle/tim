'use strict';
 
var React = require('react-native');
var Q = require('q');
var utils = require('../utils/utils');
var ShowItems = require('./ShowItems');
var SearchScreen = require('./SearchScreen');
var t = require('tcomb-form-native');
var sha = require('stable-sha1');
var extend = require('extend');

var Form = t.form.Form;

var {
  StyleSheet,
  Image, 
  View,
  Text,
  TextInput,
  SwitchIOS,
  ScrollView,
  Component,
  TouchableHighlight,
} = React;

class NewResource extends Component {
  constructor(props) {
    super(props);
    this.setState({
      resourceChanged: false
    });
  }
  _rerenderWithError(err) {
    this.setState({
      err: err
    });
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
      this._rerenderWithError(msg);
      return;
    }
    var options = this.refs.form.props.options.fields;
    // Check if there are references to other resources
    var refProps = {};
    var promises = [];
    var db = utils.getDb();
    for (var p in options) {
      if (options[p].value) {
        var ref = this.props.metadata.properties[p].ref;
        if (ref  &&  options[p].value.indexOf('undefined') == -1)  {
          refProps[options[p].value] = p;
          promises.push(Q.ninvoke(db, 'get', options[p].value));
        }
      }
    }
    var self = this;  
    var json = JSON.parse(JSON.stringify(value));
    Q.allSettled(promises)
    .then(function(results) {
       results.forEach(function(val) {
         if (val.state === 'fulfilled') {
           var propValue = val.value['_type'] + '_' + val.value.rootHash;
           var prop = refProps[propValue];
           var title = json[prop];
           json[prop] = {
             title: title,
             id : propValue
           }
           var interfaces = self.props.metadata.interfaces;
           if (interfaces  &&  interfaces.indexOf('tradle.Message') != -1)
             json['time'] = new Date().getTime();  
         }
       });
      var props = self.props; 
      var meta = props.metadata.properties;
      var modelName = props.metadata.id;
      if (utils.getModel(modelName)) {
        var isNew = !props.resource.rootHash;
        var obj;
        if (!props.resource  ||  isNew) 
          obj = json;
        else {
          var obj = {};
          extend(true, obj, props.resource);
          for (var p in json)
            if (!obj[p])
              obj[p] = json[p];
            else if (!meta[p].readOnly  &&  !meta[p].immutable)
              obj[p] = json[p];
        }
        self._putResourceInDB(modelName, obj);
      }
    })
    .catch(function(err) {
      err = err
    })
      
  }
  _putResourceInDB(modelName, value) {
    var self = this;
    
    for (var p in value) {
      if (!value[p])
        delete value[p];      
    } 
    if (!value['_type'])
      value['_type'] = modelName;
    if (!value.rootHash)
      value.rootHash = sha(value);
    var iKey = modelName + '_' + value.rootHash;
    var db = utils.getDb();
    db.put(iKey, value)
    .then(function() {
      return db.get(iKey)
    })
    .then(function(value) {
      // self.props.navigator.pop();
      var meta = self.props.metadata;
      var props = meta.properties;
      var required = utils.arrayToObject(meta.required);
      var itemsMeta = [];
      for (var p in props) {
        if (props[p].type == 'array'  &&  required[p]) {
          if (!props[p].title)
            props[p].title = utils.makeLabel(p);
          props[p].range = p; 
          itemsMeta.push(props[p]);
        }
      }
      if (utils.isEmpty(itemsMeta)) {  // No array properties to set
        if (callback)
          self.props.callback();
        self.props.navigator.replacePreviousAndPop(self.props.returnRoute);
        return;
      }
      self.props.navigator.push({
        component: ShowItems,
        title: 'Items Chooser',
        id: 5,
        passProps: {
          resourceKey: iKey, 
          resource: value,
          parentMeta: meta, 
          itemsMeta: itemsMeta,
        }
      });
    })
    .catch(function(err) {
      self._rerenderWithError('Error: ' + err.message);
    });
  }

  chooser(prop, propName, event) {
    var props = this.props;
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
        returnRoute: props.route,
        modelName:   prop.ref,
        resource:    props.resource,
        callback:    this.setChosenValue.bind(this)
      }
    });
  }

  setChosenValue(propName, value) {
    this.props.resource[propName] = value;
    this.setState({
      resourceChanged: true
    });

  }
  render() {
    var props = this.props;
    var parentBG = {backgroundColor: '#7AAAC3'};
    var err = props.err || '';

    var resource = props.resource;
    var photo = resource  &&  resource.photos && resource.photos.length 
              ? <Image source={{uri: resource.photos[0].url}} style={styles.image} /> 
              : <View />;

    var meta =  props.metadata;
    if (this.props.setProperty)
      props.resource[this.props.setProperty.name] = this.props.setProperty.value;
    var model = {};
    var arrays = [];
    var data = {};
    extend(true, data, props.resource);
    var options = utils.getFormFields({
        meta: meta, 
        data: data, 
        chooser: this.chooser.bind(this),
        model: model,
        items: arrays
      });
    
    var Model = t.struct(model);
    var errStyle = err ? styles.err : {'padding': 0, 'height': 0};

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
var styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
  },
  label: {
    fontSize: 14,
    borderColor: '#7AAAC3',
    color: '#2E3B4E',
    paddingBottom: 5,
    paddingTop: 10,
    marginRight: 5
  },
  textInput: {
    height: 36,
    padding: 4,
    marginRight: 5,
    flex: 1,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#7AAAC3',
    backgroundColor: '#8E9BaE',
    color: '#2E3B4E',
    borderRadius: 8,
  },
  switchInput: {
    height: 16,
    padding: 4,
    marginRight: 5,
    flex: 1,
    fontSize: 18,
  },
  buttons: { 
    flex: 1,
    flexDirection: 'row',
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
    color: '#2E3B4E',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'stretch',
    justifyContent: 'center',
    margin: 10,
  },
  image: {
    width: 400,
    height: 350,
    alignSelf: 'stretch'
  },
  err: {
    paddingTop: 10,
    paddingLeft: 20,
    fontSize: 20,
    color: 'darkred',
  },

});
var EmptyPage = React.createClass({

  render: function() {
    return (
      <View></View>
    );
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
  //           clearButtonMode="while-editing"
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
