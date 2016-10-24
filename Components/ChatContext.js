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
  // render() {
  //   return this.props.context
  //         ? <View style={styles.bar}>
  //             <Text style={styles.text}>{translate(utils.getModel(this.props.context.product).value)}</Text>
  //             {this.props.allContexts
  //               ? <TouchableOpacity onPress={this.props.contextChooser}>
  //                   <Icon size={25} name='md-more' color='#AAAAAA' style={{marginRight: 10}} />
  //                 </TouchableOpacity>
  //               : <View/>
  //             }
  //           </View>
  //         : <View/>

  // }

  render() {
    return this.props.context
          ? <View style={this.props.allContexts ? styles.barAll : styles.bar}>
              <TouchableOpacity onPress={this.props.contextChooser}>
                <Text style={this.props.allContexts ? styles.textAll : styles.text}>{translate(utils.getModel(this.props.context.product).value)}</Text>
              </TouchableOpacity>
              {this.props.allContexts
                ? <View />
                : <TouchableOpacity onPress={this.props.shareWith}>
                    <Icon size={22} name='md-share' color='#7D6EC4' style={{marginRight: 10, paddingLeft: 20}} />
                  </TouchableOpacity>
              }
            </View>
          : <View/>

  }

}

var styles = StyleSheet.create({
  bar: {
    backgroundColor: '#ECE8FF',
    borderTopColor: '#dddddd',
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  barAll: {
    backgroundColor: '#f1ffe7',
    borderTopColor: '#dddddd',
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  textAll: {
    fontSize: 18,
    color: '#289427',
    alignSelf: 'center',
    marginHorizontal: 10
  },
  text: {
    fontSize: 18,
    color: '#7D6EC4',
    alignSelf: 'center',
    marginHorizontal: 10
  }
});

module.exports = ChatContext
