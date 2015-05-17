'use strict';

var React = require('react-native');
// var Q = require('q');
var sha = require('stable-sha1');
var reactMixin = require('react-mixin');
var SearchBar = require('./SearchBar');
var TimerMixin = require('react-timer-mixin');
var ResourceRow = require('./ResourceRow');
var MessageRow = require('./MessageRow');
var ResourceView = require('./ResourceView');
var NewResource = require('./NewResource');
var ResourceTypesScreen = require('./ResourceTypesScreen');
var utils = require('../utils/utils');
var sampleData = require('../data/data');
var t = require('tcomb-form-native');
var Form = t.form.Form;
var InvertibleScrollView = require('react-native-invertible-scroll-view');

var interfaceToTypeMapping = {
  'tradle.Message': 'tradle.SimpleMessage'
};
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
      isLoading: false,
      isLoadingTail: false,
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      filter: this.props.filter,
      queryNumber: 1,
      userInput: ''
    };
  }
  componentDidMount() {
    if (!this.props.implementors  ||  utils.getModel(this.props.modelName).isInterface) 
      this.searchResources(this.props.filter);
  }
  componentWillUnmount() {
    console.log('Unmounting');
  }

  _urlForQueryAndPage(query, pageNumber) {
    return ('file:///Users/Ellen/lablz/Identity/a.json');
  }

  searchResources(query) {
    this.timeoutID = null;

    this.setState({filter: query});

    var cachedResultsForQuery = resultsCache.dataForQuery[query];
    if (cachedResultsForQuery) {
      if (!LOADING[query]) {
        this.setState({
          dataSource: this.getDataSource(cachedResultsForQuery),
          isLoading: false
        });
      } else {
        this.setState({isLoading: true});
      }
      return;
    }

    LOADING[query] = true;
    resultsCache.dataForQuery[query] = null;
    this.setState({
      isLoading: true,
      queryNumber: this.state.queryNumber + 1,
      isLoadingTail: false,
    });
    var self = this;
    var foundResources = {};
    var modelName = self.props.modelName;
    var model = utils.getModel(modelName).value;
    var isMessage = model.isInterface;
    var meta = model.properties;

    var implementors = isMessage ? utils.getImplementors(modelName) : null;

    var required = model.required;
    var meRootHash = utils.getMe().rootHash;
    var resourceRootHash = 
    utils.getDb().createReadStream()
    .on('data', function(data) {
      var key = data.key;
      if (key.indexOf('model_') === 0)
        return;
      var iModel;
      if (isMessage  &&  implementors) {
        for (var i=0; i<implementors.length  &&  !iModel; i++) {
          if (implementors[i].id.indexOf(key.substring(0, data.key.indexOf('_'))) === 0)
            iModel = implementors[i];
        }
        if (!iModel)
          return;
      }
      else if (key.indexOf(modelName + '_') == -1)
        return;
      var r = data.value;
      if (isMessage) {
        var msgProp = utils.getCloneOf('tradle.Message.message', iModel.properties);
        if (r[msgProp].trim().length === 0)
          return;
        var fromProp = utils.getCloneOf('tradle.Message.from', iModel.properties);
        var toProp = utils.getCloneOf('tradle.Message.to', iModel.properties);

        var fromID = r[fromProp].id.split(/_/)[1];
        var toID = r[toProp].id.split(/_/)[1];
        if (fromID  !== meRootHash  &&  toID !== meRootHash) 
          return;
        if (fromID !== self.props.resource.rootHash  &&  
            toID != self.props.resource.rootHash)
          return;
      }
      if (!query) {
         foundResources[key] = r;      
         return;   
       }
       // primitive filtering for this commit
       var combinedValue = '';
       for (var rr in meta) {
         if (r[rr] instanceof Array)
          continue;
         combinedValue += combinedValue ? ' ' + r[rr] : r[rr];
       }
       // required.forEach(function(rr) {
       //   combinedValue += (r[rr] &&  !(r[rr] instanceof Array) ? (combinedValue ? ' ' + r[rr] : r[rr]) : '');
       // }); 
       if (!combinedValue  ||  (combinedValue  &&  combinedValue.toLowerCase().indexOf(query.toLowerCase()) != -1)) {
         foundResources[key] = r; 
       }
     })
    .on('error', function(error) {
      error = error;
      LOADING[query] = false;
    })
    .on('close', function() {
      LOADING[query] = false;
    })
    .on('end', function() {
      LOADING[query] = false;
      resultsCache.nextPageNumberForQuery[query] = 2;

      if (self.state.filter !== query) {
        // do not update state if the query is stale
        return;
      }
      var resources = utils.objectToArray(foundResources);
      if (isMessage) {
        resources.sort(function(a,b){
          // Turn your strings into dates, and then subtract them
          // to get a value that is either negative, positive, or zero.
          return new Date(a.time) - new Date(b.time);
        });
      }
      self.setState({
        isLoading: false,
        dataSource: self.getDataSource(resources),
      });
    });
  }

  hasMore() {
    var query = this.state.filter;
    if (!resultsCache.dataForQuery[query]) {
      return true;
    }
    return (
      resultsCache.totalForQuery[query] !== resultsCache.dataForQuery[query].length
    );
  }
  renderFooter() {
    return (!this.hasMore() || !this.state.isLoadingTail) 
           ? <View style={styles.scrollSpinner} />
           : <ActivityIndicatorIOS style={styles.scrollSpinner} />;
  }

  getDataSource(resources) {
    return this.state.dataSource.cloneWithRows(resources);
  }

  selectResource(resource) {
    var me = utils.getMe();
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    var model = utils.getModel(this.props.modelName);

    if (model.value.isInterface) {
      if (resource['_type'])
        return;
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
      rightButtonTitle: 'Profile',
      onRightButtonPress: {//() => {
      //   self.props.navigator.push({

          title: title,
          id: 3,
          component: ResourceView,
          titleTextColor: '#7AAAC3',
          passProps: {resource: resource}
        // });
      }
    }
    this.props.navigator.push(route);
  }

  _selectResource(resource) {
    var parentMeta = utils.getModel(this.props.modelName);
    var title = utils.getDisplayName(resource, parentMeta.value.properties);
    var route = {
      title: title,
      id: 3,
      component: ResourceView,
      parentMeta: parentMeta,
      passProps: {resource: resource},
    }
    // Edit resource
    var me = utils.getMe();
    if (me  &&  this.props.prop) {
      this.props.callback(this.props.prop, resource);
      // this.props.returnRoute.passProps.setProperty = {
      //   name: this.props.prop,
      //   value: resource
      // };
      this.props.navigator.popToRoute(this.props.returnRoute);
      return;
    }
    if (me  &&  (JSON.stringify(resource) === JSON.stringify(me))  ||  resource['_type'] !== 'tradle.Identity') {
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
        // });
    }
    this.props.navigator.push(route);
  }

  onSearchChange(event) {
    var filter = event.nativeEvent.text.toLowerCase();

    this.clearTimeout(this.timeoutID);
    this.timeoutID = this.setTimeout(() => this.searchResources(filter), 100);
  }
  // Sending chat message
  onSendPressed() {
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

  renderRow(resource)  {
    var model = utils.getModel(resource['_type'] || resource.id).value;
    var isMessage = model.interfaces  &&  model.interfaces.indexOf('tradle.Message') != -1;
    var me = utils.getMe();
    return isMessage 
     ? ( <MessageRow
        onSelect={() => this.selectResource(resource)}
        resource={resource}
        navigator={this.props.navigator}
        to={this.props.resource} />
      )
    : (
      <ResourceRow
        onSelect={() => this.selectResource(resource)}
        resource={resource} />
    );
  }
  handleChange(event) {
    this.setState({userInput: event.nativeEvent.text});
  }

  render() {
    var model = utils.getModel(this.props.modelName).value;
    var content = this.state.dataSource.getRowCount() === 0 
   ?  <NoResources
        filter={this.state.filter}
        title={model.title}
        isLoading={this.state.isLoading}/> 
   :  <ListView ref='listview'
        dataSource={this.state.dataSource}
        renderFooter={this.renderFooter.bind(this)}
        renderRow={this.renderRow.bind(this)}
        renderScrollView={
          (props) => <InvertibleScrollView {...props} inverted />
        }
        // onFocus={() => this.refs.length  &&  this.refs.listview.getScrollResponder().scrollTo(0, 0)}
        automaticallyAdjustContentInsets={false}
        keyboardDismissMode="onDrag"
        keyboardShouldPersistTaps={true}
        showsVerticalScrollIndicator={false} />;

    var Model = t.struct({'msg': t.Str});

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
                        autoCorrect={false}
                        placeholder='Say something'
                        placeholderTextColor='#bbbbbb'
                        style={styles.searchBarInput}
                        value={this.state.userInput}
                        onChange={this.handleChange.bind(this)}
                        onEndEditing={this.onSendPressed.bind(this)}
                      />
                    </View>
                  </View>
                   </View> 

              : <View></View>;
    
    return (
      <View style={styles.container}>
        <SearchBar
          onSearchChange={this.onSearchChange.bind(this)}
          isLoading={this.state.isLoading}
          filter={this.props.filter}
          onFocus={() => this.refs.length  &&  this.refs.listview.getScrollResponder().scrollTo(0, 0)} />
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
    self.props.navigator.push({
      title: utils.makeLabel(model.title) + ' type',
      id: 2,
      component: ResourceTypesScreen,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      passProps: {
        resource: self.props.resource, 
        returnRoute: self.props.route,
        modelName: modelName,
      }
    });
  }
}
reactMixin(SearchScreen.prototype, TimerMixin);

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
    padding: 20,
    paddingLeft: 10,
    paddingTop: 3,

    height: 50,
    paddingBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eeeeee' 
  },
  searchBarBG: {
    marginTop: 10,
    marginBottom: 10,
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
  }
});

module.exports = SearchScreen;
