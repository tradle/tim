import React, { Component } from 'react'
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity
} from 'react-native'
import PropTypes from 'prop-types'
import Reflux from 'reflux'
import reactMixin from 'react-mixin'
import _ from 'lodash'
import { makeResponsive } from 'react-native-orient'
import Icon from 'react-native-vector-icons/Ionicons'

import constants from '@tradle/constants'
const {
  TYPE,
} = constants

import utils, { translate, isSubclassOf, isStub } from '../utils/utils'
import { circled } from '../styles/utils'
import { getContentSeparator } from '../utils/uiUtils'
import PageView from './PageView'
import Actions from '../Actions/Actions'
import Store from '../Store/Store'
import ResourceMixin from './ResourceMixin'
import defaultBankStyle from '../styles/defaultBankStyle.json'
import platformStyles from '../styles/platform'
import buttonStyles from '../styles/buttonStyles'
import StyleSheet from '../StyleSheet'
import ShowPropertiesView from './ShowPropertiesView'

const CHECK_OVERRIDE = 'tradle.CheckOverride'
const STATUS = 'tradle.OverrideStatus'

class CheckView extends Component {
  static displayName = 'CheckView';
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    application: PropTypes.object
  };
  constructor(props) {
    super(props);
    this.state = {
      resource: props.resource,
      isConnected: props.navigator.isConnected,
      isLoading: true,
      showDetails: false,
      bankStyle: props.bankStyle || defaultBankStyle
    };
    let currentRoutes = props.navigator.getCurrentRoutes();
    let len = currentRoutes.length;
    if (!currentRoutes[len - 1].onRightButtonPress  &&  currentRoutes[len - 1].rightButtonTitle) {
      if (this.props.isReview)
        currentRoutes[len - 1].onRightButtonPress = props.action
      else
        currentRoutes[len - 1].onRightButtonPress = this.verifyOrCreateError.bind(this)
    }
    this.getRefResource = this.getRefResource.bind(this)

  }
  componentWillMount() {
    let { resource, search, application } = this.props
    Actions.getItem({ resource, search, application })
  }

  componentDidMount() {
    this.listenTo(Store, 'onAction');
  }
  onAction(params) {
    let { action, currency, style, country, backlink, isConnected } = params
    if (action == 'connectivity') {
      this.setState({isConnected})
      return
    }
    if (!params.resource)
      return
    let { bankStyle, application, resource, search } = this.props
    if (utils.getId(params.resource) !== utils.getId(resource))
      return
    if (action === 'getItem') {
      let state = {
        resource: params.resource,
        isLoading: false
      }
      if (currency)
        state.currency = currency
      if (country)
        state.country = country
      if (style) {
        let styleMerged = {}
        if (bankStyle)
          _.extend(styleMerged, bankStyle)
        else
          _.extend(styleMerged, defaultBankStyle)
        _.extend(styleMerged, style)
        state.bankStyle = styleMerged
      }
      this.setState(state)
    }
  }

  getRefResource(resource, prop) {
    this.showRefResource(resource, prop)
  }

  render() {
    let { backlink, bankStyle, resource } = this.state
    let { navigator, application, currency } = this.props
    const styles = createStyles({bankStyle})

    let propertySheet = <ShowPropertiesView resource={resource}
                        showRefResource={this.getRefResource}
                        currency={currency}
                        bankStyle={bankStyle}
                        navigator={navigator} />

    let checkOverrideButton, checkOverrideView
    if (resource.checkOverride  &&  resource.checkOverride.length) {
      const e = utils.getModel(STATUS).enum
      let checkOverride = resource.checkOverride[0]
      const statusId = checkOverride.status && this.getEnumID(checkOverride.status.id) || 'pass'
      const statusM = e.find(r => r.id === statusId)
      const { icon, color } = statusM

      const dn = utils.getDisplayName(checkOverride)
      const checkIcon = <View style={[styles.checkButton, {backgroundColor: color}]}>
                          <Icon color='#ffffff' size={30} name={icon} />
                        </View>
      checkOverrideView = <View style={styles.checkOverride}>
                            {checkIcon}
                            <Text style={styles.checkOverrideText}>{dn}</Text>
                          </View>
    }
    else if (!this.state.isLoading  &&  utils.isRM(application)) {
      // let checkOverrideProp = getCheckOverrideProp(resource[TYPE])
      const rtype = utils.getType(resource)
      let checkOverrideProp = utils.getPropertiesWithRef(CHECK_OVERRIDE, utils.getModel(rtype))
      if (checkOverrideProp.length) {
        checkOverrideButton = <View style={styles.footer}>
                                <TouchableOpacity
                                      onPress={() => this.createCheckOverride(checkOverrideProp[0])}>
                                  <View style={styles.overrideButton}>
                                    <Text style={styles.overrideButtonText}>{translate('override')}</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
      }
    }

    let height = utils.dimensions(CheckView).height
    let width = utils.getContentWidth()
    let contentSeparator = getContentSeparator(bankStyle)
    return (
      <PageView style={[platformStyles.container, {height, width, alignItems: 'center', borderTopColor: bankStyle.linkColor, borderTopWidth: 1}]} separator={contentSeparator} bankStyle={bankStyle} >
        <ScrollView
          ref='checkView'
          style={{width}}>
          {checkOverrideView}
          {propertySheet}
          {checkOverrideButton}
        </ScrollView>
      </PageView>
    );
  }
  createCheckOverride(prop) {
    const { resource, navigator, bankStyle, application } = this.props
    const model = utils.getModel(prop.ref  ||  prop.items.ref)
    const statusModel = utils.getModel(STATUS)
    const values = statusModel.enum
    const checkStatus = resource.status.id
    let status
    if (checkStatus.indexOf('_pass') !== -1)
      status = utils.buildStubByEnumTitleOrId(statusModel, values.find(r => r.id === 'fail').id)
    else if (checkStatus.indexOf('_fail') !== -1)
      status = utils.buildStubByEnumTitleOrId(statusModel, values.find(r => r.id === 'pass').id)
    navigator.push({
      componentName: 'NewResource',
      title: translate(model),
      passProps: {
        resource: {
          from: utils.getMe(),
          to: application.to,
          _context: application._context,
          [TYPE]: model.id,
          check: utils.buildRef(resource),
          application,
          status
        },
        model,
        bankStyle
      }
    })
  }
  getEnumID(id) {
    return id.split('_')[1]
  }

}
reactMixin(CheckView.prototype, ResourceMixin);
reactMixin(CheckView.prototype, Reflux.ListenerMixin);
CheckView = makeResponsive(CheckView)

var createStyles = utils.styleFactory(CheckView, function ({ dimensions, bankStyle }) {
  return StyleSheet.create({
    overrideButton: {
      backgroundColor: bankStyle.buttonBgColor || bankStyle.linkColor,
      flexDirection: 'row',
      justifyContent: 'center',
      width: 340,
      alignSelf: 'center',
      height: 40,
      borderRadius: 5,
    },
    overrideButtonText: {
      fontSize: 20,
      color: '#ffffff',
      alignSelf: 'center'
    },
    footer: {
      paddingBottom: 70
    },
    checkOverride: {
      flex: 1,
      padding: 20,
      flexDirection: 'row',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: '#eeeeee',
    },
    checkOverrideText: {
      color: '#757575',
      fontSize: 18,
      marginTop: 3,
      paddingLeft: 10,
    },
    checkButton: {
      ...circled(30),
      shadowOpacity: 0.7,
      opacity: 0.9,
      shadowRadius: 5,
      shadowColor: '#afafaf',
    },
  })
})

module.exports = CheckView;
