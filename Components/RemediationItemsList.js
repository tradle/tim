console.log('requiring RemediationItemsList.js')
'use strict';

import MessageView from './MessageView'
import utils from '../utils/utils'
var translate = utils.translate
import constants from '@tradle/constants'
import Icon from 'react-native-vector-icons/Ionicons';
import platformStyles from '../styles/platform'
import Actions from '../Actions/Actions'

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
import PropTypes from 'prop-types'

import ENV from '../utils/env'

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
      const numReviewed = Object.keys(this.props.reviewed).length
      const numItems = this.state.list.length
      let msg1 = numReviewed === numItems
               ? translate('youReviewedAll', numReviewed)
               : translate('youReviewed', numReviewed, numItems)
      let msg2 = numReviewed === numItems
               ? translate('confirmAllItems', numItems)
               : translate('areYouSureYouWantToConfirmAllItems', numItems)
      // if (numReviewed === numItems) {
      //   this.props.navigator.pop()
      //   return
      // }

      Alert.alert(
        msg1,
        msg2,
        [
          {text: translate('cancel'), onPress: () => console.log('Canceled!')},
          {text: translate('OK'), onPress: () => {
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
            <Text style={styles.modelTitle}>{translate(utils.getModel(resource[constants.TYPE]))}</Text>
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
    let self = this
    utils.onNextTransitionEnd(this.props.navigator, () => {
      Actions.addAll(self.props.resource, self.props.to, translate('confirmedMyData'))
    });
    this.props.navigator.pop()
  }
  selectResource(resource, rowId) {
    var title = translate(utils.getModel(resource[constants.TYPE]))
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
      <View style={[platformStyles.container, {borderTopColor: this.props.bankStyle.linkColor, borderTopWidth: StyleSheet.hairlineWidth}]}>
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

