
import React, {
  Component
} from 'react'

import {
  TouchableOpacity,
  Platform,
  Alert
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
    let allowedMimeTypes = this.props.allowedMimeTypes
    let types = []
    if (allowedMimeTypes) {
      allowedMimeTypes.forEach(type => {
        if (type.startsWith('image/'))
          types.push(DocumentPickerUtil.images())
        if (type === 'application/pdf')
          types.push(DocumentPickerUtil.pdf())
        if (type.startsWith('audio/'))
          types.push(DocumentPickerUtil.audio())
        if (type.startsWith('video/'))
          types.push(DocumentPickerUtil.video())
        if (type === 'text/plain')
          types.push(DocumentPickerUtil.plainText())
      })
      if (!types.length) {
        Alert.alert( `${translate('notSupportedMimeTypes', allowedMimeTypes.join(', '))}`)
        return
      }
    }
    else
      types.push(DocumentPickerUtil.allFiles())

    DocumentPicker.show({
          filetype: types,
        }, async (error,res) => {
      let fileUri = res.uri
      let contents, isText
      // debugger
      try {
        let fres = await RNFetchBlob.fetch('GET', fileUri)
        if (fres.info().rnfbEncode === 'base64')
          contents = fres.base64()
        else {
          contents = fres.text()
          isText = true
        }
      }
      catch(err) {
        console.log(err.message, err.code);
        debugger
        return
      }
      let item = {...res, url: contents, isText }
      this.props.onDocument(item)
    });
  }
}

module.exports = DocumentInput
