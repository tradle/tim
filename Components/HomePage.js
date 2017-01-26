'use strict';

var NoResources = require('./NoResources');
var ResourceRow = require('./ResourceRow');
var SponsorRow = require('./SponsorRow')
var ResourceView = require('./ResourceView');
var ResourceList = require('./ResourceList');
var VerificationRow = require('./VerificationRow');
var NewResource = require('./NewResource');
var MessageList = require('./MessageList');
var MessageView = require('./MessageView')
var PageView = require('./PageView')
var SupervisoryView = require('./SupervisoryView')
import ActionSheet from 'react-native-actionsheet'
var utils = require('../utils/utils');
var translate = utils.translate
var reactMixin = require('react-mixin');
var extend = require('extend')
var Store = require('../Store/Store');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');
var constants = require('@tradle/constants');
var Icon = require('react-native-vector-icons/Ionicons');
var QRCodeScanner = require('./QRCodeScanner')
var QRCode = require('./QRCode')
var buttonStyles = require('../styles/buttonStyles');
var NetworkInfoProvider = require('./NetworkInfoProvider')
var defaultBankStyle = require('../styles/bankStyle.json')
var StyleSheet = require('../StyleSheet')

const WEB_TO_MOBILE = '0'
const TALK_TO_EMPLOYEEE = '1'
const APP_QR_CODE = '5'
const PRODUCT_APPLICATION = 'tradle.ProductApplication'
const PARTIAL = 'tradle.Partial'
const TYPE = constants.TYPE
const ROOT_HASH = constants.ROOT_HASH
const PROFILE = constants.TYPES.PROFILE
const ORGANIZATION = constants.TYPES.ORGANIZATION

// var bankStyles = require('../styles/bankStyles')
const ENUM = 'tradle.Enum'

import React, { Component, PropTypes } from 'react'
import {
  ListView,
  Navigator,
  Alert,
  TouchableOpacity,
  Image,
  StatusBar,
  View,
  Text,
  Platform
} from 'react-native';

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
    // if (action === 'getForms') {
    //   if (!params.to)
    //     return
    //   let style = this.mergeStyle(params.to.style)

    //   var route = {
    //     title: params.to.name,
    //     component: MessageList,
    //     id: 11,
    //     backButtonTitle: 'Back',
    //     passProps: {
    //       resource: params.to,
    //       filter: '',
    //       modelName: constants.TYPES.MESSAGE,
    //       currency: params.to.currency,
    //       bankStyle:  style,
    //       dictionary: params.dictionary,
    //     }
    //   }
    //   this.props.navigator.replace(route)
    //   return
    // }
  }
  mergeStyle(newStyle) {
    let style = {}
    extend(style, defaultBankStyle)
    return newStyle ? extend(style, newStyle) : style
  }

  selectResource(resource) {
    var me = utils.getMe();
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    var model = utils.getModel(this.props.modelName);
    var isIdentity = this.props.modelName === PROFILE;
    var isVerification = model.value.id === constants.TYPES.VERIFICATION
    var isForm = model.value.id === constants.TYPES.FORM
    var isOrganization = this.props.modelName === ORGANIZATION;
    var m = utils.getModel(resource[TYPE]).value;
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
    var model = utils.getModel(this.props.modelName).value;
    if (model.isInterface)
      model = utils.getModel(resource[TYPE]).value
 // || (model.id === constants.TYPES.FORM)
    var isVerification = model.id === constants.TYPES.VERIFICATION  ||  model.subClassOf === constants.TYPES.VERIFICATION
    var isForm = model.id === constants.TYPES.FORM || model.subClassOf === constants.TYPES.FORM
    var isMyProduct = model.id === 'tradle.MyProduct'  ||  model.subClassOf === 'tradle.MyProduct'
    var isSharedContext = model.id === PRODUCT_APPLICATION && utils.isReadOnlyChat(resource)

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
    var model = utils.getModel(this.props.modelName).value;
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
  showBanks() {
    this.props.navigator.push({
      title: translate('officialAccounts'),
      id: 10,
      component: ResourceList,
      backButtonTitle: 'Back',
      titleTextColor: '#7AAAC3',
      passProps: {
        officialAccounts: true,
        serverOffline: this.state.serverOffline,
        bankStyle: this.props.style,
        modelName: ORGANIZATION
      }
    });
  }

  render() {
    var content;
    var model = utils.getModel(this.props.modelName).value;
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
          keyboardShouldPersistTaps={true}
          initialListSize={10}
          pageSize={20}
          scrollRenderAhead={10}
          showsVerticalScrollIndicator={false} />;
    }
    var actionSheet = this.renderActionSheet()
    var footer = actionSheet && this.renderFooter()
    let network = this.props.isChooser || !this.props.officialAccounts || this.props.modelName !== ORGANIZATION
                ? <View/>
                : <NetworkInfoProvider connected={this.state.isConnected} serverOffline={this.state.serverOffline} />

    // let title = this.props.tabLabel
    //           ? <View style={{height: 45, backgroundColor: '#ffffff', alignSelf: 'stretch', justifyContent: 'center'}}>
    //               <Text style={{alignSelf: 'center', fontSize: 20}}>{translate('officialAccounts')}</Text>
    //             </View>
    //           : null
      // <PageView style={[platformStyles.container, this.props.tabLabel ? {marginTop: utils.isAndroid() ? 10 : 18} : {}]}>
      //   {title}

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
    var model = utils.getModel(constants.TYPES.SETTINGS).value
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
              <View style={{padding: 5, backgroundColor: '#ffffff', marginBottom: 2}}>
                <TouchableOpacity onPress={this.showProfile.bind(this)}>
                  <View style={styles.row}>
                    <Icon name='ios-leaf' color='goldenrod' size={45} style={styles.cellImage} />
                    <View style={[styles.textContainer, {flexDirection: 'row', flex:1}]}>
                      <Text style={[styles.resourceTitle, {flex: 1}]}>{translate('digitalWealthPassport')}</Text>
                      <Icon color='#AAAAAA' size={20} name={'ios-arrow-forward'} style={{marginTop: 5}}/>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
             )
    let officialAccounts = (
              <View style={{padding: 5, backgroundColor: '#EDF5F8', marginBottom: 2}}>
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
      title: translate('digitalWealthPassport'),
      id: 3,
      component: ResourceView,
      titleTextColor: '#7AAAC3',
      backButtonTitle: 'Back',
      rightButtonTitle: 'Edit',
      passProps: {
        resource: me
      },
      onRightButtonPress: {
        title: me.firstName,
        id: 4,
        component: NewResource,
        // titleTextColor: '#7AAAC3',
        backButtonTitle: translate('back'),
        rightButtonTitle: translate('done'),
        passProps: {
          model: utils.getModel(me[constants.TYPE]).value,
          resource: me,
          bankStyle: defaultBankStyle
        }
      }
    }
    this.props.navigator.push(route)
  }
  scanFormsQRCode() {
    this.setState({hideMode: false})
    this.props.navigator.push({
      title: 'Scan QR Code',
      id: 16,
      component: QRCodeScanner,
      titleTintColor: '#eeeeee',
      backButtonTitle: 'Cancel',
      // rightButtonTitle: 'ion|ios-reverse-camera',
      passProps: {
        onread: this.onread.bind(this)
      }
    })
  }

  onread(result) {
    // Pairing devices QRCode
    if (result.data.charAt(0) === '{') {
      h = JSON.parse(result.data)
      Actions.sendPairingRequest(h)
      this.props.navigator.pop()
      return
    }
    let h = result.data.split(';')


    // post to server request for the forms that were filled on the web
    let me = utils.getMe()
    switch (h[0]) {
    case WEB_TO_MOBILE:
      let r = {
        _t: 'tradle.GuestSessionProof',
        session: h[1],
        from: {
          id: utils.getId(me),
          title: utils.getDisplayName(me)
        },
        to: {
          id: PROFILE + '_' + h[2]
        }
      }
      Actions.addItem({resource: r, value: r, meta: utils.getModel('tradle.GuestSessionProof').value, disableAutoResponse: true})
      break
    case TALK_TO_EMPLOYEEE:
      Actions.getEmployeeInfo(result.data.substring(h[0].length + 1))
      break
    case APP_QR_CODE:
      Actions.addApp(result.data.substring(h[0].length + 1))
      break
    default:
      // keep scanning
      Alert.alert(
        translate('error'),
        translate('unknownQRCodeFormat')
      )

      this.props.navigator.pop()
      break
    }
  }
}
reactMixin(HomePage.prototype, Reflux.ListenerMixin);

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
