
import {
  // Text,
  TouchableOpacity,
  Alert,
  // View
} from 'react-native'
import PropTypes from 'prop-types';
import {
  LazyloadView as View,
  // LazyloadImage as Image
} from 'react-native-lazyload'
import Reflux from 'reflux'

import React, { Component } from 'react'
import _ from 'lodash'
import Icon from 'react-native-vector-icons/Ionicons';
import dateformat from 'dateformat'
import reactMixin from 'react-mixin'

import constants from '@tradle/constants'
const { TYPE } = constants

// import ImageComponent from './Image'
import Image from './Image'
import Store from '../Store/Store'

import utils, { translate, getEnumValueId } from '../utils/utils'
import { circled } from '../styles/utils'
import RowMixin from './RowMixin'
import StyleSheet from '../StyleSheet'
import { Text } from './Text'

const CHECK_OVERRIDE = 'tradle.CheckOverride'
const STATUS_OVERRIDE = 'tradle.OverrideStatus'

const CHECK  = 'tradle.Check'
const STATUS = 'tradle.Status'

class CheckRow extends Component {
  static propTypes = {
    resource: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
    application: PropTypes.object,
    modelName: PropTypes.string
  };

  constructor(props) {
    super(props)
    let { resource, application } = props
    let checkOverride
    if (application  &&  application.checksOverride) {
      const checkId = utils.getId(resource)
      let checkType = utils.getType(resource)
      let checkOverrideProp = utils.getPropertiesWithRef(CHECK_OVERRIDE, utils.getModel(checkType))
      if (checkOverrideProp.length) {
        const pref = checkOverrideProp[0].items.ref
        const rId = utils.getId(resource)
        const checkOverrides = application.checksOverride.filter(r => r && r.check  &&  utils.getType(r) === pref  && utils.getId(r.check) === rId)
        if (checkOverrides.length)
          checkOverride = checkOverrides[0]
      }
    }

    this.state = {
      resource,
      checkOverride
    }
  }
  componentDidMount() {
    this.listenTo(Store, 'onAction');
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (!_.isEqual(this.props.resource, nextProps.resource) ||
        !_.isEqual(this.state.resource, nextState.resource) ||
        this.props.category !== nextProps.category          ||
        this.props.checkFilter !== nextProps.checkFilter)
      return true
    return false
  }
  onAction(params) {
    let { action, resource, checkOverride } = params
    if (action !=='updateRow')
      return
    if (utils.getRootHash(resource) !== utils.getRootHash(this.props.resource))
      return
    this.setState({ resource, checkOverride })
  }

  render() {
    let { resource, lazy, onSelect, checkFilter } = this.props
    let rType = utils.getType(resource)
    let model = utils.getModel(rType);

    let date = this.getDateComponent(model)
    let title = this.getTitleComponent(model)
    let header =  <View style={[styles.header, resource.isInactive && {opacity: 0.3} || {opacity: 1}]} key={this.getNextKey()}>
                    <View style={styles.noImageBlock}>
                      <View style={styles.title}>
                        {title}
                      </View>
                      <View style={styles.checkDate}>
                        {date}
                      </View>
                    </View>
                  </View>
    let identifier
    let category = this.props.category
    let isHidden
    if (model.interfaces) {
      if (category  &&  !model.interfaces.includes(category.id))
        return <View style={{height: 0}}/>
      if (checkFilter  &&  getEnumValueId({model: utils.getModel(STATUS), value: resource.status}) !== checkFilter)
        return <View style={{height: 0}}/>
      let iModel = utils.getModel(model.interfaces[0])
      if (iModel.icon)
        identifier = <Icon name={iModel.icon} size={25} color='#aaaaaa' />
      else
        identifier = <Text styles={styles.checkDescription}>{translate(iModel)}</Text>
      identifier = <TouchableOpacity onPress={() => {this.props.showCategory(iModel)}} style={{position:'absolute', right: 10, top: 3}}>
                     {identifier}
                   </TouchableOpacity>
    }

    return <View host={lazy}>
             <TouchableOpacity onPress={onSelect.bind(this)}>
               {header}
             </TouchableOpacity>
             {identifier}
           </View>
  }
  getDateComponent(model) {
    let { resource } = this.props

    let isCheck = utils.isSubclassOf(model, CHECK)
    let isStub = utils.isStub(resource)
    if (isStub  ||  !resource)
      return
    let dateP
    if (resource.dateVerified)
      dateP = 'dateVerified'
    else if (isCheck)
      dateP = 'dateChecked'
    if (!dateP)
      dateP = resource.date && 'date' || '_time'
    let dateVal = resource[dateP]
    if (dateVal) {
      let dateFormatted = dateformat(dateVal, 'mmm dS, yyyy h:MM TT')
      return <Text style={styles.verySmallLetters} key={this.getNextKey()}>{dateFormatted}</Text>
    }
  }
  getTitleComponent(model) {
    let {resource, application, modelName } = this.props
    let dn = utils.getDisplayName(resource)
    let title
    if (utils.getModel(modelName).abstract)
      title = translate(model)

    let { propertyName, secondaryName, name, status, form, provider } = resource
    if (!status)
      return <View style={{paddingLeft: 40}}><Text style={styles.rTitle}>{dn || title}</Text></View>

    let searchTerm
    if (propertyName) {
      let propVal = translate(utils.getModel(utils.getType(form)).properties[propertyName], model)

      searchTerm = <View style={styles.titleView}>
                     <Text style={styles.label}>{propVal}</Text>
                     <Text style={styles.search}>{`: ${secondaryName}`}</Text>
                   </View>
      if (name) {
        let mainName = <View style={{flexDirection: 'row', paddingRight: 10}}>
                         <Text style={styles.label}>{translate(model.properties.name, model)}</Text>
                         <Text style={styles.search}>{`: ${name}`}</Text>
                       </View>
        searchTerm = <View style={{flexDirection: 'row', paddingVertical: 5}}>
                      {mainName}
                      {searchTerm}
                    </View>
      }
    }
    else if (form.title) {
      let ftype = utils.getType(form)
      let title
      if (form.title.indexOf('\n') === -1) {
        title = <View style={{flexDirection: 'row'}}>
                  <Text style={styles.search}>{`: `}</Text>
                  <Text style={styles.search}>{`${form.title}`}</Text>
                </View>
      }
      else {
        let t = form.title.split('\n').map(f => f.trim())
        title = <View style={{flexDirection: 'row'}}>
                  <Text style={styles.search}>{`: `}</Text>
                  <Text style={styles.search}>{`${t[0]}\n`}
                  <Text style={styles.searchG}>{`${t.slice(1).join(' ')}`}</Text>
                  </Text>
                </View>
      }
      searchTerm = <View style={{flexDirection: 'row', paddingVertical: 5}}>
                    <View style={styles.titleView}>
                      <Text style={styles.label}>{translate(utils.getModel(ftype))}</Text>
                      {title}
                    </View>
                  </View>
    }

    let sModel = utils.getModel(STATUS)
    let statusId = getEnumValueId({model: sModel, value: status})
    let statusM = sModel.enum.find(r => r.id === statusId)
    let checkIcon
    let checkOverrideStatus
    let checkOverrideIcon

    let { checkOverride } = this.state
    if (checkOverride) {
      const statusModel = utils.getModel(STATUS_OVERRIDE)
      checkOverrideStatus = statusModel.enum.find(r => r.title === checkOverride.status.title)
    }
    const { icon, color } = statusM
    let style, size, icolor
    if (statusId === 'warning'  ||  statusId === 'error') {
      // style = {shadowOpacity: 0.7, shadowRadius: 5, shadowColor: '#afafaf'}
      size = 37
      icolor = color
    }
    else {
      style = [styles.checkButton, {alignItems: 'center', width: 30, backgroundColor: color}]
      size = 30
      icolor = '#ffffff'
    }

    if (icon) {
      checkIcon = <View style={style}>
                    <Icon color={icolor} size={size} name={icon} />
                  </View>
    }
    if (checkOverrideStatus) {
      style = [styles.checkButton, {alignSelf: 'flex-end', alignItems: 'center', width: 20, height: 20, marginTop: -20, backgroundColor: checkOverrideStatus.color}]
      checkOverrideIcon = <View style={style}>
                            <Icon color={'#ffffff'} size={20} name={checkOverrideStatus.icon} />
                          </View>
    }
    return <View style={styles.titleView}>
             <View>
             {checkIcon}
             {checkOverrideIcon}
             </View>
             <View style={{justifyContent: 'center', paddingLeft: 10}}>
               <Text style={styles.rTitle}>{dn}</Text>
               {searchTerm}
               <Text style={styles.checkDescription}>{'Provider: ' + provider || translate(model)}</Text>
             </View>
           </View>
  }
}

reactMixin(CheckRow.prototype, RowMixin);
reactMixin(CheckRow.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
  title: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    minHeight: 40
  },
  header: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
    paddingBottom: 5
  },
  rTitle: {
    fontSize: 18,
    color: '#555555',
  },
  search: {
    fontSize: 16,
    color: '#555555',
    fontStyle: 'italic',
  },
  searchG: {
    fontSize: 14,
    color: '#757575',
    fontStyle: 'italic',
  },
  label: {
    fontSize: 16,
    color: '#aaaaaa',
    fontStyle: 'italic',
  },
  noImageBlock: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
    alignSelf: 'stretch',
    marginHorizontal: 10,
    paddingVertical: 3
  },
  verySmallLetters: {
    fontSize: 12,
    color: '#b4c3cb'
  },
  checkDescription: {
    fontSize: 14,
    paddingTop: 3,
    color: '#aaaaaa'
  },
  titleView: {
    flexDirection: 'row'
  },
  checkButton: {
    ...circled(30),
    shadowOpacity: 0.7,
    opacity: 0.9,
    shadowRadius: 5,
    shadowColor: '#afafaf',
  },
  checkDate: {
    marginTop: -3,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
});

module.exports = CheckRow;
