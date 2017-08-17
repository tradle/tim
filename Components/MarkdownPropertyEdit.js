'use strict';

var utils = require('../utils/utils');
var PageView = require('./PageView')
var extend = require('extend');
import Icon from 'react-native-vector-icons/Ionicons';

var StyleSheet = require('../StyleSheet')
import platformStyles from '../styles/platform'
var Markdown = require('./Markdown')

import {
  Platform,
  View,
  Text,
  TextInput,
  ScrollView,
} from 'react-native';

import React, { Component, PropTypes } from 'react'
import { makeResponsive } from 'react-native-orient'

class MarkdownPropertyEdit extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    prop: PropTypes.object.isRequired,
    callback: PropTypes.func,
    returnRoute: PropTypes.object,
  };

  constructor(props) {
    super(props);
    let {resource, prop} = props
    this.state = {
      value: resource[prop.name] || ''
    }
    var currentRoutes = this.props.navigator.getCurrentRoutes()
    var currentRoutesLength = currentRoutes.length
    currentRoutes[currentRoutesLength - 1].onRightButtonPress = this.done.bind(this)

    this.scrollviewProps = {
      automaticallyAdjustContentInsets:true,
      scrollEventThrottle: 50,
      onScroll: this.onScroll.bind(this)
    };
  }
  done() {
    let {navigator, callback, prop} = this.props
    navigator.pop()
    callback(prop, this.state.value)
  }
  onScroll(e) {
    this._contentOffset = { ...e.nativeEvent.contentOffset }
  }
  render() {
    let {bankStyle} = this.props
    const markdownStyles = {
      heading1: {
        fontSize: 24,
        color: 'purple',
      },
      link: {
        color: this.props.bankStyle.linkColor,
        textDecorationLine: 'none'
      },
      mailTo: {
        color: 'orange',
      },
      text: {
        color: '#757575',
        fontStyle: 'italic'
      },
    }
    let {value} = this.state
    let markdown
    if (value && value.length)
      markdown = <View style={[styles.container, {backgroundColor: value.length ? '#f7f7f7' : 'transparent', paddingBottom: 5 }]}>
                  <Markdown contentContainerStyle={styles.container} markdownStyles={markdownStyles}>
                    {value}
                  </Markdown>
                </View>
    return (
      <PageView style={platformStyles.container}>
        <TextInput
          style={{borderBottomColor: '#eeeeee', borderBottomWidth: 1, height: 300, fontSize: 16, paddingHorizontal: 10 }}
          ref='textInput'
          onChangeText={this.onChangeText.bind(this)}
          value={value}
          underlineColorAndroid={this.props.underlineColorAndroid}
          multiline={true}
          numberOfLines={10}
        />
        {markdown}
      </PageView>
    )
  }
  onChangeText(value) {
    this.setState({value: value})
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
})

module.exports = MarkdownPropertyEdit;
