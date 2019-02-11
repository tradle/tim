
import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native'
import PropTypes from 'prop-types'

// import Video from 'react-native-video'
class VideoPlayer extends React.Component {
  propTypes: {
    onEnd: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    navigator: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props)
    this.state = {
      rate: 1,
      volume: 1,
      muted: false,
      resizeMode: 'contain',
      duration: 0.0,
      currentTime: 0.0,
      controls: false,
      paused: true,
      skin: 'native'
    }

    ;['onLoad', 'onProgress', 'pause', 'play'].forEach((method) => {
      this[method] = this[method].bind(this)
    })
  }

  componentDidMount() {
    this.play()
  }

  componentWillUnmount() {
    this.pause()
  }

  pause() {
    this.setState({paused: true})
  }

  play() {
    this.setState({paused: false})
  }

  onLoad(data) {
    this.setState({duration: data.duration, loaded:true})
  }

  onProgress(data) {
    this.setState({currentTime: data.currentTime})
  }

  getCurrentTimePercentage() {
    if (this.state.currentTime > 0) {
      return parseFloat(this.state.currentTime) / parseFloat(this.state.duration)
    } else {
      return 0
    }
  }

  renderVolumeControl(volume) {
    var isSelected = (this.state.volume == volume)

    return (
      <TouchableOpacity onPress={() => { this.setState({volume: volume}) }}>
        <Text style={[styles.controlOption, {fontWeight: isSelected ? "bold" : "normal"}]}>
          {volume * 100}%
        </Text>
      </TouchableOpacity>
    )
  }

  renderCustomSkin() {
    var controls //= this.renderCustomControls()
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.fullScreen} onPress={() => {this.setState({paused: !this.state.paused})}}>
          <Video source={this.props.source}
                 style={styles.fullScreen}
                 rate={this.state.rate}
                 paused={this.state.paused}
                 volume={this.state.volume}
                 muted={this.state.muted}
                 resizeMode={this.state.resizeMode}
                 onLoad={this.onLoad}
                 onProgress={this.onProgress}
                 onEnd={this.props.onEnd}
                 onError={this.props.onError}
                 repeat={this.props.repeat} />
        </TouchableOpacity>
        {controls}
      </View>
    )
  }

  renderCustomControls() {
    var flexCompleted = this.getCurrentTimePercentage() * 100
    var flexRemaining = (1 - this.getCurrentTimePercentage()) * 100

    return (
      <View style={styles.controls}>
        <View style={styles.generalControls}>
          <View style={styles.volumeControl}>
            {this.renderVolumeControl(0.5)}
            {this.renderVolumeControl(1)}
            {this.renderVolumeControl(1.5)}
          </View>
        </View>

        <View style={styles.trackingControls}>
          <View style={styles.progress}>
            <View style={[styles.innerProgressCompleted, {flex: flexCompleted}]} />
            <View style={[styles.innerProgressRemaining, {flex: flexRemaining}]} />
          </View>
        </View>
      </View>
    )
  }

  renderNativeSkin() {
    var nativeControls// = this.renderNativeControls()
    var videoStyle = this.state.skin == 'embed' ? styles.nativeVideoControls : styles.fullScreen
    return (
      <View style={styles.container}>
        <View style={styles.fullScreen}>
          <Video source={{uri: this.props.uri}}
                 style={videoStyle}
                 rate={this.state.rate}
                 paused={this.state.paused}
                 volume={this.state.volume}
                 muted={this.state.muted}
                 resizeMode={this.state.resizeMode}
                 onLoad={this.onLoad}
                 onProgress={this.onProgress}
                 onEnd={this.props.onEnd}
                 onError={this.props.onError}
                 repeat={this.props.repeat}
                 controls={this.state.controls} />
        </View>
        {nativeControls}
      </View>
    )
  }

  renderNativeControls() {
    return (
      <View style={styles.controls}>
        <View style={styles.generalControls}>
          <View style={styles.skinControl}>
            {this.renderSkinControl('custom')}
            {this.renderSkinControl('native')}
            {this.renderSkinControl('embed')}
          </View>
        </View>
        <View style={styles.generalControls}>
          <View style={styles.rateControl}>
            {this.renderRateControl(0.5)}
            {this.renderRateControl(1.0)}
            {this.renderRateControl(2.0)}
          </View>

          <View style={styles.volumeControl}>
            {this.renderVolumeControl(0.5)}
            {this.renderVolumeControl(1)}
            {this.renderVolumeControl(1.5)}
          </View>

          <View style={styles.resizeModeControl}>
            {this.renderResizeModeControl('cover')}
            {this.renderResizeModeControl('contain')}
            {this.renderResizeModeControl('stretch')}
          </View>
        </View>
      </View>
    )
  }

  render() {
    return this.state.controls ? this.renderNativeSkin() : this.renderCustomSkin()
  }
}


var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  controls: {
    backgroundColor: "transparent",
    borderRadius: 5,
    position: 'absolute',
    bottom: 44,
    left: 4,
    right: 4,
  },
  progress: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 3,
    overflow: 'hidden',
  },
  innerProgressCompleted: {
    height: 20,
    backgroundColor: '#cccccc',
  },
  innerProgressRemaining: {
    height: 20,
    backgroundColor: '#2C2C2C',
  },
  generalControls: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    paddingBottom: 10,
  },
  skinControl: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  rateControl: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  volumeControl: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  resizeModeControl: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  controlOption: {
    alignSelf: 'center',
    fontSize: 11,
    color: "white",
    paddingLeft: 2,
    paddingRight: 2,
    lineHeight: 12,
  },
  nativeVideoControls: {
    top: 184,
    height: 300
  }
})

module.exports = VideoPlayer
