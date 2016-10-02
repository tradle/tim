import React, { PropTypes, Component } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableHighlight,
  StyleSheet
} from 'react-native'

import t from 'tcomb-form-native'
import Icon from 'react-native-vector-icons/Ionicons'
// import FloatingLabel from 'react-native-floating-labels'

const Form = t.form.Form
const SetType = t.struct({
  password: t.String,
  passwordAgain: t.String
})

const CheckType = t.struct({
  password: t.String
})

const Modes = {
  set: 'set',
  check: 'check'
}

const ERROR_COLOR = '#a94442'

class PasswordEntry extends Component {
  static propTypes = {
    validate: PropTypes.func,
    onSuccess: PropTypes.func,
    onFail: PropTypes.func,
    passwordRequirements: PropTypes.string,
    submitText: PropTypes.string,
    isCorrect: PropTypes.func,
    maxAttempts: PropTypes.number,
    promptSet: PropTypes.string,
    promptCheck: PropTypes.string,
    promptReenter: PropTypes.string,
    promptRetrySet: PropTypes.string,
    promptRetryCheck: PropTypes.string,
    promptInvalidSet: PropTypes.string,
    successMsg: PropTypes.string,
    failMsg: PropTypes.string,
    style: PropTypes.shape({
      container: View.propTypes.style,
      form: View.propTypes.style,
      submit: View.propTypes.style,
      submitText: View.propTypes.style
    }),
    mode: function (mode) {
      return mode in Modes
    }
  };

  constructor(props) {
    super(props)
    this.state = this.props.mode === 'set' ? this._getInitialSetState() : this._getInitialCheckState()
    this.onPress = this.onPress.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  _getInitialSetState() {
    return {
      value: {
        password: '',
        passwordAgain: ''
      },
      errors: {
        password: null,
        passwordAgain: null
      }
    }
  }

  _getInitialCheckState() {
    return {
      value: {
        password: ''
      },
      attempts: 0
    }
  }

  componentDidMount() {
    var input = this.refs.form.getComponent('password').refs.input
    if (!input.focus) input = input.refs.input
    input.focus()
    input.addEventListener('keydown', e => {
      if (!input.value || this.isDisabled()) return

      const code = e.keyCode ? e.keyCode : e.which
      if (code == 13) { // Enter keycode
        this.onPress()
      }
    })
  }

  onChange(value, path) {
    if (this.props.mode === 'set') {
      this._onChangeSet(...arguments)
    } else {
      this._onChangeCheck(...arguments)
    }
  }

  _onChangeCheck(value, path) {
    this.setState({value})
  }

  _onChangeSet(value, path) {
    this.setState({
      value,
      errors: this.validate(value, path[0] === 'passwordAgain')
    })
  }

  validate(value, both) {
    var passwordError = this.props.validate(value && value.password || '')
    if (passwordError === false) passwordError = this.props.promptInvalidSet || 'Invalid password'
    else if (passwordError === true) passwordError = null

    const errors = {
      password: passwordError
    }

    if (!passwordError && both) {
      if (!value || value.password !== value.passwordAgain) {
        errors.passwordAgain = "Passwords don't match"
      }
    }

    return errors
  }

  onPress() {
    if (this.isDisabled()) return

    if (this.props.mode === 'set') {
      this._onSet()
    } else {
      this._onCheck()
    }
  }

  _onSet() {
    const errors = this.validate(this.refs.form.getValue(), true)
    if (errors.password || errors.passwordAgain) {
      this.setState({ errors })
    } else {
      this.props.onSuccess(this.state.value.password)
    }
  }

  _onCheck() {
    const fields = this.refs.form.getValue()
    if (!fields) return

    const password = fields.password
    const result = this.props.isCorrect(password)
    const promise = typeof result === 'boolean' ? Promise.resolve(result) : result
    return promise.then(isCorrect => {
      if (isCorrect) return this.props.onSuccess(password)

      const attempts = this.state.attempts + 1
      this.setState({ attempts }, () => {
        if (attempts >= this.props.maxAttempts) {
          return this.props.onFail()
        }
      })
    })
  }

  isDisabled() {
    return this.props.mode === 'check' && this.state.attempts >= this.props.maxAttempts
  }

  hasError() {
    return this.props.mode === 'set'
      ? !!(this.state.errors.password || this.state.errors.passwordAgain)
      : this.state.attempts > 0
  }

  _getOptions() {
    return this.props.mode === 'set' ? this._getSetOptions() : this._getCheckOptions()
  }

  _getSetOptions() {
    return {
      auto: 'placeholders',
      fields: {
        password: {
          placeholder: 'Password',
          password: true,
          secureTextEntry: true,
          error: this.state.errors.password,
          hasError: !!this.state.errors.password,
          help: this.props.passwordRequirements
        },
        passwordAgain: {
          placeholder: 'Re-enter password',
          password: true,
          secureTextEntry: true,
          hasError: !!this.state.errors.passwordAgain,
          error: this.state.errors.passwordAgain
        }
      },
      order: ['password', 'passwordAgain']
    }
  }

  _getCheckOptions() {
    return {
      auto: 'placeholders',
      fields: {
        password: {
          password: true,
          secureTextEntry: true,
          hasError: this.state.attempts > 0,
          help: this.props.passwordRequirements
        }
      }
    }
  }

  render() {
    const options = this._getOptions()
    const disabled = this.isDisabled()
    if (disabled) {
      t.update(options, {
        fields: {
          password: {
            editable: {'$set': false}
          }
        }
      })
    }

    const customStyle = this.props.style || {}
    const type = this.props.mode === 'set' ? SetType : CheckType
    var errorMsg
    if (this.isDisabled()) {
      errorMsg = (
        <Text style={styles.error}>
          Too many failed attempts! This form has been disabled.
        </Text>
      )
    }

    return (
      <View style={[styles.container, customStyle.container]}>
        {errorMsg}
        <Form
          ref="form"
          type={type}
          options={options}
          style={[styles.form, customStyle.form]}
          value={this.state.value}
          onChange={this.onChange}
        />
        <TouchableHighlight
          style={[styles.button, customStyle.submit, { alignItems: 'center' }]}
          onPress={this.onPress}
          underlayColor='transparent'
          disabled={disabled}>
          <Icon
            name='ios-lock'
            size={this.props.iconSize || 100}
            style={{color: this.hasError() ? ERROR_COLOR : '#888888' }}
          />
        </TouchableHighlight>
      </View>
    )
  }
  // <Text style={[styles.buttonText, customStyle.submitText]}>{this.props.submitText || 'Save'}</Text>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efefef',
    // backgroundColor: 'transparent',
    justifyContent: 'center',
    padding: 20
  },
  form: {
    alignSelf: 'stretch',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  error: {
    fontSize: 25,
    padding: 25,
    textAlign: 'center',
    color: ERROR_COLOR
  },
  // buttonText: {
  //   fontSize: 18,
  //   color: '#ffffff',
  //   alignSelf: 'center'
  // },
  // button: {
  //   // height: 36,
  //   // backgroundColor: '#48BBEC',
  //   // borderColor: '#48BBEC',
  //   // borderWidth: 1,
  //   // borderRadius: 8,
  //   // marginBottom: 10,
  //   // alignSelf: 'stretch',
  //   justifyContent: 'center'
  // }
})

exports = module.exports = PasswordEntry
exports.Modes = Modes
