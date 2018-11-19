import React, { Component } from 'react'
import {
  Image,
  StyleSheet,
  View,
} from 'react-native'

import PropTypes from 'prop-types'
import ImageStylePropTypes from 'ImageStylePropTypes'
import ViewStylePropTypes from 'ViewStylePropTypes'
import pick from 'lodash/pick'

import { isKeeperUri } from '@tradle/embed'
import ActivityIndicator from './ActivityIndicator'
import { getGlobalKeeper } from '../utils/keeper'

const getDefaultLoader = props => () => (
  <View style={[styles.container, pick(props, ViewStylePropTypes)]}>
    <ActivityIndicator size='small' style={styles.loader} />
  </View>
)

export default renderImage = props => {
  const { source } = props
  if (source && source.uri && isKeeperUri(source.uri)) {
    return <ImageWrapper {...props} />
  }

  return <Image {...props} />
}

class ImageWrapper extends Component {
  static propTypes = {
    ...ImageStylePropTypes,
    keeper: PropTypes.object,
    loading: PropTypes.func,
  }

  state = {
    loading: true,
    source: null,
  }

  constructor(props) {
    super(props)
    this.keeper = props.keeper || getGlobalKeeper()
    this.renderLoader = props.loading ? props.loading.bind(props) : getDefaultLoader(props)
  }

  componentWillReceiveProps(props) {
    if (props.source && props.source.uri !== this.props.source.uri) {
      this._refetch(props)
    }
  }

  async _refetch(props) {
    const uri = await this.keeper.prefetchUri(props.source.uri)
    this.setState({
      loading: false,
      source: { uri }
    })
  }

  componentWillMount() {
    this._refetch(this.props)
  }

  render() {
    if (this.state.loading) {
      return this.renderLoader()
    }

    const { keeper, loading, source, ...rest } = this.props
    const imageProps = { ...rest, source: this.state.source }
    return <Image {...imageProps} />
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    alignSelf: 'center'
  },
})
