'use strict';

var React = require('react-native');
var SearchBar = require('./SearchBar');
var MessageView = require('./MessageView');
var NoResources = require('./NoResources');
var NewResource = require('./NewResource');
var ResourceTypesScreen = require('./ResourceTypesScreen');
var AddNewMessage = require('./AddNewMessage');
var utils = require('../utils/utils');
var reactMixin = require('react-mixin');
var Store = require('../Store/Store');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');

var InvertibleScrollView = require('react-native-invertible-scroll-view');
var messageCount;

var {
  ListView,
  Component,
  StyleSheet,
  Navigator,
  View,
} = React;

class MessagesList extends Component {
  constructor(props) {
    super(props);
    this.timeoutID = null;
    this.state = {
      isLoading: utils.getModels() ? false : true,
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
    var me = utils.getMe();
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    var model = utils.getModel(this.props.modelName);

    if (resource['_type']) {
      this._selectResource(resource);
      return;
    }
    // var props = {
    //   metadata: utils.getModel(resource.id).value,
    //   resource: {
    //     '_type': this.props.modelName, 
    //     'from': me,
    //     'to': this.props.resource
    //   }
    // };
    // if (this.props.returnRoute)
    //   props.returnRoute = this.props.returnRoute;

    // this.props.navigator.replace({
    //   id: 4,
    //   title: resource.title,
    //   component: NewResource,
    //   titleTextColor: '#7AAAC3',
    //   passProps: props
    // });

  }

  _selectResource(resource) {
    var model = utils.getModel(this.props.modelName);
    var title = utils.getDisplayName(resource, model.value.properties);
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
      id: model.value.isInterface ? 5 : 3,
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
    return  (
      <MessageRow 
        onSelect={this.selectResource.bind(this, resource)}
        resource={resource}
        isAggregation={isAggregation}
        navigator={this.props.navigator}
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

  onAddNewPressed() {
    var modelName = this.props.modelName;
    var model = utils.getModel(modelName).value;
    var isInterface = model.isInterface;
    if (!isInterface) 
      return;

    var self = this;
    var currentRoutes = self.props.navigator.getCurrentRoutes();
    self.props.navigator.push({
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
          metadata: utils.getModel('tradle.NewMessageModel').value,
          callback: this.modelAdded.bind(this)
        }        
      }
    });
  }
  modelAdded(resource) {
    if (resource.url) 
      Actions.addModelFromUrl(resource.url);    
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

