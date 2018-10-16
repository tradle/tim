import React, {Component} from  'react'

import Accordion from 'react-native-collapsible/Accordion'

class MobileAccordion extends Component {
  // constructor(props) {
  //   super(props)
  // }
  render() {
    return <Accordion onChange={this.props.onPress} sections={this.props.sections} renderHeader={() => this.props.header} renderContent={() => this.props.content} easing={this.props.easing} underlayColor={this.props.underlayColor} />
  }
}
module.exports = MobileAccordion;
