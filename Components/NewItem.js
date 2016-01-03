'use strict';

var React = require('react-native');
var t = require('tcomb-form-native');
var utils = require('../utils/utils');
var extend = require('extend');
var logError = require('logError');
var SelectPhotoList = require('./SelectPhotoList');
var myStyles = require('../styles/styles');
var constants = require('@tradle/constants');
var NewResourceMixin = require('./NewResourceMixin');
var reactMixin = require('react-mixin');

var Form = t.form.Form;
Form.stylesheet = myStyles;

var {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Component,
  TouchableHighlight,
} = React;

class NewItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedAssets: {},
      resource: this.props.resource
    }

    // if (this.props.resource[this.props.metadata.name])
    //   this.state.data = this.props.resource[this.props.metadata.name]

    var currentRoutes = this.props.navigator.getCurrentRoutes();
    var currentRoutesLength = currentRoutes.length;

    currentRoutes[currentRoutesLength - 1].onRightButtonPress = {
      stateChange: this.onSavePressed.bind(this)
    };
  }
  onSavePressed() {
    if (this.state.submitted)
      return
    this.state.submitted = true
    var value = this.refs.form.getValue();
    if (!value)
      value = this.refs.form.refs.input.state.value;
    if (!value) {
      value = this.state.data
      if (!value)
        value = {}
    }

    if (this.state.floatingProps) {
      for (var p in this.state.floatingProps) {
        value[p] = this.state.floatingProps[p]
      }
    }
    var propName = this.props.metadata.name;
    var resource = this.props.resource
    var item = JSON.parse(JSON.stringify(value));
    if (this.props.metadata.items) {
      // HACK ref props of array type props reside on resource for now
      var props = this.props.metadata.items.properties
      if (props) {
        var rProps = utils.getModel(resource[constants.TYPE]).value.properties
        for (var p in props) {
          if (p === propName)
            continue
          if (props[p].ref  &&  resource[p]  &&  !rProps[p]) {
            item[p] = resource[p]
            delete resource[p]
          }
        }
      }
    }

    if (!this.validateValues(this.props.metadata, item)) {
      this.state.submitted = false
      return;
    }

    // if (this.props.metadata.items.backlink)
    //   item[this.props.metadata.items.backlink] = this.props.resource[constants.TYPE] + '_' + this.props.resource[constants.ROOT_HASH];

    if (utils.isEmpty(this.state.selectedAssets))
      this.props.onAddItem(propName, item);
    else {
      for (var assetUri in this.state.selectedAssets) {
        var newItem = {};
        extend(newItem, item);
        newItem = {url: assetUri, title: 'photo'};
        this.props.onAddItem(propName, newItem);
      }
    }
    this.state.submitted = false
    this.props.navigator.pop();
  }
  validateValues(prop, item) {
    var required = prop.required;
    var hasError;
    this.state.options = {
      fields: {}
    };
    if (required) {
      required.forEach((p) => {
        if (!item[p]  &&  prop.name == 'photos') {
          if (!utils.isEmpty(this.state.selectedAssets))
            return;
          hasError = true;
          this.setState({err: 'Select the photo please'});
        }
      })
    }
    if (!hasError)
      this.state.options = null;
    return !hasError;
  }
  addItem() {
    var propName = this.props.metadata.name;
    var json = JSON.parse(JSON.stringify(value));
    this.props.onAddItem(propName, json);
    return true;
  }
  render() {
    var props = this.props;
    var parentBG = {backgroundColor: '#7AAAC3'};
    var err = props.err || this.state.err || '';
    var errStyle = err ? styles.err : {'padding': 0, 'height': 0};
    var error = err
              ? <Text style={errStyle}>{err}</Text>
              : <View />


    var meta =  props.metadata;
    var model = {};
    var params = {
        meta: meta,
        model: model,
        // chooser: this.props.chooser.bind(this),
        // template: this.props.template.bind(this),
        onSubmitEditing: this.onSavePressed.bind(this)
    };
    if (this.state.data)
      params.data = this.state.data[0]

    var options = this.getFormFields(params);
    options.auto = 'placeholders';
    var Model = t.struct(model);
    if (this.state.options) {
      for (var fieldName in this.state.options.fields) {
        var fields = this.state.options.fields[fieldName]
        for (var f in fields) {
          options.fields[fieldName][f] = fields[f];
        }
      }
    }

        // <SelectPhotoList style={{marginTop: -40}}
        //   metadata={this.props.metadata}
        //   navigator={this.props.navigator}
        //   onSelect={this.onSelect.bind(this)} />
    return (
      <View style={styles.container}>
        <View style={{marginLeft: 10, marginRight: 20, marginBottom: 15 }}>
          <Form ref='form' type={Model} options={options} />
        </View>
        {error}
      </View>
    );
  }
  onSelect(asset) {
    var selectedAssets = this.state.selectedAssets;
    // unselect if was selected before
    if (selectedAssets[asset.node.image.uri])
      delete selectedAssets[asset.node.image.uri];
    else
      selectedAssets[asset.node.image.uri] = asset;
  }
}
reactMixin(NewItem.prototype, NewResourceMixin);

var styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50
  },
  imageContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
    alignSelf: 'center'
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
    width: 100,
    flex: 1,
    backgroundColor: '#ffffff',
    borderColor: '#6093ae',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'center',
    alignSelf: 'center'
  },
  err: {
    paddingVertical: 10,
    fontSize: 20,
    color: 'darkred',
  }

});
module.exports = NewItem;

// tryiing to add custom validation of typed props e.g email
    // if (propName == 'contact'  &&  value.type === 'email') {
    //    var validated = /(.)+@(.)+/.test(value);
    //   if (!validate) {
    //      this.setState({
    //         options: {
    //           fields: {
    //             identifier: {
    //               hasError: true,
    //               error: 'Invalid email'
    //             }
    //           }
    //         }
    //     });
    //     return;
    //   }

    // }
