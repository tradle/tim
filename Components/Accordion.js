'use strict';

import React, {Component} from  'react'

var AccordionForWeb = require('react-native-accordion')
var AccordionForMobile = require('react-native-collapsible/Accordion')
import {
  Platform
} from 'react-native'

class Accordion extends Component {
  // constructor(props) {
  //   super(props)
  // }
  render() {
    if (Platform.OS === 'web')
      return <AccordionForWeb header={this.props.header} content={this.props.content} easing={this.props.easing} underlayColor={this.props.underlayColor} style={this.props.style} />
    else
      return <AccordionForMobile sections={this.props.sections} renderHeader={() => this.props.header} renderContent={() => this.props.content} easing={this.props.easing} underlayColor={this.props.underlayColor} />
  }
}
module.exports = Accordion;
