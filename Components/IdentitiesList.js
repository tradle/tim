
import reactMixin from 'react-mixin'
import extend from 'extend'
import constants from '@tradle/constants'

import {
  ListView,
  StyleSheet,
  View,
} from 'react-native'

import React, { Component } from 'react'
import ResourceRow from './ResourceRow'
import ResourceView from './ResourceView'
import NewResource from './NewResource'
import ResourceList from './ResourceList'
import utils from '../utils/utils'
import Reflux from 'reflux'
import Store from '../Store/Store'
import Actions from '../Actions/Actions'

class IdentitiesList extends Component {
  constructor(props) {
    super(props);
    var dataSource = new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      });
    this.state = {
      isLoading: utils.getModels() ? false : true,
      list: this.props.list,
      dataSource: dataSource.cloneWithRows(this.props.list),
      filter: this.props.filter,
      userInput: ''
    };
  }

  componentDidMount() {
    this.listenTo(Store, 'onChangeIdentity');
  }

  selectResource(resource) {
    Actions.changeIdentity(resource);
  }
  onRemoveIdentity(params) {
    var list = [];
    extend(list, this.state.list);
    for (var i=0; i<list.length; i++) {
      if (list[i][constants.ROOT_HASH] == params.resource[constants.ROOT_HASH]) {
        list.splice(i, 1);
        break;
      }
    }
    this.setState({
      list: list,
      dataSource: this.state.dataSource.cloneWithRows(list)
    })
  }
  onChangeIdentity(params) {
    if (params.action === 'removeIdentity') {
      this.onRemoveIdentity(params);
      return;
    }

    if (params.action !== 'changeIdentity')
      return;
    var me = params.me;
    var modelName = me[constants.TYPE];
    var model = utils.getModel(modelName);
    var meName = utils.getDisplayName(me);
    var route = {
      title: model.title,
      component: ResourceList,
      id: 10,
      passProps: {
        filter: '',
        modelName: modelName,
      },
      rightButtonTitle: 'Profile', //'fontawesome|user',
      onRightButtonPress: {
        title: meName,
        id: 3,
        component: ResourceView,
        backButtonTitle: 'Back',
        titleTextColor: '#7AAAC3',
        rightButtonTitle: 'Edit',
        onRightButtonPress: {
          title: meName,
          id: 4,
          component: NewResource,
          titleTextColor: '#7AAAC3',
          backButtonTitle: 'Back',
          rightButtonTitle: 'Done',
          passProps: {
            model: model,
            resource: me
          }
        },

        passProps: {resource: me}
      }
    }
    this.props.navigator.replace(route);
  }

  // onSearchChange(event) {
  //   var filter = event.nativeEvent.text.toLowerCase();
  //   Actions.list(filter, this.props.list[0][constants.TYPE]);
  // }

  renderRow(resource)  {
    return (
      <ResourceRow
        onSelect={() => this.selectResource(resource)}
        resource={resource}
        navigator={this.props.navigator}
        onCancel={() => Actions.removeIdentity(resource)} />
    );
  }
  removeIdentity(resource) {
    Actions.removeIdentity(resource);
  }
  render() {
    if (this.state.isLoading)
      return <View/>
    return (
      <View style={styles.container}>
        <ListView ref='listview'
          dataSource={this.state.dataSource}
          renderRow={this.renderRow.bind(this)}
          removeClippedSubviews={false}
          automaticallyAdjustContentInsets={false}
          keyboardDismissMode='on-drag'
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false} />
      </View>
    );
  }

}
reactMixin(IdentitiesList.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 64,
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
    alignSelf: 'center',
    marginTop: 150
  },
});

module.exports = IdentitiesList;

