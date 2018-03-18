console.log('requiring ArticleView.js')

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity
  // StyleSheet,
} from 'react-native'
import PropTypes from 'prop-types'

import React, { Component } from 'react'
import ActivityIndicator from './ActivityIndicator'
import WebView from './WebView'
import StyleSheet from '../StyleSheet'

// import defaultBankStyle from '../styles/bankStyle.json'
import defaultBankStyle from '../styles/defaultBankStyle.json'
import utils, {
  translate
} from '../utils/utils'

class ArticleView extends Component {
  constructor(props) {
    super(props);
  }
  renderError(domain, code, description) {
    return <Text  style={styles.error}>error :( - {description ? description : ''}</Text>
  }
  renderLoading() {
    return (
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.container}>
          <View style={styles.loading}>
            <Text>Loading...</Text>
            <ActivityIndicator style={{alignSelf: 'center'}} />
          </View>
        </View>
      </ScrollView>
    )
  }
  render() {
    let bankStyle = this.props.bankStyle || defaultBankStyle
    let actionBarTitle = this.props.actionBarTitle
    let wView = <WebView style={styles.webView}
                  source={this.props.href ? {uri: this.props.href} : this.props.url}
                  startInLoadingState={true}
                  renderError={this.renderError.bind(this)}
                  automaticallyAdjustContentInsets={false}
                  renderLoading={this.renderLoading}/>

    if (!actionBarTitle)
      return wView

    let action = <TouchableOpacity onPress={this.props.action}>
                   <View style={{marginHorizontal: -3, backgroundColor: bankStyle.contextBackgroundColor, borderTopColor: bankStyle.contextBackgroundColor, borderTopWidth: StyleSheet.hairlineWidth, height: 45, justifyContent: 'center', alignItems: 'center'}}>
                     <View style={{backgroundColor: 'transparent', paddingHorizontal: 10, justifyContent: 'center'}}>
                       <Text style={{fontSize: 20,color: bankStyle.contextTextColor}}>{translate(this.props.actionBarTitle || 'next')}</Text>
                     </View>
                   </View>
                 </TouchableOpacity>
    return (
      <View style={{height: utils.dimensions().height}}>
        {wView}
        {action}
      </View>
    )

  }
}

var styles = StyleSheet.create({
  contentContainer: {
    padding: 10,
  },
  container: {
    flex: 1
  },
  error: {
    marginTop: 160,
    paddingHorizontal: 20,
    fontSize: 20,
    color: '#7AAAC3'
  },
  webView: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    marginTop: 60,
    width: '100%'
    // don't set height on web
    // height: utils.isWeb() ? '100%' : 350
  }
})

module.exports = ArticleView;
