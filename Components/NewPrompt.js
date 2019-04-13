import React, { Component } from 'react'
import {
  View,
  ListView,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
  Picker
} from 'react-native'
const {Select, Option} = require('react-native-chooser');
const MAX = 300

import StringChooser from './StringChooser'
import { translate } from '../utils/utils'

class NewPrompt extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: null,
      visible: props.visible
    }
  }
  render() {
    let text = this.state.value  &&  this.props.options[this.state.value] || 'Please choose...'
    return (
      <Modal
         animationType={'none'}
         transparent={true}
         visible={this.state.visible}>
       <View style={styles.dialogOverlay}>
       <View style={{backgroundColor: '#eee', justifyContent: 'center', marginHorizontal: 20, paddingVertical: 20}}>
         <Text style={styles.text}>{this.props.title}</Text>
            <TouchableOpacity onPress={() => {
              this.setState({visible: false});
              this.showChooser()
            }}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>{translate('Please choose')}</Text>
              </View>
            </TouchableOpacity>

          <View style={styles.buttons}>
            <TouchableOpacity onPress={() => this.props.onSubmit(this.state.value)}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>{translate('submit')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        </View>
      </Modal>
    );
  }
  showChooser() {
    this.props.navigator.push({
      title: translate('formChooser'),
      componentName: 'StringChooser',
      backButtonTitle: 'Back',
      // sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      passProps: {
        strings: this.props.options,
        notModel: true,
        navigator: this.props.navigator,
        callback: (val, label) => {
          this.setState({value: val})
        }
      }
    })
  }
  render1() {
    let options = []
    for (let p in this.props.options)
      options.push(<Option value={p} key={p}>{this.props.options[p]}</Option>)
    let text = this.state.value  &&  this.props.options[this.state.value] || 'Please choose...'
    return (
      <Modal
         animationType={'none'}
         transparent={true}
         visible={this.props.visible}>
       <View style={styles.dialogOverlay}>
       <View style={{backgroundColor: '#eee', justifyContent: 'center', marginHorizontal: 20, paddingVertical: 20}}>
         <Text style={styles.text}>{this.props.title}</Text>
         <Select
            style = {{borderWidth : StyleSheet.hairlineWidth, borderColor: '#757575', alignSelf: 'center', justifyContent: 'center', width:250}}
            textStyle = {{color: this.state.value ? '#000000' : '#757575', fontSize:18}}
            defaultText  = {text}
            backdropStyle  = {{backgroundColor : 'rgba(0, 0, 0, 0.7)', borderWidth: 0}}
            optionListStyle = {{backgroundColor: '#F5FCFF', paddingVertical: 10, borderWidth: StyleSheet.hairlineWidth, height: Math.min(MAX, options.length * 30)}}
            onSelect={(val, label) => {
              this.setState({value: val})
            }}>
            {options}
          </Select>
          <View style={styles.buttons}>
            <TouchableOpacity onPress={() => this.props.onSubmit(this.state.value)}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>{translate('submit')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        </View>
      </Modal>
    );
  }
}
const styles = StyleSheet.create({
  buttons: {
    justifyContent: 'flex-end',
    alignSelf: 'center',
    // height: 500
  },
  text: {
    fontSize: 22,
    color: '#757575',
    alignSelf: 'center',
    paddingVertical: 20
  },
  button: {
    backgroundColor: '#7AAAC2',
    flexDirection: 'row',
    justifyContent: 'center',
    width: 150,
    marginTop: 20,
    alignSelf: 'center',
    height: 50,
    borderRadius: 15,
    // marginRight: 20
  },
  buttonText: {
    fontSize: 20,
    color: '#eeeeee',
    alignSelf: 'center'
  },
  dialogOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flex: 1,
    // alignItems: 'center',
    justifyContent: 'center',
    // position: 'absolute',
    // top: 0,
    // bottom: 0,
    // left: 0,
    // right: 0
  },

})
module.exports = NewPrompt

  // render() {
  //   return (
  //       <Modal
  //          animationType={'none'}
  //          transparent={true}
  //          visible={this.props.visible}>
  //        <View style={styles.dialogOverlay}>
  //          <Text style={styles.font}>{this.props.title}</Text>
  //           <StringChooser strings={this.props.strings} notModel={true} callback={(val) => {
  //             this.setState({value: val})
  //           }}/>
  //           <View style={styles.buttons}>
  //             <TouchableOpacity onPress={() => this.props.onSubmit(this.state.value)}>
  //               <View style={styles.button}>
  //                 <Text style={styles.buttonText}>{translate('submit')}</Text>
  //               </View>
  //             </TouchableOpacity>
  //           </View>
  //         </View>
  //       </Modal>
  //   );
  // }
  // render() {
  //   return (
  //     <Modal
  //        animationType={'none'}
  //        transparent={true}
  //        visible={this.props.visible}>
  //      <View style={styles.dialogOverlay}>
  //        <Text style={styles.font}>{this.props.title}</Text>
  //        <Select
  //           width={250}
  //           ref="SELECT1"
  //           optionListRef={this._getOptionList.bind(this)}
  //           defaultValue="Select a Province in Canada ..."
  //           onSelect={this.props.onSubmit.bind(this)}>
  //           <Option>Alberta</Option>
  //           <Option>British Columbia</Option>
  //           <Option>Manitoba</Option>
  //           <Option>New Brunswick</Option>
  //           <Option>Newfoundland and Labrador</Option>
  //           <Option>Northwest Territories</Option>
  //           <Option>Nova Scotia</Option>
  //           <Option>Nunavut</Option>
  //           <Option>Ontario</Option>
  //           <Option>Prince Edward Island</Option>
  //           <Option>Quebec</Option>
  //           <Option>Saskatchewan</Option>
  //           <Option>Yukon</Option>
  //         </Select>

  //         <OptionList ref="OPTIONLIST"/>
  //       </View>
  //     </Modal>
  //   );
  // }
