var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Component,
  TouchableHighlight
} = React;
var Camera = require('react-native-camera');
var Icon = require('react-native-icons');

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
          style={styles.container}
          onBarCodeRead={this._onBarCodeRead.bind(this)}
          type={this.state.cameraType}>
          <TouchableHighlight onPress={this._switchCamera.bind(this)}>
            <Text>The old switcheroo</Text>
          </TouchableHighlight>
        </Camera>
        <View style={{backgroundColor: '#000000', paddingTop: 7, height: 125, alignSelf: 'stretch'}}>
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <Text style={{color: '#eeeeee', paddingHorizontal: 5, fontSize: 24, fontWeight: '400'}}>Video</Text>
            <Text style={{color: 'yellow', paddingHorizontal: 5, fontSize: 24, fontWeight: '400'}}>Photo</Text>
          </View>
          <TouchableHighlight onPress={this._takePicture.bind(this)}>
             <Icon name='ion|ios-circle-filled'  size={85}  color='#eeeeee'  style={styles.icon}/>
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

module.exports = CameraView;