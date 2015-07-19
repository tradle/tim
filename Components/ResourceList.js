'use strict';

var React = require('react-native');
var SearchBar = require('./SearchBar');
var NoResources = require('./NoResources');
var ResourceRow = require('./ResourceRow');
var ResourceView = require('./ResourceView');
var NewResource = require('./NewResource');
var MessageList = require('./MessageList');
var utils = require('../utils/utils');
var reactMixin = require('react-mixin');
var Store = require('../Store/Store');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');
var Icon = require('./FAKIconImage');

var IDENTITY_MODEL = 'tradle.Identity';
var {
  ListView,
  Component,
  StyleSheet,
  Navigator,
  TouchableHighlight,
  View,
} = React;

class ResourceList extends Component {
  constructor(props) {
    super(props);
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
    var params = {
      modelName: this.props.modelName, 
      to: this.props.resource
    };
    if (this.props.isAggregation)
      params.isAggregation = true;
    if (this.props.sortProperty)
      params.sortProperty = this.props.sortProperty;
    Actions.list(params);    
  }
  componentDidMount() {
    this.listenTo(Store, 'onListUpdate');
  }

  onListUpdate(params) {
    if (params.error)
      return;
    var action = params.action;
    if (action === 'addItem'  ||  action === 'addMessage') {
      this.state.isLoading = true;
      Actions.list({
        query: this.state.filter, 
        modelName: this.props.modelName, 
        to: this.props.resource,
        sortProperty: this.props.modelName === IDENTITY_MODEL ? 'lastMessageTime' : null
      });
      return;      
    }

    if (action !== 'list' ||  !params.list || params.isAggregation !== this.props.isAggregation)
      return;
    var list = params.list;
    if (!list.length && !this.state.filter.length) 
      return;
    var type = list[0]['_type'];
    if (type  !== this.props.modelName) 
      return;
    
    // var n = Math.floor(5, list.length);
    // for (var i=0; i<n; i++) {
    //   var rnd = this.getRandomInt(1, list.length - 1);
    //   list[rnd].online = true; 
    // }

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(list),
      isLoading: false
    })
  }
  // getRandomInt(min, max) {
  //   return Math.floor(Math.random() * (max - min + 1)) + min;
  // }

  selectResource(resource) {
    var me = utils.getMe();
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    var model = utils.getModel(this.props.modelName);

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
      component: MessageList,
      id: 11,
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
        backButtonTitle: 'Back',
        rightButtonTitle: 'Edit',
        onRightButtonPress: {
          title: title,
          id: 4,
          component: NewResource,
          titleTextColor: '#7AAAC3',
          backButtonTitle: 'Back',
          rightButtonTitle: 'Done',
          passProps: {
            model: utils.getModel(resource['_type']).value,
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
      id: 3,
      component: ResourceView,
      parentMeta: model,
      backButtonTitle: 'Back',
      passProps: {resource: resource},
    }
    // Edit resource
    var me = utils.getMe();
    if (me  &&  this.props.prop) {
      this.props.callback(this.props.prop, resource); // HACK for now
      this.props.navigator.popToRoute(this.props.returnRoute);
      return;
    }
    if (me  &&  !model.value.isInterface  &&  (resource.rootHash === me.rootHash  ||  resource['_type'] !== IDENTITY_MODEL)) {
      var self = this ;
      route.rightButtonTitle = 'Edit';
      route.onRightButtonPress = /*() =>*/ {
        title: 'Edit',
        id: 4,
        component: NewResource,
        rightButtonTitle: 'Done',
        titleTextColor: '#7AAAC3',
        passProps: {
          model: utils.getModel(resource['_type']).value,
          resource: me
        }
      };
    }
    this.props.navigator.push(route);
  }

  onSearchChange(event) {
    var filter = event.nativeEvent.text.toLowerCase();
    Actions.list({
      query: filter, 
      modelName: this.props.modelName, 
      to: this.props.resource
    });
  }

  renderRow(resource)  {
    return (
      <ResourceRow
        onSelect={() => this.selectResource(resource)}
        resource={resource} />
    );
  }
  renderFooter() {
    var me = utils.getMe();
    if (!me)
      return <View />;
    return (
      <View style={styles.footer}>
        <View>
          <TouchableHighlight underlayColor='transparent' onPress={this.addNew.bind(this)}>
            <Icon name='ion|person-add'  size={30}  color='#999999' style={styles.icon} /> 
          </TouchableHighlight>
        </View>  
        <View>
          <Icon name='ion|person-stalker'  size={30}  color='#999999'  style={styles.icon} /> 
        </View>  
      </View>
    );
  }
  addNew() {
    var model = utils.getModel(this.props.modelName).value;
    this.props.navigator.push({
      title: model.title,
      id: 4,
      component: NewResource,
      titleTextColor: '#7AAAC3',
      backButtonTitle: 'Back',
      rightButtonTitle: 'Done',
      passProps: {
        model: model,
        callback: () => Actions.list({
          modelName: this.props.modelName, 
          to: this.props.resource
        }),
      }      
    })
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
      content = <ListView ref='listview'
          dataSource={this.state.dataSource}
          renderRow={this.renderRow.bind(this)}
          automaticallyAdjustContentInsets={false}
          keyboardDismissMode='on-drag'
          keyboardShouldPersistTaps={true}
          showsVerticalScrollIndicator={false} />;
    }
    var model = utils.getModel(this.props.modelName).value;
    var Footer = this.renderFooter();
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
        {Footer}
      </View>
    );
  }
}
// reactMixin(ResourceList.prototype, TimerMixin);
reactMixin(ResourceList.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  centerText: {
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#cccccc',
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 5,
    // color: '#cccccc'
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    height: 45, 
    paddingTop: 5, 
    paddingHorizontal: 10, 
    backgroundColor: '#eeeeee', 
    borderBottomColor: '#eeeeee', 
    borderRightColor: '#eeeeee', 
    borderLeftColor: '#eeeeee', 
    borderWidth: 1,
    borderTopColor: '#cccccc',
  }
});

module.exports = ResourceList;

