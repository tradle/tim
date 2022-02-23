import { makeResponsive } from 'react-native-orient'
import {
  View,
  // Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Easing,
  Alert
} from 'react-native'
import PropTypes from 'prop-types';
import PieChart from 'react-minimal-pie-chart';
import React, { Component } from 'react'
import Icon from 'react-native-vector-icons/Ionicons'
import reactMixin from 'react-mixin'
import constants from '@tradle/constants'

import { Text } from './Text'
import ProgressBar from './ProgressBar'
import utils, {
  translate,
  getEnumValueId
} from '../utils/utils'

import buttonStyles from '../styles/buttonStyles'
import appStyle from '../styles/appStyle.json'
import RowMixin from './RowMixin'

import ResourceMixin from './ResourceMixin'
import ShowPropertiesView from './ShowPropertiesView'
import Actions from '../Actions/Actions'
import ENV from '../utils/env'
import GridList from './GridList'
import { circled } from '../styles/utils'

const colors = [
  '#5AFE3D',
  'darkviolet',
  'deeppink',
  'dodgerblue',
  'fuchsia',
  'coral',
  'gold',
  'pink',
  '#5087B4',
  'red'
]
const {
  TYPE
} = constants

const {
  VERIFICATION,
  FORM,
  IDENTITY
} = constants.TYPES
const CHECK = 'tradle.Check'
const STATUS = 'tradle.Status'

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
    this.spinValue = new Animated.Value(0)
  }
  componentDidMount() {
    Animated.timing(
      this.spinValue,
      {
        toValue: 1,
        duration: 300,
        delay: 0,
        easing: Easing.linear
      }
    ).start()
  }
  animateTabsBar() {
    Animated.timing(this._animatedHeight, {
      toValue: 67
    }).start();
  }
  render() {
    var { resource, bankStyle, children, navigator, lazy, locale,
          showDetails, currency, backlink, checksCategory, checkFilter } = this.props
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
      propsToShow = Object.keys(itemProps).filter(p => !itemProps[p].hidden)

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

    let vCols = utils.ungroup({model, viewCols: model.viewCols})
    vCols = vCols.filter((p) => !props[p].hidden  &&  props[p].items)
    // let vCols = model.viewCols.filter((p) => !props[p].hidden  &&  props[p].items)
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
      let prefix = hasSubmissions && '_' || ''
      let pName = `${prefix}${p}Count`
      let cnt = resource[pName] || (resource[p] &&  resource[p].length)
      if (cnt) {
        hasCounts = true
        if (!currentProp  &&  !showDetails)
          currentProp = props[p]
        count = <View style={styles.count}>
                  <Text style={styles.countText}>{cnt}</Text>
                </View>
      }
      let showCurrent = backlink  &&  backlink.name === p ? currentMarker : null
      let text = <Text style={[buttonStyles.text, styles.tabText]}>{propTitle}</Text>
      let blIcon = <Icon name={icon}  size={utils.getFontSize(30)}  color='#757575' />
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
    let isChecks = backlink &&  backlink.items.ref === CHECK
    if (!showDetails  &&  currentProp) {
      let modelName = currentProp.items.ref
      let backlinkList
      if (isChecks) {
        if (checksCategory  &&  resource.checks) {
          let id = checksCategory.id
          backlinkList = resource.checks.filter(check => {
            let m = utils.getModel(utils.getType(check))
            return m.interfaces  &&  m.interfaces.includes(id)
          })
        }
        else if (checkFilter) {
          let sModel = utils.getModel(STATUS)
          backlinkList = resource.checks.filter(check => {
            let id = getEnumValueId({model: sModel, value: check.status})
            return id === checkFilter
          })
        }
      }
      flinkRL = <GridList
                    lazy={lazy}
                    modelName={modelName}
                    prop={currentProp}
                    sortProperty={utils.getModel(modelName).sortProperty}
                    resource={resource}
                    search={true}
                    locale={locale}
                    backlinkList={backlinkList}
                    checksCategory={checksCategory}
                    checkFilter={checkFilter}
                    isBacklink={true}
                    application={resource}
                    listView={true}
                    bankStyle={bankStyle}
                    navigator={navigator} />
    }
    else if (resource.photos)
      separator = <View style={styles.separator} />

    if (showDetails) {
      let { scoreDetails } = resource
      let pieChart // = scoreDetails  &&  this.getPieChart(styles)
      details = <ShowPropertiesView resource={resource}
                                    pieChart={pieChart}
                                    showRefResource={this.getRefResource.bind(this)}
                                    locale={locale}
                                    currency={currency}
                                    bankStyle={bankStyle}
                                    excludedProperties={['photos' ]}//, 'tree']}
                                    navigator={navigator} />
      if (utils.isRM(resource)           &&
          resource.submissions           &&
          /*!resource.draft  &&*/
          resource.status !== 'approved' &&
          resource.status !== 'denied') {
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
                {isChecks && this.getChecksBar(styles)}
                {children}
                <View>
                  {flinkRL}
                  {details}
                </View>
              </View>
    }

    return children || <View/>
  }
  getPieChart(styles) {
    let resource = this.props.resource
    let scoreDetails = resource.scoreDetails.summary
    let data = []
    let j = 0
    for (let p in scoreDetails) {
      let title = translate(p)
      if (typeof scoreDetails[p] === 'number')
        data.push({title: `${title} ${scoreDetails[p]}`, value: scoreDetails[p], color: colors[j++]})
      else if (scoreDetails[p].score) {
        title += ':'
        for (let pp in scoreDetails[p]) {
          if (pp !== 'score')
            title += ` ${pp}`
        }
        data.push({title: `${title} ${scoreDetails[p].score}`, value: scoreDetails[p].score, color: colors[j++]})
      }
    }
    if (data.length < 2) return
    let pieData = []
    data.forEach(d => d.value  &&  pieData.push(d))
    return <View>
             <PieChart
               radius={40}
               ration={1}
               style={{height: '250px'}}
               data={pieData}
               animate
               label={({ data, dataIndex }) =>
                 data[dataIndex].title
               }
               labelPosition={112}
               labelStyle={{fontSize: 5, fill: '#9b9b9b'}}
             />
           </View>
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

    let progress = this.getProgress(resource)
    let progressColor = '#a0d0a0' //bankStyle.linkColor
    return <View style={[styles.row, {justifyContent: 'space-between'}]}>
             <View style={styles.progress}>
               <Text style={styles.title}>{translate('progress')}</Text>
               <ProgressBar progress={progress} width={200} color={progressColor} borderWidth={1} borderRadius={3} height={5} showProgress={true} />
             </View>
           </View>
  }
  getChecksBar(styles) {
    let { resource, bankStyle } = this.props
    let { checks } = resource
    if (!checks)
      return

    let impl = []
    checks.forEach(check => {
      let interfaces = utils.getModel(utils.getType(check)).interfaces
      if (interfaces)
        interfaces.forEach(inf => !impl.includes(inf)  &&  impl.push(inf))
    })
    if (impl.length) {
      impl = impl.map(inf => {
        let m = utils.getModel(inf)
        let identifier
        if (m.icon)
          identifier = <Icon name={m.icon} size={30} color={'#757575'} />
        else
          identifier = <Text style={{fontSize: 20, color: '#757575'}}>{translate(m)}</Text>
        return <TouchableOpacity onPress={() => {this.props.showCategory(m)}} style={styles.checkCategory} key={this.getNextKey()}>
                 {identifier}
               </TouchableOpacity>
      })
    }
    if (resource.checks  &&  resource.checks.length) { //  &&  resource.checks[0].status) {
      let hasFailed = resource.checks.find(check => check.status  &&  check.status.id === `${STATUS}_fail`)
      if (hasFailed) {
        let statusM = utils.getModel(STATUS).enum.find(r => r.id === 'fail')
        let { icon, color } = statusM
        let style = [styles.checkButton, {backgroundColor: color}]
        impl.push(
           <TouchableOpacity onPress={() => {this.props.filterChecks('fail')}} style={styles.checkCategory} key={this.getNextKey()}>
             <View style={style}>
               <Icon name={icon} color='#fff' size={25} />
             </View>
           </TouchableOpacity>
        )
      }
    }

    return <View style={styles.checksTabs}>
             {impl}
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
      opacity: 1,
    },
    noSubmissionsText: {
      backgroundColor: '#ececec',
      height: 7,
      width: 60,
      marginTop: 10
    },
    pieTitle: {
      fontSize: 16,
      marginBottom: 20,
      marginTop: 3,
      alignSelf: 'center',
      // paddingBottom: 20,
      color: '#5b5b5b'
    },
    checkCategory: {
      flex: 1,
      paddingVertical: 5,
      justifyContent: 'center',
      alignItems: 'center'
    },
    checksTabs: {
      flexDirection: 'row',
      backgroundColor: '#f9f9f9',
      borderTopWidth: 1,
      borderTopColor: '#dddddd'
    },
    checkButton: {
      ...circled(25),
      shadowOpacity: 0.7,
      opacity: 0.9,
      shadowRadius: 5,
      shadowColor: '#afafaf',
    },
  })
})

module.exports = ApplicationTabs