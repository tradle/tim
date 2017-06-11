'use strict';

import React, {Component} from  'react'

var AccordionForWeb = require('react-native-accordion')

class Accordion extends Component {
  render() {
    return <AccordionForWeb header={this.props.header} content={this.props.content} easing={this.props.easing} underlayColor={this.props.underlayColor} style={this.props.style} />
  }
}
module.exports = Accordion;
