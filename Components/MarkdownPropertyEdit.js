
import utils from '../utils/utils'
import PageView from './PageView'

import StyleSheet from '../StyleSheet'
import platformStyles from '../styles/platform'
import Markdown from './Markdown'
import format from 'string-template'

import {
  View,
  TextInput,
  ScrollView,
} from 'react-native'
import PropTypes from 'prop-types';

import React, { Component } from 'react'

class MarkdownPropertyEdit extends Component {
  static propTypes = {
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
    let { bankStyle, resource } = this.props
    const markdownStyles = {
      heading1: {
        fontSize: 24,
        color: 'purple',
      },
      link: {
        color: bankStyle.linkColor,
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
    let { value } = this.state
    let markdown
    if (value && value.length)
      markdown = <View style={[styles.container, {backgroundColor: value.length ? '#f7f7f7' : 'transparent', paddingBottom: 5 }]}>
                  <Markdown markdownStyles={markdownStyles}>
                    {format(value, resource)}
                  </Markdown>
                </View>
    let width = utils.dimensions(MarkdownPropertyEdit).width
    return (
      <PageView style={platformStyles.container}>
        <ScrollView  ref='this' style={{alignSelf: 'center'}}>
          <TextInput
            style={{borderBottomColor: '#eeeeee', width: width,  borderBottomWidth: 1, height: 300, fontSize: 16, paddingHorizontal: 10 }}
            ref='textInput'
            onChangeText={this.onChangeText.bind(this)}
            value={value}
            underlineColorAndroid={this.props.underlineColorAndroid}
            multiline={true}
            numberOfLines={10}
          />
          {markdown}
        </ScrollView>
      </PageView>
    )
  }
  onChangeText(value) {
    // let val = format(value, this.props.resource)
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
