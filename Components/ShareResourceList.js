console.log('requiring StringChooser.js')
'use strict';

import React, { Component } from 'react'
import equal from 'deep-equal'
import reactMixin from 'react-mixin'
import { makeResponsive } from 'react-native-orient'
import HomePageMixin from './HomePageMixin'
import constants from '@tradle/constants'
var { TYPE, ROOT_HASH } = constants
import utils, { translate } from '../utils/utils'
import ResourceRow from './ResourceRow'
import GridRow from './GridRow'
import VerificationRow from './VerificationRow'
import ResourceView from './ResourceView'
import MessageView from './MessageView'
import CustomIcon from '../styles/customicons'
import StyleSheet from '../StyleSheet'
import Actions from '../Actions/Actions'

import PageView from './PageView'
import platformStyles from '../styles/platform'
import {
  ListView,
  Text,
  TouchableOpacity,
  View,
  Alert
} from 'react-native'

      //   shareMultiEntryList: documents,
      //   verifications: verifications,
      //   formRequest: resource,
      //   to: to,
      //   modelName: modelName,
      //   bankStyle: bankStyle
      // }

class ShareResourceList extends Component {
  constructor(props) {
    super(props);
    this.isSmallScreen = !utils.isWeb() &&  utils.dimensions(ShareResourceList).width < 736
    let dataSource =  new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      strings: props.strings,
      dataSource: dataSource.cloneWithRows(props.list),
      chosen: {}
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.chosen !== nextState.chosen)
      return true
    return false
  }
  selectResource(resource) {
    let title = utils.makeModelTitle(resource[TYPE])
    let { navigator, bankStyle } = this.props

    if (utils.isMessage(resource)) {
      navigator.push({
        title: title,
        id: 5,
        component: MessageView,
        backButtonTitle: 'Back',
        passProps: {
          resource: resource,
          bankStyle: bankStyle
        }
      })
    }
    else {
      navigator.push({
        title: title,
        id: 3,
        component: ResourceView,
        // titleTextColor: '#7AAAC3',
        backButtonTitle: 'Back',
        passProps: {
          resource: resource
        }
      });
    }
  }
  renderRow(resource, sectionId, rowId)  {
    let { navigator, bankStyle, multiChooser, formRequest } = this.props
    let gridCols = !this.isSmallScreen  &&  this.getGridCols()
    let modelName = resource[TYPE]
    if (gridCols)
      return (
        <GridRow
          onSelect={() => this.selectResource(resource)}
          key={resource[ROOT_HASH]}
          isSmallScreen={this.isSmallScreen}
          modelName={modelName}
          navigator={navigator}
          rowId={rowId}
          gridCols={gridCols}
          multiChooser={multiChooser}
          resource={resource}
          bankStyle={bankStyle}
          chosen={this.state.chosen} />
        );
    if (utils.isMessage(resource))
      return (<VerificationRow
                onSelect={() => this.selectResource(resource)}
                key={resource[ROOT_HASH]}
                modelName={modelName}
                multiChooser={multiChooser}
                navigator={navigator}
                bankStyle={bankStyle}
                chosen={this.state.chosen}
                resource={resource} />
              )
    else
      return (
        <ResourceRow
          onSelect={() => this.selectResource(resource)}
          title={utils.makeModelTitle(resource[TYPE])}
          bankStyle={bankStyle}
          navigator={navigator}
          multiChooser={multiChooser}
          resource={resource}
          chosen={this.state.chosen}
          />
        );
  }
  render() {
    let { bankStyle } = this.props
    let content = <ListView ref='listview' style={styles.listview}
                    dataSource={this.state.dataSource}
                    removeClippedSubviews={false}
                    initialListSize={100}
                    renderRow={this.renderRow.bind(this)}
                    renderHeader={this.renderHeader.bind(this)}
                    enableEmptySections={true}
                    automaticallyAdjustContentInsets={false}
                    keyboardDismissMode='on-drag'
                    keyboardShouldPersistTaps="always"
                    showsVerticalScrollIndicator={false} />

    let bgStyle =  {backgroundColor: bankStyle  &&  bankStyle.backgroundColor || '#ffffff'}
    let bg = {backgroundColor: bankStyle && bankStyle.linkColor  ||  '#7AAAC3'}
    let shareButton = <TouchableOpacity onPress={this.shareChosen.bind(this)}>
                        <View style={[styles.shareButton, bg]}>
                          <CustomIcon name='tradle' style={{color: '#ffffff'}} size={32} />
                          <Text style={[styles.shareText, {fontSize: 18}]}>{translate('ReviewAndShare')}</Text>
                        </View>
                      </TouchableOpacity>

    return (
      <PageView style={[styles.container, bgStyle]}>
        {content}
        {shareButton}
      </PageView>
    );
  }
  renderHeader() {
    let { modelName } = this.props
    if (!this.isSmallScreen)
      return this.renderGridHeader()
  }
  shareChosen() {
    let { resource, to, formRequest, navigator } = this.props
    let chosen = this.state.chosen
    if (utils.isEmpty(chosen))
      Alert.alert(translate('nothingToShare'))
    else {
      for (let r in chosen)
        Actions.share(chosen[r], to, formRequest)
    }
    navigator.pop()
  }
}
reactMixin(ShareResourceList.prototype, HomePageMixin)
ShareResourceList = makeResponsive(ShareResourceList)

var styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'white',
  },
  listview: {
    marginTop: 64,
    borderWidth: 0,
    marginHorizontal: -1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ffffff',
  },
  shareButton: {
    backgroundColor: '#7AAAC3',
    flexDirection: 'row',
    justifyContent: 'center',
    width: 340,
    marginTop: 20,
    marginBottom: 30,
    alignSelf: 'center',
    height: 40,
    borderRadius: 5,
    marginHorizontal: 20
  },
  shareText: {
    fontSize: 20,
    paddingLeft: 5,
    color: '#ffffff',
    alignSelf: 'center'
  },
});

module.exports = ShareResourceList;
