
import React, { Component } from 'react'
import { Animated } from 'react-native'

class FadeInView extends Component {
  state: any;

  constructor(props) {
    super(props);
    this.state = {
      fadeAnim: new Animated.Value(0), // opacity 0
    };
  }
  componentDidMount() {
    Animated.timing(       // Uses easing functions
      this.state.fadeAnim, // The value to drive
      {
        toValue: 1,        // Target
        duration: 2000,    // Configuration
      },
    ).start();             // Don't forget start!
  }
  render() {
    this.anim = this.anim || new Animated.Value(0);
    return (
      <Animated.View   // Special animatable View
        style={{
          opacity: this.state.fadeAnim,  // Binds
          justifyContent: 'center',
          alignSelf: 'center',
        }}>
        {this.props.children}
      </Animated.View>
    );
  }
}

module.exports = FadeInView
