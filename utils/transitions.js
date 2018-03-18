'use strict';

import Navigator from 'react-native-deprecated-custom-components/src/Navigator'
import React, {
  Platform
} from 'react-native';

const buildStyleInterpolator = Platform.OS === 'web' && require('react-native-deprecated-custom-components/src/buildStyleInterpolator')

const NoTransition = {
  opacity: {
    value: 1.0,
    type: 'constant',
  }
}

const Transitions = {
  NONE: {
    ...Navigator.SceneConfigs.FadeAndroid,
    gestures: null,
    defaultTransitionVelocity: 1000,
    animationInterpolators: {
      into: buildStyleInterpolator(NoTransition),
      out: buildStyleInterpolator(NoTransition)
    }
  }
}

export default Transitions
