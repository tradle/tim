console.log('requiring CameraView.js')
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity
} from 'react-native'
import PropTypes from 'prop-types'
// import Camera from 'react-native-camera'
import { RNCamera } from 'react-native-camera'
import Icon from 'react-native-vector-icons/Ionicons'
import utils from '../utils/utils'

import React, { Component } from 'react'

class CameraView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cameraType: props.cameraType === 'front' &&    RNCamera.Constants.Type.front  ||  RNCamera.Constants.Type.back
    }
  }
          // captureTarget={RNCamera.Constants.CaptureTarget.cameraRoll}
          // captureMode={RNCamera.Constants.CaptureMode.video}

  render() {
    let data = this.state.data
    if (data) {
      let { width, height } = utils.dimensions()
      return <View style={[styles.container, {backgroundColor: '#000'}]}>
                <Image source={{isStatic: true, url: 'data:image/jpeg;base64,' + data.base64}} style={{width, height: height - 60}} />
                <View style={{flexDirection: 'row', width, justifyContent: 'center'}}>
                   <TouchableOpacity onPress={() => this.setState({data: null})}>
                     <Text style={styles.cancel}>Re-take</Text>
                   </TouchableOpacity>
                   <TouchableOpacity onPress={() => this.onTakePic({...data})}>
                     <Text style={styles.useIt}>Use photo</Text>
                    </TouchableOpacity>
                </View>
              </View>
    }
            // le separator = <View style={{height: 1, backgroundColor: '#aaa', width: 400, position: 'absolute', top: 74, left:0 }}/>

    return (
       <View style={styles.container}>
          <RNCamera
            ref={ref => {
                this.camera = ref;
              }}
            style={styles.container}
            onBarCodeRead={this._onBarCodeRead.bind(this)}
            flashMode={RNCamera.Constants.FlashMode.auto}
            type={this.state.cameraType}>
          </RNCamera>
          <View style={styles.footer}>
            <Text style={styles.currentAction}>PHOTO</Text>
            <TouchableOpacity onPress={this._takePicture.bind(this)}>
               <Icon name='ios-radio-button-on'  size={85}  color='#eeeeee'  style={styles.icon}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={this._switchCamera.bind(this)} style={styles.right}>
              <Icon name='ios-reverse-camera-outline' size={50} color='#eeeeee' />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.props.navigator.pop()} style={styles.left}>
              <Text style={{fontSize: 20, color: '#ffffff'}}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
  }
  _onBarCodeRead(e) {
    console.log(e);
  }
  _switchCamera() {
    var state = this.state;
    state.cameraType = state.cameraType === RNCamera.Constants.Type.back
                     ? RNCamera.Constants.Type.front
                     : RNCamera.Constants.Type.back;
    this.setState(state);
  }
  async _takePicture() {
    let data
    try {
      data = await this.camera.takePictureAsync({
        base64: true,
        mirrorImage: true,
        quality: 0.5,
        forceUpOrientation: true
      })
      this.setState({ data })
    } catch (err) {
      console.error(err)
      return
    }

    // this.props.onTakePic({
    //   ...data,
    //   // backwards compat
    //   path: data.uri
    // })
  }
  onTakePic() {
    let data = this.state.data
    this.props.onTakePic({
      ...data,
      // backwards compat
      path: data.uri
    })
  }
}


var styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
  },
  footer: {
    backgroundColor: '#000000',
    paddingTop: 10,
    height: 120,
    alignSelf: 'stretch',
    alignItems: 'center'
  },
  currentAction: {
    fontSize: 14,
    color: 'orange',
    alignSelf: 'center'
  },
  icon: {
    marginTop: 2,
    alignSelf: 'center',
  },
  cancel: {
    position: 'absolute',
    right: 60,
    top: 20,
    // backgroundColor: 'transparent',
    color: '#FFF',
    fontWeight: '600',
    fontSize: 20,
  },
  useIt: {
    position: 'absolute',
    left: 60,
    top: 20,
    // backgroundColor: 'transparent',
    color: '#FFF',
    fontWeight: '600',
    fontSize: 20,
  },
  right: {
    position: 'absolute',
    right: 20,
    bottom: 10
  },
  left: {
    position: 'absolute',
    left: 20,
    bottom: 30
  }
});

module.exports = CameraView;
