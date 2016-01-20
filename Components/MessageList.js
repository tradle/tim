'use strict';

var React = require('react-native');
var SearchBar = require('react-native-search-bar');
var MessageView = require('./MessageView');
var NoResources = require('./NoResources');
var NewResource = require('./NewResource');
var ResourceTypesScreen = require('./ResourceTypesScreen');
var AddNewMessage = require('./AddNewMessage');
var ProductChooser = require('./ProductChooser');
// var CameraView = require('./CameraView');
var Icon = require('react-native-vector-icons/Ionicons');

var utils = require('../utils/utils');
var reactMixin = require('react-mixin');
var Store = require('../Store/Store');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');
var InvertibleScrollView = require('react-native-invertible-scroll-view');
var constants = require('@tradle/constants');
var bankStyles = require('../styles/bankStyles')
var LINK_COLOR

var {
  ListView,
  Component,
  StyleSheet,
  Navigator,
  View,
  Text,
  AlertIOS,
  ActionSheetIOS,
  ActivityIndicatorIOS,
  TouchableHighlight
} = React;

var currentMessageTime;

class MessageList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      selectedAssets: {},
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) =>  row1 !== row2
      }),
      filter: this.props.filter,
      userInput: ''
    };
    if (bankStyles) {
      var name = props.resource.name.split(' ')[0].toLowerCase()
      this.state.bankStyle = bankStyles[name]
      if (this.state.bankStyle)
        LINK_COLOR = this.state.bankStyle.LINK_COLOR || '#cccccc'
      else
        LINK_COLOR = '#cccccc'
    }

  }
  componentWillMount() {
    var params = {
      modelName: this.props.modelName,
      to: this.props.resource,
      prop: this.props.prop,
    }
    if (this.props.isAggregation)
      params.isAggregation = true;

    utils.onNextTransitionEnd(this.props.navigator, () => Actions.messageList(params));
    // Actions.messageList(params)
  }
  componentDidMount() {
    this.listenTo(Store, 'onAction');
  }

  onAction(params) {
    if (params.error)
      return;
    if (params.action === 'addItem'  ||  params.action === 'addVerification') {
      var actionParams = {
        query: this.state.filter,
        modelName: this.props.modelName,
        to: this.props.resource,
      }

      Actions.messageList(actionParams);
      return;
    }
    if (params.action === 'addMessage') {
      Actions.messageList({modelName: this.props.modelName, to: this.props.resource});
      return
    }
    if ( params.action !== 'messageList'   ||
        !params.list                       ||
        params.isAggregation !== this.props.isAggregation)
      return;
    if (params.resource  &&  params.resource[constants.ROOT_HASH] != this.props.resource[constants.ROOT_HASH]) {
      var doUpdate
      if (this.props.resource[constants.TYPE] === constants.TYPES.ORGANIZATION  &&  params.resource.organization) {
        if (this.props.resource[constants.TYPE] + '_' + this.props.resource[constants.ROOT_HASH] === utils.getId(params.resource.organization))
          doUpdate = true
      }
      if (!doUpdate)
        return;
    }
    var list = params.list;
    if (list.length || (this.state.filter  &&  this.state.filter.length)) {
      var type = list[0][constants.TYPE];
      if (type  !== this.props.modelName) {
        var model = utils.getModel(this.props.modelName).value;
        if (!model.isInterface)
          return;

        var rModel = utils.getModel(type).value;
        if (!rModel.interfaces  ||  rModel.interfaces.indexOf(this.props.modelName) === -1)
          return;
      }

      // if (params.verificationsToShare) {
      //   for (var formName in params.verificationsToShare) {
      //     utils.dedupeVerifications(params.verificationsToShare[formName])
      //   }
      // }
      list.sort(function(a, b) {
        return b.time - a.time;
      });
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(list),
        isLoading: false,
        list: list,
        verificationsToShare: params.verificationsToShare
      });
    }
    else {
      var first = true
      this.setState({isLoading: false})
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (!this.state.list  ||  !nextState.list  ||  this.state.list.length !== nextState.list.length)
      return true
    var isDiff = false
    for (var i=0; i<this.state.list.length  &&  !isDiff; i++) {
      if (this.state.list[i][constants.ROOT_HASH] !== nextState.list[i][constants.ROOT_HASH]) {
        if (i === this.state.list.length - 1                      &&
            this.state.list[i][constants.TYPE] === nextState.list[i][constants.TYPE]  &&
            this.state.list[i][constants.TYPE] === constants.TYPES.PRODUCT_LIST)
        if (JSON.stringify(this.state.list[i].list) !== JSON.stringify(nextState.list[i].list))
          isDiff = true
      }
    }
    return isDiff
  }
  share(resource, to, formResource) {
    console.log('Share')
    Actions.share(resource, to, formResource)
  }

  selectResource(resource) {
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    if (!resource[constants.TYPE])
      return;
    var model = utils.getModel(resource[constants.TYPE]).value;
    var title = model.title; //utils.getDisplayName(resource, model.properties);
    var newTitle = title;
    if (title.length > 20) {
      var t = title.split(' ');
      newTitle = '';
      t.forEach(function(word) {
        if (newTitle.length + word.length > 20)
          return;
        newTitle += newTitle.length ? ' ' + word : word;
      })
    }
    var route = {
      title: newTitle,
      id: 5,
      backButtonTitle: 'Back',
      component: MessageView,
      parentMeta: model,
      passProps: {
        bankStyle: this.state.bankStyle,
        resource: resource
      },
    }
    this.props.navigator.push(route);
  }

  onSearchChange(text) {
    var actionParams = {
      query: text,
      modelName: this.props.modelName,
      to: this.props.resource,
    }

    Actions.messageList(actionParams);
  }

  renderRow(resource, sectionId, rowId)  {
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;
    var isMessage = model.interfaces  &&  model.interfaces.indexOf(constants.TYPES.MESSAGE) != -1;
    var isAggregation = this.props.isAggregation;
    var me = utils.getMe();
    var MessageRow = require('./MessageRow');
    var previousMessageTime = currentMessageTime;
    currentMessageTime = resource.time;
    return  (
      <MessageRow
        onSelect={this.selectResource.bind(this)}
        share={this.share.bind(this)}
        resource={resource}
        messageNumber={rowId}
        isAggregation={isAggregation}
        navigator={this.props.navigator}
        bankStyle={this.state.bankStyle}
        verificationsToShare={this.state.verificationsToShare}
        previousMessageTime={previousMessageTime}
        to={isAggregation ? resource.to : this.props.resource} />
      );
  }
  addedMessage(text) {
    Actions.messageList({modelName: this.props.modelName, to: this.props.resource});
  }

  render() {
    currentMessageTime = null;
    var content;
    var model = utils.getModel(this.props.modelName).value;
    if (this.state.dataSource.getRowCount() === 0) {
      if (this.props.resource[constants.TYPE] === constants.TYPES.ORGANIZATION) {
        content = <View style={[styles.container]}>
          <Text style={{fontSize: 16, alignSelf: 'center', marginTop: 80, color: '#629BCA'}}>{'Loading...'}</Text>
          <ActivityIndicatorIOS size='large' style={{alignSelf: 'center', marginTop: 20}} />
        </View>
      }
      else
        content =  <NoResources
                    filter={this.state.filter}
                    model={model}
                    isLoading={this.state.isLoading}/>
    }
    else {
      var isAllMessages = model.isInterface  &&  model.id === constants.TYPES.MESSAGE;

      if (isAllMessages) {
        content = <ListView ref='ListView'
          renderScrollComponent={props =>
            <InvertibleScrollView
              ref='messages'
              inverted
              style={{marginHorizontal: 10}}
              automaticallyAdjustContentInsets={false}
              scrollEventThrottle={200}/>
          }
          dataSource={this.state.dataSource}
          initialListSize={10}
          renderRow={this.renderRow.bind(this)}
          automaticallyAdjustContentInsets={false}
          keyboardDismissMode='on-drag'
          keyboardShouldPersistTaps={true}
          showsVerticalScrollIndicator={false} />

      }
      else {
        content = <ListView ref='listview'
            style={{marginHorizontal: 10}}
            dataSource={this.state.dataSource}
            initialListSize={10}
            renderRow={this.renderRow.bind(this)}
            automaticallyAdjustContentInsets={false}
            keyboardDismissMode='on-drag'
            keyboardShouldPersistTaps={true}
            showsVerticalScrollIndicator={false} />;
      }
    }

    var addNew = (model.isInterface)
           ? <AddNewMessage navigator={this.props.navigator}
                            resource={this.props.resource}
                            modelName={this.props.modelName}
                            onAddNewPressed={this.onAddNewPressed.bind(this)}
                            onMenu={this.showMenu.bind(this)}
                            onPhotoSelect={this.onPhotoSelect.bind(this)}
                            callback={this.addedMessage.bind(this)} />
           : <View/>;
                            // onTakePicPressed={this.onTakePicPressed.bind(this)}
    var isOrg = !this.props.isAggregation  &&  this.props.resource  &&  this.props.resource[constants.TYPE] === constants.TYPES.ORGANIZATION
    var chooser
    if (isOrg)
      chooser =  <View style={{flex:1, marginTop: 8}}>
                  <TouchableHighlight underlayColor='transparent' onPress={this.onAddNewPressed.bind(this, true)}>
                    <Icon name={'arrow-down-c'} size={25} style={styles.imageOutline} />
                  </TouchableHighlight>
                </View>
    else
      chooser = <View/>

    var sepStyle = { height: 1,backgroundColor: LINK_COLOR }

    return (
      <View style={styles.container}>
        <View style={{flexDirection:'row'}}>
          <View style={{flex: 10}}>
            <SearchBar
              onChangeText={this.onSearchChange.bind(this)}
              placeholder='Search'
              showsCancelButton={false}
              hideBackground={true} />
          </View>
        </View>

        <View style={ sepStyle } />
        {content}
        {addNew}
      </View>
    );
  }
  // render() {
  //   currentMessageTime = null;
  //   var content;
  //   var model = utils.getModel(this.props.modelName).value;
  //   if (this.state.dataSource.getRowCount() === 0) {
  //     if (this.props.resource[constants.TYPE] === constants.TYPES.ORGANIZATION) {
  //       content = <View style={[styles.container]}>
  //         <Text style={{fontSize: 16, alignSelf: 'center', marginTop: 80, color: '#629BCA'}}>{'Loading...'}</Text>
  //         <ActivityIndicatorIOS size='large' style={{alignSelf: 'center', marginTop: 20}} />
  //       </View>
  //     }
  //     else
  //       content =  <NoResources
  //                   filter={this.state.filter}
  //                   model={model}
  //                   isLoading={this.state.isLoading}/>
  //   }
  //   else {
  //     var isAllMessages = model.isInterface  &&  model.id === constants.TYPES.MESSAGE;

  //     content = <ListView ref='listview' style={{marginHorizontal: 10}}
  //         dataSource={this.state.dataSource}
  //         initialListSize={10}
  //         renderRow={this.renderRow.bind(this)}
  //         automaticallyAdjustContentInsets={false}
  //         keyboardDismissMode='on-drag'
  //         keyboardShouldPersistTaps={true}
  //         showsVerticalScrollIndicator={false} />;
  //     if (isAllMessages)
  //       content =
  //         <InvertibleScrollView
  //           ref='messages'
  //           inverted
  //           automaticallyAdjustContentInsets={false}
  //           scrollEventThrottle={200}>
  //         {content}
  //         </InvertibleScrollView>
  //   }

  //   var addNew = (model.isInterface)
  //          ? <AddNewMessage navigator={this.props.navigator}
  //                           resource={this.props.resource}
  //                           modelName={this.props.modelName}
  //                           onAddNewPressed={this.onAddNewPressed.bind(this)}
  //                           onMenu={this.showMenu.bind(this)}
  //                           onPhotoSelect={this.onPhotoSelect.bind(this)}
  //                           callback={this.addedMessage.bind(this)} />
  //          : <View/>;
  //                           // onTakePicPressed={this.onTakePicPressed.bind(this)}
  //   var isOrg = !this.props.isAggregation  &&  this.props.resource  &&  this.props.resource[constants.TYPE] === constants.TYPES.ORGANIZATION
  //   var chooser
  //   if (isOrg)
  //     chooser =  <View style={{flex:1, marginTop: 8}}>
  //                 <TouchableHighlight underlayColor='transparent' onPress={this.onAddNewPressed.bind(this, true)}>
  //                   <Icon name={'arrow-down-c'} size={25} style={styles.imageOutline} />
  //                 </TouchableHighlight>
  //               </View>
  //   else
  //     chooser = <View/>

  //   var sepStyle = { height: 1,backgroundColor: LINK_COLOR }

  //   return (
  //     <View style={styles.container}>
  //       <View style={{flexDirection:'row'}}>
  //         <View style={{flex: 10}}>
  //           <SearchBar
  //             onChangeText={this.onSearchChange.bind(this)}
  //             placeholder='Search'
  //             showsCancelButton={false}
  //             hideBackground={true} />
  //         </View>
  //       </View>

  //       <View style={ sepStyle } />
  //       {content}
  //       {addNew}
  //     </View>
  //   );
  // }
  showMenu() {
    // var buttons = ['Talk to representative', 'Forget me', 'Cancel']
    var buttons = ['Forget me', 'Cancel']
    var self = this;
    ActionSheetIOS.showActionSheetWithOptions({
      options: buttons,
      cancelButtonIndex: 1
    }, function(buttonIndex) {
      switch (buttonIndex) {
      // case 0:
      //   Actions.talkToRepresentative(self.props.resource)
      //   break
      case 0:
        self.forgetMe()
        break;
      default:
        return
      }
    });
  }
      // 'Are you sure you want \'' + utils.getDisplayName(resource, utils.getModel(resource[constants.TYPE]).value.properties) + '\' to forget you',
  forgetMe() {
    var resource = this.props.resource
    AlertIOS.alert(
      'Are you sure you want \'' + utils.getDisplayName(resource, utils.getModel(resource[constants.TYPE]).value.properties) + '\' to forget you',
      'This is a test mechanism to reset all communications with this provider',
      [
        {text: 'OK', onPress: () => {
            Actions.forgetMe(resource)
          }
        },
        {text: 'Cancel', onPress: () => console.log('Cancel')}
      ]
    )
  }

  onPhotoSelect(asset) {
    var selectedAssets = this.state.selectedAssets;
    // unselect if was selected before
    if (selectedAssets[asset.node.image.uri])
      delete selectedAssets[asset.node.image.uri];
    else
      selectedAssets[asset.node.image.uri] = asset;
  }
  onAddNewPressed(sendForm) {
    var modelName = this.props.modelName;
    var model = utils.getModel(modelName).value;
    var isInterface = model.isInterface;
    if (!isInterface)
      return;

    var self = this;
    var currentRoutes = self.props.navigator.getCurrentRoutes();
    var resource = this.props.resource
    // if (resource.name === 'Lloyds') {
      var currentRoutes = self.props.navigator.getCurrentRoutes();
      this.props.navigator.push({
        title: 'Financial Product',
        id: 15,
        component: ProductChooser,
        sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
        backButtonTitle: 'Cancel',
        passProps: {
          resource: resource,
          returnRoute: currentRoutes[currentRoutes.length - 1],
          callback: this.props.callback
        },
        rightButtonTitle: 'ion|plus',
        onRightButtonPress: {
          id: 4,
          title: 'New product',
          component: NewResource,
          backButtonTitle: 'Back',
          titleTextColor: '#7AAAC3',
          rightButtonTitle: 'Done',
          passProps: {
            model: utils.getModel('tradle.NewMessageModel').value,
            // callback: this.modelAdded.bind(this)
          }
        }
      });
    //   return;
    // }
/*
    this.props.navigator.push({
      title: utils.makeLabel(model.title) + ' type',
      id: 2,
      component: ResourceTypesScreen,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      backButtonTitle: 'Chat',
      passProps: {
        resource: self.props.resource,
        returnRoute: currentRoutes[currentRoutes.length - 1],
        modelName: modelName,
        sendForm: sendForm,
        callback: this.props.callback
      },
      rightButtonTitle: 'ion|plus',
      onRightButtonPress: {
        id: 4,
        title: 'New model url',
        component: NewResource,
        backButtonTitle: 'Back',
        titleTextColor: '#7AAAC3',
        rightButtonTitle: 'Done',
        passProps: {
          model: utils.getModel('tradle.NewMessageModel').value,
          callback: this.modelAdded.bind(this)
        }
      }
    });
*/
  }
  modelAdded(resource) {
    if (resource.url)
      Actions.addModelFromUrl(resource.url);
  }
  // onTakePicPressed() {
  //   var self = this;
  //   this.props.navigator.push({
  //     title: 'Take a pic',
  //     backButtonTitle: 'Cancel',
  //     id: 12,
  //     component: CameraView,
  //     sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
  //     passProps: {
  //       onTakePic: self.onTakePic.bind(this),
  //     }
  //   });
  // }
  onTakePic(data) {
    var msg = {
      from: utils.getMe(),
      to: this.props.resource,
      time: new Date().getTime(),
      photos: [{
        url: data
      }]
    }
    msg[constants.TYPE] = 'tradle.SimpleMessage';
    this.props.navigator.pop();
    Actions.addMessage(msg);
  }
}
reactMixin(MessageList.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 60,
    backgroundColor: '#f7f7f7',
  },
  centerText: {
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#cccccc',
  },
  imageOutline: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderColor: '#aaaaaa',
    paddingLeft: 6,
    // paddingLeft: 8,
    borderWidth: 1,
    color: '#79AAF2'
  },

});
module.exports = MessageList;

