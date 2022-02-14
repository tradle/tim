import React, { Component } from 'react'
import {
  View
} from 'react-native'
import { WebView } from 'react-native-webview'
import PropTypes from 'prop-types'
import { makeResponsive } from 'react-native-orient'
import reactMixin from 'react-mixin'

import { dimensions, getId } from '../utils/utils'
import Actions from '../Actions/Actions'
import Reflux from 'reflux'
import Store from '../Store/Store'
import { getContentSeparator, showLoading } from '../utils/uiUtils'
import platformStyles from '../styles/platform'

class PrintReport extends Component {
  static propTypes = {
    application: PropTypes.object.isRequired,
    template: PropTypes.object.isRequired,
    bankStyle: PropTypes.object.isRequired
  };
  constructor(props) {
    super(props)
    this.state = {
      isLoading: true
    }
  }
  componentWillMount() {
    let { application, template, locale } = this.props
    Actions.getReport( {application, template: template.template, locale} )
  }
  componentDidMount() {
    this.listenTo(Store, 'onAction');
  }
  onAction(params) {
    const {action, reportVariables, application, html} = params
    if (action !== 'report' || !html) // !reportVariables)
      return
    if (!application || getId(application) !== getId(this.props.application))
      return

    this.setState({html, isLoading: false});
  }
  render() {
    const { html, isLoading } = this.state
    const { report, bankStyle } = this.props
    if (isLoading) {
      return <View style={{position: 'absolute', bottom: 100, alignSelf: 'center' }}>
               {showLoading({bankStyle, component: PrintReport})}
             </View>
    }
    const { width, height } = dimensions(PrintReport)
    return <WebView style={{width, height}}
                 source={{html}}
                 startInLoadingState={true}
                 automaticallyAdjustContentInsets={false} />
  }
}
reactMixin(PrintReport.prototype, Reflux.ListenerMixin);

module.exports = makeResponsive(PrintReport)
