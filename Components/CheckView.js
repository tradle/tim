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

import utils, {
  translate,
  translateEnum,
  isSubclassOf,
  styleFactory,
  dimensions,
  isStub,
  getMe,
  isRM,
  getEnumValueId,
  getPropertiesWithRef,
  getContentWidth,
  buildRef,
  buildStubByEnumTitleOrId,
  getRootHash
} from '../utils/utils'
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
const OVERRIDE_STATUS = 'tradle.OverrideStatus'
const STATUS = 'tradle.Status'

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
    if (utils.getId(params.resource) !== utils.getId(resource)) {
      if (getRootHash(resource) !== getRootHash(params.resource))
        return
    }
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

    const rtype = utils.getType(resource)
    const rmodel = utils.getModel(rtype)

    let excludedProperties
    if (resource.message === resource.aspects) {
      if (rmodel.viewCols.includes('message')  &&
          rmodel.viewCols.includes('aspects'))
      excludedProperties = ['message']
    }
    if (resource.top  &&  getRootHash(resource.top) === getRootHash(resource.application)) {
      if (!excludedProperties)
        excludedProperties = []
      excludedProperties.push('top')
    }

    let isVerifier = !rmodel.notEditable && application  && isRM(application)

    let propertySheet = <ShowPropertiesView resource={resource}
                        showRefResource={this.getRefResource}
                        excludedProperties={excludedProperties}
                        currency={currency}
                        isVerifier={isVerifier}
                        bankStyle={bankStyle}
                        navigator={navigator} />

    let checkOverrideButton, checkOverrideView
    if (resource.checkOverride  &&  resource.checkOverride.length) {
      const e = utils.getModel(OVERRIDE_STATUS).enum
      let checkOverride = resource.checkOverride[0]
      const statusId = checkOverride.status && this.getEnumID(checkOverride.status.id) || 'pass'
      const statusM = e.find(r => r.id === statusId)
      const { icon, color } = statusM

      let reasonProp = statusId  &&  checkOverride[reasonProp] === 'pass' &&  'reasonsToPass' || 'reasonsToFail' || ''
      const dn = checkOverride[reasonProp]  &&  translateEnum(checkOverride[reasonProp]) || ''
      const checkIcon = <View style={[styles.checkButton, {backgroundColor: color}]}>
                          <Icon color='#ffffff' size={30} name={icon} />
                        </View>
      const cmodel = utils.getModel(CHECK_OVERRIDE)
      checkOverrideView = <TouchableOpacity onPress={() => this.showCheckOverride(checkOverride)}>
                            <View style={styles.checkOverride}>
                              {checkIcon}
                              <View style={{flexDirection: 'column', flex: 1}}>
                                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                  <Text style={styles.checkOverrideTextBig}>{translate('manuallyOverriden')}</Text>
                                  <Text style={styles.dateText}>{utils.formatDate(checkOverride._time)}</Text>
                                </View>
                                <Text style={styles.checkOverrideText}>{ dn}</Text>
                              </View>
                            </View>
                           </TouchableOpacity>
    }
    else if (!this.state.isLoading) { //  &&  isRM(application)) {
      let checkOverrideProp = getPropertiesWithRef(CHECK_OVERRIDE, rmodel)
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

    let height = dimensions(CheckView).height
    let width = getContentWidth()
    let contentSeparator = getContentSeparator(bankStyle)
    return (
      <PageView style={[platformStyles.container, {height, alignItems: 'center', borderTopColor: bankStyle.linkColor, borderTopWidth: 1}]} separator={contentSeparator} bankStyle={bankStyle} >
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
  showCheckOverride(resource) {
    const { navigator, currency, bankStyle } = this.props
    navigator.push({
      componentName: 'MessageView',
      title: translate(utils.getModel(utils.getType(resource))),
      passProps: {
        bankStyle,
        resource,
        currency,
      }
    })
  }
  createCheckOverride(prop) {
    const { navigator, bankStyle, application } = this.props
    const { resource } = this.state
    const model = utils.getModel(prop.ref  ||  prop.items.ref)
    const statusModel = utils.getModel(OVERRIDE_STATUS)
    const values = statusModel.enum
    const checkStatus = getEnumValueId({ model: utils.getModel(STATUS), value: resource.status })
    let status
    if (checkStatus === 'pass')
      status = buildStubByEnumTitleOrId(statusModel, values.find(r => r.id === 'fail').id)
    else // if (checkStatus.indexOf('fail') !== -1)
      status = buildStubByEnumTitleOrId(statusModel, values.find(r => r.id === 'pass').id)
    let r = {
      from: getMe(),
      to: application.to,
      _context: application._context,
      [TYPE]: model.id,
      check: buildRef(resource),
      application,
      status
    }
    const { top } = application
    r.top = top || application

    navigator.push({
      componentName: 'NewResource',
      title: translate(model),
      passProps: {
        resource: r,
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

var createStyles = styleFactory(CheckView, function ({ dimensions, bankStyle }) {
  let buttonColor = bankStyle.buttonColor || '#ffffff'
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
      color: buttonColor,
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
      backgroundColor: 'cornsilk'
    },
    checkOverrideText: {
      color: bankStyle.textColor,
      fontSize: 18,
      marginTop: 3,
      paddingLeft: 10,
    },
    checkOverrideTextBig: {
      color: bankStyle.textColor,
      fontSize: 24,
      paddingLeft: 10,
      marginTop: 0
    },
    checkOverrideLabel: {
      fontSize: 18,
      marginTop: 3,
      paddingLeft: 10,
      color: '#aaaaaa'
    },
    dateText: {
      fontSize: 12,
      marginTop: 7,
      color: bankStyle.textColor
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
