import {
  View,
  Text,
  ScrollView,
  // TouchableOpacity
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
  translate,
  isDataUrl
} from '../utils/utils'

const isKeeperUri = uri => uri && Embed.isKeeperUri(uri)
const getUriProp = props => props && props.item && props.item.url
const shouldRefetch = (oldProps, newProps) => {
  const oldUri = getUriProp(oldProps)
  const newUri = getUriProp(newProps)
  return newUri && newUri !== oldUri && isKeeperUri(newUri)
}
import Embed from '@tradle/embed'
import { getGlobalKeeper, getBase64ForTag } from '../utils/keeper'

class PdfView extends Component {
  static propTypes = {
    pdf: PropTypes.string
  };
  constructor(props) {
    super(props);
    this.keeper = props.keeper || getGlobalKeeper()
    this.state = {
      uri: props.item.url,
    }
    let currentRoutes = props.navigator.getCurrentRoutes()
    let currentRoutesIdx = currentRoutes.length - 1
    currentRoutes[currentRoutesIdx].onRightButtonPress = this.submit.bind(this)
  }
  componentWillMount() {
    this._maybeRefetch(null, this.props)
  }

  componentWillReceiveProps(props) {
    this._maybeRefetch(this.props.item, props.item)
  }
  submit() {
    this.props.navigator.pop()
    let { prop, item, onSubmit } = this.props
    if (onSubmit)
      onSubmit(prop, item)
  }
  renderError(description) {
    return <Text  style={styles.error}>error :( - {description && description || ''}</Text>
  }

  async _maybeRefetch(oldProps, newProps) {
    if (!shouldRefetch(oldProps, newProps)) return

    try {
      await this._refetch(newProps)
    } catch (err) {
      console.log('failed to prefetch image from keeper', err.message)
    }
  }

  async _refetch(props) {
    const keeperUri = getUriProp(props)
    const base64 = await this.keeper.getBase64ForKeeperUri(keeperUri)
    this.setState({
      uri: base64,
    })
  }

  renderLoading() {
    return <View style={styles.loadingContainer}>
             <ActivityIndicator size='small' style={styles.loader} />
           </View>
  }
  render() {
    let { item } = this.props
    let uri = this.state.uri || item.url
    let resourceType = 'base64' //isDataUrl(url) && 'base64' || 'url'
    return <PDFView
      style={platformStyles.container}
      onError={(error) => this.renderError(error)}
      onLoad={this.renderLoading}
      resource={uri}
      resourceType={resourceType}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    alignSelf: 'center'
  },

})

module.exports = PdfView;
