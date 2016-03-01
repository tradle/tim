var React = require('react-native')
var {
  View,
  Image,
  PropTypes,
  Dimensions,
  StyleSheet
} = React
var PasswordGesture = require('react-native-gesture-password')
var translate = require('../utils/utils').translate
var MIN_LENGTH = 5
var Password1 = ''
var BG_IMAGE = require('../img/bg.png')
var MODES = {
  check: 'check',
  set: 'set'
}

module.exports = React.createClass({
  propTypes: {
    isCorrect: PropTypes.func,
    validate: PropTypes.func,
    onSuccess: PropTypes.func,
    onFail: PropTypes.func,
    maxAttempts: PropTypes.number,
    promptSet: PropTypes.string,
    promptCheck: PropTypes.string,
    promptReenter: PropTypes.string,
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
      promptSet: translate('pleaseDrawPattern'), //'Please draw a pattern',
      promptCheck: translate('drawYourPattern'), //Draw your pattern',
      promptReenter: translate('pleaseDrawYourPatternAgain'), // Please draw your pattern again',
      promptInvalidSet: translate('invalidPattern'), //Invalid pattern, please try again',
      promptRetrySet: translate('patternNotMatching'), //Patterns didn\'t match. Please start again',
      promptRetryCheck: translate('wrongPattern'), //Wrong pattern',
      successMsg: translate('correctGesture'), //Correct gesture detected',
      failMsg: translate('authenticationFailed'), //Authentication failed',
      maxAttempts: Infinity
    }
  },

  getInitialState: function() {
    if (this.props.mode === MODES.check) {
      return {
        status: 'normal',
        message: this.props.promptCheck,
        attempts: 0
      }
    } else {
      return {
        status: 'normal',
        message: this.props.promptSet,
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

      return this.setState({
        message: this.props.promptReenter,
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
    var { width, height } = Dimensions.get('window')
    return (
      <View>
        <Image source={BG_IMAGE} style={[styles.bg, { width, height }]} />
        <PasswordGesture
          ref='pg'
          shell={true}
          nucleus={true}
          styles={
            {
              frame: { backgroundColor: 'transparent' },
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

var styles = StyleSheet.create({
  bg: {
    position:'absolute',
    left: 0,
    top: 0
  }
})

module.exports.Modes = MODES
