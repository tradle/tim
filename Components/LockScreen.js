import PropTypes from 'prop-types';
import React from 'react';
import {
  View,
  Text,
  StyleSheet
} from 'react-native'

import BackgroundImage from './BackgroundImage'
import NoBacksies from './NoBacksies'

class LockScreen extends NoBacksies {
  static displayName = 'LockScreen';
  static propTypes = {
    bg: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    timer: positiveIntegerChecker,
    message: PropTypes.string,
    callback: PropTypes.func.isRequired,
    styles: PropTypes.shape({
      message: PropTypes.style,
      timer: PropTypes.style
    })
  };

  constructor(props) {
    super(props)
    this.state = {
      ttl: Math.ceil(props.timer)
    }
  }

  componentDidMount() {
    this._countdown = setInterval(() => {
      const ttl = this.state.ttl - 1
      if (!ttl) {
        clearInterval(this._countdown)
        return this.props.callback()
      }

      this.setState({ ttl })
    }, 1000)
  }

  componentWillUnmount() {
    clearInterval(this._countdown)
  }

  render() {
    const { bg, message, style={} } = this.props
    const { ttl } = this.state
    const minutes = pad(ttl / 60 | 0)
    const seconds = pad(ttl % 60 | 0)
    return (
      <View style={DEFAULT_STYLE.container}>
        {bg && <BackgroundImage source={bg} />}
        {message && <Text style={[DEFAULT_STYLE.message, style.message]}>{message}</Text>}
        <Text style={[DEFAULT_STYLE.timer, style.timer]}>{`${minutes}:${seconds}`}</Text>
      </View>
    )
  }
}

const DEFAULT_STYLE = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    // alignSelf: 'stretch'
  },
  message: {
    textAlign: 'center',
    fontSize: 24,
    color: '#ffffff'
  },
  timer: {
    textAlign: 'center',
    fontSize: 50,
    color: '#ffffff'
  }
})

function positiveIntegerChecker (props, propName, componentName, location) {
  const val = props[propName]
  return typeof val === 'number' && (val | 0) === val
    ? null
    : new Error(`expected positive integer value for "${propName}"`)
}

function pad (n) {
  return n < 10 ? '0' + n : '' + n
}

module.exports = LockScreen
