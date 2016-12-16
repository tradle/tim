'use strict';

var PageView = require('./PageView')
import ActionSheet from 'react-native-actionsheet'
var utils = require('../utils/utils');
var translate = utils.translate
var reactMixin = require('react-mixin');
var extend = require('extend')
var Store = require('../Store/Store');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');
var constants = require('@tradle/constants');
var Icon = require('react-native-vector-icons/Ionicons');
var buttonStyles = require('../styles/buttonStyles');
var NetworkInfoProvider = require('./NetworkInfoProvider')
var defaultBankStyle = require('../styles/bankStyle.json')
var StyleSheet = require('../StyleSheet')

import {Column as Col, Row} from 'react-native-flexbox-grid'

const PRODUCT_APPLICATION = 'tradle.ProductApplication'
// var bankStyles = require('../styles/bankStyles')

import React, { Component, PropTypes } from 'react'
import {
  ListView,
  // StyleSheet,
  Navigator,
  Alert,
  // AlertIOS,
  // ActionSheetIOS,
  TouchableOpacity,
  Image,
  StatusBar,
  View,
  Text,
  Platform
} from 'react-native';

import platformStyles from '../styles/platform'
import ENV from '../utils/env'

const SearchBar = Platform.OS === 'android' ? null : require('react-native-search-bar')

class StatisticsView extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
  };
  constructor(props) {
    super(props);

    let provider = props.provider
    let applicants = Object.values(props.applicants)

    let dataSource = new ListView.DataSource({
        rowHasChanged: function(row1, row2) {
          return row1 !== row2
        }
      })
    this.state = {
      // isLoading: utils.getModels() ? false : true,
      // isLoading: true,
      dataSource: dataSource.cloneWithRows(applicants),
      isConnected: this.props.navigator.isConnected,
    };
  }
  // componentWillMount() {
  //   utils.onNextTransitionEnd(this.props.navigator, () => {
  //     Actions.getAllPartials(this.props.resource, this.props.chat)
  //   });
  // }

  componentDidMount() {
    this.listenTo(Store, 'onStats');
  }

  onStats(params) {
    var action = params.action;
    if (action !== 'allPartials')
      return
    let applicants = Object.values(params.owners[this.props.provider.provider.id])

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(applicants),
    })
  }

  selectResource(resource) {
    var me = utils.getMe();
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    var model = utils.getModel(this.props.modelName);
    var m = utils.getModel(resource[constants.TYPE]).value;

    var title = utils.makeTitle(utils.getDisplayName(resource, m.properties))
    this.props.navigator.push({
      title: title,
      id: 3,
      component: ResourceView,
      backButtonTitle: 'Back',
      passProps: {resource: resource}
    });
  }

  renderRow(resource)  {
    let completionDate, app

    if (resource.applications.length) {
      app = resource.applications[0]
      let appType = app.leaves.find(l => l.key === 'product' && l.value).value
      completionDate = resource.completedApps[appType]
      if (completionDate)
        completionDate = utils.formatDate(new Date(completionDate))
    }

    return  <Row size={8} style={{borderBottomColor: '#aaaaaa', borderBottomWidth: 1}}>
              <Col sm={1} md={4} lg={3} style={styles.col}>
                <Text style={{alignSelf: 'center', padding: 3}}>
                  {resource.owner.title || ''}
                </Text>
              </Col>
              <Col sm={1} md={4} lg={3} style={styles.col}>
                <Text style={styles.cell}>
                  {resource.forms.length}
                </Text>
              </Col>
              <Col sm={1} md={4} lg={3} style={styles.col}>
                <Text style={styles.cell}>
                  {resource.formErrors.length}
                </Text>
              </Col>
              <Col sm={1} md={4} lg={3} style={styles.col}>
                <Text style={styles.cell}>
                  {resource.formCorrections.length}
                </Text>
              </Col>
              <Col sm={1} md={4} lg={3} style={styles.col}>
                <Text style={styles.cell}>
                  {resource.verifications.length}
                </Text>
              </Col>
              <Col sm={1} md={4} lg={3} style={styles.col}>
                <Text style={styles.cell}>
                  {app && utils.formatDate(new Date(app.time)) || ''}
                </Text>
              </Col>
              <Col sm={1} md={4} lg={3} style={styles.col}>
                <Text style={styles.cell}>
                  {completionDate}
                </Text>
              </Col>
              <Col sm={1} md={4} lg={3} style={styles.col}>
                <Text style={styles.cell}>
                </Text>
              </Col>
            </Row>

  }
  renderFooter() {
    return <View/>
  }
  render() {
    if (this.state.isLoading)
      return <View/>
    var content = <ListView
          dataSource={this.state.dataSource}
          renderHeader={this.renderHeader.bind(this)}
          enableEmptySections={true}
          renderRow={this.renderRow.bind(this)}
          automaticallyAdjustContentInsets={false}
          removeClippedSubviews={false}
          keyboardDismissMode='on-drag'
          keyboardShouldPersistTaps={true}
          initialListSize={10}
          pageSize={20}
          scrollRenderAhead={10}
          showsVerticalScrollIndicator={false} />

    return (
      <PageView style={platformStyles.container}>
        <NetworkInfoProvider connected={this.state.isConnected} />
        <View style={styles.separator} />
        {content}
      </PageView>
    );
  }
  renderHeader() {
    return <View style={{backgroundColor: '#f1ffe7'}}>
            <Row size={8} style={styles.topRow}>
              <Col sm={1} md={1} lg={1}>
                <Text>
                </Text>
              </Col>
              <Col sm={1} md={1} lg={1}>
                <Text style={styles.topRowCell}>
                  Forms
                </Text>
              </Col>
              <Col sm={2} md={2} lg={2}>
                <Text style={styles.topRowCell}>
                  Corrections
                </Text>
              </Col>
              <Col sm={1} md={1} lg={1}>
                <Text style={styles.topRowCell}>
                  Verified
                </Text>
              </Col>
              <Col sm={2} md={2} lg={2}>
                <Text style={styles.topRowCell}>
                  Submissions
                </Text>
              </Col>
              <Col sm={1} md={1} lg={1}>
                <Text style={styles.topRowCell}>
                  Elapsed
                </Text>
              </Col>
            </Row>
            <Row size={8} style={{borderBottomColor: '#aaaaaa', borderBottomWidth: 1}}>
              <Col sm={1} md={4} lg={3} style={styles.col}>
                <Text style={{fontWeight: '600', alignSelf: 'center', paddingVertical: 5 }}>
                  {this.props.provider.title}
                </Text>
              </Col>
              <Col sm={1} md={4} lg={3} style={styles.col}>
                <Text style={styles.cell}>
                  Submitted
                </Text>
              </Col>
              <Col sm={1} md={4} lg={3} style={styles.col}>
                <Text style={styles.cell}>
                  Requested
                </Text>
              </Col>
              <Col sm={1} md={4} lg={3} style={styles.col}>
                <Text style={styles.cell}>
                  Completed
                </Text>
              </Col>
              <Col sm={1} md={4} lg={3} style={styles.col}>
                <Text style={styles.cell}>
                  {this.props.provider.title}
                </Text>
              </Col>
              <Col sm={1} md={4} lg={3} style={styles.col}>
                <Text style={styles.cell}>
                  Started
                </Text>
              </Col>
              <Col sm={1} md={4} lg={3} style={styles.col}>
                <Text style={styles.cell}>
                  Completed
                </Text>
              </Col>
              <Col sm={1} md={4} lg={3} style={styles.col}>
                <Text style={styles.cell}>
                  Days
                </Text>
              </Col>
            </Row>
          </View>


    // let partial = <View style={{padding: 5, backgroundColor: '#f1ffe7'}}>
    //                 <View style={styles.row}>
    //                   <Icon name='ios-stats-outline' size={utils.getFontSize(45)} color='#246624' style={[styles.cellImage, {paddingLeft: 5}]} />
    //                   <View style={styles.textContainer}>
    //                     <Text style={styles.resourceTitle}>{translate('Statistics')}</Text>
    //                   </View>
    //                   <View style={styles.sharedContext}>
    //                     <Text style={styles.sharedContextText}>{this.state.partialsCount}</Text>
    //                   </View>
    //                 </View>
    //               </View>

    return partial
  }
}
reactMixin(StatisticsView.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
  topRow: {
    borderBottomColor: '#aaaaaa',
    borderBottomWidth: 1,
  },
  topRowCell: {
    paddingVertical: 5,
    fontSize:  16,
    fontWeight: '600',
    alignSelf: 'center',
    borderRightColor: '#aaaaaa',
    borderRightWidth: 1,
  },
  col: {
    borderRightColor: '#aaaaaa',
    borderRightWidth: 1,
  },
  cell: {
    paddingVertical: 5,
    fontSize: 14,
    alignSelf: 'center'
  },
});

module.exports = StatisticsView
