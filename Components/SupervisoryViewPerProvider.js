
import PageView from './PageView'
import utils from '../utils/utils'
import reactMixin from 'react-mixin'
import Store from '../Store/Store'
import Reflux from 'reflux'
import NetworkInfoProvider from './NetworkInfoProvider'
import StyleSheet from '../StyleSheet'
import { makeResponsive } from 'react-native-orient'

import {Column as Col, Row} from 'react-native-flexbox-grid'

import React, { Component } from 'react'
import {
  ScrollView,
  View,
  Text,
} from 'react-native'
import PropTypes from 'prop-types';

import platformStyles from '../styles/platform'

const MILLIS_IN_DAY = 86400000

class SupervisoryViewPerProvider extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
  };
  constructor(props) {
    super(props);

    this.state = {
      applicants: props.applicants,
      isConnected: this.props.navigator.isConnected,
    }
  }

  componentDidMount() {
    this.listenTo(Store, 'onStats');
  }

  onStats(params) {
    var action = params.action;
    if (action !== 'allPartials')
      return
    this.setState({
      applicants: params.owners[this.props.provider.providerInfo.id]
    })
  }

  renderRow(resource, applicant, cnt)  {
    let appType = resource.product
    let app = resource.app.product
    let owner = applicant.owner
    let stats = resource.stats[appType] // applicant.stats ? applicant.stats[appType] : null

    let startDate = app && app._time
    let start = startDate ? utils.formatDate(startDate) : ''
    let completionDate = applicant.completedApps[appType] || ''
    // if (!completionDate  &&  app.myProducts) {
    //   app.myProducts.forEach((p) => {
    //     let pr = p['tradle.My' + appType]
    //     if (pr)
    //       completionDate = pr._time
    //   })
    // }
    let completed = completionDate ? utils.formatDate(new Date(completionDate)) : ''
    let days = startDate && completionDate ? Math.ceil((completionDate - startDate) / MILLIS_IN_DAY) : ''
    let changedCol = {}
    if (stats.changed)
      changedCol = {[stats.changed]: styles.changedCol}

    return  <Row size={8} style={{borderBottomColor: '#aaaaaa', borderBottomWidth: 1}} key={'app_' + cnt}>
              <Col sm={1} md={1} lg={1}>
                <Text style={{alignSelf: 'center', padding: 3}}>
                  {owner.title || ''}
                </Text>
              </Col>
              <Col sm={1} md={1} lg={1} style={changedCol.forms || styles.col}>
                <Text style={styles.cell}>
                  {resource.forms.length}
                </Text>
              </Col>
              <Col sm={1} md={1} lg={1} style={changedCol.formErrors || styles.col}>
                <Text style={styles.cell}>
                  {resource.formErrors.length}
                </Text>
              </Col>
              <Col sm={1} md={1} lg={1} style={changedCol.formCorrections || styles.col}>
                <Text style={styles.cell}>
                  {resource.formCorrections.length}
                </Text>
              </Col>
              <Col sm={1} md={1} lg={1} style={changedCol.verifications || styles.col}>
                <Text style={styles.cell}>
                  {resource.verifications.length}
                </Text>
              </Col>
              <Col sm={1} md={1} lg={1} style={styles.col}>
                <Text style={styles.cell}>
                  {start}
                </Text>
              </Col>
              <Col sm={1} md={1} lg={1} style={styles.col}>
                <Text style={styles.cell}>
                  {completed}
                </Text>
              </Col>
              <Col sm={1} md={1} lg={1} style={styles.col}>
                <Text style={styles.cell}>
                  {days}
                </Text>
              </Col>
            </Row>
  }
  render() {
    let rows = []
    let applicants = this.state.applicants || this.props.applicants
    let products = []
    let cnt = 0

    let pTypes = {}
    if (applicants) {
      for (let app in applicants) {
        let a = applicants[app]
        if (a.applications  &&  a.applications.length)
          a.applications.forEach((app) => pTypes[app.productType] = app.productType)
      }
    }
    // this.props.provider.applications.forEach((a) => {
    pTypes = Object.keys(pTypes)
    pTypes.forEach((productType) => {
      if (products.indexOf(productType) !== -1)
        return
      products.push(productType)
      rows.push(<Row size={8} style={styles.topRow} key={'app_' + cnt++}>
                  <Col sm={8} md={8} lg={8}>
                    <Text style={styles.topRowCell}>
                      {utils.getModel(productType).title}
                    </Text>
                  </Col>
                </Row>)
      for (let p in applicants) {
        let app = applicants[p]
        app.allPerApp.forEach((appProps) => {
          if (appProps.app.productType === productType)
            rows.push(this.renderRow(appProps, app, cnt++))
        })
      }
    })
    return (
      <PageView style={platformStyles.container}>
        <ScrollView>
          <NetworkInfoProvider connected={this.state.isConnected} />
          {this.renderHeader()}
          <View style={styles.separator} />
          {rows}
          {rows.length > 7 ? this.renderHeader(true) : <View/>}
        </ScrollView>
      </PageView>
    )
  }

  renderHeader(isFooter) {
    let top = <Row size={8} style={styles.topRow}>
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

    let titles = ['Customer', 'Submitted', 'Requested', 'Completed', this.props.provider.title, 'Started', 'Completed', 'Days']
    return <View style={{backgroundColor: '#FBFFE5'}}>
            {isFooter ? <View/> : top}
            <Row size={8} style={{borderBottomColor: '#aaaaaa', borderBottomWidth: 1}}>
              {getCols(titles)}
            </Row>
          </View>


    function getCols(titles) {
      let cols = []
      let cnt = 1
      titles.forEach((t) =>
        cols.push(<Col sm={1} md={4} lg={3} style={styles.col} key={t + '_' + cnt++}>
                    <Text style={styles.cell}>{t}</Text>
                  </Col>)
      )
      return cols
    }
  }
}
reactMixin(SupervisoryViewPerProvider.prototype, Reflux.ListenerMixin);
SupervisoryViewPerProvider = makeResponsive(SupervisoryViewPerProvider)

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
  },
  col: {
    borderLeftColor: '#aaaaaa',
    borderLeftWidth: 1,
  },
  changedCol: {
    borderLeftColor: '#aaaaaa',
    backgroundColor: 'pink',
    borderLeftWidth: 1,
  },
  cell: {
    paddingVertical: 5,
    fontSize: 14,
    alignSelf: 'center'
  },
  customerCell: {
    fontWeight: '600',
    alignSelf: 'center',
    paddingVertical: 5
  }
});

module.exports = SupervisoryViewPerProvider
/*
  render1() {
    let rows = []
    let applicants = this.state.applicants
    let products = []
    let cnt = 0
    this.props.provider.applications.forEach((a) => {
      if (products.indexOf(a.productType) !== -1)
        return
      products.push(a.productType)
      rows.push(<Row size={8} style={styles.topRow} key={'app_' + cnt++}>
                  <Col sm={8} md={8} lg={8}>
                    <Text style={styles.topRowCell}>
                      {utils.getModel(a.productType).title}
                    </Text>
                  </Col>
                </Row>)
      for (let p in applicants) {
        let app = applicants[p]
        app.allPerApp.forEach((appProps) => {
          if (appProps.app.productType === a.productType)
            rows.push(this.renderRow(appProps, app, cnt++))
        })
      }
    })
    return (
      <PageView style={platformStyles.container}>
        <ScrollView>
          <NetworkInfoProvider connected={this.state.isConnected} />
          {this.renderHeader()}
          <View style={styles.separator} />
          {rows}
          {rows.length > 7 ? this.renderHeader(true) : <View/>}
        </ScrollView>
      </PageView>
    )
  }
*/
