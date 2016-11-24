'use strict'

import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native'
import React, { Component } from 'react'
import utils from '../utils/utils'
var translate = utils.translate
import Icon from 'react-native-vector-icons/Ionicons'
var constants = require('@tradle/constants');

class ChatContext extends Component {
  props: {
    chat: PropTypes.object.isRequired,
    context: PropTypes.object.isRequired,
    contextChooser: PropTypes.func.isRequired,
    shareWith: PropTypes.func.isRequired,
    bankStyle: PropTypes.object.isRequired,
    allContexts: PropTypes.bool.isRequired
  };
  constructor(props) {
    super(props)
  }

  render() {
    if (!this.props.context)
      return <View/>
    // if (!this.props.context  ||  this.props.context._readOnly)
    //   return <View/>

    let bar = this.props.allContexts ? styles.barAll : styles.barOne
    let chooser =  <TouchableOpacity onPress={this.props.contextChooser} style={{flex: 1, padding: 10}}>
                      <Text style={[this.props.allContexts ? styles.textAll : styles.textOne, styles.text]}>{translate(utils.getModel(this.props.context.product).value)}</Text>
                    </TouchableOpacity>
    // HACK: if me is employee no sharing for now


    let share
    if (this.props.allContexts)
      share = <View/>
    else if (utils.getMe().isEmployee  &&  this.props.chat[constants.TYPE] === constants.TYPES.PROFILE)
      share = <View/>
    else
      share = <TouchableOpacity onPress={this.props.shareWith} style={{position: 'absolute', right: 10, padding: 10}}>
                <Icon size={22} name='md-share' color='#7D6EC4' style={{marginRight: 10, paddingLeft: 20}} />
              </TouchableOpacity>
    return (
            <View style={[bar, styles.bar, {flexDirection: 'row'}]}>
              {chooser}
              {share}
            </View>
            )


    // return this.props.context
    //       ? <View style={this.props.allContexts ? styles.barAll : styles.bar}>
    //           <TouchableOpacity onPress={this.props.contextChooser}>
    //             <Text style={this.props.allContexts ? styles.textAll : styles.text}>{translate(utils.getModel(this.props.context.product).value)}</Text>
    //           </TouchableOpacity>
    //           {this.props.allContexts
    //             ? <View />
    //             : <TouchableOpacity onPress={this.props.shareWith}>
    //                 <Icon size={22} name='md-share' color='#7D6EC4' style={{marginRight: 10, paddingLeft: 20}} />
    //               </TouchableOpacity>
    //           }
    //         </View>
    //       : <View/>

  }

}

var styles = StyleSheet.create({
  barOne: {
    backgroundColor: '#ECE8FF',
  },
  barAll: {
    backgroundColor: '#f1ffe7',
  },
  bar: {
    // borderTopColor: '#dddddd',
    // borderTopWidth: StyleSheet.hairlineWidth,
    // padding: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eeeeee',
    // flexDirection: 'row',
    // justifyContent: 'space-between',
  },
  textAll: {
    fontSize: 18,
  },
  textOne: {
    color: '#7D6EC4',
  },
  text: {
    fontSize: 18,
    // alignSelf: 'center',
    marginHorizontal: 10
  }
});

module.exports = ChatContext
