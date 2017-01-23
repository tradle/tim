'use strict';

var MessageView = require('./MessageView')
var utils = require('../utils/utils');
var translate = utils.translate
var constants = require('@tradle/constants');
var Icon = require('react-native-vector-icons/Ionicons');
import platformStyles from '../styles/platform'
var Actions = require('../Actions/Actions')

import React, { Component } from 'react'
import {
  ListView,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  View,
} from 'react-native'

class RemediationItemsList extends Component {
  constructor(props) {
    super(props);

    var dataSource = new ListView.DataSource({
        rowHasChanged: (row1, row2) => {
          if (row1 !== row2)
            return true
          if (utils.isEmpty(this.props.reviewed))
            return false
          let row1reviewed = false
          let row2reviewed = false
          for (var rId in this.props.reviewed) {
            if (this.props.reviewed[rId] === row1)
              row1reviewed = true
            else (this.props.reviewed[rId] === row2)
              row2reviewed = true
          }
          return row2reviewed || row1reviewed
        }
      });
    this.state = {
      list: this.props.list,
      dataSource: dataSource.cloneWithRows(this.props.list),
    }
    var currentRoutes = this.props.navigator.getCurrentRoutes();
    var currentRoutesLength = currentRoutes.length;

    currentRoutes[currentRoutesLength - 1].onRightButtonPress = () => {
      if (Object.keys(this.props.reviewed).length === this.state.list.length) {
        this.props.navigator.pop()
        return
      }
      Alert.alert(
        translate('youReviewed', Object.keys(this.props.reviewed).length, this.state.list.length),
        translate('areYouSureYouWantToConfirmAllTheForms', translate(utils.getModel(this.props.resource[constants.TYPE]).value)),
        [
          {text: translate('cancel'), onPress: () =>  console.log('Canceled!')},
          {text: translate('Ok'), onPress: () => {
            this.submitAllForms()
          }}
        ]
      )
    }
  }

  renderRow(resource, sectionId, rowId)  {
    return (
      <TouchableOpacity onPress={this.selectResource.bind(this, resource, rowId)}  key={rowId} style={styles.viewStyle}>
        <View style={styles.row}>
          <View style={{flexDirection: 'column', flex: 1}}>
            <Text style={styles.modelTitle}>{translate(utils.getModel(resource[constants.TYPE]).value)}</Text>
            <Text style={styles.resourceTitle}>{utils.getDisplayName(resource)}</Text>
          </View>
          {this.props.reviewed[rowId]
            ? <Icon name='ios-checkmark' size={40} color='#62C457' style={{alignSelf: 'center', marginHorizontal: 10}} />
            : <View/>
          }
        </View>
      </TouchableOpacity>
    )
  }
  submitAllForms() {
    this.props.navigator.pop()

    utils.onNextTransitionEnd(this.props.navigator, () => {
      Actions.addAll(this.props.resource, this.props.to, translate('submittingApprovedForms'))
    });

    // this.props.resource.items.forEach((item) => {
    //   Actions.addItem(item)
    // })
  }
  selectResource(resource, rowId) {
    var title = translate(utils.getModel(resource[constants.TYPE]).value)
    this.props.navigator.push({
      title: title,
      id: 5,
      backButtonTitle: 'Back',
      component: MessageView,
      rightButtonTitle: 'Done',
      // parentMeta: model,
      passProps: {
        bankStyle: this.props.bankStyle,
        resource: resource,
        currency: this.props.currency,
        isReview: true,
        action: () => {
          // let newList = utils.clone(this.state.list)
          this.props.reviewed[rowId] = resource
          this.setState({
            // list: newList,
            dataSource: this.state.dataSource.cloneWithRows(this.state.list)
          })
          this.props.navigator.pop()
        }
      }
    });
  }

  render() {
    return (
      <View style={[platformStyles.container, {borderTopColor: this.props.bankStyle.LINK_COLOR, borderTopWidth: StyleSheet.hairlineWidth}]}>
        <ListView ref='listview'
          dataSource={this.state.dataSource}
          renderRow={this.renderRow.bind(this)}
          removeClippedSubviews={false}
          automaticallyAdjustContentInsets={false}
          keyboardDismissMode='on-drag'
          keyboardShouldPersistTaps={true}
          showsVerticalScrollIndicator={false} />
      </View>
    );
  }

}

var styles = StyleSheet.create({
  modelTitle: {
    flexWrap: 'wrap',
    fontSize: 20,
    fontWeight: '400',
    color: '#757575',
    marginHorizontal: 10
  },
  resourceTitle: {
    fontSize: 16,
    color: '#aaaaaa',
    flexWrap: 'wrap',
    marginHorizontal: 10
  },
  viewStyle: {
    marginVertical: StyleSheet.hairlineWidth,
    backgroundColor: '#efefef'
  },
  row: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    flexDirection: 'row'
  }
});

module.exports = RemediationItemsList;

