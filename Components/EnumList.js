
import React, { Component } from 'react'
import {
  ListView,
  TouchableHighlight,
  View,
} from 'react-native'
import PropTypes from 'prop-types'
import clone from 'lodash/clone'
import { translate } from '../utils/utils'
import StyleSheet from '../StyleSheet'
import SearchBar from './SearchBar'
import { Text } from './Text'

const MONEY = 'tradle.Money'

class EnumList extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    returnRoute: PropTypes.object,
    callback: PropTypes.func,
    prop: PropTypes.object.isRequired,
    bankStyle: PropTypes.object,
    enumProp: PropTypes.object.isRequired,
    currency: PropTypes.string
  };
  constructor(props) {
    super(props);

    let dataSource = new ListView.DataSource({
      rowHasChanged: function(row1, row2) {
        return row1 !== row2
      }
    })
    const { prop, currency, locale } = this.props
    let arr = this.props.enumProp.oneOf
    if (currency && prop.ref === MONEY) {
      let idx = arr.findIndex(elm => elm[currency])
      if (idx !== -1) {
        arr = clone(arr)
        let elm = arr[idx]
        arr.splice(idx, 1)
        arr.splice(0, 0, elm)
      }
    }
    this.state = {
      dataSource: dataSource.cloneWithRows(arr),
      filter: ''
    }
  }

  selectResource(resource) {
    this.props.callback(this.props.prop.name, this.props.enumProp.name, resource); // HACK for now
    this.props.navigator.popToRoute(this.props.returnRoute);
    return;
  }
          // scrollRenderAhead={10}
  render() {
    let content = <ListView
          dataSource={this.state.dataSource}
          renderRow={this.renderRow.bind(this)}
          automaticallyAdjustContentInsets={false}
          removeClippedSubviews={false}
          enableEmptySections={true}
          keyboardDismissMode='on-drag'
          keyboardShouldPersistTaps='always'
          initialListSize={200}
          pageSize={200}
          showsVerticalScrollIndicator={false} />;
    let searchBar
    if (SearchBar) {
      searchBar = (
        <SearchBar
          onChangeText={this.onSearchChange.bind(this)}
          placeholder={translate('search')}
          showsCancelButton={false}
          hideBackground={true}
          />
      )
    }

    return (
      <View style={styles.container}>
        {searchBar}
        <View style={styles.separator} />
        {content}
      </View>
    );
  }
  onSearchChange(filter) {
    let vals = this.props.enumProp.oneOf
    filter = typeof filter === 'string' ? filter : filter.nativeEvent.text
    let f = filter.toLowerCase()
    let list = vals.filter((s) => {
      let key = Object.keys(s)[0]
      return key.toLowerCase().indexOf(f) !== -1
    })
    this.setState({filter, dataSource: this.state.dataSource.cloneWithRows(list)})
  }

  renderRow(value) {
    let { prop, currency } = this.props
    let addStyle = prop.ref === MONEY  &&  value[currency] ? {backgroundColor: 'aliceblue'} : {}

    let label
    if (typeof value === 'object') {
      let key = Object.keys(value)[0]
      label = key + ' ' + value[key]
    }
    else
      label = value

    return (
      <View style={[{padding: 5}, addStyle]}>
        <TouchableHighlight underlayColor='transparent' onPress={this.selectResource.bind(this, value)}>
          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={styles.resourceTitle}>{label}</Text>
            </View>
          </View>
        </TouchableHighlight>
        <View style={styles.separator} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: 64
  },
  resourceTitle: {
    fontSize: 20
  },
  separator: {
    height: 0.5,
    backgroundColor: '#eeeeee',
  },
  row: {
    flexDirection: 'row',
    padding: 10,
  },
  textContainer: {
    flex: 1,
  },
});

module.exports = EnumList;
