'use strict';
 
var React = require('react-native');
var t = require('tcomb-form-native');
var utils = require('../utils/utils');

var Form = t.form.Form;

var {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Component,
  TouchableHighlight,
} = React;

class NewItem extends Component {
  onSavePressed(addMore) {
    if (this.addItem()) 
      this.props.navigator.pop();
  }
  addItem() {
    var value = this.refs.form.getValue();
    if (!value)
      return;

    var propName = this.props.metadata.name;
    var json = JSON.parse(JSON.stringify(value));
    this.props.onAddItem(propName, json);    
    return true;
  }
  render() {
    var props = this.props;
    var parentBG = {backgroundColor: '#7AAAC3'};
    var err = this.props.err || '';

    var meta =  props.metadata;
    var model = {};
    var params = {
        meta: meta,
        model: model,
        onSubmitEditing: this.onSavePressed.bind(this)
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
        <Text style={errStyle}>{err}</Text>
        <View style={{'padding': 20}}>
          <Form ref='form' type={Model} options={options} />
          <TouchableHighlight style={[styles.button, parentBG]} underlayColor='#7AAAC3'
              onPress={this.onSavePressed.bind(this)}>
            <Text style={[styles.buttonText]}>Save</Text>
          </TouchableHighlight>
        </View>
      </View>
      </ScrollView>
    );
  }
            // <TouchableHighlight style={[styles.button, parentBG, {paddingRight:10, paddingLeft:10}]} underlayColor='#7AAAC3'
            //     onPress={this.onSavePressed.bind(this, true)}>
            //   <Text style={[styles.buttonText]}>Save + Add</Text>
            // </TouchableHighlight>
            // <TouchableHighlight style={styles.button} underlayColor='#ffffff'
            //     onPress={this.onCancelPressed.bind(this)}>
            //   <Text style={[styles.buttonText,{'color':'#2E3B4E'}]}>Cancel</Text>
            // </TouchableHighlight>

}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 60
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
    paddingTop: 10,
    paddingLeft: 20,
    fontSize: 20,
    color: 'darkred',
  },

});
module.exports = NewItem;
