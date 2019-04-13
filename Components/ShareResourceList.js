
import React, { Component } from 'react'
import reactMixin from 'react-mixin'
import { makeResponsive } from 'react-native-orient'
import Reflux from 'reflux'
import PropTypes from 'prop-types'

import constants from '@tradle/constants'
var {
  TYPE,
  ROOT_HASH
} = constants
import HomePageMixin from './HomePageMixin'
import utils, { translate } from '../utils/utils'
import ResourceRow from './ResourceRow'
import GridRow from './GridRow'
import VerificationRow from './VerificationRow'
import CustomIcon from '../styles/customicons'
import StyleSheet from '../StyleSheet'
import Actions from '../Actions/Actions'
import SearchBar from './SearchBar'
import platformStyles from '../styles/platform'

import Store from '../Store/Store'


import PageView from './PageView'
import {
  ListView,
  Text,
  TouchableOpacity,
  View,
  Alert
} from 'react-native'

class ShareResourceList extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    list: PropTypes.object.isRequired,
    formRequest: PropTypes.object,
    multiChooser: PropTypes.bool
  };
  constructor(props) {
    super(props);
    this.isSmallScreen = !utils.isWeb() &&  utils.dimensions(ShareResourceList).width < 736
    let dataSource =  new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      dataSource: dataSource.cloneWithRows(props.list),
      list: props.list,
      chosen: {}
    }
    this.share = this.share.bind(this)
    this.renderRow = this.renderRow.bind(this)
    this.renderHeader = this.renderHeader.bind(this)
    this.shareChosen = this.shareChosen.bind(this)
  }
  componentDidMount() {
    this.listenTo(Store, 'onAction');
  }
  onAction(params) {
    let { action, list } = params
    if (action === 'multiEntryList'  &&  list)
      this.setState({dataSource: this.state.dataSource.cloneWithRows(list), list})
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.chosen !== nextState.chosen)
      return true
    if (this.state.list !== nextState.list)
      return true

    return false
  }
  selectResource(resource) {
    let title = translate(utils.getModel(resource[TYPE]))
    let { navigator, bankStyle } = this.props

    if (utils.isMessage(resource)) {
      navigator.push({
        title: title,
        componentName: 'MessageView',
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
        componentName: 'ResourceView',
        // titleTextColor: '#7AAAC3',
        backButtonTitle: 'Back',
        passProps: {
          resource: resource
        }
      });
    }
  }
  renderRow(resource, sectionId, rowId)  {
    let { navigator, bankStyle, multiChooser } = this.props
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
          title={translate(utils.getModel(resource[TYPE]))}
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
                    renderRow={this.renderRow}
                    renderHeader={this.renderHeader}
                    enableEmptySections={true}
                    automaticallyAdjustContentInsets={false}
                    keyboardDismissMode='on-drag'
                    keyboardShouldPersistTaps="always"
                    showsVerticalScrollIndicator={false} />

    let bgStyle =  {backgroundColor: bankStyle  &&  bankStyle.backgroundColor || '#ffffff'}
    let bg = {backgroundColor: bankStyle && bankStyle.linkColor  ||  '#7AAAC3'}
    let submit = <TouchableOpacity onPress={this.shareChosen}>
                   <View style={[styles.shareButton, bg]}>
                     <CustomIcon name='tradle' style={{color: '#ffffff', marginTop: 3}} size={32} />
                     <Text style={[styles.shareText, {fontSize: 18}]}>{translate('ReviewAndShare')}</Text>
                   </View>
                 </TouchableOpacity>
    let searchBar = <SearchBar
                    onChangeText={this.onSearchChange.bind(this)}
                    placeholder={translate('search')}
                    showsCancelButtonWhileEditing={false}
                    showsCancelButton={false}
                    hideBackground={true}
                    bankStyle={this.props.bankStyle}
                    />

    return (
      <PageView style={[platformStyles.container, bgStyle]}>
        {searchBar}
        {content}
        {submit}
      </PageView>
    );
  }
  renderHeader() {
    if (!this.isSmallScreen)
      return this.renderGridHeader()
  }
  shareChosen() {
    let chosen = this.state.chosen
    if (utils.isEmpty(chosen)) {
      Alert.alert(translate('nothingToShare'))
      return
    }
    let list = []
    for (let r in chosen)
      list.push(utils.getDisplayName(chosen[r]))
    let listStr = list.join(', ')

    Alert.alert(
      translate('youAreAboutToShare', translate(utils.getModel(this.props.modelName))),
      listStr,
      [
        {text: translate('cancel'), onPress: () => console.log('Canceled!')},
        {text: translate('Ok'), onPress: this.share},
      ]
    )
  }
  share() {
    let { to, formRequest, navigator } = this.props
    let chosen = Object.values(this.state.chosen)
    Actions.shareMany(chosen, to, formRequest)
    // let chosen = this.state.chosen
    // for (let r in chosen)
    //   Actions.share(chosen[r], to, formRequest)
    navigator.pop()
  }
  onSearchChange(filter) {
    let { search, isModel, formRequest } = this.props
    this.state.filter = typeof filter === 'string' ? filter : filter.nativeEvent.text
    if (search  &&  isModel) {
      let mArr = this.filterModels(this.state.filter)
      this.setState({dataSource: this.state.dataSource.cloneWithRows(mArr)})
      return
    }
    Actions.listMultientry({
      filter: this.state.filter,
      formRequest,
      to: formRequest.from,
      first: true,
      limit: 20
    });
  }
}

reactMixin(ShareResourceList.prototype, Reflux.ListenerMixin);
reactMixin(ShareResourceList.prototype, HomePageMixin)
ShareResourceList = makeResponsive(ShareResourceList)

var styles = StyleSheet.create({
  listview: {
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
