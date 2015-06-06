'use strict';

var React = require('react-native');
var reactMixin = require('react-mixin');
var SearchBar = require('./SearchBar');
// var TimerMixin = require('react-timer-mixin');
var ResourceRow = require('./ResourceRow');
var MessageRow = require('./MessageRow');
var ResourceView = require('./ResourceView');
var MessageView = require('./MessageView');
var NewResource = require('./NewResource');
var AddNewMessage = require('./AddNewMessage');
var utils = require('../utils/utils');
var Store = require('../Store/Store');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');

var InvertibleScrollView = require('react-native-invertible-scroll-view');
var messageCount;

var {
  ListView,
  Component,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} = React;

var resultsCache = {
  dataForQuery: {},
  nextPageNumberForQuery: {},
  totalForQuery: {},
};

var LOADING = {};

class SearchScreen extends Component {
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
    if (!params.list  ||  params.error || params.isAggregation !== this.props.isAggregation)
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
        dataSource: this.getDataSource(list),
        isLoading: false
      })
    }
  }

  getDataSource(resources) {
    return this.state.dataSource.cloneWithRows(resources);
  }

  selectResource(resource) {
    var me = utils.getMe();
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    var model = utils.getModel(this.props.modelName);

    if (model.value.isInterface) {
      if (resource['_type']) {
        this._selectResource(resource);
        return;
      }
      var props = {
        metadata: utils.getModel(resource.id).value,
        resource: {
          '_type': this.props.modelName, 
          'from': me,
          'to': this.props.resource
        }
      };
      if (this.props.returnRoute)
        props.returnRoute = this.props.returnRoute;

      this.props.navigator.replace({
        id: 4,
        title: resource.title,
        component: NewResource,
        titleTextColor: '#7AAAC3',
        passProps: props
      });
      return;
    }
    if (me.rootHash === resource.rootHash  ||  
       (this.props.resource  &&  me.rootHash === this.props.resource.rootHash  && this.props.prop)) {
      this._selectResource(resource);
      return;
    }

    var title = resource.firstName; //utils.getDisplayName(resource, model.value.properties);
    var modelName = 'tradle.Message';
    var self = this;
    var route = {
      title: title,
      component: SearchScreen,
      id: 10,
      passProps: {
        resource: resource, 
        filter: '',
        modelName: modelName,
      },
      rightButtonTitle: 'Profile', //'fontawesome|user',
      onRightButtonPress: {
        title: title,
        id: 3,
        component: ResourceView,
        titleTextColor: '#7AAAC3',
        rightButtonTitle: 'Edit',
        onRightButtonPress: {
          title: title,
          id: 4,
          component: NewResource,
          titleTextColor: '#7AAAC3',
          passProps: {
            metadata: utils.getModel(resource['_type']).value,
            resource: resource
          }
        },

        passProps: {resource: resource}
      }
    }
    this.props.navigator.push(route);
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
      component: model.value.isInterface ? MessageView : ResourceView,
      parentMeta: model,
      passProps: {resource: resource},
    }
    // Edit resource
    var me = utils.getMe();
    if (me  &&  this.props.prop) {
      this.props.callback(this.props.prop, resource); // HACK for now
      this.props.navigator.popToRoute(this.props.returnRoute);
      return;
    }
    if (me  &&  !model.value.isInterface  &&  (resource.rootHash === me.rootHash  ||  resource['_type'] !== 'tradle.Identity')) {
      var self = this ;
      route.rightButtonTitle = 'Edit';
      route.onRightButtonPress = /*() =>*/ {
        // self.props.navigator.push({
        title: 'Edit',
        id: 4,
        component: NewResource,
        titleTextColor: '#7AAAC3',
        passProps: {
          metadata: utils.getModel(resource['_type']).value,
          resource: me
        }
      };
    }
    this.props.navigator.push(route);
  }

  onSearchChange(event) {
    var filter = event.nativeEvent.text.toLowerCase();
    Actions.list(filter, this.props.modelName, this.props.resource);

    // this.clearTimeout(this.timeoutID);
    // this.timeoutID = this.setTimeout(() => this.searchResources(filter), 100);
  }

  renderRow(resource)  {
    var model = utils.getModel(resource['_type'] || resource.id).value;
    var isMessage = model.interfaces  &&  model.interfaces.indexOf('tradle.Message') != -1;
    var isAggregation = this.props.isAggregation; 
    var me = utils.getMe();
    return isMessage 
     ? ( <MessageRow 
        onSelect={() => this.selectResource(resource)}
        resource={resource}
        isAggregation={isAggregation}
        navigator={this.props.navigator}
        to={isAggregation ? resource.to : this.props.resource} />
      )
    : (
      <ResourceRow
        onSelect={() => this.selectResource(resource)}
        resource={resource} />
    );
  }
  addedMessage(text) {
    Actions.list('', this.props.modelName, this.props.resource);
  }

  render() {
    if (this.state.isLoading)
      return <View />
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

}
// reactMixin(SearchScreen.prototype, TimerMixin);
reactMixin(SearchScreen.prototype, Reflux.ListenerMixin);
class NoResources extends Component {
  render() {
    var text = '';
    if (this.props.filter) {
      text = `No results for “${this.props.filter}”`;
    } else if (!this.props.isLoading) {
      // If we're looking at the latest resources, aren't currently loading, and
      // still have no results, show a message
      text = 'No ' + this.props.title + ' were found';
    }
    return (
      <View style={[styles.container, styles.centerText]}>
        <Text style={styles.NoResourcesText}>{text}</Text>
      </View>
    );
  }

}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  },
  spinner: {
    width: 30,
  },
  scrollSpinner: {
    marginVertical: 20,
  },
});

module.exports = SearchScreen;

