'use strict';

import React, {
  Navigator,
  Platform
} from 'react-native';

const buildStyleInterpolator = Platform.OS === 'web' && require('react-web/lib/Navigator/polyfills/buildStyleInterpolator')

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
