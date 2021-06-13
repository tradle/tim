
import utils, { translate, translateModelDescription } from '../utils/utils'
import PageView from './PageView'

import StyleSheet from '../StyleSheet'
import platformStyles from '../styles/platform'
import { getContentSeparator } from '../utils/uiUtils'

import {
  View,
  // Text,
  TouchableOpacity
} from 'react-native'
import PropTypes from 'prop-types';
import { Text } from './Text'
import React, { Component } from 'react'
// import { makeResponsive } from 'react-native-orient'
import SignaturePad from 'react-native-signature-pad'

class SignatureView extends Component {
  static displayName = 'SignatureView';
  static propTypes = {
    onSignature: PropTypes.func,
    prop: PropTypes.object
  };
  static displayName = 'SignatureView';

  constructor(props) {
    super(props);
    const { value } = props
    this.state = { value }
    this.scrollviewProps = {
      automaticallyAdjustContentInsets:true,
      scrollEventThrottle: 50,
      onScroll: this.onScroll.bind(this)
    };
  }
  done() {
    const { onSignature, doSet } = this.props
    let sig = this.getSignature()
    onSignature(sig, doSet)
    return sig
  }
  onScroll(e) {
    this._contentOffset = { ...e.nativeEvent.contentOffset }
  }
  render() {
    let { sigViewStyle, prop, model, bankStyle } = this.props
    const { width } = utils.dimensions(SignatureView)
    let separator = getContentSeparator(sigViewStyle)
    let styles = createStyles({sigViewStyle})
    let description
    if (model && model.description) {
      description = <View style={{padding: 20, marginHorizontal: -10, backgroundColor: bankStyle.GUIDANCE_MESSAGE_BG}}>
                      <Text style={styles.description}>{translateModelDescription(model)}</Text>
                    </View>
    }
    let title = !description && translate(prop.description || 'pleaseSign')
    return (
      <PageView style={platformStyles.container} separator={separator} bankStyle={sigViewStyle}>
        {description ||  <Text style={styles.instructions}>{title}</Text>}       
        <View style={styles.sig}>
          <SignaturePad ref='sigpad'
                        onError={this._signaturePadError}
                        lockToLandscape={false}
                        onChange={this.onChangeText.bind(this)}
                        style={{flex: 1, backgroundColor: 'white', padding: 20}}/>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity onPress={() => this.done()} style={styles.submit}>
            <Text style={styles.submitText}>{translate('Submit')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.refs.sigpad.clear()} style={styles.clear}>
            <Text style={styles.clearText}>{translate('Clear')}</Text>
          </TouchableOpacity>
        </View>
      </PageView>
    )
  }
  onChangeText(value) {
    // let val = format(value, this.props.resource)
    this.setState({ value })
  }
  getSignature() {
    return { ...this.state.value }
  }
  _signaturePadError() {
    debugger
  }
}

var createStyles = utils.styleFactory(SignatureView, function ({ dimensions, sigViewStyle  }) {
  let bgcolor = sigViewStyle.buttonBgColor || sigViewStyle.linkColor
  return StyleSheet.create({
    sig: {
      flex: 1,
      maxHeight: Math.min(dimensions.width / 2, 200),
      borderColor: '#ddd',
      borderWidth: 10,
      margin: 5
    },
    description: {
      fontSize: 18,
      padding: 10,
      alignSelf: 'center',
      color: '#757575'
    },
    instructions: {
      fontSize: 20,
      padding: 10,
      alignSelf: 'center',
      color: '#aaaaaa'
    },
    submitButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      width: 340,
      marginTop: 20,
      // marginBottom: 50,
      alignSelf: 'center',
      height: 40,
      borderRadius: 5,
      // marginHorizontal: 20
    },

    container: {
      flex: 1,
      paddingHorizontal: 10,
    },
    submit: {
      backgroundColor: bgcolor,
      flexDirection: 'row',
      justifyContent: 'center',
      width: 250,
      marginTop: 20,
      alignSelf: 'center',
      height: 40,
      borderRadius: 15,
      marginRight: 20
    },
    submitText: {
      fontSize: 20,
      color: sigViewStyle.buttonColor || '#ffffff',
      alignSelf: 'center'
    },
    clear: {
      backgroundColor: '#fff',
      flexDirection: 'row',
      justifyContent: 'center',
      width: 250,
      marginTop: 20,
      alignSelf: 'center',
      height: 40,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: bgcolor
    },
    clearText: {
      fontSize: 20,
      color: bgcolor,
      alignSelf: 'center'
    },
    buttons: {
      flexDirection: 'row',
      alignSelf: 'center'
    },
  })
})

module.exports = SignatureView;
