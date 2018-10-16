import {
  StyleSheet,
  View,
  // InteractionManager
} from 'react-native'
import PropTypes from 'prop-types'

import QRCode from 'react-native-qrcode'

import React, { Component } from 'react'

class QRCodeView extends Component {
  // constructor(props) {
  //   super(props)

  //   this.state = {
  //     renderPlaceholderOnly: true
  //   }
  // }
  propTypes: {
    content: PropTypes.string.isRequired,
    dimension: PropTypes.number,
    bgColor: PropTypes.string.isRequired,
    fgColor: PropTypes.string.isRequired,
    fullScreen: PropTypes.bool
  };
  defaultProps: {
    dimension: 200,
    bgColor: 'white',
    fgColor: 'black',
    fullScreen: false
  };
  // componentDidMount() {
  //   InteractionManager.runAfterInteractions(() => {
  //     this.setState({
  //       renderPlaceholderOnly: false
  //     });
  //   });
  // }
  render() {
    var code
    // if (this.state.renderPlaceholderOnly) {
    //   return <ActivityIndicator hidden='true' size='large' style={this.state.style} />
    // }

    var code = <QRCode
      value={this.props.content}
      size={this.props.dimension}
      bgColor={this.props.bgColor}
      fgColor={this.props.fgColor}
      />

    if (!this.props.fullScreen) return code

    return (
      <View style={styles.container}>
        {code}
      </View>
    )
  }
}

// function getStyle (dim) {
//   return {
//     alignSelf: 'center',
//     height: dim,
//     width: dim
//   }
// }

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  }
})

// QRCodeView.PropTypes = {
//   size: PropTypes.number.isRequired,
//   bgColor: PropTypes.string.isRequired,
//   fgColor: PropTypes.string.isRequired,
// }

module.exports = QRCodeView
