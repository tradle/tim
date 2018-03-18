console.log('requiring HomePage.js')
'use strict';

import NoResources from './NoResources'
import ResourceRow from './ResourceRow'
import SponsorRow from './SponsorRow'
import ResourceView from './ResourceView'
import ResourceList from './ResourceList'
import VerificationRow from './VerificationRow'
import NewResource from './NewResource'
import MessageList from './MessageList'
import MessageView from './MessageView'
import HomePageMixin from './HomePageMixin'
import PageView from './PageView'
import SupervisoryView from './SupervisoryView'
import ActionSheet from 'react-native-actionsheet'
import utils from '../utils/utils'
var translate = utils.translate
import reactMixin from 'react-mixin'
import extend from 'extend'
import Store from '../Store/Store'
import Actions from '../Actions/Actions'
import Reflux from 'reflux'
import constants from '@tradle/constants'
import Icon from 'react-native-vector-icons/Ionicons';
import QRCodeScanner from './QRCodeScanner'
import QRCode from './QRCode'
import buttonStyles from '../styles/buttonStyles'
import NetworkInfoProvider from './NetworkInfoProvider'
import defaultBankStyle from '../styles/defaultBankStyle.json'
import StyleSheet from '../StyleSheet'

const WEB_TO_MOBILE = '0'
const TALK_TO_EMPLOYEEE = '1'
const APP_QR_CODE = '5'
const PARTIAL = 'tradle.Partial'
const TYPE = constants.TYPE
const ROOT_HASH = constants.ROOT_HASH
const PROFILE = constants.TYPES.PROFILE
const ORGANIZATION = constants.TYPES.ORGANIZATION

// import bankStyles from '../styles/bankStyles'
const ENUM = 'tradle.Enum'

import React, { Component } from 'react'
import {
  ListView,
  Alert,
  TouchableOpacity,
  Image,
  StatusBar,
  View,
  Text,
  Platform
} from 'react-native'
import PropTypes from 'prop-types';

import platformStyles from '../styles/platform'
import ENV from '../utils/env'
import ConversationsIcon from './ConversationsIcon'

class HomePage extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    modelName: PropTypes.string.isRequired,
    resource: PropTypes.object,
    returnRoute: PropTypes.object,
    callback: PropTypes.func,
    filter: PropTypes.string,
    sortProperty: PropTypes.string,
    prop: PropTypes.object,
    isAggregation: PropTypes.bool,
    isRegistration: PropTypes.bool,
  };
  constructor(props) {
    super(props);

    this.state = {
      // isLoading: utils.getModels() ? false : true,
      isLoading: true,
      dataSource: new ListView.DataSource({
        rowHasChanged: function(row1, row2) {
          return row1 !== row2 || row1._online !== row2._online
        }
      }),
      filter: this.props.filter,
      hideMode: false,  // hide provider
      serverOffline: this.props.serverOffline,
      isConnected: this.props.navigator.isConnected,
      userInput: '',
    };
  }
  componentWillUnmount() {
    if (this.props.navigator.getCurrentRoutes().length === 1)
      StatusBar.setHidden(true)
  }
  componentWillMount() {
    var params = {
      modelName: this.props.modelName,
      sponsorName: this.props.sponsorName
    };
    Actions.list(params)
  }
  componentDidMount() {
    this.listenTo(Store, 'onSponsorsList');
  }
  onSponsorsList(params) {
    var action = params.action;
    if (action === 'sponsorsList') {
      let sponsor = params.list  &&  params.list.length ? params.list[0] : null
      this.setState({
        resource: sponsor,
        dataSource: sponsor ? this.state.dataSource.cloneWithRows([sponsor]) : this.state.dataSource,
        isLoading: false
      })
    }
  }

  selectResource(resource) {
    var me = utils.getMe();
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    var model = utils.getModel(this.props.modelName);
    var isIdentity = this.props.modelName === PROFILE;
    var isVerification = model.value.id === constants.TYPES.VERIFICATION
    var isForm = model.value.id === constants.TYPES.FORM
    var isOrganization = this.props.modelName === ORGANIZATION;
    var m = utils.getModel(resource[TYPE]);
    var title = isIdentity ? resource.firstName : resource.name; //utils.getDisplayName(resource, model.value.properties);
    var modelName = constants.TYPES.MESSAGE;
    var self = this;
    let style = this.mergeStyle(resource.style)
    var route = {
      component: MessageList,
      id: 11,
      backButtonTitle: 'Back',
      title: title,
      passProps: {
        resource: resource,
        filter: '',
        modelName: modelName,
        currency: resource.currency,
        bankStyle: style,
      },
    }
    if (this.props.officialAccounts) {
      if (isOrganization)
        route.title = resource.name
      var msg = {
        message: translate('customerWaiting', me.firstName),
        _t: constants.TYPES.CUSTOMER_WAITING,
        from: me,
        to: utils.isEmployee(resource) ? me.organization : resource,
        time: new Date().getTime()
      }

      utils.onNextTransitionEnd(this.props.navigator, () => Actions.addMessage({msg: msg, isWelcome: true}))
    }

    this.props.navigator.push(route);
  }

  renderRow(resource)  {
    var model = utils.getModel(this.props.modelName);
    if (model.isInterface)
      model = utils.getModel(resource[TYPE])
 // || (model.id === constants.TYPES.FORM)
    var isVerification = model.id === constants.TYPES.VERIFICATION  ||  model.subClassOf === constants.TYPES.VERIFICATION
    var isForm = model.id === constants.TYPES.FORM || model.subClassOf === constants.TYPES.FORM
    var isMyProduct = model.id === 'tradle.MyProduct'  ||  model.subClassOf === 'tradle.MyProduct'
    var isSharedContext = utils.isContext(model)  &&  utils.isReadOnlyChat(resource)

    // let hasBacklink = this.props.prop && this.props.prop.items  &&  this.props.prop.backlink
    return (
      <SponsorRow
        onSelect={() => this.selectResource(resource)}
        key={'sponsorRow'}
        navigator={this.props.navigator}
        currency={this.props.currency}
        isOfficialAccounts={this.props.officialAccounts}
        resource={resource}/>
    );
  }
  renderFooter() {
    var me = utils.getMe();
    // if (!me  ||  (this.props.prop  &&  (this.props.prop.readOnly || (this.props.prop.items  &&  this.props.prop.items.readOnly))))
    //   return <View />;
    var model = utils.getModel(this.props.modelName);
    if (!this.props.prop  &&  model.id !== ORGANIZATION)
      return <View />
    // if (model.subClassOf === constants.TYPES.FINANCIAL_PRODUCT ||  model.subClassOf === ENUM)
    //   return <View />
    if (this.props.prop  &&  !this.props.prop.allowToAdd)
      return <View />
    let icon = Platform.OS === 'ios' ?  'md-more' : 'md-menu'
    let color = Platform.OS === 'ios' ? '#ffffff' : 'red'
    return (
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => this.ActionSheet.show()}>
            <View style={platformStyles.menuButtonNarrow}>
              <Icon name={icon}  size={33}  color={color} />
            </View>
          </TouchableOpacity>
        </View>
     )
  }

  render() {
    var content;
    var model = utils.getModel(this.props.modelName);
    if (this.state.dataSource.getRowCount() === 0   &&
        utils.getMe()                               &&
        !utils.getMe().organization                 &&
        model.subClassOf !== ENUM                   &&
        !this.props.isChooser                       &&
        this.props.modelName !== ORGANIZATION  &&
        (!model.subClassOf  ||  model.subClassOf !== ENUM)) {
      content = <NoResources
                  filter={this.state.filter}
                  model={model}
                  isLoading={this.state.isLoading}/>
    }
    else {
      content = <ListView
          dataSource={this.state.dataSource}
          renderHeader={this.renderHeader.bind(this)}
          enableEmptySections={true}
          renderRow={this.renderRow.bind(this)}
          automaticallyAdjustContentInsets={false}
          removeClippedSubviews={false}
          keyboardDismissMode='on-drag'
          keyboardShouldPersistTaps="always"
          initialListSize={10}
          pageSize={20}
          scrollRenderAhead={10}
          showsVerticalScrollIndicator={false} />;
    }
    var actionSheet = null // this.renderActionSheet()
    var footer = actionSheet && this.renderFooter()
    let network = this.props.isChooser || !this.props.officialAccounts || this.props.modelName !== ORGANIZATION
                ? <View/>
                : <NetworkInfoProvider connected={this.state.isConnected} serverOffline={this.state.serverOffline} />
    return (
      <PageView style={platformStyles.container}>
        {network}
        <View style={styles.separator} />
        {content}
        {footer}
        {actionSheet}
      </PageView>
    );
  }
  renderActionSheet() {
    let buttons
    if (this.state.allowToAdd) {
      buttons = [translate('addNew', this.props.prop.title), translate('cancel')]
    } else {
      if (!ENV.allowAddServer) return

      buttons = [
        translate('addServerUrl'),
        translate('scanQRcode'),
        translate('cancel')
      ]
    }

    return (
      <ActionSheet
        ref={(o) => {
          this.ActionSheet = o
        }}
        options={buttons}
        cancelButtonIndex={buttons.length - 1}
        onPress={(index) => {
          switch (index) {
          case 0:
            if (this.state.allowToAdd)
              this.addNew()
            else
              this.onSettingsPressed()
            break
          case 1:
            this.scanFormsQRCode()
            break;
          // case 2:
          //   this.talkToEmployee()
          //   break
          default:
            return
          }
        }}
      />
    )
  }
  onSettingsPressed() {
    var model = utils.getModel(constants.TYPES.SETTINGS)
    this.setState({hideMode: false})
    var route = {
      component: NewResource,
      title: 'Settings',
      backButtonTitle: 'Back',
      rightButtonTitle: 'Done',
      id: 4,
      titleTextColor: '#7AAAC3',
      passProps: {
        model: model,
        bankStyle: this.props.style,
        callback: () => {
          this.props.navigator.pop()
          Actions.list({modelName: this.props.modelName})
        }
        // callback: this.register.bind(this)
      },
    }

    this.props.navigator.push(route)
  }

  renderHeader() {
    let digital = (
              <View style={{padding: 5, backgroundColor: '#ffffff', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eeeeee'}}>
                <TouchableOpacity onPress={this.showProfile.bind(this)}>
                  <View style={styles.row}>
                    <Icon name='ios-leaf' color='goldenrod' size={45} style={styles.cellImage} />
                    <View style={[styles.textContainer, {flexDirection: 'row', flex:1}]}>
                      <Text style={[styles.resourceTitle, {flex: 1}]}>{translate('profile')}</Text>
                      <Icon color='#AAAAAA' size={20} name={'ios-arrow-forward'} style={{marginTop: 5}}/>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
             )
    let officialAccounts = (
              <View style={{padding: 5, backgroundColor: '#EDF5F8', marginBottom: 2, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eeeeee'}}>
                <TouchableOpacity onPress={this.showBanks.bind(this)}>
                  <View style={styles.row}>
                    <ConversationsIcon />
                    <View style={[styles.textContainer, {flexDirection: 'row', flex:1}]}>
                      <Text style={[styles.resourceTitle, {flex: 1}]}>{translate('officialAccounts')}</Text>
                      <Icon color='#AAAAAA' size={20} name={'ios-arrow-forward'} style={{marginTop: 5}}/>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
             )
    return  <View>
              {digital}
              {officialAccounts}
            </View>
  }
  showProfile() {
    let me = utils.getMe()
    let route = {
      title: translate('profile'),
      id: 3,
      component: ResourceView,
      titleTextColor: '#7AAAC3',
      backButtonTitle: 'Back',
      passProps: {
        resource: me
      },
      rightButtonTitle: 'Edit',
      onRightButtonPress: {
        title: me.firstName,
        id: 4,
        component: NewResource,
        // titleTextColor: '#7AAAC3',
        backButtonTitle: translate('back'),
        rightButtonTitle: translate('done'),
        passProps: {
          model: utils.getModel(me[constants.TYPE]),
          resource: me,
          bankStyle: defaultBankStyle
        }
      }
    }
    this.props.navigator.push(route)
  }
}
reactMixin(HomePage.prototype, Reflux.ListenerMixin);
reactMixin(HomePage.prototype, HomePageMixin)

var styles = StyleSheet.create({
  centerText: {
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
  },
  icon: {
    marginLeft: -23,
    marginTop: -25,
    color: 'red'
  },
  image: {
    width: 25,
    height: 25,
    marginRight: 5,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-end',
    height: 45,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
    // borderColor: '#eeeeee',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#cccccc',
  },
  row: {
    flexDirection: 'row',
    padding: 5,
  },
  textContainer: {
    alignSelf: 'center',
  },
  resourceTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: '#757575',
    marginBottom: 2,
    paddingLeft: 5
  },
  cellImage: {
    height: 45,
    marginRight: 10,
    width: 45,
  },
  menuButton: {
    marginTop: -23,
    paddingVertical: 5,
    paddingHorizontal: 21,
    borderRadius: 24,
    shadowOpacity: 1,
    shadowRadius: 5,
    shadowColor: '#afafaf',
    backgroundColor: 'red'
  },
  sharedContext: {
    position: 'absolute',
    right: 5,
    top: 20,
    width: 20,
    height:20,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#246624'
  },
  sharedContextText: {
    fontSize: 14,
    alignSelf: 'center',
    color: '#ffffff'
  },
});

module.exports = HomePage
