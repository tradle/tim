
import React, {
  Component
} from 'react'

import PropTypes from 'prop-types'
import {
  Platform,
  TouchableHighlight,
  View,
  Alert
} from 'react-native'

import ReactDOM from 'react-dom'
import {
  readFile,
  isImageDataURL,
  translate
} from '../utils/utils'

import FileInput from 'react-file-input'

const docInputPropTypes = {
  ...TouchableHighlight.propTypes,
  prop: PropTypes.string.isRequired,
  onFile: PropTypes.func.isRequired
}

class DocInput extends Component {
  props: docInputPropTypes;
  constructor(props) {
    super(props)
    this._onPress = this._onPress.bind(this)
  }
  _onPress() {
    if (this._pressing) return

    this._pressing = true
    setTimeout(() => this._pressing = false, 100)
    this.showFileChooser()
  }
  showFileChooser() {
    const me = ReactDOM.findDOMNode(this)
    const inputs = me.getElementsByTagName('input')
    const fileInput = [].filter.call(inputs, i => i.type === 'file')[0]
    fileInput.click()
  }
  render() {
    const touchableProps = { ...this.props }
    delete touchableProps.prop
    delete touchableProps.onFile

    // allow override of onPress
    return (
      <View>
        <TouchableHighlight
          underlayColor='transparent'
          {...touchableProps}
          onPress={this.props.onPress || this._onPress}>
          {this.props.children}
        </TouchableHighlight>
        {this.renderFileInput()}
      </View>
    )
  }
  renderFileInput() {
    const { prop, onFile } = this.props
    let ref = prop.ref || prop.items.ref
    return (
      <View style={{ width: 0, height: 0, opacity: 0 }}>
        <FileInput
          ref={ref => this._input = ref}
          name={prop.name}
          placeholder={prop.title || prop.name}
          onChange={e => {
            readFile(e.target.files[0], function (err, item, file) {
              if (err) return Alert.alert(translate('unableToProcessFile'), err.message)

              onFile({
                ...item,
                isVertical: true,
                file: file
              })
            })
          }} />
      </View>
    )
  }
}

module.exports = DocInput
