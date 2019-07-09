
import React, {
  Component
} from 'react'

import {
  TouchableOpacity,
  Platform
} from 'react-native'
import PropTypes from 'prop-types'
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';
const debug = require('debug')('tradle:app:DocumentInput')

import utils, { translate } from '../utils/utils'

import RNFetchBlob from 'rn-fetch-blob'

const documentInputPropTypes = {
  ...TouchableOpacity.propTypes,
  onDocument: PropTypes.func.isRequired
}

class DocumentInput extends Component {
  static propTypes = documentInputPropTypes;

  constructor(props) {
    super(props)
    this.showDocumentPicker = this.showDocumentPicker.bind(this)
  }
  render() {
    const touchableProps = { ...this.props }
    delete touchableProps.onDocument
    return (
      <TouchableOpacity
        underlayColor='transparent'
        {...touchableProps}
        onPress={this.showDocumentPicker}>
        {this.props.children}
      </TouchableOpacity>
    )
  }
  async showDocumentPicker() {
    if (this._active) {
      return debug('ignoring showDocumentPicker() request, as it is already active')
    }

    this._active = true
    try {
      await this._doShowDocumentPicker()
    } finally {
      this._active = false
    }
  }
  async _doShowDocumentPicker () {
    DocumentPicker.show({
          filetype: [DocumentPickerUtil.allFiles()],
        }, async (error,res) => {
      let fileUri = res.uri
      let contents
      debugger
      try {
        let fres = await RNFetchBlob.fetch('GET', fileUri)
        contents = fres.base64()
      }
      catch(err) {
        console.log(err.message, err.code);
        debugger
        return
      }
      let item = {...res, url: contents}
      this.props.onDocument(item)
    });
  }
}

module.exports = DocumentInput
