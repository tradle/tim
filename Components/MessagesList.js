'use strict';

var React = require('react-native');
var SearchBar = require('./SearchBar');
var MessageView = require('./MessageView');
var NoResources = require('./NoResources');
var NewResource = require('./NewResource');
var ResourceTypesScreen = require('./ResourceTypesScreen');
var AddNewMessage = require('./AddNewMessage');
var CameraView = require('./CameraView');
var utils = require('../utils/utils');
var reactMixin = require('react-mixin');
var Store = require('../Store/Store');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');
var InvertibleScrollView = require('react-native-invertible-scroll-view');

var {
  ListView,
  Component,
  StyleSheet,
  Navigator,
  View,
} = React;

var currentMessageTime;

class MessagesList extends Component {
  constructor(props) {
    super(props);
    this.timeoutID = null;
    this.state = {
      isLoading: utils.getModels() ? false : true,
      selectedAssets: {},
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      filter: this.props.filter,
      userInput: ''
    };
  }
  componentWillMount() {
    if (this.props.isAggregation)
      Actions.list('', this.props.modelName, this.props.resource, true);    
    else
      Actions.list('', this.props.modelName, this.props.resource);    
  }
  componentDidMount() {
    this.listenTo(Store, 'onListUpdate');
  }

  onListUpdate(params) {
    if (params.error)
      return;
    if (params.action === 'addItem') {
      Actions.list(this.state.filter, this.props.modelName, this.props.resource);
      return;      
    }

    if (params.action !== 'messageList' ||  !params.list || params.isAggregation !== this.props.isAggregation)
      return;
    var list = params.list;
    if (list.length || this.state.filter.length) {
      var type = list[0]['_type'];
      if (type  !== this.props.modelName) {
        var model = utils.getModel(this.props.modelName).value;
        if (!model.isInterface)
          return;
        
        var rModel = utils.getModel(type).value;
        if (!rModel.interfaces  ||  rModel.interfaces.indexOf(this.props.modelName) === -1) 
          return;
      }
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(list),
        isLoading: false
      })
    }
  }

  selectResource(resource) {
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    if (!resource['_type']) 
      return;
    var model = utils.getModel(resource['_type']).value;
    var title = utils.getDisplayName(resource, model.properties);
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
    var timeProp = utils.getCloneOf('tradle.Message.time', model.properties);

    var route = {
      title: newTitle,
      id: 5,
      backButtonTitle: 'Back',
      component: MessageView,
      parentMeta: model,
      passProps: {resource: resource},
    }
    this.props.navigator.push(route);
  }

  onSearchChange(event) {
    var filter = event.nativeEvent.text.toLowerCase();
    Actions.list(filter, this.props.modelName, this.props.resource);
  }

  renderRow(resource)  {
    var model = utils.getModel(resource['_type'] || resource.id).value;
    var isMessage = model.interfaces  &&  model.interfaces.indexOf('tradle.Message') != -1;
    var isAggregation = this.props.isAggregation; 
    var me = utils.getMe();
    var MessageRow = require('./MessageRow');
    var previousMessageTime = currentMessageTime;
    currentMessageTime = resource.time;
    return  (
      <MessageRow 
        onSelect={this.selectResource.bind(this, resource)}
        resource={resource}
        isAggregation={isAggregation}
        navigator={this.props.navigator}
        previousMessageTime={previousMessageTime}
        to={isAggregation ? resource.to : this.props.resource} />
      );
  }
  addedMessage(text) {
    Actions.list('', this.props.modelName, this.props.resource);
  }

  render() {
    if (this.state.isLoading) 
      return <View/>
    var content;
    if (this.state.dataSource.getRowCount() === 0)
      content =  <NoResources
                  filter={this.state.filter}
                  title={utils.getModel(this.props.modelName).value.title}
                  isLoading={this.state.isLoading}/> 
    else {
      var model = utils.getModel(this.props.modelName).value; 
      var isAllMessages = model.isInterface  &&  model.id === 'tradle.Message';
      content = <ListView ref='listview'
          dataSource={this.state.dataSource}
          // renderFooter={this.renderFooter.bind(this)}
          renderRow={this.renderRow.bind(this)}
          renderScrollView={
            (props) => <InvertibleScrollView {...props} inverted />
          }
          automaticallyAdjustContentInsets={false}
          keyboardDismissMode='onDrag'
          keyboardShouldPersistTaps={true}
          showsVerticalScrollIndicator={false} />;
      if (isAllMessages)      
        content = 
          <InvertibleScrollView
            ref='messages'
            inverted
            automaticallyAdjustContentInsets={false}
            scrollEventThrottle={200}>
          {content}
          </InvertibleScrollView>    
    
      
    }
    var model = utils.getModel(this.props.modelName).value;

    var addNew = (model.isInterface) 
           ? <AddNewMessage navigator={this.props.navigator} 
                            resource={this.props.resource} 
                            modelName={this.props.modelName} 
                            onAddNewPressed={this.onAddNewPressed.bind(this)}
                            onTakePicPressed={this.onTakePicPressed.bind(this)}
                            onPhotoSelect={this.onPhotoSelect.bind(this)}
                            callback={this.addedMessage.bind(this)} />
           : <View></View>;
    return (
      <View style={styles.container}> 
        <SearchBar
          onSearchChange={this.onSearchChange.bind(this)}
          isLoading={this.state.isLoading}
          filter={this.props.filter}
          onFocus={() => this.refs.length  &&  this.refs.listview.getScrollResponder().scrollTo(0, 0)} 
          />
        <View style={styles.separator} />
        {content}
        {addNew}
      </View>
    );
  }
  onPhotoSelect(asset) {
    var selectedAssets = this.state.selectedAssets;
    // unselect if was selected before
    if (selectedAssets[asset.node.image.uri])
      delete selectedAssets[asset.node.image.uri];
    else
      selectedAssets[asset.node.image.uri] = asset;
  }
  onAddNewPressed() {
    var modelName = this.props.modelName;
    var model = utils.getModel(modelName).value;
    var isInterface = model.isInterface;
    if (!isInterface) 
      return;

    var self = this;
    var currentRoutes = self.props.navigator.getCurrentRoutes();
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
        callback: this.props.callback
      },
      rightButtonTitle: 'ion|plus',
      onRightButtonPress: {
        id: 4,
        title: 'New model url',
        component: NewResource,
        backButtonTitle: 'Back',
        titleTextColor: '#7AAAC3',
        passProps: {
          model: utils.getModel('tradle.NewMessageModel').value,
          callback: this.modelAdded.bind(this)
        }        
      }
    });
  }
  modelAdded(resource) {
    if (resource.url) 
      Actions.addModelFromUrl(resource.url);    
  }  
  onTakePicPressed() {
    var self = this;
    this.props.navigator.push({
      title: 'Take a pic',
      id: 12,
      component: CameraView,
      passProps: {
        ontakePic: self.onTakePic.bind(this)
      }
    });
  }
  onTakePic(data) {

  }
}
reactMixin(MessagesList.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  centerText: {
    alignItems: 'center',
  },
  NoResourcesText: {
    marginTop: 80,
    color: '#888888',
  },
  separator: {
    height: 1,
    backgroundColor: '#cccccc',
  }
});
module.exports = MessagesList;

