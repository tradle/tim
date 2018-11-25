
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity
} from 'react-native'
// import Camera from 'react-native-camera'
import { RNCamera } from 'react-native-camera'
import Icon from 'react-native-vector-icons/Ionicons'
import { makeResponsive } from 'react-native-orient'

import utils, { translate, pickNonNull } from '../utils/utils'
import { normalizeImageCaptureData } from '../utils/image-utils'

const CameraType = RNCamera.Constants.Type

class CameraView extends Component {
  static defaultProps = {
    cameraType: 'back',
    fixOrientation: true,
    base64: false,
    addToImageStore: true,
  };

  static propTypes = {
    cameraType: PropTypes.oneOf(['front', 'back']),
    quality: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    fixOrientation: PropTypes.bool,
    addToImageStore: PropTypes.bool,
    callback: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props)
    this.state = {
      cameraType: props.cameraType
    }

    this._switchCamera = this._switchCamera.bind(this)
    this._takePicture = this._takePicture.bind(this)
  }
          // captureTarget={RNCamera.Constants.CaptureTarget.cameraRoll}
          // captureMode={RNCamera.Constants.CaptureMode.video}

  render() {
    let data = this.state.data
    if (data) {
      // debugger
      let { width, height } = utils.dimensions(CameraView)
      const { url } = data
      return <View style={[styles.container, {backgroundColor: '#000', justifyContent: 'center'}]}>
                <Image source={{uri: url}} style={{width, height: height - 80}} />
                <View style={styles.footer1}>
                   <TouchableOpacity onPress={() => this.setState({data: null})}>
                     <Text style={styles.cancel}>{translate('retake')}</Text>
                   </TouchableOpacity>
                   <TouchableOpacity onPress={() => this.onTakePic({...data})}>
                     <Text style={styles.useIt}>{translate('usePhoto')}</Text>
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
            flashMode={RNCamera.Constants.FlashMode.auto}
            type={CameraType[this.state.cameraType]}>
          </RNCamera>
          <View style={styles.footer}>
            <Text style={styles.currentAction}>{translate('Photo')}</Text>
            <TouchableOpacity onPress={this._takePicture}>
               <Icon name='ios-radio-button-on'  size={65}  color='#eeeeee'  style={styles.icon}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={this._switchCamera} style={styles.right}>
              <Icon name='ios-reverse-camera-outline' size={50} color='#eeeeee' />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.props.callback()} style={styles.left}>
              <Text style={{fontSize: 20, color: '#ffffff'}}>{translate('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
  }

  _switchCamera() {
    const cameraType = this.state.cameraType === 'back' ? 'front' : 'back'
    this.setState({ cameraType })
  }

  async _takePicture () {
    const { width, height, quality, fixOrientation, base64, addToImageStore } = this.props
    const opts = {
      mirrorImage: this.state.cameraType !== 'back',
      quality,
      width,
      height,
      fixOrientation,
      forceUpOrientation: fixOrientation,
      doNotSave: true,
      base64,
      addToImageStore,
      // skipProcessing: true,
    }

    try {
      const data = await this.camera.takePictureAsync(pickNonNull(opts))
      // always
      data.extension = 'jpeg'
      this.setState({
        data: await normalizeImageCaptureData(data)
      })
    } catch (err) {
      this.props.callback(err)
      return
    }
  }
  onTakePic = () => {
    this.props.callback(null, this.state.data)
  }
}
CameraView = makeResponsive(CameraView)

var styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
  },
  footer1: {
    backgroundColor: '#000000',
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'stretch',
    paddingTop: 30,
    flex: 1,
  },
  footer: {
    backgroundColor: '#000000',
    paddingTop: 10,
    height: 100,
    justifyContent: 'center',
    alignSelf: 'stretch',
    alignItems: 'center'
  },
  currentAction: {
    fontSize: 14,
    color: 'orange',
    alignSelf: 'center'
  },
  icon: {
    marginTop: -2,
    alignSelf: 'center',
  },
  cancel: {
    // position: 'absolute',
    // right: 60,
    // top: 20,
    // backgroundColor: 'transparent',
    paddingHorizontal: 20,
    color: '#FFF',
    fontWeight: '600',
    alignSelf: 'center',
    fontSize: 20,
  },
  useIt: {
    // position: 'absolute',
    // left: 60,
    // top: 20,
    // backgroundColor: 'transparent',
    paddingHorizontal: 20,
    alignSelf: 'center',
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
