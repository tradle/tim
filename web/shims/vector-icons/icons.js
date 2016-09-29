// find mapping here:
// FROM: http://ionicframework.com/docs/v2/ionicons/
// TO: http://ionicons.com/

import React, { Component } from 'react'

const icons = {}
icons['android-close'] = require('react-icons/io/android-close')
icons['android-person'] = require('react-icons/io/android-person')
icons['android-done-all'] = require('react-icons/io/android-done-all')
icons['android-notifications-none'] = require('react-icons/io/android-notifications-none')
icons['arrow-right-a'] = require('react-icons/io/arrow-right-a')
icons['arrow-shrink'] = require('react-icons/io/arrow-shrink')
icons['arrow-swap'] = require('react-icons/io/arrow-swap')
icons['ios-plus-empty'] = require('react-icons/io/ios-plus-empty')
icons['ios-arrow-down'] = require('react-icons/io/ios-arrow-down')
icons['ios-arrow-forward'] = require('react-icons/io/ios-arrow-forward')
icons['ios-arrow-round-down'] = require('react-icons/io/ios-arrow-thin-down')
icons['ios-calendar-outline'] = require('react-icons/io/ios-calendar-outline')
icons['ios-telephone'] = require('react-icons/io/ios-telephone')
icons['ios-camera'] = require('react-icons/io/ios-camera')
icons['ios-camera-outline'] = require('react-icons/io/ios-camera-outline')
icons['ios-cart-outline'] = require('react-icons/io/ios-cart-outline')
icons['ios-checkmark'] = require('react-icons/io/ios-checkmark')
icons['ios-checkmark-empty'] = require('react-icons/io/ios-checkmark-empty')
icons['ios-checkmark-outline'] = require('react-icons/io/ios-checkmark-outline')
icons['ios-close'] = require('react-icons/io/ios-close')
icons['ios-close-outline'] = require('react-icons/io/ios-close-outline')
icons['ios-close'] = require('react-icons/io/ios-close')
icons['ios-compose-outline'] = require('react-icons/io/ios-compose-outline')
icons['ios-flower'] = require('react-icons/io/ios-flower')
icons['ios-information'] = require('react-icons/io/ios-information')
icons['ios-information-outline'] = icons['ios-informationoutline'] = require('react-icons/io/ios-informatoutline')
icons['ios-paper-outline'] = require('react-icons/io/ios-paper-outline')
icons['ios-person'] = require('react-icons/io/ios-person')
icons['ios-play-outline'] = require('react-icons/io/ios-play-outline')
icons['ios-circle-filled'] = require('react-icons/io/ios-circle-filled')
icons['ios-circle-outline'] = require('react-icons/io/ios-circle-outline')
icons['ios-reverse-camera'] = require('react-icons/io/ios-reverse-camera')
icons['ios-ribbon'] = require('react-icons/io/ribbon-b')
icons['social-usd'] = require('react-icons/io/social-usd')
icons['md-add'] = require('react-icons/md/add')
icons['md-check'] = require('react-icons/md/check')
icons['md-done-all'] = require('react-icons/md/done-all')
icons['md-finger-print'] = require('react-icons/md/fingerprint')
icons['md-menu'] = require('react-icons/md/menu')
icons['md-more'] = require('react-icons/md/more')
icons['md-crop-square'] = require('react-icons/md/crop-square')
icons['qr-scanner'] = require('react-icons/io/qr-scanner')

const alt = {
  'md-finger-print': 'md-fingerprint',
  'md-square-outline': 'md-crop-square',
  'md-checkbox-outline': 'md-check-box',
  'md-checkmark': 'md-check',
  'ios-checkmark-circle-outline': 'ios-checkmark-empty',
  'ios-call-outline': 'ios-telephone',
  'ios-close-circle-outline': 'ios-close-outline',
  'ios-radio-button-off': 'ios-circle-outline',
  'ios-radio-button-on': 'ios-circle-filled',
  'ios-ribbon': 'ios-ribbon-b',
  'ios-ribbon-outline': 'ios-ribbon-b',
  'ios-add': 'ios-plus-empty',
  'ios-arrow-round-down': 'ios-arrow-thin-down',
  'ios-qr-scanner': 'qr-scanner',
  'ios-usd': 'social-usd',
  'ios-done-all': 'android-done-all',
  'ios-information-circle': 'ios-information',
  'ios-information-circle-outline': 'ios-information-outline',
  'ios-notifications-outline': 'android-notifications-none'
}

class WrappedIcon extends Component {
  render() {
    var props = this.props
    var module = icons[props.name] || icons[alt[props.name]]
    if (!module) throw new Error('missing icon: ' + props.name)

    var Icon = module.default
    return <Icon {...props} />
  }
}

module.exports = WrappedIcon
