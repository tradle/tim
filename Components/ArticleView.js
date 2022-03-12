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
import platformStyles from '../styles/platform'

// import defaultBankStyle from '../styles/bankStyle.json'
import defaultBankStyle from '../styles/defaultBankStyle.json'
import utils, {
  translate
} from '../utils/utils'

class ArticleView extends Component {
  static propTypes = {
    href: PropTypes.string,
    url: PropTypes.string,
    bankStyle: PropTypes.object,
    action: PropTypes.string,
    actionBarTitle: PropTypes.string
  };
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
            <Text>{translate('loading')}</Text>
            <ActivityIndicator style={{alignSelf: 'center'}} />
          </View>
        </View>
      </ScrollView>
    )
  }
  render() {
    let { bankStyle, actionBarTitle, href, url, action } = this.props
    bankStyle = bankStyle || defaultBankStyle
    let isWeb = utils.isWeb()
    let wView = <WebView style={isWeb && {flex: 1} || styles.webView}
                  source={href ? {uri: href} : url}
                  startInLoadingState={true}
                  renderError={this.renderError.bind(this)}
                  automaticallyAdjustContentInsets={false}
                  renderLoading={this.renderLoading}/>

    if (!actionBarTitle)
      return wView

    let actionItem = <TouchableOpacity onPress={action}>
               <View style={{marginHorizontal: -3, backgroundColor: bankStyle.contextBackgroundColor, borderTopColor: bankStyle.contextBackgroundColor, borderTopWidth: StyleSheet.hairlineWidth, height: 45, justifyContent: 'center', alignItems: 'center'}}>
                 <View style={{backgroundColor: 'transparent', paddingHorizontal: 10, justifyContent: 'center'}}>
                   <Text style={{fontSize: 20,color: bankStyle.contextTextColor}}>{translate(actionBarTitle || 'next')}</Text>
                 </View>
               </View>
             </TouchableOpacity>
    return (
      <View style={[platformStyles.container, {height: utils.dimensions().height}]}>
        {wView}
        {actionItem}
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
