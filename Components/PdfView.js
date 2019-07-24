import {
  View,
  Text,
  ScrollView,
  TouchableOpacity
  // StyleSheet,
} from 'react-native'
import PropTypes from 'prop-types'
import PDFView from 'react-native-view-pdf';
// import Pdf from 'react-native-pdf'

import React, { Component } from 'react'
import ActivityIndicator from './ActivityIndicator'
import StyleSheet from '../StyleSheet'
import platformStyles from '../styles/platform'

import utils, {
  translate
} from '../utils/utils'


class PdfView extends Component {
  static propTypes = {
    pdf: PropTypes.string
  };
  constructor(props) {
    super(props);

    let currentRoutes = props.navigator.getCurrentRoutes()
    let currentRoutesIdx = currentRoutes.length - 1
    currentRoutes[currentRoutesIdx].onRightButtonPress = this.onSubmit.bind(this)
  }
  onSubmit() {
    this.props.navigator.pop()
    let { prop, item, onSubmit } = this.props
    onSubmit(prop, item)
  }
  renderError(description) {
    return <Text  style={styles.error}>error :( - {description && description || ''}</Text>
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
    let { item } = this.props

    return <PDFView
      style={platformStyles.container}
      onError={(error) => this.renderError(error)}
      onLoad={this.renderLoading}
      resource={item.url}
      resourceType={'base64'}
    />
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1
  },
  error: {
    marginTop: 160,
    paddingHorizontal: 20,
    fontSize: 20,
    color: '#7AAAC3'
  },

})

module.exports = PdfView;
