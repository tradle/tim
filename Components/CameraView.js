console.log('requiring CameraView.js')
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Platform
} from 'react-native'
import PropTypes from 'prop-types'
// import Camera from 'react-native-camera'
import Camera from 'react-native-camera'
import Icon from 'react-native-vector-icons/Ionicons'

import React, { Component } from 'react'

class CameraView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cameraType: Camera.constants.Type.back
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Camera
          ref="cam"
          captureTarget={Camera.constants.CaptureTarget.cameraRoll}
          captureMode={Camera.constants.CaptureMode.video}
          style={styles.container}
          onBarCodeRead={this._onBarCodeRead.bind(this)}
          type={this.state.cameraType}>
          <TouchableHighlight onPress={this._switchCamera.bind(this)}>
            <Icon name='ios-reverse-camera' size={50} color='#eeeeee' />
          </TouchableHighlight>
        </Camera>
        <View style={{backgroundColor: '#000000', paddingTop: 7, height: 125, alignSelf: 'stretch'}}>
          <TouchableHighlight onPress={this._takePicture.bind(this)}>
             <Icon name='ios-radio-button-on'  size={85}  color='#eeeeee'  style={styles.icon}/>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
  _onBarCodeRead(e) {
    console.log(e);
  }
  _switchCamera() {
    var state = this.state;
    state.cameraType = state.cameraType === Camera.constants.Type.back
      ? Camera.constants.Type.front : Camera.constants.Type.back;
    this.setState(state);
  }
  _takePicture() {
    var self = this;
    this.refs.cam.capture(function(err, data) {
      console.log(err, data);
      self.props.onTakePic(data);
    });
  }
}


var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
  },
  icon: {
    width: 85,
    height: 85,
    marginTop: 2,
    alignSelf: 'center',
  },
});

module.exports = Camera && CameraView;
