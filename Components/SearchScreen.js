'use strict';

var React = require('react-native');
var reactMixin = require('react-mixin');
var SearchBar = require('./SearchBar');
// var TimerMixin = require('react-timer-mixin');
var ResourceRow = require('./ResourceRow');
var MessageRow = require('./MessageRow');
var ResourceView = require('./ResourceView');
var NewResource = require('./NewResource');
var AddNewMessage = require('./AddNewMessage');
var utils = require('../utils/utils');
var t = require('tcomb-form-native');
var Store = require('../Store/Store');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');

var Form = t.form.Form;

var InvertibleScrollView = require('react-native-invertible-scroll-view');
var messageCount;

var {
  ActivityIndicatorIOS,
  ListView,
  ScrollView,
  Component,
  StyleSheet,
  Navigator,
  Text,
  TextInput,
  Image,
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
      // sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
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
    // this.searchResources('');
    // messageCount++;
    // this.setState({userInput: text ? text : 'messages ' + messageCount});
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
    var Model = t.struct({'msg': t.Str});
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
  searchBar: {
    flex: 4,
    padding: 10,
    // paddingLeft: 10,
    paddingTop: 3,

    height: 45,
    paddingBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eeeeee', 
  },
  searchBarBG: {
    marginTop: 10,
    marginBottom: 5,
    // padding: 5,
    flex: 1,
    alignSelf: 'center',
    backgroundColor: '#eeeeee', 
    borderTopColor: '#eeeeee', 
    borderRightColor: '#eeeeee', 
    borderLeftColor: '#eeeeee', 
    borderWidth: 2,
    borderBottomColor: '#cccccc',
  },
  searchBarInput: {
    height: 30,
    fontSize: 18,
    paddingLeft: 10,
    backgroundColor: '#eeeeee',
    fontWeight: 'bold',
    // color: '#2E3B4E',
    borderRadius: 5,
    // borderWidth: 1,
    alignSelf: 'stretch',
    borderColor: '#eeeeee',
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
  image: {
    width: 40,
    height: 40
  },
});

module.exports = SearchScreen;

/*
  buttonText: {
    fontSize: 18,
    color: '#2E3B4E',
    alignSelf: 'center',
  },
  button: {
    flex: 1,
    backgroundColor: '#D7E6ED',
    padding: 10,
  },
  addNew: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#eeeeee',
    borderBottomColor: '#eeeeee', 
    borderRightColor: '#eeeeee', 
    borderLeftColor: '#eeeeee', 
    borderWidth: 1,
    borderTopColor: '#cccccc',
  }
    var addNew = (model.isInterface) 
               ? <View style={styles.addNew}>
                    <TouchableHighlight style={{paddingLeft: 5}} underlayColor='#eeeeee'
                      onPress={this.onAddNewPressed.bind(this)}>
                     <Image source={require('image!clipadd')} style={styles.image} />
                   </TouchableHighlight>
                  <View style={styles.searchBar}>
                    <View style={styles.searchBarBG}>
                      <TextInput 
                        autoCapitalize='none'
                        autoFocus={true}
                        autoCorrect={false}
                        placeholder='Say something'
                        placeholderTextColor='#bbbbbb'
                        style={styles.searchBarInput}
                        value={this.state.userInput}
                        onChange={this.addedMessage.bind(this)}
                        onEndEditing={this.onEndEditing.bind(this)}
                      />
                    </View>
                  </View>
                   </View> 

              : <View></View>;
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
      passProps: {
        resource: self.props.resource, 
        returnRoute: currentRoutes[currentRoutes.length - 1],
        modelName: modelName,
        callback: this.onMessageCreated.bind(this)
      }
    });
  }
  onMessageCreated() {
    this.setState({isLoading: false});
  }
  handleChange(event) {
    this.setState({userInput: event.nativeEvent.text});
  }
  // Sending chat message
  onEndEditing() {
    if (this.state.userInput.trim().length == 0)
      return;
    var type = interfaceToTypeMapping[this.props.modelName];
    var me = utils.getMe();
    var resource = this.props.resource;
    var title = utils.getDisplayName(resource, utils.getModel(this.props.resource['_type']).value.properties);
    var meTitle = utils.getDisplayName(me, utils.getModel(me['_type']).value.properties);
    var r = {
      '_type': type,
      'message': this.state.userInput,
      'from': {
        id: me['_type'] + '_' + me.rootHash, 
        title: meTitle
      }, 
      'to': {
        id: resource['_type'] + '_' + resource.rootHash,
        title: title
      },
      time: new Date().getTime()
    }
    var rootHash = sha(r);
    r.rootHash = rootHash;
    var self = this;
    utils.getDb().put(type + '_' + rootHash, r)
    .then(function() {
      self.searchResources('');
      self.setState({userInput: ''});
    })
    .catch(function(err) {
      err = err;
    });
  }
*/
  // searchResources(query, list) {
  //   this.timeoutID = null;

  //   this.setState({filter: query});
  //   var resources = list ? list : utils.getResources();

  //   var foundResources = {};
  //   var modelName = this.props.modelName;
  //   var model = utils.getModel(modelName).value;
  //   var isMessage = model.isInterface;
  //   var meta = model.properties;

  //   var implementors = isMessage ? utils.getImplementors(modelName) : null;

  //   var required = model.required;
  //   var meRootHash = utils.getMe().rootHash;
  //   for (var key in resources) {
  //     var iModel;
  //     if (isMessage  &&  implementors) {
  //       for (var i=0; i<implementors.length  &&  !iModel; i++) {
  //         if (implementors[i].id.indexOf(key.substring(0, key.indexOf('_'))) === 0)
  //           iModel = implementors[i];
  //       }
  //       if (!iModel)
  //         continue;
  //     }
  //     else if (key.indexOf(modelName + '_') == -1)
  //       continue;
  //     var r = resources[key].value;
  //     if (isMessage) {
  //       var msgProp = utils.getCloneOf('tradle.Message.message', iModel.properties);
  //       if (!r[msgProp]  ||  r[msgProp].trim().length === 0)
  //         continue;
  //       var fromProp = utils.getCloneOf('tradle.Message.from', iModel.properties);
  //       var toProp = utils.getCloneOf('tradle.Message.to', iModel.properties);

  //       var fromID = r[fromProp].id.split(/_/)[1];
  //       var toID = r[toProp].id.split(/_/)[1];
  //       if (fromID  !== meRootHash  &&  toID !== meRootHash) 
  //         continue;
  //       if (fromID !== this.props.resource.rootHash  &&  
  //           toID != this.props.resource.rootHash)
  //         continue;
  //     }
  //     if (!query) {
  //        foundResources[key] = r;      
  //        continue;   
  //      }
  //      // primitive filtering for this commit
  //      var combinedValue = '';
  //      for (var rr in meta) {
  //        if (r[rr] instanceof Array)
  //         continue;
  //        combinedValue += combinedValue ? ' ' + r[rr] : r[rr];
  //      }
  //      if (!combinedValue  ||  (combinedValue  &&  (!query || combinedValue.toLowerCase().indexOf(query.toLowerCase()) != -1))) {
  //        foundResources[key] = r; 
  //      }
  //   }
  //   LOADING[query] = false;
  //   resultsCache.nextPageNumberForQuery[query] = 2;

  //   // if (this.state.filter !== query) {
  //   //   // do not update state if the query is stale
  //   //   return;
  //   // }
  //   var result = utils.objectToArray(foundResources);
  //   if (isMessage) {
  //     result.sort(function(a,b){
  //       // Turn your strings into dates, and then subtract them
  //       // to get a value that is either negative, positive, or zero.
  //       return new Date(a.time) - new Date(b.time);
  //     });
  //   }
  //   this.setState({
  //     isLoading: false,
  //     dataSource: this.getDataSource(result),
  //   })
  // }

  // hasMore() {
  //   var query = this.state.filter;
  //   if (!resultsCache.dataForQuery[query]) {
  //     return true;
  //   }
  //   return (
  //     resultsCache.totalForQuery[query] !== resultsCache.dataForQuery[query].length
  //   );
  // }
  // renderFooter() {
  //   return (!this.hasMore() || !this.state.isLoadingTail) 
  //          ? <View style={styles.scrollSpinner} />
  //          : <ActivityIndicatorIOS style={styles.scrollSpinner} />;
  // }
