console.log('requiring SignatureView.js')
'use strict';

import utils from '../utils/utils'
import PageView from './PageView'
import extend from 'extend'
import Icon from 'react-native-vector-icons/Ionicons';

import StyleSheet from '../StyleSheet'
import platformStyles from '../styles/platform'

import {
  Platform,
  View,
  Text,
  ScrollView,
} from 'react-native'
import PropTypes from 'prop-types';

import React, { Component } from 'react'
// import { makeResponsive } from 'react-native-orient'
import SignaturePad from 'react-native-signature-pad'

class SignatureView extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    onSignature: PropTypes.func,
    returnRoute: PropTypes.object,
  };

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
    this.props.onSignature(this.getSignature())
  }
  onScroll(e) {
    this._contentOffset = { ...e.nativeEvent.contentOffset }
  }
  render() {
    let {sigViewStyle} = this.props
    const { width, height } = utils.dimensions(SignatureView)
    return (
      <PageView style={platformStyles.container}>
        <Text style={styles.instructions}>Please sign inside the grey box</Text>
        <View style={{
          flex: 1,
          maxHeight: Math.min(width / 2, 200),
          borderColor: '#ddd',
          borderWidth: 10,
          margin: 5
        }}>
          <SignaturePad onError={this._signaturePadError}
                        lockToLandscape={false}
                        onChange={this.onChangeText.bind(this)}
                        style={{flex: 1, backgroundColor: 'white', padding: 20}}/>
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
}

var styles = StyleSheet.create({
  instructions: {
    fontSize: 24,
    padding: 10,
    alignSelf: 'center',
    color: '#aaaaaa'
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
})

module.exports = SignatureView;
