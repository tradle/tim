import React, { Component } from 'react'
import {
  Image,
  StyleSheet,
  View,
} from 'react-native'

import PropTypes from 'prop-types'
import ImageStylePropTypes from 'DeprecatedImageStylePropTypes'
import ViewStylePropTypes from 'DeprecatedViewStylePropTypes'
import pick from 'lodash/pick'

import Embed from '@tradle/embed'
import ActivityIndicator from './ActivityIndicator'
import { getGlobalKeeper } from '../utils/keeper'

const isKeeperUri = uri => uri && Embed.isKeeperUri(uri)
const getUriProp = props => props && props.source && props.source.uri
const shouldRefetch = (oldProps, newProps) => {
  const oldUri = getUriProp(oldProps)
  const newUri = getUriProp(newProps)
  return newUri && newUri !== oldUri && isKeeperUri(newUri)
}

const getDefaultLoader = props => () => (
  <View style={[styles.container, pick(props, ViewStylePropTypes)]}>
    <ActivityIndicator size='small' style={styles.loader} />
  </View>
)

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

export const wrapImageComponent = ImageComponent => {
  return class ImageComponentWrapper extends Component {
    static displayName = ImageComponent.displayName + 'Async'
    static propTypes = {
      ...ImageStylePropTypes,
      keeper: PropTypes.object,
      loading: PropTypes.func,
    }

    constructor(props) {
      super(props)
      this.keeper = props.keeper || getGlobalKeeper()
      this.renderLoader = props.loading ? props.loading.bind(props) : getDefaultLoader(props)

      const uri = getUriProp(props)
      if (isKeeperUri(uri)) {
        this.state = {
          loading: true,
          source: null,
        }
      } else {
        this.state = {
          source: props.source,
        }
      }
    }

    componentWillReceiveProps(props) {
      this._maybeRefetch(this.props, props)
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
      const uri = await this.keeper.prefetchUri(keeperUri)
      this.setState({
        loading: false,
        source: {
          ...props.source,
          uri,
        }
      })
    }

    componentWillMount() {
      this._maybeRefetch(null, this.props)
    }

    render() {
      if (this.state.loading) {
        return this.renderLoader()
      }

      const { keeper, loading, source, ...rest } = this.props
      const imageProps = { ...rest, source: this.state.source }
      return <ImageComponent {...imageProps} />
    }
  }

  // it would be tempting to return a regular unwrapped Image component
  // if initial props.source.uri is not a keeperUri, as in the snipper below
  //
  // this would be a mistake, as this component may initially get a regular uri
  // and then get a keeperUri later via componentWillReceiveProps

  // return props => {
  //   const { source } = props
  //   if (source && source.uri && isKeeperUri(source.uri)) {
  //     return <ImageComponentWrapper {...props} />
  //   }

  //   return <ImageComponent {...props} />
  // }
}

export default wrapImageComponent(Image)
