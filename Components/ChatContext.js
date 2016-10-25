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
  constructor(props) {
    super(props)
  }

  render() {
    if (!this.props.context)
      return <View/>

    return (
            <TouchableOpacity onPress={this.props.allContexts ? this.props.contextChooser : this.props.shareWith}>
              <View style={[this.props.allContexts ? styles.barAll : styles.barOne, styles.bar]}>
                <Text style={[this.props.allContexts ? styles.textAll : styles.textOne, styles.text]}>{translate(utils.getModel(this.props.context.product).value)}</Text>
              {this.props.allContexts
                ? <View/>
                : <Icon size={22} name='md-share' color='#7D6EC4' style={{marginRight: 10, paddingLeft: 20}} />
              }
              </View>
            </TouchableOpacity>
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
    borderTopColor: '#dddddd',
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: '#eeeeee',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  textAll: {
    fontSize: 18,
  },
  textOne: {
    color: '#7D6EC4',
  },
  text: {
    fontSize: 18,
    alignSelf: 'center',
    marginHorizontal: 10
  }
});

module.exports = ChatContext
