import React, { PropTypes } from 'react'
import {
  View,
  Image,
  Dimensions,
  StyleSheet
} from 'react-native'

import { getDimensions } from 'react-native-orient'
import BackgroundImage from './BackgroundImage'
var PasswordGesture = require('react-native-gesture-password')
var MIN_LENGTH = 5
var Password1 = ''
var BG_IMAGE = require('../img/bg.png')
var MODES = {
  check: 'check',
  set: 'set'
}

var PasswordCheck = React.createClass({
  propTypes: {
    // whether the user already has a password
    // and is choosing a new one
    isChange: PropTypes.bool,
    isCorrect: PropTypes.func,
    validate: PropTypes.func,
    onSuccess: PropTypes.func,
    onFail: PropTypes.func,
    maxAttempts: PropTypes.number,
    promptSet: PropTypes.string,
    promptCheck: PropTypes.string,
    promptReenter: PropTypes.string,
    promptReenterChange: PropTypes.string,
    promptRetrySet: PropTypes.string,
    promptRetryCheck: PropTypes.string,
    promptInvalidSet: PropTypes.string,
    successMsg: PropTypes.string,
    failMsg: PropTypes.string,
    mode: function (props, propName) {
      return props[propName] in MODES ? null : new Error('Invalid mode')
    }
  },

  getDefaultProps: function () {
    return {
      validate: () => true,
      maxAttempts: Infinity
    }
  },

  getInitialState: function() {
    var state
    if (this.props.mode === MODES.check) {
      var message = this.props.isChange
        ? this.props.promptCheckCurrent
        : this.props.promptCheck

      return {
        status: 'normal',
        message: message,
        attempts: 0
      }
    } else {
      var message = this.props.isChange
        ? this.props.promptSetChange
        : this.props.promptSet

      return {
        status: 'normal',
        message: message,
        attempts: 0
      }
    }
  },

  _onStart: function () {
    this.setState({ status: 'normal' })
  },

  _onEntered: function (password) {
    switch (this.props.mode) {
      case MODES.check:
        return this._checkPassword(password)
      case MODES.set:
        return this._setPassword(password)
    }
  },

  _setPassword: function (password) {
    if (this.state.attempts === 0) {
      if (!this.props.validate(password)) {
        return this.setState({
          message: this.props.promptInvalidSet,
          status: 'wrong'
        })
      }

      var message = this.props.isChange
        ? this.props.promptReenterChange
        : this.props.promptReenter

      return this.setState({
        message: message,
        attempts: 1,
        password: password,
        status: 'normal'
      })
    }

    if (this.state.password === password) {
      this.setState({
        status: 'right',
        message: ''
      })

      return this.props.onSuccess(password)
    }

    return this.setState({
      attempts: 0,
      status: 'wrong',
      message: this.props.promptRetrySet
    })
  },

  _checkPassword: function (password) {
    this.props.isCorrect(password)
      .then((isCorrect) => {
        if (isCorrect) {
          this.setState({
            status: 'right',
            message: this.props.successMsg
          })

          return this.props.onSuccess()
        }

        if (++this.state.attempts >= this.props.maxAttempts) {
          this.setState({
            status: 'wrong',
            attempts: this.state.attempts,
            message: this.props.failMsg
          })

          return this.props.onFail()
        }

        this.setState({
          status: 'wrong',
          attempts: this.state.attempts,
          message: this.props.promptRetryCheck
        })
      })
      .done()
  },

  render: function() {
    return (
      <View style={styles.container}>
        <BackgroundImage source={BG_IMAGE} />
        <PasswordGesture
          lockToPortrait={true}
          ref='pg'
          shell={true}
          nucleus={true}
          styles={
            {
              frame: containerRawStyle,
              msgText: { fontSize: 18 },
              line: { height: 2, backgroundColor: '#ffffff' }
            }
          }
          baseColor={'#ffffff'}
          rightColor={'#55ff55'}
          wrongColor={'#ff5555'}
          radius={{ inner: 18, outer: 25 }}
          status={this.state.status}
          message={this.state.message}
          msgStyle={{fontSize:20}}
          onStart={() => this._onStart()}
          onEnd={(password) => this._onEntered(password)}
        />
      </View>
    )
  }
})

PasswordCheck.displayName = 'PasswordCheck'
PasswordCheck.orientation = 'PORTRAIT'
module.exports = PasswordCheck

var containerRawStyle = {
  backgroundColor: 'transparent',
  flex: 1,
  alignSelf: 'stretch'
}

var styles = StyleSheet.create({
  container: containerRawStyle
})

module.exports.displayName = 'PasswordCheck'
module.exports.Modes = MODES
