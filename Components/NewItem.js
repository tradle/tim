'use strict';
 
var React = require('react-native');
var t = require('tcomb-form-native');
var utils = require('../utils/utils');

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
  // CameraRoll,
  // AsyncStorage,
  TouchableHighlight,
} = React;

class NewItem extends Component {
  constructor(props) {
    super(props);
    // return {value:  'red'};
  }
  _rerenderWithMessage(err) {
    if (err) 
      this.props.err = err;
    else if (this.props.err) 
      delete this.props['err'];      

    if (err.indexOf('Error') == 0) {
      this.props.navigator.replace({
        component: NewItem,
        passProps: this.props
      });
    }
    else {
      this.setState({
        err: err
      });
    }
  }
  onSavePressed() {
    var value = this.refs.form.getValue();
    if (!value)
      return;
    // if (!value) {
    //   var errors = this.refs.form.refs.input.getValue().errors;
    //   var msg = '';
    //   var errMsg = errors.forEach(function(err) {
    //      msg += ' ' + err.message;
    //   }); 
    //   this._rerenderWithMessage(msg);
    //   return;
    // }
    var iKey = this.props.page.resourceKey;
    var modelName = iKey.slice(0, iKey.indexOf('_'));
    if (this.props.page.models['model_' + modelName]) 
      this._putResourceInDB(modelName, JSON.parse(JSON.stringify(value)));
  }
  onSaveAndAddPressed() {
    var value = this.refs.form.getValue();
    if (!value)
      return;
    var iKey = this.props.page.resourceKey;
    var modelName = iKey.slice(0, iKey.indexOf('_'));
    if (this.props.page.models['model_' + modelName]) 
      this._putResourceInDB(modelName, JSON.parse(JSON.stringify(value)), true);
  }
  _putResourceInDB(modelName, value, addMore) {
    var self = this;
    var resourceKey = this.props.page.resourceKey;
    this.props.page.db.get(resourceKey)
    .then(function(data) {
      var resource = self.props.page.resource;
      var itemMeta = self.props.page.metadata;
      var items = resource[itemMeta['range']];
      if (!items) 
        items = [];
      items.push(value);
      resource[itemMeta['range']] = items;
      self.props.page.db.put(resourceKey, resource)
      .then(function() {
        // self.props.navigator.pop();
        if (addMore)
          self._rerenderWithMessage("Add another " + itemMeta['title']);
        else  
          self.props.navigator.pop();
      });
    })
    .catch(function(err) {
      self._rerenderWithMessage("Error: " + err.message);
    })
  }

  onCancelPressed() {
    this.props.navigator.pop();
  }
  render() {
    var page = this.props.page;
    var parentBG = {backgroundColor: '#7AAAC3'};
    var err = this.props.err || '';

    var meta =  page.metadata;
    var model = {};
    var params = {
        meta: meta,
        model: model,
        models: page.models,
        // data: page.resource
    };

    var options = utils.getFormFields(params);
    var Model = t.struct(model);
    var errStyle = err ? styles.err : {'padding': 0, 'height': 0};
    return (
      <ScrollView
        initialListSize={10}
        pageSize={4}      
      >
      <View style={styles.container}>
        <View style={styles.tilesBG}>
          <TouchableHighlight  underlayColor='#2E3B4E'
              onPress={() => this.props.navigator.popToTop()}>
            <Image style={styles.image} source={require('image!items')} />
          </TouchableHighlight>
        </View>

        <Text style={errStyle}>{err}</Text>


        <View style={{'padding': 20}}>
          <Form ref='form' type={Model} options={options} value={page.resource} />
          <View style={styles.buttons}>
            <TouchableHighlight style={[styles.button, parentBG]} underlayColor='#7AAAC3'
                onPress={this.onSavePressed.bind(this)}>
              <Text style={[styles.buttonText]}>Save</Text>
            </TouchableHighlight>
            <TouchableHighlight style={[styles.button, parentBG, {paddingRight:10, paddingLeft:10}]} underlayColor='#7AAAC3'
                onPress={this.onSaveAndAddPressed.bind(this)}>
              <Text style={[styles.buttonText]}>Save + Add</Text>
            </TouchableHighlight>
            <TouchableHighlight style={styles.button} underlayColor='#ffffff'
                onPress={this.onCancelPressed.bind(this)}>
              <Text style={[styles.buttonText,{'color':'#2E3B4E'}]}>Cancel</Text>
            </TouchableHighlight>
          </View>
        </View>
      </View>
      </ScrollView>
    );
  }

}
NewItem.propTypes = {
  tiles: React.PropTypes.array.metadata
  // tile: React.PropTypes.array.data
};

var styles = StyleSheet.create({
  container: {
    flex: 1,
      // backgroundColor: '#2E3B4E',
  },
  image: {
    width: 170,
    height: 170,
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
    fontSize: 16,
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
    alignSelf: 'stretch',
    justifyContent: 'center',
    margin: 5,
  },
  err: {
    paddingTop: 10,
    paddingLeft: 20,
    fontSize: 20,
    color: 'darkred',
  },
  tilesBG: {
    backgroundColor: '#2E3B4E',
    flex: 1,
    alignItems: 'center'
  }

});
module.exports = NewItem;

  // getModel(metadata, data, model) {
  //   var options = {};
  //   options['fields'] = {};
 
  //   for (var i=0; i<metadata.length; i++) {
  //     var meta = metadata[i];

  //     var props = meta.items.properties;

  //     var d = null;
  //     if (data) {
  //       for (var ii=0; ii<data.length; ii++) {
  //         if (data[ii].model === meta.type)
  //           d = data[ii];
  //       }
  //       if (!d)
  //         continue;
  //     }
  //     var editCols = this.arrayToObject(meta['editCols']);
        
  //     var eCols = editCols ? editCols : props;
  //     var required = this.arrayToObject(meta.required);
  //     // var d = data ? data[i] : null;
  //     for (var p in eCols) {
  //       var maybe = required  &&  !required.hasOwnProperty(p);

  //       var type = props[p].type;
  //       var formType = propTypesMap[type];
  //       var label = props[p].title;
  //       if (!label)
  //         label = utils.makeLabel(p);
  //       options.fields[p] = {
  //         error: 'Insert a valid ' + label
  //       }
  //       // Don't show readOnly property in edit mode if not set
  //       if (props[p].readOnly  &&  (!d  ||  !d[p]))
  //         continue;

  //       if (props[p].readOnly  ||  (props[p].immutable  &&  d  &&  d[p]))
  //         options.fields[p] = {'editable':  false };
  //       if (formType) {
  //         model[p] = maybe ? t.maybe(formType) : formType;
  //         if (type == 'date') {
  //           d[p] = new Date(d[p]);
  //           options.fields[p] = { mode: 'date'};
  //         }
  //       }
  //       else if (type != 'enum') {
  //         continue;
  //         var mm, md;
  //         for (var ii=0; ii<metadata.length; ii++) {
  //           if (metadata[ii].model == type) {
  //             mm = metadata[ii];
  //             md = d;
  //           }
  //         }
  //         model[p] = this.getModel([mm], [md], model);
  //       }
  //       else {
  //           // var rModel = {};
  //           // var options = getModel(meta[type], rModel);
  //           // model[propName] = rModel;
  //         var facet = props[p].facet;  
  //         var values = this.props.page.metadata.filter(mod => {
  //            return mod.type === facet ? mod.values : null;
  //         });  
  //         if (values && values.length) {
  //           var enumValues = {};
  //           values[0].values.forEach(function(val) { 
  //             enumValues[val.label] = val.title;
  //           });
  //           // options.fields[p].factory = t.form.radio;
  //           model[p] = t.enums(enumValues);
  //         }
  //       }
  //     }
  //   }
  //   return options;
  // }
  // arrayToObject(arr) {
  //   if (!arr)
  //     return;

  //   var obj = arr.reduce(function(o, v, i) {
  //     o[v.trim()] = i;
  //     return o;
  //   }, {});
  //   return obj;
  // }
