
import {
  Platform,
  TouchableOpacity,
  // Text,
  View
} from 'react-native'
import PropTypes from 'prop-types';
import Reflux from 'reflux'
import React, { Component } from 'react'
import _ from 'lodash'
import reactMixin from 'react-mixin'
import Icon from 'react-native-vector-icons/Ionicons';

import constants from '@tradle/constants'

import ProgressBar from './ProgressBar'
import Store from '../Store/Store'
import { Text } from './Text'
import utils, { translate, translateEnum } from '../utils/utils'
import RowMixin from './RowMixin'

import defaultBankStyle from '../styles/defaultBankStyle.json'
import StyleSheet from '../StyleSheet'

const APPLICATION = 'tradle.Application'

var {
  TYPE,
} = constants

class ApplicationRow extends Component {
  static propTypes = {
    resource: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props)
    this.state = {
      resource: props.resource,
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.resource !== nextProps.resource)
      return true

    let opts = {strict: true}
    for (let p in nextState.resource) {
      if (!this.state.resource.hasOwnProperty(p))
        return true
      if (this.state.resource[p] !== nextState.resource[p]) {
        if (!_.isEqual(this.state.resource[p], nextState.resource[p], opts))
          return true
      }
    }

    return false
  }
  componentDidMount() {
    this.listenTo(Store, 'onRowUpdate');
  }
  onRowUpdate(params) {
    let { action, application, resource } = params
    let hash = resource  &&  utils.getRootHash(resource)
    let thisHash = utils.getRootHash(this.props.resource)
    switch (action) {
    case 'assignRM_Confirmed':
      if (utils.getRootHash(application) === thisHash)
        this.setState({application: application, resource: application})
      break
    case 'updateRow':
      let hash = utils.getRootHash(resource)
      if (hash === utils.getRootHash(this.props.resource)) {
        if (params.forceUpdate)
          this.setState({forceUpdate: this.state.forceUpdate ? false : true, resource: resource})
      }
    }
  }

  render() {
    const { resource, bankStyle, onSelect } = this.props
    let rType = utils.getType(resource)
    let style
    if (bankStyle)
      style = bankStyle
    else if (resource.style) {
      style = {}
      _.extend(style, defaultBankStyle)
      style = _.extend(style, resource.style)
    }
    if (!style)
      style = defaultBankStyle

    let bg
    if (style)
      bg = {backgroundColor: style.listBg}
    if (!bg)
      bg = {}
    let color = style ? {color: style.listColor} : {}

    let textStyle = [styles.textContainer, {marginVertical: 7}]
    let content =  <View style={[styles.content, bg]} key={this.getNextKey()}>
                    <TouchableOpacity onPress={() => onSelect({ resource })}>
                      <View style={styles.row}>
                        <View style={textStyle}>
                          {this.applicationRow(style)}
                        </View>
                      </View>
                    </TouchableOpacity>
                    <View style={styles.cellBorder}  key={this.getNextKey()} />
                  </View>
    return content
  }
  applicationRow(style) {
    let resource = this.state.resource
    const model = utils.getModel(resource[TYPE])
    const m = utils.getModel(resource.requestFor)

    const props = model.properties
    let dateCompleted, dateEvaluated, dateStarted
    if (resource.dateStarted) {
      dateStarted = <View style={{flexDirection: 'row', paddingTop:5, justifyContent: 'flex-end'}}>
                      <Text style={{fontSize: 12, color: '#aaaaaa'}}>{translate(props.dateStarted)}</Text>
                      <Text style={{fontSize: 12, color: '#757575', paddingLeft: 8}}>{utils.formatDate(resource.dateStarted)}</Text>
                    </View>
    }
    if (resource.dateEvaluated) {
      dateEvaluated = <View style={{flexDirection: 'row', paddingTop:5, justifyContent: 'flex-end'}}>
                        <Text style={{fontSize: 12, color: '#aaaaaa'}}>{translate(props.dateEvaluated)}</Text>
                        <Text style={{fontSize: 12, color: '#757575', paddingLeft: 8}}>{utils.formatDate(resource.dateEvaluated)}</Text>
                      </View>
    }
    else if (resource.dateCompleted) {
      dateCompleted = <View style={{flexDirection: 'row', paddingTop:5, justifyContent: 'flex-end'}}>
                        <Text style={{fontSize: 12, color: '#aaaaaa'}}>{translate(props.dateCompleted)}</Text>
                        <Text style={{fontSize: 12, color: '#757575', paddingLeft: 8}}>{utils.formatDate(resource.dateCompleted)}</Text>
                      </View>
    }
    let aTitle = resource.applicantName || resource.applicant.title
    // HACK
    if (aTitle === '[name unknown]')
      aTitle = null
    const applicant = aTitle  &&  <Text style={styles.applicant}>{aTitle}</Text>
    let icolor
    let iname
    const hasRM = resource.analyst // resource.relationshipManagers
    const { bankStyle } = this.props.bankStyle
    if (utils.isRM(resource)) {
      iname = 'ios-person-add'
      icolor = '#7AAAc3'
    }
    else {
      iname = hasRM ? 'ios-person-add' : 'ios-person-add-outline'
      icolor = hasRM ? '#CA9DF2' : '#7AAAc3'
    }
    let icon1, icon2
    if (resource.hasFailedChecks)
      icon1 = <View style={{marginHorizontal: 2}}><Icon name='md-close-circle' size={20} color='red' style={{alignSelf: 'center'}}/></View>
    if (resource.hasCheckOverrides)
      icon2 = <View style={{marginHorizontal: 2}}><Icon name='md-checkmark-circle' size={20} color='crimson' style={{alignSelf: 'center'}}/></View>

    let icon = <Icon name={iname} size={30} color={icolor}/>
    let icon0
    switch (resource.status) {
      case 'approved':
        icon0 = <Icon name='ios-done-all' size={30} color={bankStyle  &&  bankStyle.confirmationColor || '#02A5A5'}/>
        break
      case 'denied':
        icon0 = <Icon name='ios-close' size={25} color='red'/>
        break
      case 'started':
        icon0 = <Icon name='ios-code-working' size={25} color={bankStyle  &&  bankStyle.linkColor || '#7AAAC3'}/>
        break
      case 'completed':
        icon0 = <Icon name='ios-checkmark' size={30} color={bankStyle  &&  bankStyle.confirmationColor ||  '#129307'}/>
        break
      case 'In review':
        icon0 = <Icon name='ios-eye-outline' size={25} color={bankStyle  &&  bankStyle.confirmationColor ||  '#129307'}/>
        break
    }

    let icons = <View style={{flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'}}>
            {icon1}
            {icon2}
            {icon0}
            {icon}
          </View>
    let rmIcon = <View style={{flexDirection: 'column', justifyContent: 'center', marginTop: aTitle && -15 || 0}}>
                   {icons}
                 </View>

    let mTitle = m && translate(m) || utils.makeModelTitle(resource.requestFor)
    let team
    let rightMarginTop = -30
    if (resource[TYPE] === APPLICATION  &&  resource.assignedToTeam) {
      if (!applicant ||  !dateCompleted)
        rightMarginTop = -22
      team = <Text style={{position: 'absolute', bottom: 0, left: 5, fontSize: 14, fontStyle: 'italic', color: '#7AAAC3'}}>{translateEnum(resource.assignedToTeam)}</Text>
    }
    let progressBar
    let progress = this.getProgress(resource)
    if (progress) {
      let progressColor = '#a0d0a0'
      progressBar = <View style={{paddingBottom: 5}}><ProgressBar progress={progress} width={200} color={progressColor} borderWidth={1} borderRadius={3} height={5} showProgress={true} /></View>
    }
    return  <View>
              <View style={{padding: 5}}>
                <Text style={styles.resourceTitle}>{mTitle}</Text>
                {applicant}
              </View>
              {progressBar}
              {team}
              <View style={{marginTop: rightMarginTop, alignItems: 'flex-end'}}>
                {rmIcon}
                {dateStarted}
                {dateEvaluated}
                {dateCompleted}
              </View>
            </View>
  }
}
reactMixin(ApplicationRow.prototype, Reflux.ListenerMixin);
reactMixin(ApplicationRow.prototype, RowMixin);

var styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    alignSelf: 'center'
  },
  dateRow: {
    position: 'absolute',
    top: 2,
    backgroundColor:
    'transparent',
    right: 10
  },
  resourceTitle: {
    fontSize: 20,
    color: '#555555',
    paddingRight: 10
  },
  description: {
    // flex: 1,
    flexWrap: 'nowrap',
    color: '#999999',
    fontSize: 14,
  },
  applicant: {
    color: '#999999',
    fontSize: 16,
    paddingTop: 3
  },
  row: {
    justifyContent: 'center',
    flexDirection: 'row',
    padding: 5,
    minHeight: 71,
  },
  content: {
    opacity: 1,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10
  },
  cell: {
    backgroundColor: '#ffffff',
    height: 60,
    marginRight: 10,
    width: 60,
  },
  cellBorder: {
    backgroundColor: '#eeeeee',
    height: 1,
    marginLeft: 4,
  },
  icon: {
    alignSelf: 'center',
    marginLeft: 10,
    marginTop: 7,
  },
  verySmallLetters: {
    fontSize: 12,
    alignSelf: 'flex-end',
    color: '#b4c3cb'
  },
});

module.exports = ApplicationRow;
