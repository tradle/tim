
import {
  View,
  StyleSheet,
  // Text,
  TouchableOpacity
} from 'react-native'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Icon from 'react-native-vector-icons/Ionicons'
import constants from '@tradle/constants'
import utils, {
  translate
} from '../utils/utils'
import Actions from '../Actions/Actions'
import PageView from './PageView'
import { Text } from './Text'

const REMEDIATION = 'tradle.Remediation'
const EMPLOYEE_ONBOARDING = 'tradle.EmployeeOnboarding'
const AGENT_ONBOARDING = 'tradle.AgentOnboarding'
const PROFILE = constants.TYPES.PROFILE

class ChatContext extends Component {
  static propTypes = {
    chat: PropTypes.object.isRequired,
    context: PropTypes.object,
    contextChooser: PropTypes.func.isRequired,
    shareWith: PropTypes.func.isRequired,
    bankStyle: PropTypes.object.isRequired,
    allContexts: PropTypes.bool.isRequired
  };
  constructor(props) {
    super(props)
  }

  render() {
    let { context, application, allContexts, bankStyle, chat, contextChooser, shareWith } = this.props
    if (!context  ||  !context.requestFor  ||  context.requestFor === REMEDIATION)
      return <View/>
    let m = utils.getModel(context.requestFor)
    if (!m)
      return <View/>
    let me = utils.getMe()
    let ctype = utils.getType(chat)
    let isChattingWithPerson = ctype === PROFILE
    if (me.isEmployee) {
      if (isChattingWithPerson  &&  !me.organization._canShareContext)
        return <View/>
    }
    // No need to show context if provider has only one product and no share context
    // else if ((!chat.products  ||  chat.products.length === 1)  &&  !chat._canShareContext)
    //   return <View/>
    // if (!context  ||  context._readOnly)
    //   return <View/>
    let isReadOnlyChat = utils.isReadOnlyChat(context)
    let isShareContext = utils.isContext(ctype) && isReadOnlyChat
    let product = context.requestFor
    // HACK
    let isAgent = utils.isAgent()
    if (isAgent  &&  product === EMPLOYEE_ONBOARDING)
      product = AGENT_ONBOARDING

    let content = <Text style={[{color: allContexts ? bankStyle.currentContextTextColor : bankStyle.shareContextTextColor}, styles.text]}>{translate(utils.getModel(product))}</Text>
    let chooser
    let style = me.hasOwnProperty('_stepIndicator') &&  me._showStepIndicator &&  context._formsCount  &&  styles.contextBarWithSteps ||  styles.contextBar
    if (isAgent  ||  (context  &&  isShareContext || application))
      chooser = <View style={style}>{content}</View>
    else
      chooser = <TouchableOpacity onPress={contextChooser} style={style}>
                  {content}
                </TouchableOpacity>
    // HACK: if me is employee no sharing for now
    let share
    if (allContexts || isReadOnlyChat  ||  (!chat._canShareContext  &&  !isChattingWithPerson)) {
      share = <View/>
    }
    else {
      share = <TouchableOpacity onPress={shareWith} style={{position: 'absolute', right: 10, padding: 10}}>
                <Icon size={22} name='md-share' color={bankStyle.shareContextTextColor} style={{marginRight: 10, paddingLeft: 20}} />
              </TouchableOpacity>
    }
    let stepIndicator = this.getStepIndicator({context, bankStyle})

    let bar = {backgroundColor: allContexts ? bankStyle.currentContextBackgroundColor : bankStyle.shareContextBackgroundColor}
    return (
            <View style={[bar, styles.bar, {flexDirection: 'row'}]}>
              {chooser}
              {share}
              {stepIndicator}
            </View>
            )
  }
  getStepIndicator({context, bankStyle}) {
    if (!context  ||  context._formsCount <= 1)
      return
    let name, color
    let hasIndicator = utils.getMe()._showStepIndicator
    if (hasIndicator) {
      name = 'ios-git-commit'
      color = bankStyle.linkColor
    }
    else {
      name = 'ios-git-commit'
      color = '#aaaaaa'
    }
    return <TouchableOpacity onPress={() => Actions.showStepIndicator()} style={{position: 'absolute', right: 0, top: -5, padding: 10}}>
             <Icon size={35} name={name} color={color} style={{paddingHorizontal: 10}} />
           </TouchableOpacity>
  }
}

var styles = StyleSheet.create({
  contextBar: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  contextBarWithSteps: {
    flex: 1,
    paddingTop: 7,
    paddingHorizontal: 10,
    paddingBottom: 15
  },
  bar: {
    // borderTopColor: '#dddddd',
    // borderTopWidth: StyleSheet.hairlineWidth,
    // padding: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eeeeee',
    // flexDirection: 'row',
    // justifyContent: 'space-between',
  },
  text: {
    fontSize: 20,
    // alignSelf: 'center',
    marginHorizontal: 10
  }
});

module.exports = ChatContext
