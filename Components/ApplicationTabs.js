import { makeResponsive } from 'react-native-orient'
import {
  View,
  // Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated
} from 'react-native'
import PropTypes from 'prop-types';

import React, { Component } from 'react'
import Icon from 'react-native-vector-icons/Ionicons'

import { Text } from './Text'
import ProgressBar from './ProgressBar'
import constants from '@tradle/constants'
import utils, {
  translate
} from '../utils/utils'

import buttonStyles from '../styles/buttonStyles'
import appStyle from '../styles/appStyle.json'
import reactMixin from 'react-mixin'
import RowMixin from './RowMixin'
import ResourceMixin from './ResourceMixin'
import ShowPropertiesView from './ShowPropertiesView'
import Actions from '../Actions/Actions'
import ENV from '../utils/env'
import GridList from './GridList'
import { circled } from '../styles/utils'

const {
  TYPE
} = constants

const {
  VERIFICATION,
  FORM,
  IDENTITY
} = constants.TYPES

class ApplicationTabs extends Component {
  static displayName = 'ApplicationTabs'

  static propTypes = {
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    showDetails: PropTypes.bool,
    bankStyle: PropTypes.object,
    approve: PropTypes.func.isRequired,
    deny: PropTypes.func.isRequired
  };
  constructor(props) {
    super(props);
    this._animatedHeight = new Animated.Value(0)
  }

  animateTabsBar() {
    Animated.timing(this._animatedHeight, {
      toValue: 67
    }).start();
  }
  render() {
    var { resource, bankStyle, children, navigator, lazy, showDetails, currency, backlink } = this.props
    var model = utils.getModel(resource[TYPE]);
    var props = model.properties;
    var refList = [];
    let propsToShow = []

    let currentProp = backlink
    showDetails = !backlink  ||  showDetails
    let styles = createStyles({bankStyle})

    let currentMarker = <View style={styles.marker} />

    let itemProps = utils.getPropertiesWithAnnotation(model, 'items')
    if (itemProps)
      propsToShow = Object.keys(itemProps)

    let showCurrent = showDetails ? currentMarker : null
    let detailsTab = <View style={[buttonStyles.container, {flex: 1}]} key={this.getNextKey()}>
                       <TouchableOpacity onPress={this.showDetails.bind(this)}>
                         <View style={styles.item}>
                           <Icon name='ios-paper-outline'  size={utils.getFontSize(30)}  color='#757575' />
                           <Text style={[buttonStyles.text, styles.tabText]}>{'Details'}</Text>
                         </View>
                       </TouchableOpacity>
                       {showCurrent}
                      </View>

    refList.push(detailsTab)

    let vCols = model.viewCols.filter((p) => !props[p].hidden  &&  props[p].items)
    if (vCols) {
      vCols.forEach((p) => {
        let idx = propsToShow.indexOf(p)
        if (idx !== -1)
          propsToShow.splice(idx, 1)
      })
      propsToShow.forEach((p) => vCols.push(p))
      propsToShow = vCols
    }
    let hasCounts
    let hasSubmissions = resource.submissions
    propsToShow.forEach((p) => {
      // HACK
      if (p === 'submissions')
        return
      let ref = props[p].items.ref
      if (ENV.hideVerificationsInChat  && ref === VERIFICATION)
        return
      if (ENV.hideProductApplicationInChat  &&  utils.isContext(ref))
        return
      if (ref === IDENTITY)
        return
      let propTitle = translate(props[p], model)
      var icon = props[p].icon  ||  utils.getModel(props[p].items.ref).icon;
      if (!icon) {
        if (ref === FORM)
          icon = 'ios-body-outline'
        else
          icon = 'ios-checkmark-circle-outline';
      }

      let count
      if (hasSubmissions)  {
        let cnt = resource['_' + p + 'Count'] || (resource[p] &&  resource[p].length)
        if (cnt) {
          hasCounts = true
          if (!currentProp  &&  !showDetails)
            currentProp = props[p]
          count = <View style={styles.count}>
                    <Text style={styles.countText}>{cnt}</Text>
                  </View>
        }
      }
      let showCurrent = backlink  &&  backlink.name === p ? currentMarker : null
      let text, blIcon
      if (hasSubmissions) {
        text = <Text style={[buttonStyles.text, styles.tabText]}>{propTitle}</Text>
        blIcon = <Icon name={icon}  size={utils.getFontSize(30)}  color='#757575' />
      }
      else {
        text = <View style={styles.noSubmissionsText}/>
        blIcon = <View style={styles.noSubmissionsIcon}/>
      }
      refList.push(
        <View style={[buttonStyles.container, {flex: 1}]} key={this.getNextKey()}>
           <TouchableOpacity onPress={this.exploreBacklink.bind(this, resource, props[p])}>
             <View style={[styles.item, {justifyContent: 'flex-start'}]}>
               <View style={styles.row}>
                 {blIcon}
                 {count}
               </View>
               {text}
             </View>
           </TouchableOpacity>
           {showCurrent}
         </View>
        );
    })
    // if (!hasCounts) {
    //   if (showDetails)
    //     refList = null
    // }
    // explore current backlink
    let flinkRL, details, separator
    if (!showDetails  &&  currentProp) {
      let modelName = currentProp.items.ref
      flinkRL = <GridList
                    lazy={lazy}
                    modelName={modelName}
                    prop={currentProp}
                    sortProperty={utils.getModel(modelName).sortProperty}
                    resource={resource}
                    search={true}
                    isBacklink={true}
                    application={resource}
                    listView={true}
                    bankStyle={bankStyle}
                    navigator={navigator} />
    }
    else if (resource.photos)
      separator = <View style={styles.separator} />

    if (showDetails) {
      details = <ShowPropertiesView resource={resource}
                                    showRefResource={this.getRefResource.bind(this)}
                                    currency={currency}
                                    bankStyle={bankStyle}
                                    excludedProperties={['photos']}
                                    navigator={navigator} />
      if (/*!resource.draft  &&*/ utils.isRM(resource)  &&  (resource.status !== 'approved' && resource.status !== 'denied')) {
        details = <View style={styles.buttonsFooter}>
                   {details}
                   <View style={styles.buttons}>
                    <TouchableOpacity onPress={this.props.approve.bind(this)}>
                    <View style={styles.approve}>
                      <Text style={styles.approveText}>{translate('Approve')}</Text>
                    </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.props.deny.bind(this)}>
                    <View style={styles.deny}>
                      <Text style={styles.denyText}>{translate('Deny')}</Text>
                    </View>
                    </TouchableOpacity>
                  </View>
                  </View>
      }
    }

    if ((refList  &&  refList.length)  ||  !propsToShow.length  ||  showDetails) {
      if (refList  &&  refList.length) {
        refList = <View style={buttonStyles.buttonsNoBorder} key={'ApplicationTabs'}>
                    {refList}
                  </View>
        if (showDetails  &&  resource.status === 'started'  &&  resource.forms) {
          this.animateTabsBar();
          refList = <Animated.View style={{height: this._animatedHeight}}>
                      {refList}
                    </Animated.View>
        }
      }

      return  <View>
                {separator}
                {refList}
                {showDetails  &&  this.getAppStatus(styles)}
                {children}
                <View>
                  {flinkRL}
                  {details}
                </View>
              </View>
    }

    return children || <View/>
  }
  exploreBacklink(resource, prop) {
    Actions.exploreBacklink(resource, prop)
  }
  showDetails() {
    Actions.getDetails(this.props.resource)
  }
  getRefResource(resource, prop) {
    this.showRefResource(resource, prop)
  }
  getAppStatus(styles) {
    let { resource, bankStyle } = this.props
    if (resource.status !== 'started'  ||  !resource.forms)
      return
    let formTypes = []
    let progress = 0
    if (resource.forms) {
      resource.forms.forEach((item) => {
        let itype = utils.getType(item)
        if (formTypes.indexOf(itype) === -1)
          formTypes.push(itype)
      })
      let m = utils.getModel(resource.requestFor)

      if (resource.status === 'approved' || resource.status === 'completed')
        progress = 1
      else
        progress = formTypes.length / m.forms.length
    }
    let progressColor = '#a0d0a0' //bankStyle.linkColor

    return <View style={styles.progress}>
             <Text style={styles.title}>Progress</Text>
             <ProgressBar progress={progress} width={200} color={progressColor} borderWidth={1} borderRadius={3} height={5} />
           </View>
  }
}

reactMixin(ApplicationTabs.prototype, RowMixin);
reactMixin(ApplicationTabs.prototype, ResourceMixin);
ApplicationTabs = makeResponsive(ApplicationTabs)

var createStyles = utils.styleFactory(ApplicationTabs, function ({ dimensions, bankStyle  }) {
  let bg = bankStyle && bankStyle.myMessageBackgroundColor || appStyle.CURRENT_UNDERLINE_COLOR
  let buttonBg = bankStyle.buttonBgColor ||  bankStyle.linkColor
  let buttonColor = bankStyle.buttonColor || '#ffffff'
  return StyleSheet.create({
    count: {
      alignSelf: 'flex-start',
      minWidth: 18,
      marginLeft: -7,
      marginTop: 0,
      backgroundColor: appStyle.COUNTER_BG_COLOR,
      paddingHorizontal: 3,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 9,
      borderColor: appStyle.COUNTER_COLOR,
      paddingVertical: 1
    },
    title: {
      fontSize: 16,
      // fontFamily: 'Avenir Next',
      marginVertical: 3,
      marginHorizontal: 7,
      color: '#9b9b9b'
    },
    countText: {
      fontSize: 12,
      fontWeight: '600',
      alignSelf: 'center',
      color: appStyle.COUNTER_COLOR,
    },
    item: {
      alignItems: 'center',
      paddingTop: 10,
      paddingBottom: 0
    },
    row: {
      flexDirection: 'row'
    },
    command: {
      fontSize: 20,
      alignSelf: 'center',
      color: '#555555'
    },
    progress: {
      marginTop: 20,
      marginBottom: 10,
      paddingHorizontal: 10,
      justifyContent: 'flex-start',
      // alignSelf: 'center',
      // flexDirection: 'row',
      // justifiedContent: 'space-between'
    },
    approve: {
      backgroundColor: buttonBg,
      flexDirection: 'row',
      justifyContent: 'center',
      width: 250,
      marginTop: 20,
      alignSelf: 'center',
      height: 50,
      borderRadius: 15,
      marginRight: 20
    },
    approveText: {
      fontSize: 20,
      color: buttonColor,
      alignSelf: 'center'
    },
    deny: {
      backgroundColor: buttonColor,
      flexDirection: 'row',
      justifyContent: 'center',
      width: 250,
      marginTop: 20,
      alignSelf: 'center',
      height: 50,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: buttonBg
    },
    denyText: {
      fontSize: 20,
      color: buttonBg,
      alignSelf: 'center'
    },
    buttonsFooter: {
      paddingBottom: 70
    },
    separator: {
      height: 2,
      backgroundColor: bg
    },
    marker: {
      backgroundColor: bg,
      height: 4,
      marginTop: -5
    },
    buttons: {
      flexDirection: 'row',
      alignSelf: 'center'
    },
    tabText: {
      marginTop: Platform.OS === 'android' ? 3 : 0
    },
    noSubmissionsIcon: {
      ...circled(30),
      backgroundColor: '#ececec',
      // shadowOpacity: 0.7,
      opacity: 1,
      // shadowRadius: 5,
      // shadowColor: '#afafaf',
    },
    noSubmissionsText: {
      backgroundColor: '#ececec',
      height: 7,
      width: 60,
      marginTop: 10
    }
  })
})

module.exports = ApplicationTabs;